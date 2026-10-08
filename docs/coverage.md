# Release coverage

The depth-expansion foundation now exposes 34 separately modeled physical witnesses: Codex Gigas, Voynich MS 408, 18 Egyptian papyrus, ostracon and inscribed-relief records, ten CDLI Mesopotamian tablet records, and four institution-linked Dunhuang scrolls. Archive pagination, source-depth/evidence controls and the additive work/recension/witness/artifact schema remain in place. The image archive contains 105 verified images across 33 artifact records, including 103 images of 30 Met Egyptian objects and one metadata-only British Museum artifact. Detailed major-release gaps and numerical milestones are tracked in `expansion-progress.md`.

The corpus contains 534 work and research records and 119 source editions covering 116 works, with 30,680 searchable segments. Eighty-three works have complete named texts or bounded digitized editions. Ancient Egypt accounts for 72 reviewed work/research records, of which 20 have searchable source content. Mesopotamia accounts for 77 reviewed composition/corpus records, of which 27 are searchable: 26 ORACC Sumerian composite transliterations and the pre-existing Gilgamesh study. Chinese traditions account for 109 school-specific records and 30 searchable Classical Chinese transcriptions. The Ethiopia, Eritrea and Horn route curates 44 existing and new work/corpus records, five community-scoped canon assertions, two textual-family records and four institution-backed witnesses. Metadata-only research records do not count as editions. Gilgamesh and the Egyptian Book of the Dead provide historical studies and translated selections, visibly labeled as partial coverage. Regional coverage remains uneven; absence from this corpus is not absence from a tradition.

Three editorial question guides and two textual-tension comparisons cite bundled passages and distinguish provisional interpretation from source wording. Restricted queries omit guides whose evidence falls outside their scope. These are curated examples, not comprehensive scholarly consensus.

Operational: browsing, filtering, paginated reading, source citations, edition comparison, question retrieval, optional synthesis adapter, comparison sets, geographic markers, timeline controls, reading paths, relationship inspection, canon status inspection, local collections, notes and exports.

Data-limited: most catalog biographies, manuscript histories, detailed canon formation, archaeological context, and historical transmission evidence. These records visibly state that data is unavailable or unreviewed. The map has sourced geometry but provisional editorial origin anchors, with no invented trade/migration overlays. The timeline covers available text date ranges. The relationship graph contains three explicitly qualified comparison records. Existing legacy imagery remains compatible; the expanded artifact archive is accessible through Ancient Egypt and artifact pages.

Provider-dependent: free-form model synthesis and externally generated semantic embeddings. No API key is bundled. Local keyword/theme/PostgreSQL retrieval remains available without services.

Future research scope from the supplied specification: full original-language corpus, manuscript collation, comprehensive historical-event/empire tracks, cultural permission workflows, deep linguistic comparison, reviewed influence/contradiction datasets, institutional collaboration, cloud identity and sharing. These are not represented as completed historical datasets.


## Completion roadmap Phase 0 — repository instrumentation

Implemented a reproducible read-only audit: `npm run audit:coverage` generates five reports and `npm run audit:check` detects source/report drift in CI. See [coverage](generated/coverage.md), [requirement matrix](generated/requirements.md), [corpus targets](generated/corpus-targets.json), and [model decisions](phase-0-model-evaluation.md).

Corpus counts are unchanged: 252 works, 44 editions / 43 searchable works, 41 complete-work/edition coverage records, 20,991 segments, eight witnesses, eight artifacts, 57 image references and three relationships. All 20,991 segments lack explicit primary/editorial classification. The current map predicate includes 26 of 37 coordinate-bearing works; 32 works are dated and 220 undated. These are baseline observations, not completion claims.

The reports include 59 metrics, all 110 audit sections, 23 expansion and 35 historical quality rules, 250 original title requirements representing 248 distinct catalog targets, and 53 expansion sections. Unpopulated historical seed datasets report zero; deployment counts report unknown. No private database, source intake, model provider, migration or historical-map implementation is performed by the audit. The model decision record assigns normalized foundations and source-review acceptance cases to subsequent phases.


## Phase 1 — map and timeline repair slice

All 37 existing coordinate-bearing works are mapped by default, including the 11 undated anchors previously excluded; the 215 works without coordinates remain discoverable. Scoped counts follow layer, community, region, geographic evidence and source/image availability. Coincident records share an unchanged anchor. A provider boundary preserves attribution, cancellation and an accessible list when tiles fail.

The chronology spans 5000 BCE to the current year, excludes year zero and retains undated records in a separate list. Six sourced papyrus object dates can be explored separately from work composition; two witness dates remain unknown. Artifact and grouping records remain discoverable without guessed coordinates or normalized dates.

Corpus totals are unchanged. This is a repair slice, not completion of mature historical geography: sourced borders, conflict transitions, independent snapshots, cultural-region geometry, additional event classes and reviewed site coordinates remain required. Earlier Phase 0 numbers above are retained as the starting baseline; generated reports now reflect the repaired map predicate.

## Phase 9 cultural-protocol baseline

The Phase 9 protocol registry currently contains 29 records. Each names a community authority or explicitly unresolved attribution, preserves recorder/context status, and blocks source-content export and AI use pending community review. The current regional discovery layer includes Circumpolar/Siberian, Ainu, Taiwan Indigenous, Ifugao and Maranao records alongside the earlier starter set. These are enforcement and discovery records, not proof that community-specific review or permission work is complete.
