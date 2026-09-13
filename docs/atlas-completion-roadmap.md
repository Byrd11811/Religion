# Atlas Completion Roadmap
## Execution plan derived from `docs/atlas-completion-gap-audit.md`
### Repository: `Byrd11811/Religion`
### Reconciled baseline: `b5ed9acb8d06ec380dd149f3f55d1f71fe642592` · 2026-09-13

---

# 0. EXECUTION CONTRACT

This roadmap is the operational plan for completing the Atlas core expansion.

Codex must read first:

- `AGENTS.md`
- `README.md`
- `docs/product-spec.md`
- `docs/source-policy.md`
- `docs/coverage.md`
- `docs/expansion-progress.md`
- `docs/atlas-completion-gap-audit.md`

This roadmap does not replace the source/copyright/cultural restrictions in the existing project. The stricter rule always wins.

Do not restart the project.

For subsequent implementation runs, do not stop at another plan. Exception for this reconciliation: the user's explicit instruction requires adding, checking and committing these documents before implementation, and ending that documentation step with a report. Nothing in this file authorizes beginning Phase 0 or corpus implementation during that step.

Do not mark a phase complete because:
- a schema exists,
- a page renders,
- placeholders were added,
- a count increased without research value,
- or the production build passes.

Every phase must deliver working product behavior, meaningful data, tests, and updated documentation.

Authority: `atlas-completion-gap-audit.md` is the incomplete-work inventory; this roadmap supplies order and acceptance. Newer numeric milestones override older milestones/ceilings, with no final corpus ceiling. Stricter pre-existing evidence, rights, cultural, provenance, safety and non-fabrication rules win. Older build-order lists are historical plans, not competing execution orders. Do not weaken those policies to satisfy numeric goals.

Reconciliation qualifications and additional gaps are in audit sections 43 and 66–72. The dependency and completion corrections in sections 33–35 below are part of this plan, not optional future recommendations.

---

# 1. PHASE 0 — BASELINE MEASUREMENT AND COMPLETION INSTRUMENTATION

Before changing corpus data, produce a machine-readable and human-readable baseline.

Report:

- total catalog/work records
- total traditions
- total subtraditions
- editions
- searchable works
- passage count
- primary-text passages
- editorial/commentary passages
- witnesses
- artifacts
- images
- relationships
- canon memberships
- evidence records
- cultural protocols
- suppression events
- records with dates
- records without dates
- records with coordinates
- records without coordinates
- mapped records
- works with original-language text
- works with transliteration
- works with scholarly bibliography

Create or update a script such as:

`npm run audit:coverage`

Output:
- JSON
- readable Markdown/table summary

Acceptance criteria:
- baseline is reproducible
- counts are derived from source-of-truth data, not manually typed
- CI can run the audit

Also produce a requirement matrix covering audit sections 3–39, 44–63 and 66–72, plus all 23 expansion quality rules. Distinguish seeded, persisted, exposed, tested and complete states; unknown runtime counts are not zero. Count distinct works, recensions, witnesses, artifacts and images separately. Report 41 complete-work/edition coverage records separately from 43 searchable works, and original-language metadata separately from actual transcriptions. The one-time reconciliation table is evidence for the current docs, not completion of this phase or the `audit:coverage` script.

---

# 2. PHASE 1 — REPAIR WORLD MAP AND TIMELINE

## Map

Remove silent exclusion of otherwise useful records.

Implement:
- broad regional anchors
- approximate-location labels
- work origin
- witness findspot
- repository location
- archaeological site
- modern movement origin
- coverage metrics

Add map layers:
- works
- traditions
- witnesses
- artifacts
- sites

Add filters:
- time
- tradition
- region
- confidence
- full-text availability
- witness/image availability

Do not invent precise coordinates.

## Timeline

Support:
- works
- witnesses
- discoveries
- translations
- canon events
- councils
- reform/schism events
- archaeological discoveries
- founders/teachers
- modern publications

Acceptance criteria:
- undated records are not silently hidden from the product
- coverage metrics are shown
- tests catch regression to date-required-only filtering

Audit sections 4 and 71 additionally require correct 5000 BCE–present axis placement, scoped missing-date counts, no unmarked coordinate displacement, a provider boundary preserving attribution, and sourced place/time context. Existing Timeline counters and dynamic Leaflet loading must be retained; they are partial features, not absent ones. Verify that collection/map predicates and API outputs use consistent meanings for origin, findspot and repository.

