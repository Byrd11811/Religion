import concurrent.futures,urllib.request,re,json,pathlib
ids=[2017,2388,216,3330,2680,45109,1497,1658,1600,1572,19322,4583,20,1727,228,24869,18947,3434,7440,17,6130,3296,4363,5500,10,77935,11000,3283,73533,7145]
out=pathlib.Path('data/public-domain');out.mkdir(parents=True,exist_ok=True)
def get(i):
 try:
  url=f'https://www.gutenberg.org/cache/epub/{i}/pg{i}.txt'
  raw=urllib.request.urlopen(url,timeout=50).read().decode('utf-8-sig')
  title=re.search(r'^Title:\s*(.+)',raw,re.M)
  if not title:return {'id':i,'error':'No title'}
  (out/f'{i}.txt').write_text(raw,encoding='utf-8')
  return {'id':i,'title':title.group(1).strip(),'bytes':len(raw),'url':url,'translator':re.findall(r'^(?:Translator|Author):\s*(.+)',raw,re.M),'license':'Public domain in the USA; Project Gutenberg license retained in source file.'}
 except Exception as e:return {'id':i,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex: rows=list(ex.map(get,ids))
pathlib.Path('data/seed/downloads.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
for r in rows:print(r['id'],r.get('title',r.get('error')),r.get('translator'))
