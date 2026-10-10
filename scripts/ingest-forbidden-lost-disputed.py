import json
import pathlib


ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "seed" / "forbidden-lost-disputed.json"
REVIEWED_AT = "2026-10-10"


def source(source_id, label, url, kind, perspective):
    return {
        "id": source_id,
        "label": label,
        "url": url,
        "kind": kind,
        "perspective": perspective,
        "accessed": REVIEWED_AT,
    }


def base_record(
    record_id,
    title,
    collection,
    record_kind,
    traditions,
    regions,
    date_label,
    status_label,
    headline,
    summary,
    confidence,
    source_ids,
    *,
    rights_status="Metadata and original neutral summary only. Edition, translation, image, and facsimile rights require separate review.",
    cultural_restrictions=None,
    safety_notes=None,
):
    return {
        "id": record_id,
        "title": title,
        "collection": collection,
        "recordKind": record_kind,
        "traditions": traditions,
        "regions": regions,
        "dateLabel": date_label,
        "statusLabel": status_label,
        "headline": headline,
        "summary": summary,
        "confidence": confidence,
        "sourceIds": source_ids,
        "reviewedAt": REVIEWED_AT,
        "rightsStatus": rights_status,
        "culturalRestrictions": cultural_restrictions or [],
        "safetyNotes": safety_notes or [],
        "mayTranslate": False,
        "editions": [],
        "segments": [],
        "fullText": None,
    }


sources = [
    source("src-vatican-1616-index", "Vatican Observatory — Heliocentrism condemned in 1616", "https://www.vaticanobservatory.org/sacred-space-astronomy/heliocentrism-condemned-400-years-ago-on-march-5-2/", "Institutional historical transcription", "Catholic scientific and historical institution"),
    source("src-vatican-1966-index", "Congregation for the Doctrine of the Faith — Notification regarding the Index", "https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_con_cfaith_doc_19660614_de-indicis-libr-prohib_en.html", "Official notification", "Catholic institutional source"),
    source("src-cambridge-tyndale", "Cambridge University Library — The Bible in English", "https://wwwe.lib.cam.ac.uk/CUL/exhibitions/KJV/bibleinen.html", "Library exhibition", "Institutional history"),
    source("src-loc-tyndale", "Library of Congress — The English Bible before King James", "https://www.loc.gov/loc/lcib/9707/tyndale.html", "Library essay", "Institutional history"),
    source("src-ushmm-witnesses-germany", "United States Holocaust Memorial Museum — Jehovah's Witnesses in Germany", "https://encyclopedia.ushmm.org/content/en/article/jehovahs-witnesses-in-germany-from-the-1890s-to-the-1930s", "Museum encyclopedia", "Institutional historical synthesis"),
    source("src-loc-maya-destruction", "Library of Congress — Maya languages and religion", "https://www.loc.gov/exhibits/exploring-the-early-americas/languages-and-religion.html", "Library exhibition", "Institutional historical synthesis"),
    source("src-cecc-spiritual-movements-2010", "Congressional-Executive Commission on China — Policies toward spiritual movements", "https://www.cecc.gov/sites/evo-subsites/cecc.house.gov/files/documents/roundtables/2010/CECC%20Roundtable%20-%20China%27s%20Policies%20Toward%20Spiritual%20Movements%20-%206.18.10.pdf", "Government hearing record", "Government and witness testimony"),
    source("src-cecc-annual-2009", "Congressional-Executive Commission on China — 2009 Annual Report", "https://www.cecc.gov/publications/annual-reports/2009-annual-report", "Government report", "Government human-rights reporting"),
    source("src-sinaiticus-significance", "Codex Sinaiticus Project — Significance", "https://codexsinaiticus.org/en/codex/significance.aspx", "Manuscript project", "Institutional manuscript scholarship"),
    source("src-sefaria-hagigah-2-1", "Mishnah Hagigah 2:1", "https://www.sefaria.org/Mishnah_Chagigah.2.1?lang=bi", "Primary text edition", "Digital Jewish text library"),
    source("src-echr-blasphemy-case", "European Court of Human Rights archive — X Ltd and Y v United Kingdom", "https://hudoc.echr.coe.int/app/conversion/pdf/?filename=X.+Ltd.+and+Y.+v.+UNITED+KINGDOM.pdf&id=001-74315&library=ECHR", "Legal record", "International court archive"),
    source("src-uk-2008-act", "Criminal Justice and Immigration Act 2008", "https://www.legislation.gov.uk/ukpga/2008/4/pdfs/ukpga_20080004_en.pdf", "Primary legislation", "Official UK legislation"),
    source("src-cambridge-portugal-censorship", "Cambridge University Library — A revolutionary anthology in 1960s Portugal", "https://languagecollections-blog.lib.cam.ac.uk/2020/04/22/a-revolutionary-anthology-in-1960s-portugal/", "Library collection essay", "Institutional historical synthesis"),
    source("src-sefaria-numbers-21-14", "Numbers 21:14", "https://www.sefaria.org/Numbers.21.14?lang=bi", "Primary textual witness", "Digital Jewish text library"),
    source("src-sefaria-joshua-10-13", "Joshua 10:13", "https://www.sefaria.org/Joshua.10.13?lang=bi", "Primary textual witness", "Digital Jewish text library"),
    source("src-sefaria-2-samuel-1-18", "2 Samuel 1:18", "https://www.sefaria.org/II_Samuel.1.18?lang=bi", "Primary textual witness", "Digital Jewish text library"),
    source("src-nasscal-gospel-egyptians", "NASSCAL e-Clavis — Gospel of the Egyptians", "https://www.nasscal.com/e-clavis-christian-apocrypha/gospel-of-the-egyptians/", "Academic reference entry", "Scholarly Christian apocrypha project"),
    source("src-nasscal-gospel-ebionites", "NASSCAL e-Clavis — Gospel of the Ebionites", "https://www.nasscal.com/e-clavis-christian-apocrypha/gospel-of-the-ebionites/", "Academic reference entry", "Scholarly Christian apocrypha project"),
    source("src-iranica-cihrdad", "Encyclopaedia Iranica — Čihrdād Nask", "https://www.iranicaonline.org/articles/cihrdad-nask-one-of-the-lost-nasks-of-the-avesta-q/", "Academic encyclopedia", "Iranian studies scholarship"),
    source("src-iranica-arzang", "Encyclopaedia Iranica — Aržang", "https://www.iranicaonline.org/articles/arzang-mid/", "Academic encyclopedia", "Iranian studies scholarship"),
    source("src-iranica-book-giants", "Encyclopaedia Iranica — The Book of Giants", "https://www.iranicaonline.org/articles/giants-the-book-of/", "Academic encyclopedia", "Iranian studies scholarship"),
    source("src-iranica-berossus", "Encyclopaedia Iranica — Berossus", "https://www.iranicaonline.org/articles/berossus-babylonian-4th-3rd-century-priest-chronicler-whose-work-has-some-bearing-on-iranian-history/", "Academic encyclopedia", "Ancient Near Eastern scholarship"),
    source("src-wiley-berossus-transmission", "Berossus and Babylonian transmission", "https://onlinelibrary.wiley.com/doi/full/10.1111/j.2041-5370.2012.00041.x", "Peer-reviewed article", "Academic analysis"),
    source("src-nagoya-manetho", "Nagoya University repository — Manetho transmission study", "https://cir.nii.ac.jp/crid/1390022222475670912", "Academic article record", "University-hosted scholarship"),
    source("src-cambridge-orphic-rhapsodies", "Cambridge — A possible direct fragment of the Orphic Rhapsodies", "https://doi.org/10.1017/S175027052400006X", "Peer-reviewed article", "Classics scholarship"),
    source("src-cambridge-classic-music", "Early China — Who said there was a Classic of Music?", "https://www.cambridge.org/core/journals/early-china/article/abs/who-said-there-was-a-classic-of-music/A6D9D81606DBCF10101DC3E929E5DFB5", "Peer-reviewed article", "Early China scholarship"),
    source("src-cambridge-q", "Cambridge — The state of play for Q", "https://www.cambridge.org/core/books/abs/an-aramaic-approach-to-q/state-of-play/5274B39383585A4F13E5A695B72EF292", "Academic book chapter", "New Testament scholarship"),
    source("src-oxford-pentateuch", "Oxford Academic — Pentateuchal source models", "https://academic.oup.com/book/4657/chapter-abstract/146820100", "Academic book chapter", "Hebrew Bible scholarship"),
    source("src-oxford-deuteronomistic-encyclopedia", "Oxford Research Encyclopedia — Deuteronomistic History", "https://academic.oup.com/reference/62341/reference-article-abstract/561710003", "Academic reference article", "Hebrew Bible scholarship"),
    source("src-oxford-deuteronomistic-challenges", "Oxford Handbook — Challenges to the Deuteronomistic History model", "https://academic.oup.com/edited-volume/34226/chapter-abstract/290218228", "Academic book chapter", "Hebrew Bible scholarship"),
    source("src-oxford-pie-religion", "Oxford Academic — Proto-Indo-European religious reconstruction", "https://academic.oup.com/book/48521/chapter-abstract/422392689", "Academic book chapter", "Historical linguistics and religious studies"),
    source("src-iranica-indo-iranian-religion", "Encyclopaedia Iranica — Indo-Iranian religion", "https://www.iranicaonline.org/articles/indo-iranian-religion/", "Academic encyclopedia", "Iranian and Vedic studies"),
    source("src-oxford-rigvedic-oral", "Oxford Academic — Rigvedic oral composition", "https://academic.oup.com/book/33632/chapter-abstract/288152909", "Academic book chapter", "Vedic scholarship"),
    source("src-cambridge-gjw-forgery", "New Testament Studies — Textual evidence and the Gospel of Jesus' Wife", "https://doi.org/10.1017/S0028688515000077", "Peer-reviewed article", "Coptic and New Testament scholarship"),
    source("src-harvard-gjw-testing", "Harvard Gazette — Papyrus fragment put to test", "https://news.harvard.edu/gazette/story/2014/04/papyrus-fragment-put-to-test/", "University report", "Institutional report of material testing"),
    source("src-oxford-secret-mark", "Journal of Theological Studies — Secret Mark forgery argument", "https://academic.oup.com/jts/article-abstract/61/1/128/1674031", "Peer-reviewed article", "Early Christian scholarship"),
    source("src-yale-secret-mark", "Yale Scholarship Online — Secret Gospel of Mark reassessment", "https://academic.oup.com/yale-scholarship-online/book/51315", "Academic monograph", "Early Christian scholarship"),
    source("src-brill-oera-linda", "Fabula — Oera Linda analysis", "https://www.degruyterbrill.com/document/doi/10.1515/FABL.2007.019/html", "Peer-reviewed article", "Folklore scholarship"),
    source("src-groningen-oera-linda", "University of Groningen — Oera Linda provenance research", "https://research.rug.nl/en/publications/de-gemaskerde-god-francois-haver-schmidt-en-het-oera-linda-boek/", "University research record", "Historical and literary scholarship"),
    source("src-chicago-book-veles", "University of Chicago — The Book of Veles unearthed", "https://ahd.uchicago.edu/news/unearthed", "University expert interview", "Historical linguistics"),
    source("src-cambridge-book-veles", "Cambridge University Press — Slavic Native Faith and the Book of Veles", "https://www.cambridge.org/core/services/aop-cambridge-core/content/view/C6AC26C0A15F84A0D7D8243B60C362F7/9781009539593AR.pdf/slavic_native_faith.pdf", "Academic book extract", "Religious studies"),
    source("src-lds-kinderhook", "Church History Topics — Kinderhook Plates", "https://www.churchofjesuschrist.org/study/history/topics/kinderhook-plates?lang=eng", "Official institutional history", "Latter-day Saint institutional source"),
    source("src-byu-kinderhook", "BYU Religious Studies Center — Kinderhook Plates", "https://rsc.byu.edu/reason-faith/kinderhook-plates", "Academic institutional essay", "Latter-day Saint university scholarship"),
    source("src-tel-aviv-jehoash", "Tel Aviv — Jehoash inscription forgery evidence", "https://www.tandfonline.com/doi/abs/10.1179/tav.2004.2004.1.3", "Peer-reviewed article", "Epigraphy and archaeology"),
    source("src-jas-jehoash", "Journal of Archaeological Science — Jehoash inscription archaeometry", "https://www.sciencedirect.com/science/article/pii/S0305440308001404", "Peer-reviewed article", "Archaeometry"),
    source("src-latimes-jehoash-verdict", "Los Angeles Times — 2012 antiquities-forgery verdict", "https://www.latimes.com/archives/blogs/world-now/story/2012-03-14/israeli-antiquities-collectors-acquitted-of-ossuary-forgery", "Contemporary legal reporting", "Criminal-case outcome and evidentiary scope"),
    source("src-monash-shapira", "Monash University — The Valediction of Moses", "https://research.monash.edu/en/publications/the-valediction-of-moses-new-evidence-on-the-shapira-deuteronomy-/", "University research record", "Philological authenticity argument"),
    source("src-degruyter-shapira", "Zeitschrift für die Alttestamentliche Wissenschaft — Shapira orthography", "https://www.degruyterbrill.com/document/doi/10.1515/zaw-2021-2008/html", "Peer-reviewed article", "Hebrew philology"),
    source("src-peeters-shapira", "Peeters — Critical assessment of the Shapira strips", "https://poj.peeters-leuven.be/content.php?id=3289918&url=article", "Peer-reviewed article", "Hebrew Bible scholarship"),
    source("src-byu-salamander", "BYU Studies — Manuscripts, murder, and the Salamander Letter", "https://byustudies.byu.edu/article/manuscripts-murder-and-a-miniseries-a-personal-essay", "Academic institutional essay", "Historical and forensic synthesis"),
]


