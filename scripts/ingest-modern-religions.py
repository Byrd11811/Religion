import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "seed" / "modern-religions.json"


def src(label, url, perspective):
    return {"label": label, "url": url, "perspective": perspective}


def tradition(profile_id, name, region, description, color):
    return {
        "id": profile_id,
        "name": name,
        "region": region,
        "lat": None,
        "lng": None,
        "description": description,
        "color": color,
    }


def work(
    work_id,
    title,
    profile_id,
    tradition_name,
    year,
    author,
    description,
    source_url,
    *,
    rights="Copyrighted; no open license identified. Atlas stores metadata, a brief original neutral summary, and outbound links only; no full text or extended excerpts.",
    alternate=None,
    canon_status="Important source within the named modern tradition; community use and authority must be described source by source.",
    category="Modern religious work — metadata only",
    extra_sources=None,
    edition_id=None,
    source_status=None,
    date_note=None,
    region="Multiple regions",
    languages=None,
    lat=None,
    lng=None,
    themes=None,
    confidence="Unreviewed",
):
    sources = [source_url, *(extra_sources or [])]
    row = {
        "id": work_id,
        "title": title,
        "traditionId": profile_id,
        "tradition": tradition_name,
        "category": category,
        "canonStatus": canon_status,
        "startDate": year,
        "endDate": year,
        "dateConfidence": date_note or ("Documented publication or issue year in the linked source" if year is not None else "Collection guide; no single publication date is assigned"),
        "region": region,
        "lat": lat,
        "lng": lng,
        "languages": languages or ["English"],
        "author": author,
        "description": description,
        "historicalContext": "Atlas dates this record from documented modern composition, issue, or publication evidence. Revelatory, ancient, extraterrestrial, paranormal, healing, or supernatural origin claims remain attributed community claims.",
        "manuscripts": "No physical witness is inferred from a current website or catalog record. Edition- and archive-specific witnesses require separate records.",
        "themes": themes or [],
        "sourceStatus": source_status or (
            "Complete public-domain edition available"
            if edition_id
            else "Metadata only — copyrighted text not reproduced"
            if (
                any(
                    marker in rights.casefold()
                    for marker in ("copyrighted", "copyright ©", "asserts copyright", "permission-controlled")
                )
                and not rights.casefold().startswith(("public-domain", "historical original is public domain"))
            )
            else "Metadata only — source linked; no edition bundled"
        ),
        "copyright": rights,
        "sourceUrl": source_url,
        "metadataSources": sources,
        "editionId": edition_id,
        "confidence": confidence,
        "subcollection": "Modern religions and new religious movements",
    }
    if alternate:
        row["alternateTitles"] = alternate
    return row


PROTECTED = "Copyrighted; no open license identified. Atlas stores metadata, a brief original neutral summary, and outbound links only; no full text or extended excerpts."
LINK_ONLY = "Metadata and links only. Edition-specific rights remain under review; no text is bundled."
PD_NOT_BUNDLED = "Historical original is public domain in the United States; modern editions, translations, editorial matter, typography, and images may remain protected. No text is bundled in this record."

