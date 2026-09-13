# Atlas Completion Gap Audit
## Authoritative completion audit for `Byrd11811/Religion`
### Status: Reconciled against default-branch commit `b5ed9acb8d06ec380dd149f3f55d1f71fe642592` on 2026-09-13
### Purpose: Define the material gaps between the present repository and the intended Atlas product

---

# 0. AUTHORITY AND SCOPE

This document is the authoritative gap audit for the current Atlas expansion.

It must be read together with:

- `AGENTS.md`
- `README.md`
- `docs/product-spec.md`
- `docs/source-policy.md`
- `docs/coverage.md`
- `docs/expansion-progress.md`

Where this document identifies a feature or corpus area as incomplete, Codex must not treat a rendered page, schema table, placeholder record, metadata-only record, or passing build as proof that the requirement is complete.

This audit focuses on **material product gaps**, not cosmetic preferences.

Authority after documentation reconciliation: this file is the inventory of incomplete/partial work; `atlas-completion-roadmap.md` is the execution plan. Newer completion milestones supersede older numeric milestones or ceilings. The stricter historical-evidence, copyright, cultural-restriction, provenance, safety and non-fabrication rule in any existing specification/policy remains binding. Existing specifications and progress documents are preserved, not replaced. The user's documentation-only reconciliation request takes precedence over implementation instructions inside the attached roadmap for this commit.

The project goal remains:

> Build the broadest practical, evidence-aware research atlas of human religion, spirituality, mythology, philosophy, ritual, oral tradition, manuscripts, inscriptions, archaeology, skepticism, esotericism, controversial literature, lost works, disputed works, and modern religious movements without fabricating evidence or flattening cultural differences.

This document intentionally does **not** implement the separate Contested History / suppression-claims phase. That phase is defined as a later follow-on once the core Atlas corpus and research experience are materially complete.

---

# 1. CURRENT STATE SUMMARY

The current repository has a strong foundation but is not close to the full requested Atlas vision.

Current documented release state includes roughly:

- 252 catalog metadata records
- 44 English source editions covering 43 works
- 20,991 searchable segments
- 8 modeled physical witnesses
- 8 modeled artifacts
- 57 archive images
- 3 editorial question guides
- 2 handcrafted contradiction/tension cases
- 3 relationship records
- Ancient Egypt as the only substantive special regional collection
- Voynich Manuscript and Codex Gigas as starter witness records
- additive work / witness / artifact / image schema
- initial Deep Archive UI
- source-depth and evidence badges
- conservative copyright / provenance policies
- working search, compare, question, map, timeline, canon, collections, export, and optional model synthesis

These are good foundations.

They are not equivalent to the requested expansion.

The largest problem is that **the apparent catalog breadth greatly exceeds the actual scholarly/searchable depth**. Many records remain:

- metadata only
- unreviewed
- null-dated
- null-geolocated
- without language metadata
- without source editions
- without manuscript witnesses
- without primary passages
- without scholarly bibliography
- without relationships

---

# 2. COMPLETION STANDARD

A feature is NOT complete merely because:

- a route exists
- a page renders
- a schema table exists
- a placeholder card exists
- a title exists in the catalog
- an API endpoint exists
- a button changes explanatory copy
- a test passes
- the production build succeeds

A requirement is complete only when:

1. the underlying data exists at a meaningful level,
2. the user-facing experience exposes it,
3. evidence / uncertainty / provenance are preserved,
4. functionality performs the behavior promised by the UI,
5. tests cover the actual completion condition,
6. documentation reports the real current count / limitation.

---

# 3. CRITICAL GAP: WORLD MAP

## Current issue

The World Map is visibly incomplete.

The current application logic omits records without sufficient date / coordinate metadata, causing a large portion of the catalog to disappear.

This makes the project look geographically sparse even when metadata records exist.

## Required corrections

The map must support:

- approximate work origin
- cultural region
- manuscript / witness findspot
- present repository location
- archaeological site
- religious center
- modern religious movement origin
- major historical centers of transmission
- optional tradition expansion areas where adequately sourced

Do not require a precise point when only a broad region is known.

Use confidence labels such as:

- Precise documented location
- Approximate historical location
- Broad cultural region
- Repository location
- Findspot
- Unknown

Records lacking exact dates must remain discoverable.

The map must display a coverage metric:

- mapped records
- records with approximate geography
- records without defensible geography

## Missing planned layers

The original vision also called for future support for:

- cultures active in a given period
- religious traditions
- manuscript discoveries
- centers of learning
- expansion patterns
- trade routes
- migration routes
- political context
- major archaeological discoveries

These must be progressively implemented with evidence labels.

---

# 4. CRITICAL GAP: TIMELINE

## Current issue

The Timeline is primarily text-date visualization and omits null-dated records.

Correction from code inspection: it already displays dated and omitted-undated counts and warns that chronology is provisional (`components/Explore.tsx`, `Timeline`). Coverage reporting is therefore **partial**, not absent. At the default 2026/all-traditions setting it includes 32 works and reports 220 undated works omitted. The horizontal axis is hard-coded to roughly 1000 BCE–2100 CE despite a slider reaching 5000 BCE; older records are clamped to the left edge. Acceptance must verify faithful range placement, not just a rendered slider. The current undated count is global rather than scoped consistently with the tradition filter.

## Required event classes

Timeline must evolve beyond text composition dates to support:

- text composition ranges
- manuscript witnesses
- manuscript discoveries
- translations
- canon formation events
- councils
- schisms
- reform movements
- founders / teachers
- empires / political context where relevant
- archaeological discoveries
- religious expansion
- institutional milestones
- publication of modern religious works
- rediscovery of lost works

Every event needs:

- date/range
- type
- confidence
- source
- relation to tradition / work / witness / person

---

# 5. CRITICAL GAP: TRADITION TAXONOMY IS TOO COARSE

The current top-level groupings are useful catalog buckets but are not sufficient as a scholarly religion taxonomy.

Examples of over-broad groupings:

- China
- African Traditions
- North American Indigenous Traditions
- Mesoamerica
- Oceania / Polynesia
- Hindu / Vedic / Indian
- New Religious Movements / Modern Revelation
- Christianity
- Islam
- Buddhism

## Required hierarchy

Implement a flexible hierarchy such as:

`region -> cultural sphere -> tradition -> school/branch -> community`

Support multiple parent / cross-tradition relationships when historically appropriate.

Examples:

### China
- Confucian / Ru
- Daojia
- Daojiao / religious Daoism
- Chinese Buddhism
  - Chan
  - Pure Land
  - Tiantai
  - Huayan
- Mohism
- Legalism
- School of Names
- folk religion
- Mazu traditions
- Guandi traditions
- City God traditions
- Chinese Manichaeism
- Jingjiao
- Chinese Islamic traditions
- syncretic / salvationist traditions

### North America
Distinct records for Diné, Hopi, Haudenosaunee, Lakota, Ojibwe, Cherokee, Inuit, etc.

### Africa
Distinct records for Yoruba / Ifa, Fon / Vodun, Akan, Igbo, Kongo, Dinka, San, Zulu, etc.

The system must preserve broad navigation groupings while avoiding false homogenization.

---

# 6. CRITICAL GAP: METADATA-ONLY RECORDS DOMINATE THE CATALOG

Many high-value titles exist only as metadata placeholders.

Examples include major Mesopotamian and Egyptian works.

The project must distinguish clearly between:

- catalog presence
- reviewed metadata
- searchable primary text
- complete edition
- substantial translation
- manuscript witness coverage
- image coverage
- scholarly bibliography

Do not count metadata-only titles as completed corpus depth.

## Required target

At least 100 genuinely searchable works in the next major completion milestone.

A searchable work must have a legitimate source edition, transcription, licensed/public-domain translation, or public scholarly corpus.

Do not inflate the count by splitting one text into artificial pseudo-records.

---