definitions = {
    "policy": "These are research records about restriction, survival, reconstruction, and authenticity. They are not catalog TextRecord editions. Atlas never fabricates missing passages, hypothetical quotations, or substitute artifacts, and it keeps physical evidence separate from claimed authorship and provenance.",
    "restrictionTypes": {
        "canon-excluded": "Outside a stated canon boundary; this alone is not a ban.",
        "ecclesiastically-prohibited": "Prohibited by a named religious authority in a documented place and period.",
        "state-banned": "Prohibited by a named government or state authority.",
        "censored": "Publication, import, circulation, or access was officially constrained.",
        "destroyed": "Copies or a corpus were deliberately destroyed by a documented authority or actor.",
        "restricted-to-qualified-audience": "Teaching or exposition was limited by audience qualification; this is not automatically a whole-work ban.",
        "blasphemy-restriction": "Restricted under a blasphemy rule or offense.",
        "obscenity-restriction": "Restricted under an obscenity or public-morals rule.",
        "political-religious-suppression": "Suppression combined political control with regulation of a religious community or practice.",
    },
    "survivalStatuses": {
        "LOST": "Known from references or quotations, but no direct manuscript of the work survives.",
        "INDIRECTLY_ATTESTED": "Known principally through another writer, catalog, epitome, or quotation chain.",
        "FRAGMENTARY": "Direct fragments survive; gaps must remain visible and cannot be filled as primary text.",
        "DISPUTED_LOST_WORK": "Later sources allege a lost work, but its earlier existence or form remains disputed.",
    },
    "authenticityStatuses": {
        "DEMONSTRATED_MODERN_FORGERY": "Evidence establishes modern creation despite an older attribution.",
        "DISPUTED_AUTHENTICITY": "Authenticity remains materially contested.",
        "MODERN_FORGERY_OR_HOAX": "Scholarship identifies a modern creation whose initial or later presentation involved hoax claims.",
        "MODERN_FORGERY": "Scholarship rejects the claimed antiquity and identifies modern manufacture.",
        "DEMONSTRATED_HOAX": "The makers or evidence establish deliberate deceptive manufacture.",
        "SUSPECTED_FORGERY_DISPUTED": "The majority view favors forgery, while a documented minority disputes that conclusion.",
    },
    "sourceChainStages": ["ORIGINAL", "COPY_OR_QUOTE", "TRANSLATION", "SECONDARY", "DERIVATIVE"],
    "truthfulnessRegressionCases": [
        {"headline": "Lost Work", "recordId": "lost-book-of-wars-of-yhwh", "rule": "Do not invent contents."},
        {"headline": "Fragmentary Text", "recordId": "fragmentary-mani-book-of-giants", "rule": "Do not fill gaps as primary text."},
        {"headline": "Hypothetical Q Source", "recordId": "hypothetical-q-source", "rule": "Do not invent a physical witness."},
        {"headline": "Disputed Forgery", "recordId": "forgery-gospel-of-jesus-wife", "rule": "Keep physical evidence separate from authorship claims."},
    ],
}


