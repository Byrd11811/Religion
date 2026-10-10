#!/usr/bin/env python3
"""Build Atlas Phase 15 ontology and entity research data deterministically."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "seed" / "ontology-entities.json"
ANUNNA_EVIDENCE = ROOT / "data" / "research" / "anunnaki-evidence.json"
ORACC_DATA = ROOT / "data" / "open-data" / "oracc-epsd2-literary-selected.json"
REVIEWED_AT = "2026-10-10"
CATALOG_RECORD_FILES = [
    (ROOT / "data" / "seed" / "texts.json", None),
    (ROOT / "data" / "seed" / "egypt-additions.json", "records"),
    (ROOT / "data" / "seed" / "mesopotamia-additions.json", "records"),
    (ROOT / "data" / "seed" / "china-additions.json", "records"),
    (ROOT / "data" / "seed" / "horn-additions.json", "records"),
    (ROOT / "data" / "seed" / "indigenous-additions.json", "records"),
    (ROOT / "data" / "seed" / "regional-coverage.json", "records"),
    (ROOT / "data" / "seed" / "manuscript-expansion.json", "workRecords"),
    (ROOT / "data" / "seed" / "esoteric-literature.json", "records"),
    (ROOT / "data" / "seed" / "modern-religions.json", "records"),
]


def load_catalog_work_ids() -> set[str]:
    work_ids: set[str] = set()
    for path, record_key in CATALOG_RECORD_FILES:
        with path.open(encoding="utf-8") as handle:
            payload = json.load(handle)
        records = payload if record_key is None else payload.get(record_key, [])
        work_ids.update(record["id"] for record in records)
    return work_ids


def source(source_id: str, label: str, url: str, kind: str, perspective: str) -> dict:
    return {
        "id": source_id,
        "label": label,
        "url": url,
        "kind": kind,
        "perspective": perspective,
        "accessed": REVIEWED_AT,
    }


SOURCES = [
    source(
        "src-atlas-gap-audit",
        "Atlas repository — local locator docs/atlas-completion-gap-audit.md",
        "https://github.com/Byrd11811/Religion/blob/main/docs/atlas-completion-gap-audit.md",
        "project requirement",
        "Atlas acceptance baseline; not historical evidence",
    ),
    source(
        "src-oracc-anunna",
        "Ancient Mesopotamian Gods and Goddesses: Anunna",
        "https://oracc.museum.upenn.edu/amgg/listofdeities/anunna/",
        "scholarly reference",
        "ORACC historical overview",
    ),
    source(
        "src-oracc-enki",
        "Ancient Mesopotamian Gods and Goddesses: Enki/Ea",
        "https://oracc.museum.upenn.edu/amgg/listofdeities/enki/",
        "scholarly reference",
        "ORACC historical overview",
    ),
    source(
        "src-oracc-inana",
        "Ancient Mesopotamian Gods and Goddesses: Inana/Ištar",
        "https://oracc.museum.upenn.edu/amgg/listofdeities/inana/",
        "scholarly reference",
        "ORACC historical overview",
    ),
    source(
        "src-oracc-utu",
        "Ancient Mesopotamian Gods and Goddesses: Utu/Šamaš",
        "https://oracc.museum.upenn.edu/amgg/listofdeities/utu/",
        "scholarly reference",
        "ORACC historical overview",
    ),
    source(
        "src-ucl-egypt-deities",
        "Digital Egypt for Universities: deities",
        "https://www.ucl.ac.uk/museums-static/digitalegypt/religion/deitiesindex.html",
        "scholarly reference",
        "University College London overview of Egyptian names and roles",
    ),
    source(
        "src-gutenberg-book-dead",
        "The Book of the Dead — E. A. Wallis Budge edition",
        "https://www.gutenberg.org/ebooks/7145",
        "public-domain edition",
        "Early twentieth-century English edition; terminology is historically situated",
    ),
    source(
        "src-ctext-dao-de-jing",
        "Chinese Text Project: Dao De Jing",
        "https://ctext.org/dao-de-jing",
        "digital primary-source edition",
        "Received Chinese text with project metadata",
    ),
    source(
        "src-ctext-book-changes",
        "Chinese Text Project: Book of Changes",
        "https://ctext.org/book-of-changes",
        "digital primary-source edition",
        "Received Chinese text with project metadata",
    ),
    source(
        "src-loc-laozi",
        "Library of Congress: Laozi Dao de jing",
        "https://www.loc.gov/resource/gdcwdl.wdl_13543/?fo=json",
        "library collection record",
        "Institutional record discussing the received work, Guodian, and Mawangdui witnesses",
    ),
    source(
        "src-sefaria-deuteronomy-13",
        "Deuteronomy 13 — Sefaria",
        "https://www.sefaria.org/Deuteronomy.13",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-1-samuel-2",
        "1 Samuel 2 — Sefaria",
        "https://www.sefaria.org/I_Samuel.2",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-nahum-1",
        "Nahum 1 — Sefaria",
        "https://www.sefaria.org/Nahum.1",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-judges-2",
        "Judges 2 — Sefaria",
        "https://www.sefaria.org/Judges.2",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-1-kings-18",
        "1 Kings 18 — Sefaria",
        "https://www.sefaria.org/I_Kings.18",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-job-1",
        "Job 1 — Sefaria",
        "https://www.sefaria.org/Job.1",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-zechariah-3",
        "Zechariah 3 — Sefaria",
        "https://www.sefaria.org/Zechariah.3",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-sefaria-isaiah-14",
        "Isaiah 14 — Sefaria",
        "https://www.sefaria.org/Isaiah.14",
        "digital primary-source edition",
        "Hebrew source for the passage later rendered with Lucifer in Latin",
    ),
    source(
        "src-vatican-vulgate-isaiah",
        "Nova Vulgata: Isaias",
        "https://www.vatican.va/archive/bible/nova_vulgata/documents/nova-vulgata_vt_isaiae_lt.html",
        "official primary-source edition",
        "Modern Vatican edition of the Latin Vulgate tradition",
    ),
    source(
        "src-vatican-vulgate-2-peter",
        "Nova Vulgata: Second Letter of Peter",
        "https://www.vatican.va/archive/bible/nova_vulgata/documents/nova-vulgata_nt_epist-ii-petri_lt.html",
        "official primary-source edition",
        "Modern Vatican edition of the Latin Vulgate tradition",
    ),
    source(
        "src-sefaria-leviticus-16",
        "Leviticus 16 — Sefaria",
        "https://www.sefaria.org/Leviticus.16",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-isac-about",
        "Institute for the Study of Ancient Cultures: About",
        "https://isac.uchicago.edu/about",
        "institutional source",
        "Institute self-description",
    ),
    source(
        "src-uchicago-isac-renaming",
        "University of Chicago announces Institute for the Study of Ancient Cultures name",
        "https://news.uchicago.edu/story/oriental-institute-changes-name-institute-study-ancient-cultures-west-asia-north-africa",
        "institutional news",
        "University account of institutional renaming",
    ),
    source(
        "src-fordham-nicaea",
        "Internet Medieval Sourcebook: Council of Nicaea",
        "https://sourcebooks.fordham.edu/basis/nicea1.txt",
        "university-hosted primary-source translation",
        "Historical source translation and documents",
    ),
    source(
        "src-vatican-nicaea",
        "Vatican: First Council of Nicaea — 325",
        "https://www.vatican.va/roman_curia/congregations/cfaith/cti_documents/rc_cti_doc_20250403_comunicato-1700-nicea_en.html",
        "institutional commemoration",
        "Later institutional reception of Nicaea",
    ),
    source(
        "src-vatican-catechism-purgatory",
        "Catechism of the Catholic Church: final purification or purgatory",
        "https://www.vatican.va/archive/ENG0015/__P2N.HTM",
        "official doctrinal source",
        "Catholic institutional usage; not a universal afterlife category",
    ),
    source(
        "src-suttacentral-anattalakkhana",
        "SuttaCentral: SN 22.59, The Characteristic of Not-Self",
        "https://suttacentral.net/sn22.59",
        "digital primary-source edition",
        "Pali Buddhist source with editions and translations",
    ),
    source(
        "src-stanford-buddha",
        "Stanford Encyclopedia of Philosophy: Buddha",
        "https://plato.stanford.edu/entries/buddha/",
        "scholarly reference",
        "Peer-reviewed philosophical overview",
    ),
    source(
        "src-stanford-hinduism",
        "Stanford Encyclopedia of Philosophy: Personhood in Classical Indian Philosophy",
        "https://plato.stanford.edu/entries/personhood-india/",
        "scholarly reference",
        "Peer-reviewed philosophical overview",
    ),
    source(
        "src-stanford-chinese-metaphysics",
        "Stanford Encyclopedia of Philosophy: Metaphysics in Chinese Philosophy",
        "https://plato.stanford.edu/entries/chinese-metaphysics/",
        "scholarly reference",
        "Peer-reviewed philosophical overview",
    ),
    source(
        "src-perseus-lsj",
        "Perseus Digital Library: Liddell-Scott-Jones Greek Lexicon",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0057",
        "scholarly lexicon",
        "Historical Greek lexicographic reference",
    ),
    source(
        "src-sefaria-genesis-2",
        "Genesis 2 — Sefaria",
        "https://www.sefaria.org/Genesis.2",
        "digital primary-source edition",
        "Hebrew Bible text and linked translation",
    ),
    source(
        "src-encyclopaedia-belial",
        "Encyclopaedia Judaica entry: Belial",
        "https://www.encyclopedia.com/philosophy-and-religion/bible/biblical-proper-names/belial",
        "scholarly reference",
        "Historical encyclopedia entry distinguishing biblical usage and later personification",
    ),
    source(
        "src-bibleodyssey-satan",
        "Bible Odyssey: Satan",
        "https://www.bibleodyssey.org/dictionary/satan/",
        "scholarly reference",
        "Society of Biblical Literature public scholarship",
    ),
    source(
        "src-bibleodyssey-azazel",
        "Bible Odyssey: Azazel",
        "https://www.bibleodyssey.org/dictionary/azazel/",
        "scholarly reference",
        "Society of Biblical Literature public scholarship",
    ),
    source(
        "src-openstax-religion-definition",
        "OpenStax Introduction to Anthropology: What Is Religion?",
        "https://openstax.org/books/introduction-anthropology/pages/13-1-what-is-religion",
        "peer-reviewed university textbook",
        "Comparative anthropological definitions of religion, worldview, deities, spirits, and magic",
    ),
    source(
        "src-openstax-sacred-space",
        "OpenStax Introduction to Anthropology: Symbolic and Sacred Space",
        "https://openstax.org/books/introduction-anthropology/pages/13-2-symbolic-and-sacred-space",
        "peer-reviewed university textbook",
        "Comparative anthropological treatment of sacred places, symbols, and spatial practice",
    ),
    source(
        "src-openstax-myth-doctrine",
        "OpenStax Introduction to Anthropology: Myth and Religious Doctrine",
        "https://openstax.org/books/introduction-anthropology/pages/13-3-myth-and-religious-doctrine",
        "peer-reviewed university textbook",
        "Comparative anthropological treatment of sacred narrative, doctrine, and worldview",
    ),
    source(
        "src-openstax-ritual-transition",
        "OpenStax Introduction to Anthropology: Rituals of Transition and Conformity",
        "https://openstax.org/books/introduction-anthropology/pages/13-4-rituals-of-transition-and-conformity",
        "peer-reviewed university textbook",
        "Comparative anthropological treatment of ritual, initiation, pilgrimage, sacrifice, and communal practice",
    ),
    source(
        "src-openstax-religious-practice",
        "OpenStax Introduction to Anthropology: Other Forms of Religious Practice",
        "https://openstax.org/books/introduction-anthropology/pages/13-5-other-forms-of-religious-practice",
        "peer-reviewed university textbook",
        "Comparative anthropological treatment of prayer, divination, healing, and religious experience",
    ),
    source(
        "src-openstax-economic-anthropology",
        "OpenStax Introduction to Anthropology: Economic Anthropology",
        "https://openstax.org/books/introduction-anthropology/pages/7-introduction",
        "peer-reviewed university textbook",
        "Comparative framework for wealth, poverty, labor, exchange, and material life",
    ),
    source(
        "src-openstax-political-anthropology",
        "OpenStax Introduction to Anthropology: Authority, Decisions, and Power",
        "https://openstax.org/books/introduction-anthropology/pages/8-introduction",
        "peer-reviewed university textbook",
        "Comparative framework for authority, law, conflict, and political order",
    ),
    source(
        "src-openstax-inequality",
        "OpenStax Introduction to Anthropology: Social Inequalities",
        "https://openstax.org/books/introduction-anthropology/pages/9-introduction",
        "peer-reviewed university textbook",
        "Comparative framework for justice, stratification, poverty, and unequal power",
    ),
    source(
        "src-openstax-kinship-family",
        "OpenStax Introduction to Anthropology: Forming Family through Kinship",
        "https://openstax.org/books/introduction-anthropology/pages/11-introduction",
        "peer-reviewed university textbook",
        "Comparative framework for kinship, marriage, family, and social reproduction",
    ),
    source(
        "src-openstax-gender-sexuality",
        "OpenStax Introduction to Anthropology: Gender and Sexuality",
        "https://openstax.org/books/introduction-anthropology/pages/12-introduction",
        "peer-reviewed university textbook",
        "Comparative framework for historically and culturally situated gender and sexuality",
    ),
    source(
        "src-iep-philosophy-religion",
        "Internet Encyclopedia of Philosophy: Philosophy of Religion",
        "https://iep.utm.edu/religion/",
        "scholarly reference",
        "Peer-reviewed philosophical overview of divine reality, evil, miracles, and religious claims",
    ),
    source(
        "src-iep-religious-epistemology",
        "Internet Encyclopedia of Philosophy: Religious Epistemology",
        "https://iep.utm.edu/relig-ep/",
        "scholarly reference",
        "Peer-reviewed overview of faith, revelation, religious knowledge, and experience",
    ),
    source(
        "src-stanford-heaven-hell",
        "Stanford Encyclopedia of Philosophy: Heaven and Hell in Christian Thought",
        "https://plato.stanford.edu/entries/heaven-hell/",
        "scholarly reference",
        "Peer-reviewed tradition-specific analysis of afterlife, judgment, heaven, and hell",
    ),
    source(
        "src-stanford-freewill",
        "Stanford Encyclopedia of Philosophy: Free Will",
        "https://plato.stanford.edu/entries/freewill/",
        "scholarly reference",
        "Peer-reviewed philosophical analysis of agency, responsibility, and freedom",
    ),
    source(
        "src-stanford-mysticism",
        "Stanford Encyclopedia of Philosophy: Mysticism",
        "https://plato.stanford.edu/entries/mysticism/",
        "scholarly reference",
        "Peer-reviewed cross-tradition philosophical analysis of mystical experience",
    ),
    source(
        "src-stanford-war",
        "Stanford Encyclopedia of Philosophy: War",
        "https://plato.stanford.edu/entries/war/",
        "scholarly reference",
        "Peer-reviewed ethical and political analysis of war and its justification",
    ),
    source(
        "src-stanford-pacifism",
        "Stanford Encyclopedia of Philosophy: Pacifism",
        "https://plato.stanford.edu/entries/pacifism/",
        "scholarly reference",
        "Peer-reviewed analysis of peace, nonviolence, and religious pacifism",
    ),
    source(
        "src-stanford-religion-morality",
        "Stanford Encyclopedia of Philosophy: Religion and Morality",
        "https://plato.stanford.edu/entries/religion-morality/",
        "scholarly reference",
        "Peer-reviewed historical analysis of ethics and religious morality",
    ),
    source(
        "src-stanford-laozi",
        "Stanford Encyclopedia of Philosophy: Laozi",
        "https://plato.stanford.edu/entries/laozi/",
        "scholarly reference",
        "Peer-reviewed overview separating textual attribution, layered biography, and religious reception",
    ),
    source(
        "src-stanford-chinese-change",
        "Stanford Encyclopedia of Philosophy: Chinese Philosophy of Change (Yijing)",
        "https://plato.stanford.edu/entries/chinese-change/",
        "scholarly reference",
        "Peer-reviewed overview of Yijing names, textual layers, divination, commentary, and reception",
    ),
    source(
        "src-loc-yijing",
        "Library of Congress: Yi jing, four-juan edition",
        "https://www.loc.gov/item/2012402493/?fo=json",
        "library collection record",
        "Institutional catalog record preserving Yi jing and Zhou yi title forms for an 1851 edition",
    ),
    source(
        "src-sefaria-genesis-1",
        "Genesis 1 — Sefaria",
        "https://www.sefaria.org/Genesis.1",
        "digital primary-source edition",
        "Hebrew source for the rûaḥ occurrence in Genesis 1:2",
    ),
    source(
        "src-sitchin-12th-planet",
        "Simon & Schuster: The 12th Planet by Zecharia Sitchin",
        "https://www.simonandschuster.net/books/The-12th-Planet-%28Book-I%29/Zecharia-Sitchin/9780939680887",
        "publisher primary source for modern reception",
        "Publisher description of Sitchin's modern Nibiru claim; not evidence about antiquity",
    ),
    source(
        "src-sitchin-divine-encounters",
        "Simon & Schuster: Divine Encounters by Zecharia Sitchin",
        "https://www.simonandschuster.net/books/Divine-Encounters/Zecharia-Sitchin/9781879181885",
        "publisher primary source for modern reception",
        "Publisher description of Sitchin's modern human-worker claim; not evidence about antiquity",
    ),
    source(
        "src-encyclopaedia-lucifer",
        "Concise Oxford Dictionary of World Religions: Lucifer (via Encyclopedia.com)",
        "https://www.encyclopedia.com/philosophy-and-religion/christianity/christianity-general/lucifer",
        "scholarly reference",
        "Reference history of the Isaiah rendering and its later identification with Satan",
    ),
    source(
        "src-lxx-isaiah-14",
        "Rahlfs Septuagint: Isaiah 14",
        "https://www.thekoinebible.com/text/rahlfs/isaiah/14.html",
        "digital primary-source edition",
        "Greek Septuagint text; Isaiah 14:12 attests ἑωσφόρος",
    ),
    source(
        "src-openstax-thirty-years-war",
        "OpenStax World History: The Protestant Reformation",
        "https://openstax.org/books/world-history-volume-2/pages/5-1-the-protestant-reformation",
        "peer-reviewed university textbook",
        "Case-specific overview of the Thirty Years' War's confessional, territorial, and geopolitical motives",
    ),
    source(
        "src-yale-westphalia",
        "Yale Avalon Project: Treaty of Westphalia",
        "https://avalon.law.yale.edu/17th_century/westphal.asp",
        "university-hosted primary-source translation",
        "The 1648 settlement's religious, territorial, dynastic, and political provisions",
    ),
    source(
        "src-openstax-india-1857",
        "OpenStax World History: The Rise of a Global Economy",
        "https://openstax.org/books/world-history-volume-2/pages/6-2-the-rise-of-a-global-economy",
        "peer-reviewed university textbook",
        "Case-specific account of colonial rule, elite dispossession, missionary activity, cartridge fears, and the 1857 rebellion",
    ),
    source(
        "src-national-archives-india-1857",
        "UK National Archives education dossier: India 1857",
        "https://cdn.nationalarchives.gov.uk/documents/education/india1857.pdf",
        "archive-curated primary-source dossier",
        "Contemporary records expressing religious fears, cartridge grievances, colonial aggression, and competing causal claims",
    ),
    source(
        "src-openstax-constantine",
        "OpenStax World History: The Eastward Shift",
        "https://openstax.org/books/world-history-volume-1/pages/10-1-the-eastward-shift",
        "peer-reviewed university textbook",
        "Case-specific account of Constantinian toleration, Christian patronage, and continued traditional practice",
    ),
    source(
        "src-fordham-edict-milan",
        "Fordham Internet History Sourcebooks: Edict of Milan",
        "https://sourcebooks.fordham.edu/source/edict-milan.asp",
        "university-hosted primary-source translation",
        "Translation of the toleration and property-restoration policy associated with Constantine and Licinius",
    ),
    source(
        "src-openstax-safavid-conversion",
        "OpenStax World History: The Safavid Empire",
        "https://openstax.org/books/world-history-volume-2/pages/4-3-the-safavid-empire",
        "peer-reviewed university textbook",
        "Case-specific account of state sponsorship, coerced conversion, exile, death threats, and later religious change",
    ),
    source(
        "src-cambridge-sunni-survival-safavid",
        "Cambridge Iranian Studies: Sunni Survival in Safavid Iran",
        "https://www.cambridge.org/core/journals/iranian-studies/article/abs/sunni-survival-in-safavid-iran-antisunni-activities-during-the-reign-of-tahmasp-i/74DF224077D073DF86E583B91D81937C",
        "peer-reviewed journal article",
        "Historiographic caution that Safavid Shi'itization was gradual and that Sunni survival and persecution continued beyond 1501",
    ),
]


for qid in [
    "Q000332",
    "Q000333",
    "Q000334",
    "Q000335",
    "Q000337",
    "Q000338",
    "Q000339",
    "Q000340",
    "Q000343",
    "Q000351",
    "Q000367",
    "Q000368",
    "Q000379",
]:
    SOURCES.append(
        source(
            f"src-oracc-{qid.lower()}",
            f"ORACC ePSD2 literary composite {qid}",
            f"https://oracc.museum.upenn.edu/epsd2/literary/{qid}",
            "digital primary-source transliteration",
            "ORACC composite text; a composition is not a single physical witness",
        )
    )


RELIGION_SOURCE = ["src-openstax-religion-definition"]
MYTH_SOURCE = ["src-openstax-myth-doctrine"]
PRACTICE_SOURCE = ["src-openstax-religious-practice"]
RITUAL_SOURCE = ["src-openstax-ritual-transition"]
SACRED_SPACE_SOURCE = ["src-openstax-sacred-space"]


BRANCH_METADATA = {
    "cosmology-origins-world-order": (
        "Cosmology, origins & world order",
        "Narratives and doctrines that explain how a world begins, is structured, and is sustained within a particular tradition.",
        "Origin narratives, accounts of cosmic order, and models of ultimate reality need a shared browse axis while retaining their different literary and doctrinal settings.",
        ["src-openstax-myth-doctrine", "src-iep-philosophy-religion"],
    ),
    "divine-more-than-human-beings": (
        "Divine & more-than-human beings",
        "Historically situated categories for deities, spirits, ancestors, adversarial beings, and reported encounters with them.",
        "Comparative anthropology distinguishes named deities, spirits, ancestors, and other supernatural agents, so this branch gathers their records without treating the categories as universal equivalents.",
        ["src-openstax-religion-definition", "src-iep-philosophy-religion"],
    ),
    "personhood-agency-human-condition": (
        "Personhood, agency & the human condition",
        "Models of selfhood, embodiment, agency, identity, moral condition, and lived vulnerability across cultures and traditions.",
        "Accounts of mind, soul, freedom, identity, and suffering all concern what a person is and can do, although their source vocabularies remain distinct.",
        ["src-stanford-hinduism", "src-stanford-chinese-metaphysics", "src-stanford-freewill"],
    ),
    "death-afterlife-eschatology": (
        "Death, afterlife & eschatology",
        "Teachings and narratives about dying, postmortem states, judgment, renewed life, and final or cyclical futures.",
        "Death, postmortem destiny, and end-time transformation form a coherent comparison area, but tradition-specific afterlives must not be merged into one scheme.",
        ["src-stanford-heaven-hell", "src-stanford-buddha", "src-openstax-myth-doctrine"],
    ),
    "revelation-knowledge-authority": (
        "Revelation, knowledge & authority",
        "Ways communities claim, transmit, authorize, interpret, and contest religious knowledge and authoritative texts.",
        "Prophecy, revelation, scripture, and canon all concern how knowledge becomes authoritative, while philosophy of religious knowledge marks the evidential questions involved.",
        ["src-iep-religious-epistemology", "src-openstax-myth-doctrine"],
    ),
    "salvation-liberation-transformation": (
        "Salvation, liberation & transformation",
        "Tradition-specific accounts of release, awakening, reconciliation, purification, healing, and transformed life.",
        "Practices and doctrines of release or transformation can be compared here only with explicit attention to each tradition's stated problem and goal.",
        ["src-stanford-buddha", "src-stanford-hinduism", "src-stanford-mysticism"],
    ),
    "ethics-law-social-order": (
        "Ethics, law & social order",
        "Norms, institutions, relationships, power, conflict, and material conditions that organize communal life.",
        "Religious ethics intersects with law, political authority, kinship, violence, and economic life, making social order a distinct but internally diverse comparison axis.",
        ["src-stanford-religion-morality", "src-openstax-political-anthropology", "src-openstax-kinship-family"],
    ),
    "ritual-practice-experience": (
        "Ritual, practice & experience",
        "Patterned actions, disciplines, rites, and reported experiences through which people enact or encounter religious worlds.",
        "Rites, prayer, divination, meditation, and related disciplines are forms of practice and experience whose meanings depend on performers and settings.",
        ["src-openstax-ritual-transition", "src-openstax-religious-practice"],
    ),
    "sacred-place-time-community": (
        "Sacred place, time & community",
        "Spatial, temporal, and communal forms through which sacred significance and collective belonging are organized.",
        "Sacred geography, calendars, pilgrimage, and community formation connect space and time with collective religious identity.",
        ["src-openstax-sacred-space", "src-openstax-ritual-transition", "src-openstax-religion-definition"],
    ),
}


# (id, description, reason for primary placement, subject-matter sources)
LEAF_METADATA = {
    "cosmology-origins-world-order": [
        ("creation", "Accounts of how a world, beings, or an ordered cosmos comes to exist; creators, sequence, and genre vary by source.", "Creation is primarily an origins category because it addresses the coming-to-be of a world or its inhabitants.", MYTH_SOURCE),
        ("cosmology", "Models of the cosmos and its ordering principles, including relations among divine, human, and natural domains.", "Cosmology belongs under world order because it describes the structure and governing pattern of a cosmos.", ["src-openstax-myth-doctrine", "src-iep-philosophy-religion"]),
        ("flood", "Flood narratives and doctrines treated in their own textual and historical settings rather than as one universal event.", "Flood traditions commonly explain destruction, renewal, or reordered human life and therefore sit with origins and world-order narratives.", MYTH_SOURCE),
        ("monotheism", "Belief or worship centered on one deity, with the deity's identity and the treatment of other beings defined by each tradition.", "Monotheism is a model of divine order and ultimate reality, not merely a count detached from theology.", RELIGION_SOURCE),
        ("polytheism", "Religious systems recognizing a plurality of deities whose number, rank, and relationships differ across sources.", "Polytheism organizes a cosmos through multiple divine agents and is therefore indexed with models of world order.", RELIGION_SOURCE),
        ("non-theism", "Religious or philosophical frameworks that do not make a creator deity or supreme god their organizing premise.", "Non-theism marks a contrasting account of ultimate order and prevents the cosmology branch from assuming that all traditions are theistic.", ["src-stanford-buddha", "src-openstax-religion-definition"]),
        ("divine-council", "Assemblies of deities or divine beings whose membership, authority, and function must be established source by source.", "A divine council depicts cosmic governance and belongs primarily with accounts of world order, while its members remain separately indexed as beings.", ["src-oracc-anunna", "src-sefaria-job-1"]),
    ],
    "divine-more-than-human-beings": [
        ("divine-beings", "Broad discovery category for beings treated as divine in a cited tradition; it never supplies a universal definition of divinity.", "This umbrella concept directly names the branch's core subject while leaving local ontologies intact.", RELIGION_SOURCE),
        ("gods", "Named or classed deities documented within the language, period, and practices of a particular community.", "Gods are placed with divine beings because sources treat them as agents with superhuman power, identity, or cultic roles.", RELIGION_SOURCE),
        ("angels", "Messenger or heavenly beings in traditions that use an angel category, without extending that label to unrelated beings elsewhere.", "Angels are more-than-human agents in their source traditions and require a narrower record than the general divine-being category.", ["src-bibleodyssey-satan", "src-sefaria-job-1"]),
        ("demons", "Adversarial, dangerous, or otherwise classified spirit beings whose status and moral character differ across traditions.", "Demon classifications concern more-than-human agents, but their meanings cannot be inferred from a single later demonology.", ["src-bibleodyssey-satan", "src-bibleodyssey-azazel"]),
        ("evil", "Moral, metaphysical, and experiential accounts of wrongdoing, harm, disorder, or opposition to an understood good.", "Evil is placed here for its frequent personification or relation to adversarial powers, while a secondary link records its bearing on human agency.", ["src-iep-philosophy-religion", "src-bibleodyssey-satan"]),
        ("spirit", "Source-language categories for breath, wind, incorporeal agency, or spirit, with no presumption that their semantic ranges coincide.", "Spirit is primarily grouped with more-than-human being categories while source-scoped terms preserve broader meanings such as breath or wind.", ["src-sefaria-genesis-1", "src-stanford-chinese-metaphysics"]),
        ("ancestors", "Deceased forebears addressed, remembered, or treated as continuing agents in particular social and ritual settings.", "Ancestors can function as more-than-human social agents, while their kinship and community relations remain essential context.", RELIGION_SOURCE),
        ("possession", "Claims that a spirit or other agent inhabits, controls, or speaks through a person, interpreted within local diagnostic systems.", "Possession centers an encounter between human and more-than-human agency and is therefore anchored in this branch.", PRACTICE_SOURCE),
        ("exorcism", "Rites intended to expel, restrain, or negotiate with an afflicting being or force according to a tradition's own categories.", "Exorcism presupposes a source-specific account of an afflicting agent, linking the rite primarily to more-than-human beings.", PRACTICE_SOURCE),
        ("miracles", "Reported extraordinary events understood as signs or acts of divine agency, with evidential and doctrinal interpretation kept explicit.", "Miracles are indexed here because they are claims about divine or supernatural action in the world.", ["src-iep-philosophy-religion"]),
    ],
    "personhood-agency-human-condition": [
        ("soul", "Tradition-specific models of life, self, or enduring personhood; nefesh, ātman, psychē, ba, and similar terms are not automatic synonyms.", "Soul concepts primarily address what a person is and what, if anything, persists through change or death.", ["src-stanford-hinduism", "src-sefaria-genesis-2", "src-perseus-lsj"]),
        ("consciousness", "Accounts of subjective awareness and its relation to mind, body, self, and disciplined experience.", "Consciousness belongs with personhood because it concerns the character and continuity of lived awareness.", ["src-stanford-chinese-metaphysics", "src-stanford-hinduism"]),
        ("mind", "Concepts of cognition, intention, attention, and mental cultivation expressed through different philosophical and religious vocabularies.", "Mind is a faculty or dimension of persons and agents, even where a tradition rejects a permanent self.", ["src-stanford-buddha", "src-stanford-chinese-metaphysics"]),
        ("free-will", "Debates about whether and how agents control choices, bear responsibility, or act under causal, divine, or karmic conditions.", "Free will is placed under agency because it directly concerns control over action and moral responsibility.", ["src-stanford-freewill"]),
        ("destiny", "Claims about allotted, foreknown, conditioned, or fated courses of life, distinguished from later retrospective interpretations.", "Destiny qualifies the scope of personal agency by asking how far a life course is fixed or directed.", ["src-openstax-myth-doctrine", "src-iep-philosophy-religion"]),
        ("karma", "Causal accounts linking action and consequence in South Asian traditions, with mechanisms and ethical meanings varying by school.", "Karma directly joins human action to experienced condition and future consequence, making it a central agency concept.", ["src-stanford-hinduism", "src-stanford-buddha"]),
        ("sin", "Tradition-specific concepts of wrongdoing, estrangement, transgression, or damaged relation to divine and communal norms.", "Sin describes a moral condition or act attributed to persons, while its legal and ethical dimensions receive a secondary link.", ["src-stanford-religion-morality", "src-vatican-catechism-purgatory"]),
        ("suffering", "Experiences and explanations of pain, loss, dissatisfaction, or affliction, including doctrines about causes and responses.", "Suffering is a feature of the human condition that many traditions make central to diagnosis and transformation.", ["src-stanford-buddha", "src-iep-philosophy-religion"]),
        ("birth", "Biological and socially recognized beginnings of personhood, including rites and doctrines that assign status or meaning to birth.", "Birth marks entry into embodied and social personhood, while communal recognition is represented by a secondary link.", ["src-openstax-kinship-family", "src-openstax-ritual-transition"]),
        ("gender", "Culturally and historically organized identities, roles, and power relations associated with gender; sources must identify their own categories.", "Gender shapes lived personhood and agency rather than serving as a timeless biological or religious constant.", ["src-openstax-gender-sexuality"]),
        ("sexuality", "Culturally situated desires, practices, identities, and norms concerning sexual life and embodiment.", "Sexuality is indexed with the human condition because it concerns embodiment, identity, relationship, and moral agency.", ["src-openstax-gender-sexuality"]),
    ],
    "death-afterlife-eschatology": [
        ("afterlife", "Any tradition-specific account of continued existence, renewed life, judgment, or postmortem condition after bodily death.", "Afterlife is the branch's broad postmortem category and must retain distinct models rather than merging them.", ["src-stanford-heaven-hell", "src-stanford-buddha"]),
        ("resurrection", "Restoration or transformation of the dead to life in traditions that teach resurrection, distinguished from rebirth and reincarnation.", "Resurrection directly concerns postmortem or eschatological renewed life and therefore belongs in this branch.", ["src-stanford-heaven-hell", "src-fordham-nicaea"]),
        ("reincarnation", "Accounts in which a person, self, or soul takes another embodied life; the continuing subject must be defined by the cited tradition.", "Reincarnation is a postmortem continuity model and is kept distinct from Buddhist rebirth and Christian resurrection.", ["src-stanford-hinduism"]),
        ("rebirth", "Renewed conditioned existence across lives, especially Buddhist accounts that do not require an enduring soul.", "Rebirth is a cyclic postmortem process and remains separate from doctrines centered on a transmigrating self.", ["src-stanford-buddha", "src-suttacentral-anattalakkhana"]),
        ("death", "The end of embodied life together with the biological, social, ritual, and doctrinal meanings assigned to it.", "Death is the threshold around which afterlife and eschatological claims are organized.", ["src-openstax-ritual-transition", "src-stanford-heaven-hell"]),
        ("judgment", "Evaluation of persons or acts by divine, postmortem, or eschatological authority in a specified source tradition.", "Judgment determines or explains postmortem destiny in many eschatological systems and therefore sits primarily here.", ["src-stanford-heaven-hell", "src-gutenberg-book-dead"]),
        ("heaven", "Tradition-specific heavenly realms, divine presence, or blessed postmortem states; imagery and conditions are not universalized.", "Heaven is a named afterlife or eschatological destination in traditions that teach it.", ["src-stanford-heaven-hell"]),
        ("hell", "Tradition-specific realms or states of punishment, exclusion, or suffering after death, whether temporary or final.", "Hell is indexed as an afterlife and judgment category while sources determine duration, inhabitants, and purpose.", ["src-stanford-heaven-hell"]),
        ("underworld", "Realms of the dead located below or apart from the living world in particular cosmologies and narratives.", "Underworld concepts organize the location and condition of the dead, making them primarily postmortem categories.", ["src-gutenberg-book-dead", "src-oracc-anunna"]),
        ("purgatory", "The Catholic doctrine of final purification after death, not a generic label for every intermediate or punitive afterlife state.", "Purgatory is placed here as a specifically defined postmortem purification doctrine.", ["src-vatican-catechism-purgatory"]),
        ("apocalypse", "Revelatory literature or teaching that discloses cosmic crisis, judgment, or transformed order; modern catastrophe usage is secondary.", "Apocalypse primarily concerns final or transformative horizons of history and cosmos.", ["src-openstax-myth-doctrine", "src-iep-religious-epistemology"]),
    ],
    "revelation-knowledge-authority": [
        ("prophecy", "Speech, writing, or action presented as conveying divine communication, warning, interpretation, or foretelling in a stated context.", "Prophecy is a claimed channel of revealed knowledge whose authority must be evaluated within its community and text.", ["src-iep-religious-epistemology", "src-sefaria-zechariah-3"]),
        ("revelation", "Claims that otherwise unavailable truth is disclosed by divine or transcendent agency through text, event, vision, or experience.", "Revelation directly concerns the acquisition and authorization of religious knowledge.", ["src-iep-religious-epistemology"]),
        ("wisdom", "Teachings and practices presented as skilled, insightful, or rightly ordered understanding of life and reality.", "Wisdom is a mode of religious knowledge oriented toward discernment and practice rather than mere information.", ["src-ctext-dao-de-jing", "src-stanford-chinese-metaphysics"]),
        ("knowledge", "Claims, methods, and standards for knowing within religious and philosophical traditions, including reason, testimony, and experience.", "Knowledge is the broad epistemic category under which revelation and other authorized ways of knowing can be compared.", ["src-iep-religious-epistemology"]),
        ("hidden-knowledge", "Teachings represented as secret, esoteric, initiatory, or restricted, with access conditions and provenance recorded.", "Hidden knowledge is a restricted mode of transmitting purported truth and therefore belongs primarily with knowledge and authority.", ["src-openstax-religious-practice", "src-stanford-mysticism"]),
        ("authority", "Recognized power to teach, interpret, command, authenticate, or govern within a community and historical setting.", "Authority determines whose texts, interpretations, and institutions can define accepted religious knowledge.", ["src-openstax-political-anthropology", "src-fordham-nicaea"]),
        ("scripture", "Texts a community treats as sacred or normatively authoritative, with boundaries and interpretive status established historically.", "Scripture is a durable medium through which claimed revelation and teaching receive communal authority.", ["src-openstax-myth-doctrine", "src-fordham-nicaea"]),
        ("canon", "A historically formed set of texts, rules, or authoritative decisions recognized as normative by a community.", "Canon records the boundary-making process by which some texts or rulings receive authoritative status.", ["src-fordham-nicaea", "src-openstax-myth-doctrine"]),
        ("heresy", "A classification applied by authorities or communities to teachings judged outside accepted doctrinal boundaries; actor and period must be named.", "Heresy is indexed here because it is produced through contested claims to doctrinal authority and knowledge.", ["src-fordham-nicaea", "src-openstax-political-anthropology"]),
    ],
    "salvation-liberation-transformation": [
        ("salvation", "Tradition-specific rescue, reconciliation, healing, or fulfilled relation to an ultimate good; the problem being solved must be stated.", "Salvation names a goal of decisive religious transformation while leaving its agent and mechanism source-specific.", ["src-iep-philosophy-religion", "src-fordham-nicaea"]),
        ("liberation", "Release from bondage, ignorance, cyclic existence, oppression, or another specified condition in religious and philosophical traditions.", "Liberation is grouped here because it describes freedom from a diagnosed condition, though Hindu, Buddhist, and social meanings differ.", ["src-stanford-hinduism", "src-stanford-buddha"]),
        ("enlightenment", "Awakening, illumination, or perfected insight in traditions that use such a goal, with the source term and path retained.", "Enlightenment is a transformation of understanding and condition rather than a universal synonym for salvation.", ["src-stanford-buddha"]),
        ("forgiveness", "Release from blame, debt, resentment, or divine condemnation in a specified interpersonal, communal, or theological setting.", "Forgiveness changes a damaged moral or religious relationship and therefore belongs among forms of reconciliation.", ["src-stanford-religion-morality", "src-vatican-catechism-purgatory"]),
        ("mercy", "Compassionate restraint, aid, or pardon shown by a human or divine agent in a concrete moral and doctrinal context.", "Mercy is indexed as a means or expression of restorative transformation without assuming one theology of grace.", ["src-stanford-religion-morality", "src-vatican-catechism-purgatory"]),
        ("mysticism", "Practices and reports oriented toward direct, unitive, or otherwise extraordinary religious experience, interpreted within their traditions.", "Mysticism belongs here when experience is understood as transformative, while its practices also receive a ritual secondary link.", ["src-stanford-mysticism"]),
        ("healing", "Practices or claims of bodily, psychological, social, or spiritual restoration whose methods and agents are documented locally.", "Healing is a form of restoration and transformation, even when its ritual performance also warrants a practice link.", ["src-openstax-religion-definition", "src-openstax-religious-practice"]),
    ],
    "ethics-law-social-order": [
        ("law", "Codified or customary norms backed by recognized authority, including religious law when a source identifies it as such.", "Law structures permitted action and institutional order, making it a primary social-order concept.", ["src-openstax-political-anthropology", "src-stanford-religion-morality"]),
        ("ethics", "Reflection and practice concerning right action, character, obligation, and good life within philosophical, religious, and social traditions.", "Ethics is the branch's central normative category and must remain distinguishable from law and custom.", ["src-stanford-religion-morality"]),
        ("justice", "Principles and institutions for fair treatment, right distribution, accountability, or restored relations in a stated society or tradition.", "Justice evaluates social rules, distributions, and remedies, so it belongs primarily with ethics and social order.", ["src-openstax-inequality", "src-stanford-religion-morality"]),
        ("violence", "Physical, structural, or symbolic harm documented with actors, targets, and context; religious labels require evidence of religious causation or meaning.", "Violence affects social order and moral evaluation, while its religious role must be demonstrated rather than assumed.", ["src-stanford-war", "src-openstax-political-anthropology"]),
        ("war", "Organized armed conflict analyzed through its political, ethical, and, where supported, religious causes and justifications.", "War is a collective institution of violence and political order rather than an automatically religious event.", ["src-stanford-war"]),
        ("peace", "Conditions and practices of nonwar, reconciliation, nonviolence, or just social relation, defined by the relevant actors and tradition.", "Peace belongs with social order as both a political condition and an ethical aim.", ["src-stanford-pacifism"]),
        ("wealth", "Material resources, property, exchange, and prosperity as organized and morally evaluated within a society or religious tradition.", "Wealth shapes social hierarchy and ethical obligation and therefore belongs in the social-order branch.", ["src-openstax-economic-anthropology", "src-openstax-inequality"]),
        ("poverty", "Material deprivation and unequal access to resources, including religious interpretations and responses only where sources document them.", "Poverty is a material and distributive condition central to inequality and ethical social analysis.", ["src-openstax-economic-anthropology", "src-openstax-inequality"]),
        ("sacred-kingship", "Forms of rule in which royal authority is constituted through divine descent, ritual office, or sacred legitimation in a specific polity.", "Sacred kingship joins political authority with religious legitimation and belongs primarily under social order.", ["src-openstax-political-anthropology", "src-gutenberg-book-dead"]),
        ("marriage", "Socially recognized unions and their legal, kinship, ritual, economic, and religious dimensions across cultures.", "Marriage organizes rights, alliance, household, and descent, making it primarily a social-order and kinship concept.", ["src-openstax-kinship-family", "src-openstax-ritual-transition"]),
        ("family", "Culturally defined relations of kinship, care, descent, household, and obligation rather than a single universal household form.", "Family is a foundational institution of social organization, with sacred and communal dimensions recorded separately.", ["src-openstax-kinship-family"]),
    ],
    "ritual-practice-experience": [
        ("ritual", "Repeated or formally patterned action carrying recognized social, symbolic, or religious meaning for participants.", "Ritual is the branch's broad action category and supplies context for more specific rites and disciplines.", ["src-openstax-ritual-transition"]),
        ("sacrifice", "Offerings, transfers, renunciations, or killings performed for specified recipients and purposes in a ritual system.", "Sacrifice is a structured ritual act whose material, agent, recipient, and aim must be documented.", ["src-openstax-ritual-transition"]),
        ("prayer", "Address, petition, praise, confession, contemplation, or other communication directed within a religious framework.", "Prayer is a recurring religious practice and reported mode of relation to divine or sacred agents.", ["src-openstax-religious-practice"]),
        ("fasting", "Deliberate restriction of food or drink for ritual, ethical, ascetic, commemorative, or disciplinary purposes.", "Fasting is an embodied discipline whose timing and purpose are defined through practice.", ["src-openstax-religious-practice", "src-openstax-ritual-transition"]),
        ("purity", "Rules and practices distinguishing clean, unclean, fit, restricted, or consecrated states in a particular system.", "Purity categories are enacted and maintained through ritual practice rather than assumed to be universal hygiene rules.", ["src-openstax-ritual-transition", "src-sefaria-leviticus-16"]),
        ("initiation", "Rites that admit, transform, authorize, or mark transition into a group, status, office, or body of knowledge.", "Initiation is a ritual transition whose sequence and social effects are essential evidence.", ["src-openstax-ritual-transition"]),
        ("magic", "Practices intended to act through nonordinary powers or correspondences, described with local terminology and without ranking traditions.", "Magic is indexed as a practice category because its techniques, objects, and intended effects are performed and learned.", ["src-openstax-religion-definition"]),
        ("divination", "Techniques for obtaining guidance or hidden information through signs, lots, specialists, texts, or inspired states.", "Divination is a procedural practice of seeking knowledge, so its primary home is ritual even when it informs authority.", ["src-openstax-religious-practice", "src-ctext-book-changes"]),
        ("meditation", "Disciplines of attention, contemplation, visualization, recitation, or awareness whose methods and goals vary by tradition.", "Meditation is primarily a cultivated practice and experience, with a secondary link to transformative goals.", ["src-stanford-mysticism", "src-stanford-buddha"]),
    ],
    "sacred-place-time-community": [
        ("sacred-geography", "Places, landscapes, routes, and spatial relations invested with sacred meaning by communities in particular histories.", "Sacred geography directly organizes religious significance in space and therefore anchors the place dimension of this branch.", ["src-openstax-sacred-space"]),
        ("sacred-time", "Calendars, festivals, commemorations, cycles, and exceptional moments that communities distinguish from ordinary time.", "Sacred time organizes collective memory and practice through recurring or singular temporal boundaries.", ["src-openstax-ritual-transition", "src-openstax-myth-doctrine"]),
        ("community", "Groups constituted or sustained through shared identity, practice, institution, memory, or sacred commitment.", "Community is the social setting in which sacred places, times, texts, and practices receive shared recognition.", ["src-openstax-religion-definition"]),
        ("pilgrimage", "Journey to a sacred destination or along a sacred route, documented through its participants, purposes, and ritual setting.", "Pilgrimage joins sacred geography with communal movement and is therefore placed primarily under place and community.", ["src-openstax-ritual-transition", "src-openstax-sacred-space"]),
    ],
}


def pretty(identifier: str) -> str:
    overrides = {"non-theism": "Non-theism", "free-will": "Free will"}
    return overrides.get(identifier, identifier.replace("-", " ").title())


def merge_sources(*groups: list[str]) -> list[str]:
    return list(dict.fromkeys(source_id for group in groups for source_id in group))


BRANCHES = [(branch_id, metadata[0]) for branch_id, metadata in BRANCH_METADATA.items()]
LEAVES_BY_BRANCH = {
    branch_id: [leaf[0] for leaf in leaves] for branch_id, leaves in LEAF_METADATA.items()
}
LEAF_BY_ID = {
    leaf[0]: (branch_id, leaf) for branch_id, leaves in LEAF_METADATA.items() for leaf in leaves
}


CONCEPTS = [
    {
        "id": "religion-and-worldview",
        "label": "Religion & worldview",
        "description": "Comparative root for beliefs, practices, institutions, experiences, and worldviews studied in their historical and cultural settings; membership never implies doctrinal equivalence.",
        "level": "root",
        "keywords": ["religion", "worldview"],
        "sourceIds": ["src-openstax-religion-definition", "src-atlas-gap-audit"],
    }
]
for branch_id, (label, description, _, source_ids) in BRANCH_METADATA.items():
    CONCEPTS.append(
        {
            "id": branch_id,
            "label": label,
            "description": description,
            "level": "branch",
            "keywords": branch_id.split("-"),
            "sourceIds": merge_sources(source_ids, ["src-atlas-gap-audit"]),
        }
    )
for branch_id, leaves in LEAF_METADATA.items():
    for leaf_id, description, _, source_ids in leaves:
        CONCEPTS.append(
            {
                "id": leaf_id,
                "label": pretty(leaf_id),
                "description": description,
                "level": "concept",
                "keywords": list(dict.fromkeys([leaf_id, *leaf_id.split("-")])),
                "sourceIds": merge_sources(source_ids, ["src-atlas-gap-audit"]),
            }
        )


EDGES = []
for branch_id, (_, _, root_rationale, branch_source_ids) in BRANCH_METADATA.items():
    EDGES.append(
        {
            "id": f"edge-root-{branch_id}",
            "broaderId": "religion-and-worldview",
            "narrowerId": branch_id,
            "kind": "root",
            "rationale": root_rationale,
            "sourceIds": merge_sources(branch_source_ids, ["src-openstax-religion-definition", "src-atlas-gap-audit"]),
        }
    )
for branch_id, leaves in LEAF_METADATA.items():
    branch_source_ids = BRANCH_METADATA[branch_id][3]
    for leaf_id, _, primary_rationale, leaf_source_ids in leaves:
        EDGES.append(
            {
                "id": f"edge-primary-{branch_id}-{leaf_id}",
                "broaderId": branch_id,
                "narrowerId": leaf_id,
                "kind": "primary",
                "rationale": primary_rationale,
                "sourceIds": merge_sources(leaf_source_ids, branch_source_ids, ["src-atlas-gap-audit"]),
            }
        )


SECONDARY = [
    ("creation", "revelation-knowledge-authority", "Creation accounts may be presented as revealed teaching or authoritative sacred narrative, so they also belong in revelation discovery."),
    ("cosmology", "revelation-knowledge-authority", "Cosmological models are often transmitted through authoritative texts or teachings, making their claimed source of knowledge relevant."),
    ("divine-council", "divine-more-than-human-beings", "A council is a form of cosmic governance, but its participants are also individually or collectively classified as divine beings."),
    ("evil", "personhood-agency-human-condition", "Accounts of evil also address human wrongdoing, responsibility, suffering, and the limits of agency."),
    ("spirit", "personhood-agency-human-condition", "Spirit vocabularies can describe breath, life, or a dimension of personhood as well as more-than-human agents."),
    ("ancestors", "sacred-place-time-community", "Ancestors remain embedded in kin groups, remembered places, and communal rites rather than functioning only as isolated spirit beings."),
    ("possession", "ritual-practice-experience", "Possession is commonly recognized, managed, or contested through embodied practice, diagnosis, and ritual performance."),
    ("exorcism", "ritual-practice-experience", "Exorcism is enacted as a rite or specialized practice even though its target belongs to a more-than-human ontology."),
    ("miracles", "revelation-knowledge-authority", "Miracle reports can function as signs that authorize a messenger, doctrine, or revelation, so their evidential role is indexed here."),
    ("karma", "ethics-law-social-order", "Karma links action and consequence through moral causation and therefore bears directly on ethical conduct."),
    ("sin", "ethics-law-social-order", "Sin is evaluated against moral, legal, or communal norms as well as being described as a personal condition."),
    ("suffering", "salvation-liberation-transformation", "Many paths of liberation or salvation begin by diagnosing suffering and proposing its cessation or transformation."),
    ("birth", "sacred-place-time-community", "Birth becomes communal status through kinship recognition, naming, calendars, and rites of transition."),
    ("judgment", "ethics-law-social-order", "Judgment applies standards of conduct and responsibility, joining postmortem destiny to ethics and normative order."),
    ("apocalypse", "revelation-knowledge-authority", "Apocalyptic discourse claims to disclose hidden or future realities, making revelation a necessary secondary context."),
    ("prophecy", "death-afterlife-eschatology", "Some prophecy concerns judgment, death, or future transformation, although prediction is not required for every prophetic act."),
    ("hidden-knowledge", "ritual-practice-experience", "Restricted knowledge may be conferred through initiation or cultivated through specialized practices and experiences."),
    ("authority", "ethics-law-social-order", "Religious authority also structures offices, law, governance, and permitted conduct within communities."),
    ("canon", "sacred-place-time-community", "A canon exists through communal recognition and helps maintain shared memory and identity across time."),
    ("heresy", "ethics-law-social-order", "Heresy classifications can carry legal, political, and social consequences beyond doctrinal disagreement."),
    ("mysticism", "ritual-practice-experience", "Mystical reports are often connected with contemplative disciplines, bodily techniques, or other repeatable practices."),
    ("healing", "ritual-practice-experience", "Healing may be sought or enacted through prayer, laying on of hands, specialists, medicines, or ritual procedures."),
    ("sacred-kingship", "sacred-place-time-community", "Sacred rule is performed through courts, temples, territories, festivals, and communities that recognize royal sacrality."),
    ("marriage", "sacred-place-time-community", "Marriage rites and kinship alliances establish communal membership and continuity as well as social obligations."),
    ("family", "sacred-place-time-community", "Families carry shared memory, household observance, ancestry, and belonging across generations."),
    ("pilgrimage", "ritual-practice-experience", "Pilgrimage is a journey to sacred place and also a patterned bodily and communal practice."),
    ("meditation", "salvation-liberation-transformation", "Meditative disciplines are frequently directed toward awakening, liberation, purification, or other stated transformations."),
]
for leaf_id, branch_id, rationale in SECONDARY:
    leaf_source_ids = LEAF_BY_ID[leaf_id][1][3]
    branch_source_ids = BRANCH_METADATA[branch_id][3]
    EDGES.append(
        {
            "id": f"edge-secondary-{leaf_id}-{branch_id}",
            "broaderId": branch_id,
            "narrowerId": leaf_id,
            "kind": "secondary",
            "rationale": rationale,
            "sourceIds": merge_sources(leaf_source_ids, branch_source_ids, ["src-atlas-gap-audit"]),
        }
    )


def concept_term(
    term_id: str,
    concept_id: str,
    term: str,
    language: str,
    script: str,
    transliteration: str,
    semantic_relation: str,
    scope: str,
    source_ids: list[str],
) -> dict:
    return {
        "id": term_id,
        "conceptId": concept_id,
        "term": term,
        "language": language,
        "script": script,
        "transliteration": transliteration,
        "semanticRelation": semantic_relation,
        "scope": scope,
        "note": "A source-scoped concept term, not an unconditional alias or claim of cross-tradition equivalence.",
        "sourceIds": source_ids,
    }


CONCEPT_TERMS = [
    concept_term("term-atman", "soul", "आत्मन्", "Sanskrit", "Devanagari", "ātman", "tradition-specific", "Hindu philosophical usage varies by school and period.", ["src-stanford-hinduism"]),
    concept_term("term-anatta", "soul", "अनत्ता", "Pali", "Devanagari", "anattā", "contrast", "Buddhist not-self teaching; explicitly a contrast term, never an alias for soul.", ["src-suttacentral-anattalakkhana", "src-stanford-buddha"]),
    concept_term("term-moksha", "liberation", "मोक्ष", "Sanskrit", "Devanagari", "mokṣa", "tradition-specific", "South Asian traditions; doctrine differs across schools.", ["src-stanford-hinduism"]),
    concept_term("term-nibbana", "enlightenment", "निब्बान", "Pali", "Devanagari", "nibbāna", "tradition-specific", "Pali Buddhist textual context.", ["src-stanford-buddha"]),
    concept_term("term-karman", "karma", "कर्मन्", "Sanskrit", "Devanagari", "karman", "translation-gloss", "Sanskrit form; interpretations differ across traditions.", ["src-stanford-hinduism"]),
    concept_term("term-samsara", "rebirth", "संसार", "Sanskrit", "Devanagari", "saṃsāra", "related", "Cycle of wandering/rebirth in multiple South Asian traditions.", ["src-stanford-hinduism", "src-stanford-buddha"]),
    concept_term("term-nefesh", "soul", "נֶפֶשׁ", "Biblical Hebrew", "Hebrew", "nefeš", "tradition-specific", "Hebrew Bible usage includes life/person and must not be flattened to a later body-soul dualism.", ["src-sefaria-genesis-2"]),
    concept_term("term-ruach", "spirit", "רוּחַ", "Biblical Hebrew", "Hebrew", "rûaḥ", "tradition-specific", "Hebrew form attested in Genesis 1:2; this record does not extend that occurrence into a universal definition of spirit.", ["src-sefaria-genesis-1"]),
    concept_term("term-psyche", "soul", "ψυχή", "Ancient Greek", "Greek", "psychē", "translation-gloss", "Ancient Greek semantic range varies by author and period.", ["src-perseus-lsj"]),
    concept_term("term-pneuma", "spirit", "πνεῦμα", "Ancient Greek", "Greek", "pneuma", "translation-gloss", "Greek semantic range includes breath and wind as well as spirit.", ["src-perseus-lsj"]),
    concept_term("term-apokalypsis", "revelation", "ἀποκάλυψις", "Ancient Greek", "Greek", "apokalypsis", "language-form", "Greek term whose range depends on literary context.", ["src-perseus-lsj"]),
    concept_term("term-dao", "cosmology", "道", "Classical Chinese", "Han", "dào", "tradition-specific", "Dao De Jing usage; not a universal synonym for cosmology.", ["src-ctext-dao-de-jing", "src-stanford-chinese-metaphysics"]),
    concept_term("term-de", "ethics", "德", "Classical Chinese", "Han", "dé", "tradition-specific", "Dao De Jing usage; semantic range includes potency/virtue.", ["src-ctext-dao-de-jing"]),
    concept_term("term-hun", "spirit", "魂", "Classical Chinese", "Han", "hún", "tradition-specific", "Chinese historical discourse; pairing and meaning vary by source.", ["src-stanford-chinese-metaphysics"]),
    concept_term("term-po", "spirit", "魄", "Classical Chinese", "Han", "pò", "tradition-specific", "Chinese historical discourse; pairing and meaning vary by source.", ["src-stanford-chinese-metaphysics"]),
    concept_term("term-ka", "soul", "kꜣ", "Ancient Egyptian", "Egyptian transliteration", "kꜣ", "tradition-specific", "Egyptological category for one aspect of personhood; not equivalent to every soul concept.", ["src-ucl-egypt-deities"]),
    concept_term("term-ba", "soul", "bꜣ", "Ancient Egyptian", "Egyptian transliteration", "bꜣ", "tradition-specific", "Egyptological category for one aspect of personhood; distinct from kꜣ and ꜣḫ.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    concept_term("term-akh", "spirit", "ꜣḫ", "Ancient Egyptian", "Egyptian transliteration", "ꜣḫ", "tradition-specific", "Egyptological category whose role depends on mortuary context.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    concept_term("term-anunna-concept", "divine-council", "𒀭𒀀𒉣𒈾", "Sumerian", "Cuneiform", "Anunna", "related", "Collective divine designation with changing scope; not a fixed timeless roster.", ["src-oracc-anunna"]),
    concept_term("term-purgatorium", "purgatory", "purgatorium", "Latin", "Latin", "purgatorium", "translation-gloss", "Later Latin Christian terminology; not retrojected into all earlier afterlife sources.", ["src-vatican-catechism-purgatory"]),
]


def entity(entity_id: str, name: str, entity_type: str, traditions: list[str], earliest: str, description: str, source_ids: list[str]) -> dict:
    return {
        "id": entity_id,
        "canonicalName": name,
        "entityType": entity_type,
        "traditions": traditions,
        "earliestAttestation": earliest,
        "description": description,
        "sourceIds": source_ids,
    }


ENTITIES = [
    entity("anunna", "Anunna", "deity", ["Ancient Mesopotamian"], "Third-millennium BCE Sumerian evidence; membership and function vary", "A collective designation for deities, not a fixed biological race or a timeless roster.", ["src-oracc-anunna"]),
    entity("enki-ea", "Enki / Ea", "deity", ["Sumerian", "Akkadian"], "Sumerian and Akkadian cuneiform traditions", "A Mesopotamian deity whose Sumerian Enki and Akkadian Ea names are historically contextualized.", ["src-oracc-enki"]),
    entity("inanna-ishtar", "Inanna / Ištar", "deity", ["Sumerian", "Akkadian"], "Third-millennium BCE Mesopotamia", "A Mesopotamian deity attested under historically and linguistically scoped forms.", ["src-oracc-inana"]),
    entity("utu-shamash", "Utu / Šamaš", "deity", ["Sumerian", "Akkadian"], "Third-millennium BCE Mesopotamia", "Solar and judicial deity represented with Sumerian and Akkadian name forms.", ["src-oracc-utu"]),
    entity("osiris-wsir", "Osiris / Wsir", "deity", ["Ancient Egyptian"], "Old Kingdom Egyptian evidence", "Egyptian deity associated with kingship, death, and postmortem regeneration across changing contexts.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    entity("isis-aset", "Isis / Aset", "deity", ["Ancient Egyptian", "Greco-Roman Egyptian"], "Old Kingdom Egyptian evidence", "Egyptian goddess whose names and roles changed across Egyptian and later Mediterranean reception.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    entity("thoth-djehuty", "Thoth / Djehuty", "deity", ["Ancient Egyptian"], "Old Kingdom Egyptian evidence", "Egyptian deity associated with writing, reckoning, and knowledge in source-specific roles.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    entity("horus-heru", "Horus / Heru", "deity", ["Ancient Egyptian"], "Predynastic and Early Dynastic Egyptian evidence", "Egyptian deity with multiple locally and historically differentiated forms.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    entity("laozi", "Laozi", "person", ["Chinese", "Daoist"], "Textual witnesses, attributed authorship, biography, and later religious reception are historically layered", "Attributed author and later religious figure; Atlas does not collapse textual attribution into a certain biography.", ["src-ctext-dao-de-jing", "src-loc-laozi", "src-stanford-laozi"]),
    entity("yijing", "Yijing", "work", ["Chinese"], "Composite textual layers documented from Western Zhou oracles through later commentarial materials", "The Book of Changes as an evolving textual tradition linked to the existing i-ching work record.", ["src-ctext-book-changes", "src-stanford-chinese-change", "src-loc-yijing"]),
    entity("belial", "Belial", "religious-figure", ["Hebrew Bible", "Second Temple Jewish", "Christian"], "Hebrew Bible uses of bĕliyyaʿal", "A term and later personified figure whose development must remain distinct from Baal.", ["src-sefaria-deuteronomy-13", "src-encyclopaedia-belial"]),
    entity("baal", "Baal / Baʿal", "deity", ["Hebrew Bible"], "Hebrew Bible attestation in Judges 2; this record makes no earlier dating claim", "A title and deity designation with source-specific referents; not an alias of Belial.", ["src-sefaria-judges-2"]),
    entity("satan", "Satan", "religious-figure", ["Hebrew Bible", "Jewish", "Christian"], "Hebrew Bible adversary/accuser contexts", "An entity history whose roles shift; later devil identifications require contextual evidence.", ["src-sefaria-job-1", "src-sefaria-zechariah-3", "src-bibleodyssey-satan"]),
    entity("lucifer", "Lucifer", "religious-figure", ["Latin Christian"], "Latin rendering of Isaiah 14:12", "A Latin term and later personified figure; its later conflation with Satan is contextual, not a lexical identity.", ["src-sefaria-isaiah-14", "src-lxx-isaiah-14", "src-vatican-vulgate-isaiah", "src-vatican-vulgate-2-peter", "src-encyclopaedia-lucifer"]),
    entity("azazel", "Azazel", "religious-figure", ["Hebrew Bible", "Second Temple Jewish"], "Leviticus 16", "A difficult Hebrew designation with multiple interpretations and later developments.", ["src-sefaria-leviticus-16", "src-bibleodyssey-azazel"]),
    entity("isac", "Institute for the Study of Ancient Cultures", "institution", ["Academic"], "1919 institutional founding; current name adopted in 2023", "University of Chicago research institute, recorded with its former institutional name as a time-scoped name assertion.", ["src-isac-about", "src-uchicago-isac-renaming"]),
    entity("first-council-nicaea", "First Council of Nicaea", "council", ["Christian"], "325 CE", "An episcopal council convened at Nicaea; later titles are reception and classification labels.", ["src-fordham-nicaea", "src-vatican-nicaea"]),
]


def name_assertion(entity_id: str, key: str, name: str, normalized: str, language: str, script: str, transliteration: str, assertion_type: str, scope: str, source_ids: list[str], confidence: str = "high") -> dict:
    return {
        "id": f"name-{entity_id}-{key}",
        "entityId": entity_id,
        "name": name,
        "normalizedName": normalized,
        "language": language,
        "script": script,
        "transliteration": transliteration,
        "assertionType": assertion_type,
        "scope": scope,
        "sourceIds": source_ids,
        "confidence": confidence,
    }


NAME_SPECS = {
    "anunna": [
        ("canonical", "Anunna", "anunna", "Sumerian", "Latin", "Anunna", "canonical"),
        ("sumerian", "a-nun-na", "anunna", "Sumerian", "Latin transliteration", "a-nun-na", "language-form"),
        ("anuna", "Anuna", "anuna", "Modern scholarly English", "Latin", "Anuna", "transliteration"),
        ("anunnaku", "Anunnaku", "anunnaku", "Akkadian", "Latin", "Anunnaku", "language-form"),
        ("anunnaki", "Anunnaki", "anunnaki", "Modern scholarly English", "Latin", "Anunnaki", "alternate-name"),
    ],
    "enki-ea": [
        ("canonical", "Enki / Ea", "enki ea", "English scholarly", "Latin", "Enki / Ea", "canonical"),
        ("enki", "Enki", "enki", "Sumerian", "Latin", "Enki", "language-form"),
        ("ea", "Ea", "ea", "Akkadian", "Latin", "Ea", "language-form"),
        ("nudimmud", "Nudimmud", "nudimmud", "Sumerian", "Latin", "Nudimmud", "alternate-name"),
        ("d-en-ki", "{d}en-ki", "enki", "Sumerian", "Cuneiform transliteration", "{d}en-ki", "transliteration"),
    ],
    "inanna-ishtar": [
        ("canonical", "Inanna / Ištar", "inanna ishtar", "English scholarly", "Latin", "Inanna / Ištar", "canonical"),
        ("inanna", "Inanna", "inanna", "Sumerian", "Latin", "Inanna", "language-form"),
        ("inana", "Inana", "inana", "Sumerian", "Latin", "Inana", "transliteration"),
        ("ishtar", "Ištar", "ishtar", "Akkadian", "Latin", "Ištar", "language-form"),
        ("ishtar-ascii", "Ishtar", "ishtar", "English", "Latin", "Ishtar", "alternate-name"),
    ],
    "utu-shamash": [
        ("canonical", "Utu / Šamaš", "utu shamash", "English scholarly", "Latin", "Utu / Šamaš", "canonical"),
        ("utu", "Utu", "utu", "Sumerian", "Latin", "Utu", "language-form"),
        ("shamash", "Šamaš", "shamash", "Akkadian", "Latin", "Šamaš", "language-form"),
        ("shamash-ascii", "Shamash", "shamash", "English", "Latin", "Shamash", "alternate-name"),
        ("d-utu", "{d}utu", "utu", "Sumerian", "Cuneiform transliteration", "{d}utu", "transliteration"),
    ],
    "osiris-wsir": [
        ("canonical", "Osiris / Wsir", "osiris wsir", "English scholarly", "Latin", "Osiris / Wsir", "canonical"),
        ("osiris", "Osiris", "osiris", "Greek/English", "Latin", "Osiris", "translation-rendering"),
        ("wsir", "Wsir", "wsir", "Ancient Egyptian", "Egyptian transliteration", "Wsir", "language-form"),
        ("wesir", "Wesir", "wesir", "Egyptological English", "Latin", "Wesir", "transliteration"),
        ("usir", "Usir", "usir", "Egyptological English", "Latin", "Usir", "transliteration"),
    ],
    "isis-aset": [
        ("canonical", "Isis / Aset", "isis aset", "English scholarly", "Latin", "Isis / Aset", "canonical"),
        ("isis", "Isis", "isis", "Greek/English", "Latin", "Isis", "translation-rendering"),
        ("aset", "Aset", "aset", "Egyptological English", "Latin", "Aset", "transliteration"),
        ("ast", "ꜣst", "ast", "Ancient Egyptian", "Egyptian transliteration", "ꜣst", "language-form"),
    ],
    "thoth-djehuty": [
        ("canonical", "Thoth / Djehuty", "thoth djehuty", "English scholarly", "Latin", "Thoth / Djehuty", "canonical"),
        ("thoth", "Thoth", "thoth", "Greek/English", "Latin", "Thoth", "translation-rendering"),
        ("djehuty", "Djehuty", "djehuty", "Egyptological English", "Latin", "Djehuty", "transliteration"),
        ("dhwty", "Ḏḥwty", "dhwty", "Ancient Egyptian", "Egyptian transliteration", "Ḏḥwty", "language-form"),
    ],
    "horus-heru": [
        ("canonical", "Horus / Heru", "horus heru", "English scholarly", "Latin", "Horus / Heru", "canonical"),
        ("horus", "Horus", "horus", "Greek/English", "Latin", "Horus", "translation-rendering"),
        ("heru", "Heru", "heru", "Egyptological English", "Latin", "Heru", "transliteration"),
        ("hr", "Ḥr", "hr", "Ancient Egyptian", "Egyptian transliteration", "Ḥr", "language-form"),
    ],
    "laozi": [
        ("canonical", "Laozi", "laozi", "Modern Chinese", "Latin", "Lǎozǐ", "canonical"),
        ("characters", "老子", "老子", "Classical Chinese", "Han", "Lǎozǐ", "language-form"),
        ("pinyin", "Lǎozǐ", "laozi", "Modern Chinese", "Latin", "Lǎozǐ", "transliteration"),
        ("wade-giles", "Lao Tzu", "lao tzu", "English", "Latin", "Lao Tzu", "alternate-name"),
    ],
    "yijing": [
        ("canonical", "Yijing", "yijing", "Modern Chinese", "Latin", "Yìjīng", "canonical"),
        ("characters", "易經", "易經", "Classical Chinese", "Han", "Yìjīng", "language-form"),
        ("pinyin", "Yìjīng", "yijing", "Modern Chinese", "Latin", "Yìjīng", "transliteration"),
        ("i-ching", "I Ching", "i ching", "English", "Latin", "I Ching", "alternate-name"),
    ],
    "belial": [
        ("canonical", "Belial", "belial", "English", "Latin", "Belial", "canonical"),
        ("hebrew", "בְּלִיַּעַל", "בליעל", "Biblical Hebrew", "Hebrew", "bĕliyyaʿal", "language-form"),
        ("translit", "bĕliyyaʿal", "beliyyaal", "Biblical Hebrew", "Latin", "bĕliyyaʿal", "transliteration"),
        ("beliar", "Beliar", "beliar", "Greek textual tradition", "Latin", "Beliar", "alternate-name"),
    ],
    "baal": [
        ("canonical", "Baal / Baʿal", "baal", "English scholarly", "Latin", "Baal / Baʿal", "canonical"),
        ("hebrew", "בַּעַל", "בעל", "Biblical Hebrew", "Hebrew", "baʿal", "language-form"),
        ("baal", "Baal", "baal", "English", "Latin", "Baal", "translation-rendering"),
        ("baal-mark", "Baʿal", "baal", "Biblical Hebrew", "Latin", "Baʿal", "transliteration"),
    ],
    "satan": [
        ("canonical", "Satan", "satan", "English", "Latin", "Satan", "canonical"),
        ("hebrew", "שָׂטָן", "שטן", "Biblical Hebrew", "Hebrew", "śāṭān", "language-form"),
        ("translit", "śāṭān", "satan", "Biblical Hebrew", "Latin", "śāṭān", "transliteration"),
        ("article", "ha-satan", "ha satan", "Biblical Hebrew", "Latin", "ha-śśāṭān", "transliteration"),
    ],
    "lucifer": [
        ("canonical", "Lucifer", "lucifer", "Latin", "Latin", "Lucifer", "canonical"),
        ("latin", "lucifer", "lucifer", "Latin", "Latin", "lucifer", "language-form"),
        ("heosphoros", "ἑωσφόρος", "heosphoros", "Septuagint Greek", "Greek", "heōsphoros", "translation-rendering"),
        ("heylel", "hêlēl", "helel", "Biblical Hebrew", "Latin", "hêlēl", "transliteration"),
    ],
    "azazel": [
        ("canonical", "Azazel", "azazel", "English", "Latin", "Azazel", "canonical"),
        ("hebrew", "עֲזָאזֵל", "עזאזל", "Biblical Hebrew", "Hebrew", "ʿazāʾzēl", "language-form"),
        ("translit", "ʿazāʾzēl", "azazel", "Biblical Hebrew", "Latin", "ʿazāʾzēl", "transliteration"),
        ("azazel-mark", "Azāzēl", "azazel", "English scholarly", "Latin", "Azāzēl", "alternate-name"),
    ],
    "isac": [
        ("canonical", "Institute for the Study of Ancient Cultures", "institute for the study of ancient cultures", "English", "Latin", "Institute for the Study of Ancient Cultures", "canonical"),
        ("short", "UChicago ISAC", "uchicago isac", "English", "Latin", "UChicago ISAC", "alternate-name"),
        ("abbrev", "ISAC", "isac", "English", "Latin", "ISAC", "abbreviation"),
        ("former", "Oriental Institute", "oriental institute", "English", "Latin", "Oriental Institute", "former-name"),
    ],
    "first-council-nicaea": [
        ("canonical", "First Council of Nicaea", "first council of nicaea", "English", "Latin", "First Council of Nicaea", "canonical"),
        ("short", "Council of Nicaea", "council of nicaea", "English", "Latin", "Council of Nicaea", "alternate-name"),
        ("numbered", "Nicaea I", "nicaea i", "English", "Latin", "Nicaea I", "alternate-name"),
        ("ecumenical", "First Ecumenical Council", "first ecumenical council", "English", "Latin", "First Ecumenical Council", "alternate-name"),
    ],
}


ENTITY_SOURCE = {entity["id"]: entity["sourceIds"] for entity in ENTITIES}
NAME_CONTEXTS = {
    "anunna": "third- through first-millennium BCE Mesopotamian evidence summarized by ORACC, where the collective's membership and function change by source and period",
    "enki-ea": "Sumerian Enki and Akkadian Ea traditions summarized by ORACC across third- through first-millennium BCE Mesopotamian evidence",
    "inanna-ishtar": "Sumerian Inana/Inanna and Akkadian Ištar evidence summarized by ORACC across changing Mesopotamian language and cult settings",
    "utu-shamash": "Sumerian Utu and Akkadian Šamaš evidence summarized by ORACC across changing Mesopotamian language and historical settings",
    "osiris-wsir": "Old Kingdom and later Egyptian evidence plus historically situated Greek and English renderings documented by UCL and the cited Budge edition",
    "isis-aset": "Old Kingdom and later Egyptian evidence plus Greco-Roman and English reception documented by UCL and the cited Budge edition",
    "thoth-djehuty": "Old Kingdom and later Egyptian evidence plus Greek and English renderings documented by UCL and the cited Budge edition",
    "horus-heru": "Predynastic or Early Dynastic and later Egyptian evidence plus Greek and English renderings documented by UCL and the cited Budge edition",
    "laozi": "layered Chinese textual attribution, early manuscript traditions, received Dao De Jing transmission, and later Daoist reception documented by the Library of Congress and Stanford Encyclopedia of Philosophy",
    "yijing": "the composite Yijing tradition from Western Zhou oracles through later commentarial layers, the Library of Congress's 1851 Yi jing edition, and modern scholarly naming",
    "belial": "Hebrew Bible uses of bĕliyyaʿal and the later personification history described by the cited Encyclopaedia Judaica entry",
    "baal": "Hebrew Bible Baal forms in Judges 2; this assertion set does not claim an earlier Ugaritic or second-millennium attestation",
    "satan": "Hebrew Bible adversary or accuser contexts in Job and Zechariah and later historical development summarized by Bible Odyssey",
    "lucifer": "Isaiah 14's Hebrew, Septuagint Greek, and Latin renderings and the later Christian identification documented by the cited reference history",
    "azazel": "the designation in the Leviticus 16 ritual and its disputed interpretation summarized by Bible Odyssey",
    "isac": "the University of Chicago institute's current name from April 2023 and its documented earlier institutional name",
    "first-council-nicaea": "the council held in 325 CE and the later English and ecumenical labels used by the cited Fordham and Vatican sources",
}


def scoped_name_evidence(entity_id: str, spec: tuple[str, str, str, str, str, str, str]) -> str:
    key, name, _, language, _, _, assertion_type = spec
    context = NAME_CONTEXTS[entity_id]
    if entity_id == "isac" and key == "former":
        return f'"{name}" is the English former name used before the April 2023 renaming; it is preserved for historical discovery, not presented as the current institutional name.'
    if entity_id == "lucifer" and key == "heosphoros":
        return f'"{name}" is the Septuagint Greek rendering attested at Isaiah 14:12; it is a translation-stage form in {context}, not an unconditional name for Satan.'
    if entity_id == "lucifer" and key == "heylel":
        return f'"{name}" is a romanized Biblical Hebrew form for the Isaiah 14:12 expression in {context}; it is a transliteration, not a translation or an alias of Satan.'
    roles = {
        "canonical": "the Atlas canonical discovery label",
        "language-form": f"a source-language form recorded as {language}",
        "transliteration": f"a romanized or scholarly transliteration in {language}",
        "translation-rendering": f"a historically situated {language} rendering",
        "alternate-name": f"a source-supported alternate discovery name in {language}",
        "abbreviation": f"a documented {language} abbreviation",
        "former-name": f"a historically bounded former name in {language}",
    }
    return f'"{name}" is {roles[assertion_type]} for {context}.'


NAME_ASSERTIONS = []
for entity_id, assertions in NAME_SPECS.items():
    for spec in assertions:
        scope = scoped_name_evidence(entity_id, spec)
        NAME_ASSERTIONS.append(name_assertion(entity_id, *spec, scope, ENTITY_SOURCE[entity_id]))


def occurrence(
    occurrence_id: str,
    entity_id: str,
    source_id: str,
    work_id: str | None,
    locator: str,
    attested_form: str,
    language: str,
    script: str,
    transliteration: str,
    role: str,
    description: str,
    confidence: str = "high",
) -> dict:
    return {
        "id": occurrence_id,
        "entityId": entity_id,
        "sourceId": source_id,
        "workId": work_id,
        "locator": locator,
        "attestedForm": attested_form,
        "originalForm": attested_form if script in {"Han", "Hebrew"} or language == "Latin" else None,
        "language": language,
        "script": script,
        "transliteration": transliteration,
        "role": role,
        "description": description,
        "sourceIds": [source_id],
        "confidence": confidence,
    }


with ANUNNA_EVIDENCE.open(encoding="utf-8") as handle:
    anunna_evidence = json.load(handle)

OCCURRENCES = []
for item in anunna_evidence["primarySources"]:
    OCCURRENCES.append(
        occurrence(
            f"occ-anunna-{item['id']}",
            "anunna",
            f"src-oracc-{item['qId'].lower()}",
            item["workId"],
            item["line"],
            "a-nun-na",
            "Sumerian",
            "Cuneiform transliteration",
            item["transliteration"],
            "Divine collective; the local role must be interpreted within the cited composition.",
            item["note"],
        )
    )


with ORACC_DATA.open(encoding="utf-8") as handle:
    oracc_works = {work["qId"]: work for work in json.load(handle)["works"]}


def add_oracc_occurrence(entity_id: str, qid: str, token_pattern: str, work_id: str, role: str) -> None:
    work = oracc_works[qid]
    line = next(line for line in work["lines"] if re.search(token_pattern, line["text"], re.IGNORECASE))
    OCCURRENCES.append(
        occurrence(
            f"occ-{entity_id}-{qid.lower()}-{re.sub(r'[^a-z0-9]+', '-', line['label'].lower()).strip('-')}",
            entity_id,
            f"src-oracc-{qid.lower()}",
            work_id,
            line["label"],
            {"enki-ea": "{d}en-ki", "inanna-ishtar": "{d}inana", "utu-shamash": "{d}utu"}[entity_id],
            "Sumerian",
            "Cuneiform transliteration",
            line["text"],
            role,
            "Exact ORACC composite transliteration; the Q composite is not represented as one physical tablet.",
        )
    )


for qid, work_id in [("Q000332", "enki-and-ninhursag"), ("Q000333", "enki-and-ninmah"), ("Q000334", "enki-and-the-world-order"), ("Q000335", "enki-journey-nippur")]:
    add_oracc_occurrence("enki-ea", qid, r"\{d\}en-ki", work_id, "Named deity in the cited Sumerian composition.")
for qid, work_id in [("Q000338", "inanna-and-enki"), ("Q000339", "inanna-and-ebih"), ("Q000340", "inanna-and-shukaletuda"), ("Q000343", "descent-of-inanna")]:
    add_oracc_occurrence("inanna-ishtar", qid, r"\{d\}inana", work_id, "Named deity in the cited Sumerian composition.")
for qid, work_id in [("Q000332", "enki-and-ninhursag"), ("Q000334", "enki-and-the-world-order"), ("Q000351", "ninurta-exploits")]:
    add_oracc_occurrence("utu-shamash", qid, r"\{d\}utu", work_id, "Named deity or divine name element in the cited Sumerian composition.")


for entity_id, rows in {
    "osiris-wsir": [("Hymn to Osiris", "Osiris", "Deity addressed in the mortuary edition."), ("Chapter I", "Osiris", "Divine precedent in burial ritual commentary."), ("Chapter XLIII", "Osiris", "Lord of Eternity in the edition's summary."), ("Chapter CLIV", "Osiris", "Addressee in the edition's chapter summary.")],
    "isis-aset": [("Chapter VII", "Isis", "Mother of Horus in the edition's summary."), ("Chapter CLV–CLXVII", "Isis", "Protective deity in amulet chapter summaries."), ("Index: Isis", "Isis", "Indexed divine name in this historical edition.")],
    "thoth-djehuty": [("Chapter I", "Thoth", "Priestly identification in burial commentary."), ("Chapters XVIII–XXV", "Thoth", "Divine helper associated with speech and knowledge."), ("Chapters XCIV–XCVII", "Thoth", "Deity associated with books and scribal role.")],
    "horus-heru": [("Chapter VII", "Horus", "Divine adversary of Aapep in the edition's summary."), ("Chapters CXI–CXIII", "Horus", "Figure in narrated mythic episodes."), ("Chapter XVIII", "Horus", "User of the spell in editorial commentary.")],
}.items():
    for index, (locator, form, role) in enumerate(rows, 1):
        OCCURRENCES.append(occurrence(f"occ-{entity_id}-book-dead-{index}", entity_id, "src-gutenberg-book-dead", "book-of-the-dead", locator, form, "English", "Latin", form, role, "Occurrence in Budge's historically situated English edition; not an original-script witness."))


for index, (source_id, locator, form, language, script, transliteration, role) in enumerate([
    ("src-ctext-dao-de-jing", "work title and attribution metadata", "老子", "Chinese", "Han", "Lǎozǐ", "Attributed author designation in the digital edition."),
    ("src-loc-laozi", "Library of Congress catalog title for the digitized Song edition", "Laozi Dao de jing", "Library catalog romanization", "Latin", "Laozi Dao de jing", "Catalog title of the linked historical edition."),
    ("src-loc-laozi", "Library of Congress description of the Guodian and Mawangdui witnesses", "Laozi", "English catalog description", "Latin", "Laozi", "Conventional work title used by the catalog when discussing the early manuscript witnesses; not a claim that this Latin spelling appears on the slips."),
], 1):
    OCCURRENCES.append(occurrence(f"occ-laozi-{index}", "laozi", source_id, "tao-te-ching", locator, form, language, script, transliteration, role, "Textual attribution does not by itself establish a single certain historical biography."))


for index, (source_id, locator, form, language, script, transliteration, role, description) in enumerate([
    ("src-ctext-book-changes", "work title", "易經", "Classical Chinese", "Han", "Yìjīng", "Received title of the work.", "Title attestation in the Chinese Text Project edition."),
    ("src-loc-yijing", "Library of Congress title field", "Yi jing", "Library catalog romanization", "Latin", "Yi jing", "Romanized title of the cataloged four-juan edition.", "Institutional catalog title for the linked 1851 edition."),
    ("src-loc-yijing", "Library of Congress other-title field", "周易", "Chinese", "Han", "Zhōuyì", "Chinese alternate title of the cataloged edition.", "Institutional catalog title form; this is a work-title attestation, not a hexagram heading."),
], 1):
    OCCURRENCES.append(occurrence(f"occ-yijing-{index}", "yijing", source_id, "i-ching", locator, form, language, script, transliteration, role, description))


OCCURRENCE_SOURCE_KEYS = {
    "src-sefaria-deuteronomy-13": "deuteronomy",
    "src-sefaria-1-samuel-2": "1-samuel",
    "src-sefaria-nahum-1": "nahum",
    "src-sefaria-judges-2": "judges",
    "src-sefaria-1-kings-18": "1-kings",
    "src-sefaria-job-1": "job",
    "src-sefaria-zechariah-3": "zechariah",
    "src-vatican-vulgate-isaiah": "isaiah",
    "src-vatican-vulgate-2-peter": "2-peter",
    "src-sefaria-leviticus-16": "leviticus",
}
for entity_id, source_id, work_id, rows in [
    ("belial", "src-sefaria-deuteronomy-13", None, [("13:14", "בְנֵי־בְלִיַּעַל", "Descriptive Hebrew expression; not yet automatically a proper-name demon.")]),
    ("belial", "src-sefaria-1-samuel-2", None, [("2:12", "בְּנֵי בְלִיָּעַל", "Descriptive Hebrew expression applied to the sons of Eli.")]),
    ("belial", "src-sefaria-nahum-1", None, [("1:11", "בְּלִיָּעַל", "Hebrew occurrence in a counsel or counselor expression; later personification remains a separate stage.")]),
    ("baal", "src-sefaria-judges-2", None, [("2:11", "הַבְּעָלִים", "Plural form referring to the Baals."), ("2:13", "לַבַּעַל", "Baal in a named worship context.")]),
    ("baal", "src-sefaria-1-kings-18", None, [("18:21", "הַבַּעַל", "Baal in Elijah's address to the people.")]),
    ("satan", "src-sefaria-job-1", "job", [("1:6", "הַשָּׂטָן", "The accuser/adversary figure in the Job court scene."), ("1:7", "הַשָּׂטָן", "Same source scene; role must remain source-specific.")]),
    ("satan", "src-sefaria-zechariah-3", None, [("3:1", "הַשָּׂטָן", "Accuser/adversary in the cited vision.")]),
    ("lucifer", "src-vatican-vulgate-isaiah", "book-of-isaiah", [("14:12", "lucifer", "Latin morning-star rendering in Isaiah; later personification is a reception development.")]),
    ("lucifer", "src-vatican-vulgate-2-peter", None, [("1:19", "lucifer", "Latin morning-star usage in a distinct New Testament context; not a demonic proper name in this occurrence.")]),
    ("azazel", "src-sefaria-leviticus-16", None, [("16:8", "עֲזָאזֵל", "Destination or entity designation in the lot ritual; interpretation remains disputed."), ("16:10", "עֲזָאזֵל", "Second occurrence in the ritual instructions.")]),
]:
    for index, (locator, form, role) in enumerate(rows, 1):
        language = "Latin" if entity_id == "lucifer" else ("English" if form.isascii() else "Biblical Hebrew")
        script = "Latin" if form.isascii() else "Hebrew"
        romanization = {
            "בְנֵי־בְלִיַּעַל": "bənê-bəliyyaʿal",
            "בְּנֵי בְלִיָּעַל": "bənê bəliyyaʿal",
            "בְּלִיָּעַל": "bəliyyaʿal",
            "הַבְּעָלִים": "habbaʿālîm",
            "לַבַּעַל": "labbaʿal",
            "הַבַּעַל": "habbaʿal",
            "הַשָּׂטָן": "haśśāṭān",
            "עֲזָאזֵל": "ʿăzāʾzēl",
        }.get(form, form if language == "Latin" else "")
        occurrence_key = OCCURRENCE_SOURCE_KEYS[source_id]
        OCCURRENCES.append(occurrence(f"occ-{entity_id}-{occurrence_key}-{index}", entity_id, source_id, work_id, locator, form, language, script, romanization, role, "The occurrence records the cited source form and does not impose a later identity.", "medium" if entity_id in {"lucifer", "azazel"} else "high"))


OCCURRENCES.append(occurrence("occ-isac-current-name", "isac", "src-isac-about", None, "institution heading", "Institute for the Study of Ancient Cultures", "English", "Latin", "Institute for the Study of Ancient Cultures", "Current institutional name.", "Institutional self-description and current naming; no Atlas work record represents this institution."))
OCCURRENCES.append(occurrence("occ-nicaea-325", "first-council-nicaea", "src-fordham-nicaea", None, "Council documents, 325 CE", "Council of Nicaea", "English", "Latin", "Council of Nicaea", "Council named in the source collection.", "University-hosted translation; no Atlas work record currently represents this source collection."))


def relationship(relationship_id: str, source_entity_id: str, target_entity_id: str, relationship_type: str, scope: str, summary: str, source_ids: list[str], confidence: str = "high", start_date: str | None = None, end_date: str | None = None) -> dict:
    return {
        "id": relationship_id,
        "sourceEntityId": source_entity_id,
        "targetEntityId": target_entity_id,
        "relationshipType": relationship_type,
        "scope": scope,
        "startDate": start_date,
        "endDate": end_date,
        "summary": summary,
        "sourceIds": source_ids,
        "confidence": confidence,
        "isEquivalence": False,
    }


RELATIONSHIPS = [
    relationship("rel-anunna-enki-membership", "enki-ea", "anunna", "contextual-group-association", "Some Sumerian literary contexts", "Enki appears in contexts that also invoke the Anunna; this does not define a fixed roster.", ["src-oracc-anunna", "src-oracc-q000334"]),
    relationship("rel-anunna-inanna-membership", "inanna-ishtar", "anunna", "contextual-group-association", "Inanna and Ebih, line 88", "Inanna is related to the Anunna in the cited composition; the local wording does not establish an eternal membership list.", ["src-oracc-q000339", "src-oracc-anunna"]),
    relationship("rel-anunna-utu-membership", "utu-shamash", "anunna", "contextual-cooccurrence", "Ninurta's exploits, ORACC composite Q000351", "Utu and the Anunna are both attested in the cited Sumerian composition; this records source-level co-occurrence rather than a fixed membership or name-equivalence.", ["src-oracc-q000351"], "medium"),
    relationship("rel-isis-horus-parentage", "isis-aset", "horus-heru", "parent-child-in-source", "Egyptian mythic traditions represented in the cited edition", "The edition identifies Horus as son of Isis; local Horus forms and narratives still require source context.", ["src-gutenberg-book-dead"]),
    relationship("rel-osiris-horus-succession", "osiris-wsir", "horus-heru", "mythic-succession-in-source", "Egyptian royal and mortuary traditions represented in the cited edition", "Horus succeeds Osiris in a source-specific mythic and royal relationship.", ["src-gutenberg-book-dead"]),
    relationship("rel-belial-baal-rejected", "belial", "baal", "rejected-identification", "Lexical and historical distinction", "Similar modern spellings do not make Belial and Baal aliases; the cited sources attest different Hebrew forms and histories.", ["src-sefaria-deuteronomy-13", "src-sefaria-judges-2", "src-encyclopaedia-belial"]),
    relationship("rel-lucifer-satan-later-conflation", "lucifer", "satan", "later-contextual-conflation", "Later Christian interpretation of Isaiah 14", "A later interpretive tradition identifies the Isaiah morning-star figure called Lucifer in Latin with Satan; the Hebrew, Greek, and Latin source forms remain translation-stage evidence, not lexical aliases of Satan.", ["src-sefaria-isaiah-14", "src-lxx-isaiah-14", "src-vatican-vulgate-isaiah", "src-encyclopaedia-lucifer"], "high", "third century CE and later", None),
    relationship("rel-thoth-osiris-judgment", "thoth-djehuty", "osiris-wsir", "contextual-ritual-role", "Book of the Dead, Chapter V and the judgment scene in the cited Budge edition", "In this mortuary presentation, Thoth records the judgment and serves as advocate in the hall of Osiris; the relationship is a source-specific ritual role, not an identity between the deities.", ["src-gutenberg-book-dead"]),
]


def evolution_path(path_id: str, entity_id: str, title: str, summary: str, source_ids: list[str]) -> dict:
    return {"id": path_id, "entityId": entity_id, "title": title, "summary": summary, "sourceIds": source_ids}


EVOLUTION_PATHS = [
    evolution_path("path-anunna", "anunna", "Changing scope of the Anunna", "Tracks a variable divine collective through ancient attestations and a documented modern ancient-astronaut reinterpretation without treating the latter as evidence about antiquity.", ["src-oracc-anunna", "src-sitchin-12th-planet", "src-sitchin-divine-encounters"]),
    evolution_path("path-enki-ea", "enki-ea", "Enki and Ea name history", "Tracks Sumerian and Akkadian forms and modern scholarly display.", ["src-oracc-enki"]),
    evolution_path("path-inanna-ishtar", "inanna-ishtar", "Inanna and Ištar reception", "Tracks language forms and historical reception without treating every local role as identical.", ["src-oracc-inana"]),
    evolution_path("path-osiris", "osiris-wsir", "Osiris across mortuary and later reception contexts", "Tracks source roles and later rendering history.", ["src-ucl-egypt-deities", "src-gutenberg-book-dead"]),
    evolution_path("path-laozi", "laozi", "Laozi from textual attribution to religious figure", "Separates early textual witnesses, layered biography, received textual attribution, and later religious reception.", ["src-ctext-dao-de-jing", "src-loc-laozi", "src-stanford-laozi"]),
    evolution_path("path-yijing", "yijing", "Yijing textual development and reception", "Tracks the composite Changes tradition, a cataloged historical edition, and modern scholarly naming without treating hexagram headings as work-title occurrences.", ["src-ctext-book-changes", "src-stanford-chinese-change", "src-loc-yijing"]),
    evolution_path("path-belial", "belial", "Belial from descriptor to personified figure", "Separates Hebrew lexical contexts from later personification.", ["src-sefaria-deuteronomy-13", "src-encyclopaedia-belial"]),
    evolution_path("path-satan", "satan", "Satan role development", "Tracks adversary/accuser roles and later personification without flattening every source.", ["src-sefaria-job-1", "src-sefaria-zechariah-3", "src-bibleodyssey-satan"]),
    evolution_path("path-lucifer", "lucifer", "Lucifer from Latin rendering to later figure", "Separates the Hebrew expression and Greek and Latin morning-star renderings from their later Christian identification with Satan.", ["src-sefaria-isaiah-14", "src-lxx-isaiah-14", "src-vatican-vulgate-isaiah", "src-encyclopaedia-lucifer"]),
]


STAGE_SPECS = {
    "path-anunna": [
        ("early-source", "Sumerian literary attestations", "Third to early second millennium BCE", "Variable divine collective", "ORACC lines preserve source-specific forms and roles.", ["src-oracc-q000333", "src-oracc-q000334", "src-oracc-q000337"]),
        ("historical-development", "Broader divine collective", "Sumerian traditions", "High gods or local pantheon", "The collective's membership and scope vary by context.", ["src-oracc-anunna"]),
        ("historical-development", "Underworld emphasis in some later evidence", "Later Akkadian traditions", "Sometimes contrasted with Igigi", "A later contextual emphasis does not govern all earlier uses.", ["src-oracc-anunna"]),
        ("modern-reinterpretation", "Zecharia Sitchin's ancient-astronaut reinterpretation", "1976 and later", "Modern ancient-astronaut reception", "Publisher descriptions document Sitchin's Nibiru and human-worker claims; they are primary evidence for modern reception and not evidence about antiquity.", ["src-sitchin-12th-planet", "src-sitchin-divine-encounters", "src-oracc-anunna"]),
    ],
    "path-enki-ea": [
        ("early-source", "Enki in Sumerian compositions", "Third to second millennium BCE", "Named Sumerian deity", "Exact occurrences remain tied to each composition.", ["src-oracc-q000332", "src-oracc-q000334"]),
        ("historical-development", "Ea in Akkadian contexts", "Second and first millennia BCE", "Akkadian language form and developed roles", "The name relationship is historical and linguistic, not a rule that erases source language.", ["src-oracc-enki"]),
        ("modern-scholarship", "Modern combined display", "Modern scholarship", "Enki / Ea", "Combined display supports discovery while source occurrences preserve their attested form.", ["src-oracc-enki"]),
    ],
    "path-inanna-ishtar": [
        ("early-source", "Inana in Sumerian compositions", "Third to second millennium BCE", "Sumerian divine name", "ORACC occurrences preserve composition and line.", ["src-oracc-q000338", "src-oracc-q000339"]),
        ("historical-development", "Ištar in Akkadian traditions", "Second and first millennia BCE", "Akkadian divine name and changing roles", "Historical identification does not erase local variation.", ["src-oracc-inana"]),
        ("modern-scholarship", "Modern normalized discovery", "Modern scholarship", "Inanna / Ištar", "Search aliases coexist with historically specific display forms.", ["src-oracc-inana"]),
    ],
    "path-osiris": [
        ("early-source", "Wsir in Egyptian evidence", "Old Kingdom onward", "Egyptian deity in royal and mortuary settings", "The transliterated Egyptian form is preserved as a language form.", ["src-ucl-egypt-deities"]),
        ("historical-development", "Osiris in mortuary traditions", "Pharaonic Egypt", "Postmortem kingship and regeneration", "Roles and relationships are tracked in the cited edition.", ["src-gutenberg-book-dead"]),
        ("translation-reception", "Osiris in Greek and English rendering", "Classical reception to modern scholarship", "Conventional translated name", "A rendering is distinct from an original-language form.", ["src-ucl-egypt-deities"]),
    ],
    "path-laozi": [
        ("early-source", "Early Laozi-related manuscripts", "Before 300 BCE and 168 BCE burial contexts reported by the Library of Congress", "Partial and variant textual witnesses", "The Library of Congress describes Guodian bamboo and Mawangdui silk witnesses as distinct early editions; this stage does not claim that they are one identical received text.", ["src-loc-laozi", "src-stanford-laozi"]),
        ("historical-development", "Received Dao De Jing attribution", "Imperial Chinese transmission", "Attributed author of the work", "Textual attribution and biography remain analytically separate.", ["src-ctext-dao-de-jing"]),
        ("religious-development", "Laozi in Daoist religious reception", "Later Chinese traditions", "Religious figure and, in some Daoist contexts, deity", "The Stanford overview documents Laozi's place in organized and religious Daoism; those roles are reception history rather than proof of an early biography.", ["src-stanford-laozi"]),
    ],
    "path-yijing": [
        ("early-source", "Oracle and hexagram layers", "Western Zhou strata in the scholarly reconstruction", "Divination text strata", "The Stanford overview describes Western Zhou oracle material as early layers of a composite text; the dating does not imply one surviving autograph.", ["src-stanford-chinese-change"]),
        ("historical-development", "Commentarial and canonical layers", "Fifth to second centuries BCE and later transmission", "Composite classic with commentarial materials", "The Stanford overview distinguishes hexagrams, statements, and later Ten Wings rather than presenting the Yijing as a single-author work.", ["src-stanford-chinese-change"]),
        ("modern-reception", "Yijing, I Ching, and Book of Changes discovery names", "Modern scholarship and cataloging", "Cross-script title discovery", "The Stanford overview explicitly records Yijing, I Ching, and Book of Changes; the Library of Congress record attests Yi jing and Zhou yi title forms, while the Atlas i-ching identifier links one work record.", ["src-stanford-chinese-change", "src-loc-yijing"]),
    ],
    "path-belial": [
        ("early-source", "Hebrew descriptive usage", "Hebrew Bible contexts", "Quality or class designation", "The cited Hebrew expression is not automatically a proper-name demon.", ["src-sefaria-deuteronomy-13"]),
        ("personification", "Personified Belial/Beliar", "Second Temple and early Christian texts", "Adversarial figure", "Personification is a later historical development.", ["src-encyclopaedia-belial"]),
        ("later-reception", "Later demonological reception", "Medieval to modern reception", "Named demonological figure", "Later reception does not make Belial an alias of Baal.", ["src-encyclopaedia-belial"]),
    ],
    "path-satan": [
        ("early-source", "Adversary or accuser", "Hebrew Bible contexts", "Role designation", "Job and Zechariah occurrences remain tied to their scenes.", ["src-sefaria-job-1", "src-sefaria-zechariah-3"]),
        ("personification", "Developing personified adversary", "Second Temple and early Christian contexts", "Adversarial figure", "Development is traced rather than projected backward.", ["src-bibleodyssey-satan"]),
        ("later-reception", "Later devil traditions", "Late antique to modern", "Central adversarial figure in some traditions", "The later Lucifer identification is recorded only as a contextual reception relationship, not projected back into Hebrew Bible occurrences.", ["src-bibleodyssey-satan", "src-encyclopaedia-lucifer"]),
    ],
    "path-lucifer": [
        ("early-source", "Morning-star image", "Isaiah 14 Hebrew context", "Poetic image in a taunt", "The Hebrew source is not lexically Satan.", ["src-sefaria-isaiah-14"]),
        ("translation-reception", "Latin lucifer rendering", "Latin biblical tradition", "Morning-star translation", "The Latin word is recorded before later personification.", ["src-vatican-vulgate-isaiah"]),
        ("later-conflation", "Identification with Satan", "Third century CE and later Christian reception", "Contextual identification", "The cited reference history documents the later identification; the Atlas records it as reception rather than an unconditional alias.", ["src-encyclopaedia-lucifer"]),
    ],
}


EVOLUTION_STAGES = []
path_entity = {path["id"]: path["entityId"] for path in EVOLUTION_PATHS}
for path_id, stages in STAGE_SPECS.items():
    for sequence, (stage_type, label, date_label, role, summary, source_ids) in enumerate(stages, 1):
        EVOLUTION_STAGES.append(
            {
                "id": f"stage-{path_id.removeprefix('path-')}-{sequence}",
                "pathId": path_id,
                "entityId": path_entity[path_id],
                "sequence": sequence,
                "stageType": stage_type,
                "label": label,
                "dateLabel": date_label,
                "role": role,
                "summary": summary,
                "sourceIds": source_ids,
            }
        )


def vocabulary_item(item_id: str, label: str, description: str) -> dict:
    return {
        "id": item_id,
        "label": label,
        "description": description,
        "requiresEvidence": True,
        "sourceIds": ["src-atlas-gap-audit"],
    }


CONFLICT_CAUSES = [
    vocabulary_item("religious", "Religious", "Documented doctrine, institution, sacred authority, or religious objective materially shaped the conflict."),
    vocabulary_item("theological", "Theological", "Documented theological disagreement or doctrinal boundary materially shaped the conflict."),
    vocabulary_item("political", "Political", "Competition for government, legitimacy, office, or political authority."),
    vocabulary_item("dynastic", "Dynastic", "Succession, lineage, or ruling-house competition."),
    vocabulary_item("territorial", "Territorial", "Control of land, borders, routes, or strategically significant places."),
    vocabulary_item("economic", "Economic", "Resources, taxation, property, labor, or trade materially shaped the conflict."),
    vocabulary_item("ethnic", "Ethnic", "Source-supported ethnic identity or classification materially shaped the conflict."),
    vocabulary_item("imperial", "Imperial", "Imperial expansion, rule, competition, or resistance materially shaped the conflict."),
    vocabulary_item("succession", "Succession", "A disputed transfer of political or religious authority materially shaped the conflict."),
    vocabulary_item("resource-related", "Resource-related", "Control or scarcity of material resources materially shaped the conflict."),
    vocabulary_item("anti-colonial", "Anti-colonial", "Resistance to colonial conquest or rule materially shaped the conflict."),
    vocabulary_item("nationalist", "Nationalist", "National identity or nation-state claims materially shaped the conflict."),
    vocabulary_item("ideological", "Ideological", "A political or social ideology materially shaped the conflict; evidence must identify the specific ideology and actors."),
    vocabulary_item("mixed", "Mixed", "Evidence supports multiple interacting causal categories; component causes should also be recorded where known."),
    vocabulary_item("disputed", "Disputed", "Substantial source or scholarly disagreement about causation remains explicit rather than being resolved by Atlas."),
]


CONVERSION_MODES = [
    vocabulary_item("voluntary-conversion", "Voluntary conversion", "Evidence supports an uncoerced change in affiliation or practice."),
    vocabulary_item("missionary-persuasion", "Missionary persuasion", "Teaching, preaching, or interpersonal persuasion is evidenced without assuming coercion."),
    vocabulary_item("patronage-incentive", "Patronage / incentive", "Material, status, or patronage incentives are documented."),
    vocabulary_item("elite-conversion", "Elite conversion", "Ruler or elite adoption is documented separately from population change."),
    vocabulary_item("social-pressure", "Social pressure", "Community or family pressure is evidenced without automatically labeling direct force."),
    vocabulary_item("legal-disadvantage", "Legal disadvantage", "Law imposed disadvantages tied to religious status."),
    vocabulary_item("religious-discrimination", "Religious discrimination", "Documented unequal treatment targeted religious affiliation or practice."),
    vocabulary_item("state-sponsorship", "State sponsorship", "Government support favored a religion without by itself proving mass conversion."),
    vocabulary_item("legal-prohibition", "Legal prohibition", "Law prohibited a religion, practice, institution, or text."),
    vocabulary_item("conversion-under-threat", "Conversion under threat", "A credible threat conditioned the change, even where immediate physical force is not documented."),
    vocabulary_item("forced-conversion", "Forced conversion", "Direct coercion is supported by evidence; conquest alone is insufficient."),
    vocabulary_item("conquest-gradual-change", "Conquest followed by gradual religious change", "Religious change followed conquest over time without presuming direct forced conversion."),
    vocabulary_item("forced-assimilation", "Forced assimilation", "Authorities compelled broader cultural assimilation that included religious change."),
    vocabulary_item("cultural-assimilation", "Cultural assimilation", "Long-term cultural integration is evidenced without presuming direct force."),
    vocabulary_item("suppression-traditional-religion", "Suppression of traditional religion", "Authorities or institutions suppressed established ritual, institutions, or transmission."),
    vocabulary_item("syncretic-adaptation", "Syncretic adaptation", "Sources support adaptation or recombination across traditions."),
    vocabulary_item("continuity-despite-change", "Religious continuity despite political change", "Evidence shows continuing practice or identity despite a change in political control."),
]


CONFLICT_CASES = [
    {
        "id": "conflict-thirty-years-war",
        "name": "Thirty Years' War",
        "startDate": "1618",
        "endDate": "1648",
        "dateLabel": "1618–1648",
        "locations": ["Holy Roman Empire", "German lands", "Central Europe"],
        "actors": [
            "Catholic, Lutheran, and Calvinist Imperial estates",
            "Holy Roman emperors of the House of Habsburg",
            "Denmark",
            "Sweden",
            "France",
        ],
        "summary": "A changing series of wars in which confessional alignments interacted with territorial ambitions and interstate competition.",
        "statedCause": "There was no single stated cause shared by every belligerent: confessional defense, territorial acquisition, and geopolitical predominance appear in different actors' documented aims.",
        "participantJustifications": [
            "Catholic, Lutheran, and Calvinist rulers presented parts of the struggle through confessional allegiance.",
            "Denmark entered while seeking German territory after losses elsewhere.",
            "France supported the Protestant side primarily to pursue political predominance against Habsburg power.",
        ],
        "scholarlyInterpretations": [
            "OpenStax treats the war as part of the European wars of religion while explicitly identifying territorial and political motives for particular intervening states.",
            "The Westphalia settlement addressed ecclesiastical liberty alongside territorial, dynastic, and constitutional disputes, demonstrating that the conflict cannot be reduced to one causal axis.",
        ],
        "disputedCausation": "The relative weight of religion and state interest changes by belligerent and phase; Atlas does not label every action in the war as religiously caused.",
        "uncertainty": "These assignments describe evidenced case-level motives and settlement issues, not a uniform motive held by every soldier, ruler, or population.",
        "sourceIds": ["src-openstax-thirty-years-war", "src-yale-westphalia"],
    },
    {
        "id": "conflict-india-1857",
        "name": "Indian Rebellion of 1857",
        "startDate": "1857-05-10",
        "endDate": "1859-07-08",
        "dateLabel": "1857–1859",
        "locations": ["Meerut", "Delhi", "Northern and central India"],
        "actors": [
            "Bengal Army sepoys and other rebels",
            "British East India Company",
            "Dispossessed or threatened Indian rulers and elites",
            "Indian Hindu and Muslim communities represented in the cited sources",
        ],
        "summary": "A rebellion against East India Company rule with military, anti-colonial, political, and religious grievances whose relative weight varied among participants.",
        "statedCause": "Contemporary records repeatedly identify the cartridge controversy as an immediate trigger, while also naming annexation, military discipline, missionary activity, and opposition to foreign rule as wider grievances.",
        "participantJustifications": [
            "Contemporary Indian press extracts framed the cartridge orders and colonial policy as threats to religion and caste.",
            "Indian opponents of Company rule sought self-government or the restoration of displaced authority.",
            "Company and British parliamentary accounts disputed whether cartridges were the sole cause and acknowledged pre-existing grievances.",
        ],
        "scholarlyInterpretations": [
            "OpenStax presents the rebellion as an attempt to overthrow British rule and connects it to direct colonial administration, elite dispossession, missionary activity, and the cartridge crisis.",
            "The National Archives dossier preserves competing contemporary explanations rather than treating one participant account as a complete causal history.",
        ],
        "disputedCausation": "Sources disagree over whether greased-cartridge fears were a sole cause, an immediate trigger, or one grievance among broader anti-colonial and political causes.",
        "uncertainty": "The labels mutiny and rebellion encode different scopes and perspectives; this record uses rebellion while retaining the source terminology and does not impute one motive to all participants.",
        "sourceIds": ["src-openstax-india-1857", "src-national-archives-india-1857"],
    },
]


CONFLICT_CAUSE_ASSIGNMENTS = [
    {
        "id": "conflict-cause-thirty-years-religious",
        "conflictCaseId": "conflict-thirty-years-war",
        "causeId": "religious",
        "evidence": "The cited history situates the war among conflicts between Catholic and Protestant states and identifies Catholic, Lutheran, and Calvinist combatants in the Empire.",
        "evidenceBasis": "scholarly-analysis",
        "confidence": "high",
        "sourceIds": ["src-openstax-thirty-years-war"],
    },
    {
        "id": "conflict-cause-thirty-years-territorial",
        "conflictCaseId": "conflict-thirty-years-war",
        "causeId": "territorial",
        "evidence": "OpenStax identifies Denmark's hope of gaining German territory, while the peace treaty resolves named territorial possessions and cessions.",
        "evidenceBasis": "primary-and-scholarly",
        "confidence": "high",
        "sourceIds": ["src-openstax-thirty-years-war", "src-yale-westphalia"],
    },
    {
        "id": "conflict-cause-thirty-years-political",
        "conflictCaseId": "conflict-thirty-years-war",
        "causeId": "political",
        "evidence": "OpenStax states that Catholic France joined the Protestant side primarily to become Europe's preeminent power, evidence against an exclusively confessional classification.",
        "evidenceBasis": "scholarly-analysis",
        "confidence": "high",
        "sourceIds": ["src-openstax-thirty-years-war"],
    },
    {
        "id": "conflict-cause-thirty-years-mixed",
        "conflictCaseId": "conflict-thirty-years-war",
        "causeId": "mixed",
        "evidence": "The case evidence documents confessional alignment, territorial acquisition, and interstate power goals operating within the same conflict.",
        "evidenceBasis": "primary-and-scholarly",
        "confidence": "high",
        "sourceIds": ["src-openstax-thirty-years-war", "src-yale-westphalia"],
    },
    {
        "id": "conflict-cause-india-1857-anti-colonial",
        "conflictCaseId": "conflict-india-1857",
        "causeId": "anti-colonial",
        "evidence": "OpenStax describes the rebellion as an attempt to overthrow British rule and places it within resistance to foreign domination.",
        "evidenceBasis": "scholarly-analysis",
        "confidence": "high",
        "sourceIds": ["src-openstax-india-1857"],
    },
    {
        "id": "conflict-cause-india-1857-religious",
        "conflictCaseId": "conflict-india-1857",
        "causeId": "religious",
        "evidence": "The sources document objections to missionary activity and fears that the cartridge order threatened Hindu and Muslim religious observance and caste status.",
        "evidenceBasis": "primary-and-scholarly",
        "confidence": "high",
        "sourceIds": ["src-openstax-india-1857", "src-national-archives-india-1857"],
    },
    {
        "id": "conflict-cause-india-1857-political",
        "conflictCaseId": "conflict-india-1857",
        "causeId": "political",
        "evidence": "The cited account connects resistance to direct Company government, the doctrine of lapse, annexation, and Indian elites' loss of authority.",
        "evidenceBasis": "scholarly-analysis",
        "confidence": "high",
        "sourceIds": ["src-openstax-india-1857"],
    },
    {
        "id": "conflict-cause-india-1857-mixed",
        "conflictCaseId": "conflict-india-1857",
        "causeId": "mixed",
        "evidence": "Case sources jointly document colonial rule, annexation, military grievances, missionary concerns, and the cartridge crisis rather than a single sufficient cause.",
        "evidenceBasis": "primary-and-scholarly",
        "confidence": "high",
        "sourceIds": ["src-openstax-india-1857", "src-national-archives-india-1857"],
    },
    {
        "id": "conflict-cause-india-1857-disputed",
        "conflictCaseId": "conflict-india-1857",
        "causeId": "disputed",
        "evidence": "The National Archives dossier assembles contemporary accounts that assign different causal weight to cartridge fears, religion, aggression, and other grievances.",
        "evidenceBasis": "archival-primary-source-dossier",
        "confidence": "high",
        "sourceIds": ["src-national-archives-india-1857"],
    },
]


CONVERSION_CASES = [
    {
        "id": "conversion-constantinian-christian-sponsorship",
        "name": "Constantinian legalization and sponsorship of Christianity",
        "startDate": "313",
        "endDate": "337",
        "dateLabel": "313–337 CE",
        "locations": ["Roman Empire", "Milan", "Constantinople"],
        "actors": ["Constantine I", "Licinius", "Christian communities", "Practitioners of traditional Roman religions"],
        "summary": "A change in Christianity's legal and institutional position under imperial government; this case does not claim a forced mass conversion or make Christianity the state religion in 313.",
        "statedPolicy": "The 313 policy granted religious choice and restored Christian property; Constantine's later government privileged and institutionally supported Christianity.",
        "statedJustification": "The edict presents religious liberty and restoration as serving public peace and divine favor, while the later imperial program linked Christian institutions to governance.",
        "resistanceContinuity": "The 313 settlement allowed traditional religious practices to continue even as Christianity acquired legal rights, property, patronage, and growing institutional influence.",
        "disputesUncertainty": "Constantine's personal beliefs and their chronology are debated; Atlas records observable policy and patronage and does not infer that the population converted because the emperor favored Christianity.",
        "sourceIds": ["src-openstax-constantine", "src-fordham-edict-milan"],
    },
    {
        "id": "conversion-safavid-shiism-iran",
        "name": "Safavid establishment and spread of Twelver Shiism in Iran",
        "startDate": "1501",
        "endDate": "1736",
        "dateLabel": "1501–1736",
        "locations": ["Tabriz", "Safavid Iran"],
        "actors": ["Shah Ismail I", "Safavid state and Qizilbash forces", "Sunni Muslim communities and clerics", "Invited Twelver Shia scholars"],
        "summary": "A state-backed religious transformation that included documented direct coercion in its early phase and a longer, uneven process of institution building and adoption.",
        "statedPolicy": "Shah Ismail declared Twelver Shiism the state religion and ordered Sunni subjects to adopt it while the state funded Shia schools and shrines.",
        "statedJustification": "The cited account describes a policy intended to unify subjects and distinguish the new Safavid state from Sunni Ottoman and Uzbek rivals.",
        "resistanceContinuity": "Sources document conversion-or-exile demands, lethal punishment for some resistance, and continuing Sunni presence; persistence and later adoption varied over time and place.",
        "disputesUncertainty": "Scholarship disputes any claim of instantaneous, uniform conversion. Direct early coercion is documented, but Atlas does not attribute every later Shia affiliation solely to force.",
        "sourceIds": ["src-openstax-safavid-conversion", "src-cambridge-sunni-survival-safavid"],
    },
]


CONVERSION_MODE_ASSIGNMENTS = [
    {
        "id": "conversion-mode-constantine-state-sponsorship",
        "conversionCaseId": "conversion-constantinian-christian-sponsorship",
        "modeId": "state-sponsorship",
        "evidence": "The historical overview documents restored property and legal rights, privileged status, imperial church councils, and government advocacy of Christianity.",
        "evidenceStandard": "documented-state-policy",
        "confidence": "high",
        "sourceIds": ["src-openstax-constantine", "src-fordham-edict-milan"],
    },
    {
        "id": "conversion-mode-constantine-continuity",
        "conversionCaseId": "conversion-constantinian-christian-sponsorship",
        "modeId": "continuity-despite-change",
        "evidence": "The 313 policy granted religious choice, and the cited historical account states that traditional Roman practices could continue during the initial legalization of Christianity.",
        "evidenceStandard": "documented-continuity",
        "confidence": "high",
        "sourceIds": ["src-openstax-constantine", "src-fordham-edict-milan"],
    },
    {
        "id": "conversion-mode-safavid-state-sponsorship",
        "conversionCaseId": "conversion-safavid-shiism-iran",
        "modeId": "state-sponsorship",
        "evidence": "The Safavid state declared Twelver Shiism official, funded schools and shrines, and brought Shia scholars into Iran.",
        "evidenceStandard": "documented-state-policy",
        "confidence": "high",
        "sourceIds": ["src-openstax-safavid-conversion"],
    },
    {
        "id": "conversion-mode-safavid-forced",
        "conversionCaseId": "conversion-safavid-shiism-iran",
        "modeId": "forced-conversion",
        "evidence": "The source states that Shah Ismail ordered Sunni Muslims to become Shia and that people who resisted conversion while remaining in Iran faced death.",
        "evidenceStandard": "documented-direct-force",
        "confidence": "high",
        "sourceIds": ["src-openstax-safavid-conversion"],
    },
    {
        "id": "conversion-mode-safavid-threat",
        "conversionCaseId": "conversion-safavid-shiism-iran",
        "modeId": "conversion-under-threat",
        "evidence": "Sunni clerics were presented with conversion or exile, and resistance by those who remained could be punished by death.",
        "evidenceStandard": "documented-threat",
        "confidence": "high",
        "sourceIds": ["src-openstax-safavid-conversion"],
    },
    {
        "id": "conversion-mode-safavid-discrimination",
        "conversionCaseId": "conversion-safavid-shiism-iran",
        "modeId": "religious-discrimination",
        "evidence": "The policy imposed conversion, exile, or lethal consequences on Sunni subjects while funding institutions of the favored Twelver Shia establishment.",
        "evidenceStandard": "documented-discrimination",
        "confidence": "high",
        "sourceIds": ["src-openstax-safavid-conversion"],
    },
    {
        "id": "conversion-mode-safavid-continuity",
        "conversionCaseId": "conversion-safavid-shiism-iran",
        "modeId": "continuity-despite-change",
        "evidence": "Peer-reviewed scholarship challenges an overnight-conversion model and documents that Sunnism survived and was still subject to persecution in the seventeenth century.",
        "evidenceStandard": "documented-continuity",
        "confidence": "high",
        "sourceIds": ["src-cambridge-sunni-survival-safavid"],
    },
]


DATA = {
    "formatVersion": 1,
    "reviewedAt": REVIEWED_AT,
    "policy": {
        "concepts": "Hierarchy and terms support discovery; adjacency never proves theological equivalence.",
        "names": "Name assertions are source-, language-, and period-scoped. Contextual identification, translation, association, and conflation remain relationships, never automatic aliases.",
        "occurrences": "Each occurrence identifies its source and locator; composite text records are not represented as single physical witnesses.",
        "classification": "Conflict causes and conversion modes require evidence. Religious participation does not by itself make a conflict religious, and conquest does not by itself prove forced conversion.",
    },
    "sources": SOURCES,
    "concepts": CONCEPTS,
    "conceptEdges": EDGES,
    "conceptTerms": CONCEPT_TERMS,
    "entities": ENTITIES,
    "nameAssertions": NAME_ASSERTIONS,
    "occurrences": OCCURRENCES,
    "relationships": RELATIONSHIPS,
    "evolutionPaths": EVOLUTION_PATHS,
    "evolutionStages": EVOLUTION_STAGES,
    "classificationSchemes": {
        "conflictCauses": CONFLICT_CAUSES,
        "conversionModes": CONVERSION_MODES,
    },
    "conflictCases": CONFLICT_CASES,
    "conflictCauseAssignments": CONFLICT_CAUSE_ASSIGNMENTS,
    "conversionCases": CONVERSION_CASES,
    "conversionModeAssignments": CONVERSION_MODE_ASSIGNMENTS,
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def validate() -> None:
    require(len(CONCEPTS) == 89, f"expected 89 concepts, got {len(CONCEPTS)}")
    require(sum(item["level"] == "root" for item in CONCEPTS) == 1, "expected one root")
    require(sum(item["level"] == "branch" for item in CONCEPTS) == 9, "expected nine branches")
    require(sum(item["level"] == "concept" for item in CONCEPTS) == 79, "expected 79 leaf concepts")
    require(len(EDGES) == 115, f"expected 115 concept edges, got {len(EDGES)}")
    require(sum(item["kind"] == "root" for item in EDGES) == 9, "expected 9 root edges")
    require(sum(item["kind"] == "primary" for item in EDGES) == 79, "expected 79 primary edges")
    require(sum(item["kind"] == "secondary" for item in EDGES) == 27, "expected 27 secondary edges")
    expected_counts = [(CONCEPT_TERMS, 20), (ENTITIES, 17), (NAME_ASSERTIONS, 73), (OCCURRENCES, 54), (RELATIONSHIPS, 8), (EVOLUTION_PATHS, 9), (EVOLUTION_STAGES, 28), (CONFLICT_CAUSES, 15), (CONVERSION_MODES, 17)]
    for collection, expected in expected_counts:
        require(len(collection) == expected, f"expected {expected}, got {len(collection)}")
    source_ids = {item["id"] for item in SOURCES}
    concept_ids = {item["id"] for item in CONCEPTS}
    entity_ids = {item["id"] for item in ENTITIES}
    path_ids = {item["id"] for item in EVOLUTION_PATHS}
    conflict_case_ids = {item["id"] for item in CONFLICT_CASES}
    conflict_cause_ids = {item["id"] for item in CONFLICT_CAUSES}
    conversion_case_ids = {item["id"] for item in CONVERSION_CASES}
    conversion_mode_ids = {item["id"] for item in CONVERSION_MODES}
    all_rows = [*CONCEPTS, *EDGES, *CONCEPT_TERMS, *ENTITIES, *NAME_ASSERTIONS, *OCCURRENCES, *RELATIONSHIPS, *EVOLUTION_PATHS, *EVOLUTION_STAGES, *CONFLICT_CASES, *CONFLICT_CAUSE_ASSIGNMENTS, *CONVERSION_CASES, *CONVERSION_MODE_ASSIGNMENTS]
    require(len({item["id"] for item in all_rows}) == len(all_rows), "all record IDs must be globally unique")
    for item in all_rows:
        require(item["sourceIds"] and set(item["sourceIds"]) <= source_ids, f"{item['id']} has invalid sources")
    for item in [*CONCEPTS, *EDGES]:
        require(
            any(source_id != "src-atlas-gap-audit" for source_id in item["sourceIds"]),
            f"{item['id']} needs subject-matter provenance in addition to requirement provenance",
        )
    leaf_descriptions = [item["description"] for item in CONCEPTS if item["level"] == "concept"]
    require(len(set(leaf_descriptions)) == 79, "leaf concepts require distinct substantive descriptions")
    require(len({item["rationale"] for item in EDGES}) == 115, "concept edges require distinct hierarchy rationales")
    for item in [*CONFLICT_CAUSES, *CONVERSION_MODES]:
        require(item["sourceIds"] and set(item["sourceIds"]) <= source_ids, f"{item['id']} has invalid sources")
    require(len(CONFLICT_CASES) >= 2, f"expected at least 2 conflict application cases, got {len(CONFLICT_CASES)}")
    require(len(CONVERSION_CASES) >= 2, f"expected at least 2 conversion application cases, got {len(CONVERSION_CASES)}")
    confidence_values = {"high", "medium", "low", "contested"}
    conflict_evidence_bases = {"primary-source", "archival-primary-source-dossier", "scholarly-analysis", "primary-and-scholarly"}
    conversion_evidence_standards = {"documented-direct-force", "documented-threat", "documented-state-policy", "documented-continuity", "documented-discrimination"}
    for case in CONFLICT_CASES:
        for key in ["name", "startDate", "endDate", "dateLabel", "summary", "statedCause", "disputedCausation", "uncertainty"]:
            require(isinstance(case[key], str) and case[key].strip(), f"{case['id']} needs {key}")
        for key in ["locations", "actors", "participantJustifications", "scholarlyInterpretations"]:
            require(isinstance(case[key], list) and case[key] and all(isinstance(value, str) and value.strip() for value in case[key]), f"{case['id']} needs {key}")
        case_assignments = [item for item in CONFLICT_CAUSE_ASSIGNMENTS if item["conflictCaseId"] == case["id"]]
        require(len(case_assignments) >= 2, f"{case['id']} needs multiple evidenced cause assignments")
        require(len({item["causeId"] for item in case_assignments}) == len(case_assignments), f"{case['id']} repeats a cause assignment")
    for assignment in CONFLICT_CAUSE_ASSIGNMENTS:
        require(assignment["conflictCaseId"] in conflict_case_ids, f"{assignment['id']} has invalid conflict case")
        require(assignment["causeId"] in conflict_cause_ids, f"{assignment['id']} has invalid conflict cause")
        require(assignment["confidence"] in confidence_values, f"{assignment['id']} has invalid confidence")
        require(assignment["evidenceBasis"] in conflict_evidence_bases, f"{assignment['id']} has invalid evidence basis")
        require(isinstance(assignment["evidence"], str) and assignment["evidence"].strip(), f"{assignment['id']} needs evidence")
        case = next(item for item in CONFLICT_CASES if item["id"] == assignment["conflictCaseId"])
        require(set(assignment["sourceIds"]) <= set(case["sourceIds"]), f"{assignment['id']} sources must be declared by its case")
        require("src-atlas-gap-audit" not in assignment["sourceIds"], f"{assignment['id']} requires case-specific historical evidence")
    for case in CONVERSION_CASES:
        for key in ["name", "startDate", "endDate", "dateLabel", "summary", "statedPolicy", "statedJustification", "resistanceContinuity", "disputesUncertainty"]:
            require(isinstance(case[key], str) and case[key].strip(), f"{case['id']} needs {key}")
        for key in ["locations", "actors"]:
            require(isinstance(case[key], list) and case[key] and all(isinstance(value, str) and value.strip() for value in case[key]), f"{case['id']} needs {key}")
        case_assignments = [item for item in CONVERSION_MODE_ASSIGNMENTS if item["conversionCaseId"] == case["id"]]
        require(case_assignments, f"{case['id']} needs an evidenced conversion-mode assignment")
        require(len({item["modeId"] for item in case_assignments}) == len(case_assignments), f"{case['id']} repeats a conversion mode")
    for assignment in CONVERSION_MODE_ASSIGNMENTS:
        require(assignment["conversionCaseId"] in conversion_case_ids, f"{assignment['id']} has invalid conversion case")
        require(assignment["modeId"] in conversion_mode_ids, f"{assignment['id']} has invalid conversion mode")
        require(assignment["confidence"] in confidence_values, f"{assignment['id']} has invalid confidence")
        require(assignment["evidenceStandard"] in conversion_evidence_standards, f"{assignment['id']} has invalid evidence standard")
        require(isinstance(assignment["evidence"], str) and assignment["evidence"].strip(), f"{assignment['id']} needs evidence")
        case = next(item for item in CONVERSION_CASES if item["id"] == assignment["conversionCaseId"])
        require(set(assignment["sourceIds"]) <= set(case["sourceIds"]), f"{assignment['id']} sources must be declared by its case")
        require("src-atlas-gap-audit" not in assignment["sourceIds"], f"{assignment['id']} requires case-specific historical evidence")
        if assignment["modeId"] == "forced-conversion":
            require(assignment["evidenceStandard"] == "documented-direct-force", f"{assignment['id']} cannot infer forced conversion from conquest or patronage")
    require(
        all(item["modeId"] != "forced-conversion" for item in CONVERSION_MODE_ASSIGNMENTS if item["conversionCaseId"] == "conversion-constantinian-christian-sponsorship"),
        "Constantinian patronage and toleration cannot be classified as forced conversion",
    )
    for edge in EDGES:
        require(edge["broaderId"] in concept_ids and edge["narrowerId"] in concept_ids, f"{edge['id']} has invalid concept FK")
    for term in CONCEPT_TERMS:
        require(term["conceptId"] in concept_ids, f"{term['id']} has invalid concept")
    for row in [*NAME_ASSERTIONS, *OCCURRENCES, *EVOLUTION_PATHS, *EVOLUTION_STAGES]:
        require(row["entityId"] in entity_ids, f"{row['id']} has invalid entity")
    for row in NAME_ASSERTIONS:
        require(row["name"] in row["scope"], f"{row['id']} scope must identify its asserted name")
        require(
            row["scope"] != "Source- and period-scoped name evidence.",
            f"{row['id']} retains generic placeholder scope",
        )
    name_by_id = {row["id"]: row for row in NAME_ASSERTIONS}
    require(name_by_id["name-satan-article"]["assertionType"] == "transliteration", "ha-satan is a transliteration")
    require(name_by_id["name-lucifer-heylel"]["assertionType"] == "transliteration", "hêlēl is a transliteration")
    require(
        name_by_id["name-lucifer-heosphoros"]["name"] == "ἑωσφόρος"
        and name_by_id["name-lucifer-heosphoros"]["assertionType"] == "translation-rendering",
        "Lucifer's Septuagint assertion must preserve the Isaiah 14:12 rendering ἑωσφόρος",
    )
    catalog_work_ids = load_catalog_work_ids()
    for row in OCCURRENCES:
        require(row["workId"] is None or row["workId"] in catalog_work_ids, f"{row['id']} links unknown catalog work {row['workId']}")
        require(isinstance(row["transliteration"], str) and row["transliteration"].strip(), f"{row['id']} needs a sourced transliteration")
        if row["script"] in {"Han", "Hebrew"}:
            require(row["originalForm"] == row["attestedForm"], f"{row['id']} must retain its original-script form")
            require(row["transliteration"] != row["originalForm"], f"{row['id']} cannot repeat original script as transliteration")
            require(not re.search(r"[\u3400-\u9fff\u0590-\u05ff]", row["transliteration"]), f"{row['id']} transliteration must be romanized")
    for row in RELATIONSHIPS:
        require(row["sourceEntityId"] in entity_ids and row["targetEntityId"] in entity_ids, f"{row['id']} has invalid entity FK")
        require(row["isEquivalence"] is False, f"{row['id']} cannot be unconditional equivalence")
    require(
        all(row["attestedForm"] not in {"乾", "坤"} for row in OCCURRENCES if row["entityId"] == "yijing"),
        "Yijing occurrences must attest work titles, not hexagram headings",
    )
    for stage in EVOLUTION_STAGES:
        require(stage["pathId"] in path_ids, f"{stage['id']} has invalid path")
    require(any(term["id"] == "term-anatta" and term["semanticRelation"] == "contrast" for term in CONCEPT_TERMS), "anattā must remain a contrast term")
    require(any(rel["id"] == "rel-belial-baal-rejected" and rel["relationshipType"] == "rejected-identification" for rel in RELATIONSHIPS), "Belial/Baal guard is required")
    require(any(rel["id"] == "rel-lucifer-satan-later-conflation" and rel["relationshipType"] == "later-contextual-conflation" for rel in RELATIONSHIPS), "Lucifer/Satan contextual relationship is required")
    require(next(entity for entity in ENTITIES if entity["id"] == "yijing")["canonicalName"] == "Yijing", "Yijing canonical record is required")
    require(all(source_row["url"].startswith("https://") for source_row in SOURCES), "all sources require HTTPS")


def main() -> None:
    validate()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(DATA, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        "Generated ontology/entity seed: "
        f"{len(CONCEPTS)} concepts, {len(EDGES)} edges, {len(CONCEPT_TERMS)} terms, "
        f"{len(ENTITIES)} entities, {len(NAME_ASSERTIONS)} names, {len(OCCURRENCES)} occurrences, "
        f"{len(RELATIONSHIPS)} relationships, {len(EVOLUTION_PATHS)} paths/{len(EVOLUTION_STAGES)} stages, "
        f"{len(CONFLICT_CASES)} conflict cases/{len(CONFLICT_CAUSE_ASSIGNMENTS)} cause assignments, "
        f"{len(CONVERSION_CASES)} conversion cases/{len(CONVERSION_MODE_ASSIGNMENTS)} mode assignments."
    )


if __name__ == "__main__":
    main()
