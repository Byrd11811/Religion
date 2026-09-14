# Atlas Comprehensive Missing-Dimensions Audit

## Purpose

This report audits the current Atlas vision for **conceptual, methodological, evidentiary, cultural, geographic, and technical dimensions that remain materially under-specified even after the existing completion audit/roadmap and the new Religion–Power–Conflict–Esotericism addendum**.

The central finding is that Atlas has become much broader than a sacred-text library, but its planning still inherits a **text-first data model**. The next major leap is to model religion not only as texts and ideas, but as **lived systems of practice, experience, community, institutions, objects, places, bodies, calendars, performances, transmission, memory, and change**.

No research process can prove literal 100% completeness in an open-ended field spanning every culture and time period. However, this audit uses multiple independent frameworks—comparative religion, anthropology, intangible-heritage studies, manuscript studies, museum/heritage standards, historical geography, Indigenous data governance, lived-religion scholarship, digital religion, and current global-religion research—to reach **category saturation**: another search may add examples or individual traditions, but is unlikely to reveal an entirely new major class of requirement without moving outside the stated Atlas mission.

---

# I. THE SINGLE BIGGEST GAP: RELIGION AS LIVED PRACTICE

Atlas is strong on works, editions, passages, claims, manuscripts, images, and comparison. It is materially weaker on what people **do** with religion.

Comparative-religion frameworks commonly distinguish ritual/practice, experience, narrative, doctrine/philosophy, ethics/law, social/institutional life, and material culture rather than reducing religion to belief or scripture. Lived-religion scholarship similarly emphasizes ordinary practice in homes, workplaces, neighborhoods, bodies, healing, food, material objects, and mixed or locally specific forms of spirituality.[1][2][3]

### Required architectural consequence

Create first-class entities—not merely theme tags—for:

- practices / rituals
- recurring observances
- festivals
- rites of passage
- pilgrimages
- religious offices / ritual specialists
- institutions
- sacred places / landscapes
- sacred and ritual objects
- performances
- oral traditions / performance versions
- experiences / testimony
- legal/customary practices
- transmission lineages
- communities / congregations / orders

A tradition profile should not be considered deep merely because it has many texts.

---

# II. A RELIGION-COVERAGE COMPLETENESS MATRIX

Atlas needs a **coverage audit by dimensions of religious life**, separate from its corpus-count metrics.

For every tradition/community, measure whether Atlas has meaningful sourced coverage for:

1. Narrative / myth / oral history
2. Doctrine / philosophy / cosmology
3. Ritual / practice
4. Religious / mystical / visionary experience
5. Ethics / law / taboo
6. Social / institutional organization
7. Material / sensory culture
8. Historical development / political context
9. Sacred geography / ecology
10. Transmission / education / lineage
11. Internal diversity / branches / disagreement
12. Living practice, where applicable

This is a **coverage completeness score**, not a truth score or ranking of religions.

It would directly prevent the problem already discovered in the current corpus: a tradition can appear “present” because metadata or a famous text exists even though most of its actual religious life is absent.

---

# III. RITES OF PASSAGE AND THE HUMAN LIFE CYCLE

The current roadmap does not treat life-cycle religion as a first-class domain.

UNESCO’s treatment of intangible heritage explicitly includes birth, naming, initiation, marriage, funeral, kinship, gender-specific practices, seasonal ceremonies, and customary legal practices.[4]

Atlas should model:

- birth rites
- naming
- coming of age / initiation
- marriage
- celibacy / ordination
- pregnancy and fertility rites
- death
- burial / cremation / exposure / secondary burial
- mourning
- ancestor transition
- memorialization

This should connect directly to the existing Afterlife Explorer, because **belief about death and actual funerary practice are not the same thing**.

---

# IV. FESTIVALS, SACRED CALENDARS, AND CYCLICAL TIME

The current audit mentions calendar/festival comparison only as a future possibility. That is too shallow.

Religions organize time through:

- feast days
- fasts
- agricultural cycles
- lunar/solar calendars
- holy months
- sabbaths / rest days
- pilgrimage seasons
- ancestor days
- new-year rituals
- liturgical cycles
- regnal/dynastic calendars
- eschatological time

UNESCO emphasizes seasonal and agricultural ritual cycles as central forms of living heritage.[4][5]

### Required model

Support both:

- **historical date/time**
- **recurring sacred/liturgical time**

Do not force every religious event into a one-time Gregorian date.

---

# V. MULTIPLE CALENDARS AND LOCAL PERIODIZATION

Atlas currently relies heavily on BCE/CE-style historical dates. It should preserve original dating systems where possible.

World Historical Gazetteer models original dating systems alongside normalized chronology, and PeriodO exists specifically because scholarly historical periods differ by source, geography, and disciplinary convention.[6][7]

Atlas should support:

- BCE / CE
- Islamic AH
- Hebrew calendar
- Buddhist era systems
- Hindu calendrical systems
- Chinese dynastic/regnal eras
- Japanese era names
- Maya calendrical systems
- regnal years
- archaeological periods
- local/Indigenous seasonal systems where appropriate

A normalized date is useful for comparison, but the **source’s own chronology should not disappear**.

---

# VI. MYTHIC TIME VS HISTORICAL TIME

This is a critical integrity gap.

Atlas needs to distinguish:

- date a source was composed
- date of earliest surviving witness
- date a tradition claims an event occurred
- mythic / primordial time
- eschatological future time
- modern scholarly historical estimate

A creation story, divine battle, flood, revelation, or future apocalypse must not silently become a historical timeline event merely because a tradition gives it a chronology.

### Required test

**Traditional chronology must never be rendered as established historical chronology without an explicit evidence label.**

---

# VII. PILGRIMAGE, SACRED MOBILITY, AND RELIGIOUS ROUTES

Pilgrimage is currently under-modeled despite being one of the strongest intersections among religion, geography, ritual, economy, community, and sacred space.

UNESCO documents pilgrimage as ritual systems involving sacred routes, rivers, mountains, seasonal calendars, healing, community identity, oral transmission, and sacred landscapes.[8][9]

Atlas should model:

- pilgrimage routes
- stations / stops
- pilgrimage seasons
- sacred destinations
- route changes over time
- dangers/restrictions
- ritual actions along routes
- pilgrimage communities
- relic/image movement
- pilgrimage economies where relevant

This should be a first-class World Map layer.

---

# VIII. SACRED LANDSCAPES, NATURE, ECOLOGY, AND COSMOVISION

The app includes sacred geography as a theme but not as a sufficiently deep research domain.

UNESCO’s intangible-heritage framework specifically connects spirituality and worldview to local fauna, flora, healing systems, sacred landscapes, ritual calendars, cosmology, social organization, and environmental knowledge.[10]

Atlas needs records for:

- sacred mountains
- rivers
- forests
- caves
- springs
- deserts
- groves
- stones
- trees
- animals
- plants
- celestial bodies
- cardinal directions
- territorial cosmologies
- rainmaking / agricultural ritual

The relationship among **religion, ecology, territory, and sovereignty** should be explicit.

---

# IX. ANCESTORS, KINSHIP, CLAN, AND LINEAGE

Ancestor relations are globally important but not first-class in the current plan.

They should not be collapsed into necromancy.

Atlas should distinguish:

- ancestor veneration
- ancestor communication
- lineage founders
- clan spirits
- royal ancestors
- apotheosized rulers
- funerary transformation into ancestor status
- household ancestor rites
- ancestral masquerades
- genealogy and descent

Harvard’s Center for the Study of World Religions emphasizes that ancestor relations can structure burial rites, healing, spirit incorporation, initiation, and continuing care for the dead.[11]

---

# X. HOUSEHOLD / DOMESTIC RELIGION

A major bias in historical religion research comes from focusing on temples, churches, clergy, and elite texts.

Lived-religion research emphasizes home altars, domestic offerings, neighborhood shrines, food preparation, healing, informal prayer, and practices that may not align neatly with institutional doctrine.[2][12]

Atlas should distinguish:

- official religion
- elite theology
- temple/church/institutional practice
- household religion
- popular/local practice
- individual spirituality

This is essential for Egypt, Rome, China, Japan, Indigenous traditions, African traditions, South Asia, Latin America, and many modern religious settings.

---

# XI. SYNCRETISM, HYBRIDITY, CREOLIZATION, AND RELIGIOUS MIXTURE

A strict tradition tree will fail historically.

Religions frequently coexist, borrow, reinterpret, merge, or remain simultaneously practiced. Scholarship also cautions that “syncretism” itself can be an outsider or normative label that presumes pure religions existed before mixing.[13][14]

### Required architecture

Traditions must support:

- multiple parents/influences
- overlapping membership
- local hybrid practice
- parallel affiliation
- contested classification
- community self-description

Do **not** force all traditions into a single-parent taxonomy.

Examples that eventually require this flexibility include Afro-diasporic religions, East Asian popular religion, Latin American Catholic/Indigenous practices, Japanese Buddhist/Shinto histories, and many colonial-contact traditions.

---

# XII. IDENTITY, AFFILIATION, BELIEF, AND PRACTICE ARE NOT THE SAME THING

This is especially important for contemporary Atlas coverage.

Pew’s global research shows that people with no formal religious affiliation may still believe in God, afterlife, ancestral spirits, magic, or participate in spiritual practices.[15][16]

Atlas should therefore distinguish:

- self-identified religion
- institutional membership
- ethnocultural religious identity
- beliefs
- practices
- upbringing
- current affiliation
- mixed/dual belonging
- no affiliation

A person should not be represented as spiritually blank merely because they are “unaffiliated.”

---

# XIII. CONVERSION, DECONVERSION, RELIGIOUS SWITCHING, AND APOSTASY

The war/conversion addendum handles coercion but not the broader life-course movement into and out of religions.