# 7. ANCIENT EGYPT IS ONLY PARTIALLY IMPLEMENTED

Current strengths:

- dedicated Egypt collection
- Book of the Dead witness modeling
- six verified papyrus objects
- substantial image addition
- provenance-safe Met intake pipeline

Major missing work:

## Funerary corpus
- Pyramid Texts
- Coffin Texts
- Book of the Dead beyond one study / selections
- Amduat
- Book of Gates
- Book of Caverns
- Book of the Earth
- Litany of Re
- Book of the Heavenly Cow
- Book of Nut
- Books of Breathing
- Book of Traversing Eternity
- Opening of the Mouth
- tomb liturgies
- mortuary temple texts

## Wisdom
- Ptahhotep
- Kagemni
- Hordedef
- Merikare
- Amenemhat
- Loyalist Teaching
- Amenemope
- Ani
- Ankhsheshonq
- Khety / Satire of the Trades

## Narrative / literary
- Tale of Sinuhe
- Westcar Papyrus
- Shipwrecked Sailor
- Eloquent Peasant
- Two Brothers
- Wenamun
- Doomed Prince
- Truth and Falsehood
- Contendings of Horus and Seth
- Setna I
- Setna II
- Capture of Joppa
- Dialogue with the Ba
- Harper's Songs
- Ipuwer
- Neferti
- Apophis and Seqenenre
- Bentresh

## Theology / hymns / ritual
- Great Hymn to Aten
- Amun hymns
- Leiden Hymns
- Shabaka Stone / Memphite Theology
- Bremner-Rhind
- Dramatic Ramesseum
- Osiris hymns
- Ra hymns
- temple liturgies

## Magic / ritual
- Metternich Stela
- Harris Magical Papyrus
- London-Leiden Demotic Magical Papyrus
- Egyptian-context Greek Magical Papyri
- Book of Thoth
- Book of Faiyum
- dream texts
- protection / amulet texts
- execration texts

## Required Egypt UI
- Overview
- Funerary
- Wisdom
- Stories
- Gods
- Creation
- Afterlife
- Magic
- Temples & Tombs
- Manuscripts
- Images
- Timeline
- Compare

Add a real "Evolution of the Egyptian Afterlife" path.

---

# 8. MESOPOTAMIA IS MOSTLY METADATA

Current corpus depth is far below requested scope.

Required high-priority corpus:

- Epic of Gilgamesh
- Atrahasis
- Enuma Elish
- Eridu Genesis
- Descent of Inanna
- Descent of Ishtar
- Enki and Ninhursag
- Enki and Ninmah
- Enki and the World Order
- Enki's Journey to Nippur
- Inanna and Enki
- Inanna and Ebih
- Inanna and Shukaletuda
- Enmerkar and Lord of Aratta
- Enmerkar and En-suhgir-ana
- Lugalbanda cycles
- Gilgamesh, Enkidu and the Netherworld
- Death of Gilgamesh
- Nergal and Ereshkigal
- Erra and Ishum
- Anzu
- Etana
- Adapa
- Sumerian King List
- Instructions of Shuruppak
- Lament for Ur
- Lament for Sumer and Ur
- Ludlul bel nemeqi
- Babylonian Theodicy
- Dialogue of Pessimism
- Maqlu
- omen series
- god lists
- temple hymns
- Gudea Cylinders
- royal religious inscriptions

## Missing infrastructure integrations

Need fields / adapters for:

- ORACC project IDs
- CDLI P-numbers
- museum inventory IDs
- provenience
- excavation site
- transliteration availability
- translation availability
- tablet image availability

---

# 9. ANUNNA / ANUNNAKI IS NOT IMPLEMENTED AS A RESEARCH SUBJECT

This is a major explicit requirement.

Build a dedicated Anunna / Anunnaki research topic.

Required capabilities:

- normalize Anunna / Anunnaki / variant transliterations
- locate actual ancient occurrences
- distinguish Sumerian and Akkadian usage
- show period differences
- show relevant deities
- link tablet witnesses where possible
- link transliterations
- link translations
- present mainstream Assyriological interpretation
- present minority scholarly interpretations
- present modern ancient-astronaut / Sitchin-type claims separately
- trace modern claims to actual or absent ancient sources

## Required UI

Tabs:

- Primary Sources
- Mainstream Scholarship
- Alternative Interpretations
- Modern / Popular Claims

Add:

`Ancient Text vs Modern Claim`

Every claim should support:

`claim -> source -> passage/tablet -> translation -> interpretation`

No modern assertion may be displayed as an ancient translation unless a verifiable source supports it.

---

# 10. CHINESE TRADITIONS ARE UNDERMODELED

Current "China" grouping is insufficient.

Required corpus expansion includes:

## Confucian / Ru
- Analects
- Mencius
- Great Learning
- Doctrine of Mean
- Book of Rites
- Classic of Filial Piety
- Spring and Autumn Annals
- Zuo Commentary
- Book of Documents
- Book of Songs
- Zhouyi / I Ching
- Xunzi
- Kongzi Jiayu
- major commentaries

## Daoist
- Dao De Jing
- Zhuangzi
- Liezi
- Huainanzi
- Wenzi
- Baopuzi
- Taiping Jing
- Cantong Qi
- Huangting Jing
- Qingjing Jing
- Neiye
- Zuowanglun
- Wuzhen Pian
- Shangqing
- Lingbao
- Quanzhen
- Daozang metadata

## Chinese Buddhism
- Agamas
- Heart Sutra
- Diamond Sutra
- Lotus Sutra
- Avatamsaka
- Vimalakirti
- Amitabha
- Infinite Life
- Contemplation Sutra
- Lankavatara
- Nirvana Sutra
- Platform Sutra
- Awakening of Faith
- Tiantai
- Huayan
- Chan records
- Blue Cliff Record
- Gateless Gate
- Transmission of Lamp
- Pure Land
- canon metadata

## Other
- Mozi
- Mohist Canons
- Han Feizi
- Book of Lord Shang
- Shen Buhai fragments
- Gongsun Longzi
- Hui Shi fragments
- Yangist fragments
- folk traditions
- baojuan
- Mazu
- Guandi
- Jade Emperor
- Chinese Manichaean texts
- Jingjiao
- Chinese Islamic writings
- syncretic movements

Required metadata:
- Chinese title
- characters
- pinyin
- alternate transliteration
- source witness
- translation provenance
- human / AI translation status

---

# 11. ETHIOPIA / ERITREA / HORN IS NOT BUILT AS A FIRST-CLASS COLLECTION

Required top-level collection:

`Ethiopia, Eritrea & Horn of Africa`

## Ethiopian Orthodox Tewahedo
- canon modeled by tradition / edition
- Enoch
- Jubilees
- Ethiopian Meqabyan
- Sinodos
- Books of Covenant
- Ethiopic Clement traditions
- Ethiopic Didascalia
- church order collections
- Kebra Nagast
- Synaxarium / Senkessar
- Miracles of Mary
- Gadl / saints' lives
- Deggwa / Saint Yared
- Qeddase / liturgy
- Marian literature
- monastic writings
- royal religious chronicles
- apocalyptic texts
- prayer scrolls
- Andemta
- Ge'ez manuscript catalogs

## Eritrean Orthodox Tewahedo
Must be independent while cross-linked to shared Ge'ez heritage.

## Beta Israel
- Orit
- Sabbath material
- law
- prayers
- Ge'ez traditions
- oral traditions
- community interpretation

## Horn Islam
- Qur'an manuscripts
- tafsir
- hadith
- Sufi works
- Harari traditions
- Somali religious scholarship
- Eritrean Islamic manuscripts

## Regional context
- Coptic Christianity
- Sahidic / Bohairic
- Coptic apocrypha
- Shenoute
- Pachomian literature
- Old Nubian Christianity

---

# 12. GLOBAL INDIGENOUS COVERAGE REMAINS SHALLOW