---

# 3. PHASE 2 — HIERARCHICAL TRADITION TAXONOMY

Create a flexible hierarchy.

Support:
- broad region
- cultural sphere
- tradition
- school/branch
- community

Preserve legacy IDs or map them safely.

Populate high-priority hierarchies:
- Mesopotamia
- Egypt
- China
- Ethiopia/Horn
- North American Indigenous
- Mesoamerica
- Africa
- Oceania
- India
- Buddhism
- Christianity
- Islam
- modern religions

Acceptance criteria:
- broad old categories still work
- new subtraditions are discoverable
- no destructive migration of saved user data

Before Phase 5 bulk intake, complete the data-safety foundation in audit section 67: durable curated overrides, authoritative read paths, repeatable imports/migrations, coherent scalar/JSON state, and access/rights checks across direct, legacy, search, media, model and export paths. Represent and source recensions and edition/witness associations independently. Basic enforcement precedes intake; the full curator UI remains Phase 26. Preserve private notes and all existing stable IDs.

---

# 4. PHASE 3 — PASSAGE SOURCE-TYPE CLASSIFICATION

Classify edition segments as:

- Primary text
- Translator note
- Editorial introduction
- Scholarly commentary
- Footnote
- Appendix
- Unknown

Update ingestion logic.

Update Question Explorer and synthesis so primary-source questions prioritize primary-text segments.

Acceptance criteria:
- UI visibly labels content type
- retrieval can filter/prefer primary text
- tests verify commentary is not silently presented as scripture

---

# 5. PHASE 4 — SEARCH ARCHITECTURE UPGRADE

Move toward a federated database-driven search.

Searchable entities:
- works
- passages
- traditions
- people
- deities/entities
- concepts
- witnesses
- artifacts
- manuscript IDs
- languages
- aliases
- canon status
- geography
- claims/evidence where appropriate

Add search modes:
- Scholarly
- Broad
- Opposition
- Deep Archive
- Manuscripts

Acceptance criteria:
- global search is not only a text-title search
- entity aliases resolve
- metadata-only records remain discoverable without polluting primary-text results

Implement audit section 71's filter-before-limit regression, rights/public-domain and confidence filters, and all-branch scope enforcement. Deliver the alias infrastructure here for use by Mesopotamia and China; Phase 15 expands its entities and ontology rather than postponing the infrastructure until after those collections. Historically conditional deity equivalences must not become unconditional aliases.

---

# 6. PHASE 5 — ANCIENT EGYPT DEPTH RELEASE

Target:
- 70+ meaningful Egyptian work/research records
- 20+ works with legal/searchable source content where available
- 100+ Egyptian verified images/artifacts
- multiple witness types

Implement:
- funerary corpus
- wisdom corpus
- narrative corpus
- theology/hymns
- ritual/magic
- major inscriptions

Create collection tabs:
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

Create "Evolution of the Egyptian Afterlife".

Acceptance criteria:
- Egypt no longer mainly equals Book of the Dead papyri
- Pyramid Texts and Coffin Texts have meaningful reviewed metadata
- Sinuhe and Westcar are present
- major requested works are discoverable

---

# 7. PHASE 6 — MESOPOTAMIA + ANUNNAKI

Target:
- 75+ Mesopotamian compositions/research records
- 20+ substantial searchable works where licensing permits
- ORACC/CDLI identifiers
- tablet witnesses
- deity alias normalization

Build dedicated Mesopotamian collection.

Build dedicated Anunna / Anunnaki research experience.

Required Anunnaki UI:
- Primary Sources
- Mainstream Scholarship
- Alternative Interpretations
- Modern / Popular Claims
- Ancient Text vs Modern Claim

Acceptance criteria:
- search for Anunnaki returns ancient evidence before modern claims in Scholarly mode
- modern claims are source-traceable
- actual tablet/witness references exist where available
- Anunna/Anunnaki aliases resolve

---

# 8. PHASE 7 — CHINA

Target:
- 100+ Chinese records across multiple traditions
- 20+ searchable works where legal sources exist
- multiple manuscript/object records
- Chinese title + characters + pinyin

Subcollections:
- Confucian / Ru
- Daoist
- Chinese Buddhism
- Mohist
- Legalist
- School of Names
- folk religion
- Chinese Manichaeism
- Jingjiao
- Chinese Islam
- syncretic traditions

