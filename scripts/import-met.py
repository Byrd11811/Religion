"""Import explicitly reviewed Met objects with verified CC0 image URLs.

Usage:
  python scripts/import-met.py 548344 550899 --book-of-dead
  python scripts/import-met.py --review-file data/intake/met-egypt-reviewed.json

All requested objects and image URLs are validated before the seed file is
replaced. Work association is opt-in and never implies translation dependency.
"""

import argparse
import concurrent.futures
import copy
import hashlib
import json
import pathlib
import urllib.request
from datetime import datetime, timezone
from urllib.parse import urlparse


root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("ids", nargs="*", type=int)
parser.add_argument("--book-of-dead", action="store_true")
parser.add_argument("--review-file")
args = parser.parse_args()
target = root / "data/seed/archive-additions.json"
original = json.loads(target.read_text(encoding="utf-8"))
data = copy.deepcopy(original)
provenance = root / "data/provenance/met"
provenance.mkdir(parents=True, exist_ok=True)


def load_review():
    if not args.review_file:
        return {}, None
    review_path = pathlib.Path(args.review_file)
    if not review_path.is_absolute():
        review_path = root / review_path
    review = json.loads(review_path.read_text(encoding="utf-8"))
    rows = review.get("objects")
    if not isinstance(rows, list) or not rows:
        raise ValueError("Review file requires a nonempty objects array")
    indexed = {}
    for row in rows:
        oid = int(row["id"])
        if oid in indexed:
            raise ValueError(f"Duplicate reviewed object {oid}")
        if row.get("decision") != "approved":
            raise ValueError(f"Object {oid} is not approved")
        if not str(row.get("reviewNote", "")).strip():
            raise ValueError(f"Object {oid} requires a review note")
        indexed[oid] = row
    return indexed, review.get("requiredDepartment")


reviewed, required_department = load_review()
requested = list(dict.fromkeys(args.ids or reviewed.keys()))
if not requested:
    parser.error("provide object IDs or --review-file")
if reviewed:
    unreviewed = [oid for oid in requested if oid not in reviewed]
    if unreviewed:
        raise ValueError(f"IDs absent from review file: {unreviewed}")