profiles = [
    {
        "id": "scientology", "name": "Scientology", "aliases": [], "originStart": 1950, "originEnd": 1954, "region": "United States with international development",
        "summary": "A modern religious movement developed by L. Ron Hubbard from Dianetics and organized through churches beginning in the 1950s.",
        "classificationBoundary": "Official teachings, academic interpretation, legal decisions, journalism, former-member testimony, criticism, and Church responses remain separate evidence types. Religious status, organizational conduct, and truth claims are not collapsed into one judgment.",
        "centralAuthority": "Multiple Church of Scientology entities; source and jurisdiction must be named", "canonNote": "The Church identifies Hubbard's written and recorded works as scripture; all are treated as copyrighted metadata unless an edition license is verified.",
        "workIds": [],
        "sources": [src("Scientology background", "https://www.scientology.org/what-is-scientology/scientology-background/", "Official self-description"), src("L. Ron Hubbard and Scientology Studies", "https://www.cambridge.org/core/elements/abs/l-ron-hubbard-and-scientology-studies/7CFAFCE453BE67F5168A99F4DD4A6801", "Academic study")],
    },
    {
        "id": "bahai-faith-modern", "name": "Bahá’í Faith", "aliases": ["Baha'i Faith"], "originStart": 1844, "originEnd": 1863, "region": "Iran and Ottoman domains; now global",
        "summary": "A monotheistic religion emerging from the Bábí movement and the teachings of Bahá’u’lláh in the nineteenth century.",
        "classificationBoundary": "Bahá’í authoritative texts and institutional explanations are identified as community sources; Bábí chronology and Bahá’í development remain historically distinct.",
        "centralAuthority": "Universal House of Justice within the Bahá’í administrative order", "canonNote": "A large body of writings by the Báb, Bahá’u’lláh, and ‘Abdu’l-Bahá; no single work is treated as the whole canon.",
        "workIds": ["baha-i-kitab-i-aqdas", "kitab-i-iqan"],
        "sources": [src("Bahá’í Reference Library", "https://www.bahai.org/library/authoritative-texts/", "Official authoritative-text library"), src("Bahá’í legal terms", "https://www.bahai.org/legal", "Official rights policy")],
    },
    {
        "id": "latter-day-saint-movement", "name": "Latter Day Saint movement", "aliases": ["LDS movement"], "originStart": 1830, "originEnd": 1830, "region": "United States; now global",
        "summary": "A family of restorationist Christian churches whose documented public emergence includes the 1830 publication of the Book of Mormon and organization of the Church of Christ.",
        "classificationBoundary": "The Church of Jesus Christ of Latter-day Saints is the largest body but does not represent every Latter Day Saint denomination; canon and edition claims remain community-specific.",
        "centralAuthority": "Varies by denomination", "canonNote": "The Book of Mormon is shared broadly; other standard works and versions vary by Latter Day Saint community.",
        "workIds": ["book-of-mormon", "doctrine-and-covenants", "pearl-of-great-price"],
        "sources": [src("1830 Book of Mormon", "https://www.loc.gov/resource/rbc.2015gen34953c1/?st=gallery", "Library of Congress primary edition"), src("Joseph Smith Papers", "https://www.josephsmithpapers.org/paper-summary/book-of-mormon-1830/1", "Scholarly documentary edition")],
    },
    {
        "id": "christian-science", "name": "Christian Science", "aliases": ["Church of Christ, Scientist"], "originStart": 1879, "originEnd": 1879, "region": "United States; now international",
        "summary": "A Christian-derived religious movement founded by Mary Baker Eddy; its church was organized in 1879 after the 1875 first edition of Science and Health.",
        "classificationBoundary": "Religious healing teachings are described as doctrine and adherent testimony, not clinical evidence or advice to forgo medical care. Christian Science is not interchangeable with New Thought.",
        "centralAuthority": "The First Church of Christ, Scientist", "canonNote": "The Bible and Science and Health with Key to the Scriptures are the denomination's stated pastor texts.",
        "workIds": ["science-and-health"],
        "sources": [src("Christian Science FAQ", "https://www.christianscience.com/what-we-believe/frequently-asked-questions", "Official self-description"), src("Science and Health", "https://www.christianscience.com/publishing/primary-texts-the-bible-and-science-and-health/science-and-health", "Official publication record")],
    },
    {
        "id": "theosophy-modern", "name": "Theosophy", "aliases": ["Theosophical movement"], "originStart": 1875, "originEnd": 1875, "region": "United States, India, and transnational networks",
        "summary": "A modern esoteric movement associated with the Theosophical Society, founded in New York in 1875 and later headquartered at Adyar.",
        "classificationBoundary": "The Theosophical Society and later organizations or currents are historically related but not one continuous centralized authority.",
        "centralAuthority": "No single authority across all Theosophical organizations", "canonNote": "Influential writings are not a closed universal canon.",
        "workIds": ["the-secret-doctrine", "isis-unveiled"],
        "sources": [src("Theosophical Society history", "https://www.ts-adyar.org/early-history", "Official institutional history"), src("Secret Doctrine Volume I", "https://www.gutenberg.org/ebooks/54824", "Public-domain edition record")],
    },
    {
        "id": "anthroposophy", "name": "Anthroposophy", "aliases": ["Anthroposophical movement"], "originStart": 1912, "originEnd": 1913, "region": "Central Europe; now international",
        "summary": "An esoteric and philosophical movement developed by Rudolf Steiner, institutionally separated from Theosophy in 1912–1913 and reorganized in 1923.",
        "classificationBoundary": "Waldorf education, biodynamics, art, and anthroposophical medicine are related applications; they do not by themselves establish organizational membership or clinical efficacy.",
        "centralAuthority": "General Anthroposophical Society at the Goetheanum", "canonNote": "Steiner's writings and lectures form a broad corpus rather than a closed canon.",
        "workIds": ["philosophy-of-freedom", "theosophy-rudolf-steiner"],
        "sources": [src("Goetheanum history", "https://goetheanum.ch/en/society/history", "Official institutional history"), src("Foundation Statute of 1923", "https://www.goetheanum.org/en/members/foundation-statute-of-1923", "Official organizational document")],
    },
    {
        "id": "modern-spiritualism", "name": "Modern Spiritualism", "aliases": ["Spiritualism"], "originStart": 1848, "originEnd": 1848, "region": "United States and Europe; now international",
        "summary": "A modern religious movement centered on claimed communication with spirits, conventionally linked to the 1848 Hydesville events and later institutions and publications.",
        "classificationBoundary": "Believer testimony, archival records, skeptical interpretation, and paranormal claims remain distinct. Anglo-American Spiritualism is not identical to Kardecist Spiritism.",
        "centralAuthority": "No single global authority", "canonNote": "No universal closed canon; institutional principles and literature vary.",
        "workIds": ["modern-spiritualism-literature-guide"],
        "sources": [src("Hydesville Park history", "https://nsac.org/hydesville-park-history/", "Spiritualist institutional history"), src("Library of Congress teaching essay", "https://blogs.loc.gov/teachers/2023/04/teaching-scientific-literacy-the-case-of-the-psychic-force/", "Institutional historical context")],
    },
    {
        "id": "cao-dai", "name": "Cao Đài", "aliases": ["Caodaism"], "originStart": 1925, "originEnd": 1926, "region": "Vietnam",
        "summary": "A Vietnamese syncretic religion whose early public organization and declaration occurred in 1925–1926.",
        "classificationBoundary": "Tây Ninh and other branches must be identified separately; a source from one organization is not automatically authoritative for every Cao Đài community.",
        "centralAuthority": "Multiple branch institutions", "canonNote": "Scriptural and legal corpora vary by branch and publication history.",
        "workIds": ["thanh-ngon-hiep-tuyen"],
        "sources": [src("A Brief History", "https://www.caodaicenter.org/a-brief-history", "Community history"), src("Cao Đài origins", "https://www.cambridge.org/core/journals/bulletin-of-the-school-of-oriental-and-african-studies/article/abs/an-introduction-to-caodaism-i-origins-and-early-history/428DC9D8444E7BA43D2A6543C0C9ABE0", "Academic history")],
    },
    {
        "id": "tenrikyo", "name": "Tenrikyo", "aliases": ["Tenrikyō"], "originStart": 1838, "originEnd": 1838, "region": "Japan; now international",
        "summary": "A Japanese religion tracing its founding event to Miki Nakayama in 1838, with later legal organization and international development.",
        "classificationBoundary": "The 1838 teaching origin, 1888 headquarters recognition, and 1908 sectarian independence are separate historical milestones.",
        "centralAuthority": "Tenrikyo Church Headquarters", "canonNote": "Official teaching identifies Ofudesaki, Mikagura-uta, and Osashizu as foundational scriptures.",
        "workIds": ["ofudesaki"],
        "sources": [src("Tenrikyo history", "https://www.tenrikyo.or.jp/eng/history/", "Official history"), src("Ofudesaki overview", "https://www.tenrikyo.or.jp/en/newsletter/html/tt6/ofudesaki.html", "Official text overview")],
    },
    {
        "id": "falun-gong", "name": "Falun Gong / Falun Dafa", "aliases": ["Falun Dafa"], "originStart": 1992, "originEnd": 1992, "region": "China; now transnational",
        "summary": "A modern spiritual movement publicly disseminated by Li Hongzhi beginning in 1992.",
        "classificationBoundary": "Official teaching, state action, human-rights reporting, movement advocacy, and disputed allegations require explicit source attribution.",
        "centralAuthority": "No conventional membership institution recorded; official publishing sources identify Li Hongzhi's teachings", "canonNote": "Zhuan Falun is a central text; current translations remain copyrighted.",
        "workIds": ["zhuan-falun"],
        "sources": [src("Falun Dafa books", "https://www.falundafa.org/eng/falun-dafa-books.html", "Official publication catalog"), src("US State Department China report", "https://2021-2025.state.gov/reports/2023-report-on-international-religious-freedom/china/", "Government religious-freedom reporting")],
    },
    {
        "id": "rastafari", "name": "Rastafari", "aliases": ["Rastafarian movement"], "originStart": 1930, "originEnd": 1935, "region": "Jamaica and global diaspora",
        "summary": "A decentralized religious and cultural movement emerging in Jamaica in the early 1930s from Garveyist, Ethiopianist, biblical, and local currents.",
        "classificationBoundary": "Mansions and communities differ; Rastafari is not reducible to reggae, a single lifestyle marker, or one universal doctrine.",
        "centralAuthority": "No single centralized authority", "canonNote": "The Bible and several influential Ethiopianist works matter in varied ways; there is no universal closed Rastafari canon.",
        "workIds": ["holy-piby"],
        "sources": [src("Smithsonian Folklife history", "https://folklife.si.edu/magazine/black-history-in-roots-reggae-music", "Institutional cultural history"), src("Rastafari evolution", "https://academic.oup.com/nyu-press-scholarship-online/book/45995/chapter-abstract/404439064", "Academic history")],
    },
    {
        "id": "nation-of-islam", "name": "Nation of Islam", "aliases": ["NOI"], "originStart": 1930, "originEnd": 1930, "region": "United States",
        "summary": "An African American new religious movement founded in 1930 and shaped by Wallace Fard Muhammad and Elijah Muhammad.",
        "classificationBoundary": "The Nation of Islam uses Islamic vocabulary within a distinct institutional and doctrinal history; it is not interchangeable with Sunni Islam, Shi'a Islam, or Muslims generally.",
        "centralAuthority": "Nation of Islam leadership", "canonNote": "The Qur'an, Bible, and Elijah Muhammad's teachings have distinct roles; no equivalence to other Muslim communities is inferred.",
        "workIds": ["message-to-blackman-in-america"],
        "sources": [src("National Park Service profile", "https://www.nps.gov/articles/000/wendy-l-muhammad-foundation-trust.htm", "Government historical context"), src("The Muslim Program", "https://noi.org/muslim-program/", "Official self-description")],
    },
    {
        "id": "thelema", "name": "Thelema", "aliases": [], "originStart": 1904, "originEnd": 1904, "region": "Egypt and Britain; now international",
        "summary": "A modern religious and esoteric current rooted in Aleister Crowley's reception and composition of The Book of the Law in 1904.",
        "classificationBoundary": "Thelema is broader than any one organization. O.T.O. and A∴A∴ are important institutions but are not synonyms for every Thelemite or Thelemic current.",
        "centralAuthority": "No single authority across all Thelemic communities", "canonNote": "The Book of the Law is central in many Thelemic communities; editions and other classed writings require organization-specific context.",
        "workIds": ["the-book-of-the-law"],
        "sources": [src("Liber AL history", "https://bubastis.oto-usa.org/about/liber-al-the-book-of-the-law", "O.T.O. official text history"), src("Yorke Collection", "https://warburg.sas.ac.uk/library-collections/warburg-institute-archive/archive-collections/yorke-collection", "University archive")],
    },
    {
        "id": "modern-satanism", "name": "Modern Satanism", "aliases": ["Religious Satanism"], "originStart": 1966, "originEnd": 1966, "region": "United States and transnational movements",
        "summary": "A plural field of self-identified modern Satanist religions and organizations, including distinct nontheistic, symbolic, and theistic currents.",
        "classificationBoundary": "Church of Satan, The Satanic Temple, Temple of Set, theistic currents, and unaffiliated identities remain distinct. Satanism is not equated with crime, abuse, or sacrifice without case-specific evidence.",
        "centralAuthority": "No single authority across modern Satanisms", "canonNote": "Organization-specific texts do not constitute a universal Satanist canon.",
        "workIds": ["the-satanic-bible", "the-satanic-rituals", "selected-modern-satanic-philosophical-texts"],
        "sources": [src("Satanism", "https://www.cambridge.org/core/elements/abs/satanism/4150D0B522022169485FCD56FA7FE2BE", "Academic taxonomy"), src("Church of Satan history", "https://churchofsatan.com/history/", "Organization self-description"), src("The Satanic Temple", "https://thesatanictemple.com/pages/about-us/", "Organization self-description")],
    },
    {
        "id": "luciferian-traditions", "name": "Luciferian traditions", "aliases": ["Luciferianism"], "originStart": 1906, "originEnd": 1906, "region": "Europe and transnational currents",
        "summary": "A plural category for literary, esoteric, philosophical, and self-identified religious currents that interpret Lucifer positively or symbolically.",
        "classificationBoundary": "Luciferian currents are not one church and are not automatically Satanism, Devil worship, or criminality. Literary reception and self-identified religion remain separate.",
        "centralAuthority": "No single authority", "canonNote": "No universal canon; named works and organizations require their own dates and contexts.",
        "workIds": ["selected-luciferian-writings", "dawn-of-a-new-morning"],
        "sources": [src("Luciferian Witchcraft", "https://academic.oup.com/book/11601/chapter-abstract/160465083", "Academic study"), src("From Milton to Modern Satanism", "https://brill.com/view/journals/jre/3/1/article-p103_4.xml", "Academic study")],
    },
    {
        "id": "new-thought", "name": "New Thought", "aliases": ["New Thought movement"], "originStart": 1890, "originEnd": 1899, "region": "United States and transnational networks",
        "summary": "A diverse family of metaphysical religious and self-development movements that coalesced in the late nineteenth century.",
        "classificationBoundary": "New Thought is an umbrella, not a single church or canon. Spiritual, prosperity, and healing claims are doctrines or testimony, not verified medical or financial outcomes.",
        "centralAuthority": "No single authority; multiple denominations and networks", "canonNote": "No universal canon.",
        "workIds": ["science-of-mind"],
        "sources": [src("International New Thought Alliance", "https://www.newthoughtalliance.org/about", "Umbrella-organization history"), src("Unity Digital Archive", "https://www.unity.org/en/static/unity-digital-archive-and-museum", "Institutional archive")],
    },
    {
        "id": "new-age-movements", "name": "New Age movements", "aliases": ["New Age spiritualities"], "originStart": 1970, "originEnd": 1979, "region": "Transnational",
        "summary": "An analytic label for diverse alternative spiritualities and networks that became especially visible in the 1970s.",
        "classificationBoundary": "New Age is a diffuse field, not one organization, founder, dogma, or religion. Shared vocabulary does not prove common authority or lineage.",
        "centralAuthority": "None", "canonNote": "No universal canon or representative sacred text.",
        "workIds": ["a-course-in-miracles", "law-of-one-ra-material", "seth-material"],
        "sources": [src("New Age movement", "https://www.cambridge.org/core/elements/abs/new-age-movement/C739F64CCC20918EFF40756AB1BDABE9", "Academic synthesis"), src("New Age Spiritualities", "https://academic.oup.com/book/8388/chapter-abstract/154107792", "Academic study")],
    },
    {
        "id": "ufo-religions", "name": "UFO religions", "aliases": ["UFO religious movements"], "originStart": 1954, "originEnd": 1954, "region": "Transnational",
        "summary": "An analytic umbrella for distinct religious movements in which extraterrestrial or space-age narratives play a major role, including Unarius, the Aetherius Society, Raëlism, and Heaven's Gate.",
        "classificationBoundary": "The category does not make distinct movements one organization and does not classify all UFO interest or ancient-astronaut speculation as religion.",
        "centralAuthority": "None across the category", "canonNote": "Each movement has its own writings; there is no umbrella canon.",
        "workIds": ["twelve-blessings", "book-which-tells-the-truth", "oahspe", "urantia-book"],
        "sensitiveNote": "Heaven's Gate history includes 39 deaths by mass suicide in March 1997. Atlas omits method details and avoids glamorizing or instructional material.",
        "sources": [src("UFO religions classification", "https://www.loc.gov/aba/publications/Archived-LCC02/BL-BQ-text.pdf", "Library of Congress classification"), src("UFO religions scholarship", "https://academic.oup.com/edited-volume/28304/chapter-abstract/215000998", "Academic study"), src("Heaven's Gate research", "https://online.ucpress.edu/nr/article-abstract/10/2/75/95305/Scaling-Heaven-s-Gate-Individualism-and-Salvation", "Academic study")],
    },
]

