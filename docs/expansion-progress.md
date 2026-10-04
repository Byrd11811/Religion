# Depth expansion: audit and first implementation

The user-supplied expansion brief is preserved in `expansion-spec.md`. It extends the baseline product specification; its numerical goals are milestones, not claims about current coverage.

## Audit

Baseline: Next.js App Router, React client shell, TypeScript, PGlite/PostgreSQL and optional pgvector retrieval. There are 252 legacy catalog records, 44 source editions across 43 works, 20,991 preserved segments, two museum images, three editorial reading guides and two textual-tension cases. The app already supports reading, citations, comparison, map, timeline, canon browsing, research collections and exports. The original tables and public routes remain intact.

The main gaps are scholarly metadata depth, physical-witness associations, original-language transcriptions, independently reviewed relationships, comprehensive cultural coverage and image intake. Legacy passages can contain edition commentary; they must not all be classified automatically as ancient primary evidence. The browser still receives the legacy metadata catalog and the legacy lexical index remains memory-based. The new archive endpoint is database-paginated, but this does not complete the long-term search scalability work.

## Implemented foundation

- Additive work, recension, witness, artifact and image tables, with evidence records, edition/witness associations, cultural protocols, community-specific canon memberships and documented suppression events.
- Existing work IDs retained through `legacy_text_id`; original passages, edition IDs and user collection storage unchanged. Migration tests confirm repeated synchronization retains research notes and IDs.
- Typed work profiles with source depth, coverage, decipherment, access and review status. Existing uncertain metadata stays unreviewed. No manuscript association is inferred from a title or decorative image.
- Database-paginated `/api/works` and `/library/deep-archive`, filtering by title and source coverage, with work links through `/works/[id]`.
- Physical-witness browsing through `/library/manuscripts`, `/library/undeciphered`, `/witnesses/[id]`, and compatible `/manuscripts/[id]` links. Institutional starter records: Codex Gigas and Voynich MS 408.
- Artifact pages and separately attributed images. Two existing Met images retained with no invented work/witness associations.
- CoverageDepthBadge, EvidenceStatusBadge, DeciphermentBadge, WitnessCard, ArtifactCard, ManuscriptGallery, ImageAttribution, EvidenceLadder, PrimaryVsInterpretationTabs and KnownClaimedUnknownPanel.
- Citation drawers expose source depth and the evidence ladder. Optional synthesis refuses ineligible lost, hypothetical, restricted and unresolved-script records.

## Still required for the major depth release

Phase 3 includes an Atlas-generated IIIF Presentation 3 manifest endpoint and viewer for verified CC0 images. The viewer supports image navigation and zoom; it does not yet ingest arbitrary remote institutional manifests, annotation services or image tiles. Square canvases are presentation coordinates, not claims about measured image dimensions. Evidence panels still need richer claim records. Unknown-tab messages are genuine coverage gaps, not populated scholarship.

Phases 4–15 remain ingestion/editorial milestones: Ancient Egypt (70+ records, 20+ meaningful sources, 100+ images), Mesopotamia (75+ compositions, 20+ substantial texts, ORACC/CDLI links), China (100+ records, 20+ searchable works), Ethiopia/Horn, responsible Indigenous starter datasets, deeper manuscripts, undeciphered systems, disputed/lost records, occult/literary sources, modern religions, verified image expansion and scholarly relationships. Collection-specific routes not implemented here must not imply completed collections.

Current numerical progress: 252 work catalog entries; 43 searchable works (41 complete named works or editions, two partial studies); eight separately modeled physical witnesses; eight artifact records; 57 verified images. The targets of 500 records, 100 searchable works and 500 images are not met. A bounded import fetched six selected Egyptian papyri through the Met's API and verified 55 image URLs, preserving institutional JSON and its SHA-256. Two candidates (550899 and 551142) lacked confirmed public-domain image flags and were not imported.

Ancient Egypt now has a dedicated route, period-filtered artifact cards, linked physical witnesses and museum image viewers. Institutional titles explicitly identify these papyri as Book of the Dead witnesses; no recension or English-edition dependency was inferred. Museum image order is not original foliation or spell numbering. The phase's larger work/translation/image targets remain incomplete.