Acceptance criteria:
- "China" is no longer the sole scholarly category
- major texts from each required school are present
- Chinese title metadata exists for priority works

---

# 9. PHASE 8 — ETHIOPIA / ERITREA / HORN

Create first-class route and collection.

Cover:
- Ethiopian Orthodox Tewahedo
- Eritrean Orthodox Tewahedo
- Enoch
- Jubilees
- Meqabyan
- Kebra Nagast
- Sinodos
- Books of Covenant
- Ethiopic Clement
- Ethiopic Didascalia
- Saint Yared / Deggwa
- Synaxarium
- Qeddase
- Marian literature
- Gadl
- Andemta
- Beta Israel
- Horn Islam
- Coptic and Nubian connections

Acceptance criteria:
- Ethiopian canon is community/edition-specific
- Meqabyan is not flattened into Greek Maccabees
- Ge'ez manuscript heritage is visible
- route appears in discovery UI and map

---

# 10. PHASE 9 — GLOBAL INDIGENOUS

Build map-first global Indigenous collection.

Priority sequence:
1. Maya / Nahua / Mixtec / Zapotec
2. Inca / Quechua / Andean
3. North America
4. African traditional religions
5. Oceania
6. Circumpolar/Siberian
7. South/Southeast Asian Indigenous traditions

Apply cultural protocol rules.

Acceptance criteria:
- no generic "Native American religion" treatment
- no generic "African religion" treatment
- oral traditions show recorder/context
- restricted material is not reproduced
- modern community sources are preferred where appropriate

Required extension, **Phase 9A — Remaining regional coverage**: fulfill audit section 66 after the taxonomy/search foundations, before core completion. Assign tracked intake/review batches to Jainism, Sikhism, Iranian/Zoroastrian, Hindu/Vedic and non-Chinese Buddhist traditions, Japan/Korea, non-Indigenous South/Southeast Asian traditions, Central Asian/Caucasian and minority traditions, and the original Greek/Roman/Norse/Celtic scope. Existing content can satisfy a batch only at its stated depth. Keep shared sources cross-linked rather than duplicated and honor cultural and licensing limits. This is a required coverage stream, not permission to scrape unsourced material or an assertion that every full translation can legally be bundled.

---

# 11. PHASE 10 — MANUSCRIPTS / WITNESSES

Expand physical witnesses significantly.

Priority:
- Dead Sea Scrolls
- biblical codices
- Nag Hammadi
- Derveni
- Oxyrhynchus
- Herculaneum
- Elephantine
- Dunhuang
- Mawangdui
- Guodian
- Gandharan
- Gilgit
- Ethiopian manuscripts
- Mesoamerican codices
- Mesopotamian tablets

Acceptance criteria:
- multiple witnesses can link to a single work
- witness pages show provenance, date, repository, rights
- work pages expose witnesses cleanly
- IIIF is used where available

---

# 12. PHASE 11 — UNDECIPHERED COLLECTION

Add:
- Linear A
- Indus
- Cretan Hieroglyphic
- Phaistos Disc
- Cypro-Minoan
- Rongorongo
- Proto-Elamite unresolved material
- Byblos syllabary
- Vinča debate
- Voynich

Acceptance criteria:
- all show decipherment state
- "No accepted translation exists" appears where applicable
- no generated translation is possible through UI/API

---

# 13. PHASE 12 — OCCULT / ESOTERIC / RELIGIOUS LITERATURE

Add/deepen:
- Lesser Key / Lemegeton
- Ars Goetia
- other Lemegeton books
- Greater Key
- Testament of Solomon
- Abramelin
- Picatrix
- Sworn Book
- Heptameron
- Arbatel
- Grimorium Verum
- Grand Grimoire
- Sixth/Seventh Books of Moses
- Dictionnaire Infernal
- Malleus Maleficarum
- Three Books of Occult Philosophy
- Hermetic works

Religious literature:
- Divine Comedy
- Inferno
- Purgatorio
- Paradiso
- Faust I/II
- Doctor Faustus
- Paradise Lost/Regained
- Cain
- Revolt of the Angels

Acceptance criteria:
- literary works are visibly non-scriptural
- occult works are not all labeled Satanic
- witness/manuscript information is used where practical

---

# 14. PHASE 13 — MODERN RELIGIONS / SCIENTOLOGY

Build Scientology collection with copyright-safe metadata.