profile_names = {item["id"]: item["name"] for item in profiles}

scientology_specs = [
    ("dianetics-modern-science-mental-health", "Dianetics: The Modern Science of Mental Health", 1950, "https://www.scientology.org/store/item/dianetics-the-modern-science-of-mental-health-paperback.html", ["https://search.worldcat.org/ko/title/Dianetics-%3A-the-modern-science-of-mental-health-%3A-a-handbook-of-dianetic-therapy/oclc/2711108"], None, "First published 9 May 1950."),
    ("dianetics-original-thesis", "Dianetics: The Original Thesis", 1951, "https://www.scientology.org/store/item/dianetics-the-original-thesis-paperback.html", ["https://search.worldcat.org/title/16764608"], None, "A 1947 manuscript circulated before first publication in 1951."),
    ("dianetics-evolution-science", "Dianetics: The Evolution of a Science", 1955, "https://www.scientology.org/store/item/evolution-of-a-science-hardcover.html", ["https://search.worldcat.org/title/362924343"], None, "First appeared as a magazine article in May 1950; first separate book publication is dated 1955."),
    ("science-of-survival", "Science of Survival", 1951, "https://www.scientology.org/store/item/science-of-survival-hardcover.html", ["https://search.worldcat.org/title/2291077"], None, None),
    ("self-analysis-hubbard", "Self Analysis", 1951, "https://www.scientology.org/store/item/self-analysis-hardcover.html", ["https://search.worldcat.org/fr/title/Self-analysis-a-simple-self-help-volume-of-tests-and-precesses-based-on-the-discoveries-contained-in-dianetics/oclc/1358594"], None, None),
    ("handbook-for-preclears", "Handbook for Preclears", 1951, "https://www.scientology.org/store/item/handbook-for-preclears-paperback.html", ["https://obnb.uk/p14510720-handbook-for-preclears"], None, None),
    ("scientology-history-of-man", "Scientology: A History of Man", 1952, "https://www.scientology.org/store/item/scientology-a-history-of-man-hardcover.html", ["https://archives.sdsu.edu/repositories/2/archival_objects/137217", "https://books.google.com/books?id=sGOpqE3QY0QC"], ["What to Audit"], "First published as What to Audit in 1952; later editions use the current title."),
    ("scientology-8-80", "Scientology 8-80", 1952, "https://www.scientology.org/store/item/scientology-8-80-hardcover.html", ["https://cesnur.net/wp-content/uploads/2018/08/tjoc_2_4_3_camacho.pdf"], None, None),
    ("scientology-8-8008", "Scientology 8-8008", 1953, "https://www.scientology.org/store/item/scientology-8-8008-hardcover.html", ["https://books.google.com/books/about/Scientology_8_8008.html?id=3YZKAQAAIAAJ"], None, "Course manuscript/content dates to December 1952; the first separately cataloged edition is dated 1953."),
    ("creation-of-human-ability", "The Creation of Human Ability", 1954, "https://www.scientology.org/store/item/creation-of-human-ability-hardcover.html", ["https://openlibrary.org/books/OL22927420M/The_creation_of_human_ability"], None, None),
    ("scientology-fundamentals-thought", "Scientology: The Fundamentals of Thought", 1956, "https://www.scientology.org/store/item/scientology-the-fundamentals-of-thought-hardcover.html", ["https://cesnur.net/wp-content/uploads/2018/08/tjoc_2_4_3_camacho.pdf"], None, None),
    ("problems-of-work", "The Problems of Work", 1956, "https://www.scientology.org/store/item/problems-of-work-hardcover.html", ["https://openlibrary.org/books/OL26446274M/The_Problems_of_Work"], None, None),
    ("scientology-new-slant-life", "Scientology: A New Slant on Life", 1965, "https://www.scientology.org/store/item/scientology-a-new-slant-on-life-paperback.html", ["https://books.google.com/books?id=DZyuzQEACAAJ"], None, None),
    ("phoenix-lectures", "The Phoenix Lectures", 1968, "https://www.scientology.org/store/item/phoenix-lectures.html", ["https://openlibrary.org/books/OL20291879M/The_Phoenix_lectures"], None, "Lectures were delivered in 1954; the first book/transcript publication is dated 1968."),
    ("creed-church-scientology", "The Creed of the Church of Scientology", 1954, "https://www.scientology.org/what-is-scientology/the-scientology-creeds-and-codes/the-creed-of-the-church.html", [], None, "Official page dates composition to shortly after formation of the Los Angeles church in February 1954."),
    ("auditors-code", "The Auditor's Code", 1951, "https://www.scientology.org/what-is-scientology/the-scientology-creeds-and-codes/the-auditors-code.html", [], None, "Written in 1947, first published in 1951, revised later, with the final version dated June 1980."),
    ("code-of-honor-scientology", "The Code of Honor", 1954, "https://www.scientology.org/what-is-scientology/the-scientology-creeds-and-codes/the-code-of-honor.html", [], None, "Official page dates issue to 1954."),
    ("code-of-a-scientologist", "The Code of a Scientologist", 1954, "https://www.scientology.org/what-is-scientology/the-scientology-creeds-and-codes/the-code-of-a-scientologist.html", [], None, "First issued in 1954 and revised in 1969 and 1973."),
    ("advanced-procedure-and-axioms", "Advanced Procedure and Axioms", 1951, "https://www.scientology.org/store/item/advanced-procedure-and-axioms-hardcover.html", ["https://obnb.uk/p9001834-advanced-procedure-and-axioms"], None, None),
    ("dianetics-55", "Dianetics 55!", 1954, "https://www.scientology.org/store/item/dianetics-55-hardcover.html", ["https://cesnur.net/wp-content/uploads/2018/08/tjoc_2_4_3_camacho.pdf"], None, "Limited manuscript release is dated 1954; regular printed editions followed in 1955."),
    ("introduction-scientology-ethics", "Introduction to Scientology Ethics", 1968, "https://www.scientology.org/store/item/introduction-to-scientology-ethics-hardcover.html", ["https://search.worldcat.org/title/introduction-to-scientology-ethics/oclc/6572"], None, None),
]