Source-category ranking, deity/name aliases, original-language and AI-translation labels, cultural access enforcement at every future ingestion/export boundary, and full quality tests across the new cultural datasets remain planned. Present code does not generate a translation endpoint or a borrowing edge from similarity.

## Migration and verification

Stop the running app before maintenance. Run `npm run db:migrate` to add and populate the archive model. Fresh embedded databases initialize automatically; server PostgreSQL requires the explicit migration command. The legacy-derived profiles are maintained by `syncArchive`; do not edit their generated metadata directly in SQL. Future curated enrichment needs a separate provenance-preserving overlay.

Run typecheck, lint, core tests, browser tests and production build. The new tests cover repeated migration, source eligibility, image provenance, archive filtering and pagination, witness category separation and mobile layout. Model-provider services remain optional and were not called.

Verified for this milestone: 14 core tests and nine browser tests pass; lint, TypeScript and production build pass. Browser checks confirm that museum images load, image navigation changes the selection and zoom is keyboard-operable. API response snapshots retain their original bytes in Git for source-hash verification.

## Completion roadmap Phase 0 — repository instrumentation

Implemented a reproducible read-only audit: `npm run audit:coverage` generates five reports and `npm run audit:check` detects source/report drift in CI. See [coverage](generated/coverage.md), [requirement matrix](generated/requirements.md), [corpus targets](generated/corpus-targets.json), and [model decisions](phase-0-model-evaluation.md).

Corpus counts are unchanged: 252 works, 44 editions / 43 searchable works, 41 complete-work/edition coverage records, 20,991 segments, eight witnesses, eight artifacts, 57 image references and three relationships. All 20,991 segments lack explicit primary/editorial classification. The current map predicate includes 26 of 37 coordinate-bearing works; 32 works are dated and 220 undated. These are baseline observations, not completion claims.

The reports include 59 metrics, all 110 audit sections, 23 expansion and 35 historical quality rules, 250 original title requirements representing 248 distinct catalog targets, and 53 expansion sections. Unpopulated historical seed datasets report zero; deployment counts report unknown. No private database, source intake, model provider, migration or historical-map implementation is performed by the audit. The model decision record assigns normalized foundations and source-review acceptance cases to subsequent phases.

Validation: seven audit regressions and all 14 existing core tests passed; all nine browser tests passed against an isolated production server and temporary database. TypeScript, lint, production build and deterministic report checks passed. Browser tests verify existing workflows, not completion of the new historical domains.

## Phase 1 — map and timeline repair slice

All 37 existing coordinate-bearing works are mapped by default, including the 11 undated anchors previously excluded; the 215 works without coordinates remain discoverable. Scoped counts follow layer, community, region, geographic evidence and source/image availability. Coincident records share an unchanged anchor. A provider boundary preserves attribution, cancellation and an accessible list when tiles fail.

The chronology spans 5000 BCE to the current year, excludes year zero and retains undated records in a separate list. Six sourced papyrus object dates can be explored separately from work composition; two witness dates remain unknown. Artifact and grouping records remain discoverable without guessed coordinates or normalized dates.

Corpus totals are unchanged. This is a repair slice, not completion of mature historical geography: sourced borders, conflict transitions, independent snapshots, cultural-region geometry, additional event classes and reviewed site coordinates remain required. Earlier Phase 0 numbers above are retained as the starting baseline; generated reports now reflect the repaired map predicate.

Phase 1 repair validation (2026-09-14): 12 focused audit/exploration tests and all 13 browser tests passed, including four new spatial/API regressions. TypeScript, ESLint and production build passed. Browser checks used an isolated production server and temporary database. No corpus, private database or source ingestion was changed.

## Phase 2 — taxonomy foundation in progress

All 26 legacy tradition IDs and routes remain intact. A normalized `tradition_hierarchy` table and idempotent synchronizer now persist 42 source-backed branch, community, regional and practice-context nodes with 48 cited, nonexclusive relationships. The first coverage spans the roadmap's priority groupings: Mesopotamia, Egypt, China, Ethiopia/Eritrea/Horn, North American Indigenous, Mesoamerica, Africa, Oceania, India/Hindu traditions, Buddhism, Christianity, Islam and modern movements. Chinese Buddhism and several Horn records have multiple parents so regional and tradition navigation can coexist.