Current global studies distinguish switching, conversion, and disaffiliation, including cases that involve no formal ritual.[17]

Atlas should support:

- conversion
- deconversion
- disaffiliation
- apostasy
- reconversion
- denomination/school switching
- coerced conversion
- incentivized conversion
- intermarriage-related change
- migration-related change
- revival / return

Historical and current demographic change should not be modeled only as institutional expansion.

---

# XIV. RELIGIOUS EXPERIENCE, VISIONS, DREAMS, REVELATION, AND ALTERED STATES

The current product is stronger on what texts **say** than on what practitioners report **experiencing**.

Philosophy-of-religion scholarship distinguishes religious experience from narrower mystical experience, including visions, voices, sensed presence, awe, numinous experience, and deliberately cultivated contemplative states.[18][19]

Create an evidence-aware experience/testimony layer for:

- visions
- dreams
- auditions/voices
- mystical union
- trance
- possession
- ecstasy
- revelation claims
- prophetic experience
- near-death experience
- apparition claims

These are **reported experiences**, not automatically externally verified supernatural events.

---

# XV. MIRACLE, PROPHECY, AND SUPERNATURAL-CLAIM RECORDS

Miracles and prophecy appear only as themes/future modules. They should have structured claim records.

For a prophecy:

- earliest source
- exact claim where legally quotable
- date
- intended audience
- conditionals
- later interpretations
- claimed fulfillment
- counterinterpretation
- retrospective editing concerns
- evidence status

For a miracle:

- source/testimony
- date/location
- witness chain
- institutional investigation if any
- medical/physical evidence if relevant
- alternative explanations
- later devotional interpretation

Atlas does not decide whether a miracle occurred; it documents the evidence history.

---

# XVI. POSSESSION, EXORCISM, MEDIUMSHIP, AND SPIRIT INCORPORATION

The necromancy addendum should be broadened.

Possession can function as illness, vocation, healing, ritual office, divine presence, spirit communication, or hostile intrusion depending on tradition. UNESCO sources document possession and spirit-healing as elements of living religious systems.[10][20]

Do not model all possession through Christian demonology.

Required distinctions:

- voluntary/ritual possession
- involuntary possession
- spirit incorporation
- mediumship
- oracle possession
- exorcism
- healing possession
- psychiatric/medical interpretation
- tradition-specific interpretation

---

# XVII. HEALING, MEDICINE, ILLNESS, AND RELIGION

Healing is only an ontology term today.

Religion often intersects with:

- traditional medicine
- herbal knowledge
- prayer healing
- spirit healing
- pilgrimage healing
- ritual diagnosis
- exorcism
- childbirth
- mental health
- dying and end-of-life practice

UNESCO’s Kallawaya case explicitly demonstrates the inseparability of cosmology, ritual, medicine, botanical knowledge, apprenticeship, and travel.[21]

Atlas should record **religious claims of efficacy separately from biomedical evidence**.

---

# XVIII. ENTHEOGENS / PSYCHOACTIVE SUBSTANCES IN RELIGIOUS PRACTICE

This is missing and historically significant.

Potential research includes peyote, ayahuasca, soma debates, kykeon hypotheses, tobacco, cannabis claims, mushrooms, and other ritual substances where responsibly documented.

UNESCO’s documentation of the Wixárika pilgrimage shows how peyote can be embedded in initiation, sacred geography, seasonal ritual, and traditional healing.[22]

Rules:

- historical/ethnographic documentation only
- no operational drug-use instructions
- distinguish established use from speculative ancient-entheogen theories
- include legal/cultural restrictions where relevant

---

# XIX. DIVINATION, OMENS, ORACLES, ASTROLOGY, AND LOTS

Divination appears in the ontology but lacks a dedicated research structure.

Needed categories include:

- omen literature
- astrology
- oracle consultation
- dream interpretation
- lots
- cleromancy
- hepatoscopy
- augury
- haruspicy
- oracle bones
- divination texts
- geomancy
- Ifá and other community-specific divinatory systems

Keep practice-specific vocabulary rather than collapsing everything into “fortune telling.”

---

# XX. AMULETS, TALISMANS, CURSES, VOTIVE OBJECTS, AND PROTECTIVE RELIGION

The new symbolism/art module should expand beyond paintings and architecture.

Material religion includes:

- amulets
- talismans
- curse tablets
- protective inscriptions
- relics
- votive offerings
- ex-votos
- prayer objects
- charms
- ritual clothing
- consecrated objects

The Met’s documentation of Islamic amulets shows the historical interaction of Qur'anic texts, astrology, medicine, occult knowledge, and protective objects.[23]

---

# XXI. OFFERING, SACRIFICE, GIFT, AND RELIGIOUS EXCHANGE

Human sacrifice should be a narrow subdomain of a much larger structure.

Model:

- animal sacrifice
- human sacrifice
- libation
- first fruits
- votive deposits
- incense
- food offerings
- ancestor offerings
- temple offerings
- relic donation
- tithes / obligatory religious giving
- alms
- reciprocal divine gift concepts

This allows sacrifice to be understood in its actual ritual economy rather than primarily through sensational cases.

---

# XXII. RELICS, SAINTS, HOLY PERSONS, AND VENERATED REMAINS

The current project models people but lacks a general comparative category for venerated persons and remains.

Support tradition-specific categories such as:

- saints
- sages
- gurus
- bodhisattvas
- arhats
- imams
- prophets
- holy men/women
- ancestors
- martyrs
- lineage founders

Material-religion scholarship shows that relics, devotional objects, architecture, and pilgrimage often operate together.[24]

Do not universalize the Christian category “saint.”

---

# XXIII. MARTYRDOM, PERSECUTION MEMORY, AND COMMEMORATION

The war/persecution model should distinguish the event from its later sacred memory.

Track:

- death/persecution event
- contemporary evidence
- martyr classification
- canonization/veneration process where relevant
- feast/commemoration
- relics/sites
- political use of martyr memory
- competing historical interpretations

This connects violence, memory, ritual calendar, sacred sites, and identity.

---

# XXIV. ASCETICISM, MONASTICISM, CELIBACY, AND RENUNCIATION

The current roadmap contains monastic texts but no general comparative model.

Required categories:

- monastic orders
- hermits
- renunciants
- mendicants
- celibacy
- fasting
- vows
- poverty
- silence
- pilgrimage/itinerancy
- meditation disciplines
- yogic/ascetic practice
- institutional monasteries/convents

This is central across Christianity, Buddhism, Jainism, Hindu traditions, Daoism, Sufism, and other traditions.

---

# XXV. RELIGIOUS OFFICES, SPECIALISTS, AND AUTHORITY LINEAGES

Atlas should model roles, not only people.

Examples:

- priest
- priestess
- rabbi
- imam
- monk / nun
- shaman or tradition-specific equivalent
- diviner
- healer
- oracle
- medium
- elder
- guru
- lama
- bishop
- pope/patriarch
- caliph
- ritual king
- scribe
- cantor
- theologian
- translator

Also model **succession/transmission relations**:

- apostolic succession
- isnad
- guru–disciple lineage
- dharma transmission
- hereditary priesthood
- clan custodianship
- initiatory grades

---

# XXVI. EDUCATION, INITIATION, AND TRANSMISSION

Religious knowledge moves through more than books.

Model:

- oral teaching
- memorization
- recitation
- apprenticeship
- teacher–student transmission
- initiation
- monastery/seminary/madrasa/gurukul education
- mystery initiation
- family transmission
- age-grade teaching
- secret/restricted transmission

UNESCO repeatedly treats intergenerational transmission and teacher–student relationships as central to living heritage.[5][8]

---

# XXVII. COMMENTARY, EXEGESIS, AND RECEPTION HISTORY

This is one of the largest textual gaps not fully captured by translation comparison.

A sacred text can mean very different things in different periods because communities interpret it through:

- commentary
- midrash
- tafsir
- scholastic theology
- legal exegesis
- sermons
- liturgy
- mystical interpretation
- reformist interpretation
- modern academic criticism

Atlas needs a **Reception History** layer:

SOURCE TEXT
→ EARLY COMMENTARY
→ LATER SCHOOL/TRADITION
→ POLEMICAL USE
→ LITURGICAL USE
→ MODERN INTERPRETATION

This is different from influence between two texts.

---

# XXVIII. TEXTUAL CRITICISM, REDACTION, AND VARIANT APPARATUS

The roadmap handles witnesses and translations, but a serious research platform also needs textual variation.

TEI’s scholarly edition standards explicitly model variant readings among manuscripts, printed editions, early translations, and quotations in other texts.[25]

Atlas should progressively support:

- variant reading
- omission/addition
- interpolation
- gloss
- redaction layer
- alternate recension
- reconstructed reading
- lacuna
- damaged text
- conjectural restoration
- manuscript family
- apparatus source

A “work” is not always a single stable text.

---

# XXIX. ORAL TRADITION VERSIONING AND PERFORMANCE CONTEXT

The Indigenous schema already gestures toward recorder/context, but this should be generalized.

An oral narrative can vary by:

- performer
- community
- date
- audience
- ceremony
- gender/age/initiation status
- recorder
- translator
- colonial/missionary mediation
- performance purpose

Do not collapse multiple tellings into one canonical synthetic “text.”

---

# XXX. SOUND, MUSIC, CHANT, DANCE, GESTURE, AND PERFORMANCE

Atlas currently prioritizes text and images. It needs **audio/video/performance** as first-class media.

UNESCO notes that music, dance, song, theatre, ritual, storytelling, dress, food, and performance overlap across living heritage domains.[5][26]

Support:

- chant
- hymnody
- recitation
- drumming
- ritual song
- sacred dance
- gesture/posture
- procession
- silence
- bells/horns/trumpets
- performance sequence
- audio/video rights
- performer/community provenance