suppression_events = [
    {
        **base_record("forbidden-copernicus-de-revolutionibus-1616", "De revolutionibus orbium coelestium — 1616 restriction", "forbidden", "restriction-event", ["Christianity", "Catholic history", "history of science"], ["Rome", "Catholic jurisdictions"], "5 March 1616", "ECCLESIASTICALLY PROHIBITED UNTIL CORRECTED", "Ecclesiastical prohibition — historical restriction", "The Congregation of the Index suspended Copernicus's work until correction in the 1616 decree. The Index ceased to carry ecclesiastical-law force in 1966.", "high", ["src-vatican-1616-index", "src-vatican-1966-index"]),
        "restrictionTypes": ["ecclesiastically-prohibited", "censored"], "authority": "Sacred Congregation of the Index", "jurisdiction": "Rome and jurisdictions applying the Roman Index", "restrictionDate": "1616-03-05", "restrictionEnd": "The Index ceased to have the force of ecclesiastical law under the 14 June 1966 notification.", "reasonAsStated": "The decree treated the work's heliocentric teaching as contrary to Scripture and suspended it until correction.", "currentStatus": "No current Index prohibition with force of ecclesiastical law; the 1966 notification retained a general moral admonition concerning writings that endanger faith or morals.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("forbidden-foscarini-letter-1616", "Foscarini's Letter on the Pythagorean and Copernican Opinion — 1616 prohibition", "forbidden", "restriction-event", ["Christianity", "Catholic history", "history of science"], ["Rome", "Catholic jurisdictions"], "5 March 1616", "ECCLESIASTICALLY PROHIBITED", "Ecclesiastical prohibition — historical restriction", "The 1616 Index decree prohibited Paolo Antonio Foscarini's defense of reconciling Copernicanism with Scripture.", "high", ["src-vatican-1616-index", "src-vatican-1966-index"]),
        "restrictionTypes": ["ecclesiastically-prohibited"], "authority": "Sacred Congregation of the Index", "jurisdiction": "Rome and jurisdictions applying the Roman Index", "restrictionDate": "1616-03-05", "restrictionEnd": "The Index ceased to have the force of ecclesiastical law under the 14 June 1966 notification.", "reasonAsStated": "The decree prohibited Foscarini's work in the context of judging heliocentric claims contrary to Scripture.", "currentStatus": "Historical prohibition; no current Index prohibition with force of ecclesiastical law.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("forbidden-tyndale-new-testament-1526", "Tyndale New Testament — suppression and destruction", "forbidden", "restriction-event", ["Christianity", "Reformation"], ["England", "Worms"], "From 1526", "TRANSLATION SUPPRESSED AND COPIES BURNED", "Banned translation — copies were destroyed", "Tyndale's English New Testament was printed abroad, smuggled into England, officially suppressed, and publicly burned; only a small number of copies of the first edition survive.", "high", ["src-cambridge-tyndale", "src-loc-tyndale"]),
        "restrictionTypes": ["ecclesiastically-prohibited", "censored", "destroyed"], "authority": "English ecclesiastical and royal authorities", "jurisdiction": "England", "restrictionDate": "1526 onward", "restrictionEnd": "Historical and inactive; later English Bible publication followed different legal and ecclesiastical regimes.", "reasonAsStated": "An unauthorized vernacular translation was treated as religiously and politically impermissible.", "currentStatus": "Historical suppression only; surviving copies are held and displayed by research libraries.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("forbidden-watchtower-golden-age-germany-1933", "Watchtower and Golden Age literature — German bans and seizures", "forbidden", "restriction-event", ["Jehovah's Witnesses", "Christianity"], ["Germany"], "1933", "STATE BANS AND SEIZURES", "Political-religious suppression by state authorities", "German jurisdictions and Nazi authorities banned organizations and seized Jehovah's Witness literature as pressure intensified in 1933.", "high", ["src-ushmm-witnesses-germany"]),
        "restrictionTypes": ["state-banned", "censored", "political-religious-suppression"], "authority": "German state and Nazi authorities, with measures varying by jurisdiction", "jurisdiction": "Germany", "restrictionDate": "1933", "restrictionEnd": "Historical Nazi-era suppression; no current German restriction is asserted by this record.", "reasonAsStated": "Authorities portrayed proselytizing and refusal of state loyalty, military service, or Nazi practices as subversive.", "currentStatus": "Historical suppression record; current access is outside the scope of the cited historical source.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("destroyed-maya-books-yucatan-1562", "Maya books destroyed in Yucatán under Diego de Landa", "forbidden", "destruction-event", ["Maya religions", "Indigenous traditions"], ["Yucatán"], "From 1562", "CORPUS DESTRUCTION", "Destroyed corpus — surviving contents cannot be invented", "Library of Congress reporting describes Diego de Landa's destruction of Maya books in Yucatán beginning in 1562. This is a corpus-level event, not an invented title, a more precise location claim, or a claim that all Maya books were destroyed.", "high", ["src-loc-maya-destruction"], cultural_restrictions=["Treat Maya knowledge as living cultural heritage and do not synthesize replacement books."], safety_notes=["Colonial descriptions such as 'devil worship' are attributed to suppressors, not adopted as neutral descriptions."]),
        "restrictionTypes": ["destroyed", "political-religious-suppression"], "authority": "Diego de Landa and Franciscan authorities", "jurisdiction": "Yucatán; the cited source does not establish a more precise event location", "restrictionDate": "From 1562", "restrictionEnd": "The destruction is irreversible; this record does not assert a continuing legal ban.", "reasonAsStated": "The suppressors characterized Maya religious books and practices as idolatrous or demonic.", "currentStatus": "Historical destruction event; surviving Maya manuscripts and living traditions must be documented independently.", "isCanonExcluded": False, "isBanned": False,
    },
    {
        **base_record("forbidden-zhuan-falun-china-1996", "Zhuan Falun — PRC publication restriction", "forbidden", "restriction-event", ["Falun Gong", "Falun Dafa"], ["China"], "1996; later controls documented through 2009", "STATE CENSORSHIP AND POLITICAL-RELIGIOUS SUPPRESSION", "State restriction — current status bounded by source dates", "Commission testimony reports that Zhuan Falun was taken out of print in 1996; later government reporting documents confiscation and suppression of Falun Gong materials.", "medium", ["src-cecc-spiritual-movements-2010", "src-cecc-annual-2009"], rights_status="Copyrighted modern work. Metadata and outbound evidence links only; no full text or extended excerpts.", safety_notes=["Claims are attributed to their government or witness source and are not silently updated beyond the source period."]),
        "restrictionTypes": ["state-banned", "censored", "political-religious-suppression"], "authority": "People's Republic of China publishing and security authorities", "jurisdiction": "China", "restrictionDate": "1996; expanded suppression documented after 1999", "restrictionEnd": "Not established by the cited sources.", "reasonAsStated": "Official action formed part of broader state control of Falun Gong publication and practice; exact rationales vary by order and source.", "currentStatus": "Restrictions are documented through the latest cited historical reporting; post-2009 legal status is not independently verified in this record.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("canon-shepherd-of-hermas-sinaiticus", "Shepherd of Hermas in Codex Sinaiticus", "forbidden", "canon-boundary", ["Christianity", "early Christianity"], ["Eastern Mediterranean"], "Fourth-century manuscript witness", "CANON BOUNDARY — NOT A BAN", "Canon boundary — not a ban", "Codex Sinaiticus preserves the Shepherd after the New Testament sequence, evidence of early collection boundaries and use. Canon status must be stated by community and period; exclusion from a later canon is not prohibition.", "high", ["src-sinaiticus-significance"]),
        "restrictionTypes": ["canon-excluded"], "authority": "No banning authority; the Codex Sinaiticus manuscript arrangement is the evidence", "jurisdiction": "Specific fourth-century manuscript context; later canon boundaries vary by community", "restrictionDate": "Fourth century manuscript context; no prohibition date", "restrictionEnd": "Not applicable", "reasonAsStated": "No prohibition reason exists; this is a canon-boundary control record.", "currentStatus": "Not treated as a ban. Present-day canonical reception must be described tradition by tradition.", "isCanonExcluded": True, "isBanned": False,
    },
    {
        **base_record("restricted-chariot-and-creation-exposition-hagigah", "Mishnah Hagigah 2:1 — audience limits on exposition", "forbidden", "audience-restriction", ["Judaism", "rabbinic literature"], ["Land of Israel"], "Mishnah compiled around the early third century CE", "AUDIENCE-RESTRICTED TEACHING — NOT A BOOK BAN", "Qualified-audience restriction — possession is not prohibited", "Mishnah Hagigah 2:1 limits exposition of creation and chariot subjects according to audience and qualification. It does not prohibit possessing or reading the Mishnah as a whole.", "high", ["src-sefaria-hagigah-2-1"], cultural_restrictions=["Do not generalize this historical textual rule into a uniform present-day Jewish access policy."]),
        "restrictionTypes": ["restricted-to-qualified-audience"], "authority": "Rabbinic norm recorded in Mishnah Hagigah 2:1", "jurisdiction": "Rabbinic teaching context represented by the Mishnah", "restrictionDate": "Mishnaic period; the passage does not supply a modern enforcement date", "restrictionEnd": "Current application varies and is not established by this record.", "reasonAsStated": "The passage ties exposition of specified subjects to audience size and demonstrated understanding.", "currentStatus": "Historical teaching restriction; not a whole-work ban and not a claim of universal current practice.", "isCanonExcluded": False, "isBanned": False,
    },
    {
        **base_record("forbidden-love-that-dares-to-speak-1977", "The Love That Dares to Speak Its Name — blasphemous-libel prosecution", "forbidden", "restriction-event", ["religion and law", "Christian cultural history"], ["England and Wales"], "1977 conviction; offense abolished in 2008", "BLASPHEMY RESTRICTION — OFFENSE ABOLISHED", "Blasphemy prosecution — historical legal restriction", "Publication of James Kirkup's poem led to a blasphemous-libel conviction. The common-law offenses of blasphemy and blasphemous libel were abolished in England and Wales in 2008.", "high", ["src-echr-blasphemy-case", "src-uk-2008-act"], rights_status="Copyrighted modern poem. Metadata and legal history only; the poem is not reproduced.", safety_notes=["Do not reproduce sexually explicit text in summaries or search snippets."]),
        "restrictionTypes": ["blasphemy-restriction", "censored"], "authority": "English criminal courts; conviction followed a private prosecution", "jurisdiction": "England and Wales", "restrictionDate": "1977 conviction and subsequent appeals", "restrictionEnd": "2008 abolition of the common-law offenses", "reasonAsStated": "Publication was prosecuted as blasphemous libel under the law then in force.", "currentStatus": "The relevant common-law offenses were abolished in England and Wales in 2008.", "isCanonExcluded": False, "isBanned": True,
    },
    {
        **base_record("forbidden-kama-sutra-portugal-1965", "Kama Sutra — 1965 Portuguese censorship episode", "forbidden", "restriction-event", ["South Asian literature", "history of sexuality", "Hindu cultural history"], ["Portugal"], "1965", "OBSCENITY RESTRICTION", "Obscenity restriction — exact rescission date unverified", "Cambridge University Library records that a Portuguese edition of the Kama Sutra was swiftly banned under the Estado Novo censorship environment in 1965.", "medium", ["src-cambridge-portugal-censorship"], safety_notes=["Treat the work as a Sanskrit cultural and literary text; do not automatically label it scripture."]),
        "restrictionTypes": ["obscenity-restriction", "censored"], "authority": "Estado Novo censorship apparatus; the cited source does not identify the precise order-issuing office", "jurisdiction": "Portugal", "restrictionDate": "1965", "restrictionEnd": "Exact rescission date not established by the cited source.", "reasonAsStated": "The episode occurred within state censorship of erotic or allegedly pornographic publication.", "currentStatus": "Historical restriction; exact rescission date remains unverified in this record.", "isCanonExcluded": False, "isBanned": True,
    },
]

