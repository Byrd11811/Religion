import json,re,pathlib,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
texts=json.loads((ROOT/'data/seed/texts.json').read_text(encoding='utf-8'))
# Explicit mappings prevent silently assigning the wrong downloaded edition.
config=[
(2017,'Dhammapada','F. Max Müller','Pali',-300,-100,['suffering','enlightenment','evil'],'Canonical in Theravada Buddhism'),
(2388,'Bhagavad Gita','Edwin Arnold','Sanskrit',-200,200,['soul','law','reincarnation'],'Revered Hindu scripture; part of the Mahabharata'),
(216,'Tao Te Ching','James Legge','Classical Chinese',-400,-200,['wisdom','peace','law'],'Foundational Daoist classic'),
(3330,'Analects','James Legge','Classical Chinese',-500,-200,['law','wisdom','ritual'],'Confucian classic'),
(2680,'Marcus Aurelius - Meditations','Meric Casaubon','Greek',170,180,['death','wisdom','soul'],'Philosophical work, not a scriptural canon'),
(45109,'Epictetus - Enchiridion','Thomas Wentworth Higginson','Greek',125,150,['law','wisdom','suffering'],'Philosophical handbook compiled by Arrian'),
(1497,'Plato - Republic','Benjamin Jowett','Greek',-380,-370,['justice','soul','law'],'Philosophical dialogue'),
(1658,'Plato - Phaedo','Benjamin Jowett','Greek',-390,-360,['soul','death','afterlife'],'Philosophical dialogue'),
(1600,'Plato - Symposium','Benjamin Jowett','Greek',-385,-370,['love','wisdom'],'Philosophical dialogue'),
(1572,'Plato - Timaeus','Benjamin Jowett','Greek',-360,-350,['creation','soul'],'Philosophical dialogue'),
(19322,'Nietzsche - The Antichrist','H. L. Mencken','German',1888,1895,['evil','law','wisdom'],'Modern philosophical critique; written 1888, published 1895'),
(4583,'David Hume - Dialogues Concerning Natural Religion','Original English','English',1750,1779,['creation','evil','wisdom'],'Philosophical critique; published posthumously in 1779'),
(20,'Paradise Lost','Original English','English',1667,1674,['evil','creation','law'],'Literary poem; not canonical scripture'),
(1727,'Odyssey','Samuel Butler','Greek',-750,-650,['afterlife','death','ritual'],'Ancient epic poetry'),
(228,'Virgil - Aeneid','John Dryden','Latin',-29,-19,['afterlife','law','destiny'],'Roman epic poetry'),
(24869,'Ramayana','Ralph T. H. Griffith','Sanskrit',-500,300,['law','war','ritual'],'Hindu epic with many regional recensions'),
(18947,'Prose Edda','Rasmus Björn Anderson','Old Norse',1220,1230,['creation','death','wisdom'],'Medieval literary and mythographic source'),
(3434,'Quran','J. M. Rodwell','Arabic',610,632,['judgment','creation','mercy'],'Canonical scripture in Islam'),
(7440,'Quran','George Sale','Arabic',610,632,['judgment','creation','mercy'],'Canonical scripture in Islam'),
(17,'Book of Mormon','Original English edition','English',1830,1830,['revelation','law','afterlife'],'Canonical in Latter Day Saint movements'),
(6130,'Iliad','Alexander Pope','Greek',-750,-650,['death','war','ritual'],'Ancient epic poetry'),
(3296,'Confessions of Augustine','E. B. Pusey','Latin',397,400,['sin','soul','wisdom'],'Christian autobiographical and theological work'),
(4363,'Beyond Good and Evil','Helen Zimmern','German',1886,1886,['evil','wisdom','law'],'Modern philosophical critique'),
(5500,'The Advancement of Learning','Original English','English',1605,1605,['wisdom','knowledge'],'Early modern philosophical work')]
concepts={'afterlife':['death','dead','immortal','heaven','hell'],'creation':['creation','created','beginning'],'flood':['flood','deluge','ark'],'suffering':['suffering','pain','sorrow'],'soul':['soul','self','spirit'],'reincarnation':['rebirth','transmigration'],'forgiveness':['forgive','forgiveness','enemies','mercy'],'evil':['evil','wicked','sin','satan'],'wisdom':['wisdom','knowledge','truth'],'law':['law','duty','obedience'],'wealth':['wealth','rich','poor'],'peace':['peace','war','battle'],'enlightenment':['enlightenment','liberation','nirvana'],'ritual':['prayer','sacrifice','worship'],'judgment':['judgment','judgement','punishment']}
editions=[];passages=[]
for gid,title,translator,language,start,end,themes,canon in config:
 t=next((t for t in texts if t['title']==title),None)
 if t is None:
  base=next(t for t in texts if t['title']==('Gospel of Matthew' if gid==3296 else 'Nietzsche - The Antichrist'))
  t={**base,'id':re.sub('[^a-z0-9]+','-',title.lower()).strip('-'),'title':title};texts.append(t)
 raw=(ROOT/f'data/public-domain/{gid}.txt').read_text(encoding='utf-8-sig')
 match=re.search(r'\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*',raw,re.I)
 endmatch=re.search(r'\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',raw,re.I)
 if not match or not endmatch:raise ValueError(f'Missing Gutenberg delimiters: {gid}')
 body=raw[match.end():endmatch.start()].strip()
 eid=f'pg-{gid}';url=f'https://www.gutenberg.org/ebooks/{gid}'
 chunks=[];buffer=''
 for block in re.split(r'\n\s*\n',body):
  if len(buffer)+len(block)>1600 and buffer:chunks.append(buffer.strip());buffer=''
  buffer+=block+'\n\n'
 if buffer.strip():chunks.append(buffer.strip())
 for i,chunk in enumerate(chunks):
  words=set(re.findall(r'\b[a-z]+\b',chunk.lower()))
  tags=[k for k,terms in concepts.items() if any(term in words for term in terms)]
  passages.append(dict(id=f'{eid}-{i+1}',textId=t['id'],editionId=eid,sequence=i+1,reference=f'Edition segment {i+1}',content=chunk,sourceUrl=url,themes=tags))
 editions.append(dict(id=eid,textId=t['id'],title=re.search(r'^Title:\s*(.+)',raw,re.M)[1].strip(),translator=translator,sourceUrl=url,downloadUrl=f'https://www.gutenberg.org/cache/epub/{gid}/pg{gid}.txt',license='Public domain in the USA. Project Gutenberg license retained in source file; check local restrictions elsewhere.',language='English',sha256=hashlib.sha256(raw.encode()).hexdigest(),passageCount=len(chunks),complete=True,note='Complete digitized edition, including any introductions, notes and editorial material. Segment numbers are atlas locators, not original verse numbers. Historical translations may use dated or partisan language.'))
 t.update(editionId=next(e['id'] for e in editions if e['textId']==t['id']),sourceStatus='Full edition available',sourceUrl=url,copyright='Public-domain English edition (USA)',languages=[language],canonStatus=canon,startDate=start,endDate=end,dateConfidence='Editorial estimate · requires scholarly review',confidence='D',themes=themes,description=f'{title}. {canon}. Read the bundled English edition, compare passages, or explore related themes.',historicalContext='The displayed range is a provisional editorial composition/publication estimate, not the age of a surviving manuscript. Ancient works may contain multiple textual layers.',metadataSources=[url,'Editorial chronology; not independently peer-reviewed'])
 coords={'Pali':(26,84),'Sanskrit':(25,80),'Classical Chinese':(34,108),'Greek':(38,23),'German':(51,10),'English':(52,0),'Latin':(42,12),'Old Norse':(64,-21),'Arabic':(21.4,39.8)}
 t['lat'],t['lng']=coords[language]
 if gid==17:t['lat'],t['lng']=43,-77
 if gid==2680:t['lat'],t['lng']=48,16
 t['author']={'Plato - Republic':'Plato','Plato - Phaedo':'Plato','Plato - Symposium':'Plato','Plato - Timaeus':'Plato','Marcus Aurelius - Meditations':'Marcus Aurelius','Prose Edda':'Traditionally attributed to Snorri Sturluson','Paradise Lost':'John Milton','Quran':'Traditionally understood in Islam as revelation to Muhammad','Analects':'Sayings attributed to Confucius and his disciples','Tao Te Ching':'Traditionally attributed to Laozi; authorship disputed','Bhagavad Gita':'Traditionally attributed to Vyasa; composition debated','Dhammapada':'Verses attributed to the Buddha; transmitted and compiled by Buddhist communities'}.get(title,'See edition attribution; traditional and historical authorship may differ')
from extend_corpus import extend
extend(ROOT,texts,editions,passages,concepts)
for name,rows in [('texts',texts),('editions',editions),('passages',passages)]:
 (ROOT/f'data/seed/{name}.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(len(texts),'records;',len(editions),'editions;',len(set(e['textId'] for e in editions)),'works;',len(passages),'segments')