def available(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != "images.metmuseum.org":
        return False
    try:
        request = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(request, timeout=25) as response:
            return response.status == 200 and response.headers.get(
                "Content-Type", ""
            ).startswith("image/")
    except Exception:
        return False


def inferred_witness_type(obj):
    haystack = " ".join(
        str(obj.get(field) or "")
        for field in ("title", "objectName", "medium", "description")
    ).lower()
    if "blank" in haystack:
        return None
    has_writing = any(
        marker in haystack
        for marker in (
            "ink",
            "text",
            "inscription",
            "letter",
            "document",
            "hieratic",
            "hieroglyph",
        )
    )
    if not has_writing:
        return None
    if "papyrus" in haystack:
        return "Papyrus"
    if "ostracon" in haystack:
        return "Ostracon"
    if "stela" in haystack:
        return "Stela"
    if "relief" in haystack and "inscription" in haystack:
        return "Inscribed relief"
    return None


def semantic_value(value):
    """Normalize API structures whose array order has no catalog meaning."""
    if isinstance(value, dict):
        return {key: semantic_value(value[key]) for key in sorted(value)}
    if isinstance(value, list):
        normalized = [semantic_value(item) for item in value]
        return sorted(
            normalized,
            key=lambda item: json.dumps(
                item, sort_keys=True, separators=(",", ":"), ensure_ascii=False
            ),
        )
    return value


def semantic_hash(obj):
    canonical = json.dumps(
        semantic_value(obj),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


existing_artifacts = {row["id"]: row for row in original["artifacts"]}
existing_images = {row["id"]: row for row in original["images"]}
staged_provenance = []

for oid in requested:
    api = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}"
    with urllib.request.urlopen(api, timeout=30) as response:
        fresh_raw = response.read()
    fresh_obj = json.loads(fresh_raw)
    provenance_path = provenance / f"{oid}.json"
    if provenance_path.exists():
        retained_raw = provenance_path.read_bytes()
        retained_obj = json.loads(retained_raw)
    else:
        retained_raw = b""
        retained_obj = None
    if retained_obj is not None and semantic_hash(retained_obj) == semantic_hash(
        fresh_obj
    ):
        raw, obj = retained_raw, retained_obj
    else:
        raw, obj = fresh_raw, fresh_obj
    if obj.get("objectID") != oid or obj.get("isPublicDomain") is not True:
        raise ValueError(f"Object {oid} has no confirmed public-domain image rights")
    if required_department and obj.get("department") != required_department:
        raise ValueError(f"Object {oid} is outside {required_department}")
    source = obj["objectURL"]
    if urlparse(source).hostname != "www.metmuseum.org":
        raise ValueError("Unexpected institution source URL")
    title = obj["title"]
    review = reviewed.get(oid)
    if review and review.get("expectedTitle") != title:
        raise ValueError(
            f"Object {oid} title changed: {title!r} != {review.get('expectedTitle')!r}"
        )
    association_text = " ".join(
        str(obj.get(field) or "")
        for field in ("title", "objectName", "description")
    ).lower()
    if args.book_of_dead and "book of the dead" not in association_text:
        raise ValueError(f"Unverified work association for {oid}: {title}")
    urls = list(
        dict.fromkeys(
            url
            for url in [obj.get("primaryImage"), *obj.get("additionalImages", [])]
            if url
        )
    )
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        verified = [
            url for url, ok in zip(urls, pool.map(available, urls)) if ok
        ]
    expected_min = int((review or {}).get("expectedMinImages", 1))
    if len(verified) < expected_min:
        raise ValueError(
            f"Object {oid} has {len(verified)} verified images; expected {expected_min}"
        )

    source_hash = hashlib.sha256(raw).hexdigest()
    aid, wid = f"met-{oid}", f"met-witness-{oid}"
    if review and "witnessType" in review:
        witness_type = review["witnessType"]
    else:
        witness_type = inferred_witness_type(obj)
    if witness_type is not None and not str(witness_type).strip():
        raise ValueError(f"Invalid witness type for {oid}")
    work_ids = ["book-of-the-dead"] if args.book_of_dead else []
    institution = "The Metropolitan Museum of Art"
    rights = "CC0 1.0 Universal · Met Open Access"
    date = obj.get("objectDate") or "Date unavailable"
    period = obj.get("period") or "Period unavailable"
    description = (
        f'{title}. {date}. {obj.get("medium") or "Material unavailable"}. '
        "Institutional catalog description; no translation is supplied by this image record."
    )
    previous = existing_artifacts.get(aid)
    verified_at = (
        previous.get("verifiedAt")
        if previous and previous.get("sourceHash") == source_hash
        else datetime.now(timezone.utc).isoformat()
    )
    artifact = dict(
        id=aid,
        title=title,
        witnessId=wid if witness_type else None,
        inventoryNumber=obj.get("accessionNumber"),
        institution=institution,
        sourceUrl=source,
        description=description,
        collection="egypt" if obj.get("department") == "Egyptian Art" else None,
        period=period,
        date=date,
        culture=obj.get("culture") or None,
        creditLine=obj.get("creditLine"),
        sourceApi=api,
        sourceHash=source_hash,
        verifiedAt=verified_at,
    )
    if review:
        artifact["sensitivity"] = review.get("sensitivity", "none identified")
        artifact["protocolReview"] = review["reviewNote"]
    data["artifacts"] = [row for row in data["artifacts"] if row["id"] != aid]
    data["artifacts"].append(artifact)

    data["witnesses"] = [row for row in data["witnesses"] if row["id"] != wid]
    if witness_type:
        scripts = []
        source_words = association_text + " " + str(obj.get("medium") or "").lower()
        if "hieratic" in source_words:
            scripts.append("Hieratic")
        if "hieroglyph" in source_words:
            scripts.append("Hieroglyphic")
        data["witnesses"].append(
            dict(
                id=wid,
                title=title,
                workIds=work_ids,
                recensionId=None,
                type=witness_type,
                inventoryNumber=obj.get("accessionNumber"),
                repository=institution,
                discoveryLocation=obj.get("excavation") or None,
                currentLocation=obj.get("repository") or institution,
                dateStart=obj.get("objectBeginDate"),
                dateEnd=obj.get("objectEndDate"),
                dateNotes=(
                    f"{date}; {period}. These dates describe the physical object, "
                    "not the composition of a work."
                ),
                material=obj.get("medium") or None,
                languages=[],
                scripts=scripts,
                condition=None,
                completeness=None,
                provenance=(
                    "Institutional catalog and credit line: "
                    f'{obj.get("creditLine") or "Data unavailable"}'
                ),
                digitizationUrl=source,
                iiifManifest=None,
                rights=rights,
                sources=[source, api],
                decipherment="Not assessed",
                evidence="Securely attested",
                description=description,
                access="Public metadata",
            )
        )

    data["images"] = [row for row in data["images"] if row["artifactId"] != aid]
    for index, url in enumerate(verified):
        iid = f'{aid}-{hashlib.sha256(url.encode()).hexdigest()[:12]}'
        prior_image = existing_images.get(iid)
        image_verified_at = (
            prior_image.get("verifiedAt")
            if prior_image
            and prior_image.get("imageUrl") == url
            and previous
            and previous.get("sourceHash") == source_hash
            else verified_at
        )
        data["images"].append(
            dict(
                id=iid,
                artifactId=aid,
                witnessId=wid if witness_type else None,
                workIds=work_ids,
                title=f"{title} · museum image {index + 1}",
                institution=institution,
                imageUrl=url,
                thumbnail=(
                    obj["primaryImageSmall"]
                    if url == obj.get("primaryImage") and obj.get("primaryImageSmall")
                    else url
                ),
                iiifService=None,
                sourceUrl=source,
                rights=rights,
                attribution=(
                    f'{title} · {institution} · {obj.get("accessionNumber", "")} · '
                    f'{obj.get("creditLine", "")} · {rights}'
                ),
                publicDomain=True,
                caption=(
                    f"{date}. {period}. Museum image sequence, not an original "
                    "page or spell number."
                ),
                verifiedAt=image_verified_at,
            )
        )
    staged_provenance.append((provenance_path, raw))
    print(f"{oid}: {len(verified)} verified images; {title}", flush=True)

for path, raw in staged_provenance:
    temp = path.with_suffix(".tmp")
    temp.write_bytes(raw)
    temp.replace(path)
temp = target.with_suffix(".tmp")
temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
temp.replace(target)
print(
    f'Total imported: {len(data["artifacts"])} objects, '
    f'{len(data["witnesses"])} witnesses, {len(data["images"])} images.'
)
