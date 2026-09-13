You are working on my existing application:

Repository:
https://github.com/Byrd11811/Religion.git

Local application:
http://127.0.0.1:3000/

The application is called **Atlas — Humanity’s Search for Meaning**.

Do NOT start over and do NOT replace the existing architecture unnecessarily.

The existing repository already contains a substantial working application with hundreds of metadata records, searchable primary-source content, Question Explorer, comparison tools, timeline, map, canon browsing, relationship graphs, citations, collections, PostgreSQL/PGlite, pgvector support, tests, and source/copyright policies.

Your job is to **expand Atlas dramatically in depth, breadth, imagery, historical context, manuscript coverage, evidence transparency, and cross-text analysis while preserving everything already working.**

Before modifying code, read:

* `AGENTS.md`
* `README.md`
* `docs/product-spec.md`
* `docs/source-policy.md`
* `docs/coverage.md`
* database schema
* current seed files
* ingestion scripts
* AI/retrieval architecture
* existing tests
* current Next.js documentation bundled with this version of Next.js as instructed by `AGENTS.md`

Treat the current repository and `docs/product-spec.md` as the baseline.

This instruction expands and supersedes any previous numeric corpus limit.

---

# PRODUCT MISSION

Atlas is not intended to prove one religion right or another religion wrong.

The purpose is to show humanity’s broad search for meaning across religion, philosophy, mythology, spirituality, mysticism, ritual, skepticism, oral traditions, literature, archaeology, manuscripts, inscriptions, and controversial or alternative traditions.

Core principle:

> Atlas does not decide what is true. It shows what humanity has written, preserved, believed, argued, imagined, disputed, lost, reconstructed, suppressed, and transmitted, while clearly showing the strength of the evidence behind each claim.

The application must remain neutral.

Do not privilege:

* Christianity
* Judaism
* Islam
* Hinduism
* Buddhism
* atheism
* skepticism
* science
* occult traditions
* modern spirituality
* Indigenous traditions

as the assumed default worldview.

Every tradition should be examined using the same evidence-aware framework.

---

# NO HARD CORPUS LIMIT

Do not design Atlas around 100, 250, 500, or even 1,000 books.

Those are milestones only.

The architecture must have no artificial upper limit.

Long-term Atlas should support thousands or tens of thousands of:

* works
* fragments
* manuscripts
* inscriptions
* papyri
* tablets
* codices
* scrolls
* oral-tradition records
* archaeological artifacts
* lost texts
* reconstructed texts
* disputed works
* modern religious texts
* philosophical works
* literary works
* images
* secondary scholarly records

Comprehensiveness means broad inclusion with honest uncertainty.

It does NOT mean pretending that every source survived or every interpretation is equally supported.

---

# CRITICAL DATA-MODEL CHANGE

Do not treat every ancient source as a modern “book.”

Atlas needs to distinguish:

**Work**

from

**Recension / textual family**

from

**Physical witness**

from

**Artifact**

from

**Image**

from

**Edition / translation**

Example:

Work:
Book of the Dead

Recension:
New Kingdom Theban tradition

Witness:
Papyrus of Ani

Artifact:
museum inventory record

Images:
individual photographed sheets

Edition:
specific translation

Add or expand schema for:

## Works

Fields should support:

* id
* canonical title
* alternate titles
* tradition
* work type
* genre
* canon status
* composition start
* composition end
* composition-date notes
* date confidence
* original language
* script
* origin region
* cultural context
* authorship summary
* authorship confidence
* description
* historical context
* transmission summary
* decipherment status
* coverage status
* copyright status
* source quality
* scholarly review status

## Recensions / textual families

Support multiple forms of a work.

## Witnesses

Support:

* tablet
* papyrus
* scroll
* codex
* parchment
* inscription
* stela
* coffin
* tomb wall
* temple wall
* ostracon
* bamboo slip
* silk manuscript
* oracle bone
* wooden tablet
* palm-leaf manuscript
* bark manuscript
* metal inscription
* stone inscription
* printed edition
* oral/audio transcription
* other

Witness fields should include:

* inventory number
* repository
* discovery location
* current location
* date range
* material
* language
* script
* condition
* completeness
* provenance
* digitization URL
* IIIF manifest
* rights statement

## Editions

Support:

* translator
* editor
* edition
* publication year
* original language
* translation language
* completeness
* copyright/license
* source URL
* SHA-256 or provenance hash
* witness association

## Images

Support:

* work
* witness
* artifact
* title
* institution
* museum object number
* date
* culture
* creator
* image URL
* thumbnail
* IIIF service
* source page
* copyright/license
* rights statement
* required attribution
* public-domain status
* caption
* geography

---

# SOURCE COVERAGE STATUS

Every work should clearly indicate source depth.

Possible statuses:

* Complete named work
* Complete available edition
* Substantial selection
* Partial translation
* Fragments
* Metadata only
* Image only
* Transliteration only
* Undeciphered
* Partially deciphered
* Disputed decipherment
* Lost
* Reconstructed
* Hypothetical
* Restricted

Create a visible **Source Depth Indicator**.

Example:

Pyramid Texts

Metadata: Extensive
Primary text: Substantial
Translation: Available
Original language: Partial
Witness imagery: Available
Scholarship: Moderate
Relationships: Developing

---

# EVIDENCE STATUS

Every text, relationship, or historical claim must support evidence classifications such as:

* Securely attested
* Strong scholarly consensus
* Majority scholarly position
* Disputed
* Speculative
* Fragmentary
* Indirectly attested
* Lost
* Reconstructed
* Hypothetical
* Undeciphered
* Partially deciphered
* Disputed authenticity
* Suspected forgery
* Demonstrated forgery
* Hoax-associated
* Restricted / culturally sensitive
* Banned / suppressed
* Controversial

Important:

**Banned does not mean true.**

**Canonical does not mean historically verified.**

**Noncanonical does not mean false.**

**Ancient does not necessarily mean authentic.**

**Speculative does not mean worthless.**

**Popular does not mean scholarly.**

**Similarity does not automatically prove borrowing.**

---

# ANCIENT EGYPT — MAKE THIS ONE OF THE DEEPEST COLLECTIONS

Create a dedicated Ancient Egypt collection.

Allow filtering by:

* Old Kingdom
* First Intermediate Period
* Middle Kingdom
* Second Intermediate Period
* New Kingdom
* Third Intermediate Period
* Late Period
* Ptolemaic Period
* Roman Egypt

Also distinguish:

* funerary religion
* royal ideology
* temple theology
* wisdom literature
* popular religion
* magical practice
* hymns
* ritual
* narrative literature
* creation traditions
* afterlife traditions

Include at minimum:

## Funerary

* Pyramid Texts
* Coffin Texts
* Book of the Dead / Book of Going Forth by Day
* Amduat
* Book of Gates
* Book of Caverns
* Book of the Earth
* Litany of Re
* Book of the Heavenly Cow
* Book of Nut
* Books of Breathing
* Book of Traversing Eternity
* Opening of the Mouth ritual
* tomb liturgies
* royal mortuary texts

## Wisdom / Instruction

* Instruction of Ptahhotep
* Instruction of Kagemni
* Instruction of Hordedef
* Teaching for King Merikare
* Instruction of Amenemhat
* Loyalist Teaching
* Instruction of Amenemope
* Instruction of Ani
* Instruction of Ankhsheshonq
* Satire of the Trades / Instruction of Khety
* other documented sebayt literature

## Stories / Literature

* Tale of Sinuhe
* Westcar Papyrus / Tales of the Court of Khufu
* Tale of the Shipwrecked Sailor
* Tale of the Eloquent Peasant
* Tale of Two Brothers
* Wenamun
* The Doomed Prince
* Truth and Falsehood
* Contendings of Horus and Seth
* Setna I
* Setna II
* Capture of Joppa
* Dialogue / Dispute of a Man with His Ba
* Harper’s Songs
* Admonitions of Ipuwer
* Prophecy of Neferti
* Apophis and Seqenenre
* Bentresh Stela narrative

## Theology / Hymns

* Great Hymn to the Aten
* Hymns to Amun
* Leiden Hymns
* Memphite Theology / Shabaka Stone
* Bremner-Rhind Papyrus
* Dramatic Ramesseum Papyrus
* hymns to Osiris
* hymns to Ra
* temple liturgies

## Magic / Esoteric

* Metternich Stela
* Harris Magical Papyrus
* London-Leiden Demotic Magical Papyrus
* relevant Greek Magical Papyri
* Book of Thoth
* Book of the Faiyum
* dream texts
* protective spells
* amulet texts
* execration texts

## Historical / Religious inscriptions

* Dream Stele
* Famine Stele
* Merneptah Stele
* Piye Victory Stela
* Abydos King List
* Karnak inscriptions
* pyramid inscriptions
* temple inscriptions
* divine kingship texts

Create a visual research path:

**Evolution of the Egyptian Afterlife**

Pyramid Texts
→ Coffin Texts
→ Book of the Dead
→ Amduat
→ Book of Gates
→ later funerary traditions

---

# MESOPOTAMIA AND ANUNNAKI

Create a major Mesopotamian Text Lab.

Search must normalize:

* Anunna
* Anunnaki
* Anuna gods
* variant spellings and transliterations

Include:

* Epic of Gilgamesh
* Atrahasis
* Enuma Elish
* Eridu Genesis
* Descent of Inanna
* Descent of Ishtar
* Enki and Ninhursag
* Enki and Ninmah
* Enki and the World Order
* Enki’s Journey to Nippur
* Inanna and Enki
* Inanna and Ebih
* Inanna and Shukaletuda
* Enmerkar and the Lord of Aratta
* Enmerkar and En-suhgir-ana
* Lugalbanda cycles
* Gilgamesh, Enkidu and the Netherworld
* Death of Gilgamesh
* Nergal and Ereshkigal
* Erra and Ishum
* Anzu
* Etana
* Adapa
* Sumerian King List
* Instructions of Shuruppak
* Lament for Ur
* Lament for Sumer and Ur
* Ludlul bel nemeqi
* Babylonian Theodicy
* Dialogue of Pessimism
* Marduk Ordeal traditions
* Assyrian religious inscriptions
* Babylonian ritual texts
* Maqlu
* omen collections
* god lists
* temple hymns
* Gudea Cylinders
* other Sumerian and Akkadian works mentioning Anunna/Anunnaki

Use ORACC and CDLI identifiers wherever possible.

Support:

* tablet ID
* P-number
* museum inventory number
* excavation site
* provenance
* transliteration
* translation
* tablet photography

Create a separate section:

**Modern Anunnaki Interpretations**

This may contain:

* Zecharia Sitchin
* ancient-astronaut theories
* modern esoteric interpretations
* popular media interpretations

But NEVER mix those into ancient translations.

Create four tabs:

Primary Sources
Mainstream Scholarship
Alternative Interpretations
Modern / Popular Claims

Create:

**Ancient Text vs Modern Claim**

comparison mode.

---

# UNDECIPHERED AND PARTIALLY DECIPHERED MATERIAL

Create a dedicated collection.

Include:

* Indus script
* Linear A
* Cretan Hieroglyphic
* Phaistos Disc
* Cypro-Minoan
* Rongorongo
* Proto-Elamite unresolved material
* Byblos syllabary
* Vinča symbols with writing-status debate
* Voynich Manuscript
* other major unresolved sign systems

Absolute rule:

> Atlas must NEVER invent a translation for an undeciphered source.

Pages should show:

* artifact
* age
* discovery
* sign inventory
* probable language if any
* decipherment attempts
* strongest scholarly hypotheses
* strongest objections
* images
* bibliography
* what is known
* what is unknown

Display prominently:

**No accepted translation exists**

where appropriate.

---

# MANUSCRIPT & SCROLL EXPLORER

Create a cross-tradition manuscript system.

Include:

## Jewish / Christian

* Dead Sea Scrolls
* Great Isaiah Scroll
* Community Rule
* War Scroll
* Thanksgiving Hymns
* Damascus Document
* Temple Scroll
* Copper Scroll
* Qumran biblical manuscripts
* Codex Sinaiticus
* Codex Vaticanus
* Codex Alexandrinus
* Codex Bezae
* Codex Ephraemi Rescriptus

## Gnostic / Alternative Christianity

* Nag Hammadi Codices
* Codex Tchacos
* Askew Codex
* Bruce Codex
* Berlin Codex

## Classical