scientology_records = []
for work_id, title, year, source_url, sources, alternate, note in scientology_specs:
    scientology_records.append(work(
        work_id, title, "scientology", "Scientology", year, "L. Ron Hubbard",
        f"A copyright-safe bibliographic record for {title}. Atlas describes publication history and source perspective without reproducing the work or treating its religious, psychological, historical, or health claims as independently verified.",
        source_url, rights=PROTECTED, alternate=alternate, extra_sources=sources,
        canon_status="The Church of Scientology identifies Hubbard's works and recorded lectures as religious scripture; this record does not infer how every Scientologist uses this item.",
        date_note=note,
    ))

scientology_records.extend([
    work("scientology-introductory-writings-guide", "Major introductory Scientology writings — collection guide", "scientology", "Scientology", None, "Multiple works by L. Ron Hubbard", "A navigation record for source-linked introductory writings. It is not a discrete authored work and has no fabricated publication date.", "https://www.scientology.org/what-is-scientology/", rights=PROTECTED, category="Collection guide — not a discrete work", source_status="Collection guide — metadata links only"),
    work("hubbard-bibliography-guide", "Broader L. Ron Hubbard bibliography — collection guide", "scientology", "Scientology", None, "L. Ron Hubbard", "A navigation record for the wider bibliography. Individual editions require their own publication dates and rights review.", "https://www.scientology.org/store/category/books.html", rights=PROTECTED, extra_sources=["https://obnb.uk/a00191772-l-ron-hubbard"], category="Collection guide — not a discrete work", source_status="Collection guide — metadata links only"),
])
profiles[0]["workIds"] = [item["id"] for item in scientology_records]


def existing_work(work_id, title, profile_id, year, author, description, source_url, **kwargs):
    return work(work_id, title, profile_id, profile_names[profile_id], year, author, description, source_url, **kwargs)