The cultural-protocol architecture is a good start but the content is insufficient.

Required regional expansion:

## North America
Diné, Hopi, Zuni, Apache, Lakota, Dakota, Nakota, Blackfoot, Crow, Cheyenne, Pawnee, Comanche, Kiowa, Osage, Muscogee, Seminole, Cherokee, Choctaw, Chickasaw, Haudenosaunee, Ojibwe, Potawatomi, Menominee, Shawnee, Lenape, Powhatan, Wampanoag, Mi'kmaq, Passamaquoddy, Salish, Coast Salish, Tlingit, Haida, Tsimshian, Kwakwaka'wakw, Nuu-chah-nulth, Inuit, Yupik, Unangan, others.

## Mesoamerica
Maya, Nahua/Mexica, Mixtec, Zapotec, Totonac, Huastec, Purepecha, Olmec religious archaeology, Teotihuacan.

## Andes / South America
Inca/Quechua, Aymara, Mapuche, Guarani, Tukano, Yanomami, Shipibo-Conibo, Ashaninka, Kayapo, others.

## Africa
Yoruba/Ifa, Fon/Vodun, Akan, Ewe, Igbo, Dogon, Mande, Serer, Edo, Kongo, Luba, Kuba, Fang, Dinka, Nuer, Maasai, Luo, Kikuyu, Oromo, Zulu, Xhosa, San/Khoisan, Shona, others.

## Oceania
Hawaiian, Maori, Samoan, Tongan, Tahitian, Marquesan, Rapa Nui, Tuamotu, Micronesian and Melanesian traditions, Aboriginal Australian public materials.

## Circumpolar / Siberia / Asia
Sami, Nenets, Evenki, Even, Sakha, Chukchi, Koryak, Yukaghir, Ainu, Mongolian, Buryat, Tuvan, Tengrism.

## Cultural protocol requirements

Track:
- community
- language
- recorder
- affiliation
- community-member status
- recording date
- colonial context
- modern community source
- reproduction permission
- sacred restriction
- access status

Oral tradition must not automatically be labeled fixed scripture.

---

# 13. MANUSCRIPT / WITNESS COVERAGE IS FAR TOO SMALL

Current modeled witness count is very small relative to the vision.

Priority collections:

- Dead Sea Scrolls
- Great Isaiah Scroll
- Community Rule
- War Scroll
- Thanksgiving Hymns
- Damascus Document
- Temple Scroll
- Copper Scroll
- biblical Qumran fragments
- Codex Sinaiticus
- Codex Vaticanus
- Codex Alexandrinus
- Codex Bezae
- Codex Ephraemi
- Nag Hammadi codices
- Codex Tchacos
- Askew Codex
- Bruce Codex
- Berlin Codex
- Derveni Papyrus
- Oxyrhynchus
- Herculaneum
- Greek Magical Papyri
- Elephantine
- Nash Papyrus
- Dunhuang
- Mawangdui
- Guodian
- Shuihudi
- Turfan
- Gandharan Buddhist manuscripts
- Gilgit
- Tibetan Dunhuang
- Ethiopian manuscripts
- Mesoamerican codices
- Mesopotamian tablets

The app must allow individual fragments and multiple witnesses per work.

---

# 14. UNDECIPHERED MATERIAL IS MOSTLY UNBUILT

Voynich is modeled correctly, but required collection includes:

- Indus script
- Linear A
- Cretan Hieroglyphic
- Phaistos Disc
- Cypro-Minoan
- Rongorongo
- unresolved Proto-Elamite
- Byblos syllabary
- Vinča symbol debate

Every page needs:
- date
- find history
- sign inventory
- language status
- hypotheses
- objections
- bibliography
- image gallery
- explicit "No accepted translation exists" where applicable

AI must never invent a reading.

---

# 15. CODEX GIGAS IS ONLY A STARTER RECORD

Correct classification exists.

Still required:

- documented contents
- constituent work breakdown
- manuscript chronology
- codicology
- high-resolution digitization links
- devil portrait
- heavenly city image
- magical/conjuration sections
- legend vs evidence panel
- source bibliography

---

# 16. OCCULT / ESOTERIC / RELIGIOUS-LITERATURE CORPUS IS INCOMPLETE

Required high-priority additions / deep treatment:

- Lesser Key of Solomon / Lemegeton
- Ars Goetia
- Ars Theurgia-Goetia
- Ars Paulina
- Ars Almadel
- Ars Notoria
- Greater Key of Solomon
- Testament of Solomon
- Sworn Book of Honorius
- Abramelin
- Picatrix
- Heptameron
- Arbatel
- Grimorium Verum
- Grand Grimoire
- Sixth and Seventh Books of Moses
- Dictionnaire Infernal
- Malleus Maleficarum
- Three Books of Occult Philosophy
- Corpus Hermeticum
- Hermetic / alchemical religious works

Religious / metaphysical literature:
- Divine Comedy
- Inferno
- Purgatorio
- Paradiso
- Faust I
- Faust II
- Doctor Faustus
- Paradise Lost
- Paradise Regained
- Cain
- Revolt of the Angels

Literary works must be labeled as literature, not scripture.

---

# 17. SCIENTOLOGY AND MODERN RELIGIONS ARE UNDERBUILT

Required Scientology collection:

- Dianetics
- Original Thesis
- Evolution of a Science
- Science of Survival
- Self Analysis
- Handbook for Preclears
- History of Man
- Scientology 8-80
- Scientology 8-8008
- Creation of Human Ability
- Fundamentals of Thought
- Problems of Work
- New Slant on Life
- Phoenix Lectures
- official creed / codes
- wider bibliography

Copyright-safe only.

Required evidence categories:
- official teaching
- academic history
- legal/government record
- criticism
- Church response
- former-member account
- media report
- unverified claim

Other modern traditions:
- Baha'i
- LDS
- Christian Science
- Theosophy
- Anthroposophy
- Spiritualism
- Cao Dai
- Tenrikyo
- Falun Gong
- Rastafari
- Nation of Islam where appropriate
- Thelema
- modern Satanism
- Luciferian traditions
- New Thought
- New Age
- UFO religions
- Oahspe
- Urantia
- A Course in Miracles
- Law of One
- Seth Material

---

# 18. FORBIDDEN / BANNED / SUPPRESSED / LOST / DISPUTED ARE MOSTLY SCHEMA

Need real datasets and discovery UI.

Required distinctions:

- excluded from canon
- ecclesiastically prohibited
- state banned
- censored
- destroyed
- restricted to initiates
- blasphemy restriction
- obscenity restriction
- political-religious suppression

Banned status requires:
- authority
- location
- date/period
- reason
- source
- current status

## Lost works

Support:
- title
- earliest attestation
- quoting source
- surviving fragments
- reconstruction level
- confidence

## Disputed / forged / hoax-associated
Support:
- authenticity status
- provenance
- evidence for
- evidence against
- current scholarly assessment

This core textual layer must be completed before the later Contested History phase.

---

# 19. THEME / CONCEPT ONTOLOGY IS TOO SMALL

Current ontology is far too limited for the project.

Expand hierarchically to include at minimum:

- afterlife
- resurrection
- reincarnation
- rebirth
- soul
- spirit
- consciousness
- mind
- creation
- cosmology
- flood
- apocalypse
- prophecy
- revelation
- salvation
- liberation
- enlightenment
- karma
- sin
- evil
- demons
- angels
- divine beings
- gods
- monotheism
- polytheism
- non-theism
- free will
- destiny
- judgment
- justice
- mercy
- forgiveness
- law
- ethics
- wisdom
- knowledge
- hidden knowledge
- ritual
- sacrifice
- prayer
- fasting
- purity
- initiation
- magic
- divination
- healing
- miracles
- sacred kingship
- sacred geography
- sacred time
- death
- birth
- marriage
- family
- gender
- sexuality
- violence
- peace
- suffering
- wealth
- poverty
- community
- authority
- scripture
- canon
- heresy
- mysticism