* Derveni Papyrus
* Oxyrhynchus Papyri
* Herculaneum Papyri
* Greek Magical Papyri

## Egypt / Judaism

* Elephantine Papyri
* Nash Papyrus
* related Egyptian Jewish material

## Asia

* Dunhuang manuscripts
* Mawangdui silk manuscripts
* Guodian Chu slips
* Shuihudi bamboo slips
* Turfan manuscripts
* Gandharan Buddhist manuscripts
* Gilgit manuscripts
* Tibetan Dunhuang manuscripts

Support individual fragments and witness-level images.

---

# CHINA — DO NOT TREAT CHINESE RELIGION AS ONLY TAOISM AND CONFUCIANISM

Create a major Chinese Traditions collection.

## Confucian / Ru

Include:

* Analects
* Mencius
* Great Learning
* Doctrine of the Mean
* Book of Rites
* Classic of Filial Piety
* Spring and Autumn Annals
* Zuo Commentary
* Book of Documents
* Book of Songs
* I Ching / Zhouyi
* Xunzi
* Kongzi Jiayu
* major commentaries

## Daoist

Include:

* Dao De Jing
* Zhuangzi
* Liezi
* Huainanzi
* Wenzi
* Baopuzi
* Taiping Jing
* Cantong Qi
* Huangting Jing
* Qingjing Jing
* Neiye
* Zuowanglun
* Wuzhen Pian
* Shangqing texts
* Lingbao texts
* Quanzhen texts
* Daozang metadata

## Chinese Buddhism

Include:

* Chinese Agamas
* Heart Sutra
* Diamond Sutra
* Lotus Sutra
* Avatamsaka Sutra
* Vimalakirti Sutra
* Amitabha Sutra
* Infinite Life Sutra
* Contemplation Sutra
* Lankavatara Sutra
* Nirvana Sutra
* Platform Sutra
* Awakening of Faith
* Tiantai writings
* Huayan writings
* Chan records
* Blue Cliff Record
* Gateless Gate
* Transmission of the Lamp
* Pure Land writings
* Chinese Buddhist canon metadata

## Other schools

Include:

* Mozi
* Mohist Canons
* Han Feizi
* Book of Lord Shang
* Shen Buhai fragments
* Gongsun Longzi
* Hui Shi fragments
* Yangist fragments
* syncretic texts

## Folk religion

Include public/sourceable materials involving:

* ancestor veneration
* City Gods
* Mazu
* Guandi
* Jade Emperor
* spirit registers
* ritual manuals
* baojuan / precious scrolls

## Cross-cultural Chinese traditions

Include:

* Chinese Manichaean texts
* Jingjiao / Church of the East Chinese texts
* Chinese Islamic writings
* syncretic religions
* later salvationist movements

Store:

* Chinese characters
* Chinese title
* pinyin
* alternate transliteration
* original witness
* translation provenance
* human vs AI translation label

---

# ETHIOPIAN / ERITREAN / HORN OF AFRICA

Create a major top-level collection:

**Ethiopia, Eritrea & Horn of Africa**

Treat the Ethiopian Orthodox Tewahedo tradition independently.

Do not reduce it to a Western Bible translation.

Represent its broader canonical tradition and differing enumeration carefully.

Include:

* Ethiopian Torah / Old Testament traditions
* Enoch
* Jubilees
* Ethiopian Meqabyan books
* Tobit
* Judith
* Wisdom literature
* Sirach
* Ethiopian biblical manuscripts
* New Testament
* Revelation
* Sinodos material
* Books of Covenant
* Ethiopic Clement traditions
* Ethiopic Didascalia
* church-order collections
* canonical regulations
* Kebra Nagast
* Ethiopian Synaxarium / Senkessar
* Miracles of Mary traditions
* Gadl / saints’ lives
* Deggwa / Saint Yared
* Ge’ez hymnody
* Ethiopian liturgies
* Qeddase
* Marian literature
* monastic writings
* royal religious chronicles
* Ethiopian apocalyptic texts
* prayer scrolls
* Ge’ez commentaries
* Andemta tradition
* manuscript catalogs

Also create independent coverage for:

**Eritrean Orthodox Tewahedo**

with cross-links to shared Ge’ez heritage.

Create:

**Beta Israel**

including:

* Orit
* Sabbath texts
* law
* prayers
* Ge’ez traditions
* oral traditions
* community interpretation

Also include:

* Ethiopian Islamic manuscripts
* Harari Islamic traditions
* Somali Islamic scholarship
* Sufi texts
* regional Qur’an manuscripts

Expand neighboring traditions:

* Coptic Christianity
* Sahidic
* Bohairic
* Coptic apocrypha
* Shenoute
* Pachomian literature
* Old Nubian Christianity
* Nubian inscriptions
* regional Christian archaeology

---

# AFRICAN TRADITIONAL RELIGIONS

Do not create one generic “African religion.”

Represent specific peoples and traditions.

Include broad coverage for:

* Yoruba / Ifa / Odu
* Oriki
* Fon / Vodun
* Akan
* Ewe
* Igbo
* Dogon
* Mande
* Serer
* Edo / Benin
* Kongo
* Luba
* Kuba
* Fang
* Dinka
* Nuer
* Maasai
* Luo
* Kikuyu
* Oromo / Waaqeffanna
* Zulu
* Xhosa
* San / Khoisan
* Sotho-Tswana
* Shona
* Great Zimbabwe religious archaeology
* other responsibly documented traditions

For oral traditions track:

* community
* language
* transcriber
* collector
* date
* outsider/community member status
* variant versions
* cultural restrictions

---

# MESOAMERICA

Create very deep Maya and Nahua/Aztec coverage.

## Maya

Include:

* Popol Vuh
* Dresden Codex
* Madrid Codex
* Paris Codex
* Maya Codex of Mexico / Grolier with authentication history
* Books of Chilam Balam
* Ritual of the Bacabs
* Annals of the Kaqchikels
* Rabinal Achi
* Palenque inscriptions
* Copan inscriptions
* Tikal inscriptions
* Yaxchilan inscriptions
* Quirigua inscriptions
* calendrical texts
* Hero Twins traditions
* creation traditions
* cave ritual texts
* colonial Maya religious records

## Nahua / Mexica / Aztec

Include:

* Florentine Codex
* Primeros Memoriales
* Codex Borgia
* Codex Borbonicus
* Codex Mendoza
* Codex Magliabechiano
* Codex Telleriano-Remensis
* Codex Rios
* Codex Aubin
* Codex Boturini
* Cantares Mexicanos
* Huehuetlahtolli
* Annals of Cuauhtitlan
* Legend of the Suns
* Five Suns traditions
* Quetzalcoatl traditions
* deity hymns
* prayers
* ritual calendars

## Mixtec

Include:

* Codex Zouche-Nuttall
* Codex Bodley
* Codex Selden
* Codex Vindobonensis

Also cover:

* Zapotec
* Totonac
* Huastec
* Purepecha
* Olmec religious archaeology
* Teotihuacan religion
* other documented Mesoamerican traditions

---

# SOUTH AMERICA

Include:

## Inca / Quechua

* Huarochiri Manuscript
* Viracocha traditions
* Inca origin narratives
* Manco Capac
* ritual hymns
* huaca traditions
* colonial Quechua manuscripts
* khipu research
* Indigenous testimony preserved by chroniclers

## Aymara

Include public cosmological and ritual traditions.

## Mapuche

Include public cosmology and ritual material.

## Amazonia

Represent public/sourceable traditions from peoples including:

* Tukano
* Yanomami
* Shipibo-Conibo
* Ashaninka
* Guarani
* Kayapo
* others

Do not expose restricted ritual knowledge.

---

# NORTH AMERICAN INDIGENOUS TRADITIONS

Do NOT create one generic Native American religion.

Create distinct records where public/sourceable for:

* Dine / Navajo
* Hopi
* Zuni
* Pueblo peoples
* Apache
* Lakota
* Dakota
* Nakota
* Blackfoot
* Crow
* Cheyenne
* Pawnee
* Comanche
* Kiowa
* Osage
* Muscogee / Creek
* Seminole
* Cherokee
* Choctaw
* Chickasaw
* Haudenosaunee
* Great Law of Peace
* Ojibwe / Anishinaabe
* Potawatomi
* Menominee
* Shawnee
* Lenape
* Powhatan
* Wampanoag
* Mi’kmaq
* Passamaquoddy
* Salish
* Coast Salish
* Tlingit
* Haida
* Tsimshian
* Kwakwaka’wakw
* Nuu-chah-nulth
* Inuit
* Yupik
* Unangan / Aleut
* others

For every oral source identify:

* nation/community
* language
* source
* version
* recorder
* recorder date
* cultural context
* whether reproduction is permitted

---

# OCEANIA

Include:

## Polynesia

* Kumulipo
* Hawaiian creation chants
* Hawaiian genealogies
* Maori creation traditions
* whakapapa
* Rangi and Papa
* Maui cycles
* Samoan traditions
* Tongan traditions
* Tahitian traditions
* Marquesan traditions
* Rapa Nui traditions
* Tuamotu traditions

## Micronesia

Include documented traditions across:

* Marshall Islands
* Palau
* Yap
* Pohnpei
* Chuuk
* Kosrae
* others

## Melanesia

Include public traditions from:

* Papua New Guinea
* Solomon Islands
* Vanuatu
* Fiji
* New Caledonia
* others

## Aboriginal Australia

Represent publicly available:

* Dreaming traditions
* ancestral beings
* creation narratives
* rock art
* public song cycles
* public ethnographic records

Do NOT ingest secret/restricted ceremonial material merely because it can be found online.

---

# CIRCUMPOLAR / SIBERIAN / CENTRAL ASIAN

Include:

* Sami
* Nenets
* Evenki
* Even
* Sakha / Yakut
* Chukchi
* Koryak
* Yukaghir
* Siberian shamanic traditions
* Ainu
* Mongolian shamanism
* Buryat
* Tuvan
* Tengri / Tengrism
* Turkic religious traditions

Also include:

* Manichaean Central Asian manuscripts
* Sogdian religious texts
* Tocharian Buddhist manuscripts
* Uyghur Buddhist/Manichaean material
* Armenian Christianity
* Georgian Christianity
* Caucasian traditions
* Yazidi traditions
* Yarsan / Ahl-e Haqq
* Mandaean texts

---

# SOUTH AND SOUTHEAST ASIA

Beyond Hinduism, Buddhism, Jainism, and Sikhism, include public material from:

* Santhal
* Gond
* Munda
* Bhil
* Khasi
* Naga traditions
* other Adivasi traditions
* Vietnamese folk religion
* Cao Dai
* Hoa Hao
* Thai spirit traditions
* Burmese nat religion
* Cambodian traditions
* Lao traditions
* Balinese religion
* Javanese Kejawen
* Sundanese traditions
* Dayak traditions
* Batak manuscripts
* Philippine Indigenous traditions
* Ifugao traditions
* Borneo traditions
* Timorese religion

---

# JAPAN AND KOREA

Japan:

* Kojiki
* Nihon Shoki
* Norito
* Engishiki religious sections
* Fudoki
* Shinto shrine texts
* Shingon
* Tendai
* Pure Land
* Zen
* Shugendo
* Onmyodo
* Ryukyuan religion
* Ainu separately

Korea:

* Muism / Korean shamanism
* Samguk Yusa
* Korean Buddhism
* Korean Confucianism
* Cheondoism
* Won Buddhism
* Daejonggyo
* other modern traditions

---

# CODEX GIGAS

Add a dedicated Codex Gigas / Devil’s Bible manuscript page.

Important:

It is a manuscript compilation, not an independent scripture.

Represent:

* biblical material
* historical works
* medical material
* penitential material
* calendar material
* magical/conjuration material
* documented manuscript contents

Include:

* manuscript date
* Bohemian origin
* National Library of Sweden
* high-quality manuscript images
* devil portrait
* Heavenly City image
* codicology
* history

Create:

**Legend vs Evidence**

to distinguish famous legends from manuscript scholarship.

---

# WESTERN GRIMOIRES / OCCULT / DEMONOLOGY

Include:

* Lesser Key of Solomon / Lemegeton
* Ars Goetia
* Ars Theurgia-Goetia
* Ars Paulina
* Ars Almadel
* Ars Notoria
* Greater Key of Solomon
* Testament of Solomon
* Sworn Book of Honorius
* Book of Abramelin
* Picatrix
* Heptameron
* Arbatel
* Grimorium Verum
* Grand Grimoire
* Sixth and Seventh Books of Moses
* Solomonic manuscript traditions
* Dictionnaire Infernal
* Malleus Maleficarum
* Three Books of Occult Philosophy
* Corpus Hermeticum
* Hermetic texts
* alchemical religious works
* other important grimoires

Do not label all occult material Satanic.

Distinguish:

* ritual magic
* ceremonial magic
* Christian occultism
* demonology
* angelology
* Hermeticism
* alchemy
* folklore
* literary demonology

---

# RELIGIOUS / METAPHYSICAL LITERATURE

Include:

* Dante Inferno
* Purgatorio
* Paradiso
* complete Divine Comedy
* Goethe Faust Part I
* Faust Part II
* Marlowe Doctor Faustus
* Paradise Lost
* Paradise Regained
* Byron Cain
* Revolt of the Angels
* other important religious literary works

Badge these:

**Literary / cultural influence — not scripture**

Allow comparison of how literary works shaped popular ideas of:

* Satan
* demons
* hell
* judgment
* temptation
* salvation
* free will

---

# SCIENTOLOGY

Create a neutral modern-religion page for Scientology.

Include metadata for:

* Dianetics
* Dianetics: The Original Thesis
* Dianetics: The Evolution of a Science
* Science of Survival
* Self Analysis
* Handbook for Preclears
* Scientology: A History of Man
* Scientology 8-80
* Scientology 8-8008
* The Creation of Human Ability
* Scientology: The Fundamentals of Thought
* The Problems of Work
* Scientology: A New Slant on Life
* Phoenix Lectures
* official creed
* public codes
* major introductory writings
* broader Hubbard bibliography

Do not ingest copyrighted Scientology works in full without permission.

Use:

* metadata
* bibliographic records
* legally compliant short excerpts
* official links
* academic secondary sources

Create separate sections:

**Official Teaching**

**Historical / Academic Analysis**

**Criticism / Controversy**

**Response from the Church**

Do not automatically treat either official statements or critics as independent historical proof.

---

# OTHER MODERN RELIGIONS

Expand:

* Baha’i Faith
* Latter-day Saint movement
* Christian Science
* Theosophy
* Anthroposophy
* Spiritualism
* Cao Dai
* Tenrikyo
* Falun Gong
* Rastafari
* Nation of Islam where appropriate
* Thelema
* modern Satanism
* Luciferian movements
* New Thought
* New Age movements
* UFO religions

Also include modern revelatory/channeling literature such as:

* Oahspe
* Urantia Book
* A Course in Miracles
* Law of One / Ra Material
* Seth Material
* significant Theosophical works
* other historically influential channeled/revelatory works

Always use their actual modern publication dates even if they claim ancient or extraterrestrial origins.

---

# FORBIDDEN / BANNED / SUPPRESSED TEXTS

Create a dedicated collection:

**Forbidden, Banned & Suppressed**

But distinguish:

* canon exclusion
* ecclesiastical prohibition
* state prohibition
* censorship
* destruction
* restricted initiatory material
* blasphemy bans
* obscenity bans
* political/religious suppression

For each record show:

* who restricted it
* where
* when
* why
* whether restriction still exists
* historical context

Include historically meaningful works from:

* Index Librorum Prohibitorum
* Reformation censorship
* heterodox Christianity
* Gnostic traditions
* banned translations
* banned mystical texts
* prohibited occult works
* suppressed sectarian literature
* government-banned religious works

Never imply:

**banned = true**

or

**noncanonical = banned**

---

# LOST TEXTS

Create:

**Lost & Indirectly Attested Works**

Represent texts known through:

* quotations
* ancient catalogs
* fragments
* references
* hostile witnesses
* manuscript inventories

Include categories such as:

* lost Jewish writings
* lost early Christian gospels
* lost acts
* lost apocalypses
* lost Gnostic writings
* lost Orphic literature
* lost Greek philosophy
* lost Manichaean literature
* lost Zoroastrian material
* lost Egyptian ritual books
* lost Mesopotamian compositions
* lost Chinese works
* lost Mesoamerican material destroyed during conquest

Do NOT generate nonexistent complete text.

Show:

* attestation
* surviving fragment
* source mentioning it
* reconstruction level
* confidence

---

# HYPOTHETICAL / RECONSTRUCTED SOURCES

Atlas may include scholarly hypotheses such as:

* Q source
* Pentateuchal source layers
* reconstructed oral traditions
* Proto-Indo-European religious reconstruction
* Indo-Iranian reconstructed traditions
* proposed earlier textual forms

But:

* never represent them as discovered physical books
* never create fake quotations
* show arguments for and against
* label clearly as hypothetical or reconstructed

---

# DISPUTED / FORGED / HOAX-ASSOCIATED SOURCES

Create:

**Disputed & Questioned Texts**

Include responsibly documented examples such as:

* Gospel of Jesus’ Wife
* Secret Gospel of Mark controversies
* Oera Linda Book
* controversial inscriptions
* alleged lost gospels
* archaeological forgeries
* pseudoarchaeological texts
* modern fabricated scriptures

Clearly display:

* authenticity status
* evidence for
* evidence against
* current scholarly view
* provenance problems

Forgery status should appear prominently.

---

# HIGHLY CONTROVERSIAL TEXTS

Do not censor a work merely because it is controversial.

Catalog:

* adversarial religious works
* anti-religious polemics
* anti-clerical works
* blasphemous literature
* sectarian polemics
* apocalyptic political theology
* high-control movement documents
* controversial modern religions
* political-religious manifestos
* texts connected to extremist movements

However:

Atlas is a research application, not a recruitment or operational archive.

Do not reproduce actionable instructions for violence or terrorism merely in the name of completeness.

Use:

* metadata
* historical analysis
* ideology
* provenance
* influence
* scholarship
* critique

---

# INDIGENOUS CULTURAL RIGHTS

Comprehensiveness does not override living communities.

Add:

* community name
* source language
* recorder
* recorder affiliation
* recorder community status
* date recorded
* colonial collection context
* modern community source
* permission status
* cultural sensitivity
* restricted status

Access statuses:

* open/public
* public with attribution
* public but culturally sensitive
* community permission preferred
* restricted
* do not reproduce
* metadata only
* uncertain / review required