---

# XXXI. EMBODIED AND SENSORY RELIGION

Harvard’s material-religion framework explicitly includes gesture, posture, sound, silence, food, clothing, icons, architecture, media, and everyday objects.[3]

Atlas should therefore model:

- fasting
- dietary law
- ritual food
- clothing
- veiling
- hair/tonsure
- circumcision
- tattoo/scarification where relevant
- sacred thread/marks
- posture
- prostration
- touch
- smell/incense
- light/fire
- water/bathing

These are not merely “themes”; they are practices and material systems.

---

# XXXII. RELIGIOUS LAW, CUSTOMARY GOVERNANCE, OATHS, AND SOCIAL ORDER

The original product includes sacred law, but the project lacks a broad comparative legal/practice structure.

UNESCO’s Mijikenda documentation shows religious traditions functioning as ethics, governance, oath-taking, reconciliation, naming, initiation, marriage, and burial systems.[27]

Atlas should model:

- religious law
- customary law
- ritual oath
- adjudication
- councils of elders
- purity rules
- dietary rules
- marriage/family law
- inheritance
- blasphemy/apostasy rules historically
- sanctuary/asylum
- reconciliation

Keep normative teachings separate from actual enforcement history.

---

# XXXIII. RELIGION, ECONOMY, PATRONAGE, LAND, AND WEALTH

The original themes include wealth and poverty, but institutional economics are missing.

Important categories include:

- temple economies
- church/monastery landholding
- waqf/endowments
- tithes
- alms
- pilgrimage economies
- patronage
- royal sponsorship
- tax exemptions
- religious taxation
- confiscation
- donation networks
- religious labor

This is essential to understanding institutional power without reducing religion to theology.

---

# XXXIV. RELIGION, CLASS, CASTE, SLAVERY, ETHNICITY, AND KINSHIP

Atlas should explicitly support how religious systems interact with social hierarchy.

Do not encode a tradition as inherently oppressive or liberatory. Instead model:

- textual teaching
- legal status
- institutional practice
- historical enforcement
- resistance/reform movements
- scholarly debate

This should include caste, hereditary status, slavery, clan, ethnicity, citizenship, and lineage where relevant.

---

# XXXV. GENDER, SEXUALITY, FAMILY, AND RELIGIOUS AUTHORITY

Gender/sexuality exist as themes, but the deep-research architecture should include:

- religious offices by gender
- gendered ritual roles
- family structure
- marriage forms
- celibacy
- fertility
- purity rules
- gendered access restrictions
- sexuality ethics
- LGBTQ interpretations where historically/documentarily appropriate
- changes over time

Do not project modern identity categories backward without evidence.

---

# XXXVI. RELIGION AS RESISTANCE, LIBERATION, PEACE, AND SOCIAL REFORM

The new war/power layer risks making religion appear mainly as a tool of domination.

Add the inverse history:

- anti-colonial religious movements
- abolitionist religious movements
- civil-rights religious movements
- liberation theology
- nonviolent resistance
- religious peacemaking
- sanctuary
- humanitarian institutions
- reform movements
- resistance by suppressed Indigenous traditions

This creates a more historically balanced power model.

---

# XXXVII. SCHISM, HERESY, ORTHODOXY, APOSTASY, AND BOUNDARY-MAKING

These exist as scattered terms but need a general model of **religious boundary formation**.

Track:

- who labeled whom orthodox/heretical
- when
- by what authority
- doctrinal issue
- political issue
- council/decree
- excommunication
- competing self-identification
- later rehabilitation or change

“Heretic” is a relationship/claim, not a neutral permanent identity.

---

# XXXVIII. RELIGIOUS ENCOUNTER: COEXISTENCE, POLEMIC, BORROWING, AND DIALOGUE

Influence graphs focus on textual relationships, while historical religious contact is broader.

Create an **Encounter** relation type for:

- coexistence
- polemic
- mission
- debate
- translation
- shared shrine/site
- borrowing
- reinterpretation
- persecution
- intermarriage
- syncretic/hybrid development
- diplomatic/religious exchange

This should complement, not replace, the influence graph.

---

# XXXIX. DEITY / SPIRIT CONFLATION AND POLEMICAL TRANSFORMATION

Entity aliasing alone is not enough.

Atlas needs source-specific relations such as:

- identified with
- equated with
- translated as
- syncretized with
- interpreted as
- demonized as
- euhemerized as
- later conflated with
- disputed equivalence

This is critical for Greco-Roman interpretatio, Egyptian/Greek syncretism, Canaanite/Israelite polemic, demonology, and modern occult reinterpretation.

Never merge entities merely because one historical source equated them.

---

# XL. SAME SYMBOL, DIFFERENT IDEA

The product already plans “Same Word, Different Idea.” It needs the visual equivalent:

**Same Symbol, Different Idea**

Examples may include:

- serpent
- star
- eye
- sun disk
- cross-like forms
- horns
- wings
- tree
- triangle
- circle
- hand gestures

For each occurrence show independent provenance and period-specific meaning.

This is especially important before Contested Symbolism is built.

---

# XLI. SACRED PLACES SHARED OR CONTESTED BY MULTIPLE TRADITIONS

A place may simultaneously have multiple sacred identities.

Model:

- tradition/community
- sacred name
- sacred function
- date range
- access/control
- shared use
- contested use
- rebuilding/destruction/reuse
- political sovereignty

Never make one community’s sacred claim erase another’s historical relationship.

---

# XLII. OBJECT BIOGRAPHIES, CONSECRATION, MOVEMENT, AND REUSE

CIDOC CRM uses an event-centric model because cultural objects acquire meaning through human activities over time.[28]

Atlas artifacts should support object biographies:

CREATION
→ CONSECRATION
→ RITUAL USE
→ MOVEMENT
→ LOOTING / SALE / GIFT
→ MUSEUM ACQUISITION
→ RESTORATION
→ REINTERPRETATION
→ REPATRIATION

This is particularly valuable for relics, manuscripts, statues, icons, cult objects, temple objects, and colonial collections.

---

# XLIII. PROVENANCE, LOOTING, REPATRIATION, AND CULTURAL-PROPERTY STATUS

Current image provenance is not enough.

Museums and heritage agencies treat provenance, illicit trafficking, sacred objects, funerary objects, cultural patrimony, and repatriation as distinct research/ethical issues.[29][30][31]

Add:

- excavation context
- acquisition chain
- ownership gaps
- export/import history where relevant
- disputed provenance
- illicit-trafficking concern
- repatriation claim/status
- sacred/funerary status
- community restrictions

A beautiful museum object should not appear context-free if its removal history is disputed.

---

# XLIV. HUMAN REMAINS AND FUNERARY MATERIAL ETHICS

This needs an explicit policy before scaling archaeology.

NAGPRA and museum ethics distinguish human remains, funerary objects, sacred objects, and objects of cultural patrimony, with consultation and repatriation obligations in applicable contexts.[29][31]

Atlas should support:

- sensitive display controls
- no gratuitous imagery
- community restrictions
- repatriation status
- culturally appropriate terminology
- reduced geographic precision if needed

---

# XLV. INDIGENOUS DATA SOVEREIGNTY MUST GO BEYOND A “RESTRICTED” FLAG

The current cultural-protocol model is a strong start, but Local Contexts demonstrates that communities may specify provenance, seasonal access, gender restrictions, sacred/secret status, noncommercial use, community-only use, and other protocols.[32]

Atlas should plan for:

- community authority record
- permitted uses
- restricted uses
- seasonal restrictions
- gender/initiatory restrictions where community-provided
- community correction/request-review channel
- takedown/restriction workflow
- export restrictions
- AI/retrieval restrictions

Restrictions must propagate through search, API, export, AI synthesis, caching, and derived datasets.

---

# XLVI. SENSITIVE SACRED-SITE COORDINATES

Map completeness should not override cultural or preservation concerns.

Support location precision such as:

- exact public
- approximate public
- region only
- hidden/restricted

Use this for vulnerable archaeological sites and community-restricted sacred places.

---

# XLVII. HISTORICAL PLACE NAMES, ENDONYMS, EXONYMS, AND TEMPORAL IDENTITY

World Historical Gazetteer treats place names, geometries, classifications, sources, and certainty as time-dependent attestations.[6][33]

Atlas should do the same for sacred geography.

“Constantinople,” “Byzantion,” and “Istanbul” should not behave as unrelated places or as one timeless label.

Support:

- original-script names
- transliteration
- endonym
- exonym
- sacred name
- colonial name
- modern name
- date range
- certainty

---

# XLVIII. ABSENCE OF EVIDENCE VS EVIDENCE OF ABSENCE

This should become an explicit methodology rule.

WHG documentation notes that gaps in attestations do not themselves mean a place did not exist.[6]

The same is true throughout Atlas.

Use distinct statements:

- No evidence currently located
- Evidence is fragmentary
- Expected evidence is absent
- Contemporary sources are silent
- Evidence argues against the claim

This is vital for lost texts, secret societies, disputed rituals, religious demographics, and Contested History.

---

# XLIX. SOURCE PERSPECTIVE AND BIAS METADATA

Generalize the source-type distinctions already being added for war/sacrifice.

Useful source perspectives include:

- insider
- outsider
- hostile opponent
- colonial administrator
- missionary
- legal/institutional
- archaeological
- ethnographic
- participant testimony
- later tradition
- modern scholarship
- popular media

Perspective does not automatically invalidate a source, but users need to know what kind of witness they are reading.

---

# L. SURVIVAL BIAS AND ARCHIVAL BIAS

Atlas should warn users that what survives is not a neutral sample of what existed.

Bias can result from:

- literate elites producing more documents
- climate preserving some materials better
- conquest/destruction
- colonial collecting
- excavation priorities
- museum acquisition history
- translation history
- public-domain availability
- digitization priorities

A tradition with 20,000 digitized lines should not automatically appear historically more significant than an oral tradition with limited public material.

---

# LI. CORPUS BIAS DASHBOARD

Add a product-level audit that reports representation by:

- region
- time period
- tradition/community
- source language
- modern translation language
- text vs oral vs archaeology vs artifact vs image vs audio/video
- elite/institutional vs household/popular evidence
- gender where known
- living vs extinct tradition
- full-text vs metadata-only
- scholarly-source depth

This should become a completion gate alongside raw work/image counts.

---

# LII. AUTHORITY CONTROL AND EXTERNAL IDENTIFIERS

For a research atlas at this scale, records should increasingly link to stable external authorities where available.

Potential identifiers include:

- museum accession numbers
- manuscript shelfmarks
- CDLI / ORACC identifiers
- Pleiades / WHG place IDs
- Getty AAT / TGN / ULAN / CONA / Iconography Authority
- VIAF / ISNI / Wikidata where appropriate
- DOI / ISBN / JSTOR identifiers for scholarship

Getty’s vocabularies explicitly provide structured authorities for cultural objects and iconographic subjects, including religious characters, narratives, historical events, and works.[34]

---

# LIII. EVENT-CENTRIC KNOWLEDGE GRAPH

The widening Atlas scope makes an event model increasingly necessary.

CIDOC CRM’s cultural-heritage standard is explicitly event-centric, designed to connect people, things, places, times, activities, and intellectual/material context.[28]

Atlas does not need to copy CIDOC CRM wholesale, but Phase 0 should evaluate adopting compatible concepts for:

- creation
- discovery
- excavation
- translation
- copying
- publication
- consecration
- ritual use
- conversion
- conflict
- migration
- suppression
- restoration
- acquisition
- repatriation

This would reduce the proliferation of unrelated special-case tables.

---

# LIV. TEXT / IMAGE / AUDIO / VIDEO / OBJECT ANNOTATION MODEL

IIIF’s Presentation model supports structured objects, ranges, and annotations rather than only static images.[35]

Atlas should plan for annotations that can target:

- a line in a text
- an image region
- a manuscript page
- a symbol in an artwork
- a location on a map
- a timestamp in audio/video

This would unlock real scholarly commentary and comparison.

---

# LV. SCIENTIFIC DATING AND AUTHENTICATION EVIDENCE

Evidence status needs more granularity for physical objects/manuscripts.

Potential evidence methods include:

- radiocarbon dating
- dendrochronology
- stratigraphy
- palaeography
- codicology
- paper/fibre analysis
- ink/pigment analysis
- material composition
- X-radiography / imaging
- epigraphy
- typology

The International Dunhuang Programme shows how codicology, palaeography, paper fibres, material form, and scripts contribute to manuscript chronology.[36][37]

Do not reduce all dates to one confidence badge without recording why the date is believed.

---

# LVI. SCHOLARLY INTERPRETATION HISTORY / HISTORIOGRAPHY

Atlas should show when scholarship itself changed.

For important disputed subjects:

- earlier interpretation
- later challenge
- current majority/minority views
- superseded theory
- evidence that changed the discussion
- last reviewed date

This is particularly important for archaeology, ancient religion, textual dependence, sacrifice, mystery religions, and controversial objects.

---

# LVII. SOURCE INDEPENDENCE AND DERIVATION GRAPH

The Contested History plan recognizes circular sourcing. This should be a core Atlas feature as well.

Store, where possible:

- original source
- quotation chain
- translation source
- secondary source depending on earlier secondary source
- independent corroboration

Five modern books quoting the same nineteenth-century claim are one evidence chain, not five independent witnesses.

---

# LVIII. RESEARCH REPRODUCIBILITY AND DATA LINEAGE

For each imported corpus/source, preserve:

- original source URI/file
- acquisition date
- file hash
- license/rights
- extraction/transcription method
- normalization transformations
- segment mapping
- OCR/HTR status where relevant
- correction history
- importer/version

This is necessary if Atlas is to function as a serious digital-humanities platform rather than a curated website.

---

# LIX. COMMENTARY AND SCHOLARSHIP VERSIONING

Secondary scholarship should include:

- publication date
- edition
- DOI/stable identifier
- review status
- scholarly field
- source language
- last reviewed
- superseded/retracted/corrected status where applicable

Do not let a century-old theory appear as “scholarship” without temporal context.

---

# LX. POLYHIERARCHICAL TRADITION TAXONOMY

The planned Region → Tradition → Branch hierarchy is necessary but insufficient.

Many traditions have:

- multiple historical ancestors
- internal reform movements
- overlapping identities
- cross-tradition schools
- regional forms
- syncretic or hybrid formations

Therefore support a graph, not only a tree:

- developed from
- influenced by
- reform of
- branch of
- split from
- merged with
- overlaps with
- claimed continuity with
- modern reconstruction of

---

# LXI. RELIGIOUS MOVEMENT LIFE CYCLE

Track movements through:

ORIGIN
→ CHARISMATIC / FOUNDING PHASE
→ INSTITUTIONALIZATION
→ CANON / AUTHORITY FORMATION
→ EXPANSION
→ SCHISM / REFORM
→ SUPPRESSION / DECLINE
→ REVIVAL / RECONSTRUCTION

This applies to ancient cults, monastic orders, denominations, new religious movements, esoteric orders, and revival religions.

---

# LXII. DIGITAL RELIGION AND TECHNOLOGICAL CHANGE

The current roadmap largely stops at modern religious movements, but religious life now occurs online.

Cambridge’s current scholarship treats digital religion as a field involving online/offline religious practice, changing authority, digital ritual, and online religious community.[38]

Atlas should eventually include:

- livestream worship
- online ritual
- digital pilgrimage
- religious apps
- social-media preaching/authority
- online communities
- virtual sacred spaces
- AI-mediated spiritual/religious practice

This is a later phase, but architecture should not make “religion” end in the twentieth century.

---

# LXIII. RELIGION, MEDIA, AND TRANSMISSION TECHNOLOGY

More broadly, track how technology changes religious transmission:

- writing
- manuscript culture
- printing
- radio
- television
- film
- internet
- social media
- AI

The medium can alter authority, accessibility, liturgy, interpretation, and community scale.[38][39]

---

# LXIV. SECULAR, NONRELIGIOUS, AND SPIRITUAL-BUT-NOT-AFFILIATED WORLDVIEWS

The current skeptical/adversarial layer should be broadened.

Include as distinct analytical categories:

- atheism
- agnosticism
- secular humanism
- philosophical naturalism/materialism
- deism
- nonreligious spirituality
- unaffiliated spiritual practice

Pew’s global data demonstrates that “unaffiliated” and “non-spiritual” are not synonyms.[15][16]

---

# LXV. RELIGION / MAGIC / SCIENCE AS HISTORICAL CATEGORIES

Atlas should not assume modern boundaries between religion, magic, medicine, astronomy, astrology, and science existed in every culture.

The Met’s amulet material, for example, documents historical overlap among Qur'anic text, medicine, astrology, talismanic practice, and scientific knowledge.[23]

Store the **historical classification used by the source**, plus modern scholarly classification, rather than imposing one timeless category.

---

# LXVI. CONTESTED ANALYTICAL TERMS / TERMINOLOGY HISTORY

Create methodology records for terms whose meanings are historically loaded or disputed, including:

- religion
- pagan
- cult
- sect
- heresy
- primitive religion
- fetish
- magic
- witchcraft
- shamanism
- animism
- totemism
- syncretism
- mythology

For each:

- historical usage
- modern scholarly usage
- community self-use, if any
- potentially deprecated/problematic usage
- preferred contextual language

The Stanford Encyclopedia emphasizes that the concept “religion” itself has a contested analytical history.[40]

---

# LXVII. EMIC VS ETIC DESCRIPTION

For sensitive classifications, distinguish:

- **emic**: how practitioners/community describe themselves
- **etic**: external scholarly/administrative classification
- **historical outsider label**
- **polemical label**

This will greatly improve neutrality for Paganism, witchcraft, cult terminology, Indigenous religion, Gnosticism, heresy, demonization, and syncretic movements.

---

# LXVIII. COMMUNITY SELF-NAME VS OUTSIDER NAME

Extend alias normalization beyond spelling variants.

Track:

- self-name/endonym
- outsider/exonym
- historical name
- colonial name
- scholarly name
- pejorative/polemical label
- modern preferred name

WHG already demonstrates the value of time-, language-, and source-specific names for places.[33]

The same principle applies to traditions and peoples.

---

# LXIX. CURRENT PRACTICE VS HISTORICAL PRACTICE

Do not freeze a living religion at its ancient/classical form.

For each living tradition, distinguish:

- historical period
- geography
- branch/community
- current documented practice
- official doctrine
- local practice
- reform movement

Modern practice should have date/location/source scope.

---

# LXX. COMMUNITY REVIEW / CORRECTION CHANNEL

For living traditions—especially Indigenous and marginalized traditions—Atlas should eventually support a controlled mechanism to flag:

- incorrect naming
- cultural sensitivity issue
- restricted material
- inaccurate community representation
- outdated institutional description

This should enter curation workflow, not directly edit public data.

---

# LXXI. “RELIGIOUS WORLD AT A DATE” EXPLORER

The proposed “World Before Christianity” idea is valuable, but the feature should be generalized so Christianity is not the global reference axis.

Allow any date/period:

- 2000 BCE
- 500 BCE
- 1 CE
- 600 CE
- 1200 CE
- 1800 CE
- 2020 CE

Then ask:

- Which traditions are securely attested here?
- What was politically dominant?
- What was actually practiced locally?
- Which texts existed yet?
- Which texts were composed later?
- Which concepts were already attested?

This avoids Christian-centered periodization while still supporting the user’s specific pre-Christian comparison interest.

---

# LXXII. RELIGIOUS DEMOGRAPHY WITH METHOD AND UNCERTAINTY

For modern populations, preserve:

- census vs survey vs estimate
- self-identification question
- date
- geographic unit
- sample/method
- category definitions

Pew notes that folk/traditional religion can be difficult to measure and is often omitted or grouped into residual categories.[41]

Historical demographic layers should be even more cautious.

---

# LXXIII. INSTITUTIONAL SELF-DESCRIPTION VS INDEPENDENT SCHOLARSHIP

For organizations, movements, and living religions, separate:

- official self-description
- historical records
- scholarly description
- critic/opponent claims
- legal/government classification

This is particularly important for new religious movements, esoteric orders, secret societies, high-control allegations, and controversial institutions.

---

# LXXIV. RELIGIOUS INSTITUTIONS BEYOND “TRADITIONS”

Create first-class institutions:

- temples
- churches
- monasteries
- seminaries
- lodges
- orders
- councils
- schools
- archives
- missionary societies
- confraternities
- shrines
- pilgrimage organizations

Institution history should link to places, people, texts, property, conflicts, reforms, and archives.

---

# LXXV. ARCHIVES, LIBRARIES, SCRIPTORIA, AND KNOWLEDGE CENTERS

The World Map’s “centers of learning” requirement should become its own entity family.

Track:

- libraries
- scriptoria
- monasteries
- universities
- temple schools
- madrasas
- translation centers
- archives
- manuscript collections

Also track destruction, relocation, dispersal, and digitization.

---

# LXXVI. CULTURAL MEMORY AND PLACES OF MEMORY

Religion is maintained through commemorative memory as well as texts.

Support:

- memorial sites
- anniversaries
- martyr days
- ancestor days
- sacred battlefields
- destroyed temples/churches
- reconstructed sites
- pilgrimage commemorations

UNESCO explicitly recognizes “places of memory” as a potential intangible-heritage subdomain.[5]

---

# LXXVII. RECONSTRUCTION VS CONTINUITY

The planned Pagan/Wiccan addendum should generalize a key rule:

For any revival/reconstruction tradition distinguish:

- continuous documented practice
- interrupted practice
- surviving folklore
- textual reconstruction
- archaeological reconstruction
- modern innovation
- claimed continuity

Apply this beyond European Pagan revivals.

---

# LXXVIII. RITUAL RESTRICTION AND PARTICIPATION RULES

Model who may participate or view:

- initiated/uninitiated
- age
- gender where community-specific
- clergy/laity
- caste/status where historically relevant
- clan/lineage
- season
- sacred/private/public

Local Contexts provides real digital-governance precedents for these distinctions.[32]

---

# LXXIX. HIGH-CONTROL / “CULT” CLAIMS REQUIRE A NEUTRAL MODEL

If Atlas eventually addresses groups described as “cults,” do not store “cult” as an unqualified fact.

Use dimensions such as:

- self-description
- legal status
- scholarly classification
- documented coercive practices
- documented abuse claims
- organizational control mechanisms
- critic claims
- institutional response

This belongs partly in Contested History and partly in modern religion/institutional history.

---

# LXXX. RELIGION AND SCIENCE / KNOWLEDGE SYSTEMS

The roadmap has cosmology but not a dedicated history of interactions among religious and knowledge systems.

Potential domains:

- astronomy
- astrology
- medicine
- natural philosophy
- creation/evolution debates
- calendar science
- alchemy
- sacred mathematics
- cosmography

Avoid simplistic “religion vs science” narratives; many historical systems did not separate these domains in modern terms.

---

# LXXXI. COMPLETE PRE-CHRISTIAN COVERAGE SHOULD BE PART OF A LARGER “RELIGIOUS HISTORY” MATRIX

The proposed pre-Christian/Pagan addendum is still necessary, but it should not become a Christianity-centered taxonomy.

The actual goal should be:

> No major documented religious system, local cult complex, philosophical-religious school, oral tradition, ritual system, archaeological religion, or extinct religious community should be absent merely because it does not fit the modern “world religions” model.

The final tradition-coverage addendum should therefore be generated **after** this conceptual audit and should include regional matrices for ancient, classical, medieval, early modern, modern, living, extinct, oral, and archaeological traditions.

---

# LXXXII. EXAMPLES OF TRADITION / BELIEF FAMILIES STILL WORTH CHECKING IN THE FINAL COVERAGE PASS

This report intentionally does not replace the coming religion-by-religion coverage addendum. However, the final pass should explicitly verify whether Atlas has adequate treatment of at least these often-overlooked families:

- prehistoric / archaeological religion
- ancient Arabian traditions
- Canaanite/Ugaritic/Phoenician/Punic traditions
- Anatolian/Hittite/Hurrian traditions
- Iranian and Central Asian traditions
- Scythian/Sogdian/Bactrian religious worlds
- Tengrism and Inner Asian traditions
- Bon
- Mandaeism
- Manichaeism
- Samaritan traditions
- Yazidi traditions
- Druze and other later minority traditions
- Ajivika
- Lokayata/Carvaka and other Indian skeptical/materialist schools
- South Asian folk/local traditions
- Korean shamanic traditions
- Ainu traditions
- Ryukyuan religion
- Vietnamese folk/Đạo Mẫu traditions
- Southeast Asian Indigenous/Austronesian religious systems
- Etruscan/Thracian/Dacian/Getic religions
- Finnic/Baltic/Sámi traditions
- Amazigh/Berber traditions
- Afro-diasporic traditions such as Vodou, Lucumí/Santería, Candomblé, Umbanda, Palo, Obeah and related traditions where appropriate
- modern Pagan/reconstructionist families
- unaffiliated/nonreligious spiritualities

Presence should be checked by **actual depth**, not name-only metadata.

---

# LXXXIII. FINAL PRE-PHASE-0 STRUCTURAL REQUIREMENTS

Before implementation begins, the final consolidated addendum should require Phase 0 to answer all of the following:

### Can Atlas represent religion without a text?

If no, the architecture is still too narrow.

### Can Atlas represent a ritual that varies by community and season?

If no, practice is under-modeled.

### Can Atlas represent a sacred place with multiple names, multiple religions, uncertain boundaries, and changing control?

If no, geography is under-modeled.

### Can Atlas represent a person who belongs culturally to one religion but practices elements of several?

If no, identity is too rigid.

### Can Atlas represent a tradition with no founder, no canon, no scripture, and no centralized institution?

If no, the taxonomy retains world-religion bias.

### Can Atlas represent a religious experience as testimony without treating it as verified supernatural fact?

If no, evidence categories are incomplete.

### Can Atlas represent a ritual object’s excavation, museum acquisition, disputed provenance, repatriation, and cultural restrictions?

If no, material religion is incomplete.

### Can Atlas represent variant manuscript readings and redaction layers?

If no, textual scholarship is incomplete.

### Can Atlas represent oral-performance variants without inventing a canonical text?

If no, Indigenous/oral traditions remain structurally disadvantaged.

### Can Atlas represent sound, dance, chant, and video as evidence?

If no, lived religion is incomplete.

### Can Atlas distinguish source silence from affirmative counterevidence?

If no, disputed-history reasoning remains unsafe.

### Can Atlas show how scholarship changed over time?

If no, “scholarly interpretation” remains too static.

### Can Atlas show what it is systematically missing?

If no, the project cannot credibly claim completeness.

---

# LXXXIV. PRIORITY ASSESSMENT

## Add before Phase 0 architecture decisions

The highest-priority missing requirements are:

- religion-as-lived-practice entity model
- completeness matrix beyond texts
- ritual/practice/festival/calendar model
- sacred place / sacred landscape model
- institutions / offices / authority lineage model
- religious experience/testimony model
- polyhierarchical tradition graph
- mythic vs historical chronology
- multiple calendars / local periodization
- oral-performance versioning
- audio/video/performance evidence
- textual variant / critical apparatus model
- object biography / provenance / repatriation model
- Indigenous data-sovereignty enforcement
- historical place-name/time uncertainty model
- source-perspective / survival-bias metadata
- corpus-bias dashboard
- external authority IDs / interoperable vocabularies
- event-centric knowledge graph review
- absence-of-evidence methodology

## Add as major corpus/experience phases

- pilgrimage
- sacred landscapes/ecology
- rites of passage
- ancestors/kinship
- household religion
- religious experience/mysticism
- miracles/prophecy
- possession/exorcism/mediumship
- healing/medicine
- entheogenic practice
- divination/oracles/astrology
- amulets/talismans/protective religion
- offerings/sacrifice
- relics/venerated persons
- martyrdom/commemoration
- monasticism/asceticism
- commentary/reception history
- religious law/customary governance
- economy/patronage
- social hierarchy
- gender/family/body
- religion as resistance/peace/reform
- religious encounter/coexistence
- digital religion
- secular/nonreligious spirituality

---

# LXXXV. RECOMMENDED NEXT MOVE

Do **not** send Codex another religion-list prompt immediately.

Let the current Religion–Power–Conflict–Esotericism documentation update finish.

Then create **one final consolidated pre-Phase-0 addendum** containing:

1. the missing conceptual dimensions in this report;
2. the pre-Christian/Pagan/Wiccan/religion-coverage expansion already discussed;
3. a requirement for a multi-dimensional coverage matrix;
4. Phase 0 schema review for non-text entities;
5. measurable baseline counts for practices, institutions, places, oral traditions, performances, sacred objects, experiences, calendars, variants, and provenance—not only works and images.