Sections:
- Official Teaching
- Historical / Academic Analysis
- Legal / Government Records
- Criticism / Controversy
- Church Responses
- Bibliography

Also expand:
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
- Thelema
- modern Satanism
- Luciferian traditions
- New Thought
- New Age
- UFO religions
- Oahspe
- Urantia
- Course in Miracles
- Law of One
- Seth Material

Acceptance criteria:
- no copyrighted full text is ingested without permission
- modern claimed ancient origins remain dated to modern publication where appropriate

---

# 15. PHASE 14 — FORBIDDEN / LOST / DISPUTED

Populate real records for:

- banned/prohibited texts
- suppressed texts
- canon-excluded texts
- lost works
- indirect attestations
- reconstructions
- disputed works
- forgeries
- hoax-associated works

Required evidence fields:
- source
- status
- authority
- date
- place
- reason
- authenticity evidence
- counterevidence

Acceptance criteria:
- banned != noncanonical
- lost texts cannot show fabricated full text
- hypothetical sources cannot show fabricated quotes
- forgery status appears prominently

---

# 16. PHASE 15 — ONTOLOGY / ENTITY EXPANSION

Expand concepts to the full hierarchy in the gap audit.

Create alias/entity infrastructure for:
- deities
- people
- institutions
- original-language forms

Priority aliases:
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

Acceptance criteria:
- aliases work in search
- canonical display name remains historically appropriate

---

# 17. PHASE 16 — QUESTION / OPPOSITION / COMPARE ENGINES

## Question Explorer
Implement full structured answer format.

## Opposition
Replace broad tradition-name filtering with actual stance/opposition logic.

## Compare
Implement genuinely distinct:
- similarity
- contradiction
- chronology
- later echo
- alternative interpretation

Acceptance criteria:
- UI labels correspond to actual distinct backend behavior
- contradiction analysis references proposition/context
- influence is never inferred from similarity alone

Complete audit sections 68–70 here: provider-independent typed claims and source citations, per-claim confidence, source-linked evidence ladders, the full second-pass neutrality checklist, bounded regeneration/re-audit and explicit fallback. Stream cancellable verified evidence/progress without exposing unaudited synthesis as verified. Test mock-provider failures, invalid and missing citations, and cancel behavior without paid credentials. Scope filters must hold for every output section.

Build the seven required curated packs (Afterlife, Creation, Wisdom, Devil/Evil, Anunnaki, Ethiopian Tradition, Indigenous Creation) progressively with their regional data phases and finish them here. Test actual comparative evidence and topic routes, not just named presets. Preserve all named/cultural source ranges from the expansion brief; document any incomplete pack.

---

# 18. PHASE 17 — RELATIONSHIP GRAPH

Expand evidence-based relationships.

Add:
- direct citation
- translation lineage
- commentary
- polemical response
- shared source
- likely influence
- possible influence
- cultural contact
- thematic parallel
- ritual parallel
- linguistic relationship
- modern reinterpretation

Acceptance criteria:
- substantially more than demo edges
- every strong relationship has a citation
- confidence and counterargument are visible

Retain work, tradition, person and concept node types from original section 17. Test evidence-backed cross-entity relationships and accessible inspection; a larger work-only diagram is still partial.

---

# 19. PHASE 18 — ORIGINAL LANGUAGE / TRANSLATION ALIGNMENT

Progressively add:
- original script
- transliteration
- literal rendering
- aligned translations
- translation notes
- manuscript variants where available

Priority languages:
- Hebrew
- Greek
- Arabic
- Sanskrit
- Pali
- Chinese
- Egyptian transliteration
- Sumerian/Akkadian transliteration

Acceptance criteria:
- AI translation is labeled if used
- human scholarly translations are attributed
- aligned compare uses real shared references

---

# 20. PHASE 19 — IMAGE SCALE AND MULTI-INSTITUTION PIPELINE

Add adapters for multiple institutions.

Target:
- 500+ verified images initial milestone
- meaningful cultural diversity
- multiple object types

Implement:
- rights validation
- attribution
- source verification
- duplicate detection
- IIIF support
- source hash where feasible

Acceptance criteria:
- images do not overwhelmingly come from one institution/object cluster
- every image has provenance and rights

---

# 21. PHASE 20 — UNIFIED RESEARCH PAGE

Unify `/texts/[id]` and `/works/[id]` into one canonical research experience while preserving compatibility.

