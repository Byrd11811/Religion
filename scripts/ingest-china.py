"""Generate the reviewed Phase 7 Chinese catalog and public-domain source corpus."""
from __future__ import annotations
import hashlib,json,re,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TRADITION_ID="china"; TRADITION="Chinese traditions"
PG="https://www.gutenberg.org/ebooks/{}"
# title | characters | pinyin. One row is one transmitted work/corpus, never an internal chapter.
GROUPS={
"Confucian / Ru":[
("Analects","論語","Lúnyǔ"),("Mencius","孟子","Mèngzǐ"),("Great Learning","大學","Dàxué"),("Doctrine of the Mean","中庸","Zhōngyōng"),("Book of Rites","禮記","Lǐjì"),("Classic of Filial Piety","孝經","Xiàojīng"),("Spring and Autumn Annals","春秋","Chūnqiū"),("Zuo Commentary","左傳","Zuǒzhuàn"),("Book of Documents","尚書","Shàngshū"),("Book of Songs","詩經","Shījīng"),("I Ching","易經","Yìjīng"),("Xunzi","荀子","Xúnzǐ"),("Kongzi Jiayu","孔子家語","Kǒngzǐ Jiāyǔ"),("Kongcongzi","孔叢子","Kǒngcóngzǐ"),("Luxuriant Dew of the Spring and Autumn Annals","春秋繁露","Chūnqiū Fánlù"),("Discourses on Salt and Iron","鹽鐵論","Yántiě Lùn"),("Comprehensive Discussions in the White Tiger Hall","白虎通義","Báihǔ Tōngyì"),("Family Instructions of the Yan Clan","顏氏家訓","Yánshì Jiāxùn"),("Reflections in the Imperial Mirror","申鑒","Shēnjiàn"),("Instructions for Practical Living","傳習錄","Chuánxí Lù"),("Complete Works of Wang Yangming","王陽明全集","Wáng Yángmíng Quánjí")],
"Daoist":[
("Tao Te Ching","道德經","Dàodéjīng"),("Zhuangzi","莊子","Zhuāngzǐ"),("Liezi","列子","Lièzǐ"),("Huainanzi","淮南子","Huáinánzǐ"),("Wenzi","文子","Wénzǐ"),("Baopuzi","抱朴子","Bàopǔzǐ"),("Taiping Jing","太平經","Tàipíng Jīng"),("Cantong Qi","參同契","Cāntóng Qì"),("Huangting Jing","黃庭經","Huángtíng Jīng"),("Qingjing Jing","清靜經","Qīngjìng Jīng"),("Neiye","內業","Nèiyè"),("Zuowanglun","坐忘論","Zuòwàng Lùn"),("Wuzhen Pian","悟真篇","Wùzhēn Piān"),("Guanzi","管子","Guǎnzǐ"),("Guanyinzi","關尹子","Guānyǐnzǐ"),("Yinwenzi","尹文子","Yǐnwénzǐ"),("Shenzi","慎子","Shènzǐ"),("Scripture of the Yellow Court","黃庭內景經","Huángtíng Nèijǐng Jīng"),("Scripture of Great Peace","太平經鈔","Tàipíng Jīng Chāo"),("Scripture of Western Ascension","西昇經","Xīshēng Jīng"),("Scripture of the Three Sovereigns","三皇文","Sānhuáng Wén"),("Upper Clarity corpus","上清經","Shàngqīng Jīng"),("Numinous Treasure corpus","靈寶經","Língbǎo Jīng"),("Complete Perfection corpus","全真道藏","Quánzhēn Dàozàng"),("Daoist Canon","道藏","Dàozàng")],
"Chinese Buddhism":[
("Forty-Two Chapter Sutra","佛說四十二章經","Fóshuō Sìshí'èr Zhāng Jīng"),("Heart Sutra","般若波羅蜜多心經","Bōrě Bōluómìduō Xīnjīng"),("Diamond Sutra","金剛般若波羅蜜經","Jīngāng Bōrě Bōluómì Jīng"),("Lotus Sutra","妙法蓮華經","Miàofǎ Liánhuá Jīng"),("Avatamsaka Sutra","大方廣佛華嚴經","Dàfāngguǎng Fó Huáyán Jīng"),("Vimalakirti Sutra","維摩詰所說經","Wéimójié Suǒshuō Jīng"),("Amitabha Sutra","佛說阿彌陀經","Fóshuō Āmítuó Jīng"),("Infinite Life Sutra","佛說無量壽經","Fóshuō Wúliàngshòu Jīng"),("Contemplation Sutra","佛說觀無量壽佛經","Fóshuō Guān Wúliàngshòu Fó Jīng"),("Lankavatara Sutra","楞伽阿跋多羅寶經","Léngqié Ābáduōluó Bǎojīng"),("Mahaparinirvana Sutra","大般涅槃經","Dàbān Nièpán Jīng"),("Platform Sutra","六祖壇經","Liùzǔ Tánjīng"),("Awakening of Faith","大乘起信論","Dàchéng Qǐxìn Lùn"),("Treatise on the Great Perfection of Wisdom","大智度論","Dàzhìdù Lùn"),("Mohe Zhiguan","摩訶止觀","Móhē Zhǐguān"),("Profound Meaning of the Lotus Sutra","法華玄義","Fǎhuá Xuányì"),("Essay on the Golden Lion","華嚴金獅子章","Huáyán Jīnshīzi Zhāng"),("Anthology of the Patriarchal Hall","祖堂集","Zǔtáng Jí"),("Blue Cliff Record","碧巖錄","Bìyán Lù"),("Gateless Gate","無門關","Wúmén Guān"),("Transmission of the Lamp","景德傳燈錄","Jǐngdé Chuándēng Lù"),("Essential Teaching of Huangbo","筠州黃檗山斷際禪師傳心法要","Huángbò Chuánxīn Fǎyào"),("Collection on Peace and Bliss","安樂集","Ānlè Jí"),("Biographies of Eminent Monks","高僧傳","Gāosēng Zhuàn"),("Chinese Buddhist Canon","大藏經","Dàzàngjīng")],
"Mohist":[("Mozi","墨子","Mòzǐ"),("Mohist Canons","墨經","Mòjīng"),("Explanations of the Canons","經說","Jīngshuō"),("Great Taking","大取","Dà Qǔ"),("Small Taking","小取","Xiǎo Qǔ")],
"Legalist":[("Han Feizi","韓非子","Hán Fēizǐ"),("Book of Lord Shang","商君書","Shāngjūn Shū"),("Shen Buhai fragments","申不害佚文","Shēn Bùhài Yìwén"),("Shenzi fragments","慎子佚文","Shènzǐ Yìwén"),("The Annals of Lü Buwei","呂氏春秋","Lǚshì Chūnqiū"),("The Book of the Master of the Pheasant Cap","鶡冠子","Hèguānzǐ"),("Canon of Laws","法經","Fǎjīng"),("Deng Xizi","鄧析子","Dèngxīzǐ")],
"School of Names":[("Gongsun Longzi","公孫龍子","Gōngsūn Lóngzǐ"),("Discourse on the White Horse","白馬論","Báimǎ Lùn"),("Discourse on Pointing at Things","指物論","Zhǐwù Lùn"),("Hui Shi fragments","惠施佚文","Huì Shī Yìwén"),("Rectification of Names materials","正名篇","Zhèngmíng Piān")],
"Folk religion":[("Classic of Mountains and Seas","山海經","Shānhǎijīng"),("Soushen Ji","搜神記","Sōushén Jì"),("Precious Scroll of Guanyin","觀音寶卷","Guānyīn Bǎojuàn"),("Canon of the Jade Emperor","高上玉皇本行集經","Yùhuáng Běnxíng Jíjīng"),("Guandi Scripture","關聖帝君覺世真經","Guāndì Juéshì Zhēnjīng"),("Mazu Scripture","天上聖母經","Tiānshàng Shèngmǔ Jīng")],
"Chinese Manichaeism":[("Compendium of the Teachings of Mani","摩尼光佛教法儀略","Móní Guāngfó Jiàofǎ Yílüè"),("Hymnscroll","下部讚","Xiàbù Zàn"),("Sermon of the Light Nous","冥使訓","Míngshǐ Xùn")],
"Jingjiao":[("Jingjiao Documents","景教文獻","Jǐngjiào Wénxiàn"),("Jesus-Messiah Sutra","序聽迷詩所經","Xùtīng Míshīsuǒ Jīng"),("Stele of the Diffusion of the Luminous Religion","大秦景教流行中國碑","Dàqín Jǐngjiào Liúxíng Zhōngguó Bēi")],
"Chinese Islam":[("Real Commentary on the True Teaching","正教真詮","Zhèngjiào Zhēnquán"),("Great Learning of the Pure and Real","清真大學","Qīngzhēn Dàxué"),("Nature and Principle in Islam","天方性理","Tiānfāng Xìnglǐ")],
"Syncretic traditions":[("Tract on Actions and Retributions","太上感應篇","Tàishàng Gǎnyìng Piān"),("Ledgers of Merit and Demerit","功過格","Gōngguò Gé"),("Book of the Three Teachings","三教源流搜神大全","Sānjiào Yuánliú Sōushén Dàquán"),("Precious Scroll of the Eternal Mother","無生老母寶卷","Wúshēng Lǎomǔ Bǎojuàn"),("Complete Book of the Three Teachings","三教偶拈","Sānjiào Ǒuniān")]
}
EXISTING={'Analects':'analects','Mencius':'mencius','Tao Te Ching':'tao-te-ching','Zhuangzi':'zhuangzi','I Ching':'i-ching','Mozi':'mozi','Xunzi':'xunzi','Huainanzi':'huainanzi','Classic of Mountains and Seas':'classic-of-mountains-and-seas'}
def slug(s):
 s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower(); return re.sub(r'[^a-z0-9]+','-',s).strip('-')
