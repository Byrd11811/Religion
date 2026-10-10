#!/usr/bin/env python3
"""Build the reviewed Phase 16 research-engine seed deterministically.

The seed deliberately stores attributed positions and evidence relationships.
It never derives a stance from a tradition label or an influence claim from
similarity. Run this file twice to confirm byte-for-byte deterministic output.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "seed" / "research-engines.json"
REVIEWED_AT = "2026-10-10"


def source(source_id: str, label: str, url: str, kind: str, perspective: str) -> dict:
    return {
        "id": source_id,
        "label": label,
        "url": url,
        "kind": kind,
        "perspective": perspective,
        "accessed": REVIEWED_AT,
        "verification": {"status": "verified", "httpStatus": 200, "verifiedAt": REVIEWED_AT},
    }


SOURCES = [
    source("src-gutenberg-bible", "The King James Version of the Bible", "https://www.gutenberg.org/ebooks/10", "primary-text-edition", "Public-domain historical English translation; wording is not a critical edition"),
    source("src-gutenberg-dhammapada", "Dhammapada, translated by F. Max Müller", "https://www.gutenberg.org/ebooks/2017", "primary-text-edition", "Public-domain historical translation; verse context and translation history matter"),
    source("src-gutenberg-gita", "The Song Celestial (Bhagavad Gita), translated by Edwin Arnold", "https://www.gutenberg.org/ebooks/2388", "primary-text-edition", "Public-domain poetic historical translation, not a critical Sanskrit edition"),
    source("src-gutenberg-analects", "The Analects, translated by James Legge", "https://www.gutenberg.org/ebooks/3330", "primary-text-edition", "Public-domain historical translation"),
    source("src-gutenberg-tao", "Tao Te Ching, translated by James Legge", "https://www.gutenberg.org/ebooks/216", "primary-text-edition", "Public-domain historical translation"),
    source("src-gutenberg-hume", "Dialogues Concerning Natural Religion", "https://www.gutenberg.org/ebooks/4583", "primary-philosophical-text", "Hume's dialogical speakers must not be collapsed into an unqualified authorial voice"),
    source("src-gutenberg-lucretius", "On the Nature of Things", "https://www.gutenberg.org/ebooks/785", "primary-philosophical-text", "Public-domain English translation of an Epicurean poem"),
    source("src-gutenberg-meditations", "Meditations of Marcus Aurelius", "https://www.gutenberg.org/ebooks/2680", "primary-philosophical-text", "Public-domain historical translation of Stoic reflections"),
    source("src-gutenberg-quran", "The Koran, translated by J. M. Rodwell", "https://www.gutenberg.org/ebooks/2800", "primary-text-edition", "Outdated public-domain English translation; use with a modern edition for lexical conclusions"),
    source("src-quran-corpus-2-256", "Quranic Arabic Corpus: verse 2:256", "https://corpus.quran.com/translation.jsp?chapter=2&verse=256", "primary-text-edition", "Academic language project presenting Arabic analysis and multiple translations"),
    source("src-church-satan-statements", "Church of Satan: The Nine Satanic Statements", "https://churchofsatan.com/nine-satanic-statements/", "community-primary-source", "Official organization page for a specific LaVeyan statement; not representative of every Satanic movement"),
    source("src-humanist-manifesto", "American Humanist Association: Humanist Manifesto III", "https://americanhumanist.org/humanism/humanist-manifesto-iii/", "community-primary-source", "Official modern humanist statement; not representative of every secular view"),
    source("src-sep-afterlife", "Stanford Encyclopedia of Philosophy: Afterlife", "https://plato.stanford.edu/entries/afterlife/index.html", "scholarly-reference", "Peer-reviewed philosophical overview of competing survival accounts"),
    source("src-sep-hume-religion", "Stanford Encyclopedia of Philosophy: Hume on Religion", "https://plato.stanford.edu/entries/hume-religion/", "scholarly-reference", "Peer-reviewed analysis distinguishing Hume's arguments and dialogue speakers"),
    source("src-met-flood", "The Metropolitan Museum of Art: Flood Stories", "https://www.metmuseum.org/essays/flood-stories", "museum-scholarship", "Institutional essay on ancient Near Eastern flood texts and witnesses"),
    source("src-sbl-jude-enoch", "Society of Biblical Literature: Reading 1–2 Peter and Jude", "https://www.sbl-site.org/wp-content/uploads/2024/11/ReadingPeterJude_MasonMartin_SBL.pdf", "scholarly-monograph", "Scholarly source explicitly identifying Jude 14b–15 as a quotation of 1 Enoch 1:9"),
    source("src-church-england-codrington", "Church of England: historic links to enslavement FAQ", "https://www.churchofengland.org/about/governance/national-church-institutions/church-commissioners-england/who-we-are/historic-links-enslavement/frequently-asked-questions", "institutional-archival-research", "Official retrospective research; distinguishes the Church Commissioners from the SPG/USPG"),
    source("src-cambridge-atlantic-slavery", "The University of Cambridge in the Age of Atlantic Slavery", "https://www.cambridge.org/core/services/aop-cambridge-core/content/view/6BC358D69084C40CBF93B4A5FC1CE3AB/9781009652544AR.pdf/The_University_of_Cambridge_in_the_Age_of_Atlantic_Slavery.pdf", "scholarly-book", "Independent scholarly history using SPG committee records and contemporary Anglican publications; edition access remains subject to Cambridge Core terms"),
    source("src-brill-spg-slavery", "Missions in Contested Places/Spaces: The SPG, Slavery, and Codrington College, Barbados", "https://brill.com/view/journals/mist/38/3/article-p325_6.xml", "scholarly-article", "Peer-reviewed theological and mission-historical assessment of the SPG, slavery, scripture, liberation, and Codrington's legacy"),
    source("src-nanzan-soto-apology", "The Social Response of Buddhists to the Modernization of Japan: The Contrasting Lives of Two Sōtō Zen Monks", "https://nirc.nanzan-u.ac.jp/journal/6/article/970/pdf/download", "scholarly-article", "Ishikawa Rikizan's 1998 Japanese Journal of Religious Studies article documents wartime doctrines, named Sōtō voices, dissent, and the 1992 institutional apology"),
    source("src-jstor-imperial-way-zen", "Imperial-Way Zen", "https://www.jstor.org/stable/j.ctt6wqwv8", "scholarly-monograph", "Christopher Ives documents Zen institutional support, critics, and disputed responsibility"),
    source("src-jstor-soka-wartime", "We Alone Can Save Japan: Soka Gakkai's Wartime Antecedents", "https://www.jstor.org/stable/48686682", "scholarly-article", "Open-access study documenting Makiguchi's conflict with wartime ideology"),
    source("src-soto-nonviolence", "SOTOZEN: non-violence and peace", "https://www.sotozen.com/eng/activities/sdgs/goal16.html", "community-primary-source", "Contemporary institutional articulation, not evidence of uniform historical conduct"),
    source("src-cambridge-devshirme", "Devshirme and Shari'a", "https://www.cambridge.org/core/journals/bulletin-of-the-school-of-oriental-and-african-studies/article/abs/devshirme-and-sharia/3F2F8E9BE757BBD230CEF55689B0B1AD", "scholarly-article", "Historical analysis emphasizing incompatibility debated between the levy and protected dhimmi status"),
    source("src-cambridge-global-slavery", "Global Slavery in the Making of States and International Orders", "https://www.cambridge.org/core/journals/american-political-science-review/article/global-slavery-in-the-making-of-states-and-international-orders/EE455C018283685A1C3BAEADE8A63D04", "scholarly-article", "Comparative state-formation analysis of institutionalized enslavement and devshirme"),
    source("src-gandhi-vaikom", "Gandhi Heritage Portal: Vykom, Kerala", "https://www.gandhiheritageportal.org/sd/gandhi_heritage_site/writeup/NQ%3D%3D", "institutional-history", "Government-supported Gandhi archive summary naming supporters, orthodox opponents, and dates"),
    source("src-kerala-vaikom", "Government of Kerala: Vaikom Satyagraha", "https://prd.kerala.gov.in/sites/default/files/inline-files/VAIKKOM%20SATYAGRAHAM%20ENGLISH____________New.pdf", "institutional-history", "Government historical publication; should be read with independent scholarship"),
    source("src-oup-vaikom", "Gandhian Nonviolent Struggle and Untouchability in South India", "https://academic.oup.com/book/5656", "scholarly-monograph", "Independent Oxford University Press study of the 1924–25 Vaikom campaign, its settlement, and competing explanations of change"),
]


PROPOSITIONS = [
    {"id": "prop-enemy-love", "title": "Response to enemies", "proposition": "A person should answer hostility with love or non-retaliation.", "topic": "ethics", "keywords": ["enemy", "enemies", "injury", "retaliation", "vengeance", "hatred"], "sourceIds": ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao", "src-church-satan-statements", "src-humanist-manifesto"]},
    {"id": "prop-surviving-self", "title": "A self survives death", "proposition": "A persisting self or person survives bodily death.", "topic": "afterlife", "keywords": ["afterlife", "death", "soul", "self", "immortality", "resurrection"], "sourceIds": ["src-gutenberg-gita", "src-gutenberg-bible", "src-gutenberg-lucretius", "src-sep-afterlife", "src-humanist-manifesto"]},
    {"id": "prop-suffering-providence", "title": "Suffering and providence", "proposition": "The extent of suffering counts against a perfectly good and powerful providence.", "topic": "suffering", "keywords": ["evil", "suffering", "providence", "theodicy", "pain"], "sourceIds": ["src-gutenberg-hume", "src-sep-hume-religion", "src-gutenberg-bible", "src-gutenberg-meditations", "src-gutenberg-dhammapada", "src-gutenberg-lucretius"]},
    {"id": "prop-religious-coercion", "title": "Religious coercion", "proposition": "Political authority may compel religious affiliation for institutional ends.", "topic": "religion-and-power", "keywords": ["coercion", "conversion", "compel", "religious freedom", "devshirme"], "sourceIds": ["src-quran-corpus-2-256", "src-gutenberg-quran", "src-cambridge-devshirme", "src-cambridge-global-slavery", "src-humanist-manifesto"]},
]


def stance(stance_id: str, proposition_id: str, title: str, category: str, relation: str, summary: str, speaker: str, context: str, source_ids: list[str], confidence: str, uncertainty: str, traditions: list[str], regions: list[str], start: int | None, end: int | None) -> dict:
    return {"id": stance_id, "propositionId": proposition_id, "title": title, "category": category, "relation": relation, "summary": summary, "speakerOrCommunity": speaker, "historicalContext": context, "sourceIds": source_ids, "confidence": confidence, "uncertainty": uncertainty, "traditionIds": traditions, "regions": regions, "startYear": start, "endYear": end}


STANCES = [
    stance("stance-matthew-enemy-love", "prop-enemy-love", "Love and pray for enemies", "doctrinal-opposition", "supports", "Matthew 5:44–45 commands love and prayer for enemies in a particular Matthean teaching context.", "Jesus as represented by the Gospel of Matthew", "First-century Christian gospel tradition; Atlas cites a historical English translation.", ["src-gutenberg-bible"], "high", "Translation and the relation of this passage to other New Testament violence texts require separate analysis.", ["christianity"], ["eastern-mediterranean"], 50, 100),
    stance("stance-dhammapada-hatred", "prop-enemy-love", "Hatred does not cease by hatred", "alternative-religious-interpretation", "supports", "Dhammapada verse 5 frames non-hatred as the means by which hatred ceases.", "Dhammapada's verse voice", "Pali Buddhist verse collection; the bundled Müller translation is historically situated.", ["src-gutenberg-dhammapada"], "high", "This maxim does not settle every Buddhist account of force, punishment, or governance.", ["buddhism"], ["south-asia"], -300, 100),
    stance("stance-analects-justice", "prop-enemy-love", "Recompense injury with justice", "philosophical-critique", "qualifies", "Analects 14.34 distinguishes a just response to injury from repaying virtue with virtue.", "Confucius as represented in the Analects", "Received Confucian dialogue collection; translation of de and zhi affects nuance.", ["src-gutenberg-analects"], "high", "Justice need not entail revenge, so this is a qualification rather than a simple inversion.", ["confucian"], ["china"], -475, -221),
    stance("stance-tao-kindness", "prop-enemy-love", "Recompense injury with kindness", "mystical-reinterpretation", "supports", "The received Tao Te Ching chapter 63 is translated by Legge as recompensing injury with kindness.", "Voice of the Tao Te Ching", "Received Chinese text in a nineteenth-century English translation.", ["src-gutenberg-tao"], "medium", "The translation and textual history of the phrase are contested; no influence on Matthew is asserted.", ["daoism"], ["china"], -400, -200),
    stance("stance-satanic-vengeance", "prop-enemy-love", "Vengeance rather than turning the other cheek", "adversarial-reinterpretation", "opposes", "The Church of Satan's fifth statement explicitly presents vengeance as an alternative to turning the other cheek.", "Church of Satan / Anton LaVey", "A 1969 LaVeyan formulation reproduced by its official organization.", ["src-church-satan-statements"], "high", "This is one organization and one Satanic current; it cannot stand for all Satanists.", ["laveyan-satanism"], ["north-america"], 1969, 2026),
    stance("stance-humanist-restraint", "prop-enemy-love", "Human welfare and reciprocal responsibility", "modern-secular-critique", "qualifies", "Humanist Manifesto III grounds ethics in welfare and responsibility rather than a supernatural command to love enemies.", "American Humanist Association signatories", "Modern organizational statement issued in 2003.", ["src-humanist-manifesto"], "high", "The manifesto does not directly adjudicate every response to attack; this is a bounded qualification.", ["humanism"], ["north-america"], 2003, 2026),

    stance("stance-gita-enduring-self", "prop-surviving-self", "Birthless and deathless self", "doctrinal-opposition", "supports", "The Bhagavad Gita describes the enduring self as not born and not dying, within Krishna's counsel to Arjuna.", "Krishna as represented in the Bhagavad Gita", "Sanskrit epic dialogue in a historical poetic English translation.", ["src-gutenberg-gita"], "high", "Ātman, person, and modern English 'self' are not automatically equivalent.", ["hindu"], ["south-asia"], -200, 200),
    stance("stance-john-resurrection", "prop-surviving-self", "Resurrection rather than bare soul survival", "alternative-religious-interpretation", "qualifies", "John 5:28–29 depicts people in graves coming forth; this differs from a simple disembodied-soul claim.", "Jesus as represented by the Gospel of John", "First-century Christian gospel tradition in a historical translation.", ["src-gutenberg-bible"], "high", "Resurrection and immortal-soul models must remain distinct even when both affirm postmortem life.", ["christianity"], ["eastern-mediterranean"], 80, 110),
    stance("stance-ecclesiastes-dead", "prop-surviving-self", "The dead know nothing", "internal-heterodox-opposition", "opposes", "Ecclesiastes 9:5 says the dead know nothing within a wisdom discourse about life under the sun.", "Qoheleth / Ecclesiastes' literary voice", "A biblical wisdom voice often placed in tension with later resurrection readings.", ["src-gutenberg-bible"], "medium", "Scope ('under the sun') and canonical harmonization are disputed; this is not a summary of Judaism.", ["judaism"], ["levant"], -350, -180),
    stance("stance-lucretius-mortal-mind", "prop-surviving-self", "Mind and soul are mortal", "materialist-critique", "opposes", "Lucretius' Epicurean poem argues that mind and soul are bodily and dissolve rather than persist after death.", "Lucretius' didactic speaker", "First-century BCE Roman Epicurean philosophical poetry.", ["src-gutenberg-lucretius"], "high", "A poetic philosophical argument is not empirical proof of every modern materialist account.", ["epicureanism"], ["mediterranean"], -55, -45),
    stance("stance-afterlife-identity", "prop-surviving-self", "Personal-identity objections", "philosophical-critique", "qualifies", "Contemporary philosophy distinguishes bodily, psychological, resurrection, and soul-based criteria, with objections to each.", "Scholarly field summarized by SEP", "Contemporary peer-reviewed philosophical overview.", ["src-sep-afterlife"], "high", "The field has no single consensus model of postmortem identity.", ["philosophy-of-religion"], ["global"], 1900, 2026),
    stance("stance-humanist-finite-life", "prop-surviving-self", "Life accepted without supernaturalism", "modern-secular-critique", "opposes", "Humanist Manifesto III treats nature as self-existing and this life as enough without affirming supernatural survival.", "American Humanist Association signatories", "Modern organizational statement, not all secular persons.", ["src-humanist-manifesto"], "high", "Absence of affirmation is not a scientific demonstration that survival is impossible.", ["humanism"], ["north-america"], 2003, 2026),

    stance("stance-hume-philo-evil", "prop-suffering-providence", "Philo's challenge from suffering", "skeptical-critique", "supports", "Philo's catalogue of suffering challenges inference to a perfectly good and powerful cause of the world.", "Philo, a speaker in Hume's Dialogues", "Eighteenth-century philosophical dialogue; speaker and author must remain distinct.", ["src-gutenberg-hume", "src-sep-hume-religion"], "high", "Scholars dispute the exact relation between Philo and Hume's final position.", ["skepticism", "philosophy-of-religion"], ["europe"], 1779, 1779),
    stance("stance-job-divine-speech", "prop-suffering-providence", "Limits of the sufferer's standpoint", "doctrinal-opposition", "qualifies", "Job 38 responds to Job by stressing the limits of his standpoint rather than supplying a simple causal theodicy.", "Divine speech as represented in Job", "Hebrew wisdom poetry in a historical English translation.", ["src-gutenberg-bible"], "medium", "Job contains several competing speeches; one speech cannot be made the whole book's answer.", ["judaism", "christianity"], ["levant"], -600, -300),
    stance("stance-demea-future-redress", "prop-suffering-providence", "Future redress", "mystical-reinterpretation", "opposes", "Demea proposes that present evils are rectified in another region or future existence.", "Demea, a speaker in Hume's Dialogues", "A position staged and criticized within Hume's dialogue.", ["src-gutenberg-hume", "src-sep-hume-religion"], "high", "This is Demea's reply, not an endorsed resolution by the whole dialogue.", ["philosophy-of-religion"], ["europe"], 1779, 1779),
    stance("stance-stoic-judgment", "prop-suffering-providence", "Suffering and judgments", "philosophical-critique", "qualifies", "Marcus Aurelius repeatedly reframes distress through judgments, agency, and participation in nature rather than a personal theodicy.", "Marcus Aurelius' reflective voice", "Second-century Roman Stoic notebook tradition.", ["src-gutenberg-meditations"], "medium", "Stoic providence and modern therapeutic readings should not be conflated.", ["stoicism"], ["mediterranean"], 161, 180),
    stance("stance-dhammapada-practice", "prop-suffering-providence", "A path responding to suffering", "alternative-religious-interpretation", "qualifies", "The Dhammapada emphasizes impermanence, suffering, and a path of practice rather than an omnipotent creator's purposes.", "Dhammapada's verse voice", "Pali Buddhist verse collection in historical translation.", ["src-gutenberg-dhammapada"], "high", "This changes the question rather than logically refuting or defending classical theism.", ["buddhism"], ["south-asia"], -300, 100),
    stance("stance-lucretius-natural-causes", "prop-suffering-providence", "Natural causes without providence", "materialist-critique", "supports", "Lucretius explains natural events through atoms and natural processes and attacks fear-producing providential explanations.", "Lucretius' didactic speaker", "Roman Epicurean philosophical poem.", ["src-gutenberg-lucretius"], "high", "Ancient atomism differs from contemporary sciences and materialisms.", ["epicureanism"], ["mediterranean"], -55, -45),

    stance("stance-quran-no-compulsion", "prop-religious-coercion", "No compulsion in religion", "doctrinal-opposition", "opposes", "Qur'an 2:256 states no compulsion in religion; interpretation, legal scope, and historical application require contextual study.", "Qur'anic verse", "Seventh-century Arabic text presented through an academic corpus and historical translation.", ["src-quran-corpus-2-256", "src-gutenberg-quran"], "high", "The verse alone does not describe every Islamic legal or political practice.", ["islam"], ["arabia"], 610, 632),
    stance("stance-devshirme-state", "prop-religious-coercion", "Imperial levy and forced conversion", "doctrinal-opposition", "supports", "The Ottoman devshirme periodically levied Christian boys, enslaved them, converted them, and trained them for state service.", "Ottoman imperial administration", "Institutional practice developing from the fifteenth century; frequency and local implementation varied.", ["src-cambridge-devshirme", "src-cambridge-global-slavery"], "high", "Benefits later attained by some recruits do not erase coercive intake; neither does the case describe all Ottoman conversion.", ["ottoman-state"], ["balkans", "anatolia"], 1400, 1700),
    stance("stance-devshirme-juristic", "prop-religious-coercion", "Protected-status legal objection", "internal-heterodox-opposition", "opposes", "Wittek frames devshirme as incompatible with sharia protections for Christian dhimmi subjects and notes Muslim objections.", "Muslim juristic conscience as reconstructed by Paul Wittek", "Modern scholarship on a historical legal controversy.", ["src-cambridge-devshirme"], "medium", "The included abstract does not name or reproduce every contemporary juristic voice.", ["islamic-jurisprudence"], ["ottoman-empire"], 1400, 1700),
    stance("stance-devshirme-statebuilding", "prop-religious-coercion", "Centralization and state formation", "materialist-critique", "qualifies", "Comparative scholarship situates devshirme within military staffing, enslavement, elite formation, and centralization rather than reducing it to doctrine.", "Comparative political-historical scholarship", "Modern state-formation analysis.", ["src-cambridge-global-slavery"], "high", "Institutional and religious motives can coexist; the categories are not mutually exclusive.", ["historical-material-analysis"], ["ottoman-empire"], 1400, 1700),
    stance("stance-humanist-freedom", "prop-religious-coercion", "Freedom and responsibility", "modern-secular-critique", "opposes", "Humanist Manifesto III ties dignity and ethical choice to freedom consonant with responsibility, opposing compelled affiliation as an ethical norm.", "American Humanist Association signatories", "Modern secular organizational statement.", ["src-humanist-manifesto"], "medium", "The manifesto does not discuss devshirme and is a modern ethical comparison, not a contemporary historical witness.", ["humanism"], ["north-america"], 2003, 2026),
]


def evidence_item(item_id: str, summary: str, source_ids: list[str], traditions: list[str], regions: list[str], start: int | None, end: int | None, confidence: str = "high", **extra: object) -> dict:
    return {"id": item_id, "summary": summary, "sourceIds": source_ids, "traditionIds": traditions, "regions": regions, "startYear": start, "endYear": end, "confidence": confidence, **extra}


COMPARISON_CASES = [
    {
        "id": "cmp-response-to-injury",
        "title": "Responses to injury and enemies",
        "topic": "ethics",
        "scopeNote": "A comparison of attributed passages and one modern organizational inversion; it is not a ranking of traditions or a complete ethic of violence.",
        "subjectClaims": [
            evidence_item("claim-matthew-love", "Matthew commands love and prayer for enemies.", ["src-gutenberg-bible"], ["christianity"], ["eastern-mediterranean"], 50, 100, proposition="Love and pray for enemies.", speaker="Jesus as represented by Matthew", context="Sermon on the Mount, Matthew 5:44–45"),
            evidence_item("claim-dhammapada-nonhatred", "Dhammapada verse 5 says hatred does not cease through hatred.", ["src-gutenberg-dhammapada"], ["buddhism"], ["south-asia"], -300, 100, proposition="Non-hatred ends hatred.", speaker="Dhammapada verse voice", context="Opening paired verses"),
            evidence_item("claim-analects-justice", "Analects 14.34 recommends justice for injury and virtue for virtue.", ["src-gutenberg-analects"], ["confucian"], ["china"], -475, -221, proposition="Recompense injury with justice.", speaker="Confucius as represented in the Analects", context="Dialogue answering a proposed response to injury"),
            evidence_item("claim-tao-kindness", "Tao Te Ching 63 is rendered as recompensing injury with kindness.", ["src-gutenberg-tao"], ["daoism"], ["china"], -400, -200, "medium", proposition="Recompense injury with kindness.", speaker="Voice of the Tao Te Ching", context="A chapter on difficult action and small beginnings"),
            evidence_item("claim-satanic-vengeance", "The Church of Satan statement prefers vengeance to turning the other cheek.", ["src-church-satan-statements"], ["laveyan-satanism"], ["north-america"], 1969, 2026, proposition="Prefer vengeance to turning the other cheek.", speaker="Church of Satan / Anton LaVey", context="Fifth of the Nine Satanic Statements"),
        ],
        "synthesisFindings": [
            evidence_item("syn-injury-shared", "All selected passages or statements address a response to experienced hostility, but they define the proper response differently.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao", "src-church-satan-statements"], ["christianity", "buddhism", "confucian", "daoism", "laveyan-satanism"], ["eastern-mediterranean", "south-asia", "china", "north-america"], -475, 2026),
            evidence_item("syn-injury-difference", "Love, non-hatred, kindness, justice, and vengeance are not interchangeable; genre and addressed situation constrain each claim.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao", "src-church-satan-statements"], ["christianity", "buddhism", "confucian", "daoism", "laveyan-satanism"], ["eastern-mediterranean", "south-asia", "china", "north-america"], -475, 2026),
        ],
        "similarityFindings": [
            evidence_item("sim-injury-motif", "Each item uses interpersonal injury or hostility as its motivating motif.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao"], ["christianity", "buddhism", "confucian", "daoism"], ["eastern-mediterranean", "south-asia", "china"], -475, 100, dimension="motif", influenceRelationshipId=None),
            evidence_item("sim-injury-semantic", "The terms translated love, non-hatred, kindness, and justice occupy overlapping ethical fields without lexical equivalence.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao"], ["christianity", "buddhism", "confucian", "daoism"], ["eastern-mediterranean", "south-asia", "china"], -475, 100, "medium", dimension="semantic", influenceRelationshipId=None),
            evidence_item("sim-injury-ritual", "None of the selected excerpts prescribes a shared ritual; their similarity is ethical rather than ritual.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao"], ["christianity", "buddhism", "confucian", "daoism"], ["eastern-mediterranean", "south-asia", "china"], -475, 100, dimension="ritual", influenceRelationshipId=None),
            evidence_item("sim-injury-theological", "The passages make different or absent theological claims, so topic overlap does not establish a shared theology.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-gutenberg-tao"], ["christianity", "buddhism", "confucian", "daoism"], ["eastern-mediterranean", "south-asia", "china"], -475, 100, dimension="theological", influenceRelationshipId=None),
        ],
        "contradictionFindings": [
            evidence_item("con-injury-kindness-justice", "The surface prescriptions differ: the Tao Te Ching translation says kindness, while the Analects says justice rather than virtue for injury.", ["src-gutenberg-tao", "src-gutenberg-analects"], ["daoism", "confucian"], ["china"], -475, -200, "medium", propositionAId="claim-tao-kindness", propositionBId="claim-analects-justice", speakerContext="Two received Chinese works and historical English translations, not timeless representatives of all Daoism or Confucianism.", harmonization="Justice might be administered benevolently, and the statements may address different practical cases.", counterReading="The Analects' explicit contrast can be read as rejecting undifferentiated repayment of injury with virtue."),
            evidence_item("con-injury-love-vengeance", "The Church of Satan statement explicitly inverts the Christian turn-the-other-cheek ethic associated with the Matthean teaching.", ["src-gutenberg-bible", "src-church-satan-statements"], ["christianity", "laveyan-satanism"], ["eastern-mediterranean", "north-america"], 50, 2026, propositionAId="claim-matthew-love", propositionBId="claim-satanic-vengeance", speakerContext="A gospel teaching is compared with a named twentieth-century organization's polemical statement.", harmonization="One could distinguish private retaliation from institutional justice, but that does not erase the explicit rhetorical inversion.", counterReading="The fifth Satanic statement directly presents vengeance as the preferred alternative."),
        ],
        "chronologyFindings": [
            evidence_item("chron-injury-dhammapada-matthew", "The Dhammapada tradition may preserve an earlier non-hatred formulation than Matthew, but broad composition ranges and later witnesses prevent a precise priority claim.", ["src-gutenberg-dhammapada", "src-gutenberg-bible"], ["buddhism", "christianity"], ["south-asia", "eastern-mediterranean"], -300, 100, "low", kind="earlier-parallel", earlierSubject="Dhammapada verse tradition", laterSubject="Gospel of Matthew", earlierDate={"label": "approximately third century BCE to first century CE", "startYear": -300, "endYear": 100, "confidence": "low"}, laterDate={"label": "approximately 50–100 CE", "startYear": 50, "endYear": 100, "confidence": "medium"}, survivalBiasWarning="Surviving textual dates do not date oral teachings or prove transmission.", influenceRelationshipId=None),
            evidence_item("chron-injury-satanic-inversion", "The 1969 Satanic statement is a later, explicit rhetorical inversion of the turn-the-other-cheek language.", ["src-gutenberg-bible", "src-church-satan-statements"], ["christianity", "laveyan-satanism"], ["eastern-mediterranean", "north-america"], 50, 1969, kind="later-echo", earlierSubject="Matthean turn-the-other-cheek/love-enemy tradition", laterSubject="Fifth Satanic Statement", earlierDate={"label": "first-century gospel tradition", "startYear": 50, "endYear": 100, "confidence": "medium"}, laterDate={"label": "1969 publication", "startYear": 1969, "endYear": 1969, "confidence": "high"}, survivalBiasWarning="The later statement names the phrase it inverts; this does not imply dependence on one modern Bible edition.", influenceRelationshipId="influence-matthew-satanic-inversion"),
        ],
        "influenceRelationships": [
            evidence_item("influence-matthew-satanic-inversion", "The Church of Satan statement explicitly invokes and reverses 'turning the other cheek,' documenting an adversarial reception relationship.", ["src-gutenberg-bible", "src-church-satan-statements"], ["christianity", "laveyan-satanism"], ["eastern-mediterranean", "north-america"], 50, 1969, relationshipType="explicit-polemical-reception", documented=True),
        ],
        "alternativeInterpretations": [
            evidence_item("alt-injury-situations", "Read the prescriptions as responses to different situations: personal hostility, cycles of hatred, civic justice, and polemical identity construction.", ["src-gutenberg-bible", "src-gutenberg-dhammapada", "src-gutenberg-analects", "src-church-satan-statements"], ["christianity", "buddhism", "confucian", "laveyan-satanism"], ["eastern-mediterranean", "south-asia", "china", "north-america"], -475, 2026, interpretationSource="Primary texts compared in their named literary contexts"),
            evidence_item("alt-injury-translation", "Treat kindness/virtue/justice terminology as a translation problem requiring original-language review before stronger semantic claims.", ["src-gutenberg-analects", "src-gutenberg-tao"], ["confucian", "daoism"], ["china"], -475, -200, "medium", interpretationSource="Legge translations and their distinct source passages"),
        ],
    },
    {
        "id": "cmp-death-continuity",
        "title": "Death, self, and continuity",
        "topic": "afterlife",
        "scopeNote": "The comparison separates enduring-self, resurrection, mortality, and philosophical identity accounts.",
        "subjectClaims": [
            evidence_item("claim-gita-self", "The Gita describes a birthless, deathless self amid counsel about duty and grief.", ["src-gutenberg-gita"], ["hindu"], ["south-asia"], -200, 200, proposition="The enduring self is not killed when the body is killed.", speaker="Krishna as represented in the Gita", context="Battlefield counsel to Arjuna"),
            evidence_item("claim-john-resurrection", "John depicts a future resurrection from graves and judgment.", ["src-gutenberg-bible"], ["christianity"], ["eastern-mediterranean"], 80, 110, proposition="Those in graves will come forth.", speaker="Jesus as represented in John", context="John 5:28–29"),
            evidence_item("claim-ecclesiastes-dead", "Ecclesiastes says the dead know nothing in its discourse about mortal life.", ["src-gutenberg-bible"], ["judaism"], ["levant"], -350, -180, proposition="The dead know nothing.", speaker="Qoheleth's literary voice", context="Ecclesiastes 9 under-the-sun discourse"),
            evidence_item("claim-lucretius-mortal", "Lucretius argues that mind and soul dissolve with the body.", ["src-gutenberg-lucretius"], ["epicureanism"], ["mediterranean"], -55, -45, proposition="Mind and soul are mortal bodily compounds.", speaker="Lucretius' didactic speaker", context="Epicurean argument against fear of death"),
        ],
        "synthesisFindings": [
            evidence_item("syn-death-models", "The sources present distinct models: enduring self, resurrection, the dead's lack of knowledge, and dissolution of mind and soul.", ["src-gutenberg-gita", "src-gutenberg-bible", "src-gutenberg-lucretius", "src-sep-afterlife"], ["hindu", "christianity", "judaism", "epicureanism", "philosophy-of-religion"], ["south-asia", "eastern-mediterranean", "levant", "mediterranean", "global"], -350, 2026),
            evidence_item("syn-death-identity", "Agreement that death matters does not settle what, if anything, preserves personal identity.", ["src-gutenberg-gita", "src-gutenberg-bible", "src-gutenberg-lucretius", "src-sep-afterlife"], ["hindu", "christianity", "judaism", "epicureanism", "philosophy-of-religion"], ["south-asia", "eastern-mediterranean", "levant", "mediterranean", "global"], -350, 2026),
        ],
        "similarityFindings": [
            evidence_item("sim-death-motif", "All four claims use death to frame questions of continuity, knowledge, judgment, or fear.", ["src-gutenberg-gita", "src-gutenberg-bible", "src-gutenberg-lucretius"], ["hindu", "christianity", "judaism", "epicureanism"], ["south-asia", "eastern-mediterranean", "levant", "mediterranean"], -350, 200, dimension="motif", influenceRelationshipId=None),
            evidence_item("sim-death-narrative", "The Gita and John place death claims in different narrative settings: battlefield counsel and a gospel discourse.", ["src-gutenberg-gita", "src-gutenberg-bible"], ["hindu", "christianity"], ["south-asia", "eastern-mediterranean"], -200, 110, dimension="narrative", influenceRelationshipId=None),
            evidence_item("sim-death-theological", "The Gita and John both reject death as the final word, but their accounts of continuity are not theologically equivalent.", ["src-gutenberg-gita", "src-gutenberg-bible"], ["hindu", "christianity"], ["south-asia", "eastern-mediterranean"], -200, 110, dimension="theological", influenceRelationshipId=None),
            evidence_item("sim-death-semantic", "Soul, self, person, resurrection body, mind, and identity require separate terms rather than one universalized category.", ["src-gutenberg-gita", "src-gutenberg-bible", "src-gutenberg-lucretius", "src-sep-afterlife"], ["hindu", "christianity", "judaism", "epicureanism", "philosophy-of-religion"], ["south-asia", "eastern-mediterranean", "levant", "mediterranean", "global"], -350, 2026, dimension="semantic", influenceRelationshipId=None),
        ],
        "contradictionFindings": [
            evidence_item("con-death-gita-lucretius", "The Gita's deathless self and Lucretius' mortal mind/soul make opposed ontological claims.", ["src-gutenberg-gita", "src-gutenberg-lucretius"], ["hindu", "epicureanism"], ["south-asia", "mediterranean"], -200, 200, propositionAId="claim-gita-self", propositionBId="claim-lucretius-mortal", speakerContext="A Sanskrit epic dialogue and a Roman didactic poem address death for different ethical purposes.", harmonization="A metaphorical reading could soften conflict, but both texts are commonly read as advancing materially different accounts.", counterReading="On a straightforward ontological reading, persistence and dissolution cannot both describe the same self in the same respect."),
            evidence_item("con-death-ecclesiastes-john", "The dead knowing nothing and a later resurrection can appear inconsistent when treated as descriptions of the same interval and scope.", ["src-gutenberg-bible"], ["judaism", "christianity"], ["levant", "eastern-mediterranean"], -350, 110, "medium", propositionAId="claim-ecclesiastes-dead", propositionBId="claim-john-resurrection", speakerContext="Two literary voices from different works and historical settings within later Christian canonical reception.", harmonization="A reader may limit Ecclesiastes to present earthly activity and place resurrection in the future.", counterReading="The plain contrast remains significant if both claims are generalized beyond their literary scopes."),
        ],
        "chronologyFindings": [
            evidence_item("chron-death-gita-john", "The broad Gita composition range begins before the Gospel of John, creating an earlier parallel without a documented transmission chain.", ["src-gutenberg-gita", "src-gutenberg-bible"], ["hindu", "christianity"], ["south-asia", "eastern-mediterranean"], -200, 110, "low", kind="earlier-parallel", earlierSubject="Bhagavad Gita tradition", laterSubject="Gospel of John", earlierDate={"label": "broadly c. 200 BCE–200 CE", "startYear": -200, "endYear": 200, "confidence": "low"}, laterDate={"label": "approximately 80–110 CE", "startYear": 80, "endYear": 110, "confidence": "medium"}, survivalBiasWarning="Overlapping composition ranges and unequal manuscript survival prevent a priority or borrowing inference.", influenceRelationshipId=None),
            evidence_item("chron-death-ecclesiastes-john", "Ecclesiastes is earlier than John in conventional composition ranges, but later canonical juxtaposition is not evidence that John answers this verse directly.", ["src-gutenberg-bible"], ["judaism", "christianity"], ["levant", "eastern-mediterranean"], -350, 110, "medium", kind="earlier-parallel", earlierSubject="Ecclesiastes", laterSubject="Gospel of John", earlierDate={"label": "approximately 350–180 BCE", "startYear": -350, "endYear": -180, "confidence": "medium"}, laterDate={"label": "approximately 80–110 CE", "startYear": 80, "endYear": 110, "confidence": "medium"}, survivalBiasWarning="Dating literary works does not prove that one author interpreted the other.", influenceRelationshipId=None),
        ],
        "influenceRelationships": [],
        "alternativeInterpretations": [
            evidence_item("alt-death-identity-models", "Compare bodily, psychological, soul-based, and resurrection criteria before asking whether the same person survives.", ["src-sep-afterlife"], ["philosophy-of-religion"], ["global"], 1900, 2026, interpretationSource="Stanford Encyclopedia of Philosophy's reviewed afterlife survey"),
            evidence_item("alt-death-canonical", "A canonical harmonization can limit Ecclesiastes to present experience and John to future resurrection; a historical reading can preserve their distinct voices.", ["src-gutenberg-bible", "src-sep-afterlife"], ["judaism", "christianity", "philosophy-of-religion"], ["levant", "eastern-mediterranean", "global"], -350, 2026, "medium", interpretationSource="Primary passages plus contemporary philosophical distinctions"),
        ],
    },
    {
        "id": "cmp-ancient-floods",
        "title": "Ancient Near Eastern flood narratives",
        "topic": "flood",
        "scopeNote": "Museum scholarship supports comparison of Atrahasis, Gilgamesh Tablet XI, and Genesis. Shared motifs alone are not a direct-borrowing claim.",
        "subjectClaims": [
            evidence_item("claim-atrahasis-flood", "Atrahasis presents a divinely sent flood, a warned survivor, a boat, and post-flood sacrifice within a Mesopotamian account of human-divine relations.", ["src-met-flood"], ["mesopotamian"], ["mesopotamia"], -1700, -1600, "medium", proposition="A warned human survives a divine flood in a boat.", speaker="Atrahasis narrative voice", context="Old Babylonian literary tradition known through fragmentary witnesses"),
            evidence_item("claim-gilgamesh-flood", "Gilgamesh Tablet XI embeds Utnapishtim's flood account inside Gilgamesh's search for immortality.", ["src-met-flood"], ["mesopotamian"], ["mesopotamia"], -1300, -650, "medium", proposition="Utnapishtim recounts surviving the flood.", speaker="Utnapishtim within the Epic of Gilgamesh", context="Standard Babylonian epic with older antecedents"),
            evidence_item("claim-genesis-flood", "Genesis 6–9 narrates Noah, the ark, animals, flood, sacrifice, and covenant.", ["src-gutenberg-bible", "src-met-flood"], ["judaism", "christianity"], ["levant"], -700, -400, "medium", proposition="Noah survives a divinely sent flood and receives a covenant.", speaker="Genesis narrative voice", context="Pentateuchal flood narrative"),
        ],
        "synthesisFindings": [
            evidence_item("syn-flood-shared", "The narratives share a catastrophic flood, warned survivor, vessel, preservation of life, and sacrifice, while assigning these motifs different narrative and theological functions.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400),
            evidence_item("syn-flood-limits", "Ancient Near Eastern contact makes transmission historically discussable, but this dataset does not claim a single direct line from one surviving tablet to Genesis.", ["src-met-flood"], ["mesopotamian", "judaism"], ["mesopotamia", "levant"], -1700, -400, "medium"),
        ],
        "similarityFindings": [
            evidence_item("sim-flood-motif", "A deity or deities send a destructive flood and a warned human survives in a constructed vessel.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, dimension="motif", influenceRelationshipId=None),
            evidence_item("sim-flood-narrative", "Release or use of birds, post-flood landing, and sacrifice form a comparable narrative sequence.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, "medium", dimension="narrative", influenceRelationshipId=None),
            evidence_item("sim-flood-ritual", "Post-flood sacrifice appears in the compared traditions, but its divine reception and covenantal role differ.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, "medium", dimension="ritual", influenceRelationshipId=None),
            evidence_item("sim-flood-semantic", "Modern English terms such as flood, ark, and sacrifice can conceal differences in source languages and objects.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, dimension="semantic", influenceRelationshipId=None),
            evidence_item("sim-flood-theological", "All narratives place catastrophe in relation to divine agency; they disagree about divine plurality, motive, restraint, and covenant.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, dimension="theological", influenceRelationshipId=None),
        ],
        "contradictionFindings": [
            evidence_item("con-flood-divine-motive", "Atrahasis and Genesis give different reasons and divine configurations for the flood.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1700, -400, "medium", propositionAId="claim-atrahasis-flood", propositionBId="claim-genesis-flood", speakerContext="Literary narratives from different languages, periods, and theological settings.", harmonization="A comparative reader may treat both as culturally specific retellings of a broad flood tradition.", counterReading="Their stated divine motives and divine worlds remain materially different within the texts."),
            evidence_item("con-flood-outcome", "Genesis culminates in covenant, while Gilgamesh uses the flood survivor chiefly within a meditation on mortality.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism", "christianity"], ["mesopotamia", "levant"], -1300, -400, "medium", propositionAId="claim-gilgamesh-flood", propositionBId="claim-genesis-flood", speakerContext="An embedded first-person recollection in an epic and a third-person ancestral narrative.", harmonization="Both can be read as accounts of reordered human-divine relations after catastrophe.", counterReading="The covenant and immortality-search functions cannot be reduced to one message."),
        ],
        "chronologyFindings": [
            evidence_item("chron-flood-atrahasis-genesis", "Old Babylonian Atrahasis witnesses predate the usual composition ranges assigned to Genesis, establishing an earlier surviving parallel but not direct dependence.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism"], ["mesopotamia", "levant"], -1700, -400, "medium", kind="earlier-parallel", earlierSubject="Old Babylonian Atrahasis witnesses", laterSubject="Genesis flood narrative", earlierDate={"label": "approximately seventeenth century BCE", "startYear": -1700, "endYear": -1600, "confidence": "medium"}, laterDate={"label": "first-millennium BCE literary formation", "startYear": -700, "endYear": -400, "confidence": "low"}, survivalBiasWarning="Earlier surviving clay witnesses do not date the first oral flood story, and missing texts distort the sample.", influenceRelationshipId=None),
            evidence_item("chron-flood-gilgamesh-genesis", "Surviving Gilgamesh flood witnesses are earlier than the extant Genesis manuscript tradition; cultural contact is relevant but the path of literary transmission remains debated.", ["src-met-flood", "src-gutenberg-bible"], ["mesopotamian", "judaism"], ["mesopotamia", "levant"], -1300, -400, "low", kind="earlier-parallel", earlierSubject="Gilgamesh Tablet XI tradition", laterSubject="Genesis flood narrative", earlierDate={"label": "second- to first-millennium BCE witnesses", "startYear": -1300, "endYear": -650, "confidence": "medium"}, laterDate={"label": "first-millennium BCE literary formation", "startYear": -700, "endYear": -400, "confidence": "low"}, survivalBiasWarning="Overlapping textual development, lost intermediaries, and unequal material survival block a simple before/after borrowing claim.", influenceRelationshipId=None),
        ],
        "influenceRelationships": [],
        "alternativeInterpretations": [
            evidence_item("alt-flood-shared-milieu", "Explain the correspondences through a shared ancient Near Eastern literary milieu and multiple stages of retelling rather than a single copied document.", ["src-met-flood"], ["mesopotamian", "judaism"], ["mesopotamia", "levant"], -1700, -400, "medium", interpretationSource="Metropolitan Museum's comparative essay"),
            evidence_item("alt-flood-independent-memory", "Treat some flood motifs as potentially arising from environmental memory or common narrative logic; this remains possible but does not explain detailed correspondences by itself.", ["src-met-flood"], ["mesopotamian", "judaism"], ["mesopotamia", "levant"], -1700, -400, "low", interpretationSource="Museum synthesis used as a boundary; no independent-development claim is promoted to fact"),
        ],
    },
    {
        "id": "cmp-enoch-jude-reception",
        "title": "1 Enoch and the Letter of Jude",
        "topic": "reception",
        "scopeNote": "A documented quotation provides a stronger relationship than motif similarity; canon and interpretation remain community-specific.",
        "subjectClaims": [
            evidence_item("claim-enoch-judgment", "1 Enoch 1:9 depicts the holy ones coming for judgment.", ["src-sbl-jude-enoch"], ["second-temple-judaism", "ethiopian-christianity"], ["levant", "horn-of-africa"], -300, -100, "medium", proposition="The Holy One comes with holy ones to execute judgment.", speaker="1 Enoch's pseudepigraphal prophetic voice", context="Opening judgment oracle"),
            evidence_item("claim-jude-enoch", "Jude 14–15 attributes a judgment saying to Enoch and quotes 1 Enoch 1:9.", ["src-gutenberg-bible", "src-sbl-jude-enoch"], ["christianity"], ["eastern-mediterranean"], 50, 120, proposition="Enoch prophesied the coming judgment.", speaker="Authorial voice of Jude", context="Polemical warning in Jude 14–15"),
        ],
        "synthesisFindings": [
            evidence_item("syn-enoch-jude", "Jude's quotation documents reception of an Enochic judgment oracle in an early Christian letter; it does not by itself settle the canon status of all Enochic books.", ["src-gutenberg-bible", "src-sbl-jude-enoch"], ["second-temple-judaism", "christianity", "ethiopian-christianity"], ["levant", "eastern-mediterranean", "horn-of-africa"], -300, 120),
        ],
        "similarityFindings": [
            evidence_item("sim-enoch-jude-verbal", "Jude 14b–15 has a direct verbal relationship to 1 Enoch 1:9 according to the cited SBL study.", ["src-sbl-jude-enoch", "src-gutenberg-bible"], ["second-temple-judaism", "christianity"], ["levant", "eastern-mediterranean"], -300, 120, dimension="semantic", influenceRelationshipId="influence-enoch-jude-quotation"),
            evidence_item("sim-enoch-jude-theological", "Both passages deploy a coming judgment against the ungodly, while Jude adapts the saying to its own polemical context.", ["src-sbl-jude-enoch", "src-gutenberg-bible"], ["second-temple-judaism", "christianity"], ["levant", "eastern-mediterranean"], -300, 120, dimension="theological", influenceRelationshipId="influence-enoch-jude-quotation"),
        ],
        "contradictionFindings": [
            evidence_item("con-enoch-canon", "Use of an Enochic quotation does not entail identical canon status across later Jewish, Ethiopian, Catholic, Orthodox, or Protestant communities.", ["src-sbl-jude-enoch"], ["second-temple-judaism", "christianity", "ethiopian-christianity"], ["levant", "eastern-mediterranean", "horn-of-africa"], -300, 2026, "high", propositionAId="claim-enoch-judgment", propositionBId="claim-jude-enoch", speakerContext="A source text and a later citing letter are distinct witnesses with distinct reception histories.", harmonization="A community may value or quote a work without granting it the same canonical status as the citing work.", counterReading="Some communities' canonical reception of 1 Enoch gives the quotation a different theological setting."),
        ],
        "chronologyFindings": [
            evidence_item("chron-enoch-jude", "The Enochic oracle predates Jude, and Jude 14b–15 directly quotes it.", ["src-sbl-jude-enoch", "src-gutenberg-bible"], ["second-temple-judaism", "christianity"], ["levant", "eastern-mediterranean"], -300, 120, "high", kind="later-echo", earlierSubject="1 Enoch 1:9", laterSubject="Jude 14b–15", earlierDate={"label": "Second Temple period before Jude", "startYear": -300, "endYear": -100, "confidence": "medium"}, laterDate={"label": "first or early second century CE", "startYear": 50, "endYear": 120, "confidence": "medium"}, survivalBiasWarning="Dating ranges remain approximate, but an explicit quotation is stronger than chronology alone.", influenceRelationshipId="influence-enoch-jude-quotation"),
        ],
        "influenceRelationships": [
            evidence_item("influence-enoch-jude-quotation", "Jude 14b–15 quotes 1 Enoch 1:9; the relationship is textually documented rather than inferred from resemblance.", ["src-sbl-jude-enoch", "src-gutenberg-bible"], ["second-temple-judaism", "christianity"], ["levant", "eastern-mediterranean"], -300, 120, relationshipType="explicit-quotation", documented=True),
        ],
        "alternativeInterpretations": [
            evidence_item("alt-enoch-authority", "Interpret quotation as evidence of use and authority in Jude's context without assuming a universal later canon decision.", ["src-sbl-jude-enoch"], ["second-temple-judaism", "christianity"], ["levant", "eastern-mediterranean"], -300, 2026, interpretationSource="Society of Biblical Literature commentary"),
            evidence_item("alt-enoch-opponents", "Some interpreters ask whether Jude cites material valued by its opponents; the quotation relationship remains even when rhetorical ownership is disputed.", ["src-sbl-jude-enoch"], ["christianity"], ["eastern-mediterranean"], 50, 2026, "medium", interpretationSource="Scholarly alternatives surveyed in SBL commentary"),
        ],
    },
]


# Comparison findings are only valid for the reviewed texts and themes named
# here.  These fields are data, rather than UI hints: the API uses them to
# prevent a reviewed finding about one reading set from appearing for another.
COMPARISON_APPLICABILITY = {
    "cmp-response-to-injury": {
        "themes": ["ethics", "enemy", "enemies", "injury", "hatred", "kindness", "justice", "love", "nonviolence", "retaliation", "vengeance"],
        "sourceTextIds": {
            "src-gutenberg-bible": ["gospel-of-matthew"],
            "src-gutenberg-dhammapada": ["dhammapada"],
            "src-gutenberg-analects": ["analects"],
            "src-gutenberg-tao": ["tao-te-ching"],
            "src-church-satan-statements": ["the-satanic-bible"],
        },
    },
    "cmp-death-continuity": {
        "themes": ["afterlife", "death", "identity", "immortality", "mortality", "reincarnation", "resurrection", "self", "soul"],
        "sourceTextIds": {
            "src-gutenberg-gita": ["bhagavad-gita"],
            "src-gutenberg-bible": ["gospel-of-john", "ecclesiastes"],
            "src-gutenberg-lucretius": ["lucretius-de-rerum-natura"],
            "src-sep-afterlife": ["bhagavad-gita", "gospel-of-john", "ecclesiastes", "lucretius-de-rerum-natura"],
        },
    },
    "cmp-ancient-floods": {
        "themes": ["deluge", "flood", "flood myth", "flood narrative"],
        "sourceTextIds": {
            "src-met-flood": ["atrahasis-epic", "epic-of-gilgamesh"],
            "src-gutenberg-bible": ["genesis"],
        },
    },
    "cmp-enoch-jude-reception": {
        "themes": ["canon", "enoch", "jude", "judgment", "quotation", "reception", "watchers"],
        "sourceTextIds": {
            "src-sbl-jude-enoch": ["1-enoch", "catholic-epistles"],
            "src-gutenberg-bible": ["catholic-epistles"],
        },
    },
}


def comparison_item_text_ids(case_id: str, item: dict, source_map: dict[str, list[str]]) -> list[str]:
    """Return the exact catalog works represented by one reviewed finding."""
    item_id = item["id"]
    text_ids = {
        text_id
        for source_id in item["sourceIds"]
        for text_id in source_map[source_id]
    }

    if case_id == "cmp-death-continuity" and "src-gutenberg-bible" in item["sourceIds"]:
        text_ids -= {"gospel-of-john", "ecclesiastes"}
        if "ecclesiastes" in item_id:
            text_ids.add("ecclesiastes")
        if "john" in item_id:
            text_ids.add("gospel-of-john")
        if "ecclesiastes" not in item_id and "john" not in item_id:
            text_ids.update({"gospel-of-john", "ecclesiastes"})
        if item_id in {"sim-death-narrative", "sim-death-theological"}:
            text_ids.discard("ecclesiastes")
            text_ids.add("gospel-of-john")

    if case_id == "cmp-ancient-floods" and "src-met-flood" in item["sourceIds"]:
        text_ids -= {"atrahasis-epic", "epic-of-gilgamesh"}
        if "atrahasis" in item_id:
            text_ids.add("atrahasis-epic")
        if "gilgamesh" in item_id:
            text_ids.add("epic-of-gilgamesh")
        if "atrahasis" not in item_id and "gilgamesh" not in item_id and "genesis" not in item_id:
            text_ids.update({"atrahasis-epic", "epic-of-gilgamesh"})
        if item_id == "con-flood-divine-motive":
            text_ids.discard("epic-of-gilgamesh")
            text_ids.add("atrahasis-epic")
        if item_id == "con-flood-outcome":
            text_ids.discard("atrahasis-epic")
            text_ids.add("epic-of-gilgamesh")

    if case_id == "cmp-enoch-jude-reception" and item_id == "claim-enoch-judgment":
        text_ids = {"1-enoch"}

    return sorted(text_ids)


def apply_comparison_applicability() -> None:
    section_keys = [
        "subjectClaims", "synthesisFindings", "similarityFindings",
        "contradictionFindings", "chronologyFindings",
        "influenceRelationships", "alternativeInterpretations",
    ]
    for comparison in COMPARISON_CASES:
        applicability = COMPARISON_APPLICABILITY[comparison["id"]]
        source_map = applicability["sourceTextIds"]
        comparison["themes"] = applicability["themes"]
        comparison["textIds"] = sorted({
            text_id for values in source_map.values() for text_id in values
        })
        for key in section_keys:
            for item in comparison[key]:
                item["textIds"] = comparison_item_text_ids(
                    comparison["id"], item, source_map
                )


apply_comparison_applicability()


TEACHING_CONDUCT_CASES = [
    {
        "id": "tc-spg-codrington",
        "title": "Christian ethical teaching and SPG plantation ownership",
        "traditionId": "christianity",
        "dateLabel": "1710–1838",
        "startYear": 1710,
        "endYear": 1838,
        "locations": ["Barbados"],
        "actorsAndInstitutions": ["Society for the Propagation of the Gospel in Foreign Parts (SPG)", "Codrington and Consett plantations", "enslaved African workers"],
        "teachingEvidence": [
            evidence_item("tc-spg-teaching-golden-rule", "Matthew 7:12 presents the Golden Rule; Matthew 22:39 presents love of neighbor. These are selected Christian teachings, not an exhaustive doctrine of slavery.", ["src-gutenberg-bible"], ["christianity"], ["eastern-mediterranean"], 50, 100, locator="Matthew 7:12; 22:39", evidenceType="primary-teaching"),
        ],
        "conductEvidence": [
            evidence_item("tc-spg-conduct-ownership", "The SPG inherited two Barbados sugar plantations and about 300 enslaved Africans in 1710 and continued exploiting enslaved labor; the Church of England FAQ also documents branding with 'Society'.", ["src-church-england-codrington"], ["christianity"], ["caribbean"], 1710, 1838, locator="Historic links to enslavement FAQ, Codrington section", evidenceType="institutional-archival-research"),
        ],
        "justificationsAtTheTime": [
            evidence_item("tc-spg-justification-endowment", "Rev. Thomas Thompson defended slavery through the law of nations, biblical appeal, nature, necessity, and commerce. This is a named Anglican argument, not a uniform Christian or SPG theology.", ["src-cambridge-atlantic-slavery"], ["christianity"], ["caribbean", "britain"], 1748, 1772, "high", attributedTo="Rev. Thomas Thompson as documented in the cited study", evidenceStatus="scholarly-analysis-of-named-contemporary-religious-argument"),
        ],
        "textsUsedToJustify": [
            evidence_item("tc-spg-text-gospel-property", "Independent scholarship documents SPG-linked Anglican arguments that the Christian gospel did not interfere with civil property, with enslaved Africans treated as property, and a contemporary debate that invoked Christ's example and the authority of Scripture.", ["src-cambridge-atlantic-slavery"], ["christianity"], ["caribbean", "britain"], 1710, 1838, "high", locator="Chapter 2, pp. 70–72", attributedTo="Thomas Sherlock, Thomas Thompson, Benjamin Hoadly, and other named Anglican clergy in the cited study", evidenceStatus="scholarly-analysis-of-contemporary-religious-arguments"),
        ],
        "supportingReligiousVoices": [
            evidence_item("tc-spg-support-board", "The SPG continued the plantation arrangement, while Rev. Thomas Thompson and named Anglican bishops argued that Christian conversion and the gospel did not dissolve enslavers' civil property claims.", ["src-church-england-codrington", "src-cambridge-atlantic-slavery"], ["christianity"], ["caribbean", "britain"], 1710, 1838, "high", attributedTo="SPG governors, Thomas Thompson, Benjamin Hoadly, and Thomas Sherlock in the cited records", evidenceStatus="institutional-and-named-religious-support"),
        ],
        "opposingReligiousVoices": [
            evidence_item("tc-spg-opposition-bolton", "Granville Sharp answered Thompson's proslavery case as a committed Christian, appealing to the gospel and universal benevolence while rejecting the claimed biblical and natural-law warrant.", ["src-cambridge-atlantic-slavery"], ["christianity"], ["britain", "caribbean"], 1769, 1772, attributedTo="Granville Sharp", evidenceStatus="scholarly-analysis-of-named-contemporary-religious-opposition"),
        ],
        "nonreligiousMotives": [
            evidence_item("tc-spg-motive-sugar", "Sugar production, plantation revenue, labor control, and preservation of an endowment were economic and institutional motives alongside religious mission identity.", ["src-church-england-codrington"], ["christianity"], ["caribbean", "britain"], 1710, 1838, "high", motiveType="economic-and-institutional"),
        ],
        "laterTheologicalInterpretations": [
            evidence_item("tc-spg-later-response", "Later mission theology reads the Codrington legacy through scripture, liberation, repentance, and repair, while current Church research treats historic benefit from chattel enslavement as requiring accountability. These later readings do not erase institutional distinctions.", ["src-brill-spg-slavery", "src-church-england-codrington"], ["christianity"], ["britain", "caribbean"], 2021, 2026, attributedTo="Mission Studies scholarship and Church of England institutional review", evidenceStatus="later-theological-and-institutional-interpretation"),
        ],
        "modernScholarlyInterpretations": [
            evidence_item("tc-spg-modern-archive", "Independent scholarship and the institutional archival review both document ownership, management, religious argument, and exploitation while keeping the SPG and later legally distinct institutions historically specific.", ["src-cambridge-atlantic-slavery", "src-church-england-codrington"], ["christianity"], ["britain", "caribbean"], 2023, 2026, attributedTo="Independent historians and Church Commissioners historical research", evidenceStatus="independent-and-institutional-research"),
        ],
        "evidenceStatus": "High for ownership, labor exploitation, dates, and the cited scholarly reconstruction of named religious arguments; no single uniform SPG prooftext is asserted.",
        "disputes": "Responsibility and institutional continuity must distinguish the historic SPG, modern USPG, Church Commissioners, and the broader Church of England. Selected ethical verses do not establish how every historical Anglican interpreted slavery.",
        "neutralityNote": "Atlas juxtaposes a selected teaching and documented institutional conduct without declaring divine approval, collective guilt, or a theological verdict.",
        "sourceIds": ["src-gutenberg-bible", "src-church-england-codrington", "src-cambridge-atlantic-slavery", "src-brill-spg-slavery"],
    },
    {
        "id": "tc-soto-imperial-war",
        "title": "Buddhist non-harm teaching and Japanese Zen wartime support",
        "traditionId": "buddhism",
        "dateLabel": "1904–1945, with postwar reassessment",
        "startYear": 1904,
        "endYear": 1945,
        "locations": ["Japan", "colonial East Asia"],
        "actorsAndInstitutions": ["leaders and institutions within Japanese Zen", "Sōtō school", "Japanese imperial state", "Uchiyama Gudō", "Makiguchi Tsunesaburō"],
        "teachingEvidence": [
            evidence_item("tc-soto-teaching-nonhatred", "Dhammapada verse 5 states that hatred does not cease by hatred; this is a selected Buddhist teaching, not proof that all Buddhist ethics are absolute pacifism.", ["src-gutenberg-dhammapada"], ["buddhism"], ["south-asia"], -300, 100, locator="Dhammapada verse 5", evidenceType="historical-translation-unclassified-selection"),
            evidence_item("tc-soto-teaching-modern-nonviolence", "The contemporary Sōtō organization explicitly presents non-violence and avoidance of warlike confrontation as Buddhist responsibilities.", ["src-soto-nonviolence"], ["buddhism"], ["global", "japan"], 2015, 2026, locator="SOTOZEN SDG 16 statement", evidenceType="current-institutional-teaching"),
        ],
        "conductEvidence": [
            evidence_item("tc-soto-conduct-war-support", "Scholarship documents Zen leaders and institutions supporting Japanese imperial projects through propaganda, patriotic organizations, fundraising, ritual, and exhortation; the inspected article records specific Sōtō arguments and voices.", ["src-jstor-imperial-way-zen", "src-nanzan-soto-apology"], ["buddhism"], ["japan", "east-asia"], 1931, 1945, evidenceType="scholarly-historical-analysis"),
        ],
        "justificationsAtTheTime": [
            evidence_item("tc-soto-justification-realm", "Wartime rhetoric drew on loyalty, service to the public, protection of the realm, national emergency, and interpretations connecting Zen discipline with imperial duty.", ["src-jstor-imperial-way-zen"], ["buddhism"], ["japan", "east-asia"], 1931, 1945, "high", attributedTo="Documented wartime Zen leaders", evidenceStatus="scholarly-synthesis-of-primary-material"),
        ],
        "textsUsedToJustify": [
            evidence_item("tc-soto-texts-metaphysical", "Wartime Sōtō argument used the 'two truths' theory to subordinate Buddhist law to imperial law and presented loyalty to the emperor as an absolute religious obligation. The cited article preserves these as historically situated arguments.", ["src-nanzan-soto-apology"], ["buddhism"], ["japan"], 1931, 1945, "high", attributedTo="Wartime Sōtō doctrinal argument documented by Ishikawa Rikizan", evidenceStatus="scholarly-analysis-of-specific-doctrinal-argument"),
        ],
        "supportingReligiousVoices": [
            evidence_item("tc-soto-support-leaders", "Named Zen leaders including Sawaki Kōdō and Nanjo Bun'yū linked Buddhist language, imperial loyalty, and wartime service; broader institutional mobilization included enlistment, fundraising, and ritual.", ["src-nanzan-soto-apology", "src-jstor-imperial-way-zen"], ["buddhism"], ["japan"], 1931, 1945, attributedTo="Sawaki Kōdō, Nanjo Bun'yū, and other documented Zen leaders", evidenceStatus="scholarly-documented-named-voices"),
        ],
        "opposingReligiousVoices": [
            evidence_item("tc-soto-opposition-gudo", "Sōtō priest Uchiyama Gudō opposed imperial authority and was later rehabilitated; the Sōtō apology literature treats his case as part of institutional reckoning.", ["src-nanzan-soto-apology"], ["buddhism"], ["japan"], 1904, 1911, attributedTo="Uchiyama Gudō", evidenceStatus="historically-documented"),
            evidence_item("tc-soto-opposition-makiguchi", "Makiguchi Tsunesaburō's conflict with wartime ideology provides a distinct Buddhist resistance case; it must not be generalized to all Sōka or Nichiren actors.", ["src-jstor-soka-wartime"], ["buddhism"], ["japan"], 1937, 1944, attributedTo="Makiguchi Tsunesaburō", evidenceStatus="scholarly-documented"),
        ],
        "nonreligiousMotives": [
            evidence_item("tc-soto-motive-state", "Nationalism, state pressure, institutional survival, colonial expansion, military mobilization, and access to public legitimacy were non-doctrinal factors.", ["src-jstor-imperial-way-zen", "src-nanzan-soto-apology"], ["buddhism"], ["japan", "east-asia"], 1931, 1945, "medium", motiveType="political-institutional-and-nationalist"),
        ],
        "laterTheologicalInterpretations": [
            evidence_item("tc-soto-later-apology", "The 1992 Sōtō statement acknowledged harm, loss of autonomy, and institutional responsibility; contemporary Sōtō materials articulate a no-war ethic.", ["src-nanzan-soto-apology", "src-soto-nonviolence"], ["buddhism"], ["japan", "global"], 1992, 2026, attributedTo="Sōtō institutional leadership", evidenceStatus="documented-institutional-reassessment"),
        ],
        "modernScholarlyInterpretations": [
            evidence_item("tc-soto-modern-debate", "Ives analyzes both active support and disputes about whether Zen doctrines, institutional accommodation, nationalism, or political coercion best explain wartime conduct.", ["src-jstor-imperial-way-zen"], ["buddhism"], ["japan", "east-asia"], 2009, 2026, attributedTo="Christopher Ives", evidenceStatus="scholarly-monograph"),
        ],
        "evidenceStatus": "High for documented institutional mobilization and later apology; medium for causal weight assigned to doctrine versus state, nationalist, and institutional pressures.",
        "disputes": "Scholars dispute the representativeness of individual figures, the interpretation of wartime rhetoric, and how much explanatory weight belongs to Zen ideas versus modern nationalism and coercive institutions.",
        "neutralityNote": "The case neither treats wartime conduct as Buddhist doctrine nor exempts documented religious institutions from historical analysis.",
        "sourceIds": ["src-gutenberg-dhammapada", "src-jstor-imperial-way-zen", "src-nanzan-soto-apology", "src-jstor-soka-wartime", "src-soto-nonviolence"],
    },
    {
        "id": "tc-ottoman-devshirme",
        "title": "No-compulsion teaching and Ottoman devshirme",
        "traditionId": "islam",
        "dateLabel": "approximately fifteenth–seventeenth centuries",
        "startYear": 1400,
        "endYear": 1700,
        "locations": ["Ottoman Balkans", "Anatolia", "Istanbul"],
        "actorsAndInstitutions": ["Ottoman imperial administration", "Christian subject families", "levied boys", "Janissary and palace institutions"],
        "teachingEvidence": [
            evidence_item("tc-devshirme-teaching-compulsion", "Qur'an 2:256 states that there is no compulsion in religion. Its legal scope and historical applications have multiple interpretations.", ["src-quran-corpus-2-256", "src-gutenberg-quran"], ["islam"], ["arabia"], 610, 632, locator="Qur'an 2:256", evidenceType="primary-teaching"),
            evidence_item("tc-devshirme-teaching-dhimmi", "Wittek summarizes the sharia principle that protected Christian subjects retained personal liberty and the right to practice their religion.", ["src-cambridge-devshirme"], ["islamic-jurisprudence"], ["ottoman-empire"], 1400, 1700, "medium", locator="Devshirme and Shari'a abstract", evidenceType="scholarly-summary-of-legal-norm"),
        ],
        "conductEvidence": [
            evidence_item("tc-devshirme-conduct", "The devshirme was a periodic forced levy of Christian boys involving enslavement, conversion to Islam, and training for imperial military or administrative service.", ["src-cambridge-devshirme", "src-cambridge-global-slavery"], ["ottoman-state", "islam"], ["balkans", "anatolia", "istanbul"], 1400, 1700, evidenceType="scholarly-historical-analysis"),
        ],
        "justificationsAtTheTime": [
            evidence_item("tc-devshirme-justification-service", "The included scholarship reconstructs service, military recruitment, household formation, and centralization as state rationales, but it does not establish a named contemporary religious justification. Atlas records that evidentiary limit instead of converting state practice into theology.", ["src-cambridge-devshirme", "src-cambridge-global-slavery"], ["ottoman-state", "islam"], ["ottoman-empire"], 1400, 1700, "low", recordKind="documented-gap", attributedTo="Evidence gap", evidenceStatus="named-contemporary-religious-justification-not-established"),
        ],
        "textsUsedToJustify": [
            evidence_item("tc-devshirme-prooftext-gap", "The included sources do not establish a single Qur'anic prooftext used by Ottoman administrators to authorize the levy. Atlas records the legal controversy instead of fabricating one.", ["src-cambridge-devshirme"], ["ottoman-state", "islamic-jurisprudence"], ["ottoman-empire"], 1400, 1700, "low", recordKind="documented-gap", attributedTo="Evidence gap", evidenceStatus="not-established-in-included-source"),
        ],
        "supportingReligiousVoices": [
            evidence_item("tc-devshirme-support-gap", "No named contemporary religious scholar explicitly defending devshirme is established in the included evidence. State implementation demonstrates political support, not automatically a juristic endorsement.", ["src-cambridge-devshirme", "src-cambridge-global-slavery"], ["ottoman-state", "islamic-jurisprudence"], ["ottoman-empire"], 1400, 1700, "low", recordKind="documented-gap", attributedTo="Evidence gap", evidenceStatus="named-supporting-religious-voice-not-established"),
        ],
        "opposingReligiousVoices": [
            evidence_item("tc-devshirme-opposition-law", "Wittek reports that the levy appeared incompatible with the holy law's protection of Christian subjects, but the inspected material does not establish a named contemporary religious opponent. The legal conflict is evidence; a named voice remains a gap.", ["src-cambridge-devshirme"], ["islamic-jurisprudence"], ["ottoman-empire"], 1400, 1955, "low", recordKind="documented-gap", attributedTo="Evidence gap", evidenceStatus="named-contemporary-religious-opponent-not-established"),
        ],
        "nonreligiousMotives": [
            evidence_item("tc-devshirme-motive-centralization", "Military labor, an imperial service elite, central control over frontier nobles, and state formation were major political and institutional motives.", ["src-cambridge-global-slavery"], ["ottoman-state"], ["ottoman-empire"], 1400, 1700, motiveType="military-political-and-institutional"),
        ],
        "laterTheologicalInterpretations": [
            evidence_item("tc-devshirme-later-legal", "Louis Massignon later described devshirme as a breach of the Prophet's compact protecting Christian subjects; Wittek develops the legal-historical problem without treating that judgment as a universal Muslim view.", ["src-cambridge-devshirme"], ["islamic-jurisprudence"], ["ottoman-empire", "global"], 1930, 1955, "medium", attributedTo="Louis Massignon as discussed by Paul Wittek", evidenceStatus="named-later-legal-theological-interpretation"),
        ],
        "modernScholarlyInterpretations": [
            evidence_item("tc-devshirme-modern-state", "Recent comparative scholarship treats devshirme as coerced enslavement and conversion embedded in state formation while also noting later advancement available to some recruits.", ["src-cambridge-global-slavery"], ["ottoman-state"], ["ottoman-empire", "global"], 2000, 2026, attributedTo="Comparative slavery and state-formation scholarship", evidenceStatus="modern-scholarship"),
        ],
        "evidenceStatus": "High for coercive levy, conversion, and service; medium for legal debates; the current evidence set lacks a named contemporary religious defender and records that gap.",
        "disputes": "Frequency, recruitment patterns, local agency, family strategies, and the experience of later elite advancement vary. None removes coercive intake, and none warrants generalizing devshirme to all Ottoman or Islamic conversion.",
        "neutralityNote": "The case compares a Qur'anic/legal norm with a state institution without declaring the institution representative of Islam as a whole.",
        "sourceIds": ["src-quran-corpus-2-256", "src-gutenberg-quran", "src-cambridge-devshirme", "src-cambridge-global-slavery"],
    },
    {
        "id": "tc-vaikom-exclusion",
        "title": "Equal vision teaching and Vaikom road exclusion",
        "traditionId": "hindu",
        "dateLabel": "1924–1925, with 1936 temple-entry reform",
        "startYear": 1924,
        "endYear": 1936,
        "locations": ["Vaikom", "Travancore", "Kerala"],
        "actorsAndInstitutions": ["Travancore authorities", "Vaikom temple-associated orthodox leaders", "Ezhava and other excluded communities", "Vaikom Satyagraha volunteers", "Sri Narayana Guru", "M. K. Gandhi"],
        "teachingEvidence": [
            evidence_item("tc-vaikom-teaching-equal-vision", "Bhagavad Gita 5:18 praises equal vision toward people of different social standing. This selected verse is not a complete account of Hindu varna or caste traditions.", ["src-gutenberg-gita"], ["hindu"], ["south-asia"], -200, 200, locator="Bhagavad Gita 5:18", evidenceType="historical-translation-unclassified-selection"),
        ],
        "conductEvidence": [
            evidence_item("tc-vaikom-conduct-roads", "Roads surrounding the Vaikom temple were closed to Ezhavas and other communities deemed untouchable, and authorities arrested nonviolent protesters seeking access.", ["src-gandhi-vaikom", "src-kerala-vaikom"], ["hindu", "travancore-state"], ["vaikom", "kerala"], 1924, 1925, evidenceType="institutional-historical-record"),
        ],
        "justificationsAtTheTime": [
            evidence_item("tc-vaikom-justification-custom", "Indam Thurutthi Devan Nilakanthan Nampyathiri defended inherited exclusion through Hindu Dharma Shastra, Shankarasmriti, tradition, karma, and reincarnation during the 1925 discussions. This is a named historical position, not a summary of Hinduism.", ["src-kerala-vaikom"], ["hindu"], ["vaikom", "travancore"], 1925, 1925, "high", attributedTo="Indam Thurutthi Devan Nilakanthan Nampyathiri", evidenceStatus="named-contemporary-religious-argument"),
        ],
        "textsUsedToJustify": [
            evidence_item("tc-vaikom-prooftext-gap", "The government history records an orthodox appeal to Hindu Dharma Shastra and Shankarasmriti during Gandhi's discussion with caste-Hindu leaders. The cited pages do not establish a single verse as the exclusive warrant.", ["src-kerala-vaikom"], ["hindu"], ["vaikom", "travancore"], 1925, 1925, "high", attributedTo="Indam Thurutthi Devan Nilakanthan Nampyathiri", evidenceStatus="named-textual-traditions-without-invented-verse"),
        ],
        "supportingReligiousVoices": [
            evidence_item("tc-vaikom-support-orthodox", "Indam Thurutthi Devan Nilakanthan Nampyathiri and other named attendees defended the inherited restriction and rejected Gandhi's proposed tests for change during the March 1925 discussion.", ["src-kerala-vaikom", "src-gandhi-vaikom"], ["hindu"], ["vaikom"], 1925, 1925, attributedTo="Indam Thurutthi Devan Nilakanthan Nampyathiri and the documented caste-Hindu delegation", evidenceStatus="named-contemporary-religious-support"),
        ],
        "opposingReligiousVoices": [
            evidence_item("tc-vaikom-opposition-guru", "Sri Narayana Guru supported the struggle against exclusion and met Gandhi during the campaign.", ["src-gandhi-vaikom", "src-kerala-vaikom"], ["hindu"], ["kerala"], 1924, 1925, attributedTo="Sri Narayana Guru", evidenceStatus="institutional-history-summary"),
            evidence_item("tc-vaikom-opposition-gandhi", "Gandhi joined prayer with protesters, negotiated with orthodox leaders and state figures, and argued for change within a religious and political reform framework.", ["src-gandhi-vaikom", "src-kerala-vaikom"], ["hindu"], ["kerala"], 1925, 1925, attributedTo="M. K. Gandhi", evidenceStatus="archival-heritage-summary"),
        ],
        "nonreligiousMotives": [
            evidence_item("tc-vaikom-motive-status", "Social status, control of public space, princely-state order, anti-caste mobilization, and Indian nationalist politics shaped the conflict alongside religious custom.", ["src-gandhi-vaikom", "src-kerala-vaikom", "src-oup-vaikom"], ["hindu", "travancore-state"], ["kerala"], 1924, 1936, "high", motiveType="social-political-and-status"),
        ],
        "laterTheologicalInterpretations": [
            evidence_item("tc-vaikom-later-reform", "The included sources establish later reform memory around Vaikom and the 1936 Temple Entry Proclamation, but they do not establish one defined later theological interpretation with an inspected doctrinal source. Atlas records that limitation explicitly.", ["src-gandhi-vaikom", "src-kerala-vaikom", "src-oup-vaikom"], ["hindu"], ["kerala"], 1936, 2026, "low", recordKind="documented-gap", attributedTo="Evidence gap", evidenceStatus="later-doctrinal-interpretation-not-established"),
        ],
        "modernScholarlyInterpretations": [
            evidence_item("tc-vaikom-modern-civil-rights", "Independent scholarship treats Vaikom as a nonviolent anti-untouchability campaign, disputes romanticized conversion narratives, and analyzes the campaign's controversial settlement alongside the public-history accounts.", ["src-oup-vaikom", "src-gandhi-vaikom", "src-kerala-vaikom"], ["hindu", "indian-national-movement"], ["kerala", "india"], 2015, 2026, "high", attributedTo="Mary Elizabeth King with government and Gandhi heritage histories retained as public-memory sources", evidenceStatus="independent-scholarship-with-institutional-comparison"),
        ],
        "evidenceStatus": "High for exclusion, protest dates, named reformers, and negotiated road opening; medium for motives and orthodox justifications summarized by commemorative sources.",
        "disputes": "The campaign's partial 1925 settlement, relationship to temple entry, roles of Gandhi and local reformers, and the weight of religious custom versus state and caste power require fuller independent scholarship.",
        "neutralityNote": "Atlas neither treats exclusion as the essence of Hindu doctrine nor hides the religious institutions and arguments present in the historical record.",
        "sourceIds": ["src-gutenberg-gita", "src-gandhi-vaikom", "src-kerala-vaikom", "src-oup-vaikom"],
    },
]


# Every published finding below points to the source span inspected for that
# individual claim. A source URL by itself is not claim-level provenance.
STANCE_LOCATORS = {
    "stance-matthew-enemy-love": "Matthew 5:44–45",
    "stance-dhammapada-hatred": "Dhammapada verse 5; Atlas passage pg-2017-2",
    "stance-analects-justice": "Analects 14.34",
    "stance-tao-kindness": "Tao Te Ching chapter 63",
    "stance-satanic-vengeance": "The Nine Satanic Statements, statement 5",
    "stance-humanist-restraint": "Humanist Manifesto III, ethical-values and responsibility paragraphs",
    "stance-gita-enduring-self": "Bhagavad Gita 2:19–22; Atlas passage pg-2388-10",
    "stance-john-resurrection": "John 5:28–29",
    "stance-ecclesiastes-dead": "Ecclesiastes 9:5–10",
    "stance-lucretius-mortal-mind": "On the Nature of Things, Book III, mortality-of-mind argument",
    "stance-afterlife-identity": "Stanford Encyclopedia of Philosophy, Afterlife, sections 2–4",
    "stance-humanist-finite-life": "Humanist Manifesto III, naturalism and life's fulfillment paragraphs",
    "stance-hume-philo-evil": "Dialogues Concerning Natural Religion, Parts X–XI; SEP Hume on Religion, problem-of-evil discussion",
    "stance-job-divine-speech": "Job 38:1–41",
    "stance-demea-future-redress": "Dialogues Concerning Natural Religion, Part X, Demea's future-state reply",
    "stance-stoic-judgment": "Meditations 8.47–49",
    "stance-dhammapada-practice": "Dhammapada verses 277–279",
    "stance-lucretius-natural-causes": "On the Nature of Things, Books V–VI, natural-cause arguments",
    "stance-quran-no-compulsion": "Qur'an 2:256",
    "stance-devshirme-state": "Wittek, Devshirme and Shari'a, pp. 271–278; Global Slavery, devshirme discussion",
    "stance-devshirme-juristic": "Wittek, Devshirme and Shari'a, p. 271 and article extract",
    "stance-devshirme-statebuilding": "Global Slavery in the Making of States and International Orders, Ottoman devshirme section",
    "stance-humanist-freedom": "Humanist Manifesto III, freedom-and-responsibility paragraph",
}

TEXT_SOURCE_LOCATORS = {
    "gospel-of-matthew": {"src-gutenberg-bible": "Matthew 5:44–45"},
    "dhammapada": {"src-gutenberg-dhammapada": "Dhammapada verse 5 (Atlas passage pg-2017-2)"},
    "analects": {"src-gutenberg-analects": "Analects 14.34"},
    "tao-te-ching": {"src-gutenberg-tao": "Tao Te Ching chapter 63"},
    "the-satanic-bible": {"src-church-satan-statements": "The Nine Satanic Statements, statement 5"},
    "bhagavad-gita": {"src-gutenberg-gita": "Bhagavad Gita 2:19–22 (Atlas passage pg-2388-10)"},
    "gospel-of-john": {"src-gutenberg-bible": "John 5:28–29"},
    "ecclesiastes": {"src-gutenberg-bible": "Ecclesiastes 9:5–10"},
    "lucretius-de-rerum-natura": {"src-gutenberg-lucretius": "On the Nature of Things, Book III, mortality-of-mind argument"},
    "atrahasis-epic": {"src-met-flood": "Metropolitan Museum of Art, Flood Stories, Atra-hasis section"},
    "epic-of-gilgamesh": {"src-met-flood": "Metropolitan Museum of Art, Flood Stories, Gilgamesh Tablet XI section"},
    "genesis": {
        "src-gutenberg-bible": "Genesis 6–9",
        "src-met-flood": "Metropolitan Museum of Art, Flood Stories, Genesis comparison",
    },
    "1-enoch": {"src-sbl-jude-enoch": "Reading 1–2 Peter and Jude, 1 Enoch 1:9 discussion"},
    "catholic-epistles": {
        "src-gutenberg-bible": "Jude 14b–15",
        "src-sbl-jude-enoch": "Reading 1–2 Peter and Jude, Jude 14b–15 discussion",
    },
}

COMPARISON_SOURCE_LOCATORS = {
    "src-sep-afterlife": "Stanford Encyclopedia of Philosophy, Afterlife, sections 1–4",
}

CONDUCT_LOCATORS = {
    "tc-spg-teaching-golden-rule": "Matthew 7:12; Matthew 22:39",
    "tc-spg-conduct-ownership": "Church of England Historic Links FAQ, Codrington section",
    "tc-spg-justification-endowment": "The University of Cambridge in the Age of Atlantic Slavery, chapter 2, pp. 49–51",
    "tc-spg-text-gospel-property": "The University of Cambridge in the Age of Atlantic Slavery, chapter 2, pp. 70–72",
    "tc-spg-support-board": "Cambridge Atlantic Slavery, chapter 2, pp. 49–51 and 70–72; Church of England FAQ, Codrington section",
    "tc-spg-opposition-bolton": "The University of Cambridge in the Age of Atlantic Slavery, chapter 2, pp. 49–51",
    "tc-spg-motive-sugar": "Church of England Historic Links FAQ, Codrington plantation and endowment paragraphs",
    "tc-spg-later-response": "Mission Studies 38.3 (2021), pp. 325–346; Church of England Historic Links FAQ, response programme paragraphs",
    "tc-spg-modern-archive": "Cambridge Atlantic Slavery, chapter 2, pp. 40–75; Church of England Historic Links FAQ",
    "tc-soto-teaching-nonhatred": "Dhammapada verse 5; Atlas passage pg-2017-2",
    "tc-soto-teaching-modern-nonviolence": "SOTOZEN SDG 16, non-violence and peace statement",
    "tc-soto-conduct-war-support": "Ishikawa Rikizan (1998), pp. 88–93; Imperial-Way Zen, wartime-mobilization chapters",
    "tc-soto-justification-realm": "Imperial-Way Zen, chapters on imperial-way doctrine and protection of the realm",
    "tc-soto-texts-metaphysical": "Ishikawa Rikizan (1998), pp. 88–89",
    "tc-soto-support-leaders": "Ishikawa Rikizan (1998), pp. 91–93; Imperial-Way Zen, named-leader chapters",
    "tc-soto-opposition-gudo": "Ishikawa Rikizan (1998), Uchiyama Gudō discussion, pp. 74–87",
    "tc-soto-opposition-makiguchi": "We Alone Can Save Japan, Makiguchi and wartime-resistance sections",
    "tc-soto-motive-state": "Imperial-Way Zen, institutional-accommodation chapters; Ishikawa Rikizan (1998), pp. 88–105",
    "tc-soto-later-apology": "Ishikawa Rikizan (1998), p. 105; SOTOZEN SDG 16 statement",
    "tc-soto-modern-debate": "Imperial-Way Zen, conclusion and responsibility analysis",
    "tc-devshirme-teaching-compulsion": "Qur'an 2:256",
    "tc-devshirme-teaching-dhimmi": "Wittek, Devshirme and Shari'a, p. 271 and article extract",
    "tc-devshirme-conduct": "Wittek, Devshirme and Shari'a, pp. 271–278; Global Slavery, Ottoman devshirme section",
    "tc-devshirme-justification-service": "Global Slavery, Ottoman state-formation section; Wittek, pp. 271–278 (named religious defender not located)",
    "tc-devshirme-prooftext-gap": "Wittek, Devshirme and Shari'a, pp. 271–278 (reviewed for, but does not establish, a Qur'anic prooftext)",
    "tc-devshirme-support-gap": "Wittek, pp. 271–278 and Global Slavery devshirme section (reviewed for, but do not establish, a named juristic defender)",
    "tc-devshirme-opposition-law": "Wittek, pp. 271–278 (legal conflict established; named contemporary religious opponent not established)",
    "tc-devshirme-motive-centralization": "Global Slavery in the Making of States and International Orders, Ottoman devshirme section",
    "tc-devshirme-later-legal": "Wittek, Devshirme and Shari'a, p. 271, Massignon and protected-subject compact discussion",
    "tc-devshirme-modern-state": "Global Slavery in the Making of States and International Orders, Ottoman devshirme section",
    "tc-vaikom-teaching-equal-vision": "Bhagavad Gita 5:18; Atlas passage pg-2388-26",
    "tc-vaikom-conduct-roads": "Government of Kerala, Vaikom Satyagraha, campaign narrative pp. 1–22; Gandhi Heritage Portal chronology",
    "tc-vaikom-justification-custom": "Government of Kerala, Vaikom Satyagraha, pp. 20–22",
    "tc-vaikom-prooftext-gap": "Government of Kerala, Vaikom Satyagraha, pp. 20–22",
    "tc-vaikom-support-orthodox": "Government of Kerala, Vaikom Satyagraha, pp. 20–22; Gandhi Heritage Portal, March 1925 meeting",
    "tc-vaikom-opposition-guru": "Government of Kerala, Sree Narayana Guru campaign section; Gandhi Heritage Portal, Guru meeting",
    "tc-vaikom-opposition-gandhi": "Government of Kerala, Gandhi negotiations pp. 20–22; Gandhi Heritage Portal, March 1925 chronology",
    "tc-vaikom-motive-status": "Gandhian Nonviolent Struggle and Untouchability, campaign and settlement chapters; Government of Kerala campaign narrative",
    "tc-vaikom-later-reform": "Gandhian Nonviolent Struggle and Untouchability, conclusion; Kerala and Gandhi public histories (reviewed for, but do not establish, one later doctrinal school)",
    "tc-vaikom-modern-civil-rights": "Gandhian Nonviolent Struggle and Untouchability, campaign, settlement, and conclusion chapters",
}

CANONICAL_PASSAGE_LINKS = {
    "stance-dhammapada-hatred": ["pg-2017-2"],
    "stance-gita-enduring-self": ["pg-2388-10"],
    "claim-dhammapada-nonhatred": ["pg-2017-2"],
    "claim-gita-self": ["pg-2388-10"],
    "tc-soto-teaching-nonhatred": ["pg-2017-2"],
    "tc-vaikom-teaching-equal-vision": ["pg-2388-26"],
}

PASSAGE_BY_ID = {
    passage["id"]: passage
    for filename in [
        "passages.json",
        "egypt-passages.json",
        "mesopotamia-passages.json",
        "china-passages.json",
        "esoteric-passages.json",
    ]
    for passage in json.loads((ROOT / "data" / "seed" / filename).read_text(encoding="utf-8"))
}


def apply_claim_level_provenance() -> None:
    for item in STANCES:
        item["locator"] = STANCE_LOCATORS[item["id"]]
        item["reviewStatus"] = "human-reviewed"

    for comparison in COMPARISON_CASES:
        for key in ["subjectClaims", "synthesisFindings", "similarityFindings", "contradictionFindings", "chronologyFindings", "influenceRelationships", "alternativeInterpretations"]:
            for item in comparison[key]:
                spans: list[str] = []
                represented_sources: set[str] = set()
                for text_id in item["textIds"]:
                    for source_id, locator in TEXT_SOURCE_LOCATORS[text_id].items():
                        if source_id in item["sourceIds"]:
                            spans.append(f"{source_id} — {locator}")
                            represented_sources.add(source_id)
                for source_id in item["sourceIds"]:
                    locator = COMPARISON_SOURCE_LOCATORS.get(source_id)
                    if locator:
                        spans.append(f"{source_id} — {locator}")
                        represented_sources.add(source_id)
                assert represented_sources == set(item["sourceIds"]), f"locator/source mismatch: {item['id']}"
                item["locator"] = "Compared inspected spans: " + "; ".join(dict.fromkeys(spans))
                item["reviewStatus"] = "human-reviewed"

    for case in TEACHING_CONDUCT_CASES:
        for key in ["teachingEvidence", "conductEvidence", "justificationsAtTheTime", "textsUsedToJustify", "supportingReligiousVoices", "opposingReligiousVoices", "nonreligiousMotives", "laterTheologicalInterpretations", "modernScholarlyInterpretations"]:
            for item in case[key]:
                item["locator"] = CONDUCT_LOCATORS[item["id"]]
                item["reviewStatus"] = "human-reviewed"

    for collection in [STANCES, *[case[key] for case in COMPARISON_CASES for key in ["subjectClaims", "synthesisFindings", "similarityFindings", "contradictionFindings", "chronologyFindings", "influenceRelationships", "alternativeInterpretations"]], *[case[key] for case in TEACHING_CONDUCT_CASES for key in ["teachingEvidence", "conductEvidence", "justificationsAtTheTime", "textsUsedToJustify", "supportingReligiousVoices", "opposingReligiousVoices", "nonreligiousMotives", "laterTheologicalInterpretations", "modernScholarlyInterpretations"]]]:
        for item in collection:
            passage_ids = CANONICAL_PASSAGE_LINKS.get(item["id"])
            if passage_ids:
                passages = [PASSAGE_BY_ID.get(passage_id) for passage_id in passage_ids]
                assert all(passages), f"missing canonical passage for {item['id']}"
                item["canonicalPassageIds"] = passage_ids
                item["textIds"] = sorted({passage["textId"] for passage in passages})
                item["contentTypes"] = sorted({passage["contentType"] for passage in passages})


apply_claim_level_provenance()


POLICY = {
    "opposition": "Retrieve only reviewed proposition-linked stances. A tradition label, geography, or entity name never creates an opposition relationship.",
    "comparison": "Filter every evidence section before applying limits. Similarity never implies influence; only a cited, explicit influence relationship may be labeled influence.",
    "chronology": "Retain ranges, date confidence, unknown dates, and survival-bias warnings. Earlier surviving evidence does not prove earliest origin.",
    "teachingConduct": "Cite teaching and conduct independently, name actors and mixed motives, preserve evidence gaps, and never convert conduct into doctrine or issue a theological verdict.",
}


def validate(data: dict) -> None:
    source_ids = {item["id"] for item in data["sources"]}
    assert len(source_ids) == len(data["sources"])
    assert all(item["url"].startswith("https://") for item in data["sources"])
    assert all(item["verification"]["httpStatus"] == 200 for item in data["sources"])

    all_ids: set[str] = set()

    def check_id(item: dict) -> None:
        assert item["id"] not in all_ids, f"duplicate id: {item['id']}"
        all_ids.add(item["id"])

    def check_sources(item: dict) -> None:
        assert item.get("sourceIds"), f"missing source evidence: {item['id']}"
        assert set(item["sourceIds"]) <= source_ids, f"unknown source in {item['id']}"

    def check_reviewed_evidence(item: dict) -> None:
        check_sources(item)
        assert item.get("locator", "").strip(), f"missing inspected span: {item['id']}"
        assert item.get("reviewStatus") == "human-reviewed", f"unreviewed static finding: {item['id']}"

    for item in data["sources"] + data["propositions"] + data["oppositionStances"]:
        check_id(item)
        if "sourceIds" in item:
            check_sources(item)

    proposition_ids = {item["id"] for item in data["propositions"]}
    assert all(item["propositionId"] in proposition_ids for item in data["oppositionStances"])
    for item in data["oppositionStances"]:
        check_reviewed_evidence(item)
    categories = {item["category"] for item in data["oppositionStances"]}
    assert categories == {
        "doctrinal-opposition", "philosophical-critique", "internal-heterodox-opposition",
        "skeptical-critique", "materialist-critique", "alternative-religious-interpretation",
        "mystical-reinterpretation", "adversarial-reinterpretation", "modern-secular-critique",
    }
    for proposition_id in proposition_ids:
        linked = [item for item in data["oppositionStances"] if item["propositionId"] == proposition_id]
        assert len(linked) >= 4
        assert len({item["category"] for item in linked}) >= 3
        proposition = next(item for item in data["propositions"] if item["id"] == proposition_id)
        linked_source_ids = {source_id for item in linked for source_id in item["sourceIds"]}
        assert linked_source_ids <= set(proposition["sourceIds"]), f"{proposition_id} omits a linked stance source"

    dimensions = set()
    for comparison in data["comparisonCases"]:
        check_id(comparison)
        assert len(comparison["textIds"]) >= 2, f"{comparison['id']} needs text scope"
        assert comparison["themes"], f"{comparison['id']} needs theme scope"
        comparison_text_ids = set(comparison["textIds"])
        for key in ["subjectClaims", "synthesisFindings", "similarityFindings", "contradictionFindings", "chronologyFindings", "alternativeInterpretations"]:
            assert comparison[key], f"{comparison['id']} missing {key}"
        influence_ids = {item["id"] for item in comparison["influenceRelationships"]}
        for key in ["subjectClaims", "synthesisFindings", "similarityFindings", "contradictionFindings", "chronologyFindings", "influenceRelationships", "alternativeInterpretations"]:
            for item in comparison[key]:
                check_id(item)
                check_reviewed_evidence(item)
                assert item["textIds"], f"{item['id']} needs text scope"
                assert set(item["textIds"]) <= comparison_text_ids, f"unknown text scope in {item['id']}"
        for similarity in comparison["similarityFindings"]:
            dimensions.add(similarity["dimension"])
            relation_id = similarity["influenceRelationshipId"]
            assert relation_id is None or relation_id in influence_ids
        for chronology in comparison["chronologyFindings"]:
            assert chronology["kind"] in {"earlier-parallel", "later-echo"}
            assert chronology["survivalBiasWarning"]
            relation_id = chronology["influenceRelationshipId"]
            assert relation_id is None or relation_id in influence_ids
        assert all(item["documented"] is True for item in comparison["influenceRelationships"])
    assert {"motif", "semantic", "ritual", "narrative", "theological"} <= dimensions

    required_sections = [
        "teachingEvidence", "conductEvidence", "justificationsAtTheTime", "textsUsedToJustify",
        "supportingReligiousVoices", "opposingReligiousVoices", "nonreligiousMotives",
        "laterTheologicalInterpretations", "modernScholarlyInterpretations",
    ]
    traditions: set[str] = set()
    for case in data["teachingConductCases"]:
        check_id(case)
        check_sources(case)
        traditions.add(case["traditionId"])
        assert case["actorsAndInstitutions"] and case["locations"]
        assert case["evidenceStatus"] and case["disputes"] and case["neutralityNote"]
        teaching_sources: set[str] = set()
        conduct_sources: set[str] = set()
        for key in required_sections:
            assert case[key], f"{case['id']} missing {key}"
            for item in case[key]:
                check_id(item)
                check_reviewed_evidence(item)
                if key == "teachingEvidence":
                    teaching_sources.update(item["sourceIds"])
                if key == "conductEvidence":
                    conduct_sources.update(item["sourceIds"])
        assert teaching_sources and conduct_sources and teaching_sources != conduct_sources
    assert traditions == {"christianity", "buddhism", "islam", "hindu"}


def main() -> None:
    data = {
        "formatVersion": 1,
        "reviewedAt": REVIEWED_AT,
        "policy": POLICY,
        "sources": SOURCES,
        "propositions": PROPOSITIONS,
        "oppositionStances": STANCES,
        "comparisonCases": COMPARISON_CASES,
        "teachingConductCases": TEACHING_CONDUCT_CASES,
    }
    validate(data)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"Wrote {OUTPUT.relative_to(ROOT)}: {len(SOURCES)} sources, "
        f"{len(PROPOSITIONS)} propositions, {len(STANCES)} stances, "
        f"{len(COMPARISON_CASES)} comparison cases, "
        f"{len(TEACHING_CONDUCT_CASES)} teaching/conduct cases."
    )


if __name__ == "__main__":
    main()