After that document is committed, perform one final repository audit. If those structures are present in the roadmap, **begin Phase 0** rather than continuing to add disconnected prompts.

---

---

# LXXXVI. SACRED-SITE PALIMPSESTS, SUPERPOSITION, AND RELIGIOUS REUSE

The existing audit recognizes shared/contested sacred places and object biographies, but it does not yet make **layered sacred-site history** a first-class research object.

Religious landscapes often accumulate successive layers rather than experiencing a simple one-time replacement. A single location may move through:

PRE-EXISTING SACRED LANDSCAPE  
→ SHRINE / TEMPLE / CEREMONIAL COMPLEX  
→ CONQUEST OR POLITICAL TRANSITION  
→ ABANDONMENT / DESTRUCTION / CONTINUED USE  
→ RELIGIOUS REUSE / NEW BUILDING  
→ LATER REBUILDING  
→ ARCHAEOLOGICAL EXCAVATION  
→ MODERN HERITAGE OR CONTINUED RELIGIOUS USE

Atlas should therefore model **site phases**, not only one current place record.

Required site-event relationships should include:

- built over
- built beside
- incorporated into
- reused as
- converted to another religious use
- shared by multiple traditions
- abandoned
- deliberately destroyed
- damaged in war
- dismantled for materials
- spoliated / reused as building material
- preserved despite religious transition
- rebuilt
- rediscovered archaeologically
- restored
- reconsecrated
- secularized
- returned to religious use

Crucial rule:

> A later religious building occupying or reusing an earlier sacred site does not by itself prove deliberate religious erasure.

Archaeological scholarship on late-antique spolia and temple reuse demonstrates that reuse could reflect economics, available materials, urban change, symbolic appropriation, later reinterpretation, or explicit religious triumphalism depending on the individual case.[42]

For every site phase Atlas should preserve:

- date/date range
- responsible polity/community where known
- religious affiliation where supportable
- building/function
- archaeological evidence
- textual evidence
- reason for change where known
- alternative explanations
- confidence
- source provenance

### Initial case-study candidate: Cholula

The Great Pyramid of Cholula is an especially strong demonstration of this model. INAH documents the pre-Hispanic monumental complex and the later Sanctuary of Nuestra Señora de los Remedios built on its summit; an initial hermitage dates to 1594, while major modern archaeological investigation occurred in the twentieth century.[43]

Atlas should use cases like Cholula to show **successive sacred landscapes**, not to imply that an ancient pyramid was only recently discovered or that every later structure proves a hidden suppression program.

---

# LXXXVII. CONQUEST-TO-RELIGIOUS-LANDSCAPE TRANSFORMATION

The Religion–Power–Conflict expansion should go beyond war events and explicitly model what happens to the **religious landscape after political control changes**.

Possible outcomes include:

- violent suppression
- legal prohibition
- forced conversion
- incentivized conversion
- elite conversion
- gradual voluntary conversion
- toleration
- protected minority status
- taxation/legal disadvantage
- co-option of existing institutions
- sacred-site conversion
- sacred-site sharing
- syncretism
- persistence of older ritual practice
- underground/private continuation
- migration/diaspora
- institutional decline without population conversion
- abandonment due to economic or demographic change

Required analytical chain:

POLITICAL CONQUEST  
→ LEGAL / INSTITUTIONAL CHANGE  
→ SACRED-SITE CHANGE  
→ CLERGY / SPECIALIST CHANGE  
→ COMMUNITY RESPONSE  
→ MIGRATION / CONTINUITY / CONVERSION / SYNCRETISM  
→ LONG-TERM RELIGIOUS GEOGRAPHY

Do not encode:

CONQUEST = IMMEDIATE CONVERSION.

The map should distinguish:

- political sovereignty
- official religion
- institutional religious presence
- religious practice
- estimated demographic affiliation
- archaeological evidence
- later cultural memory

Where conversion or suppression is alleged, Atlas should identify the mechanism and evidence rather than infer it from the eventual religious majority.

---

# LXXXVIII. KNOWLEDGE DESTRUCTION, LOSS, DISPERSAL, AND SURVIVAL

The audit already calls for libraries, archives, scriptoria, schools, and centers of learning, but **knowledge loss itself** should become a first-class historical domain.

Create event types for:

- library destruction
- archive destruction
- manuscript burning
- deliberate censorship
- confiscation
- looting
- wartime destruction
- accidental fire
- flood / earthquake / environmental loss
- institutional collapse
- abandonment
- language/script loss
- manuscript dispersal
- colonial removal
- private concealment
- evacuation/rescue
- copying for preservation
- translation that preserves otherwise lost knowledge
- rediscovery
- reconstruction from quotations/fragments
- digitization

For each knowledge-loss event record:

- institution/collection
- date/date range
- location
- responsible actors where securely known
- event type
- deliberate vs accidental vs disputed
- estimated holdings before event, with confidence
- documented losses
- documented survivors
- materials moved elsewhere
- copies known elsewhere
- later reconstructions
- primary testimony
- later accounts
- legendary embellishments
- scholarly assessment
- uncertainty

This domain must include both:

## KNOWLEDGE LOSS

and:

## KNOWLEDGE SURVIVAL

Atlas should be able to ask:

- What was actually destroyed?
- What survived elsewhere?
- Who copied or translated it?
- Who physically rescued manuscripts?
- Which works survive only in quotations?
- Which claims of total destruction are later legends?
- Which intellectual traditions continued even after one institution disappeared?

Recent cases demonstrate why the survival side matters. UNESCO documents deliberate destruction of monuments and manuscript losses at Timbuktu while also documenting heritage recovery, and its Mosul work documents the destruction/looting of religious monuments, libraries, books, manuscripts, and artifacts during recent conflict.[48][49]

---

# LXXXIX. KNOWLEDGE-CENTER EVENT HISTORIES: BAGHDAD, ALEXANDRIA, AND BEYOND

Major intellectual centers should have **event histories**, not merely static location records.

Potential fields:

- institution/center name
- aliases
- founding/formation evidence
- patrons
- languages
- scholars
- translators
- physicians
- philosophers
- scientists
- scribes
- religious communities
- manuscript/collection history
- translation networks
- patronage changes
- wars
- fires
- censorship
- dispersal
- decline
- destruction
- successor institutions
- myths/legends about the center
- current scholarly debates

### Baghdad / Bayt al-Hikma

Bayt al-Hikma should be included, but Atlas must distinguish the securely attested Abbasid caliphal library/translation context from later romanticized descriptions of a modern-style university or single institution responsible for the entire Graeco-Arabic translation movement. Modern scholarship explicitly debates the institution's exact character.[44][45]

The Mongol capture of Baghdad in 1258 is historically documented; however, famous literary images of books turning the Tigris black with ink should be stored as **later narrative/tradition claims** unless independently corroborated, not silently converted into measured historical fact.

### Library of Alexandria

The Library of Alexandria should likewise be a flagship example of why Atlas must reject the single-catastrophe template. Accounts attribute destruction to several different episodes, while modern historical treatments emphasize a much more complicated history of decline, damage, patronage loss, and uncertainty concerning which collections still existed at particular dates.[46]

Atlas should therefore display:

EARLY INSTITUTION  
→ COLLECTION / SCHOLARLY GROWTH  
→ POLITICAL/PATRONAGE CHANGES  
→ DOCUMENTED DAMAGE EVENTS  
→ DAUGHTER / ASSOCIATED COLLECTIONS  
→ LATER DESTRUCTION CLAIMS  
→ HISTORIOGRAPHY OF “THE BURNING OF THE LIBRARY”

without pretending one disputed story explains the disappearance of the entire ancient scholarly ecosystem.

Other candidate knowledge-center histories should eventually include, where evidence supports them:

- Nalanda
- Timbuktu manuscript traditions
- medieval monasteries/scriptoria
- Córdoba and other translation/intellectual centers
- Constantinople collections
- Mesoamerican codex traditions
- Dunhuang
- major temple libraries
- colonial and missionary archives
- knowledge centers destroyed or dispersed in modern warfare

---

# XC. CIVILIZATIONAL ERASURE, CULTURAL REPLACEMENT, AND HISTORICAL MEMORY

Add a cross-domain model tentatively titled:

**Civilizational Erasure & Historical Replacement**

This should track attempts—or alleged attempts—to suppress, replace, appropriate, or transform:

- religion
- language
- script
- personal names
- place names
- deities
- priesthoods
- sacred sites
- monuments
- calendars
- festivals
- oral traditions
- clothing
- educational systems
- legal systems
- archives
- libraries
- historical narratives
- burial practices
- Indigenous knowledge
- ruling elites
- collective memory

Use evidence-aware classifications:

DOCUMENTED DELIBERATE ERASURE

DOCUMENTED CULTURAL ASSIMILATION

DOCUMENTED RELIGIOUS SUPPRESSION

DOCUMENTED LANGUAGE / SCRIPT SUPPRESSION

DOCUMENTED ICONOCLASM

DOCUMENTED DAMNATIO / MEMORY SUPPRESSION

INSTITUTIONAL REPLACEMENT

DEMOGRAPHIC REPLACEMENT / FORCED RESETTLEMENT

GRADUAL CULTURAL CHANGE

ECONOMIC / URBAN ABANDONMENT

ACCIDENTAL LOSS

WAR DAMAGE

NATURAL DISASTER

CLAIMED SUPPRESSION

UNKNOWN / INSUFFICIENT EVIDENCE

Do not automatically infer deliberate erasure whenever:

- a culture disappears
- a building is reused
- records are missing
- a new religion becomes dominant
- an old place name changes

Conversely, where deliberate suppression is documented, do not sanitize it as generic “cultural change.”

---

# XCI. “SHOW WHAT WAS HERE BEFORE?” EXPLORATION MODE

