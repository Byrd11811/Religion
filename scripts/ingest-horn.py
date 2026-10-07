import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "data" / "seed"

EOTC_CANON = "https://www.ethiopianorthodox.org/english/canonical/books.html"
EOTC_LITERATURE = "https://www.ethiopianorthodox.org/english/ethiopian/literature.html"
EOTC_LITURGY = "https://www.ethiopianorthodox.org/english/church/divineliturgydoc.html"
HMML_NALE = "https://hmml.org/collections/repositories/ethiopia/national-archives-and-library-of-ethiopia/"
HMML_DAVIES = "https://hmml.org/collections/news/28-microfilms-of-the-donald-davies-microfilm-collection-are-now-active-in-reading-room/"
BL_GEEZ = "https://searcharchives.bl.uk/?f%5Blanguage_ssim%5D%5B%5D=Geez&f%5Bmaterial_type_si%5D%5B%5D=Archives+and+Manuscripts&f%5Burl_stub_si%5D%5B%5D=iiif.bl.uk&page=3&per_page=100&search_field=all_fields&sort=hierarchy"
BM_NUBIAN = "https://www.britishmuseum.org/collection/object/Y_EA71298"

GROUPS = {
    "Ethiopian Orthodox Tewahedo": EOTC_CANON,
    "Eritrean Orthodox Tewahedo": HMML_DAVIES,
    "Geʽez biblical and para-biblical heritage": EOTC_CANON,
    "Liturgy, hymnody and devotion": EOTC_LITURGY,
    "Gädl, historiography and commentary": EOTC_LITERATURE,
    "Beta Israel": HMML_NALE,
    "Horn of Africa Islamic manuscript traditions": HMML_NALE,
    "Coptic Christianity": EOTC_LITERATURE,
    "Old Nubian Christianity": BM_NUBIAN,
}