for event in suppression_events:
    event["restrictionType"] = event["restrictionTypes"][0]
    event["isLegallyOrInstitutionallyProhibited"] = event["isBanned"]


def chain(stage, label, source_id=None, independence_group=None, *, node_id=None, derived_from=None):
    row = {"stage": stage, "label": label}
    if source_id:
        row["sourceId"] = source_id
    if independence_group:
        row["independenceGroup"] = independence_group
    if node_id:
        row["nodeId"] = node_id
    if derived_from:
        row["derivedFrom"] = derived_from
    return row


lost_works = [
    {
        **base_record("lost-book-of-wars-of-yhwh", "Book of the Wars of YHWH", "lost", "lost-work", ["ancient Israelite literature", "Hebrew Bible"], ["ancient Levant"], "Attested in Numbers 21:14; composition date not independently established", "LOST", "Lost Work", "Numbers refers to a Book of the Wars of YHWH, but no direct manuscript or complete text survives. Atlas records only the attestation and does not infer the work's scope.", "high", ["src-sefaria-numbers-21-14"]),
        "survivalStatus": "LOST", "attestationType": "named reference in another work", "earliestAttestation": "Numbers 21:14 is the surviving textual attestation used here; this record does not assign a date to the lost work.", "attestingSourceIds": ["src-sefaria-numbers-21-14"], "survivingMaterial": "A title/reference and the bounded material present in Numbers 21:14; no continuous manuscript of the cited work.", "reconstructionLevel": "title-only", "sourceChain": [chain("ORIGINAL", "Book of the Wars of YHWH — lost"), chain("COPY_OR_QUOTE", "Reference preserved in Numbers 21:14", "src-sefaria-numbers-21-14", "numbers-witness")], "fragmentCitations": [], "hasCompleteText": False,
    },
    {
        **base_record("lost-book-of-jashar", "Book of Jashar", "lost", "lost-work", ["ancient Israelite literature", "Hebrew Bible"], ["ancient Levant"], "Attested in Joshua 10:13 and 2 Samuel 1:18", "LOST", "Lost work with bounded scriptural attestations", "Joshua and 2 Samuel name a Book of Jashar. The cited passages may preserve material associated with it, but no complete manuscript survives and the original order and extent cannot be recovered.", "high", ["src-sefaria-joshua-10-13", "src-sefaria-2-samuel-1-18"]),
        "survivalStatus": "LOST", "attestationType": "named references with possible embedded quotations", "earliestAttestation": "The surviving witnesses used here are Joshua 10:13 and 2 Samuel 1:18; this record does not impose a date on the lost compilation.", "attestingSourceIds": ["src-sefaria-joshua-10-13", "src-sefaria-2-samuel-1-18"], "survivingMaterial": "Two named references and bounded passages associated with the work; no continuous Book of Jashar manuscript.", "reconstructionLevel": "quoted-fragments", "sourceChain": [chain("ORIGINAL", "Book of Jashar — lost"), chain("COPY_OR_QUOTE", "Reference in Joshua 10:13", "src-sefaria-joshua-10-13", "joshua-witness"), chain("COPY_OR_QUOTE", "Reference in 2 Samuel 1:18", "src-sefaria-2-samuel-1-18", "samuel-witness")], "fragmentCitations": [{"sourceId": "src-sefaria-joshua-10-13", "locator": "Joshua 10:13", "note": "Bounded scriptural attestation; attribution of adjacent wording remains explicit."}, {"sourceId": "src-sefaria-2-samuel-1-18", "locator": "2 Samuel 1:18", "note": "Bounded scriptural attestation; no expanded reconstruction."}], "hasCompleteText": False,
    },
    {
        **base_record("lost-gospel-of-the-egyptians", "Gospel of the Egyptians", "lost", "indirectly-attested-work", ["early Christianity", "Christian apocrypha"], ["Egypt", "Mediterranean world"], "Attested by Clement of Alexandria and later writers", "INDIRECTLY ATTESTED", "Patristic quotations survive; no continuous gospel manuscript", "The Gospel of the Egyptians is known through quotations and reports in Clement of Alexandria and later sources. Their sequence cannot be expanded into a continuous gospel.", "medium", ["src-nasscal-gospel-egyptians"]),
        "survivalStatus": "INDIRECTLY_ATTESTED", "attestationType": "patristic quotation and report", "earliestAttestation": "Clement of Alexandria provides the earliest attestations summarized by the cited scholarly record.", "attestingSourceIds": ["src-nasscal-gospel-egyptians"], "survivingMaterial": "Attributed quotations and reports; no continuous manuscript.", "reconstructionLevel": "quoted-fragments", "sourceChain": [chain("ORIGINAL", "Gospel of the Egyptians — lost"), chain("COPY_OR_QUOTE", "Clement and later patristic quotations", "src-nasscal-gospel-egyptians", "patristic-transmission"), chain("SECONDARY", "NASSCAL e-Clavis synthesis", "src-nasscal-gospel-egyptians", "nasscal")], "fragmentCitations": [{"sourceId": "src-nasscal-gospel-egyptians", "locator": "Witness and contents sections", "note": "Use only quotations explicitly assigned and cited by the scholarly entry."}], "hasCompleteText": False,
    },
    {
        **base_record("indirect-gospel-of-the-ebionites", "Gospel of the Ebionites", "lost", "indirectly-attested-work", ["early Christianity", "Jewish Christianity", "Christian apocrypha"], ["eastern Mediterranean"], "Fragments assigned from Epiphanius's fourth-century Panarion", "INDIRECTLY ATTESTED — MODERN SCHOLARLY TITLE", "Seven conventionally assigned fragments; grouping remains qualified", "The title is a modern scholarly label for seven passages assigned from Epiphanius. Whether they belonged to one work and whether its users called themselves Ebionites remain open questions.", "contested", ["src-nasscal-gospel-ebionites"]),
        "survivalStatus": "INDIRECTLY_ATTESTED", "attestationType": "hostile heresiological quotation and report", "earliestAttestation": "Epiphanius's Panarion is the witness from which the seven conventionally assigned fragments are drawn.", "attestingSourceIds": ["src-nasscal-gospel-ebionites"], "survivingMaterial": "Seven passages conventionally grouped by modern scholars; no direct manuscript and no securely attested ancient title.", "reconstructionLevel": "quoted-fragments", "sourceChain": [chain("ORIGINAL", "Proposed source text — lost and ancient title unknown"), chain("COPY_OR_QUOTE", "Epiphanius's quotations and reports", "src-nasscal-gospel-ebionites", "epiphanius-witness"), chain("SECONDARY", "Modern grouping under Gospel of the Ebionites", "src-nasscal-gospel-ebionites", "nasscal")], "fragmentCitations": [{"sourceId": "src-nasscal-gospel-ebionites", "locator": "Seven-fragment inventory", "note": "Keep the modern grouping and hostile-witness limitation visible."}], "hasCompleteText": False,
    },
    {
        **base_record("lost-cihrdad-nask", "Čihrdād Nask", "lost", "lost-work", ["Zoroastrianism", "Avestan literature"], ["Iran"], "Known through the medieval Dēnkard's summary of a lost Avestan nask", "LOST — LATER OUTLINE SURVIVES", "Lost Avestan nask summarized by a later source", "The Čihrdād Nask is known through later listing and summary, especially Dēnkard VIII. No direct Avestan text securely survives.", "medium", ["src-iranica-cihrdad"]),
        "survivalStatus": "LOST", "attestationType": "later catalog and summary", "earliestAttestation": "The Dēnkard summary is the attesting source used by the cited Iranica entry; the record does not equate its date with the lost nask's composition.", "attestingSourceIds": ["src-iranica-cihrdad"], "survivingMaterial": "Later outline and description; no direct Avestan manuscript securely identified.", "reconstructionLevel": "outline", "sourceChain": [chain("ORIGINAL", "Čihrdād Nask — lost"), chain("COPY_OR_QUOTE", "Dēnkard VIII summary"), chain("SECONDARY", "Encyclopaedia Iranica synthesis", "src-iranica-cihrdad", "iranica")], "fragmentCitations": [], "hasCompleteText": False,
    },
    {
        **base_record("lost-mani-arzhang", "Mani's Aržang", "lost", "lost-work", ["Manichaeism"], ["Iran", "Central Asia"], "Third-century work known through Manichaean and later reports", "LOST ILLUSTRATED WORK — COMMENTARY FRAGMENTS SURVIVE", "Lost images must not be synthetically replaced", "The illustrated Aržang attributed to Mani is lost. Reports and Parthian commentary fragments inform its history, but they do not permit reconstruction of the original image sequence.", "medium", ["src-iranica-arzang"], cultural_restrictions=["Do not generate replacement sacred illustrations or present modern imagery as Mani's lost originals."]),
        "survivalStatus": "LOST", "attestationType": "later reports with commentary fragments", "earliestAttestation": "Manichaean and later reports summarized in the cited reference; individual witness dates must remain source-specific.", "attestingSourceIds": ["src-iranica-arzang"], "survivingMaterial": "Parthian commentary fragments and later descriptions; the original drawings do not survive.", "reconstructionLevel": "outline", "sourceChain": [chain("ORIGINAL", "Mani's illustrated Aržang — lost"), chain("COPY_OR_QUOTE", "Parthian commentary fragments and later reports", "src-iranica-arzang", "arzang-transmission"), chain("SECONDARY", "Encyclopaedia Iranica synthesis", "src-iranica-arzang", "iranica")], "fragmentCitations": [], "hasCompleteText": False,
    },
    {
        **base_record("fragmentary-mani-book-of-giants", "Manichaean Book of Giants", "lost", "fragmentary-work", ["Manichaeism"], ["Iran", "Central Asia"], "Third-century composition; fragments survive in several Central Asian languages", "FRAGMENTARY", "Fragmentary Text", "The original Aramaic form does not survive as a complete manuscript, but direct fragments in Middle Persian, Sogdian, and Old Turkic preserve portions of the Manichaean work.", "high", ["src-iranica-book-giants"]),
        "survivalStatus": "FRAGMENTARY", "attestationType": "direct multilingual fragments and indirect attestations", "earliestAttestation": "The work belongs to Mani's scriptural corpus; surviving witnesses and lists are described individually in the cited reference.", "attestingSourceIds": ["src-iranica-book-giants"], "survivingMaterial": "Direct Middle Persian, Sogdian, and Old Turkic fragments, plus quotations or allusions; no complete original Aramaic text.", "reconstructionLevel": "direct-fragments", "sourceChain": [chain("ORIGINAL", "Aramaic Book of Giants attributed to Mani — original form lost"), chain("TRANSLATION", "Middle Persian, Sogdian, and Old Turkic fragmentary witnesses", "src-iranica-book-giants", "central-asian-fragments"), chain("SECONDARY", "Encyclopaedia Iranica synthesis", "src-iranica-book-giants", "iranica")], "fragmentCitations": [{"sourceId": "src-iranica-book-giants", "locator": "Fragment and language inventory", "note": "Only directly identified fragments may be displayed; lacunae remain visible."}], "hasCompleteText": False,
    },
    {
        **base_record("lost-berossus-babyloniaca", "Berossus's Babyloniaca", "lost", "indirectly-attested-work", ["Babylonian religion", "Hellenistic historiography"], ["Babylonia", "Hellenistic Mediterranean"], "Composed in the early Hellenistic period; preserved through later quotation chains", "INDIRECTLY ATTESTED — DERIVATIVE SOURCE CHAIN", "Indirect witnesses are not independent copies", "Berossus's original work is lost. Material reaches modern scholarship through authors and epitomes including Alexander Polyhistor, Josephus, Abydenus, and Eusebius, with possible alteration at successive stages.", "medium", ["src-iranica-berossus", "src-wiley-berossus-transmission"]),
        "survivalStatus": "INDIRECTLY_ATTESTED", "attestationType": "branched quotation, epitome, and derivative transmission", "earliestAttestation": "Hellenistic work known through later authors; each transmitted passage requires its own chain.", "attestingSourceIds": ["src-iranica-berossus", "src-wiley-berossus-transmission"], "survivingMaterial": "Quoted and epitomized material only; no original manuscript.", "reconstructionLevel": "quoted-fragments", "sourceChain": [
            chain("ORIGINAL", "Berossus, Babyloniaca — lost", node_id="berossus-original"),
            chain("COPY_OR_QUOTE", "Alexander Polyhistor's epitome — itself lost and known through later witnesses", "src-iranica-berossus", "polyhistor-dependent", node_id="polyhistor-epitome", derived_from=["berossus-original"]),
            chain("DERIVATIVE", "Josephus preserves material attributed through Alexander Polyhistor", "src-iranica-berossus", "polyhistor-dependent", node_id="josephus-witness", derived_from=["polyhistor-epitome"]),
            chain("DERIVATIVE", "Abydenus adapts Alexander Polyhistor's account rather than independently witnessing Berossus", "src-iranica-berossus", "polyhistor-dependent", node_id="abydenus-witness", derived_from=["polyhistor-epitome"]),
            chain("DERIVATIVE", "Eusebius preserves extracts from Polyhistor and from Abydenus's later adaptation", "src-iranica-berossus", "eusebius-preservation", node_id="eusebius-witness", derived_from=["polyhistor-epitome", "abydenus-witness"]),
            chain("SECONDARY", "Modern critical analysis compares these dependent and branching witnesses", "src-wiley-berossus-transmission", node_id="modern-analysis", derived_from=["josephus-witness", "eusebius-witness"]),
        ], "fragmentCitations": [{"sourceId": "src-iranica-berossus", "locator": "Transmission and fragments discussion", "note": "Record the immediate quoting author and dependency chain for every displayed fragment."}], "hasCompleteText": False,
    },
    {
        **base_record("lost-manetho-aegyptiaca", "Manetho's Aegyptiaca", "lost", "indirectly-attested-work", ["ancient Egyptian religion", "Hellenistic historiography"], ["Ptolemaic Egypt", "Mediterranean world"], "Ptolemaic-period work transmitted through later citations and epitomes", "INDIRECTLY ATTESTED", "Later citations preserve material, not Manetho's complete wording", "Manetho's Egyptian history does not survive as an original continuous text. Later Jewish and Christian citations and epitomes transmit material with varying fidelity.", "medium", ["src-nagoya-manetho"]),
        "survivalStatus": "INDIRECTLY_ATTESTED", "attestationType": "later citation and epitome", "earliestAttestation": "The Ptolemaic work is known through later transmitters discussed in the cited academic study.", "attestingSourceIds": ["src-nagoya-manetho"], "survivingMaterial": "Citations, epitomes, and king-list material; no original continuous manuscript.", "reconstructionLevel": "quoted-fragments", "sourceChain": [chain("ORIGINAL", "Manetho, Aegyptiaca — lost"), chain("COPY_OR_QUOTE", "Later Jewish and Christian citations and epitomes", "src-nagoya-manetho", "manetho-transmission"), chain("SECONDARY", "Modern critical reconstruction", "src-nagoya-manetho", "modern-scholarship")], "fragmentCitations": [{"sourceId": "src-nagoya-manetho", "locator": "Transmission analysis", "note": "Do not flatten conflicting epitomes into a single original reading."}], "hasCompleteText": False,
    },
    {
        **base_record("fragmentary-orphic-rhapsodies", "Orphic Rhapsodies", "lost", "fragmentary-work", ["Orphism", "ancient Greek religion"], ["eastern Mediterranean", "Sinai"], "Known principally through late antique indirect tradition; a Sinai fragment has been proposed", "FRAGMENTARY / RECONSTRUCTED", "Possible direct fragment — attribution remains qualified", "The twenty-four-book Orphic Rhapsodies are known from extensive indirect tradition. A Sinai palimpsest has been argued to preserve a direct fragment, but that association must remain explicit and qualified.", "contested", ["src-cambridge-orphic-rhapsodies"]),
        "survivalStatus": "FRAGMENTARY", "attestationType": "indirect quotation tradition and proposed direct palimpsest fragment", "earliestAttestation": "Late antique witnesses preserve the indirect tradition; the cited article evaluates the proposed Sinai fragment.", "attestingSourceIds": ["src-cambridge-orphic-rhapsodies"], "survivingMaterial": "Extensive indirect quotations plus a proposed direct fragment whose relationship is argued rather than certain.", "reconstructionLevel": "partial-text", "sourceChain": [chain("ORIGINAL", "Orphic Rhapsodies — no complete original manuscript"), chain("COPY_OR_QUOTE", "Late antique indirect quotations", "src-cambridge-orphic-rhapsodies", "late-antique-witnesses"), chain("COPY_OR_QUOTE", "Proposed Sinai palimpsest fragment", "src-cambridge-orphic-rhapsodies", "sinai-fragment"), chain("SECONDARY", "Modern reconstruction and attribution", "src-cambridge-orphic-rhapsodies", "modern-scholarship")], "fragmentCitations": [{"sourceId": "src-cambridge-orphic-rhapsodies", "locator": "Palimpsest analysis", "note": "Label the direct-fragment identification as proposed, not established."}], "hasCompleteText": False,
    },
    {
        **base_record("alleged-lost-classic-of-music", "Alleged Classic of Music", "lost", "disputed-lost-work", ["early Chinese thought", "Confucian textual tradition"], ["China"], "Explicit lost-classic claims appear much later than the proposed pre-Qin work", "DISPUTED LOST WORK", "Alleged lost work — earlier existence is not established", "Later tradition speaks of a lost Classic of Music, but the cited scholarship finds no convincing pre-Qin evidence for a separate classic and dates explicit lost-work claims much later.", "low", ["src-cambridge-classic-music"]),
        "survivalStatus": "DISPUTED_LOST_WORK", "attestationType": "late retrospective claim", "earliestAttestation": "The cited study places explicit claims of a lost Classic of Music in the late Six Dynasties rather than the pre-Qin period.", "attestingSourceIds": ["src-cambridge-classic-music"], "survivingMaterial": "No securely identified physical witness or quotation corpus from the alleged early book.", "reconstructionLevel": "none", "sourceChain": [chain("ORIGINAL", "Proposed pre-Qin Classic of Music — existence disputed"), chain("DERIVATIVE", "Late retrospective lost-work tradition", "src-cambridge-classic-music", "late-tradition"), chain("SECONDARY", "Modern critical reassessment", "src-cambridge-classic-music", "modern-scholarship")], "fragmentCitations": [], "hasCompleteText": False,
    },
]