The tradition UI and `/api/taxonomy` expose sources, relationship notes, review status and the absence of reviewed work assignments. Public Indigenous and Oceanic starter records preserve community-protocol gates. This is meaningful introductory coverage, not completion of the Phase 2 taxonomy: most named communities and deeper school/lineage relations remain unresearched, temporal relation fields and curated override tooling remain outstanding, and the separate Phase 2 evidence/event/research-queue foundations are still required.

The unresolved-research foundation now has durable lead and event-history tables plus a server-only transition service. Ten workflow states remain distinct. Publication is rejected unless a provisionally resolved lead has an HTTPS source, an explicit target, and completed rights, cultural and scholarly reviews. No public API, search adapter or model-retrieval adapter reads this queue, so merely recording a lead cannot publish it as fact. The Phase 26 curator interface and real reviewed leads remain incomplete; repository baseline coverage therefore continues to report zero research-queue corpus records.

## Phase 3 — passage source classification first pass

All 20,991 bundled segments now have an explicit source type. Exact named-book KJV extractions provide 9,773 reviewed `Primary text` segments. The 155 Gilgamesh-study and 44 Egyptian Book of the Dead-study segments are `Scholarly commentary`. The remaining 11,019 mixed historical-edition segments stay `Unknown`; the project does not infer their type from a work title or edition completeness flag.

The classification persists in a constrained database column and seed metadata, including existing embedded databases. Search supports source-type filtering and question retrieval gives reviewed primary segments a bounded preference. Passage cards and citation drawers expose the label. Phase 3 remains incomplete until mixed editions receive segment-level review for translator notes, editorial introductions, footnotes and appendices, but commentary can no longer silently appear under a universal primary-evidence badge.

## Phase 4 — federated search foundation

The top-level Atlas search now opens a dedicated federated result route instead of narrowing only the text-library cards. It searches the complete work catalog, 26 broad navigation groupings, 42 sourced subtradition/context records, 16 comparative concept labels, edition-attributed contributors, ten public witness records and eight institutional artifact records. Metadata and archive hits remain structurally separate from passage evidence, and each result exposes its availability state.

The search includes a conservative alternate-title alias registry and Broad, Scholarly, Opposition, Deep Archive and Manuscripts modes. Mode and entity-type validation occurs at the API boundary; scope filters run before limits. Record-type, language/script, region, canon-status, rights/access and normalized evidence-confidence controls are available for metadata results. Phase 4 remains incomplete: the database is not yet the authoritative federated index, several requested entity families do not exist yet, and the normalized filters need to expand with those models.

## Phase 5 — Ancient Egypt starter expansion

The Egyptian catalog now contains 22 work records. UCL Digital Egypt sources replace the Pyramid Texts and Coffin Texts placeholders with reviewed corpus scope, chronology, language, transmission and evidence limits. Ten bounded public-domain editions make major wisdom and narrative works searchable. Exact, occurrence-aware boundaries exclude translator introductions, remarks and footnotes from primary-text classification; incomplete witnesses remain incomplete, and editor-supplied reconstruction or summary stays `Unknown`. Two British Museum papyri now link the Joppa, Doomed Prince and Two Brothers works to physical witnesses without asserting translation dependency. The persistent database sync inserts new catalog records and refreshes corrected metadata without removing user state.

The Egypt collection exposes Overview, Funerary, Wisdom, Stories, Gods, Creation, Afterlife, Magic, Temples & Tombs, Manuscripts, Images, Timeline and Compare tabs. “Evolution of the Egyptian Afterlife” relates the three currently sourced corpus records while warning against a single linear theology. Empty views state the actual evidence gap. Phase 5 remains short of its 70-record, 20-searchable-work and 100-image targets; the current release has 22 Egyptian works, eleven searchable works, eight institutional artifacts, eight Egyptian papyrus witnesses and 55 Egyptian images.
