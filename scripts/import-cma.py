"""Import explicitly reviewed Cleveland Museum of Art CC0 objects.

The adapter requires an approved intake file and validates the live object,
license, image, source hosts, accession number, title and duplicate image URL
before atomically writing its seed. Search results never publish directly.
"""

import argparse
import concurrent.futures
import hashlib
import json
import pathlib
import urllib.request
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--review-file", required=True)
parser.add_argument("--verify-live", action="store_true")
args = parser.parse_args()
review_path = pathlib.Path(args.review_file)
if not review_path.is_absolute():
    review_path = root / review_path
review = json.loads(review_path.read_text(encoding="utf-8"))
reviewed_at = review.get("reviewedAt")
rows = review.get("objects")
if not reviewed_at or not isinstance(rows, list) or not rows:
    raise ValueError("Review file requires reviewedAt and a nonempty objects array")
approved = {}
for row in rows:
    object_id = int(row["id"])
    if object_id in approved:
        raise ValueError(f"Duplicate reviewed object {object_id}")
    if row.get("decision") != "approved" or not row.get("reviewNote", "").strip():
        raise ValueError(f"Object {object_id} lacks explicit review approval")
    approved[object_id] = row

def fetch(object_id):
    url = f"https://openaccess-api.clevelandart.org/api/artworks/{object_id}"
    request = urllib.request.Request(url, headers={"User-Agent": "AtlasResearch/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        raw = response.read()
    return raw, json.loads(raw)["data"]

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    fetched = dict(zip(approved, pool.map(fetch, approved)))

artifacts, images, seen_images = [], [], set()
for object_id, retained in approved.items():
    raw, obj = fetched[object_id]
    if obj.get("id") != object_id or obj.get("title") != retained.get("expectedTitle"):
        raise ValueError(f"Identity changed for CMA {object_id}")
    if obj.get("accession_number") != retained.get("accessionNumber"):
        raise ValueError(f"Accession changed for CMA {object_id}")
    if obj.get("share_license_status") != "CC0":
        raise ValueError(f"CMA {object_id} is no longer CC0")
    image_group = obj.get("images") or {}
    image_url = (image_group.get("print") or {}).get("url") or (image_group.get("web") or {}).get("url")
    thumbnail = (image_group.get("web") or {}).get("url")
    source_url = obj.get("url")
    source_api = f"https://openaccess-api.clevelandart.org/api/artworks/{object_id}"
    if not image_url or not thumbnail or not source_url:
        raise ValueError(f"CMA {object_id} has no complete image/source set")
    if image_url in seen_images:
        raise ValueError(f"Duplicate CMA image {image_url}")
    seen_images.add(image_url)
    for url, hosts in [
        (source_url, {"www.clevelandart.org", "clevelandart.org"}),
        (source_api, {"openaccess-api.clevelandart.org"}),
        (image_url, {"openaccess-cdn.clevelandart.org"}),
        (thumbnail, {"openaccess-cdn.clevelandart.org"}),
    ]:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname not in hosts:
            raise ValueError(f"Unexpected CMA URL for {object_id}: {url}")
    if args.verify_live:
        request = urllib.request.Request(image_url, method="HEAD", headers={"User-Agent": "AtlasResearch/1.0"})
        with urllib.request.urlopen(request, timeout=45) as response:
            if response.status != 200 or not response.headers.get("Content-Type", "").startswith("image/"):
                raise ValueError(f"Unavailable CMA image {image_url}")
    source_hash = hashlib.sha256(raw).hexdigest()
    artifact_id = f"cma-{object_id}"
    title = obj["title"]
    date = obj.get("creation_date") or "Date unavailable"
    medium = obj.get("technique") or "Medium unavailable"
    cultures = obj.get("culture") or []
    culture = ", ".join(cultures) if cultures else "Culture unavailable"
    object_type = obj.get("type") or "Object type unavailable"
    rights = "CC0 1.0 Universal · Cleveland Museum of Art Open Access"
    artifacts.append(
        {
            "id": artifact_id,
            "title": title,
            "witnessId": None,
            "inventoryNumber": obj.get("accession_number"),
            "institution": "The Cleveland Museum of Art",
            "sourceUrl": source_url,
            "description": f"{title}. {date}. {medium}. {culture}. Institutional catalog record; no religious interpretation is inferred from the image.",
            "collection": "multi-institution-open-access",
            "period": date,
            "date": date,
            "culture": culture,
            "creditLine": obj.get("creditline"),
            "objectType": object_type,
            "sourceApi": source_api,
            "sourceHash": source_hash,
            "verifiedAt": reviewed_at,
            "sensitivity": "No restriction identified in reviewed institutional fields; reassess on contrary evidence",
            "protocolReview": retained["reviewNote"],
        }
    )
    images.append(
        {
            "id": f"cma-{object_id}",
            "artifactId": artifact_id,
            "witnessId": None,
            "workIds": [],
            "title": title,
            "institution": "The Cleveland Museum of Art",
            "imageUrl": image_url,
            "thumbnail": thumbnail,
            "iiifService": None,
            "institutionalManifest": None,
            "sourceUrl": source_url,
            "rights": rights,
            "attribution": f"{title} · The Cleveland Museum of Art · {obj.get('accession_number') or ''} · {rights}",
            "publicDomain": True,
            "caption": f"{date}. {object_type}. {culture}. Institutional metadata; image appearance is not evidence of hidden intent.",
            "verifiedAt": reviewed_at,
            "sourceHash": source_hash,
        }
    )

output = {
    "formatVersion": 1,
    "institution": "The Cleveland Museum of Art",
    "sourcePolicy": "Only review-file approvals with share_license_status=CC0 and institution-supplied image URLs are retained.",
    "artifacts": sorted(artifacts, key=lambda item: item["id"]),
    "images": sorted(images, key=lambda item: item["id"]),
}
target = root / "data/seed/cleveland-images.json"
temp = target.with_suffix(".tmp")
temp.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
temp.replace(target)
print(f"Imported {len(artifacts)} CMA objects and {len(images)} verified image records")
