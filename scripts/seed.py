import json,re,pathlib,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
def slug(s):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
spec=(ROOT/'docs/product-spec.md').read_text(encoding='utf-8')
section=spec.split('# 9. INITIAL 100+ TEXT TARGET LIST')[1].split('# 10. DATA MODEL')[0]
traditions=[];texts=[];seen=set()
regions=[('Mesopotamia',33.3,44.4),('Egypt',26.8,30.8),('Levant',31.8,35.2),('Eastern Mediterranean',34,34),('Arabia',21.4,39.8),('Iran',32.4,53.7),('South Asia',25,80),('South Asia',26,84),('South Asia',24,73),('Punjab',31,75),('China',34,108),('Japan',35,135),('Greece',38,23),('Italy',42,12),('Northern Europe',62,10),('Ireland and Wales',53,-6),('Mesoamerica',17,-91),('Andes',-13,-72),('North America',40,-105),('Africa',7,4),('Oceania',-20,-160),('Eastern Mediterranean',30,31),('Europe',48,8),('Europe and North America',40,-74),('Europe',50,8),('Multiple regions',None,None)]
for line in section.splitlines():
 m=re.match(r'## ([A-Z])\. (.+)',line)
 if m:
  name=m[2];index=ord(m[1])-65;region,lat,lng=regions[index];tid=slug(name)
  traditions.append(dict(id=tid,name=name,region=region,lat=lat,lng=lng,description='A catalog grouping, not a single uniform belief system. Communities, practices and interpretations vary across place and time.',color=['#a4773b','#658a84','#846c99','#ab6754','#6f8295'][index%5]))
 m=re.match(r'\d+\. (.+)',line)
 if m:
  title=m[1];id=slug(title)
  if id in seen:continue
  seen.add(id)
  category='Oral Tradition Transcription' if ('narratives' in title or 'oral tradition' in title or index in [18,20]) else 'Metadata catalog entry'
  if index in [12,13,24]:category='Philosophical / Literary'
  if index==23:category='Adversarial / Literary'
  texts.append(dict(id=id,title=title,traditionId=tid,tradition=name,category=category,canonStatus='Community-specific; research pending',startDate=None,endDate=None,dateConfidence='Unreviewed',region=region,lat=None,lng=None,languages=[],author='Data unavailable',description=f'{title} is included in the atlas research catalog. Detailed editorial metadata has not yet been reviewed.',historicalContext='Data unavailable. Do not infer a composition date from the date of a surviving edition.',manuscripts='Data unavailable',themes=[],sourceStatus='Metadata only',copyright='Edition rights not assessed; no text bundled',sourceUrl=None,metadataSources=['docs/product-spec.md, section 9'],editionId=None,confidence='Unreviewed'))
(ROOT/'data/seed/traditions.json').write_text(json.dumps(traditions,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'data/seed/texts.json').write_text(json.dumps(texts,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(texts)} texts; {len(traditions)} catalog groupings')