overrides = [
    existing_work("book-of-mormon", "Book of Mormon", "latter-day-saint-movement", 1830, "Joseph Smith, translator/author according to edition and community framing", "The 1830 Palmyra publication is documented separately from the text's account of ancient source plates. Atlas preserves the existing public-domain Project Gutenberg edition.", "https://www.loc.gov/resource/rbc.2015gen34953c1/?st=gallery", rights="Public-domain 1830 English edition and Project Gutenberg transcription in the United States; modern editions and Church site content may be protected.", extra_sources=["https://www.josephsmithpapers.org/paper-summary/book-of-mormon-1830/1", "https://www.gutenberg.org/ebooks/17"], edition_id="pg-17", canon_status="Canonical across many Latter Day Saint movements; edition and interpretive authority vary by community.", lat=43, lng=-77, themes=["revelation", "law", "afterlife"], confidence="D"),
    existing_work("doctrine-and-covenants", "Doctrine and Covenants", "latter-day-saint-movement", 1835, "Compilation with Joseph Smith and other contributors; contents vary by denomination and edition", "A collection of revelations and documents first published under this title in 1835. Later contents and canon status differ among Latter Day Saint communities.", "https://www.josephsmithpapers.org/bc-jsp/content/jsp/images/content/pdf/TOC/R2TOC.pdf", rights=LINK_ONLY, canon_status="Canonical form and section inventory vary across Latter Day Saint denominations."),
    existing_work("pearl-of-great-price", "Pearl of Great Price", "latter-day-saint-movement", 1851, "Compiled by Franklin D. Richards from Joseph Smith materials", "First published at Liverpool in 1851 and canonized by The Church of Jesus Christ of Latter-day Saints in 1880; contents changed across editions.", "https://www.josephsmithpapers.org/site/the-pearl-of-great-price", rights=LINK_ONLY, extra_sources=["https://www.churchofjesuschrist.org/study/manual/about-the-scriptures/history?lang=eng"], canon_status="A standard work in The Church of Jesus Christ of Latter-day Saints; not universal to all Latter Day Saint denominations."),
    existing_work("baha-i-kitab-i-aqdas", "The Kitáb-i-Aqdas", "bahai-faith-modern", 1873, "Bahá’u’lláh", "Bahá’u’lláh's book of laws, composed in Arabic around 1873. The linked authorized English translation was first published in 1992 and remains protected.", "https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-aqdas", rights="Original historical work and modern authorized translation have edition-specific rights. Atlas links to the authorized text and stores metadata only.", languages=["Arabic"], canon_status="Authoritative Bahá’í text; later supplements and authorized interpretation remain distinct."),
    existing_work("kitab-i-iqan", "The Kitáb-i-Íqán", "bahai-faith-modern", 1861, "Bahá’u’lláh", "A treatise revealed in Baghdad in 1861/62; the authorized English translation was first published in 1931.", "https://www.bahai.org/library/authoritative-texts/bahaullah/kitab-i-iqan/", rights="Original historical work and modern authorized translation have edition-specific rights. Atlas links to the authorized text and stores metadata only.", languages=["Persian"], date_note="Composed in 1861/62; the timeline anchor uses the documented modern composition period."),
    existing_work("oahspe", "Oahspe", "ufo-religions", 1882, "John Ballou Newbrough, compiler/claimed amanuensis", "First published in 1882 and presented by its compiler as received through automatic writing. Atlas records that origin as a claim, not independently verified authorship.", "https://books.google.com/books/about/Oahspe.html?id=yPsb0QEACAAJ", rights=PD_NOT_BUNDLED, extra_sources=["https://books.google.com/books/about/Oahspe_a_New_Bible_in_the_Words_of_Jehov.html?id=uN9CAQAAMAAJ"], canon_status="Influential in some later spiritual and UFO-religion currents; not a universal canon."),
    existing_work("urantia-book", "The Urantia Book", "ufo-religions", 1955, "Anonymous / attributed within the work to superhuman authors", "First published in 1955. Claims of celestial authorship are presented as the book's origin narrative, not independently verified history.", "https://www.urantia.org/urantia-book/front-matter", rights="The Urantia Foundation states the original 1955 English text is public domain; translations, marks, covers, and editorial material remain protected. No text is bundled here.", extra_sources=["https://www.urantia.org/terms-and-conditions"]),
    existing_work("a-course-in-miracles", "A Course in Miracles", "new-age-movements", 1975, "Helen Schucman, scribe; William Thetford, collaborator", "A modern work whose first offset sets appeared in 1975 and whose origin account describes inner dictation. Atlas separates that claim from documentary publication history.", "https://acim.org/fip/fip-timeline/", rights="Only the exact 1975 Criswell Edition is stated by the publisher to be public domain in the United States. Later editions, translations, supplements, additions, and editorial matter remain protected; no text is bundled.", extra_sources=["https://acim.org/permissions-policy/"], date_note="First offset edition in 1975; formal hardcover publication followed in 1976."),
    existing_work("the-book-of-the-law", "The Book of the Law / Liber AL vel Legis", "thelema", 1904, "Aleister Crowley", "A central Thelemic work described by Crowley as received in Cairo on 8–10 April 1904. The receipt claim and modern composition date are displayed separately.", "https://bubastis.oto-usa.org/about/liber-al-the-book-of-the-law", rights=PD_NOT_BUNDLED, alternate=["Liber AL vel Legis"], extra_sources=["https://warburg.sas.ac.uk/library-collections/warburg-institute-archive/archive-collections/yorke-collection"], date_note="Composed/claimed received in 1904; first Thelemic printing dated 1909."),
    existing_work("the-secret-doctrine", "The Secret Doctrine", "theosophy-modern", 1888, "Helena Petrovna Blavatsky", "A major Theosophical work first published in 1888. Later revised editions must remain distinct from the first publication.", "https://www.gutenberg.org/ebooks/54824", rights=PD_NOT_BUNDLED, date_note="First published in 1888; the linked public-domain transcription reflects a later revised edition."),
    existing_work("isis-unveiled", "Isis Unveiled", "theosophy-modern", 1877, "Helena Petrovna Blavatsky", "A two-volume Theosophical work first published in 1877.", "https://www.loc.gov/books/?q=%22Isis+Unveiled%22+Blavatsky", rights=PD_NOT_BUNDLED),
    existing_work("the-satanic-bible", "The Satanic Bible", "modern-satanism", 1969, "Anton Szandor LaVey", "A 1969 work associated with the Church of Satan. It represents one modern Satanist current and is not a universal Satanist scripture.", "https://churchofsatan.com/faq-literature/", rights=PROTECTED, canon_status="Foundational for the Church of Satan; not authoritative for all modern Satanist organizations or individuals."),
    existing_work("the-satanic-rituals", "The Satanic Rituals", "modern-satanism", 1972, "Anton Szandor LaVey", "A copyrighted Church of Satan publication cataloged as an organization-specific work. Atlas does not reproduce or operationalize its ritual content.", "https://churchofsatan.com/faq-literature/", rights=PROTECTED, canon_status="Organization-specific historical publication; not a universal Satanist canon."),
    existing_work("selected-luciferian-writings", "Luciferian traditions — collection guide", "luciferian-traditions", None, "Multiple authors and currents", "A navigation guide to named Luciferian literary, esoteric, and self-identified religious works. It is not a discrete work and has no invented publication date.", "https://academic.oup.com/book/11601/chapter-abstract/160465083", rights=LINK_ONLY, category="Collection guide — not a discrete work", source_status="Collection guide — metadata links only", canon_status="No universal Luciferian canon."),
    existing_work("selected-modern-satanic-philosophical-texts", "Modern Satanist writings — collection guide", "modern-satanism", None, "Multiple authors and organizations", "A navigation guide for organization-specific modern Satanist philosophical texts. It is not a discrete work or universal canon.", "https://www.cambridge.org/core/elements/abs/satanism/4150D0B522022169485FCD56FA7FE2BE", rights=LINK_ONLY, category="Collection guide — not a discrete work", source_status="Collection guide — metadata links only", canon_status="No universal modern Satanist canon."),
]

