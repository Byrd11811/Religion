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