Prefer community-approved sources where available.

Do not treat oral tradition as inferior to written text.

Do not assume one recorded version represents an entire people.

---

# IMAGES — MAKE ATLAS VISUALLY RICH

Images are now a first-class feature.

Target milestones:

500 verified images
→ 1,000
→ 2,500
→ 5,000+

Prioritize:

* manuscript scans
* papyri
* tablets
* coffin inscriptions
* pyramid inscriptions
* tomb paintings
* temple reliefs
* codex pages
* bamboo slips
* oracle bones
* stelae
* sculptures
* ritual objects
* sacred architecture
* archaeological sites
* Indigenous codices
* manuscript bindings
* maps

Preferred sources:

* museum Open Access
* national libraries
* university digital collections
* IIIF
* public-domain collections
* CC0
* CC BY

Examples:

* Metropolitan Museum Open Access
* Smithsonian Open Access
* Library of Congress
* National Library of Sweden
* Bodleian
* BnF / Gallica
* Walters
* Getty Open Content
* Cleveland Museum
* Art Institute of Chicago
* Rijksmuseum
* British Museum / British Library only where usage terms permit
* relevant university repositories

Never scrape random Google Images.

Every image must have:

* title
* institution
* object number
* date
* culture
* source
* rights/license
* attribution
* relation to text/tradition

Implement IIIF support.

Use a deep-zoom viewer such as OpenSeadragon.

---

# DEEP LIBRARY UI

Expand Library filters:

* tradition
* culture
* region
* time
* language
* script
* genre
* canon status
* evidence status
* artifact type
* full-text availability
* image availability
* original-language availability
* translation availability
* decipherment status
* disputed status
* lost status
* banned status

Create major collection cards:

* Ancient Egypt
* Mesopotamia
* Ethiopia / Horn
* Chinese Traditions
* India
* Buddhism
* Jewish Traditions
* Christianity
* Islam
* Persian / Zoroastrian
* Greek & Roman
* African Traditions
* Indigenous Americas
* Mesoamerica
* Andes & Amazon
* Oceania
* Circumpolar
* Sacred Manuscripts
* Esoteric & Occult
* Noncanonical
* Undeciphered
* Lost
* Forbidden
* Disputed
* Modern Religions
* Skeptical / Critical
* Religious Literature

---

# DEEP ARCHIVE MODE

Add:

**Deep Archive**

Allow users to explore:

* obscure
* fragmentary
* lost
* disputed
* banned
* suppressed
* controversial
* undeciphered
* magical
* mystical
* adversarial
* Indigenous
* oral
* manuscript-only
* image-only
* reconstructed
* modern revelatory
* forged
* hoax-associated
* restricted metadata

Sort:

* oldest
* newest
* rarest
* least documented
* most disputed
* most controversial
* recently added
* recently re-evaluated
* newly deciphered

---

# SEARCH MODES

Add selectable modes:

**Scholarly**

Primary evidence and mainstream scholarship ranked highest.

**Broad**

Primary evidence plus minority, alternative, and modern interpretations.

**Opposition**

Actively surfaces dissenting/adversarial viewpoints.

**Deep Archive**

Includes lost, disputed, fragmentary, speculative, banned, and obscure records.

**Manuscripts**

Searches artifacts, scripts, witnesses, museum IDs, and physical records.

Primary ancient evidence must rank before modern claims in Scholarly mode.

---

# KNOWN / CLAIMED / UNKNOWN

For controversial issues show:

**Known**

Strong evidence.

**Probable**

Substantial evidence.

**Disputed**

Meaningful disagreement.

**Claimed**

A person/group/source asserts it.

**Speculative**

Possible but weakly supported.

**Rejected / Disproven**

Evidence strongly argues against it.

**Unknown**

Insufficient evidence.

Use this for:

* Anunnaki
* alternative history
* lost civilizations
* disputed gospels
* forged manuscripts
* occult legends
* religious miracles where historically evaluated
* modern revelations
* authorship debates

---

# EVIDENCE LADDER

Every important AI claim should have:

**Why does Atlas say this?**

Opening a panel showing:

1. Primary source
2. Physical witness
3. Translation
4. Historical context
5. Scholarly source
6. AI synthesis
7. Confidence
8. Alternative interpretation
9. Counterargument

---

# PRIMARY SOURCES VS INTERPRETATIONS

Create tabs:

**Primary Sources**

**Mainstream Scholarship**

**Alternative Interpretations**

**Modern / Popular Claims**

This is especially important for:

* Anunnaki
* Gnostic texts
* occult texts
* biblical history
* suppressed texts
* disputed artifacts
* alternative archaeology
* UFO religion
* modern revelations

---

# QUESTION EXPLORER — DEEP ANSWERS

Upgrade responses to include:

## Short Answer

Neutral synopsis.

## Primary Evidence

Direct passages grouped by tradition.

## Earliest Surviving Evidence Currently in Atlas

Never say “first belief in history” unless actually supportable.

## Similar Ideas

Cross-cultural parallels.

## Important Differences

Avoid false equivalence.

## Historical Relationships

Classify:

* direct documented influence
* likely influence
* possible influence
* shared environment
* independent development plausible
* insufficient evidence

## Opposition / Alternative Views

## Modern Reinterpretations

## Scholarly Consensus

Only where defensible.

## Disputed Issues

## Images / Artifacts

## Sources

---

# RELATIONSHIP GRAPH

Relationship edges may include:

* direct quotation
* explicit citation
* translation dependency
* commentary
* polemical response
* shared source
* likely borrowing
* possible borrowing
* cultural contact
* linguistic relationship
* thematic parallel
* ritual parallel
* later literary influence
* modern reinterpretation

Every relationship requires:

* chronology
* rationale
* evidence
* citation
* counterargument
* confidence

Never infer direct borrowing purely from embedding similarity.

---

# ALIAS / LANGUAGE NORMALIZATION

Support variant names.

Examples:

* Anunna / Anunnaki
* Inanna / Ishtar
* Utu / Shamash
* Enki / Ea
* Osiris / Wsir
* Isis / Aset
* Thoth / Djehuty
* Horus / Heru
* Laozi / Lao Tzu
* Yijing / I Ching

Preserve historically appropriate forms in the UI.