records = [
    work("science-and-health", "Science and Health with Key to the Scriptures", "christian-science", "Christian Science", 1875, "Mary Baker Eddy", "The central Christian Science textbook, first published in 1875. Religious healing claims are presented as teachings, not clinical evidence or health advice.", "https://www.christianscience.com/publishing/primary-texts-the-bible-and-science-and-health/science-and-health", rights="The English historical text is public domain in the United States according to Church guidance; current editions, translations, typography, editorial matter, and marks may be protected. No text is bundled.", extra_sources=["https://www.christianscience.com/legal/introduction-to-hybrid-services-guidelines/copyright-guidelines-for-branches-holding-hybrid-services-in-the-us"]),
    work("philosophy-of-freedom", "The Philosophy of Freedom", "anthroposophy", "Anthroposophy", 1894, "Rudolf Steiner", "A philosophical work that became important in Steiner's later Anthroposophical corpus.", "https://erste.goetheanum.org/medicine/Section_new/further_reading.htm", rights=PD_NOT_BUNDLED, alternate=["The Philosophy of Spiritual Activity"]),
    work("theosophy-rudolf-steiner", "Theosophy", "anthroposophy", "Anthroposophy", 1904, "Rudolf Steiner", "A 1904 work in Steiner's developing spiritual-scientific corpus; it should not be confused with the broader Theosophical movement or Blavatsky's works.", "https://erste.goetheanum.org/rsteiner_e/1904.html", rights=PD_NOT_BUNDLED),
    work("modern-spiritualism-literature-guide", "Modern Spiritualist literature — collection guide", "modern-spiritualism", "Modern Spiritualism", None, "Multiple authors, organizations, and historical communities", "A navigation record for source-linked Modern Spiritualist literature. It is not a discrete work, does not assign a closed canon, and does not collapse Anglo-American Spiritualism into Kardecist Spiritism.", "https://nsac.org/education/", rights=LINK_ONLY, category="Collection guide — not a discrete work", source_status="Collection guide — metadata links only", extra_sources=["https://blogs.loc.gov/teachers/2023/04/teaching-scientific-literacy-the-case-of-the-psychic-force/"], canon_status="No universal closed canon; organization, community, mediumship, and publication contexts require separate records."),
    work("thanh-ngon-hiep-tuyen", "Thánh Ngôn Hiệp Tuyển, volume 1", "cao-dai", "Cao Đài", 1928, "Cao Đài compilation; contributor and branch context require edition-specific study", "An early Cao Đài scripture compilation first published in 1928. The linked organization asserts rights over its edition.", "https://caodaism.org/thumuc2.htm", rights="The linked Cao Đài organization asserts copyright. Atlas stores metadata and links only; no text is bundled.", languages=["Vietnamese"], extra_sources=["https://www.daotam.info/booksv/tailieusuutap-pdf/19280000-ThanhNgonHiepTuyen_Q-1_1928_%28v2024%29.pdf"], canon_status="Important in the Tây Ninh textual tradition; authority across all branches is not inferred."),
    work("ofudesaki", "Ofudesaki", "tenrikyo", "Tenrikyo", 1928, "Miki Nakayama", "A Tenrikyo scripture composed from 1869 to 1882 in 1,711 verses and first published in 1928.", "https://www.tenrikyo.or.jp/en/newsletter/html/tt6/ofudesaki.html", rights=LINK_ONLY, languages=["Japanese"], extra_sources=["https://online.tenrikyo.or.jp/?p=5626"], date_note="Composed 1869–1882; first published April 1928. Timeline uses the documented publication date."),
    work("zhuan-falun", "Zhuan Falun", "falun-gong", "Falun Gong / Falun Dafa", 1994, "Li Hongzhi", "A central Falun Dafa text dated December 1994 in the movement's publication catalog. Supernatural and health propositions are presented as teachings, not verified outcomes or medical advice.", "https://www.falundafa.org/eng/falun-dafa-books.html", rights="Copyright © Li Hongzhi; official terms prohibit unauthorized copying, distribution, modification, or derivative use. Metadata and links only.", languages=["Chinese"], extra_sources=["https://falundafa.org/index.html"]),
    work("holy-piby", "The Holy Piby", "rastafari", "Rastafari", 1924, "Robert Athlyi Rogers", "An Ethiopianist text that influenced some later Rastafari currents. It predates Rastafari's early-1930s emergence and is not a universal Rastafari canon.", "https://search.worldcat.org/title/The-Holy-Piby/oclc/587369683", rights=PD_NOT_BUNDLED),
    work("message-to-blackman-in-america", "Message to the Blackman in America", "nation-of-islam", "Nation of Islam", 1965, "Elijah Muhammad", "A major Nation of Islam publication from 1965. It is cataloged within the movement's distinct institutional history.", "https://search.worldcat.org/title/1036679279", rights=PROTECTED),
    work("dawn-of-a-new-morning", "Den ny morgens gry: verdensbygmesterens genkomst", "luciferian-traditions", "Luciferian traditions", 1906, "Carl William Hansen (Ben Kadosh)", "A 1906 Danish work discussed in scholarship on modern Luciferian esotericism. Later translations remain edition-specific.", "https://lup.lub.lu.se/search/publication/64758e13-dce6-4207-b7a4-912f5428441d", rights=PD_NOT_BUNDLED, alternate=["Dawn of a New Morning: Return of the World's Master Builder"], languages=["Danish"]),
    work("science-of-mind", "The Science of Mind", "new-thought", "New Thought", 1926, "Ernest Holmes", "A 1926 work associated with Religious Science. It represents one New Thought organization and is not a universal New Thought canon.", "https://search.worldcat.org/title/Science-of-Mind-%28The-Original-1926-Edition%29/oclc/1006243439", rights="The original 1926 edition is described by its publisher as public domain; the expanded 1938 text and current editions remain protected. No text is bundled.", extra_sources=["https://www.scienceofmind.com/e-mail/som_book.html"]),
    work("twelve-blessings", "The Twelve Blessings", "ufo-religions", "UFO religions", 1958, "George King", "An Aetherius Society work based on addresses dated from July to October 1958. It belongs to one movement within the UFO-religion umbrella.", "https://www.aetherius.org/the-twelve-blessings/", rights=PROTECTED, canon_status="Aetherius Society publication; not an umbrella UFO-religion canon."),
    work("book-which-tells-the-truth", "The Book Which Tells the Truth", "ufo-religions", "UFO religions", 1974, "Claude Vorilhon (Raël)", "An early Raëlian movement publication from 1974, now circulated within later compilations. Claimed extraterrestrial revelation remains an attributed movement claim.", "https://www.rael.org/wp-content/uploads/2019/07/ID_en.pdf", rights=PROTECTED, languages=["French"], canon_status="Raëlian movement publication; not an umbrella UFO-religion canon."),
    work("law-of-one-ra-material", "The Law of One / Ra Material", "new-age-movements", "New Age movements", 1981, "L/L Research participants; attributed by the publishers to a channeled source called Ra", "A session-based publication whose first recorded session is dated 15 January 1981. The channeling account is a source claim, not verified authorship or contact.", "https://www.llresearch.org/channeling/ra-contact/intro", rights="Copyrighted and not public domain under the publisher's policy. Atlas stores metadata and links only and does not reproduce, index, embed, imitate, or generate new material in the source's claimed voice.", extra_sources=["https://www.llresearch.org/copyright"]),
    work("seth-material", "The Seth Material", "new-age-movements", "New Age movements", 1963, "Jane Roberts; attributed by Roberts to a channeled personality called Seth", "A body of books and archival material developing from sessions Roberts reported beginning in December 1963. The channeling account remains attributed, and published texts are copyrighted.", "https://hdl.handle.net/10079/fa/mssa.ms.1090", rights="Published works and much archival material remain copyrighted or permission-controlled. Atlas stores archive metadata and links only; confidential archival material is excluded.", extra_sources=["https://ead-pdfs.library.yale.edu/4482.pdf"], date_note="Claimed channeling began in December 1963; subsequent books and archival materials have separate publication dates."),
]