for work_record in lost_works:
    work_record["attestingSources"] = work_record["attestingSourceIds"]


def hypothesis(
    record_id,
    title,
    record_kind,
    traditions,
    regions,
    date_label,
    status_label,
    headline,
    summary,
    confidence,
    source_ids,
    hypothesis_type,
    proposed_entity,
    arguments_for,
    arguments_against,
    current_assessment,
    model_boundary,
):
    return {
        **base_record(record_id, title, "hypothetical", record_kind, traditions, regions, date_label, status_label, headline, summary, confidence, source_ids),
        "hypothesisType": hypothesis_type,
        "proposedEntity": proposed_entity,
        "argumentsFor": arguments_for,
        "argumentsAgainst": arguments_against,
        "physicalWitness": None,
        "quotations": [],
        "quotationPolicy": "none",
        "currentAssessment": current_assessment,
        "modelBoundary": model_boundary,
    }


hypothetical_sources = [
    hypothesis("hypothetical-q-source", "Q source", "hypothetical-source", ["early Christianity", "New Testament studies"], ["eastern Mediterranean"], "Modern scholarly hypothesis concerning first-century Gospel relationships", "HYPOTHETICAL", "Hypothetical Q Source", "Q is a scholarly source hypothesis used to explain material shared by Matthew and Luke but absent from Mark. No Q manuscript has been found.", "contested", ["src-cambridge-q"], "literary-source hypothesis", "A proposed sayings or source collection used in the composition of Matthew and Luke", ["Substantial shared Matthew-Luke material is absent from Mark.", "Patterns of wording and sequence can be modeled through a shared source."], ["Direct literary dependence models can explain the same data without Q.", "There is no physical witness and no universally agreed reconstruction."], "Q remains influential but contested; reconstructions are models of Gospel relationships, not recovered documents.", "Never create a manuscript, inventory number, edition, quotation, or first-person voice for Q."),
    hypothesis("reconstructed-pentateuchal-source-models", "Pentateuchal source models", "reconstructed-source-family", ["Judaism", "Hebrew Bible studies"], ["ancient Levant"], "Modern models of ancient composition", "RECONSTRUCTED MODEL FAMILY", "Reconstructed strata — not recovered scrolls", "J, E, P, D and later supplementary or fragmentary models infer compositional layers from the received Pentateuch. Scholars disagree over source boundaries and whether each model represents an independent document.", "contested", ["src-oxford-pentateuch"], "literary and redactional reconstruction", "Proposed source strata and editorial stages within the Pentateuch", ["Repetitions, narrative tensions, vocabulary, and style support compositional differentiation.", "Some legal and narrative groupings show internally coherent patterns."], ["Competing documentary, supplementary, and fragmentary models divide the evidence differently.", "No manuscript labeled J, E, P, or D survives as a separate source document."], "Source analysis remains a family of debated models rather than a single recovered textual history.", "Do not turn sigla into physical works, assign unsupported exact dates, or synthesize continuous source texts."),
    hypothesis("hypothetical-deuteronomistic-history", "Deuteronomistic History", "hypothetical-literary-construct", ["Judaism", "Hebrew Bible studies"], ["ancient Levant"], "Modern hypothesis concerning Deuteronomy through Kings", "HYPOTHETICAL LITERARY CONSTRUCT", "Shared editorial patterns — no recovered master manuscript", "The Deuteronomistic History proposes editorial unity across Deuteronomy through Kings. The model has influential variants and substantial challenges.", "contested", ["src-oxford-deuteronomistic-encyclopedia", "src-oxford-deuteronomistic-challenges"], "literary-history hypothesis", "A proposed editorial work or process linking Deuteronomy, Joshua, Judges, Samuel, and Kings", ["Recurring language, covenant themes, and evaluations of kings support shared editorial activity.", "Some historical and theological patterns span the proposed corpus."], ["Block, library, and multiple-redaction models explain the corpus without one unified history.", "The scale, date, and number of editorial layers remain disputed."], "The construct remains important but is neither a physical manuscript nor a consensus single-author work.", "Represent model variants and evidence, not a fabricated Deuteronomistic book."),
    hypothesis("reconstructed-proto-indo-european-religion", "Proto-Indo-European religious reconstruction", "comparative-reconstruction", ["Indo-European comparative religion"], ["Eurasia"], "Modern reconstruction of prehistoric linguistic and cultural evidence", "RECONSTRUCTED", "Comparative reconstruction — no unitary scripture", "Comparative linguistics and mythology support a limited set of inherited terms and patterns, while many proposed deities and narratives remain doubtful.", "contested", ["src-oxford-pie-religion"], "comparative linguistic and mythological reconstruction", "Selected inherited religious vocabulary, formulae, and cultural patterns", ["Regular linguistic cognates can support inherited names or concepts.", "Some poetic and ritual formulas recur across separated Indo-European traditions."], ["Contact, convergence, semantic change, and chance resemblance complicate comparisons.", "The evidence does not recover a complete or uniform religion."], "Only bounded, method-specific reconstructions should be presented; confidence varies term by term.", "Never create a Proto-Indo-European scripture, canonical narrative, or verbatim prayer."),
    hypothesis("reconstructed-proto-indo-iranian-religion", "Proto-Indo-Iranian religious reconstruction", "comparative-reconstruction", ["Vedic traditions", "Zoroastrianism", "Indo-Iranian studies"], ["Central and South Asia", "Iran"], "Modern reconstruction from Vedic and Avestan evidence", "RECONSTRUCTED", "Recoverable elements — not a complete religious system", "Vedic and Avestan correspondences support reconstruction of some inherited vocabulary, deities, and ritual concepts, but not a complete organic system.", "medium", ["src-iranica-indo-iranian-religion"], "comparative linguistic and religious reconstruction", "Selected inherited Indo-Iranian religious elements", ["Systematic Vedic-Avestan correspondences support shared inherited elements.", "Related ritual and poetic terminology can be compared historically."], ["Later developments differ sharply and cannot be projected wholesale backward.", "The cited scholarship cautions that an organic complete system cannot be reconstructed."], "A bounded comparative reconstruction is possible for selected features only.", "Do not merge later Vedic and Zoroastrian traditions or generate a proto-canon."),
    hypothesis("reconstructed-rigvedic-oral-compositional-history", "Rigvedic oral compositional history", "reconstructed-transmission", ["Vedic traditions", "Hinduism"], ["South Asia"], "Modern reconstruction of ancient oral composition and transmission", "RECONSTRUCTED TRANSMISSION", "Oral history model — not a lost predecessor book", "Formulaic reuse, poet lineages, arrangement, and preservation practices support models of Rigvedic oral composition. Exact early stages and dates remain uncertain.", "medium", ["src-oxford-rigvedic-oral"], "oral-compositional and transmission reconstruction", "Stages and practices in the oral composition and preservation of the Rigveda", ["Formulaic language, reuse, and lineage organization provide internal evidence.", "Highly controlled oral preservation explains later textual stability."], ["No contemporary manuscript witnesses the earliest compositional stages.", "Oral development cannot be reduced to one lost written archetype."], "Scholarship can model oral composition and transmission without manufacturing an earlier canonical text.", "Do not synthesize a false canonical oral version or present reconstructed stages as verbatim quotations."),
]