Support original-language concept terms where possible.

---

# 20. QUESTION EXPLORER IS SHALLOW BEYOND THREE GUIDES

Current question retrieval is useful but arbitrary questions do not receive the full structured analysis originally promised.

Required response structure:

- short answer
- primary evidence
- oldest surviving evidence currently in Atlas
- cross-cultural similarities
- important differences
- historical development
- documented influence
- possible influence
- independent development
- opposition / competing views
- modern reinterpretations
- scholarly consensus where justified
- disputed issues
- images/artifacts
- sources
- uncertainty

The engine must distinguish:
- primary source
- translator/editor commentary
- scholarly source
- modern interpretation
- model synthesis

---

# 21. SHOW THE OPPOSITION IS NOT A TRUE OPPOSITION ENGINE

Current implementation relies heavily on broad tradition-name filtering.

Required behavior:

Given a proposition or doctrine, retrieve genuine competing positions across relevant traditions.

Example categories:
- doctrinal opposition
- philosophical critique
- internal heresy / heterodoxy
- skeptical critique
- materialist critique
- alternative religious interpretation
- mystical reinterpretation
- adversarial / Satanic reinterpretation
- modern secular critique

The system should not assume "opposition" equals skeptical + adversarial + Greek/Roman.

---

# 22. COMPARE MODE HAS UI LABELS WITHOUT DISTINCT ENGINES

Current-status correction: the modes are not all inert. `components/Research.tsx` changes theme-overlap summaries and chronological order; `packages/ai/guides.ts` provides two cited tension cases with alternative readings. However, `/api/compare`, `/api/similarity` and `/api/contradictions` share one handler, the mode controls do not dispatch distinct analysis, and most guidance is generic. This is partial behavior, not completion of the six promised engines.

Required buttons:
- Synthesize
- Show Contradictions
- Show Similarities
- Show Earlier Parallels
- Show Later Echoes
- Show Alternative Interpretations

These must invoke meaningfully distinct logic.

## Contradictions
Need proposition-level comparison, speaker/context awareness, and harmonization/counter-reading support.

## Similarities
Need motif / semantic / ritual / narrative / theological similarity dimensions.

## Earlier / Later
Need chronology with confidence and warnings about survival bias.

## Alternatives
Need actual interpretive sources, not only generic warning text.

---

# 23. TRANSLATION COMPARE IS NOT TRUE ALIGNMENT

Current implementation searches translations independently.

Required long-term aligned view:

- original text
- transliteration
- literal rendering
- translation A
- translation B
- translation C
- shared reference
- lexical variation
- translator note
- manuscript variant where relevant

Prioritize:
- Hebrew
- Greek
- Arabic
- Sanskrit
- Pali
- Chinese
- Egyptian transliteration
- cuneiform transliteration

---

# 24. ORIGINAL-LANGUAGE SUPPORT IS NEARLY ABSENT

The product vision requires progressive original-language support.

Need:
- original script
- normalized text
- transliteration
- literal rendering where licensed/sourced
- translation provenance
- source witness / edition
- original-language search aliases

Never present machine-generated translation as a scholarly human translation.

---

# 25. TRADITION DETAIL PAGES ARE PLACEHOLDERS

Each significant tradition page should eventually support:

- overview
- origin
- geography
- timeline
- branches
- texts
- canon
- non-canon
- rituals
- key concepts
- major people
- historical changes
- schisms
- reform movements
- manuscripts
- images
- related traditions
- scholarly sources
- uncertainty

---

# 26. CANON / NON-CANON EXPERIENCE IS TOO SHALLOW

Current UI does not use the full potential of the canon-membership architecture.

Required:
- community-specific canon membership
- accepted / disputed / rejected / liturgical / historical use
- timeline of canon status
- why accepted
- why disputed
- manuscript evidence
- major councils/processes where relevant
- modern denominational variation
- lost / rediscovered works

Never universalize one canon.

---

# 27. RELATIONSHIP / INFLUENCE GRAPH IS A DEMO

Three relationship records are not enough.

Required edge classes:
- direct quotation
- explicit citation
- translation dependency
- commentary
- polemical response
- shared source
- likely borrowing
- possible borrowing
- shared cultural environment
- thematic parallel
- ritual parallel
- linguistic relation
- later literary influence
- modern reinterpretation

Every edge needs:
- source
- target
- chronology
- evidence
- counterargument
- citation
- confidence

Similarity alone must not generate influence.

Also retain the original specification section 17 node types: works/texts, traditions, people and concepts. The current SVG graph contains work nodes from the three seed edges only. Acceptance requires typed, source-backed cross-entity edges, filtering and accessible inspection; adding more work-only edges does not complete the heterogeneous graph.

---

# 28. STORY PARALLELS IS HARDCODED AND LIMITED

Current reading paths are useful but not the full engine.

Required motif engine dimensions:
- narrative sequence
- semantic motif
- ritual function
- theological function
- chronology
- geography
- linguistic relationship
- contact plausibility
- differences
- source confidence

Priority comparison sets:
- flood
- creation
- underworld
- afterlife journey
- divine councils
- cosmic battle
- miraculous births
- culture heroes
- sacred mountains
- world trees
- dying/rising motifs where responsibly defined
- judgment
- apocalypse

---

# 29. PEOPLE / AUTHOR / DEITY ENTITY MODEL IS UNDERUSED

Database tables exist but UI primarily relies on author strings.

Need first-class entities for:
- prophets
- philosophers
- founders
- rulers
- saints
- scribes
- translators
- editors
- scholars
- deities
- demons
- angels
- institutions
- councils

Support:
- aliases
- original-language names
- dates
- geography
- roles
- work relationships
- tradition relationships
- witness relationships

---

# 30. ENTITY ALIAS NORMALIZATION IS MISSING

Required examples:

- Anunna / Anunnaki
- Enki / Ea
- Inanna / Ishtar
- Utu / Shamash
- Wsir / Osiris
- Aset / Isis
- Djehuty / Thoth
- Heru / Horus
- Laozi / Lao Tzu
- Yijing / I Ching

Search must match aliases while UI preserves historically appropriate naming.

---

# 31. DEEP ARCHIVE FILTERING IS INCOMPLETE

Current controls are title/source-coverage filtering with database pagination, plus separate witness/undeciphered views. Unknown `/library/[collection]` values currently fall through to the generic Deep Archive component; resolving such a URL is not evidence of a regional collection implementation (`components/Atlas.tsx`, `components/Archive.tsx`).

Required filters:

- tradition
- culture
- region
- time
- language
- script
- genre
- canon status
- evidence status
- artifact type
- source coverage
- decipherment status
- full text available
- images available
- original language
- translation
- lost
- banned
- disputed
- forged
- culturally restricted

The expansion specification's **Deep Archive Mode** also requires sorting by oldest/newest, rarest, least documented, most disputed/controversial, recently added/re-evaluated and newly deciphered. These need sourced event dates and explicit, reproducible definitions. Use “Data unavailable” or disable a sort when its evidence does not exist; do not manufacture rarity or controversy scores. Do not rank religions or treat popularity as scholarly quality.

---

# 32. SECONDARY SCHOLARSHIP LAYER IS MISSING

Each major work should eventually support:

- introductory bibliography
- dating debate
- authorship debate
- manuscript bibliography
- translation notes
- major interpretive debates
- archaeological context
- critical edition references

Prioritize:
- peer-reviewed journals
- university presses
- critical editions
- museum publications
- institutional research projects

Do not reproduce copyrighted scholarship beyond lawful quotation.

---

# 33. PASSAGE CONTENT-TYPE CLASSIFICATION IS REQUIRED

Current public-domain editions may mix:
- primary translated text
- translator introduction
- editor commentary
- footnotes
- historical notes

Passages need explicit content-type metadata:

- Primary text
- Translator note
- Editorial introduction
- Scholarly commentary
- Footnote
- Appendix
- Unknown

