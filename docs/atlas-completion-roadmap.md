# Atlas Completion Roadmap
## Execution plan derived from `docs/atlas-completion-gap-audit.md`
### Repository: `Byrd11811/Religion`
### Scope update: Documentation-only expansion from `906cee828313f4b3882e3e8130dd29d09f4cc8f2` on 2026-09-13; Phase 0 not started
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

Reconciliation qualifications and additional gaps are in audit sections 43 and 66–72. The dependency and completion corrections in sections 33–35 below are part of this plan, not optional future recommendations. Audit sections 73–109 and roadmap sections 36–39 add binding core tracks, baseline metrics and acceptance gates. This scope-update run is documentation-only; do not start Phase 0 after committing it without a subsequent implementation instruction.

---

# 1. PHASE 0 — BASELINE MEASUREMENT AND COMPLETION INSTRUMENTATION

Implementation update (2026-09-13, following the user's implementation instruction): the earlier documentation-only restrictions describe completed documentation runs. Phase 0 repository instrumentation is now delivered by `scripts/audit-coverage.ts`, five generated reports, coverage/traceability regression tests and CI drift checks. Model evaluation is in `docs/phase-0-model-evaluation.md`. Deployment counts remain explicitly unknown; no live database is accessed. This completes the repository-baseline/model-evaluation deliverables, not the unimplemented historical datasets or any later phase. Representative source targets await research in their assigned intake phases.

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

Also produce a requirement matrix covering audit sections 3–39, 44–63 and 66–109, the explicitly promoted parts of section 64, plus all 23 expansion quality rules and the 35 additional regression rules in section 38. Distinguish seeded, persisted, exposed, tested and complete states; unknown runtime counts are not zero. Count distinct works, recensions, witnesses, artifacts and images separately. Report 41 complete-work/edition coverage records separately from 43 searchable works, and original-language metadata separately from actual transcriptions. The one-time reconciliation table is evidence for the current docs, not completion of this phase or the `audit:coverage` script.

---

# 2. PHASE 1 — REPAIR WORLD MAP AND TIMELINE

Implemented repair slice: shared filtering/coverage predicates, undated discovery, full-range chronology, separate physical-witness dates, four record layers, region/geographic-evidence/source/image filters, exact-anchor grouping and a cancellable map-provider boundary. All 37 existing work anchors remain discoverable; repository names do not produce invented coordinates. Phase 1 remains partial for source-backed site/region enrichment and additional event classes; Track A historical states/change modes are still later work.

This is the early repair/foundation stage, not mature map completion. Track A in section 36 owns the required historical-state architecture, separate political/religious layers, transition/delta/side-by-side modes and real case studies. Complete the data foundation after Phase 2 and before case intake; expose the full map in Phase 20 and test through Phase 27.

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

Evaluate and implement the normalized models selected in Phase 0 (section 37) before dependent intake. Reuse existing claims, sources, people, artifacts, places and relationships; preserve provenance and stable IDs. Track E adds durable research-queue status/review foundations here, before any unverified leads are accepted.

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

Extend source-chain classification for hostile contemporary, colonial/outsider, institutional, organization/opponent, journalistic and derivative claims under audit section 102. Source type is independent of confidence and truth. Record derivation links so repeated sources cannot masquerade as independent corroboration.

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

Extend federated scope to approved conflicts/events, polities, sites, practices, entities, organizations, memberships, art/architecture and symbol interpretations as their models are delivered. Unresolved queue records must not enter verified facts, synthesis or graph edges automatically. Preserve distinct event, source, membership and interpretation statuses in filtering.

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

Track B now requires differentiated necromancy/spirit-contact practices and a separate human-sacrifice evidence domain (audit 86–88); Track C requires documented initiatory/fraternal/esoteric organizations (89–92). Regional source intake feeds these domains without conflating cultures. Entity evolution finishes in Phases 15/24, organizations in 17/20, and evidence-gated real case coverage precedes final QA.

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

Complete source-specific entity occurrences, original-language forms and evolving roles in audit section 87; Belial and Baal are not unconditional aliases. Organization identity, successor claims and symbol meanings require contextual relationships, not equivalence by repeated names or imagery. Track A also requires mixed conflict-causation and evidence-backed conversion categories.

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

Add Teaching vs Historical Conduct (audit 75): cite both teaching and historical conduct, name actors/institutions, contemporary justifications/support/opposition, nonreligious motives and later interpretations. Apply equally across traditions without treating adherent conduct as doctrine or issuing theological verdicts. Answer mapped-change questions from sourced independent historical states, not assumed demographic conversion.

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

Track C adds documented versus alleged membership, contact and successor edges with source chains/counterevidence (audit 89–92). Gestures, clothing, artworks and repeated allegations alone cannot create documented membership. Track D links object facts to explicitly typed interpretations without inferring occult intent.

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

Track D requires rights-reviewed art, architecture and symbolic-object provenance before interpretation (audit 93–99). Keep artist/architect/institution explanations separate from later readings. No sensational graphic treatment of ritual violence; no restricted ceremonial reproduction.

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

Expose Tracks A–D through linked event, polity, community, site, practice, entity, organization and object research views using the existing evidence drawer/search/map/timeline architecture. Finish sourced before/during/after/long-term case studies, synchronized pan/zoom and location inspection, delta and influence-flow modes. A generic work page or dots on a map cannot close these requirements.

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

Make the five section 36 tracks discoverable and link real research records. Do not surface unresolved leads as verified discoveries or future Contested History allegations as core historical facts.

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

Add all 35 section 38 regression requirements to the existing matrix. This phase remains interim until the added tracks and remaining phases pass their gates.

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

Apply audit sections 91 and 95–100: historical Bavarian Illuminati, documented memberships, actual buildings/artworks and Holy Door practices belong to core; global-control, secret sacrifice networks, celebrity membership allegations, intentional occult/serpent imagery and concealed forbidden artifacts remain contested claims. Preserve evidence-linked extension points and queue leads without implementing this phase.

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

Complete Track B entity-history paths and Track D changing symbol interpretations with original source occurrences and competing readings. Geographic “Show What Changed” belongs to Track A, while this concept view links to it; do not confuse semantic development with territorial change.

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

Track E adds durable Unresolved Research Queue workflow (audit 104), evidence/rights/cultural/scholarly review, provenance history, and deliberate publication transitions. Save historical-state comparisons with dates, layer sources, uncertainty and source-chain citations; exports preserve status and private-note boundaries.

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

Complete Track E curator review and controlled publication. Extend review to conflict causes, coercion classifications, memberships, sacrifice evidence and symbolic interpretations. Rejected/disputed leads and revisions persist; no automatic queue-to-fact promotion or unauthorized exposure.

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

Validate all new tracks, including keyboard/text alternatives for synchronized historical maps, uncertainty labels independent of color, queue privacy/publication gates, source-chain cycles, and sensitive-source access. Apply section 38 tests to real feature paths and representative sourced cases.

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

Execution starts with Phase 0 only in a subsequent implementation step after the documentation commit. Proceed in the listed phase order subject to the prerequisites above; Phase 9A is required and Phases 23–28 are not optional merely because they appear after a section called “Final Completion Rule.” The actual final audit follows Phase 28 and all remaining required work, including all five section 36 tracks and the section 38 regression suite. The reserved Contested History phase stays deferred.

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


# 36. INTEGRATED CORE RESEARCH TRACKS AND DEPENDENCIES

These tracks expand existing phases; they are not a parallel roadmap or authorization to implement during this documentation run. Phase 0 evaluates models/metrics and selects evidence-backed representative case coverage with explicit acceptance targets before implementation. No arbitrary numeric minimum is invented here, and no new domain is declared complete by schema support alone. Illustrative examples are a durable research backlog, not a demand to populate every example immediately. The core capabilities require working behavior, meaningful reviewed cases, visible limitations and appropriate tests before final completion.

| Track / audit sections | Existing phase owners and ordered dependencies | Required acceptance evidence |
|---|---|---|
| A — Religion, Power, Conflict & Geographic Change; 73–85, 108 | Phase 0 scope/model evaluation → Phase 1 map repair/provider boundary → Phase 2 historical-state/event foundation → Phase 3/4 source/filter support → regional Phases 5–9/9A case intake → Phase 15 causation categories → Phase 16 Teaching vs Historical Conduct → Phase 20 mature maps/case studies → Phase 25 saved comparisons → Phase 27 QA | Separate political borders, state religion, religious presence/majority and influence; independent pre-conflict/conflict/post-conflict/long-term snapshots; synchronized side-by-side, delta, staged slider, mechanism-labeled flows, provenance and uncertainty; mixed causes and conversion evidence; sourced teaching/action comparison across traditions. |
| B — Necromancy, Demonology, Ritual Practice & Entity Evolution; 86–88 | Phase 2 model foundation → regional sources and Phase 12 practice/sacrifice coverage → Phase 15 entities/occurrences → Phase 18 language support → Phase 20 evidence views → Phase 24 evolution → Phase 27 QA | Distinct community-specific practice categories; real sourced entity histories and contextual aliases; separate human-sacrifice domain with all nine evidence categories, archaeology/text/hostile/colonial context; no operational ritual-instruction platform or sensationalism. |
| C — Secret, Initiatory & Esoteric Organizations; 89–92 | Phase 2 organizations/evidence → Phase 12 documented histories → Phase 15 identities → Phase 17 membership/contact/source-chain graph → Phase 20 research views → Phase 26 review → Phase 27 QA | Documented organization, claimed successors and later legends remain distinct; all eight membership statuses; inspectable membership/contact evidence and counterevidence; no image/gesture-only membership or modern secret-society anachronism; Bavarian Illuminati distinct from global-control claims. |
| D — Religious Art, Architecture & Symbolism; 93–99 | Phase 2 object/interpretation model → Phase 15 contextual concepts → Phase 19 rights-reviewed objects/images → Phase 20 documented-object-first pages → Phase 24 interpretation history → Phase 27 QA | Correct object identity, creator, date, patron, purpose, location, institutional/scholarly sources and access rules before interpretations; all ten interpretation categories; art/religion/power links without inferred occult intent; named contested cases remain reserved. |
| E — Unresolved Research Queue; 104 | Phase 2 durable storage/status and publication-safety foundation before lead intake → Phase 4 retrieval exclusion → Phase 25 research workflow → Phase 26 review/publication UI → Phase 27 QA | All ten statuses persist with source chain, reviewer/history, rights/cultural/scholarly review and stable links; rejected/disputed leads retained; no automatic verified fact, synthesis or membership-edge publication; private/restricted evidence protected. |

Cross-track requirements: audit sections 100–103 govern core/contested boundaries, model reuse, source independence and neutral but accurate language. Sections 105–106 and roadmap sections 37–38 define baseline/test obligations. Phase 21/28 discovery links these tracks; Phase 22 is interim; section 39 is the final gate. Regional intake may prepare case evidence, but case-study publication waits for geographic/evidence architecture and rights/cultural review. Existing Phase 14 documented censorship remains core.

# 37. PHASE 0 MODEL EVALUATION AND EXPANDED BASELINE

**Planning requirements only: none of this measurement, model selection or instrumentation is performed in this documentation update.**

## Model evaluation

Do not implement schema yet.

Phase 0 must evaluate whether normalized models are needed for:

* historical polities
* territorial snapshots
* conflicts
* conflict parties
* conflict causation
* religious-policy events
* persecution events
* coercion/conversion events
* migration events
* exile events
* sacred-site events
* organizations
* organization aliases
* organization memberships
* membership evidence
* religious/esoteric entities
* entity aliases
* entity occurrences
* ritual practices
* practice evidence
* sacrifice evidence
* artwork
* architecture
* symbols
* symbol interpretations
* map layers
* geographic provenance

Avoid forcing everything into generic JSON metadata if normalized entities materially improve provenance, search and historical analysis.

Reuse existing models where appropriate.

Avoid duplicate parallel systems.

For each proposed model record reuse/extension versus normalization decisions, provenance relationships, temporal granularity, access/rights constraints and dependent track. Do not force analytically distinct relationships into generic JSON or create duplicate parallel systems. Implementation of approved foundations belongs to Phase 2, not this documentation step.

## Additional baseline metrics

Because Phase 0 has NOT started, expand its baseline audit.

Report current counts for:

* historical polity records
* territorial snapshots
* conflict records
* geocoded conflict events
* political-border layers
* religious-influence layers
* religious-policy transitions
* persecution/coercion events
* documented forced-conversion events
* migration/exile routes
* missionary routes
* sacred-site destruction events
* sacred-site reuse events
* before/after conflict map pairs
* curated historical map case studies
* ritual-practice records
* necromancy records
* demon/spirit/entity records
* entity aliases
* organization records
* organization memberships
* membership-evidence records
* sacrifice-evidence records
* artworks
* architectural records
* symbol records
* symbol-interpretation records
* unresolved research-queue records

If current count is zero, report zero.

Do not treat an existing UI placeholder as completed coverage.

Count distinct stable records separately from relations, aliases, source rows and rendered markers. For each metric report seeded/persisted/reviewed/exposed/tested state and counting rule. An inspected empty collection is zero; an uninspected runtime collection is unknown, not zero. Generic works, textual mentions, UI placeholders and model tables do not count as populated historical records or completed coverage. Before/after pairs require two independently sourced temporal states; geocoded events and layers require defensible geography. Maintain original baseline metrics alongside these additions.

# 38. ADDITIONAL REQUIRED QUALITY / REGRESSION GATES

These 35 rules supplement, rather than replace, the 23 expansion rules and original safety/neutrality requirements. Assign stable IDs `HIST-01` through `HIST-35` in Phase 0, track implementation/data/test evidence, and keep untested items incomplete. Implement tests alongside each track, consolidate in Phase 22, and complete QA in Phase 27/final audit. Map tests must inspect state, data and rendered evidence, not only route availability.

Add future completion tests requiring at minimum:

1. Political borders and religious influence use separate map layers.
2. Government religion is not treated as population religion.
3. Pre-conflict/post-conflict map states remain independent.
4. Unknown historical demographics remain unknown.
5. Approximate boundaries are labeled approximate.
6. Disputed boundaries remain disputed.
7. A conflict can have multiple causes.
8. Religious participants do not automatically make a conflict primarily religious.
9. Forced-conversion classification requires evidence.
10. Conquest-associated religious change is not automatically forced conversion.
11. Missionary spread is not automatically coercion.
12. Sacred-site destruction requires a sourced event.
13. Sacred-site reuse remains distinct from destruction.
14. Teaching vs Historical Conduct cites both teaching and historical conduct.
15. Conduct by adherents is not automatically authoritative doctrine.
16. Necromancy is not automatically demon worship.
17. Ancestor traditions are not automatically necromancy.
18. Belial is not automatically merged with Baal.
19. Entity aliases remain source-specific.
20. Human-sacrifice claims distinguish archaeology from hostile accusation.
21. Colonial accounts are labeled as colonial/outsider sources.
22. Secret-society membership requires evidence status.
23. Hand gestures or artwork cannot alone create documented-membership edges.
24. Knights Templar are not automatically classified as a modern secret society.
25. Historical Bavarian Illuminati and modern control claims stay separate.
26. Freemasonry's documented history remains distinct from later conspiracy claims.
27. Artwork facts remain distinct from artwork interpretations.
28. Paul VI Audience Hall facts remain distinct from serpent-intent claims.
29. Holy Door ceremonial closure remains distinct from suppression claims.
30. Repeated derivative web claims do not count as independent corroboration.
31. Religious violence is handled consistently across traditions.
32. Atlas never labels conduct “demonic” as its own factual conclusion.
33. Every historical map layer exposes provenance.
34. Users can inspect the evidence supporting mapped historical change.
35. Long-term religious change remains separate from immediate political change.

Also test synchronized pan/zoom and shared-location inspection, delta provenance, no interpolation between absent snapshots, queue persistence and gated publication, privacy/access restrictions, and the full sacrifice/membership/interpretation status vocabularies. Distinguish intentionally unknown data from fetch failures. Use cross-tradition cases and negative controls to expose biased or automatic classifications. Future contested case rules test core separation/extension boundaries now; they do not authorize implementation of Contested History.

# 39. EXPANDED COMPLETION GATE AND DOCUMENTATION UPDATE RECORD

All five tracks and their core acceptance criteria now belong to Atlas completion, including the historical-geographic experience defined in audit section 108. Every illustrative war, practice, organization or artwork need not be populated immediately; architecture supports indefinite expansion with no artificial upper limit. Phase 0 must make representative coverage and test expectations reviewable, and reports must retain remaining research gaps. Do not equate an empty general-purpose model with a completed domain or waive functional gates through a backlog.

> Leave no major documented culture, tradition, conflict, institution, ritual system, esoteric movement, secret/fraternal organization, relevant artwork, or historical source intentionally unexplored.

Comprehensiveness never overrides evidence, historical uncertainty, source provenance, cultural restrictions, copyright, safety or responsible scholarship. Atlas documents source-supported events and attributed beliefs; it does not tell users what they must believe. Documented massacre, enslavement, torture, forced conversion, persecution, ritual killing, cultural destruction and expulsion must not be euphemized; theological labels remain attributed source language, never Atlas verdicts.

Scope reconciliation against documentation commit `906cee828313f4b3882e3e8130dd29d09f4cc8f2`:

- Existing map repair and coverage-dot criteria are necessary but insufficient; mature historical state/change functionality is now mandatory core scope. Political sovereignty, state religion, population religion and religious influence remain separate.
- Audit section 64 previously deferred ritual/architecture/entity capabilities. The specifically requested portions are promoted into these core tracks; unrelated future features remain deferred. Existing historical text/source requirements and numerical gates are unchanged.
- Current source/coverage documents describe a limited release; their lack of these datasets is not a competing ceiling. This update makes no new baseline-count claims. Phase 0 will report actual zero values where inspected, and unknown where not inspected.
- Contested History remains a separate, unstarted follow-on phase. Core includes documented ritual/organization/art/building history and evidence models; allegations, hidden-object/control claims and speculative intentional symbolism remain separately typed future work. Recording a lead does not establish its truth or publish it.
- The research-only ritual scope and membership/source-chain safeguards strengthen existing non-fabrication, cultural and neutrality requirements; no stricter prior policy is relaxed.

This update changes only the two authoritative planning documents. Phase 0, migrations, code, routes, UI, seeds, ingestion and Contested History remain unstarted by this update. After documentation validation and commit, stop with the requested report. The repository remains ready for Phase 0 on a subsequent implementation instruction.

# 40. EXPANDED MISSING-DIMENSIONS INTEGRATION

`docs/atlas-comprehensive-missing-dimensions-audit-expanded.md` is an additive source audit. Its detailed requirements are incorporated into authoritative audit sections 110–113. It does not replace the existing phase order, relax source policy, authorize fabricated corpus intake, or move the reserved Contested History work into the core release.

## Phase 0 / maintained instrumentation

Extend the coverage audit and requirements traceability for the supplemental audit. Record the twelve-dimensional lived-religion coverage matrix; non-text evidence and media counts; calendars, practices, institutions, places, objects, experiences, performance/oral versions, variants and provenance; source perspective/derivation; bias indicators; site-phase/knowledge-loss metrics; and explicit zeroes for inspected absent datasets. Add requirement IDs and test ownership for the supplemental quality rules before any requirement can be closed.

## Phase 2 / 15 model foundations

Extend the taxonomy work into a source-backed polyhierarchy with temporal, non-exclusive and source-specific relations. Evaluate normalized models for practices, observances, calendars, life-cycle rites, pilgrimage, sacred landscapes, institutions/offices/lineages, experience/testimony, performance/oral variants, reception and critical apparatus, places/site phases, objects/provenance, knowledge centers/loss-survival events, terminology, source perspective and independent derivation. Enforce cultural access restrictions and place-coordinate precision at every retrieval/export boundary.

## Regional corpus phases and Phase 20 research experience

Populate representative reviewed cases across lived practice and material religion alongside text intake. The experience must expose original/source chronology separately from normalized historical time; show historical place-name and site layers with confidence; preserve multiple communities' relationships to a site; distinguish event evidence from later memory; and expose uncertainty without treating source silence as counterevidence. Add the date-neutral religious-world explorer and the sourced, explicitly limited "Show What Was Here Before?" path only after independent site-phase records exist.

## Phase 22 / 27 / final gate

Add the supplemental audit's quality suite as tracked rules. In particular, test that practice is not inferred from text, mythic time is not historical fact, polyhierarchy does not force exclusive identity, restrictions propagate beyond UI display, place reuse and conquest do not imply erasure/conversion, knowledge loss includes survival evidence, and contested Tartar/Tartarian or erased-civilization claims remain claim-specific and separate from historical geography. Completion also requires a visible corpus-bias dashboard and representative meaningful cases; a schema, route, placeholder or zero-count table is not completion.