Tabs:
- Overview
- Read
- Original Language
- Translation Compare
- Witnesses
- Images
- History
- Canon
- Themes
- People
- Relationships
- Timeline
- Map
- Scholarship
- Evidence

Acceptance criteria:
- old URLs continue functioning
- users do not encounter two inconsistent profiles for the same work

Complete Source Reliability / “How certain are we?” (audit section 47) with actual earliest-witness, authorship/dating/completeness, provenance, bibliography, model-versus-curator and source-gap data. Integrate recension families and independently sourced edition/witness links from section 67. An evidence tab containing generic prose does not meet this criterion.

---

# 22. PHASE 21 — HOME / DISCOVERY EXPERIENCE

Add image-backed gateways:
- Egypt
- Mesopotamia
- Anunnaki
- China
- Ethiopia/Horn
- Indigenous
- Manuscripts
- Undeciphered
- Lost
- Forbidden
- Disputed
- Esoteric
- Modern Religions
- Religious Literature

Add:
- Artifact of the Week
- Manuscript of the Week
- Surprising Parallel
- Deep Archive
- Show the Opposition

---

# 23. PHASE 22 — COMPLETION TESTS

This is an **interim completion-test phase**, not the final declaration of completion. Continue adding gates for Phases 23–28 and Phase 9A; rerun the final matrix only after all required downstream work. See section 34.

Add tests / automated audits for real milestones.

Required gates:

- >=500 meaningful catalog/work records
- >=100 searchable works
- >=500 verified images or documented legal/source blockers plus functioning pipeline
- required routes
- required high-priority works
- map coverage reporting
- timeline coverage reporting
- Anunnaki implementation
- Ethiopia/Horn implementation
- Indigenous implementation
- undeciphered implementation
- Scientology implementation
- Lesser Key
- Divine Comedy
- Faust
- source-type classification
- cultural protections
- image provenance
- alias resolution
- primary-source search ranking
- non-fabrication rules