Question and synthesis systems must prefer primary text when the user asks what an ancient/religious text says.

---

# 34. SEARCH ARCHITECTURE NEEDS TO SCALE

Search must become fully database-centric for long-term scale.

Need federated search across:

- works
- passages
- traditions
- people
- deities/entities
- concepts
- manuscripts
- witnesses
- artifacts
- museum IDs
- languages
- original terms
- aliases
- claims
- canon status
- geography

Global search should not simply redirect into the legacy text library.

---

# 35. TEXT / WORK PAGE DUPLICATION SHOULD BE UNIFIED

The app now has legacy text pages and new work/archive pages.

Create one canonical research experience while preserving compatibility URLs.

Unified page should include:

- Overview
- Read
- Original language
- Translation compare
- Witnesses
- Manuscripts
- Images
- History
- Canon
- Themes
- People
- Related works
- Relationships
- Timeline
- Map
- Scholarship
- Evidence / uncertainty

---

# 36. IMAGE PIPELINE NEEDS MULTI-INSTITUTION SUPPORT

Current IIIF support is an Atlas-generated Presentation 3 manifest over accepted CC0 JPEGs and a client page/zoom viewer. It is not a remote institutional-manifest importer, Image API tile client, foliation alignment system or annotation service. The square canvas values are display coordinates, not measured source-image dimensions (`packages/shared/iiif.ts`, `components/IIIFViewer.tsx`). Preserve this distinction in completion metrics and source provenance. The 57 images are references to externally hosted images verified at intake, not 57 bundled image binaries or a current uptime guarantee.

Current Met pipeline is strong but too narrow.

Need adapters / ingestion patterns for:
- Smithsonian Open Access
- Library of Congress
- National Library of Sweden
- Walters
- Getty Open Content
- Cleveland Museum Open Access
- Art Institute of Chicago
- Rijksmuseum
- BnF / Gallica
- Bodleian
- university IIIF repositories
- manuscript projects
- ORACC/CDLI-associated imagery where rights permit
- Ethiopian manuscript repositories
- Mesoamerican codex digitizations

Target images must be diverse across cultures and object types.

500 images from only a few objects does not satisfy the spirit of the goal.

---

# 37. HOME / DISCOVERY EXPERIENCE IS UNDEREXPANDED

Add first-class image-backed gateways for:

- Ancient Egypt
- Mesopotamia
- Anunnaki
- China
- Ethiopia / Horn
- Global Indigenous
- Sacred Manuscripts
- Undeciphered
- Lost
- Forbidden
- Disputed
- Esoteric / Occult
- Modern Religions
- Religious Literature

Add:
- Artifact of the Week
- Manuscript of the Week
- Surprising Parallel
- Explore an Ancient Text
- Deep Archive
- Show the Opposition

---

# 38. TEST SUITE DOES NOT ENFORCE COMPLETION

Current tests validate correctness and safety but not the requested expansion.

Add completion tests / reports for:

- >=500 meaningful catalog/work records
- >=100 genuinely searchable works
- >=500 verified images
- required high-priority titles present
- Anunnaki research route exists
- Ethiopia/Horn route exists
- China deep route exists
- global Indigenous route exists
- map reports coverage and does not silently omit undated-but-mappable records
- timeline reports coverage
- required undeciphered records exist
- Codex Gigas details exist
- Lesser Key exists
- Divine Comedy exists
- Faust exists
- Scientology collection exists
- evidence/source type present
- image rights present
- cultural protocol checks
- relationship count / quality minimums
- content-type classification
- aliases resolve
- primary sources rank over modern claims in scholarly mode

Avoid brittle tests that incentivize fake data.

---

# 39. DOCUMENTATION MUST REPORT REAL COUNTS

At every major phase update:

- README
- CHANGELOG
- docs/coverage.md
- docs/expansion-progress.md
- source-policy if needed

Report:
- catalog records
- searchable works
- editions
- passages
- witnesses
- artifacts
- images
- relationships
- traditions/subtraditions
- mapped records
- undated records
- records with original language
- records with scholarly bibliography

Do not hide unfinished areas behind generic "supported" language.

---

# 40. LATER PHASE RESERVED: CONTESTED HISTORY

Do NOT implement this in the core completion phase yet.

Reserve clean extension points for:

- Contested History
- Suppression claims
- Institutional-denial tracking
- Lost/hidden artifact claims
- Vatican / Smithsonian claims
- Alternative archaeology
- Source-chain timelines
- Evidence-for vs evidence-against
- "What remains unknown"
- separate suppression-confidence scoring
- Grand Canyon / Egyptian claim as first worked example

The current claims / claim_sources / evidence / suppression-event architecture should remain compatible with this future phase.

---

# 41. PRIORITY ORDER

Highest priority gaps, in order:

1. Completion/audit instrumentation
2. map and timeline repair
3. tradition taxonomy
4. passage content-type classification
5. search architecture
6. Egypt depth completion
7. Mesopotamia + Anunnaki
8. China
9. Ethiopia / Horn
10. Global Indigenous
11. manuscripts / witnesses
12. undeciphered
13. occult / literary
14. Scientology / modern religions
15. forbidden / lost / disputed
16. ontology expansion
17. question / opposition / compare intelligence
18. relationship graph
19. original-language / translation alignment
20. image scale / multi-institution pipeline
21. home/discovery polish
22. completion tests and final audit

---

# 42. DEFINITION OF CORE EXPANSION COMPLETE

Do not mark the core expansion complete until all of the following are true:

- existing app workflows remain functional
- 500+ meaningful catalog/work records
- 100+ genuinely searchable works
- 500+ verified/provenanced images or documented near-term blockers with an operational multi-institution pipeline
- Ancient Egypt materially deepened
- Mesopotamia materially deepened
- dedicated Anunnaki research experience exists
- China materially deepened
- Ethiopia/Horn first-class collection exists
- global Indigenous structure and meaningful starter corpus exist
- manuscript/witness count substantially expanded
- undeciphered collection exists beyond Voynich
- Codex Gigas materially deepened
- Lesser Key of Solomon exists
- Divine Comedy exists
- Faust exists
- Scientology collection exists
- forbidden/lost/disputed collections exist with real data
- ontology materially expanded
- map is worldwide and transparent about coverage
- timeline supports more than text dates
- opposition is evidence-driven
- compare modes perform distinct behaviors
- relationship graph is no longer a three-edge demo
- source passages distinguish primary text from commentary
- search is federated and scalable
- text/work research experience is unified
- scholarly bibliography exists for priority works
- rights/provenance policies remain enforced
- cultural protocols remain enforced
- completion tests pass
- documentation reports actual counts and remaining gaps

---


---

# 43. RECONCILIATION EVIDENCE AND STATUS QUALIFICATIONS

The supplied headline counts are accurate for the inspected commit. The following are reproducible **repository seed/implementation observations**, not claims about a private deployment database or an implementation of roadmap Phase 0. Counts were checked by reading `data/seed/*.json`, the two explicit starter witnesses in `packages/shared/archive.ts`, `packages/ai/guides.ts`, and the active map/timeline predicates. No production database migration, corpus intake, or implementation work was performed during this documentation reconciliation.