SOURCES={
'Gongsun Longzi':7216,'Tao Te Ching':7337,'Liezi':7341,'Guanzi':7367,'Reflections in the Imperial Mirror':7408,'Family Instructions of the Yan Clan':7458,'Forty-Two Chapter Sutra':23585,'Analects':23839,'Platform Sutra':23844,'Wenzi':23854,'Book of Songs':23873,'Book of Rites':24048,'Huainanzi':24059,'Diamond Sutra':24098,'Collection on Peace and Bliss':24106,'Zuo Commentary':24136,'Mencius':24178,'Classic of Filial Piety':24232,'Mozi':24240,'Guanyinzi':25169,'Classic of Mountains and Seas':25288,'Xunzi':25314,'Shenzi':25366,'Kongcongzi':25374,'Luxuriant Dew of the Spring and Autumn Annals':25385,'Infinite Life Sutra':25498,'I Ching':25501,'Instructions for Practical Living':25517,'Baopuzi':25696,'Yinwenzi':27017}
PG_SOURCE='https://www.gutenberg.org/'
def main():
 rows=[]
 for group,items in GROUPS.items():
  for title,chars,pinyin in items:
   wid=EXISTING.get(title,slug(title)); pg=SOURCES.get(title)
   source=PG.format(pg) if pg else ('https://ctext.org/' if group not in {'Chinese Buddhism','Chinese Manichaeism','Jingjiao','Chinese Islam'} else 'https://www.cbeta.org/')
   rows.append({'id':wid,'title':title,'nativeTitle':chars,'pinyin':pinyin,'alternateTitles':[chars,pinyin],'subcollection':group,'traditionId':TRADITION_ID,'tradition':TRADITION,'category':group,'canonStatus':'Community- and corpus-specific; no single Chinese canon is implied.','startDate':None,'endDate':None,'dateConfidence':'Date not normalized in this release','region':'China','lat':None,'lng':None,'languages':['Classical Chinese'],'author':'Traditional or attributed authorship; see linked source metadata.','description':f'{title} ({chars}; {pinyin}) is cataloged within the {group} collection. The record distinguishes work identity from any particular witness or modern translation.','historicalContext':'School, community, period and canon context require source-specific interpretation; the broad China grouping is not used as a scholarly category.','manuscripts':'Witness metadata is not inferred from a digital transcription.','themes':[],'sourceStatus':'Public-domain Chinese transcription' if pg else 'Reviewed metadata only','copyright':'Project Gutenberg public-domain ebook (USA)' if pg else 'No text bundled; linked metadata only','sourceUrl':source,'metadataSources':[source],'editionId':f'pg-{pg}-{wid}' if pg else None,'confidence':'C' if pg else 'D'})
 # exactly one row per ID
 by={r['id']:r for r in rows}; rows=list(by.values())
 editions=[]; passages=[]
 for title,pg in SOURCES.items():
  wid=EXISTING.get(title,slug(title)); f=ROOT/f'data/public-domain/china/pg-{pg}.txt'; raw=f.read_text(encoding='utf-8-sig')
  a=raw.find('*** START OF THE PROJECT GUTENBERG EBOOK'); b=raw.find('*** END OF THE PROJECT GUTENBERG EBOOK'); body=raw[raw.find('\n',a)+1:b].strip() if a>=0 and b>a else raw
  blocks=[re.sub(r'\s*\n\s*',' ',x).strip() for x in re.split(r'\n\s*\n',body) if x.strip()]
  eid=f'pg-{pg}-{wid}'; rec=by[wid]
  editions.append({'id':eid,'textId':wid,'title':f"{rec['nativeTitle']} — Project Gutenberg Chinese transcription",'translator':'No translation bundled; Project Gutenberg transcription','sourceUrl':PG.format(pg),'downloadUrl':f'https://www.gutenberg.org/cache/epub/{pg}/pg{pg}.txt','sourceFile':f'china/pg-{pg}.txt','license':'Project Gutenberg License; Public domain in the USA','language':'Classical Chinese transcription','sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'passageCount':len(blocks),'complete':True,'note':'No translation is bundled. Chinese transcription as digitized by Project Gutenberg. Structural/editorial blocks remain Unknown; Chinese-script blocks are labeled Primary text without asserting witness-level fidelity.'})
  for i,x in enumerate(blocks):
   chinese=sum('\u3400'<=c<='\u9fff' for c in x)
   passages.append({'id':f'{eid}-{i+1}','textId':wid,'editionId':eid,'sequence':i+1,'reference':f'Edition block {i+1}','content':x,'sourceUrl':PG.format(pg),'themes':[],'contentType':'Primary text' if chinese>=10 else 'Unknown'})
 out=ROOT/'data/seed'; out.mkdir(exist_ok=True)
 additions={'records':rows,'originalTextWorks':[{'id':EXISTING.get(title,slug(title))} for title in SOURCES]}
 (out/'china-additions.json').write_text(json.dumps(additions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (out/'china-editions.json').write_text(json.dumps(editions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (out/'china-passages.json').write_text(json.dumps(passages,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f'{len(rows)} Chinese records, {len(editions)} editions, {len(passages)} blocks')
if __name__=='__main__':main()