SPECS = [
    ("ethiopic-1-meqabyan", "First Book of Ethiopian Meqabyan", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-2-meqabyan", "Second Book of Ethiopian Meqabyan", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-3-meqabyan", "Third Book of Ethiopian Meqabyan", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-sinodos", "Ethiopic Sinodos", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-books-of-covenant", "Ethiopic Books of Covenant", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-clement", "Ethiopic Clement", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-didascalia", "Ethiopic Didascalia", "Ethiopian Orthodox Tewahedo"),
    ("sirate-tsion", "Sirate Tsion / Book of Order", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-tizaz", "Tizaz / Book of Herald", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-abtilis", "Abtilis", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-dominos-i", "First Book of Dominos", "Ethiopian Orthodox Tewahedo"),
    ("ethiopic-dominos-ii", "Second Book of Dominos", "Ethiopian Orthodox Tewahedo"),
    ("deggwa-saint-yared", "Deggwa of Saint Yared", "Liturgy, hymnody and devotion"),
    ("ethiopic-meeraf", "Məʾəraf", "Liturgy, hymnody and devotion"),
    ("ethiopic-zimare", "Zimare", "Liturgy, hymnody and devotion"),
    ("ethiopic-mawaset", "Mäwasəʾt", "Liturgy, hymnody and devotion"),
    ("ethiopic-qeddase", "Mäṣḥafä Qəddase / Ethiopian Missal", "Liturgy, hymnody and devotion"),
    ("ethiopic-synaxarium", "Ethiopic Synaxarium / Sənkəssar", "Liturgy, hymnody and devotion"),
    ("taamra-maryam", "Täʾammərä Maryam / Miracles of Mary", "Liturgy, hymnody and devotion"),
    ("gadla-takla-haymanot", "Gädlä Täklä Haymanot", "Gädl, historiography and commentary"),
    ("gadla-gabra-manfas-qeddus", "Gädlä Gäbrä Mänfäs Qəddus", "Gädl, historiography and commentary"),
    ("ethiopic-andemta", "Andəmta Commentary Tradition", "Gädl, historiography and commentary"),
    ("fetha-nagast", "Fətha Nägäśt / Law of the Kings", "Gädl, historiography and commentary"),
    ("mashafa-mestir", "Mäṣḥafä Məśṭir / Book of Mystery", "Gädl, historiography and commentary"),
    ("beta-israel-orit", "Beta Israel Orit", "Beta Israel"),
    ("teezaza-sanbat", "Täʾəzaza Sänbät / Commandments of the Sabbath", "Beta Israel"),
    ("beta-israel-ardeet", "Ardəʾət", "Beta Israel"),
    ("beta-israel-gadla-abraham", "Gädlä Abraham", "Beta Israel"),
    ("harari-manuscript-traditions", "Harari Islamic Manuscript Traditions", "Horn of Africa Islamic manuscript traditions"),
    ("somali-islamic-poetry", "Somali Islamic Devotional Poetry", "Horn of Africa Islamic manuscript traditions"),
    ("eritrean-arabic-islamic-manuscripts", "Eritrean Arabic Islamic Manuscript Traditions", "Horn of Africa Islamic manuscript traditions"),
    ("sahidic-biblical-tradition", "Sahidic Biblical Tradition", "Coptic Christianity"),
    ("bohairic-biblical-tradition", "Bohairic Biblical Tradition", "Coptic Christianity"),
    ("shenoute-corpus", "Shenoutean Corpus", "Coptic Christianity"),
    ("pachomian-rules-coptic", "Pachomian Rules and Instructions", "Coptic Christianity"),
    ("coptic-synaxarium", "Coptic Synaxarium", "Coptic Christianity"),
    ("old-nubian-biblical-translations", "Old Nubian Biblical Translations", "Old Nubian Christianity"),
    ("old-nubian-christian-literary-fragments", "Old Nubian Christian Literary Fragments", "Old Nubian Christianity"),
]

def record(work_id, title, group):
    source = GROUPS[group]
    distinction = ""
    if "meqabyan" in work_id:
        distinction = " This is an Ethiopian Meqabyan work record and is not identified with the Greek Maccabees records."
    return {
        "id": work_id, "title": title, "traditionId": "ethiopia-eritrea-horn",
        "tradition": "Ethiopia, Eritrea & the Horn", "category": group,
        "canonStatus": "Community-specific; consult the Canon tab and cited community source. No regional universal canon is implied.",
        "startDate": None, "endDate": None, "dateConfidence": "No normalized composition date asserted in this release",
        "region": "Ethiopia, Eritrea, Egypt, Sudan, or the Horn of Africa; see record scope",
        "lat": None, "lng": None, "languages": [],
        "author": "Authorship or attribution requires work-specific review",
        "description": f"{title} is cataloged in the {group} collection.{distinction}",
        "historicalContext": "The collection preserves community, language, work, edition, and physical witness as separate layers. Shared Geʽez heritage does not erase Ethiopian, Eritrean, Beta Israel, Islamic, Coptic, or Nubian identities.",
        "manuscripts": "Institutional collection evidence is linked where available; no witness is inferred from the existence of a work title.",
        "themes": [], "sourceStatus": "Reviewed institutional or community metadata; no source text bundled",
        "copyright": "Metadata only; edition and reproduction rights require separate review", "sourceUrl": source,
        "metadataSources": [source], "editionId": None, "confidence": "C", "subcollection": group,
    }

overrides = []
for work_id, group in [("kebra-nagast", "Gädl, historiography and commentary"), ("ethiopian-enoch-tradition", "Geʽez biblical and para-biblical heritage")]:
    source = BL_GEEZ if work_id == "kebra-nagast" else EOTC_LITERATURE
    overrides.append({"id": work_id, "traditionId": "ethiopia-eritrea-horn", "tradition": "Ethiopia, Eritrea & the Horn", "subcollection": group, "sourceStatus": "Reviewed institutional or community metadata; no source text bundled", "sourceUrl": source, "metadataSources": [source], "confidence": "B"})

canon = [
    {"id": "eotc-enoch", "workId": "1-enoch", "community": "Ethiopian Orthodox Tewahedo Church", "status": "Enumerated in the Old Testament list", "enumerationNotes": "The community source names Enoch; this does not make its status universal across Christian or Jewish communities.", "sourceUrl": EOTC_CANON},
    {"id": "eotc-jubilees", "workId": "jubilees", "community": "Ethiopian Orthodox Tewahedo Church", "status": "Enumerated in the Old Testament list", "enumerationNotes": "The community source names Jubilees (Kufale).", "sourceUrl": EOTC_CANON},
    {"id": "eotc-sinodos", "workId": "ethiopic-sinodos", "community": "Ethiopian Orthodox Tewahedo Church", "status": "Described as part of the Ethiopic New Testament", "enumerationNotes": "The source describes an eight-book Sinodos compilation; internal parts remain distinct from the catalog work record.", "sourceUrl": EOTC_CANON},
    {"id": "eotc-didascalia", "workId": "ethiopic-didascalia", "community": "Ethiopian Orthodox Tewahedo Church", "status": "Enumerated in the New Testament list", "enumerationNotes": "Community-specific enumeration.", "sourceUrl": EOTC_CANON},
    {"id": "eotc-clement", "workId": "ethiopic-clement", "community": "Ethiopian Orthodox Tewahedo Church", "status": "Enumerated in the New Testament list", "enumerationNotes": "The listed Ethiopic book is not silently equated with every work called Clement.", "sourceUrl": EOTC_CANON},
]

communities = [
    {"id": "ethiopian-orthodox-tewahedo", "name": "Ethiopian Orthodox Tewahedo Church", "relationship": "Independent church community", "sharedHeritage": "Geʽez liturgical and manuscript heritage", "sourceUrl": EOTC_CANON},
    {"id": "eritrean-orthodox-tewahedo", "name": "Eritrean Orthodox Tewahedo Church", "relationship": "Independent church community; canon details are not copied from the Ethiopian list", "sharedHeritage": "Geʽez liturgical and manuscript heritage; Eritrean witnesses are independently identified", "sourceUrl": HMML_DAVIES},
    {"id": "beta-israel", "name": "Beta Israel", "relationship": "Distinct Jewish community", "sharedHeritage": "Regional manuscript and language histories require source-specific study", "sourceUrl": HMML_NALE},
    {"id": "horn-islamic-traditions", "name": "Horn of Africa Islamic traditions", "relationship": "Multiple Arabic, Harari, Somali and local scholarly traditions", "sharedHeritage": "Repository-level metadata does not imply a single canon or institution", "sourceUrl": HMML_NALE},
    {"id": "coptic-christian-communities", "name": "Coptic Christian communities", "relationship": "Distinct Egyptian Christian traditions", "sharedHeritage": "Cross-regional transmission is modeled without absorption into Ethiopian Christianity", "sourceUrl": EOTC_LITERATURE},
    {"id": "old-nubian-christianity", "name": "Old Nubian Christianity", "relationship": "Historically distinct Nubian Christian traditions", "sharedHeritage": "Greek, Coptic and Old Nubian materials require witness-level evidence", "sourceUrl": BM_NUBIAN},
]

recensions = [
    {"id": "enoch-geez-textual-tradition", "workId": "1-enoch", "title": "Geʽez textual tradition of 1 Enoch", "description": "A textual-tradition record; it does not claim that a modern English edition is a Geʽez diplomatic witness.", "sources": [EOTC_LITERATURE], "evidence": "Securely attested"},
    {"id": "jubilees-geez-textual-tradition", "workId": "jubilees", "title": "Geʽez textual tradition of Jubilees", "description": "The community source states that the complete work was preserved in Ethiopic; individual witnesses require separate records.", "sources": [EOTC_CANON], "evidence": "Securely attested"},
]

bibliography = [{"id": f"bib-{i+1}", "workId": wid, "title": title, "sourceUrl": url, "reviewStatus": "Institutional/community source reviewed for collection scope"} for i,(wid,title,url) in enumerate([
    ("1-enoch", "Ethiopian Orthodox Tewahedo Church: literature", EOTC_LITERATURE),
    ("ethiopic-qeddase", "Ethiopian Orthodox Tewahedo Church: Divine Liturgy", EOTC_LITURGY),
    ("kebra-nagast", "British Library Geʽez manuscript catalogue", BL_GEEZ),
    ("old-nubian-biblical-translations", "British Museum EA71298", BM_NUBIAN),
])]

out = {"overrides": overrides, "records": [record(*spec) for spec in SPECS], "collectionWorkIds": ["1-enoch", "jubilees", "kebra-nagast", "ethiopian-enoch-tradition"] + [s[0] for s in SPECS], "canonMemberships": canon, "communities": communities, "recensions": recensions, "bibliographyWorks": [{"id": x["workId"]} for x in bibliography], "bibliography": bibliography}
(SEED / "horn-additions.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

archive = {"witnesses": [
    {"id":"bl-or-818-kebra-nagast","title":"Kebra Nagast, British Library Or 818","workIds":["kebra-nagast"],"recensionId":None,"type":"Codex","inventoryNumber":"Or 818","repository":"British Library","discoveryLocation":None,"currentLocation":"British Library","dateStart":1700,"dateEnd":1750,"dateNotes":"Catalogue date range for this physical manuscript, not the composition date of the Kebra Nagast.","material":None,"languages":["Geʽez"],"scripts":["Ethiopic"],"condition":None,"completeness":"191 folios; consult catalog for contents","provenance":"British Library archival catalogue record.","digitizationUrl":BL_GEEZ,"iiifManifest":None,"rights":"Institutional metadata only; reproduction rights require British Library review.","sources":[BL_GEEZ],"decipherment":"Readable edition available","evidence":"Securely attested","description":"Geʽez manuscript explicitly cataloged as Kebra Nagast, kept separate from modern editions.","access":"Public metadata"},
    {"id":"hmml-sep-davies-00006","title":"Dabra Bizan manuscript, SEP DAVIES 00006","workIds":[],"recensionId":None,"type":"Microfilmed manuscript","inventoryNumber":"SEP DAVIES 00006","repository":"HMML / source monastery Dabra Bizan","discoveryLocation":None,"currentLocation":"Source monastery in Eritrea; digital surrogate described by HMML","dateStart":None,"dateEnd":None,"dateNotes":"No date asserted from the collection announcement.","material":None,"languages":["Geʽez"],"scripts":["Ethiopic"],"condition":None,"completeness":None,"provenance":"HMML Donald Davies Microfilm Collection.","digitizationUrl":HMML_DAVIES,"iiifManifest":None,"rights":"HMML metadata link; surrogate access and reuse follow Reading Room terms.","sources":[HMML_DAVIES],"decipherment":"Not assessed","evidence":"Securely attested","description":"Eritrean manuscript witness independently identified by repository and project number; no work association inferred.","access":"Public metadata"},
    {"id":"hmml-sep-davies-00007","title":"Dabra Bizan manuscript, SEP DAVIES 00007","workIds":[],"recensionId":None,"type":"Microfilmed manuscript","inventoryNumber":"SEP DAVIES 00007","repository":"HMML / source monastery Dabra Bizan","discoveryLocation":None,"currentLocation":"Source monastery in Eritrea; digital surrogate described by HMML","dateStart":None,"dateEnd":None,"dateNotes":"No date asserted from the collection announcement.","material":None,"languages":["Geʽez"],"scripts":["Ethiopic"],"condition":None,"completeness":None,"provenance":"HMML Donald Davies Microfilm Collection.","digitizationUrl":HMML_DAVIES,"iiifManifest":None,"rights":"HMML metadata link; surrogate access and reuse follow Reading Room terms.","sources":[HMML_DAVIES],"decipherment":"Not assessed","evidence":"Securely attested","description":"A second independently identified Eritrean Dabra Bizan witness; no work association inferred.","access":"Public metadata"},
    {"id":"bm-ea71298-old-nubian-nt","title":"Old Nubian New Testament leaf, EA71298","workIds":["old-nubian-biblical-translations"],"recensionId":None,"type":"Parchment codex leaf","inventoryNumber":"EA71298","repository":"British Museum","discoveryLocation":"Qasr Ibrim, cathedral of St Mary the Virgin","currentLocation":"British Museum","dateStart":800,"dateEnd":999,"dateNotes":"Museum catalog dates the object to the ninth–tenth century.","material":"Parchment","languages":["Old Nubian"],"scripts":["Old Nubian"],"condition":"Incomplete page","completeness":"Single almost-complete parchment page","provenance":"Excavated at Qasr Ibrim and donated by the Egypt Exploration Society; consult museum record.","digitizationUrl":BM_NUBIAN,"iiifManifest":None,"rights":"British Museum collection metadata; image reuse follows the museum record.","sources":[BM_NUBIAN],"decipherment":"Readable edition available","evidence":"Securely attested","description":"Physical Old Nubian New Testament witness; a page is not represented as a complete biblical edition.","access":"Public metadata"}
],"artifacts":[],"images":[]}
(SEED / "horn-archive.json").write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(out['records'])} records, {len(canon)} canon memberships, {len(archive['witnesses'])} witnesses")