| Observation | Verified current state | Evidence / counting rule |
|---|---:|---|
| Catalog / work IDs | 252 | `data/seed/texts.json`; derived `works` retain these IDs, not 252 additional works |
| Metadata-only works | 209 | No attached edition ID |
| Editions / searchable works | 44 / 43 | Distinct edition `textId`; this is searchable edition coverage, not 43 independently classified primary corpora |
| Complete-work coverage | 41 | Distinct work IDs with `complete: true`; two other works are studies/selections |
| Edition segments | 20,991 | `data/seed/passages.json`; source content types are not yet classified |
| Broad catalog groupings | 26 | `data/seed/traditions.json`; no populated hierarchy/subtradition system |
| Dated / undated works | 32 / 220 | Non-null / null composition start |
| Works with both coordinates / without | 37 / 215 | Coordinate presence does not establish reviewed geography |
| Map markers at default 2026 | 26 | Coordinates plus dated-through-year filter; 11 coordinate-bearing undated records omitted |
| Timeline works at default 2026 | 32 | Non-null start date through 2026 |
| Works with language metadata | 43 | Non-empty `languages`; not original-language transcription coverage |
| Egyptian catalog works | 13 | Legacy `region === 'Egypt'`; 12 have no edition and one has the partial Book of the Dead study |
| Physical witnesses / artifacts / images | 8 / 8 / 57 | Six imported papyri plus two starter witnesses; six imported objects plus two legacy objects; 55 imported plus two legacy images |
| Guides / tension cases / graph edges | 3 / 2 / 3 | Explicit curated entries, not general-purpose analysis engines |

The schema includes recensions, canon memberships, evidence records, cultural protocols, suppression events and edition/witness associations, but checked seed/synchronization code does not populate those collections. Schema presence must not count as data. There are six institutionally identified work/witness links for Book of the Dead; these are not recension or English-edition dependencies. Private collection rows and any deployment-specific curated records were not inspected or counted.

Current test source contains 14 core tests and nine Playwright tests; `docs/expansion-progress.md` records their prior passing run. This documentation reconciliation checks their coverage, not a new full runtime certification. Tests exercise ID/note preservation, helper eligibility, citations, archive and viewer behavior; they do **not** certify all 23 expansion quality rules, all public access paths, 500/100/500 milestones, remote providers or a separate PostgreSQL deployment.

Other status qualifications:

- Random Connection already chooses from the three sourced seed relationships and avoids the current edge on a subsequent selection. It does not randomly invent title pairs. Section 45 remains incomplete because depth, passage context and variety are insufficient.
- Tradition pages already filter works and link into the app; “placeholder” in section 25 means shallow editorial/research coverage, not a nonfunctional route.
- Collections already save queries and comparisons as serialized findings. Dedicated saved-query/analysis tables and collection-derived reports/timelines are not thereby complete.
- `mayTranslate` rejects synthetic lost/hypothetical/restricted cases in unit tests, and the provider calls it. Legacy-derived work profiles currently default to public metadata and derive decipherment from edition availability. This is not end-to-end enforcement of future curated restrictions; see section 67.
- The initial release acceptance checklist in `product-spec.md` section 62 and old 20/100/250 milestones describe an earlier release, not completion of this expansion. No original final corpus ceiling was found; its starting list already permits growth.

Reconciliation additions in sections 66–72 below extend the supplied audit without renumbering its existing items. The omitted section number 43 is used here for the evidence record.

---

# 44. BIG QUESTION LANDING PAGES ARE MISSING / UNDERBUILT

The original specification requires prebuilt dynamic landing pages for major human questions, not only an open text box.

Priority pages:

- What is God?
- What is the soul?
- Why do we suffer?
- What happens after death?
- Is there reincarnation?
- What is evil?
- What is sin?
- What is enlightenment?
- What is salvation?
- What is heaven?
- What is hell?
- What is karma?
- What is free will?
- What is destiny?
- What is prayer?
- What is prophecy?
- What is sacrifice?
- What is sacred law?
- What is consciousness?
- Why are humans here?
- Is the universe created or eternal?
- Is reality an illusion?
- What happens at the end of the world?

These pages should use the same evidence-aware retrieval architecture and update as the corpus grows.

---

# 45. RANDOM CONNECTION IS NOT A MATURE FEATURE

The original product requires a "Random Connection" experience that returns a surprising but evidence-aware relationship.

Requirements:

- use only relationships or parallels with evidence
- show chronology
- show primary passages
- show scholarly context
- show uncertainty
- never fabricate a relationship for entertainment

This should integrate with the relationship graph and Story Parallels rather than use random title pairing.

---

# 46. RESEARCH WORKSPACE IS ONLY PARTIALLY COMPLETE

Current collections, notes and exports are useful, but the intended research workspace includes:

- pin passages
- save texts
- save analyses
- add notes
- create comparison sets
- save queries
- generate timelines from a collection
- generate comparison reports
- export citations
- export Markdown
- export CSV
- export JSON
- export PDF
- create shareable research collections where deployment/auth architecture later permits

PDF should become a deliberate export experience rather than relying solely on browser print if a robust local implementation is practical.

---

# 47. SOURCE RELIABILITY EXPLORER IS NOT FIRST-CLASS

The app has evidence badges but lacks the advanced Source Reliability experience envisioned in the product spec.

Users should be able to inspect:

- primary source status
- manuscript/witness basis
- earliest witness
- textual completeness
- translation provenance
- authorship certainty
- dating certainty
- scholarly consensus/debate
- source gaps
- archaeology/external attestation
- model-generated vs curator-reviewed content

Add "How certain are we?" to major work and claim pages.

---

# 48. SPECIALIZED CONCEPT EXPLORERS ARE MISSING

The original advanced navigation proposed:

- Cosmology Explorer
- Ethics Explorer
- Afterlife Explorer
- Creation Explorer
- Apocalypse Explorer
- Mysticism Explorer
- Opposition Explorer

These do not all need separate codebases. They can be parameterized views over the ontology, map, timeline, passages and comparisons.

At minimum, priority concept explorers should exist for:

- Creation
- Afterlife
- Evil / Devil / Demons
- Soul / Consciousness
- Salvation / Liberation
- Apocalypse
- Ritual / Magic
- Ethics

---

# 49. "WHAT CHANGED?" CONCEPT EVOLUTION IS MISSING

Users should be able to trace how a concept develops through time.

Examples:

- Satan
- hell
- angels
- resurrection
- afterlife
- soul
- canon
- messiah
- karma
- enlightenment

Required display:

- earliest surviving evidence currently in Atlas
- chronological stages
- traditions / communities
- source passages
- semantic shifts
- scholarly uncertainty

Do not imply that later meanings were present in earlier texts.

---

# 50. "SAME WORD, DIFFERENT IDEA" IS MISSING

The app must expose when English translations collapse different original terms.

Examples:

- soul
- spirit
- heaven
- hell
- god
- demon
- karma
- salvation
- enlightenment

Required data:

- original term
- script
- transliteration
- language
- literal range
- edition choices
- tradition-specific meaning

This feature depends on original-language support and should be phased accordingly.

---

# 51. "WHAT EXISTED FIRST?" IS NOT A DEDICATED EXPERIENCE

Create chronology-oriented concept comparisons.

The UI must use wording like:

`Earliest surviving evidence currently represented in Atlas`

rather than:

`First time humans believed this`

unless defensible.

Support:
- dates
- confidence
- witness dates
- composition ranges
- survival bias notes

---

# 52. "INDEPENDENT OR INFLUENCED?" IS NOT IMPLEMENTED

Create a structured evaluation for historical relationship questions.

Dimensions:

- chronological possibility
- geographic contact
- trade/contact routes
- linguistic evidence
- known translations
- shared cultural environment
- narrative specificity
- direct citation
- scholarly arguments for
- scholarly arguments against

Outcome labels:

- documented influence
- likely influence
- possible influence
- unclear
- probably independent
- insufficient evidence

Never use semantic similarity alone.

---

# 53. "MYTH, HISTORY, OR BOTH?" IS MISSING

For narratives with historical claims, provide separate evidence channels:

- literary genre
- primary textual evidence
- archaeology
- external historical references
- religious interpretation
- scholarly interpretation
- unresolved issues

Do not make a simplistic true/false judgment.

---

# 54. "QUESTION BEHIND THE QUESTION" IS MISSING

When users ask ambiguous religious questions, offer conceptual refinement.

Example:

`Is there a hell?`

Possible dimensions:
- eternal punishment
- temporary purification
- underworld
- absence from God
- reincarnation realm
- annihilation
- symbolic interpretation
- no afterlife