---

# COPYRIGHT

Continue the repository’s conservative policy.

Full text only where:

* public domain
* openly licensed
* permission exists

For copyrighted material:

* metadata
* citations
* lawful short excerpts
* source links

Do not ingest complete copyrighted modern translations without authorization.

This applies especially to:

* Scientology
* modern Satanic works
* modern academic translations
* modern spiritual/channeled texts
* modern religious movements

---

# SOURCE DISCOVERY

Good starting ecosystems include:

Mesopotamia:

* CDLI
* ORACC

China:

* Chinese Text Project
* university/manuscript projects

Egypt:

* museum collections
* university Egyptology projects
* public-domain editions
* institutional digitization

Ethiopia:

* Ethiopian manuscript collections
* university manuscript projects
* church/public scholarly sources
* digitized Ge’ez collections

Manuscripts:

* IIIF repositories
* national libraries
* museums
* universities

Always verify licensing before copying data or images.

---

# CURRENT DEVELOPMENT PRIORITY

Do NOT immediately scrape thousands of sources.

First fix the architecture.

Execute in this order:

## Phase 1 — Audit Existing Application

Read all current architecture and tests.

Document what already exists.

Preserve functioning features.

## Phase 2 — Data Model Upgrade

Add:

* works
* recensions
* witnesses
* artifacts
* images
* decipherment
* source depth
* evidence status
* cultural restrictions

Migrate existing data without destroying IDs or collections.

## Phase 3 — UI Foundation

Create:

* CoverageDepthBadge
* EvidenceStatusBadge
* DeciphermentBadge
* WitnessCard
* ArtifactCard
* ManuscriptGallery
* ImageAttribution
* IIIFViewer
* EvidenceLadder
* PrimaryVsInterpretationTabs
* KnownClaimedUnknownPanel

## Phase 4 — Ancient Egypt

Target:

* 70+ records initially
* 20+ meaningful searchable works
* 100+ verified artifact/manuscript images

## Phase 5 — Mesopotamia / Anunnaki

Target:

* 75+ compositions
* ORACC/CDLI integration
* deity aliases
* tablet witnesses
* at least 20 substantial searchable texts

## Phase 6 — China

Target:

* 100+ metadata records
* 20+ searchable works
* Confucian / Daoist / Buddhist / Mohist / Legalist / folk / syncretic coverage

## Phase 7 — Ethiopia / Horn

Build:

* Ethiopian canon
* Ge’ez manuscripts
* Enoch
* Jubilees
* Meqabyan
* Kebra Nagast
* liturgy
* Beta Israel
* Eritrean Tewahedo
* regional Islam
* Coptic / Nubian links

## Phase 8 — Global Indigenous

Start with text-rich:

* Maya
* Nahua/Aztec
* Mixtec
* Inca/Andean

Then expand:

* North America
* Africa
* Amazonia
* Oceania
* Siberia
* Asia
* Australia

## Phase 9 — Manuscripts / Scrolls

Build deep physical-witness system.

## Phase 10 — Undeciphered

Add unresolved writing systems.

## Phase 11 — Forbidden / Lost / Disputed / Speculative

Do this only after evidence-status UI exists.

## Phase 12 — Occult / Literary

Add:

* Codex Gigas
* Lesser Key of Solomon
* grimoires
* Dante
* Faust
* demonology
* Hermetic texts

## Phase 13 — Modern Religions

Expand:

* Scientology
* Baha’i
* LDS
* Christian Science
* Theosophy
* spiritualism
* Cao Dai
* Tenrikyo
* modern Satanism
* New Thought
* channeled movements
* UFO religions

## Phase 14 — Image Expansion

Target:

500 → 1,000 → 2,500 → 5,000+

verified images.

## Phase 15 — Analysis / Relationship Expansion

Curate scholarly relationships rather than generating unsupported connections automatically.

---

# CORPUS SCALE MILESTONES

Milestone A:

500 catalog records
100 searchable works
500 images

Milestone B:

1,000 catalog records
200 searchable works
1,000 images

Milestone C:

2,500 catalog records / witnesses
400 searchable works
2,500 images

Milestone D:

5,000+ catalog records / witnesses
750+ searchable works
5,000+ images

Long term:

No hard ceiling.

---

# REQUIRED CURATED COMPARISON PACKS

Create preset comparisons for:

## Afterlife

* Pyramid Texts
* Coffin Texts
* Book of the Dead
* Amduat
* Book of Gates
* Mesopotamian underworld
* Zoroastrian afterlife
* Greek underworld
* Jewish traditions
* Christianity
* Islam
* Hinduism
* Buddhism
* Tibetan Bardo
* Chinese traditions
* Indigenous traditions

## Creation

* Egyptian creation traditions
* Enuma Elish
* Genesis
* Rig Veda
* Popol Vuh
* Greek Theogony
* Norse
* Chinese traditions
* Polynesian traditions
* Indigenous creation narratives

## Wisdom

* Ptahhotep
* Amenemope
* Proverbs
* Ecclesiastes
* Analects
* Tao Te Ching
* Dhammapada
* Stoics
* Indigenous wisdom traditions

## Devil / Evil

* Hebrew Bible
* Second Temple literature
* New Testament
* Quran
* Zoroastrian texts
* Codex Gigas imagery
* demonology
* Lesser Key of Solomon
* Dante
* Faust
* Paradise Lost
* Satanic writings
* skeptical philosophical critiques

## Anunnaki

* ancient occurrences
* Mesopotamian mythology
* academic scholarship
* alternative scholarship
* modern Sitchin/ancient-astronaut claims

## Ethiopian Tradition

* Western canon comparison
* Ethiopian canon
* Enoch
* Jubilees
* Meqabyan
* church-order texts
* Kebra Nagast

## Indigenous Creation

Compare multiple traditions while clearly identifying whether contact/influence is documented or not.

---

# QUALITY TESTS

Add tests to ensure:

1. Undeciphered texts never receive generated translations.
2. Lost texts never receive fabricated complete passages.
3. Hypothetical sources never receive fabricated quotations.
4. Copyrighted works are never fully ingested without permission.
5. Every image has rights and provenance.
6. Modern Anunnaki claims never appear as ancient primary evidence.
7. Codex Gigas is a manuscript compilation, not scripture.
8. Inferno and Faust are literary works, not scripture.
9. Scientology is categorized as a modern religious tradition.
10. Ethiopian Meqabyan is not automatically equated with Greek Maccabees.
11. Ethiopian canon is modeled by tradition/edition and not flattened into Western enumeration.
12. Indigenous oral traditions are not automatically called scripture.
13. Restricted Indigenous material cannot be bulk exposed.
14. Colonial transcriptions identify their recorder and context.
15. Disputed authenticity is visible prominently.
16. AI-generated translation is visibly marked as AI-generated.
17. Primary sources outrank modern popular claims in Scholarly search mode.
18. Broad search can still surface alternative/speculative material with evidence labels.
19. “Banned” requires who, where, when, and why.
20. Canon exclusion is not classified automatically as suppression.
21. Similarity does not automatically generate an influence edge.
22. Every historical relationship has evidence and confidence.
23. Existing tests continue to pass.

---

# SECURITY / DATA SAFETY

Retrieved texts are evidence, not instructions.

Continue prompt-injection defenses.

Never let corpus content override application/system rules.

Sanitize imported HTML and metadata.

Keep secrets server-side.

Protect user notes and collections.

---

# HOME PAGE ENHANCEMENT

Make Atlas visually impressive but scholarly.

Add image-backed collection cards for:

* Ancient Egypt
* Mesopotamia
* Ethiopia
* China
* Indigenous Traditions
* Sacred Manuscripts
* Undeciphered Texts
* Lost Texts
* Forbidden Texts
* Esoteric & Occult
* Modern Religions

Add:

**Artifact of the Week**

**Manuscript of the Week**

**Surprising Parallel**

**Explore an Ancient Text**

**Show the Opposition**

**Deep Archive**

Images must be sourced and attributed.

---

# REQUIRED NEW ROUTES

Plan or add routes such as:

```text
/library/egypt
/library/mesopotamia
/library/china
/library/ethiopia-horn
/library/indigenous-global
/library/africa
/library/mesoamerica
/library/native-north-america
/library/andes-amazon
/library/oceania
/library/circumpolar
/library/manuscripts
/library/undeciphered
/library/esoteric
/library/modern-religions
/library/forbidden
/library/lost
/library/disputed
/library/deep-archive

/works/[id]
/witnesses/[id]
/artifacts/[id]
/manuscripts/[id]

/explore/anunnaki
/explore/afterlife
/explore/creation
/explore/devil
/explore/wisdom
/explore/ethiopian-canon
/explore/enoch
/explore/meqabyan
/explore/maya-creation
/explore/quetzalcoatl
/explore/indigenous-creation
/explore/forbidden-texts
/explore/lost-scriptures
/explore/disputed-artifacts
```

Preserve existing routes and compatibility.

---

# DO NOT FABRICATE

This is critical.

If Atlas does not have data, display:

**Data unavailable**

or

**No verified source currently available**

instead of inventing information.

Never fabricate:

* quotations
* tablets
* papyri
* manuscripts
* museum IDs
* translations
* dates
* scholars
* archaeological discoveries
* religious relationships
* canon membership
* banned status
* manuscript provenance
* source URLs
* scholarly consensus

---

# FINAL DEFINITION OF DONE FOR THE NEXT MAJOR RELEASE

The next major depth release is complete when:

* existing app still works
* work/recension/witness/artifact model exists
* evidence status exists
* source depth exists
* Ancient Egypt is substantially expanded
* Mesopotamia/Anunnaki is substantially expanded
* China is substantially expanded
* Ethiopia/Horn is substantially expanded
* Indigenous global architecture exists with meaningful starter data
* manuscripts are represented as physical witnesses
* undeciphered material is represented correctly
* Codex Gigas is included
* Lesser Key of Solomon and major grimoires are included
* Divine Comedy and Faust are included
* Scientology is included safely and neutrally
* forbidden/lost/disputed/speculative categories exist
* 100+ works have meaningful searchable source content
* 500+ catalog records exist
* 500+ verified images are supported or the ingestion pipeline exists with a documented count toward this target
* Question Explorer separates primary evidence from interpretation
* relationship claims show evidence/confidence
* Deep Archive exists
* source rights are preserved
* existing automated tests remain green
* new quality tests pass
* README is updated
* CHANGELOG is updated
* `docs/coverage.md` is updated
* `docs/source-policy.md` is updated

---

# IMPLEMENTATION BEHAVIOR

Do not stop after creating a plan.

Implement the work in working vertical slices.

Do not destroy existing functionality to simplify the task.

Do not fabricate data to make UI appear complete.

When a legal/public-domain translation cannot be found, add strong metadata and mark the text appropriately instead of inventing passages.

When a massive corpus cannot reasonably be completed in one session, complete as much real work as possible, leave the application functional, document remaining ingestion targets, and continue using the architecture described above.

After each major implementation stage run:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Fix errors before considering the stage complete.

Update documentation after each phase.

---

# GOVERNING PRINCIPLE

The long-term rule for Atlas is:

> Leave no major culture, religion, manuscript tradition, philosophical tradition, Indigenous tradition, controversial work, lost work, alternative interpretation, or historical source intentionally unexplored — but never fill a gap in history by inventing evidence.

The finished Atlas should feel like a combination of:

* comparative religion research platform
* world-history atlas
* digital humanities laboratory
* manuscript library
* museum
* archaeological database
* philosophical exploration engine
* cross-cultural mythology database
* historical evidence explorer

A user should be able to start with a simple question such as:

**Why are we here?**

and move across thousands of years and cultures.

Or:

**Who were the Anunnaki?**

and see ancient texts before modern theories.

Or:

**What did Egyptians believe happened after death?**

and move through actual funerary corpora and physical witnesses.

Or:

**Why is the Ethiopian Bible different?**

and explore its distinctive canon and manuscript tradition.

Or:

**What did the Maya believe about creation?**

and move through Popol Vuh, codices, inscriptions, archaeology, and modern Maya perspectives.

Or:

**What texts were banned or suppressed?**

and see historical censorship without Atlas claiming censorship proves truth.

Or:

**What texts are still undeciphered?**

and examine artifacts without fake AI translations.

Do not make Atlas tell the user what they must believe.

Give them the broadest, deepest, most transparent view possible of humanity’s search for meaning.