evidence_records = [
    {"id":"scientology-official-beliefs","subjectType":"tradition","subjectId":"scientology","section":"Official Teaching","category":"Official teaching","sourceType":"Official primary source","perspective":"Church of Scientology self-description","status":"Attributed institutional teaching","summary":"The Church presents Scientology as a religion centered on the spiritual being and a path of study and auditing.","evidentiaryLimit":"Documents what the Church teaches; it is not independent verification of spiritual, therapeutic, historical, or organizational claims.","sourceTitle":"What is Scientology?","publisher":"Church of Scientology International","publicationDate":"Current official page; accessed 2026-10-10","sourceUrl":"https://www.scientology.org/what-is-scientology/","independenceGroup":"official-scientology","derivedFromIds":[],"responseToIds":[],"rights":"Metadata, paraphrase, and link only."},
    {"id":"scientology-official-creeds-codes","subjectType":"tradition","subjectId":"scientology","section":"Official Teaching","category":"Official teaching","sourceType":"Official primary source","perspective":"Church of Scientology self-description","status":"Attributed institutional teaching","summary":"The Church publishes a portal for its creed and several public codes, each of which is cataloged separately where dated.","evidentiaryLimit":"Documents public institutional texts and their stated roles; it does not establish universal individual adherence.","sourceTitle":"The Scientology Creeds and Codes","publisher":"Church of Scientology International","publicationDate":"Current official page; accessed 2026-10-10","sourceUrl":"https://www.scientology.org/what-is-scientology/the-scientology-creeds-and-codes/","independenceGroup":"official-scientology","derivedFromIds":[],"responseToIds":[],"rights":"Metadata, paraphrase, and link only."},
    {"id":"scientology-academic-westbrook","subjectType":"tradition","subjectId":"scientology","section":"Historical / Academic Analysis","category":"Academic history","sourceType":"Academic monograph","perspective":"Religious-studies scholarship based on interviews and fieldwork","status":"Published academic analysis","summary":"Donald Westbrook studies Scientology's history, theology, institutions, and lived practice.","evidentiaryLimit":"One scholarly monograph with a stated method and scope; it is not a substitute for the full literature or source-specific verification.","sourceTitle":"Among the Scientologists: History, Theology, and Praxis","publisher":"Oxford University Press","publicationDate":"2018 online; 2019 print","sourceUrl":"https://academic.oup.com/book/6885","independenceGroup":"academic-westbrook","derivedFromIds":[],"responseToIds":[],"rights":"Bibliographic metadata and link only."},
    {"id":"scientology-academic-urban","subjectType":"tradition","subjectId":"scientology","section":"Historical / Academic Analysis","category":"Academic history","sourceType":"Academic monograph excerpt","perspective":"Historical and religious-studies analysis","status":"Published academic analysis","summary":"Hugh Urban examines Scientology as a modern religion within twentieth-century American history and debates over secrecy, law, and religion.","evidentiaryLimit":"A scholarly interpretation; contested claims and events still require direct source and case review.","sourceTitle":"The Church of Scientology: A History of a New Religion","publisher":"Princeton University Press","publicationDate":"2011","sourceUrl":"https://assets.press.princeton.edu/chapters/i9515.pdf","independenceGroup":"academic-urban","derivedFromIds":[],"responseToIds":[],"rights":"Publisher excerpt; link only."},
    {"id":"scientology-legal-hernandez","subjectType":"tradition","subjectId":"scientology","section":"Legal / Government Records","category":"Legal/government record","sourceType":"Court judgment","perspective":"United States Supreme Court","status":"Decided case","summary":"The Court addressed whether fixed payments for Scientology auditing and training were deductible charitable contributions under federal tax law.","evidentiaryLimit":"The holding concerns the tax issue and record before the Court; it is not a general judgment on every Scientology belief or practice.","sourceTitle":"Hernandez v. Commissioner, 490 U.S. 680","publisher":"United States Supreme Court / U.S. Reports","publicationDate":"1989-06-05","sourceUrl":"https://tile.loc.gov/storage-services/service/ll/usrep/usrep490/usrep490680/usrep490680.pdf","independenceGroup":"court-us-hernandez","derivedFromIds":[],"responseToIds":[],"jurisdiction":"United States","docketReference":"No. 87-963","decisionDate":"1989-06-05","disposition":"Judgment affirmed; fixed payments were not deductible as charitable contributions on the record considered.","rights":"Official court record."},
    {"id":"scientology-legal-hodkin","subjectType":"tradition","subjectId":"scientology","section":"Legal / Government Records","category":"Legal/government record","sourceType":"Court judgment","perspective":"United Kingdom Supreme Court","status":"Decided case","summary":"The Court considered whether a Scientology chapel qualified as a place of meeting for religious worship under English registration law.","evidentiaryLimit":"The decision interprets a specific statutory question in the United Kingdom and does not settle religious status for every jurisdiction or purpose.","sourceTitle":"R (Hodkin) v Registrar General [2013] UKSC 77","publisher":"UK Supreme Court","publicationDate":"2013-12-11","sourceUrl":"https://www.supremecourt.uk/cases/uksc-2013-0030","independenceGroup":"court-uk-hodkin","derivedFromIds":[],"responseToIds":[],"jurisdiction":"United Kingdom","docketReference":"UKSC 2013/0030","decisionDate":"2013-12-11","disposition":"Appeal allowed; the chapel could be registered under the Court's interpretation of religious worship.","rights":"Official court record."},
    {"id":"scientology-legal-echr-moscow","subjectType":"tradition","subjectId":"scientology","section":"Legal / Government Records","category":"Legal/government record","sourceType":"International court judgment","perspective":"European Court of Human Rights","status":"Decided case","summary":"The Court reviewed Russia's refusal to re-register the Church of Scientology Moscow under Convention rights.","evidentiaryLimit":"The judgment concerns the applicant, evidence, law, and period before the Court; it is not a global organizational finding.","sourceTitle":"Church of Scientology Moscow v. Russia","publisher":"European Court of Human Rights","publicationDate":"2007-04-05","sourceUrl":"https://hudoc.echr.coe.int/eng?i=001-80039","independenceGroup":"court-echr-moscow","derivedFromIds":[],"responseToIds":[],"jurisdiction":"Council of Europe / Russian Federation","docketReference":"Application no. 18147/02","decisionDate":"2007-04-05","disposition":"Court found violations of Articles 11 and 9 in the refusal to re-register.","rights":"Official court record."},
    {"id":"scientology-criticism-going-clear","subjectType":"tradition","subjectId":"scientology","section":"Criticism / Controversy","category":"Criticism","sourceType":"Investigative journalism book","perspective":"Critical journalistic investigation","status":"Published critical account","summary":"Lawrence Wright's book presents a journalistic history and critical investigation of Scientology and reported member experiences.","evidentiaryLimit":"Documents the author's investigation, sourcing, and analysis; contested claims require claim-specific corroboration and linked responses.","sourceTitle":"Going Clear","publisher":"Penguin Random House","publicationDate":"2013","sourceUrl":"https://www.penguinrandomhouse.com/books/212925/going-clear-by-lawrence-wright/9780307745309/","independenceGroup":"journalism-wright","derivedFromIds":[],"responseToIds":[],"rights":"Bibliographic metadata and link only."},
    {"id":"scientology-former-member-remini","subjectType":"tradition","subjectId":"scientology","section":"Criticism / Controversy","category":"Former-member account","sourceType":"First-person memoir","perspective":"Former-member personal account","status":"Attributed testimony","summary":"Leah Remini recounts her experience in and departure from Scientology and allegations about the organization.","evidentiaryLimit":"Documents the author's reported experience and perspective; it does not independently prove every allegation.","sourceTitle":"Troublemaker","publisher":"Penguin Random House","publicationDate":"2015","sourceUrl":"https://www.penguinrandomhouse.com/books/253674/troublemaker-by-leah-remini/","independenceGroup":"memoir-remini","derivedFromIds":[],"responseToIds":[],"rights":"Bibliographic metadata and link only."},
    {"id":"scientology-media-remini-lawsuit","subjectType":"tradition","subjectId":"scientology","section":"Criticism / Controversy","category":"Media report","sourceType":"News report","perspective":"Journalistic report of a filed complaint and response","status":"Allegations and denial reported; adjudication not established here","summary":"The report describes allegations in Leah Remini's 2023 lawsuit and records a Church response.","evidentiaryLimit":"Documents what the complaint alleged, the Church's response, and procedural status as reported; filing an allegation is not adjudication.","sourceTitle":"Leah Remini sues Scientology","publisher":"Los Angeles Times","publicationDate":"2023-08-02","sourceUrl":"https://www.latimes.com/entertainment-arts/story/2023-08-02/leah-remini-sues-scientology-alleging-stalking-defamation-harassment","independenceGroup":"journalism-latimes-remini","derivedFromIds":[],"responseToIds":[],"rights":"News metadata, original summary, and link only."},
    {"id":"scientology-unverified-membership","subjectType":"tradition","subjectId":"scientology","section":"Criticism / Controversy","category":"Unverified claim","sourceType":"Official claim with non-equivalent census context","perspective":"Church claim compared with limited-jurisdiction public statistics","status":"Unverified","summary":"The Church states global membership and organizational-scale figures; this record preserves the claim without converting it into an audited count.","evidentiaryLimit":"The global membership figure is a claim by the Church and is not independently verified in this record. Census affiliation counts cover limited jurisdictions and use different definitions, so they neither verify nor directly disprove the global claim.","sourceTitle":"Scientology global-scale claim and ONS Census context","publisher":"Church of Scientology International; UK Office for National Statistics","publicationDate":"Current claim and 2021 census","sourceUrl":"https://www.scientology.org/spiritual-technology/index.foreign.html","independenceGroup":"official-claim-with-ons-context","derivedFromIds":[],"responseToIds":[],"rights":"Metadata and source links only.","additionalSourceUrls":["https://www.ons.gov.uk/datasets/TS031/editions/2021/versions/2?showAll=religion_58a"]},
    {"id":"scientology-response-going-clear","subjectType":"tradition","subjectId":"scientology","section":"Church Responses","category":"Church response","sourceType":"Official response","perspective":"Church-affiliated publication response","status":"Attributed institutional rebuttal","summary":"Freedom Magazine presents the Church's response to Going Clear and related claims.","evidentiaryLimit":"Documents the Church's stated rebuttal; it is not independent corroboration.","sourceTitle":"Church response to Going Clear","publisher":"Freedom Magazine / Church-affiliated publication","publicationDate":"2015","sourceUrl":"https://www.freedommag.org/going-clear/","independenceGroup":"official-scientology-response","derivedFromIds":[],"responseToIds":["scientology-criticism-going-clear"],"rights":"Metadata, paraphrase, and link only."},
    {"id":"scientology-response-remini","subjectType":"tradition","subjectId":"scientology","section":"Church Responses","category":"Church response","sourceType":"Official response","perspective":"Church of Scientology response","status":"Attributed institutional rebuttal","summary":"The Church published a response to ABC questions concerning Leah Remini and her book.","evidentiaryLimit":"Documents the Church's stated rebuttal; it is not independent corroboration and does not adjudicate disputed allegations.","sourceTitle":"Church of Scientology response to ABC News 20/20 inquiry","publisher":"Church of Scientology International","publicationDate":"2015-10-26","sourceUrl":"https://www.scientologynews.org/statements/abc-news/church-of-scientology-response-to-abc-news-20x20-inquiry-1.html","independenceGroup":"official-scientology-response","derivedFromIds":[],"responseToIds":["scientology-former-member-remini"],"rights":"Metadata, paraphrase, and link only."},
]