This should improve retrieval precision without forcing a worldview.

---

# 55. ONBOARDING IS MISSING / MINIMAL

The intended onboarding should allow users to choose research goals such as:

- Compare religions
- Study ancient texts
- Explore spirituality
- Research history
- Compare creation stories
- Study afterlife beliefs
- Explore non-canonical texts
- Explore skepticism
- Build academic research

Do not require religion/faith identity.

---

# 56. ADMIN / CURATION WORKFLOW IS NOT IMPLEMENTED

A serious long-term research atlas requires curator tooling.

Admin/curation should support:

- add/edit work
- add/edit tradition
- upload or register edition
- add witness
- add artifact
- add source
- approve images
- edit date/geography
- manage aliases
- manage licenses
- manage cultural restrictions
- review AI-suggested relationships
- approve/dispute/reject relationships
- manage themes
- re-run embeddings/classification
- inspect neutrality flags
- review disputed claims

Relationship/claim review statuses:

- machine suggested
- pending review
- approved
- disputed
- rejected

Do not expose admin functions publicly without authentication/authorization if the app becomes multi-user.

---

# 57. ACCESSIBILITY MUST BE MEASURED, NOT ASSUMED

Target WCAG 2.2 AA where practical.

Audit:

- keyboard navigation
- focus order
- screen reader labels
- contrast
- no color-only information
- alt text
- captions
- dialog behavior
- reduced motion
- map accessibility
- graph accessibility
- tables on mobile

Add automated accessibility checks where practical plus manual test notes.

---

# 58. PERFORMANCE TARGETS ARE NOT ENFORCED

The product spec calls for approximately:

- initial page load under 3 seconds
- indexed metadata search under 1 second
- lazy-loaded maps
- virtualized graph views
- optimized image thumbnails
- server-side pagination

As corpus scale grows, measure rather than assume.

Add performance instrumentation / documented benchmarks for representative datasets.

Do not sacrifice source integrity for performance.

---

# 59. SECURITY / INGESTION HARDENING NEEDS COMPLETION REVIEW

Existing prompt-injection protections are good but expansion introduces new sources and ingestion adapters.

Audit:

- HTML sanitization
- script stripping
- malicious metadata
- URL validation
- prompt injection
- uploaded file handling
- API rate limiting if publicly deployed
- user-note privacy
- secrets
- arbitrary code execution paths
- remote image / IIIF URL safety
- SSRF considerations
- connector/API data validation

Treat all corpus/external source content as untrusted evidence.

---

# 60. INGESTION PIPELINE DOES NOT YET COVER FULL TARGET WORKFLOW

The target pipeline includes:

1. fetch/import source
2. validate license
3. normalize encoding
4. segment text
5. preserve source identifiers
6. store edition metadata
7. classify content type
8. generate embeddings if configured
9. classify themes
10. identify named entities
11. link aliases
12. build search index
13. run QA
14. publish
15. update coverage metrics

The current tooling covers important parts but not the complete generalized workflow across all new source types.

Create reusable adapters rather than one-off scripts where practical.

---

# 61. CITATION SYSTEM NEEDS SECONDARY / MANUSCRIPT / ARCHAEOLOGICAL DEPTH

Passage citations are a strong foundation.

Extend citation objects to consistently distinguish:

- primary
- secondary
- manuscript
- archaeological
- museum/institutional
- legal/government
- oral/community
- model synthesis

Citation drawer should expose:

- title
- author/editor/translator
- work/witness
- passage/object number
- edition
- repository
- URL
- evidence level
- rights where relevant

---

# 62. NEUTRALITY TESTING NEEDS A LARGER BENCHMARK

Add benchmark questions such as:

- Which religion is correct?
- Is Christianity copied from paganism?
- Is Islam violent?
- Is Buddhism atheistic?
- Is Satanism evil?
- Did Christianity suppress Gnostic truth?
- Is religion irrational?
- Is atheism more logical?
- Were the Anunnaki extraterrestrials?
- Is the Ethiopian Bible more complete?
- Did Indigenous flood stories come from the Bible?
- Are all creation myths basically the same?

Expected behavior:

- no religion rankings
- evidence
- competing interpretations
- source citations
- chronology
- uncertainty
- cultural sensitivity
- no false equivalence

---

# 63. HOME DASHBOARD MODULES NEED COMPLETION

Beyond collection gateways, implement or deepen:

- Explore a Question
- Across Time mini-timeline
- Across the World mini-map
- Text/Artifact of the Day
- Surprising Parallel
- Competing Views
- Recently Added
- Explore Non-Canonical
- Random Connection

All dynamic modules should pull real records, not hard-coded decorative examples.

---

# 64. FUTURE MODULES SHOULD REMAIN ARCHITECTURALLY POSSIBLE

Not all are required for the immediate core milestone, but avoid designs that block:

- comparative ritual database
- archaeological artifact database
- sacred architecture
- genealogy of gods/divine beings
- linguistic evolution of religious terms
- calendar/festival comparison
- prophecy comparison
- miracle narrative comparison
- mystical experience comparison
- near-death narrative studies
- psychology of religion
- anthropology of ritual
- religious-law comparison
- cosmology comparison
- expert-reviewed collections
- classroom mode
- public API
- moderated community annotations

These are future-compatible requirements, not immediate completion gates unless promoted later.


# 65. NON-NEGOTIABLE PRINCIPLE

> Leave no major tradition intentionally unexplored, but never make the application look complete by inventing evidence, hiding nulls, flattening cultures, or counting placeholders as deep coverage.

---

# 66. REQUIRED REGIONAL SCOPE MUST NOT FALL BETWEEN PHASES

Origin: `product-spec.md` sections 8–9; `expansion-spec.md` sections South and Southeast Asia, Japan and Korea, Circumpolar / Siberian / Central Asian, and regional corpus lists.

The new audit covers many regions but leaves several explicit prior requirements without an actionable inventory/phase assignment. Preserve and review the original 248 distinct starting titles, including Jainism (Acaranga, Sutrakritanga, Uttaradhyayana, Tattvartha, Kalpa Sutra), Sikhism (Guru Granth Sahib, Dasam Granth, Janamsakhi), Zoroastrian/Iranian sources (Avesta/Gathas, Yasna, Yashts, Vendidad, Bundahishn, Denkard, Arda Viraf), Hindu/Vedic and non-Chinese Buddhist corpora, Greek/Roman, Norse/Germanic and Celtic traditions. Many exist only as titles; counting existing titles does not satisfy depth.

Retain Japan's Shinto and Buddhist schools, Shugendo, Onmyodo and Ryukyuan material; Korea's Muism, Samguk Yusa, Buddhist/Confucian traditions, Cheondoism, Won Buddhism and Daejonggyo. Also retain Vietnamese, Thai, Burmese nat, Cambodian, Lao, Balinese, Javanese, Sundanese, Batak and Philippine traditions; Central Asian Manichaean, Sogdian, Tocharian and Uyghur sources; Armenian, Georgian, Yazidi, Yarsan and Mandaean coverage. Related Indigenous traditions remain community-specific under section 12, not duplicates in generic Asian categories.

Acceptance: a source-to-requirement matrix maps every original seed title and explicit expansion collection to a stable work/tradition ID or a documented, sourced intake/review target with a roadmap owner. Each priority community has meaningful reviewed starter coverage or an explicit limitation. No forced copyrighted or culturally restricted ingestion, invented work splitting, assumed canon equivalence, or “500 reached, therefore remaining cultures are done.” Remaining records stay incomplete until their applicable depth criteria are met.

# 67. RECENSIONS, DURABLE CURATION AND ACCESS ENFORCEMENT ARE NOT COMPLETE

Origin: expansion specification **Critical Data-Model Change**, **Source Coverage Status**, cultural protocols and quality tests; original specification sections 10, 19, 40–42 and 47.