Run:
```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

---

# 24. END-OF-RUN REPORT REQUIRED

For every Codex run using this roadmap, report:

## Starting counts
- catalog/work records
- searchable works
- passages
- witnesses
- artifacts
- images
- relationships
- mapped records

## Ending counts
Same metrics.

## Work completed
List exact routes, data files, migrations, scripts, and features changed.

## Sources
List major institutions / corpora used.

## Blockers
List:
- licensing
- missing source
- cultural restriction
- technical blocker
- unverified claim

## Remaining roadmap items
Do not hide unfinished work.

---

# 25. RESERVED FOLLOW-ON PHASE — CONTESTED HISTORY

Do not execute until the core Atlas completion audit is substantially satisfied.

Reserved requirements:

- Contested History
- Suppression claims
- Institutional-denial tracking
- Lost/hidden artifact claims
- Vatican/Smithsonian claims
- Alternative archaeology
- Source-chain timelines
- Evidence-for vs evidence-against
- What remains unknown
- Separate suppression-confidence scoring
- Grand Canyon / Egyptian claim as first worked example

Preserve schema compatibility for this later phase.

---

# 26. FINAL COMPLETION RULE

Codex may only describe the core expansion as complete when the machine-readable coverage audit and human-facing report demonstrate the applicable acceptance criteria in `docs/atlas-completion-gap-audit.md`, including reconciled additions and required downstream phases. A documented blocker is an honest **blocked/partial** state, not automatic completion. Only an exception expressly stated in a requirement can satisfy that requirement through an alternative acceptance path; do not generalize the image-pipeline exception to absent research functionality, the 500 meaningful records target or the 100 searchable works target.

> Do not substitute scaffolding, placeholders, or counts for depth.


---

# 27. PHASE 23 — BIG QUESTION / CONCEPT EXPLORERS

Create dynamic Big Question pages and parameterized concept explorers.

Priority:

- God
- Soul
- Suffering
- Afterlife
- Reincarnation
- Evil
- Sin
- Enlightenment
- Salvation
- Heaven
- Hell
- Karma
- Free Will
- Destiny
- Prayer
- Prophecy
- Sacrifice
- Sacred Law
- Consciousness
- Purpose of Life
- Creation/Eternal Universe
- Reality/Illusion
- Apocalypse

Also build reusable specialized explorer modes for:
- Creation
- Afterlife
- Cosmology
- Ethics
- Mysticism
- Apocalypse
- Opposition

Acceptance criteria:
- pages populate from corpus/search rather than static prose
- every factual/historical claim remains evidence-aware

---

# 28. PHASE 24 — CONCEPT EVOLUTION / PRECISION FEATURES

Implement:

## What Changed?
Chronological concept development.

## Same Word, Different Idea
Original-language concept disambiguation.

## What Existed First?
Earliest surviving evidence with survival-bias warning.

## Independent or Influenced?
Structured historical-contact evaluation.

## Myth, History, or Both?
Separate textual, archaeological, historical, religious and scholarly evidence.

## Question Behind the Question
Conceptual refinement before retrieval.

Acceptance criteria:
- each feature uses real evidence models
- no unsupported historical claims

---

# 29. PHASE 25 — RESEARCH WORKSPACE COMPLETION

Expand existing collections into a fuller workspace.

Add:
- saved queries
- pinned passages
- text/work saves
- saved analyses
- comparison sets
- research notes
- generated collection timelines
- comparison reports
- citation export
- Markdown
- CSV
- JSON
- deliberate PDF export
- future-ready shareability architecture

Acceptance criteria:
- research state persists
- export preserves source attribution
- no private notes leak into public/shared contexts

---

# 30. PHASE 26 — ADMIN / CURATION WORKFLOW

Build authenticated/local curator tooling appropriate to current deployment.

Support:
- work/tradition metadata
- editions
- witnesses/artifacts
- sources
- images
- rights
- cultural restrictions
- aliases
- themes
- relationships
- claims
- neutrality flags
- embedding/classification reruns

Review states:
- machine suggested
- pending
- approved
- disputed
- rejected

Acceptance criteria:
- curator changes preserve provenance
- dangerous/destructive actions are guarded
- admin is not exposed unauthenticated if deployment changes

---

# 31. PHASE 27 — ACCESSIBILITY / PERFORMANCE / SECURITY QA

## Accessibility
Target WCAG 2.2 AA where practical.

## Performance
Benchmark:
- initial load
- metadata search
- map
- graph
- image-heavy pages
- large library pagination

## Security
Re-audit:
- source sanitization
- URL validation
- prompt injection
- remote resource safety
- file upload paths
- notes/privacy
- secrets
- rate limiting for public deployment

Acceptance criteria:
- documented QA report
- critical issues fixed
- regressions covered by tests where practical

---

# 32. PHASE 28 — RANDOM CONNECTION / HOME MODULES

Implement evidence-aware Random Connection.

Complete dynamic dashboard modules:
- Across Time
- Across World
- Text/Artifact of Day
- Surprising Parallel
- Competing Views
- Recently Added
- Non-Canonical
- Random Connection

Acceptance criteria:
- no fabricated connections
- dynamic modules derive from real catalog/evidence

Also complete the optional, goal-based onboarding required by audit section 55: users can choose research goals or skip onboarding, without being asked to declare a faith. It must lead into functioning discovery/research routes and be keyboard accessible. Preserve the existing evidence-only Random Connection behavior while expanding its depth.

---

# 33. RECONCILED DEPENDENCIES AND REQUIREMENT OWNERSHIP

This section corrects omissions/order ambiguities without deleting earlier phase definitions.

| Audit item | Execution owner / prerequisite | Acceptance addition |
|---|---|---|
| 43, 72: baseline and test traceability | Phase 0, maintained throughout | Source-derived counts and every original/expansion quality rule mapped to actual evidence; no count inflation from work aliases, fragments or images |
| 4, 71: map/timeline correctness | Phase 1 | Correct axis/unknown handling, no misleading jittered coordinates, provider attribution, region/time context and regression fixtures |
| 67: recensions and durable safe curation | Phase 2 foundation before Phase 5; depth in 10/18/20/26 | Re-import and restart preserve curated provenance, corrections and rights; source-specific family/edition links; no restricted-content bypass |
| 71: filters and conditional aliases | Phase 4; entity depth in Phase 15 | In-scope matches survive global distractors; aliases respect language/period/context; rights/confidence filters work |
| 66: omitted regional scope | Phase 0 matrix, Phase 2 taxonomy, regional Phases 5–9 and required Phase 9A | Every starting title and explicit expansion community has a real coverage or incomplete-target record and owner |
| 68: confidence, citations and neutrality | Data typing in Phase 3/4, complete in Phase 16; curation in 26 | Every substantive claim has support/confidence; auditable alternatives; bounded retry/fallback; all original neutrality checks |
| 69: streaming | Phase 16; benchmark/security QA in 27 | Cancellable incremental delivery without labeling unaudited claims verified |
| 70: curated comparison packs | Regional Phases 5–9/9A, complete in 16/23 | Seven real evidence packs with requested cultural range, citation tests and visible gaps |
| 27: heterogeneous graph | Phase 17 | Work/tradition/person/concept nodes and sourced cross-entity edges |
| 31: Deep Archive sorts | Metadata/event prerequisites in 0/2/4, expose in 20/21 | Defined, reproducible source-backed sorting; unsupported rarity/controversy values remain unavailable |
| 47: Source Reliability | Phase 20 | Actual work/claim evidence and uncertainty, not a generic evidence panel |
| 55: onboarding | Phase 21 or 28, required before final gate | Skippable research-goal flow; no required faith identity |
| 59, 67, 72: access/security | Enforce before each new source/publication path; full QA in 27 | Restricted-source refusal, no cached/export/API bypass, private-note protection; authentication/encryption before sensitive-account/public deployment |

Do not postpone safety until Phase 27 or the quality matrix until Phase 22. Those are consolidation/audit phases. Institutional IIIF adapters must preserve institution manifests and foliation independently from Atlas-generated display manifests; arbitrary URL safety and rights validation precede any remote intake.

# 34. FINAL GATE AND EXCEPTION HANDLING

Execution starts with Phase 0 only in a subsequent implementation step after the documentation commit. Proceed in the listed phase order subject to the prerequisites above; Phase 9A is required and Phases 23–28 are not optional merely because they appear after a section called “Final Completion Rule.” The actual final audit follows Phase 28 and all remaining required work. The reserved Contested History phase stays deferred.

For each requirement record: source requirement, acceptance criteria, implementation/data references, meaningful counts, test evidence, status, remaining work, and any real blocker. “Not implemented,” “source not researched” and “time ran out” are not licensing/cultural blockers. Tests must exercise the promised behavior, not just component/route existence.

The supplied image criterion permits a documented source/legal blocker plus an operational multi-institution pipeline as an alternative to the numeric image target. If used, report the real image count, named blocked collections/sources, verified restrictions, cultural diversity, pipeline evidence and unmet target prominently. Do not mark the missing images themselves complete, claim 500 images, or silently weaken the criterion to one institution's working importer. The 500 meaningful records and 100 genuinely searchable works requirements retain their stated gates. Higher expansion milestones (1,000, 2,500 and 5,000+) remain growth milestones, not ceilings or a reason to collapse distinct works into numerical units.

Actual historical censorship of texts remains in Phase 14. The separate institutional-denial/hidden-artifact/Contested History investigation described in section 25 remains follow-on; these are different scopes, not conflicting orders.

# 35. DOCUMENTATION RECONCILIATION RECORD

Baseline verified: `b5ed9acb8d06ec380dd149f3f55d1f71fe642592`, matching local HEAD and remote `main` when inspected. Headline seed counts match the supplied audit. Audit section 43 records exact counts and current-status corrections; sections 66–72 restore omitted requirements and specify testable safeguards.

Conflicts resolved:

- The attached “do not perform another planning-only run” instruction does not override the user's explicit documentation-only reconciliation and commit requirement.
- Older 20/100/250 initial-release criteria and older corpus-first build orders do not override this expanded completion plan. The original specification already disclaims a final corpus limit.
- Existing docs describe a functional local release and some schema foundations. They are preserved as historical/progress records, not proof of completed source depth or permission to omit advanced requirements.
- The broad “satisfied or blocked” sentence no longer permits declaring unmet functionality complete; section 34 defines the narrow stated exception and transparent blocked status.
- Completion tests listed before later phases are interim; onboarding, Source Reliability, comparison packs, streamed answers, recensions and remaining regional scope now have explicit owners.
- Historical-evidence, non-fabrication, rights and cultural safeguards remain at the stricter prior standard, including no sole-Wikipedia historical authority and no assumption that public-domain status authorizes culturally restricted reproduction.

This commit adds and reconciles documentation only. It does not implement Phase 0 instrumentation, new corpus intake, UI, schemas or tests. The repository is ready to **begin Phase 0 in the next authorized implementation step**, not to declare the completion roadmap fulfilled.