Add a future Atlas exploration mode:

# Show What Was Here Before?

For any sufficiently documented place, the user should be able to peel backward through historical layers.

Example interaction:

CURRENT SITE  
↓  
EARLIER RELIGIOUS BUILDING  
↓  
PREVIOUS SACRED SITE  
↓  
ARCHAEOLOGICAL PHASE  
↓  
EARLIER SETTLEMENT / SACRED LANDSCAPE  
↓  
UNKNOWN

The experience should integrate:

- historical maps
- site phases
- archaeology
- prior place names
- political control
- religious affiliation
- buildings
- ritual use
- destruction/reuse events
- excavation history
- surviving artifacts
- manuscripts/inscriptions
- source confidence

Possible change labels:

BUILT OVER

BUILT BESIDE

REUSED

CONVERTED

INCORPORATED

DESTROYED

ABANDONED

SHARED

REBUILT

EXCAVATED

RESTORED

This should work globally and in multiple directions:

TEMPLE → CHURCH

CHURCH → MOSQUE

MOSQUE → CHURCH

SHRINE → TEMPLE

INDIGENOUS CEREMONIAL SITE → COLONIAL RELIGIOUS SITE

RELIGIOUS BUILDING → SECULAR BUILDING

SHARED SITE → EXCLUSIVE CONTROL

and other historically documented sequences.

Atlas must not assume that the later religion is always the aggressor or that every site transition was violent.

---

# XCII. HISTORICAL TARTARY / TARTARIA VS MODERN “TARTARIAN EMPIRE” CLAIMS

This subject requires strict separation between a **documented historical cartographic/geographic term** and a **modern contested-history theory**.

## Historical Tartary / Tartaria

European maps genuinely used labels such as Tartary/Tartaria for broad areas of northern and central Asia. The Library of Congress preserves Abraham Ortelius's *Tartariae sive Magni Chami Regni tÿpus*, a map of northern Asia associated with his atlas tradition.[47]

Core Atlas should research the actual peoples, polities, and religious systems that broad European labels obscured, including where relevant:

- Tatars
- Mongols
- Golden Horde
- Crimean Khanate
- Kazan Khanate
- Astrakhan Khanate
- Siberian Khanate
- Nogai groups/polities
- Central Asian khanates
- Turkic peoples
- Mongolic peoples
- Siberian peoples
- Russian eastward expansion
- Islam among Tatar communities
- Inner Asian Buddhist traditions
- Tengrist/shamanic traditions
- trade routes
- political boundaries
- religious coexistence and conversion

Historical maps should be interpreted according to the cartographer's period and geographic conventions.

A map labeled “Tartary” is evidence that the mapmaker used that regional term; it is **not by itself evidence of one unified global empire**.

## Modern Tartaria / Tartarian Empire Claims

The future Contested History system should separately examine claims that Tartaria represented an advanced or global civilization deliberately erased from accepted history.

Frequently associated claims may include:

- mud-flood/reset theories
- buried ground floors
- star forts
- World's Fair architecture
- monumental civic buildings
- orphan-train narratives
- lost energy/free-energy systems
- domes/antennas
- altered chronology
- deliberately erased maps
- suppressed technology

Atlas should neither endorse nor dismiss these by label alone.

For each specific claim, investigate:

CLAIM STATEMENT

FIRST TRACEABLE MODERN SOURCE

HISTORICAL SOURCES CITED

MAPS / PHOTOGRAPHS / ARCHITECTURAL RECORDS CITED

PHYSICAL FEATURES CITED

DOCUMENTED CONSTRUCTION HISTORY

ARCHAEOLOGICAL EVIDENCE

GEOLOGICAL EVIDENCE

DEMOGRAPHIC RECORDS

EVIDENCE FOR

EVIDENCE AGAINST

SOURCE DERIVATION / CIRCULAR SOURCING

ALTERNATIVE EXPLANATIONS

WHAT REMAINS UNEXPLAINED

WHAT REMAINS UNKNOWN

Do not use a generic “debunked” badge as a substitute for claim-by-claim source analysis.

---

# XCIII. CONTESTED CIVILIZATION / “ERASED HISTORY” CLAIM FRAMEWORK

Generalize the Tartaria method for claims involving:

- erased civilizations
- civilization “resets”
- hidden advanced technology
- anomalous architecture
- allegedly impossible engineering
- hidden archaeological layers
- suppressed maps
- giant or anomalous human remains
- lost continents/civilizations
- institutional concealment
- religious suppression of earlier cultures

Create claim-level fields for:

- exact proposition
- earliest traceable source
- later source chain
- physical evidence claimed
- documentary evidence claimed
- scientific testing
- provenance
- established historical context
- alternative explanations
- independent corroboration
- institutional response
- reasons for rejection/acceptance in scholarship
- unresolved evidence
- confidence by evidence dimension

Do not convert:

“mainstream scholarship rejects this”

into:

“therefore every component claim is false.”

Likewise, do not convert:

“one anomaly remains unexplained”

into:

“therefore the larger civilization theory is proven.”

This framework belongs primarily in the future Contested History phase, but Phase 0 should ensure the core evidence architecture can support it.

---

# XCIV. INTERFAITH COEXISTENCE, PLURALISM, ECUMENISM, AND MODERN “COEXIST” SYMBOLISM

The audit already includes coexistence as an Encounter relation, but modern **interfaith / pluralist movements** deserve explicit coverage.

Add a later research domain for:

- interfaith dialogue
- ecumenism
- religious pluralism
- coexistence movements
- Parliament of the World's Religions
- interreligious peace initiatives
- shared sacred spaces
- multi-faith institutions
- state models of toleration/pluralism
- perennial philosophy
- universal-religion movements
- Bahá'í approaches to religious unity
- Unitarian Universalist interfaith approaches
- modern “COEXIST” symbolism/campaigns and their histories
- religious critiques of pluralism/coexistence
- cases where communities historically shared saints, shrines, pilgrimage sites, or ritual spaces

Distinguish:

DOCUMENTED HISTORICAL COEXISTENCE

LEGAL TOLERATION

SOCIAL COEXISTENCE

SHARED SACRED PRACTICE

INTERFAITH MOVEMENT

THEOLOGICAL PLURALISM

MODERN SYMBOL / CAMPAIGN

Do not assume “coexistence” means absence of inequality, conflict, legal hierarchy, or theological disagreement.

---

# XCV. PHASE 0 BASELINE ADDITIONS FOR KNOWLEDGE LOSS, SITE LAYERS, AND CONTESTED CIVILIZATION CLAIMS

Add baseline counts for:

- sacred places with multiple historical religious phases
- site-phase records
- sacred-site reuse/conversion events
- sacred-site destruction events
- spolia/material-reuse events
- archaeological rediscovery events
- knowledge-center records
- library/archive/scriptorium records
- knowledge-destruction events
- manuscript-dispersal events
- knowledge-rescue/preservation events
- reconstructed/lost-work survival chains
- deliberate cultural-erasure events
- documented language/script suppression events
- place-name replacement events
- “Show What Was Here Before?” eligible locations
- historical Tartary/Tartaria map/source records
- modern Tartaria claims
- erased-civilization/reset claims
- interfaith/coexistence movement records
- shared sacred-site records

If current count is zero, report zero.

---

# XCVI. QUALITY TESTS FOR SACRED-SITE REUSE, KNOWLEDGE LOSS, AND ERASED-HISTORY CLAIMS

Add future tests ensuring:

1. A later religious building on an earlier sacred site does not automatically create a deliberate-erasure claim.
2. Site reuse, site destruction, site conversion, site sharing, and spolia remain separate event types.
3. Archaeological evidence and later religious legend remain separately labeled.
4. Political conquest does not automatically imply immediate population conversion.
5. Institutional religious change remains distinct from demographic religious change.
6. “Show What Was Here Before?” uses dated site phases rather than speculative reconstruction.
7. Unknown earlier phases remain unknown.
8. Knowledge-center destruction claims distinguish primary evidence from later legend.
9. “Library destroyed” does not imply every work held there vanished if copies survived elsewhere.
10. Knowledge rescue, copying, translation, and dispersal are modeled alongside destruction.
11. Alexandria is not represented as securely destroyed in one universally agreed single event.
12. Bayt al-Hikma is not presented as a modern-style university without qualification.
13. Famous literary images about the destruction of books are labeled according to their source status.
14. Historical Tartary/Tartaria remains distinct from modern Tartarian Empire theories.
15. An old map label does not automatically establish a unified political empire.
16. Modern Tartaria claims retain their original source chains.
17. A buried building story requires documented architectural/urban/geological evidence before becoming a reset claim.
18. An unexplained architectural feature does not automatically prove suppressed technology.
19. Mainstream rejection of a large theory does not prevent Atlas from preserving any genuine unresolved sub-question.
20. One unresolved anomaly does not prove the broader contested theory.
21. Civilizational erasure is used only when evidence supports intentional suppression/replacement.
22. Normal historical change and accidental loss remain distinct from deliberate erasure.
23. Shared sacred-site history preserves multiple communities' claims and uses.
24. Modern “COEXIST” symbolism is not confused with historical coexistence itself.
25. Interfaith coexistence is not portrayed as proof that conflict, hierarchy, or discrimination was absent.

---

# XCVII. REVISED FINAL PRE-PHASE-0 REQUIREMENTS

The final consolidated pre-Phase-0 addendum should now also require Phase 0 to answer:

### Can Atlas represent a place whose sacred function changed repeatedly over two thousand years?

If no, sacred-site history is still too static.

### Can Atlas distinguish conquest from conversion?

If no, historical religious geography remains unsafe.

### Can Atlas show what knowledge was destroyed and what knowledge survived elsewhere?