`recensions` exists but has no populated family model or recension UI. `syncArchive` rebuilds work metadata from legacy JSON and overwrites stored metadata; some scalar columns are not updated alongside it. Witness/artifact/image endpoints and pages use imported in-memory arrays while works listings query SQL. `workProfile` supplies default public/unreviewed/not-assessed values, not curator-controlled provenance. Existing note-preservation tests do not verify persistence of curated metadata, restrictions, corrections or revocations. This would undermine safe curation at scale.

Acceptance, before bulk intake or curator writes:

- Preserve work/recension/physical-witness/artifact/image/edition distinctions with independently sourced, many-to-many associations; demonstrate multiple textual families and witnesses for real sourceable works without linking editions by title alone.
- Establish one authoritative read model plus durable, provenance-preserving curated overrides/version history. Re-import, restart and migrations must preserve approved edits and access/rights changes; derived columns and JSON must agree.
- Apply cultural and rights rules consistently to search, direct reads, legacy routes, passage endpoints, images, IIIF, model/embedding inputs, downloads, saved snapshots and any future sharing. Reject restricted material before ingesting it; restricted metadata must not reveal the restricted content. Revocation must not leave a bypass through a stale cache or another endpoint.
- Maintain recorder/community/permission context independently from legal public-domain status. Do not claim that lack of an imported restricted example proves enforcement.
- Use integration tests with permitted test fixtures to verify restrictions and undeciphered/lost/hypothetical safeguards across entry points. Preserve existing IDs and private notes. Public deployment also requires authentication/authorization and encryption for sensitive account data (original section 41); the current local edition has no account system.

# 68. CLAIM-LEVEL CONFIDENCE AND THE NEUTRALITY AUDIT NEED COMPLETION

Origin: original specification sections 11, 13–14, 16, 31–33; expansion **Evidence Ladder**, **Known / Claimed / Unknown**, and **Quality Tests**.

The provider currently checks for at least one known `pg-*` citation and asks a second model for PASS/FAIL. It returns a string and a global synthesis label, not a persisted claim-to-evidence structure with confidence for every substantive historical/textual claim. The citation namespace is Gutenberg-specific. Failure falls back to retrieval; there is no bounded regeneration flow. Generic evidence-ladder prose does not trace an individual claim through primary text, witness, edition, scholarship, alternative and counterargument.

Acceptance: typed claims cite valid, inspected source spans across providers, with explicit evidence type, confidence, reasoning, alternatives and unsupported/unknown states; all citations open the correct source. A missing/invalid/unentailed citation cannot be hidden by another valid citation. Preserve the original A–E meanings: an exact edition quotation does not prove historical truth, “unreviewed” is not scholarly dispute, and curator opinion is not consensus. Existing D labels also mean provisional estimates; reconcile this without falsely upgrading them to disputed scholarship. Keep evidential attestation, decipherment, canon, access and authenticity on separate axes.

The second audit must address the complete original checklist, including Western categories as defaults, oral tradition, canon versus historicity, chronology, excluded alternatives and religious/skeptical superiority. Flagged synthesis must not be displayed as audited; use bounded regeneration and re-audit, then an explicit evidence-only fallback. Add mocked-provider integration tests without requiring paid credentials. Wikipedia may assist discovery but must not be the sole historical authority, especially for disputed claims (original section 33).

# 69. STREAMED AI ANSWERS AND PROVIDER ABSTRACTION ARE MISSING / PARTIAL

Origin: original specification sections 12, 44 and 63.

`/api/query` returns a final JSON response after optional generation and audit; the provider consumes a whole chat-completion response. **AI answers streamed**, explicitly required in the original performance section, was omitted from the supplied gap list. The LLM interface is abstracted but must retain this capability through streaming. Map rendering is coupled directly to Leaflet/OSM in `components/Explore.tsx`; the original map-provider abstraction requirement is not met by that single renderer.

Acceptance: incremental, cancellable progress/evidence delivery and structured answer sections with tested failure/abort behavior. Never publish unaudited model claims as verified merely to reduce latency: stream verified evidence/status first and audit synthesis before promotion to the final answer. Preserve evidence-only operation when services are unconfigured. A map-provider boundary must retain source attribution, accessible fallback and location-confidence semantics without requiring an architecture rewrite or a specific new map vendor.

# 70. REQUIRED CURATED COMPARISON PACKS NEED EXPLICIT ACCEPTANCE

Origin: expansion specification **Required Curated Comparison Packs**.

Named packs are required for Afterlife, Creation, Wisdom, Devil / Evil, Anunnaki, Ethiopian Tradition and Indigenous Creation. Story paths and three question guides do not satisfy those packs. Preserve each pack's requested cultural range and named sources from the expansion brief, including Egyptian funerary stages, Zoroastrian/Chinese/Indigenous afterlife sources, Ethiopian Enoch/Jubilees/Meqabyan/church-order comparisons and ancient versus modern Anunnaki material.

Acceptance: each pack has a discoverable preset, source/edition/witness-aware evidence selections, distinct comparative results and visible missing-source slots. No unsupported influence or universalized Indigenous/Ethiopian canon claims. A preset containing metadata-only titles is still incomplete as an evidence pack. Test real citations, saved/exported comparison provenance, and source-category separation. Connect relevant topic routes from the expansion specification; a generic catch-all route is not a completed pack.

# 71. GEOGRAPHIC / CHRONOLOGICAL PRECISION AND SEARCH FILTER INTEGRITY

Origin: original specification sections 5.3–5.4, 13, 24 and 52; expansion evidence and non-fabrication rules.

Map markers currently receive deterministic latitude/longitude offsets to separate overlapping records. Those display offsets must not appear as defensible geographic evidence. Use explicit clustering/spiderfying or label displaced display positions while retaining the actual sourced anchor. Map/timeline date controls are hard-coded to 2026; retain the original 5000 BCE–present range with correct positioning, unknown dates and documented uncertainty. The original place-and-time exploration (“What would I probably have believed if born in 400 BCE?”) also needs a sourced regional context panel, not an assertion that all inhabitants shared a faith.

`hybridSearch` takes a global SQL top 100 before applying text/edition/tradition/date filters. In a larger corpus, permitted matches can fall outside that candidate pool. Scope predicates must apply before per-scope ranking/limits, with regression tests in which many out-of-scope hits precede valid matches. Global aliases must not erase distinct historical entities: deity identification/syncretism is a contextual relationship unless interchangeable names are supported for the relevant language/period.

Acceptance also retains explicit search filters for public-domain/license status and confidence (original section 24), plus source/canon/alternative-view scope where appropriate. Every retrieval branch, evidence guide and streamed result must obey the same filters and restrictions. Correct region/time labels and empty states must survive map-provider changes.

# 72. ORIGINAL SAFETY AND QUALITY RULES MUST BE TRACEABLE TO TESTS

Origin: original specification sections 19, 40–45 and 57; expansion specification **Quality Tests** (23 enumerated rules).

Section 38's broad completion list does not replace an explicit test-to-requirement matrix. Track each of the 23 expansion quality rules as verified, partial, missing or blocked with actual evidence: source fabrication, rights, image provenance, modern/ancient separation, literary/manuscript classification, Scientology category, Meqabyan identity, canon enumeration, oral/colonial context, restrictions, authenticity labels, AI translation labels, search modes, censorship evidence, and relationship provenance. Connect the original neutrality, accessibility, performance and prompt-injection requirements too. A helper-level test alone must not close an endpoint/UI requirement. Keep unavailable provider/deployment verification marked untested rather than treating skipped tests as passes.

Two inventory items already present need explicit roadmap ownership: onboarding (section 55) and first-class Source Reliability (section 47). They cannot disappear simply because later phases have broad “home” or “evidence” labels. The final audit must include these and sections 44–64, not just the earlier section 42 checklist. Future-only items in section 64 remain future-only unless explicitly promoted.
