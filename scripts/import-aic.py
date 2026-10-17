"""Import explicitly reviewed Art Institute of Chicago open-access objects.

The review file is mandatory. API search results never publish directly. The
adapter validates title stability, the institution's public-domain flag, image
identity, approved hosts, IIIF availability, duplicate image identity and the
retained review decision before replacing the seed atomically.

Usage:
  python scripts/import-aic.py --review-file data/intake/aic-religion-reviewed.json
  python scripts/import-aic.py --review-file ... --verify-live
"""

import argparse
import hashlib
import json
import pathlib
import time
import urllib.request
import urllib.error
from urllib.parse import urlencode, urlparse

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--review-file", required=True)
parser.add_argument("--verify-live", action="store_true")
args = parser.parse_args()

review_path = pathlib.Path(args.review_file)
if not review_path.is_absolute():
    review_path = root / review_path
review = json.loads(review_path.read_text(encoding="utf-8"))
rows = review.get("objects")
if not isinstance(rows, list) or not rows:
    raise ValueError("Review file requires a nonempty objects array")
reviewed_at = review.get("reviewedAt")
if not isinstance(reviewed_at, str) or not reviewed_at:
    raise ValueError("Review file requires reviewedAt")

approved = {}
for row in rows:
    object_id = int(row["id"])
    if object_id in approved:
        raise ValueError(f"Duplicate reviewed object {object_id}")
    if row.get("decision") != "approved" or not row.get("reviewNote", "").strip():
        raise ValueError(f"Object {object_id} lacks an explicit review approval")
    approved[object_id] = row

def verify_resource(url):
    last_error = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "AtlasResearch/1.0"})
            with urllib.request.urlopen(request, timeout=45) as response:
                if response.status != 200:
                    raise ValueError(f"HTTP {response.status}")
                response.read(128)
            return
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            last_error = error
            time.sleep(2 ** attempt)
    raise ValueError(f"Unavailable AIC resource after retries: {url}: {last_error}")

fields = ",".join(
    [
        "id", "api_link", "title", "date_display", "artist_display",
        "place_of_origin", "medium_display", "credit_line", "is_public_domain",
        "artwork_type_title", "department_title", "classification_title", "image_id",
    ]
)
objects = []
ids = list(approved)
for start in range(0, len(ids), 50):
    query = urlencode({"ids": ",".join(map(str, ids[start : start + 50])), "fields": fields})
    with urllib.request.urlopen(
        f"https://api.artic.edu/api/v1/artworks?{query}", timeout=45
    ) as response:
        payload = json.load(response)
    if payload.get("config", {}).get("iiif_url") != "https://www.artic.edu/iiif/2":
        raise ValueError("Unexpected AIC IIIF endpoint")
    objects.extend(payload.get("data", []))
    time.sleep(1)
if {item.get("id") for item in objects} != set(ids):
    raise ValueError("AIC response did not resolve the complete reviewed ID set")

artifacts, images, seen_images = [], [], set()
for obj in objects:
    object_id = obj["id"]
    retained = approved[object_id]
    if obj.get("title") != retained.get("expectedTitle"):
        raise ValueError(f"Title changed for AIC {object_id}")
    if obj.get("is_public_domain") is not True or not obj.get("image_id"):
        raise ValueError(f"AIC {object_id} has no public-domain image")
    image_id = obj["image_id"]
    if image_id in seen_images:
        raise ValueError(f"Duplicate AIC image identity {image_id}")
    seen_images.add(image_id)
    source_url = f"https://www.artic.edu/artworks/{object_id}"
    source_api = obj.get("api_link")
    image_url = f"https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg"
    thumbnail = f"https://www.artic.edu/iiif/2/{image_id}/full/200,/0/default.jpg"
    manifest = f"https://api.artic.edu/api/v1/artworks/{object_id}/manifest.json"
    for url, hostname in [
        (source_url, "www.artic.edu"),
        (source_api, "api.artic.edu"),
        (image_url, "www.artic.edu"),
        (manifest, "api.artic.edu"),
    ]:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname != hostname:
            raise ValueError(f"Unexpected AIC URL for {object_id}: {url}")
    if args.verify_live:
        for url in (image_url, manifest):
            verify_resource(url)
            if url == image_url:
                time.sleep(1)
    canonical = json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    source_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    artifact_id = f"aic-{object_id}"
    title = obj["title"]
    origin = obj.get("place_of_origin") or "Origin unavailable"
    object_type = obj.get("artwork_type_title") or "Object type unavailable"
    date = obj.get("date_display") or "Date unavailable"
    medium = obj.get("medium_display") or "Medium unavailable"
    artist = (obj.get("artist_display") or "Maker unavailable").replace("\n", "; ")
    rights = "CC0 1.0 Universal · Art Institute of Chicago Open Access"
    artifacts.append(
        {
            "id": artifact_id,
            "title": title,
            "witnessId": None,
            "inventoryNumber": str(object_id),
            "institution": "Art Institute of Chicago",
            "sourceUrl": source_url,
            "description": f"{title}. {date}. {medium}. {artist}. Institutional catalog record; no religious interpretation is inferred from the image.",
            "collection": "multi-institution-open-access",
            "period": date,
            "date": date,
            "culture": origin,
            "creditLine": obj.get("credit_line"),
            "objectType": object_type,
            "sourceApi": source_api,
            "sourceHash": source_hash,
            "verifiedAt": reviewed_at,
            "sensitivity": "No restriction identified in reviewed institutional fields; reassess on contrary evidence",
            "protocolReview": retained["reviewNote"],
            "institutionalManifest": manifest,
        }
    )
    images.append(
        {
            "id": f"aic-{object_id}-{image_id[:12]}",
            "artifactId": artifact_id,
            "witnessId": None,
            "workIds": [],
            "title": title,
            "institution": "Art Institute of Chicago",
            "imageUrl": image_url,
            "thumbnail": thumbnail,
            "iiifService": f"https://www.artic.edu/iiif/2/{image_id}",
            "institutionalManifest": manifest,
            "sourceUrl": source_url,
            "rights": rights,
            "attribution": f"{title} · Art Institute of Chicago · {artist} · {rights}",
            "publicDomain": True,
            "caption": f"{date}. {object_type}. {origin}. Institutional metadata; image appearance is not evidence of hidden intent.",
            "verifiedAt": reviewed_at,
            "sourceHash": source_hash,
        }
    )

output = {
    "formatVersion": 1,
    "institution": "Art Institute of Chicago",
    "sourcePolicy": "Only review-file approvals with is_public_domain=true and a stable institutional image ID are retained.",
    "artifacts": sorted(artifacts, key=lambda item: item["id"]),
    "images": sorted(images, key=lambda item: item["id"]),
}
target = root / "data/seed/institutional-images.json"
temp = target.with_suffix(".tmp")
temp.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
temp.replace(target)
print(f"Imported {len(artifacts)} AIC objects and {len(images)} verified image records")
