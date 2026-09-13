"""Import explicitly selected Met objects with CC0 images; no automatic work matching.

Usage: python scripts/import-met.py 548344 550899 --book-of-dead
The optional association is limited to records whose institutional title explicitly
identifies the Book of the Dead. It never links an English edition to a witness.
"""
import argparse, concurrent.futures, hashlib, json, pathlib, urllib.request
from datetime import datetime, timezone
from urllib.parse import urlparse

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('ids', nargs='+', type=int)
parser.add_argument('--book-of-dead', action='store_true')
args = parser.parse_args()
target = root / 'data/seed/archive-additions.json'
data = json.loads(target.read_text(encoding='utf-8'))
provenance = root / 'data/provenance/met'
provenance.mkdir(parents=True, exist_ok=True)

def available(url):
    if urlparse(url).scheme != 'https' or urlparse(url).hostname != 'images.metmuseum.org':
        return False
    try:
        with urllib.request.urlopen(urllib.request.Request(url, method='HEAD'), timeout=25) as response:
            return response.status == 200 and response.headers.get('Content-Type', '').startswith('image/')
    except Exception:
        return False

for oid in dict.fromkeys(args.ids):
    api = f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}'
    with urllib.request.urlopen(api, timeout=30) as response:
        raw = response.read()
    obj = json.loads(raw)
    if obj.get('objectID') != oid or obj.get('isPublicDomain') is not True:
        raise ValueError(f'Object {oid} has no confirmed public-domain image rights')
    source = obj['objectURL']
    if urlparse(source).hostname != 'www.metmuseum.org':
        raise ValueError('Unexpected institution source URL')
    title = obj['title']
    if args.book_of_dead and 'book of the dead' not in title.lower():
        raise ValueError(f'Unverified work association for {oid}: {title}')
    urls = list(dict.fromkeys([obj['primaryImage']] + obj.get('additionalImages', [])))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        verified = [url for url, ok in zip(urls, pool.map(available, urls)) if ok]
    if not verified:
        raise ValueError(f'No accessible verified image for {oid}')
    (provenance / f'{oid}.json').write_bytes(raw)
    aid, wid = f'met-{oid}', f'met-witness-{oid}'
    is_witness = 'papyrus' in (obj.get('medium','') + obj.get('objectName','')).lower()
    work_ids = ['book-of-the-dead'] if args.book_of_dead else []
    institution = 'The Metropolitan Museum of Art'
    rights = 'CC0 1.0 Universal · Met Open Access'
    date = obj.get('objectDate') or 'Date unavailable'
    period = obj.get('period') or 'Period unavailable'
    description = f'{title}. {date}. {obj.get("medium") or "Material unavailable"}. Institutional catalog description; no translation is supplied by this image record.'
    data['artifacts'] = [a for a in data['artifacts'] if a['id'] != aid]
    data['artifacts'].append(dict(id=aid,title=title,witnessId=wid if is_witness else None,inventoryNumber=obj.get('accessionNumber'),institution=institution,sourceUrl=source,description=description,collection='egypt' if obj.get('department')=='Egyptian Art' else None,period=period,date=date,culture=obj.get('culture') or None,creditLine=obj.get('creditLine'),sourceApi=api,sourceHash=hashlib.sha256(raw).hexdigest(),verifiedAt=datetime.now(timezone.utc).isoformat()))
    if is_witness:
        data['witnesses'] = [w for w in data['witnesses'] if w['id'] != wid]
        data['witnesses'].append(dict(id=wid,title=title,workIds=work_ids,recensionId=None,type='Papyrus',inventoryNumber=obj.get('accessionNumber'),repository=institution,discoveryLocation=obj.get('excavation') or None,currentLocation=obj.get('repository') or institution,dateStart=obj.get('objectBeginDate'),dateEnd=obj.get('objectEndDate'),dateNotes=f'{date}; {period}. These dates describe the physical object, not the composition of the work.',material=obj.get('medium') or None,languages=[],scripts=[],condition=None,completeness=None,provenance=f'Institutional catalog and credit line: {obj.get("creditLine") or "Data unavailable"}',digitizationUrl=source,iiifManifest=None,rights=rights,sources=[source,api],decipherment='Not assessed',evidence='Securely attested',description=description,access='Public metadata'))
    data['images'] = [i for i in data['images'] if i['artifactId'] != aid]
    for index,url in enumerate(verified):
        iid = f'{aid}-{hashlib.sha256(url.encode()).hexdigest()[:12]}'
        data['images'].append(dict(id=iid,artifactId=aid,witnessId=wid if is_witness else None,workIds=work_ids,title=f'{title} · museum image {index+1}',institution=institution,imageUrl=url,thumbnail=obj['primaryImageSmall'] if url==obj['primaryImage'] and obj.get('primaryImageSmall') else url,iiifService=None,sourceUrl=source,rights=rights,attribution=f'{title} · {institution} · {obj.get("accessionNumber", "")} · {obj.get("creditLine", "")} · {rights}',publicDomain=True,caption=f'{date}. {period}. Museum image sequence, not an original page or spell number.',verifiedAt=datetime.now(timezone.utc).isoformat()))
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    temp.replace(target)
    print(f'{oid}: {len(verified)} verified images; {title}', flush=True)
print(f'Total imported: {len(data["artifacts"])} objects, {len(data["witnesses"])} witnesses, {len(data["images"])} images.')