bibliography = [
    {"id":"bib-scientology-westbrook","subjectId":"scientology","title":"Among the Scientologists: History, Theology, and Praxis","author":"Donald A. Westbrook","published":"2018 online / 2019 print","perspective":"Academic religious-studies monograph","sourceUrl":"https://academic.oup.com/book/6885","rights":"Bibliographic metadata and link only","scope":"Academic monograph using interviews, fieldwork, and historical analysis."},
    {"id":"bib-scientology-lewis","subjectId":"scientology","title":"Scientology","author":"James R. Lewis, editor","published":"2009","perspective":"Academic multi-author collection","sourceUrl":"https://academic.oup.com/book/2335","rights":"Bibliographic metadata and link only","scope":"Multi-author academic collection with varied topics and methods."},
    {"id":"bib-scientology-genter","subjectId":"scientology","title":"Constructing a Plan for Survival: Scientology as Cold War Psychology","author":"Robert Genter","published":"2018","perspective":"Academic historical analysis","sourceUrl":"https://www.cambridge.org/core/journals/religion-and-american-culture/article/abs/constructing-a-plan-for-survival-scientology-as-cold-war-psychology/D1B26338C158D41BCBDAC6DDC2DFF4A3","rights":"Bibliographic metadata and link only","scope":"Academic historical analysis of a bounded period and argument."},
    {"id":"bib-scientology-urban","subjectId":"scientology","title":"The Church of Scientology: A History of a New Religion","author":"Hugh B. Urban","published":"2011","perspective":"Academic history and religious-studies analysis","sourceUrl":"https://assets.press.princeton.edu/chapters/i9515.pdf","rights":"Publisher excerpt; link only","scope":"Academic history with source-specific arguments that should be assessed alongside primary records."},
    {"id":"bib-scientology-wright","subjectId":"scientology","title":"Going Clear","author":"Lawrence Wright","published":"2013","perspective":"Investigative journalism","sourceUrl":"https://www.penguinrandomhouse.com/books/212925/going-clear-by-lawrence-wright/9780307745309/","rights":"Bibliographic metadata and link only","scope":"Investigative journalism; not labeled as academic consensus."},
    {"id":"bib-scientology-remini","subjectId":"scientology","title":"Troublemaker","author":"Leah Remini with Rebecca Paley","published":"2015","perspective":"Former-member memoir","sourceUrl":"https://www.penguinrandomhouse.com/books/253674/troublemaker-by-leah-remini/","rights":"Bibliographic metadata and link only","scope":"Former-member memoir and personal account."},
    {"id":"bib-scientology-terms","subjectId":"scientology","title":"Scientology website terms","author":"Church of Scientology International","published":"Current policy; accessed 2026-10-10","perspective":"Official rights policy","sourceUrl":"https://www.scientology.org/terms.html","rights":"Official rights policy","scope":"Establishes the site's asserted copyright and permitted-access boundary."},
    {"id":"bib-scientology-cst","subjectId":"scientology","title":"Church of Spiritual Technology copyright role","author":"Church of Scientology International","published":"Current official page; accessed 2026-10-10","perspective":"Official institutional self-description","sourceUrl":"https://www.scientology.org/faq/church-management/what-is-church-of-spiritual-technology.html","rights":"Official self-description","scope":"Documents the Church's description of CST's copyright role; not independent legal adjudication."},
]

origin_claims = [
    {"id":"origin-book-of-mormon","workId":"book-of-mormon","documentedDate":"1830 first publication","claimedOrigin":"The text and movement describe translation from ancient plates delivered by an angel.","datingExplanation":"Atlas uses the documented 1830 publication for the timeline and records the ancient-plate account as a religious origin claim.","sourceUrl":"https://www.loc.gov/resource/rbc.2015gen34953c1/?st=gallery"},
    {"id":"origin-oahspe","workId":"oahspe","documentedDate":"1882 first publication","claimedOrigin":"Newbrough presented the work as received through automatic writing from nonhuman spiritual sources.","datingExplanation":"The record is dated to the 1882 publication, not to the cosmological chronology narrated in the work.","sourceUrl":"https://books.google.com/books/about/Oahspe.html?id=yPsb0QEACAAJ"},
    {"id":"origin-urantia","workId":"urantia-book","documentedDate":"1955 first publication","claimedOrigin":"The work presents its papers as authored or sponsored by superhuman personalities.","datingExplanation":"The timeline uses the documented 1955 publication and does not treat claimed celestial authorship as historical dating evidence.","sourceUrl":"https://www.urantia.org/urantia-book/front-matter"},
    {"id":"origin-acim","workId":"a-course-in-miracles","documentedDate":"1975 first offset edition; 1976 hardcover","claimedOrigin":"The publication history describes Schucman's experience of inner dictation identified within the project with Jesus.","datingExplanation":"Atlas dates the work to its modern transcription and publication history while attributing the revelatory claim to the source community.","sourceUrl":"https://acim.org/fip/fip-timeline/"},
    {"id":"origin-law-one","workId":"law-of-one-ra-material","documentedDate":"Sessions began 15 January 1981","claimedOrigin":"The publishers attribute the session speech to a source called Ra.","datingExplanation":"The timeline uses the recorded 1981 session date. Atlas does not verify channeling, imitate the source voice, or generate new sessions.","sourceUrl":"https://www.llresearch.org/channeling/ra-contact/intro"},
    {"id":"origin-seth","workId":"seth-material","documentedDate":"Reported sessions began December 1963","claimedOrigin":"Roberts attributed the communications to a personality called Seth.","datingExplanation":"The record uses the documented modern session and archival chronology; the claimed communicating identity remains attributed testimony.","sourceUrl":"https://hdl.handle.net/10079/fa/mssa.ms.1090"},
    {"id":"origin-book-law","workId":"the-book-of-the-law","documentedDate":"Composed/claimed received 8–10 April 1904; printed 1909","claimedOrigin":"Crowley described the text as dictated by a praeterhuman intelligence called Aiwass.","datingExplanation":"Atlas uses the modern 1904 composition/receipt claim and 1909 publication history; no ancient date is assigned.","sourceUrl":"https://bubastis.oto-usa.org/about/liber-al-the-book-of-the-law"},
]

colors = ["#74533d", "#557a6b", "#596c8e", "#7a5d78", "#6d6a3f", "#47747c", "#8a6255", "#5f6f55", "#765b8a", "#4f778f", "#79544d", "#526b7c", "#6c597f", "#7b5848", "#6d657b", "#537563", "#7a6b4e", "#5c637f"]
traditions = [tradition(item["id"], item["name"], item["region"], item["summary"], colors[index]) for index, item in enumerate(profiles)]

payload = {
    "policy": "Modern religious claims remain attributed to their source perspective. Official teaching, scholarship, courts, government records, criticism, former-member testimony, journalism, unverified claims, and institutional responses are not interchangeable. Copyrighted texts stay metadata-only unless an exact licensed or public-domain edition is verified.",
    "copyrightPolicy": "No copyrighted full text, confidential material, archival restriction, generated channeling, or imitated revelatory voice is included. Historical public-domain status never transfers automatically to a modern translation, edition, image, mark, or editorial apparatus.",
    "traditions": traditions,
    "profiles": profiles,
    "overrides": overrides,
    "records": [*scientology_records, *records],
    "evidenceRecords": evidence_records,
    "bibliographyEntries": bibliography,
    "originClaims": origin_claims,
}

OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(profiles)} profiles, {len(overrides)} overrides, {len(payload['records'])} new works, {len(evidence_records)} evidence records, {len(origin_claims)} origin claims")