def evidence(claim, source_ids):
    return {"claim": claim, "sourceIds": source_ids}


def disputed(
    record_id,
    title,
    traditions,
    regions,
    date_label,
    status,
    headline,
    summary,
    confidence,
    source_ids,
    claimed_date,
    claimed_authorship,
    claimed_provenance,
    physical_date,
    material_description,
    find_provenance,
    evidence_for,
    evidence_against,
    current_assessment,
    majority_view,
    minority_view,
    historiography,
    *,
    rights_status="Metadata and evidence summaries only. Images, transcriptions, editions, and facsimiles require separate rights review.",
    reception_history=None,
    legal_disposition=None,
    safety_notes=None,
):
    return {
        **base_record(record_id, title, "disputed", "authenticity-case", traditions, regions, date_label, status.replace("_", " "), headline, summary, confidence, source_ids, rights_status=rights_status, safety_notes=safety_notes),
        "authenticityStatus": status,
        "forgeryStatusProminent": True,
        "claimedDate": claimed_date,
        "claimedAuthorship": claimed_authorship,
        "claimedProvenance": claimed_provenance,
        "physicalDate": physical_date,
        "materialDescription": material_description,
        "findProvenance": find_provenance,
        "evidenceFor": evidence_for,
        "evidenceAgainst": evidence_against,
        "receptionHistory": reception_history or [],
        "legalDisposition": legal_disposition,
        "currentAssessment": current_assessment,
        "majorityView": majority_view,
        "minorityView": minority_view,
        "historiography": {**historiography, "lastReviewed": REVIEWED_AT},
    }