If no, knowledge-loss history remains sensational rather than scholarly.

### Can Atlas distinguish deliberate civilizational erasure from abandonment, economic decline, assimilation, or accidental loss?

If no, the historical-replacement model is too blunt.

### Can Atlas trace an “erased civilization” theory back to its first modern source and compare it against archaeology, geology, maps, architectural records, and independent corroboration?

If no, Contested History is not ready.

### Can Atlas distinguish historical Tartary from modern Tartaria theories?

If no, historical geography and contested-history claims are being conflated.

### Can a user click a site and ask “What was here before?”

If no, the map is missing one of the strongest bridges among religion, archaeology, conquest, architecture, and cultural memory.

### Can Atlas distinguish coexistence as a historical condition from modern interfaith/COEXIST movements?

If no, religious encounter remains under-modeled.

These requirements are additive to the existing structural questions in Section LXXXIII.

---

---

# Sources

1. Ninian Smart, *Dimensions of the Sacred*, University of California Press. https://www.ucpress.edu/books/dimensions-of-the-sacred/paper
2. Meredith B. McGuire, *Lived Religion: Faith and Practice in Everyday Life*, Oxford University Press. https://academic.oup.com/book/3374
3. Harvard Division of Continuing Education, “Ritual and Material Religion: Bodies, Objects, and Places.” https://coursebrowser.dce.harvard.edu/course/ritual-and-material-religion-bodies-objects-and-places/
4. UNESCO Intangible Cultural Heritage, “Social practices, rituals and festive events.” https://ich.unesco.org/en/social-practices-rituals-and-00055
5. UNESCO Intangible Cultural Heritage, “Intangible Heritage domains in the 2003 Convention.” https://ich.unesco.org/en/intangible-heritage-domains-00052
6. World Historical Gazetteer, “Place Record Anatomy.” https://docs.whgazetteer.org/content/v4/user-guide/places/record-anatomy.html
7. PeriodO, “Technical Overview.” https://perio.do/technical-overview/
8. UNESCO Intangible Cultural Heritage, “Kumbh Mela.” https://ich.unesco.org/en/RL/kumbh-mela-01258
9. UNESCO World Heritage Centre, “Wixárika Route through Sacred Sites to Wirikuta.” https://whc.unesco.org/en/list/1704
10. UNESCO Intangible Cultural Heritage, “Knowledge and practices concerning nature and the universe.” https://ich.unesco.org/en/knowledge-concerning-nature-00056
11. Harvard Center for the Study of World Religions, “Africana Religions.” https://cswr.hds.harvard.edu/news/2026/07/14/africana-religions
12. Santa Clara University, Living Religion Collaborative, “What is Living Religion?” https://www.scu.edu/livingreligions/about-the-lrc/what-is-living-religion/
13. J. D. Y. Peel, “Syncretism and Religious Change,” *Comparative Studies in Society and History*. https://www.cambridge.org/core/journals/comparative-studies-in-society-and-history/article/syncretism-and-religious-change/353FBF4E57D1D5F0FA752C722FCF66B0
14. Harvard Center for the Study of World Religions, “Holy Things and the Spectre of Syncretism in Thai Religion.” https://cswr.hds.harvard.edu/news/2024/12/holy-things-and-spectre-syncretism-thai-religion
15. Pew Research Center, “Many Religious ‘Nones’ Around the World Hold Spiritual Beliefs,” 2025. https://www.pewresearch.org/religion/2025/09/04/many-religious-nones-around-the-world-hold-spiritual-beliefs/
16. Pew Research Center, “What do religious ‘nones’ believe?” 2025. https://www.pewresearch.org/religion/2025/09/04/what-do-religious-nones-believe/
17. Pew Research Center, “Around the World, Many People Are Leaving Their Childhood Religions,” 2025. https://www.pewresearch.org/religion/2025/03/26/around-the-world-many-people-are-leaving-their-childhood-religions/
18. Stanford Encyclopedia of Philosophy, “Religious Experience.” https://plato.stanford.edu/entries/religious-experience/
19. Stanford Encyclopedia of Philosophy, “Mysticism.” https://plato.stanford.edu/entries/mysticism/
20. UNESCO Intangible Cultural Heritage, “Mwazindika spiritual dance of the Daida community of Kenya.” https://ich.unesco.org/en/USL/mwazindika-spiritual-dance-of-the-daida-community-of-kenya-02297
21. UNESCO Intangible Cultural Heritage, “Andean cosmovision of the Kallawaya.” https://ich.unesco.org/en/RL/andean-cosmovision-of-the-kallawaya-00048
22. UNESCO Intangible Cultural Heritage, “Pilgrimage to Wirikuta” decision. https://ich.unesco.org/en/decisions/8.COM/7.A.8
23. Metropolitan Museum of Art, “Amulets and Talismans from the Islamic World.” https://www.metmuseum.org/essays/amulets-and-talismans-from-the-islamic-world
24. Cambridge University Press, “Material Culture,” *Cambridge Companion to Counter-Reformation Sanctity*. https://www.cambridge.org/core/books/abs/cambridge-companion-to-counterreformation-sanctity/material-culture/51E2383F4BBCB8720DD05586ED4B811A
25. Text Encoding Initiative, “Critical Apparatus.” https://tei-c.org/release/doc/tei-p5-doc/en/html/TC.html
26. UNESCO Intangible Cultural Heritage, “Performing arts.” https://ich.unesco.org/en/performing-arts-00054
27. UNESCO Intangible Cultural Heritage, “Traditions and practices associated with the Kayas in the sacred forests of the Mijikenda.” https://ich.unesco.org/en/RL/traditions-and-practices-associated-with-the-kayas-in-the-sacred-forests-of-the-mijikenda-00313
28. CIDOC CRM, “Definition of the CIDOC Conceptual Reference Model v7.1.1.” https://cidoc-crm.org/Resources/definition-of-the-cidoc-conceptual-reference-model-v7.1.1
29. U.S. National Park Service, NAGPRA, “Repatriation of Cultural Items.” https://www.nps.gov/subjects/nagpra/repatriation-of-cultural-items.htm
30. UNESCO, “Illicit trafficking and protection of cultural property.” https://www.unesco.org/en/trafico-ilicito-bienes-culturales
31. International Council of Museums, “International repatriation of human remains of indigenous peoples.” https://icom.museum/en/news/international-repatriation-of-human-remains-of-indigenous-peoples/
32. Local Contexts, “Traditional Knowledge Labels.” https://localcontexts.org/labels/traditional-knowledge-labels/
33. World Historical Gazetteer, “Understanding WHG Concepts.” https://docs.whgazetteer.org/content/v4/user-guide/getting-started/concepts.html
34. Getty Research Institute, “Getty Vocabularies.” https://www.getty.edu/research/tools/vocabularies/
35. IIIF, “Presentation API 3.0.” https://iiif.io/api/presentation/3.0/
36. International Dunhuang Programme, “A Question of Terminology: Codicology and Palaeography.” https://idp.bl.uk/blog/a-question-of-terminology-codicology-and-palaeography/
37. International Dunhuang Programme, “Spring 2007,” manuscript fibre/codicology research. https://idp.bl.uk/newsletters/spring-2007/
38. Adam Bajan and Heidi A. Campbell, “Digital Religion,” *Cambridge Handbook of Cyber Behavior*. https://www.cambridge.org/core/books/abs/cambridge-handbook-of-cyber-behavior/digital-religion/334CD97B7A151B23E8A880FF93E0CC3B
39. Stanford Freeman Spogli Institute, “Modernization and the Global Islamic Revival,” 2026. https://fsi.stanford.edu/news/modernization-and-global-islamic-revival
40. Stanford Encyclopedia of Philosophy, “The Concept of Religion.” https://plato.stanford.edu/entries/concept-religion/
41. Pew Research Center, “Folk Religionists.” https://www.pewresearch.org/religion/2012/12/18/global-religious-landscape-folk/
42. Jon Michael Frey, “Spolia and the ‘Victory of Christianity’,” *The Oxford Handbook of Early Christian Archaeology*, Oxford University Press, 2019. https://academic.oup.com/edited-volume/28038/chapter-abstract/211928677
43. Instituto Nacional de Antropología e Historia (INAH), “Cruz atrial sobre el valle de Cholula,” documenting the Sanctuary of Nuestra Señora de los Remedios and the 1594 hermitage on the Great Pyramid; see also INAH’s Cholula archaeological-zone materials. https://inah.gob.mx/foto-del-dia/cruz-atrial-sobre-el-valle-de-cholula
44. Institute of Ismaili Studies, “Bayt al-Ḥikma,” describing the Abbasid caliphal research/teaching, library, and translation context. https://www.iis.ac.uk/glossary/bayt-al-%E1%B8%A5ikma/
45. Ekmeleddin İhsanoğlu, *The Abbasid House of Wisdom: Between Myth and Reality*, Routledge/Taylor & Francis, 2022. https://books.google.com/books?id=ZeR8EAAAQBAJ
46. The Open University, “Library of Alexandria: The destruction of the library,” reviewing the competing destruction traditions and evidentiary problems. https://www.open.edu/openlearn/history-the-arts/library-alexandria/content-section-3
47. Library of Congress, Abraham Ortelius, *Tartariae sive Magni Chami Regni tÿpus*, Geography and Map Division. https://www.loc.gov/resource/g7270.mf000002/
48. UNESCO World Heritage Centre, “Reconstruction of the destroyed mausoleums of Timbuktu (Mali),” including documented manuscript losses and heritage destruction. https://whc.unesco.org/en/activities/1099
49. UNESCO, “Revive the Spirit of Mosul: About the initiative,” documenting destruction and looting of monuments, libraries, rare books, manuscripts, and artifacts. https://www.unesco.org/en/revive-mosul/about
