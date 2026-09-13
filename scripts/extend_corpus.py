import re,json,hashlib

def extend(root,texts,editions,passages,concepts):
 def getbody(gid):
  raw=(root/f'data/public-domain/{gid}.txt').read_text(encoding='utf-8-sig')
  start=re.search(r'\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
  end=re.search(r'\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
  if not start or not end:raise ValueError(f'Missing edition boundary: {gid}')
  return raw,raw[start.end():end.start()].strip()
 def add(title,gid,body,translator,language,category,canon,source_sections=None,complete=True,dates=None,coords=None,note=None,group=None,verse=False):
  t=next((t for t in texts if t['title']==title),None)
  if t is None:
   base=next(t for t in texts if t['title']==('Torah / Pentateuch' if group=='Jewish' else 'Bhagavad Gita'))
   t={**base,'id':re.sub('[^a-z0-9]+','-',title.lower()).strip('-'),'title':title};texts.append(t)
  if len(body)<1000:raise ValueError('Selected source is unexpectedly short: '+title)
  eid=f'pg-{gid}-{t["id"]}';url=f'https://www.gutenberg.org/ebooks/{gid}'
  editions[:]=[e for e in editions if e['id']!=eid];passages[:]=[p for p in passages if p['editionId']!=eid]
  raw,full=getbody(gid)
  blocks=re.split(r'\n\s*\n',body)
  chunks=[];buffer=''
  if verse:chunks=[b.strip() for b in blocks if b.strip()]
  else:
   for block in blocks:
    if len(buffer)+len(block)>1600 and buffer:chunks.append(buffer.strip());buffer=''
    buffer+=block+'\n\n'
   if buffer.strip():chunks.append(buffer.strip())
  for i,chunk in enumerate(chunks):
   words=set(re.findall(r'\b[a-z]+\b',chunk.lower()));tags=[k for k,terms in concepts.items() if any(term in words for term in terms)]
   location=re.match(r'^(\d+):(\d+)\s',chunk) if verse else None
   reference=f'{title} {location[1]}:{location[2]}' if location else f'Edition segment {i+1}'
   passages.append(dict(id=f'{eid}-{i+1}',textId=t['id'],editionId=eid,sequence=i+1,reference=reference,content=chunk,sourceUrl=url,themes=tags))
  editions.append(dict(id=eid,textId=t['id'],title=f'{title} · {translator}',translator=translator,sourceUrl=url,downloadUrl=f'https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt',license='Public domain in the USA. The KJV has additional Crown-rights restrictions in the United Kingdom.' if gid==10 else 'Public domain in the USA. Source license retained; jurisdictional restrictions may differ.',language='English',sha256=hashlib.sha256(raw.encode()).hexdigest(),passageCount=len(chunks),complete=complete,sourceFile=f'{gid}.txt',sourceSections=source_sections,note=note or ('Complete named work extracted from the cited anthology. Actual chapter:verse labels are preserved where present; other segment labels are atlas locators. English translation, not original-language text.' if source_sections else 'Complete digitized edition, including translator commentary and editorial notes. Historical translations may be outdated.')))
  tags=sorted(set(tag for p in passages if p['editionId']==eid for tag in p['themes']))
  t.update(editionId=eid,sourceStatus='Full named work available' if complete else 'Study and translated selections',copyright='Public-domain English edition (USA)',sourceUrl=url,languages=[language],category=category,canonStatus=canon,description=f'{title}. {canon}. '+('The bundled source preserves the complete named work.' if complete else 'The bundled publication contains historical commentary and translated selections; it is not a complete translation of the ancient corpus.'),themes=tags,metadataSources=[url],confidence='D',dateConfidence='Editorial estimate · requires scholarly review',startDate=dates[0] if dates else None,endDate=dates[1] if dates else None,lat=coords[0] if coords else None,lng=coords[1] if coords else None,author='Traditional attributions and editorial authorship are discussed in the source edition.',historicalContext='Read the composition and transmission of this work separately from the publication date of its English translation.',manuscripts='See the source edition for historical manuscript discussion; modern scholarly review remains necessary.')
  return t
 raw,bible=getbody(10)
 headers=['The First Book of Moses: Called Genesis','The Second Book of Moses: Called Exodus','The Third Book of Moses: Called Leviticus','The Fourth Book of Moses: Called Numbers','The Fifth Book of Moses: Called Deuteronomy','The Book of Joshua','The Book of Judges','The Book of Ruth','The First Book of Samuel','The Second Book of Samuel','The First Book of the Kings','The Second Book of the Kings','The First Book of the Chronicles','The Second Book of the Chronicles','Ezra','The Book of Nehemiah','The Book of Esther','The Book of Job','The Book of Psalms','The Proverbs','Ecclesiastes','The Song of Solomon','The Book of the Prophet Isaiah','The Book of the Prophet Jeremiah','The Lamentations of Jeremiah','The Book of the Prophet Ezekiel','The Book of Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','The Gospel According to Saint Matthew','The Gospel According to Saint Mark','The Gospel According to Saint Luke','The Gospel According to Saint John','The Acts of the Apostles','The Epistle of Paul the Apostle to the Romans','The First Epistle of Paul the Apostle to the Corinthians','The Second Epistle of Paul the Apostle to the Corinthians','The Epistle of Paul the Apostle to the Galatians','The Epistle of Paul the Apostle to the Ephesians','The Epistle of Paul the Apostle to the Philippians','The Epistle of Paul the Apostle to the Colossians','The First Epistle of Paul the Apostle to the Thessalonians','The Second Epistle of Paul the Apostle to the Thessalonians','The First Epistle of Paul the Apostle to Timothy','The Second Epistle of Paul the Apostle to Timothy','The Epistle of Paul the Apostle to Titus','The Epistle of Paul the Apostle to Philemon','The Epistle of Paul the Apostle to the Hebrews','The General Epistle of James','The First Epistle General of Peter','The Second General Epistle General of Peter','The First Epistle General of John','The Second Epistle General of John','The Third Epistle General of John','The General Epistle of Jude','The Revelation of Saint John the Divine']
 headers[60]='The Second General Epistle of Peter'
 positions=[]
 for h in headers:
  matches=list(re.finditer(r'^[ \t]*'+re.escape(h)+r'[ \t]*$',bible,re.M))
  if not matches:raise ValueError('Missing Bible heading '+h)
  positions.append(matches[-1].start())
 if positions!=sorted(positions):raise ValueError('Bible book order is not monotonic')
 selected=[('Genesis',0),('Job',17),('Psalms',18),('Proverbs',19),('Ecclesiastes',20),('Song of Songs',21),('Daniel',26),('Gospel of Matthew',39),('Gospel of Mark',40),('Gospel of Luke',41),('Gospel of John',42),('Acts',43),('Revelation',65)]
 for title,n in selected:
  body=bible[positions[n]:positions[n+1] if n+1<len(positions) else len(bible)].strip()
  if n==38:body=body.split('The New Testament of the King James Bible')[0].strip()
  descriptor=[{'startHeading':headers[n],'endHeading':headers[n+1] if n+1<len(headers) else None}]
  canon='Canonical in Jewish and Christian communities; this is a Christian English translation.' if n<39 else 'Canonical New Testament book across major Christian traditions.'
  dates={39:(70,100),40:(65,75),41:(80,100),42:(90,110),43:(80,110),65:(90,100)}.get(n)
  add(title,10,body,'King James Version (1611 tradition)','Hebrew / Aramaic' if n<39 else 'Koine Greek','Canonical Scripture',canon,descriptor,dates=dates,coords=(31.8,35.2) if n<39 else None,group='Jewish',verse=True)
 # Three complete Upanishads are selected by standalone heading, not incidental mentions.
 _,up=getbody(3283)
 upnames=[('Isha Upanishad','Isa-Upanishad'),('Katha Upanishad','Katha-Upanishad'),('Kena Upanishad','Kena-Upanishad')]
 upos=[list(re.finditer(r'^[ \t]*'+re.escape(h)+r'[ \t]*$',up,re.M))[-1].start() for _,h in upnames]
 for i,(title,h) in enumerate(upnames):
  body=up[upos[i]:upos[i+1] if i+1<len(upos) else len(up)].strip()
  add(title,3283,body,'Swami Paramananda','Sanskrit','Canonical Scripture','Principal Upanishad in Hindu traditions, with translator commentary.',[{'startHeading':h,'endHeading':upnames[i+1][1] if i+1<len(upnames) else None}],dates=None,coords=(25,80))
 for gid,title,translator,lang,cat,canon,full,dates,coords in [
  (77935,'1 Enoch','R. H. Charles; introduction by W. O. E. Oesterley','Aramaic traditions; complete transmission in Geʽez','Apocalyptic / Pseudepigraphal','Canon status differs by community; retained as scripture in Ethiopian and Eritrean Orthodox traditions.',True,(-300,100),(31.8,35.2)),
  (11000,'Epic of Gilgamesh','Morris Jastrow and Albert T. Clay','Akkadian / Sumerian traditions','Mythological / Wisdom','Ancient Mesopotamian epic; this edition studies Old Babylonian witnesses and is not the complete standard epic.',False,(-2100,-1200),(33.3,44.4)),
  (73533,'Poetic Edda','Henry Adams Bellows','Old Norse','Mythological / Poetry','Medieval collection of Norse mythological and heroic poems; no universal closed religious canon.',True,(900,1300),(64,-21)),
  (7145,'Book of the Dead','E. A. Wallis Budge','Egyptian','Ritual / Funerary','Egyptian funerary corpus; this publication is a historical study with translated selections, not the entire corpus.',False,None,(26.8,30.8))]:
  _,body=getbody(gid);add(title,gid,body,translator,lang,cat,canon,complete=full,dates=dates,coords=coords,note=None if full else 'Complete historical study digitized; ancient primary text coverage is partial and mixed with commentary. Do not treat this as a complete modern translation.')