disputed_works = [
    disputed("forgery-gospel-of-jesus-wife", "Gospel of Jesus' Wife fragment", ["early Christianity", "modern manuscript controversy"], ["unknown claimed origin", "modern private collection"], "Publicly announced in 2012; material and textual studies followed", "DEMONSTRATED_MODERN_FORGERY", "Modern forgery — ancient papyrus does not date the writing", "Material testing initially left open the possibility of an old papyrus support, but textual dependence on a modern online Gospel of Thomas edition and provenance failures establish modern composition.", "high", ["src-cambridge-gjw-forgery", "src-harvard-gjw-testing"], "Claimed as an ancient Coptic fragment", "Presented as an otherwise unknown early Christian gospel witness", "Undocumented private-collection account", "Papyrus support may be ancient; that result does not date the inscription", "Small Coptic-inscribed papyrus fragment", "No secure archaeological provenance", [evidence("Radiocarbon and ink reporting initially did not prove that the support or ink was modern.", ["src-harvard-gjw-testing"])], [evidence("Textual correspondences include dependence on a modern online Gospel of Thomas edition and its error.", ["src-cambridge-gjw-forgery"]), evidence("The ownership and acquisition account lacks secure independent provenance.", ["src-cambridge-gjw-forgery"])], "Modern forgery. An ancient writing support, if present, is not evidence for ancient inscription or authorship.", "The textual and provenance evidence establishes modern composition.", "Early material tests once sustained a limited possibility of antiquity before stronger textual evidence emerged.", {"olderView": "Initial reporting described an uncertain fragment whose papyrus and ink required testing.", "laterChallenge": "Textual analysis identified dependence on a modern online source, including a distinctive error.", "currentMajority": "Modern forgery.", "minorityPosition": "No substantial current authenticity position is represented by the cited evidence.", "supersededClaims": ["Material age alone could authenticate the writing."], "evidenceCausingChange": ["Textual dependence", "provenance investigation", "separation of support age from inscription date"]}, safety_notes=["Do not repeat sensational claims about Jesus or early Christianity as established history."]),
    disputed("disputed-secret-gospel-of-mark", "Secret Gospel of Mark", ["early Christianity", "Christian apocrypha"], ["Mar Saba", "Jerusalem region"], "Reported discovery in 1958 of a claimed eighteenth-century copy", "DISPUTED_AUTHENTICITY", "Authenticity unestablished — original manuscript unavailable", "Morton Smith reported a copied letter attributed to Clement of Alexandria. The manuscript is unavailable, and scholarship remains divided between contextual plausibility and modern-forgery arguments.", "contested", ["src-oxford-secret-mark", "src-yale-secret-mark"], "Claimed Clementine letter preserving passages from a longer Markan text", "Attributed to Clement of Alexandria, quoting or discussing a secret form of Mark", "Reported in a manuscript at Mar Saba by Morton Smith in 1958", "The reported manuscript was described as an eighteenth-century hand; the physical object is now unavailable", "Photographs and published transcription of an unavailable manuscript", "Reported library context, but no presently inspectable original", [evidence("Recent scholarship argues that neither a first-century gospel nor a twentieth-century forgery fully explains all evidence.", ["src-yale-secret-mark"])], [evidence("Internal anomalies and circumstances of discovery have been advanced as evidence of modern forgery.", ["src-oxford-secret-mark"])], "Authenticity remains disputed. The unavailable original sharply limits new material testing.", "No settled consensus is encoded beyond the fact of active, serious dispute.", "Published scholarship includes both modern-forgery arguments and more recent defenses of a non-forgery historical manuscript context.", {"olderView": "Early debate polarized between major discovery and suspicion of Smith.", "laterChallenge": "Detailed internal and contextual forgery arguments intensified skepticism.", "currentMajority": "Authenticity remains unestablished; views vary by scholar.", "minorityPosition": "Some recent work argues against both simple ancient-gospel and modern-hoax classifications.", "supersededClaims": ["Photographs alone settle the physical manuscript's date."], "evidenceCausingChange": ["Loss or unavailability of the original", "literary analysis", "expanded historiography"]}),
    disputed("hoax-oera-linda-book", "Oera Linda Book", ["modern esotericism", "Frisian nationalism", "new religious reception"], ["Netherlands", "Friesland"], "Surfaced in 1867", "MODERN_FORGERY_OR_HOAX", "Nineteenth-century creation — not an ancient Frisian chronicle", "The Oera Linda Book appeared in the nineteenth century with claims of remote Frisian antiquity. Linguistic, material, literary, and provenance research places it in its modern setting.", "high", ["src-brill-oera-linda", "src-groningen-oera-linda"], "Claimed deep antiquity and transmission as an old Frisian chronicle", "Presented through a family-manuscript narrative", "Surfaced through nineteenth-century Dutch and Frisian networks", "Nineteenth-century material context", "Manuscript associated with the modern publication history", "Documented modern chain is more secure than the claimed ancient chain", [], [evidence("Language, paper, historical setting, and literary analysis place manufacture in the nineteenth century.", ["src-brill-oera-linda", "src-groningen-oera-linda"])], "Modern literary forgery or hoax-associated creation with a significant later reception history.", "Academic scholarship treats the claimed ancient provenance as false.", "Modern religious and nationalist reception persists but is not evidence of ancient authorship.", {"olderView": "Initial publication promoted an ancient Frisian manuscript claim.", "laterChallenge": "Philological and provenance research located the work in the nineteenth century.", "currentMajority": "Modern creation.", "minorityPosition": "Nonacademic authenticity advocacy persists.", "supersededClaims": ["The narrative's claimed family transmission proves antiquity."], "evidenceCausingChange": ["linguistic analysis", "material context", "historical provenance research"]}, reception_history=[evidence("Later adherents and interpreters have treated the book as preserving genuine ancient wisdom; reception is not evidence of ancient authorship.", ["src-brill-oera-linda"])], safety_notes=["Contextualize nationalist and racial uses without reproducing them as factual ancient history."]),
    disputed("forgery-book-of-veles", "Book of Veles", ["Slavic Native Faith", "modern Slavic esotericism"], ["Eastern Europe", "Russian and Ukrainian diaspora"], "Published through twentieth-century transcription claims", "MODERN_FORGERY", "Modern forgery — alleged wooden originals are unavailable", "The Book of Veles is known through twentieth-century claims about lost wooden planks. Linguistic anachronisms and the lack of inspectable originals support modern manufacture, although some adherents continue to value it religiously.", "high", ["src-chicago-book-veles", "src-cambridge-book-veles"], "Claimed premodern Slavic text on wooden planks", "Attributed to ancient or early medieval Slavic communities", "Allegedly copied from planks later lost; survives through modern publication claims", "No original planks available for testing; surviving transmission is modern", "Transcriptions, publications, and limited photographic claims", "Unverified modern discovery narrative", [], [evidence("Historical linguists identify anachronistic and inconsistent language incompatible with the claimed date.", ["src-chicago-book-veles"]), evidence("The alleged original objects are unavailable for independent examination.", ["src-chicago-book-veles"])], "Modern literary forgery in scholarly assessment; its later religious reception is a separate documented fact.", "Historical-linguistic scholarship rejects the claimed antiquity.", "Some adherents continue to defend authenticity or religious value.", {"olderView": "Publishers promoted a lost ancient plank text.", "laterChallenge": "Linguistic analysis exposed anachronism and inconsistency.", "currentMajority": "Modern forgery.", "minorityPosition": "Adherent authenticity claims persist.", "supersededClaims": ["A transcription and reported photograph substitute for accessible originals."], "evidenceCausingChange": ["historical linguistics", "missing provenance", "modern transmission history"]}, reception_history=[evidence("Some contemporary religious adherents accept or value the text as ancient or spiritually authoritative; that reception is not evidence of antiquity.", ["src-cambridge-book-veles"])], safety_notes=["Describe living Slavic Native Faith communities respectfully and separate reception from authenticity."]),
    disputed("hoax-kinderhook-plates", "Kinderhook Plates", ["Latter Day Saint history", "American religious history"], ["Illinois", "United States"], "Manufactured and presented in 1843", "DEMONSTRATED_HOAX", "Demonstrated nineteenth-century hoax", "The Kinderhook Plates were manufactured and planted in 1843. A participant's confession and later production and material evidence establish the hoax; questions about Joseph Smith's exact response are separate.", "high", ["src-lds-kinderhook", "src-byu-kinderhook"], "Presented as ancient inscribed metal plates", "No authentic ancient author; claims were designed to attract interpretation", "Planted near Kinderhook, Illinois", "Nineteenth-century manufacture", "Small inscribed metal plates; one survivor was examined", "Documented planted discovery", [], [evidence("A maker confessed to the prank, and production and material evidence support modern manufacture.", ["src-lds-kinderhook", "src-byu-kinderhook"])], "Demonstrated hoax. The precise scope of Joseph Smith's attempted engagement remains a distinct historical question.", "Modern manufacture is established.", "Interpretations differ over Joseph Smith's response, not over the plates' modern manufacture.", {"olderView": "The staged find invited ancient-artifact interpretation.", "laterChallenge": "Confession and scientific examination established manufacture.", "currentMajority": "Demonstrated hoax.", "minorityPosition": "No material-authenticity minority is represented by the cited sources.", "supersededClaims": ["The plates constitute an ancient written record."], "evidenceCausingChange": ["maker confession", "manufacturing evidence", "material examination"]}, reception_history=[evidence("Early observers treated the objects as potentially ancient because of the staged discovery; being deceived is not evidence of authenticity.", ["src-lds-kinderhook"])], safety_notes=["Do not use the plates' manufacture status to adjudicate the truth of a religion."]),
    disputed("disputed-jehoash-inscription", "Jehoash Inscription", ["ancient Israelite history", "biblical archaeology"], ["Israel", "unprovenanced antiquities market"], "Public controversy in the early 2000s", "SUSPECTED_FORGERY_DISPUTED", "Disputed authenticity — acquittal is not authentication", "The unprovenanced stone inscription has competing archaeometric and epigraphic assessments. Most epigraphic scholarship favors forgery, while a minority archaeometric argument supports authenticity.", "contested", ["src-tel-aviv-jehoash", "src-jas-jehoash", "src-latimes-jehoash-verdict"], "Claimed First Temple-period inscription concerning Temple repairs", "Attributed to the reign of King Jehoash", "Unprovenanced antiquities-market object", "Stone may be ancient; the inscription and patina dates remain disputed", "Inscribed black stone with patina", "No controlled archaeological find context", [evidence("An archaeometric study argues that features of the patina support authenticity.", ["src-jas-jehoash"])], [evidence("Philological, palaeographic, and patina analyses identify anomalies consistent with modern manufacture.", ["src-tel-aviv-jehoash"])], "Suspected forgery with documented minority dissent. Legal acquittal does not authenticate the object.", "The majority epigraphic and philological assessment favors forgery.", "Some archaeometric researchers argue for authenticity.", {"olderView": "Initial announcement promoted a major First Temple-period inscription.", "laterChallenge": "Epigraphic, linguistic, and patina criticism challenged authenticity.", "currentMajority": "Likely forgery.", "minorityPosition": "A published archaeometric defense remains part of the record.", "supersededClaims": ["Criminal acquittal establishes archaeological authenticity.", "Ancient stone necessarily means ancient inscription."], "evidenceCausingChange": ["palaeography", "philology", "patina analysis", "lack of provenance"]}, legal_disposition=evidence("The 2012 criminal acquittal reflected failure to prove forgery beyond a reasonable doubt; contemporary reporting states that authenticity remained unproven.", ["src-latimes-jehoash-verdict"])),
    disputed("disputed-shapira-deuteronomy-strips", "Shapira Deuteronomy strips", ["Hebrew Bible", "biblical manuscripts"], ["Transjordan claimed origin", "Europe"], "Presented in 1883; originals now lost", "SUSPECTED_FORGERY_DISPUTED", "Lost physical strips — revived authenticity claim remains minority", "The Shapira strips were rejected as forgeries in the nineteenth century and later disappeared. A recent authenticity argument has revived debate, while orthographic and philological studies continue to support modern manufacture.", "contested", ["src-monash-shapira", "src-degruyter-shapira", "src-peeters-shapira"], "Claimed ancient Deuteronomy-related manuscript", "Presented as an early form of Deuteronomy", "Unprovenanced acquisition account associated with Moses Shapira", "Original strips unavailable; material cannot now be retested directly", "Reported leather strips known through descriptions, drawings, and transcriptions", "No controlled archaeological provenance", [evidence("A recent philological reconstruction argues that the text could preserve an early form of Deuteronomy.", ["src-monash-shapira"])], [evidence("Orthographic and linguistic features have been argued to reflect nineteenth-century knowledge and manufacture.", ["src-degruyter-shapira", "src-peeters-shapira"]), evidence("Loss of the physical strips prevents decisive new material examination.", ["src-peeters-shapira"])], "Current majority assessment remains forgery, with a visible recent minority authenticity argument.", "Forgery remains the dominant assessment in the cited critical scholarship.", "A recent scholarly argument proposes authenticity and an early Deuteronomy text.", {"olderView": "The strips were rejected soon after their 1883 presentation.", "laterChallenge": "A modern reconstruction reopened the authenticity question.", "currentMajority": "Likely nineteenth-century forgery.", "minorityPosition": "A revived authenticity case is published and must be represented.", "supersededClaims": ["A modern textual reconstruction substitutes for examination of the lost strips."], "evidenceCausingChange": ["orthographic comparison", "philology", "reassessment of nineteenth-century drawings and transcriptions"]}),
    disputed("forgery-salamander-letter", "Salamander Letter", ["Latter Day Saint history", "American religious history"], ["Utah", "United States"], "Surfaced in 1984; forgery exposed in 1985–1987 investigations", "DEMONSTRATED_MODERN_FORGERY", "Demonstrated Mark Hofmann forgery", "The Salamander Letter was one of Mark Hofmann's fabricated historical documents. Period materials and deceptive provenance initially delayed detection, but confession and the wider forensic investigation settle its status.", "high", ["src-byu-salamander"], "Claimed nineteenth-century letter about early Latter-day Saint history", "Purportedly authored by Martin Harris", "Presented through a fabricated collecting and ownership history", "Modern writing on selected period-compatible materials", "Forged historical document", "Provenance supplied by the forger", [evidence("Period-compatible materials and plausible surface details initially persuaded some examiners and buyers.", ["src-byu-salamander"])], [evidence("Hofmann's confession and the connected forensic and criminal investigation established fabrication.", ["src-byu-salamander"])], "Demonstrated modern forgery.", "Forgery is settled by confession and corroborating investigation.", "No material-authenticity minority is represented by the cited evidence.", {"olderView": "The document initially circulated as a potentially authentic historical letter.", "laterChallenge": "The murder and forgery investigation exposed Hofmann's production methods and provenance fabrications.", "currentMajority": "Demonstrated forgery.", "minorityPosition": "None in the cited scholarship.", "supersededClaims": ["Period paper or ink alone authenticates authorship."], "evidenceCausingChange": ["confession", "forensic investigation", "provenance collapse"]}, safety_notes=["Do not use a forged document to adjudicate the truth of a faith tradition."]),
]


payload = {
    "sources": sources,
    "definitions": definitions,
    "suppressionEvents": suppression_events,
    "lostWorks": lost_works,
    "hypotheticalSources": hypothetical_sources,
    "disputedWorks": disputed_works,
}


OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(
    f"{len(sources)} sources, {len(suppression_events)} suppression/control records, "
    f"{len(lost_works)} lost/fragmentary records, {len(hypothetical_sources)} hypothetical records, "
    f"{len(disputed_works)} disputed/forgery records"
)
