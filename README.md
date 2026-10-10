# Atlas — Humanity’s Search for Meaning

A local research application for comparing sacred texts, philosophical works and historical traditions. Built in the requested `C:\Users\jlhei\Desktop\Religion` folder.

## Start the application

Double-click **Start Atlas.cmd**, then open **http://127.0.0.1:3000**. Node.js 24 is installed on this computer. The launcher installs locked dependencies and creates a production build if necessary. After editing source code, rebuild with `npm run build` or use the development command below.

For terminal use:

```powershell
npm ci
npm run dev
```

For the optimized production server:

```powershell
npm run build
npm start
```

Run only one server against the embedded database directory. Keep the terminal running while using the app. The server binds to loopback by default. This release is a local, single-user application, not a publicly deployed multi-user service.

## Included workflows

- Depth expansion foundation: work/recension/witness/artifact/image schema, paginated Deep Archive, source-depth indicators, citation evidence ladders, and institution-linked Codex Gigas/Voynich witness pages. See `docs/expansion-progress.md` for completed work and the remaining major-release targets.
- Ancient Egypt collection with 72 reviewed work/research records, 30 verified Met objects, three British Museum papyrus witnesses, period filters, physical-witness links and IIIF image navigation/zoom. The archive has 105 verified images in total; 103 Egyptian images were added through a reviewed, reproducible Met Open Access intake pipeline.
- Mesopotamia collection with 77 composition/corpus records, 26 searchable ORACC scholarly composite transliterations, 477 exact source blocks and ten separately modeled CDLI tablet witnesses. The Anunna / Anunnaki research view keeps ancient attestations, scholarship, alternative readings and modern claims in distinct sourced tabs.
- Chinese traditions collection with 109 school-specific records, native titles and pinyin, 30 searchable public-domain Chinese transcriptions, 8,864 source blocks, and four institution-linked Dunhuang witnesses.
- Ethiopia, Eritrea and the Horn collection with 44 curated work/corpus records, separate Ethiopian and Eritrean community profiles, five community-scoped canon assertions, distinct Ethiopian Meqabyan records, two Geʽez textual-family records, and four institution-backed physical witnesses.
- Protocol-first Global Indigenous discovery route with 29 community-scoped records across Mesoamerica, the Andes, North America, Africa, Oceania, Australia, the Circumpolar world, Siberia, Japan, Taiwan and Southeast Asia. Cultural decisions propagate through display, source search, AI synthesis, caching and all workspace export formats; metadata remains discoverable while unreviewed content stays blocked.
- Global Religious Coverage route with eight tracked Phase 9A batches, 18 additional research records, and reviewed source corrections for 24 legacy records spanning Jain, Sikh, Iranian, South Asian, Buddhist, Japanese, Korean, Southeast Asian, Central/Inner Asian, Caucasian, Greek, Roman, Norse and Celtic evidence.
- A 61-record witness archive spanning Dead Sea Scrolls, biblical codices, Nag Hammadi, Derveni, Oxyrhynchus, Herculaneum, Elephantine, Dunhuang, Mawangdui, Guodian, Gandharan, Gilgit, Ethiopian, Mesoamerican and Mesopotamian material, with provenance, date notes, repository, rights, work links and repository IIIF when verified.
- An unresolved-writing research lab covering 25 minimum corpora from Voynich and Rohonc through Aegean, Indus, Rapa Nui, Iranian, African, Iberian, Inner Asian, European-Neolithic and Mesoamerican evidence. Script identity, sign values, language identity and semantic translation remain separate, and unresolved-script questions trigger a no-fabrication response.
- A historical-literature collection with 33 source-linked grimoire, Hermetic, alchemical, demonological and non-scriptural literary records pending scholarly review; five complete public-domain editions; 804 searchable segments; and five shelfmark-level repository witnesses. Sixteen differentiated practice records, four necromancy records, all nine sacrifice-evidence categories and eight documented organizations preserve evidence and cultural boundaries. The interface labels literature as non-scriptural and does not turn ritual content into an operating guide.
- A modern-religions collection with 18 distinct movement profiles, 23 copyright-safe Scientology records, all eight required evidence categories, eight bibliography entries and seven claim-versus-documentary chronology records. Protected works remain metadata-only, legal records retain case scope, Church responses link to the criticism they address, and the existing 1830 Book of Mormon reader remains available.
- Three evidence-specific discovery collections for 10 documented suppression or restriction cases, 11 lost or fragmentary works, six hypothetical reconstructions and eight disputed, forged or hoax-associated works. Canon exclusion remains distinct from prohibition; lost and hypothetical records contain no synthetic source text; authenticity labels, source chains and counterevidence stay visible.
- A source-linked concept and entity system with 89 hierarchical concepts, 115 typed hierarchy/cross-links, 20 scoped original-language terms, 17 historical entities, 73 name assertions, 54 source occurrences, eight contextual relationships and nine evidence-linked evolution paths. Names remain separate from contextual identifications: Belial is not Baal, and Lucifer/Satan is represented only as a later contextual conflation.
- Evidence-backed historical classification examples apply the 15 conflict-cause and 17 conversion/coercion values to two conflict and two conversion cases through 16 cited assignments. The Thirty Years' War and the Indian Rebellion of 1857 retain mixed and disputed causes; Constantinian sponsorship is not labeled forced conversion, while the Safavid case uses that label only where the cited evidence documents direct force.

- The specification’s 250-item source list remains mapped to 248 deduplicated requirements, with later reviewed collection expansions tracked additively.
- 600 catalog works/corpora and 124 source editions covering 121 works with 31,484 verbatim segments. Twenty-six editions are Sumerian transliterations and 30 are Classical Chinese transcriptions rather than English translations. Eighty-eight works have a complete named work or digitized edition; study editions, incomplete ancient witnesses, composite transliterations and translator reconstructions remain explicitly distinguished. Completeness does not imply every ancient recension or physical witness is present.
- Three cited editorial guides compare responses to injury, death and suffering. Two textual-tension cases include source passages and alternative readings. Guides are omitted when their evidence falls outside the selected filters.
- Metadata search with tradition, theme, category, availability and date filters; full passage search, exact phrase mode, and explicit translation filtering.
- Text profiles, paginated reading, citation dialogs, translator and license details, and thematic comparison of the two Quran translations.
- Natural-language question retrieval diversified across traditions. Optional model synthesis cites retrieved evidence and undergoes a second audit pass.
- Side-by-side comparison of 2–12 texts, theme overlap, chronology views, reading guides for contradictions and alternative interpretations, and saved comparison reports.
- Responsive world map, time filtering, horizontal/vertical timelines, story reading paths, evidence-labeled relationship graph, canon browser, theme and author views.
- CC0 museum object imagery with visible attribution.
- Persistent collections, pinned passages, notes, deletion, and Markdown/CSV/JSON exports. PDF export uses the browser’s Print / Save as PDF dialog.
- Light/dark themes, mobile navigation, keyboard focus, native accessible modal dialogs and print styling.

## Database and search

The default database is **embedded PostgreSQL via PGlite**, persisted in `data/user/postgres`. It runs the PostgreSQL schema and pgvector extension and seeds itself on first database access. Initialization can take about 20 seconds; subsequent starts reuse it. Full-text search uses a GIN-indexed PostgreSQL text-search column, combined with weighted lexical retrieval and explicit theme expansion.

`packages/db/schema.sql` includes texts, traditions, editions, passages, themes, people, concepts, relationships, claims, citations, images, collections, saved queries, comparison sessions, annotations, and normalized ontology/entity tables for names, occurrences, contextual relationships, evolution stages and evidence-required classifications. Normalized seed JSON remains the portable catalog source of truth. Application startup upserts bundled editions, passages and ontology records into an existing embedded database; explicit maintenance remains available by stopping the app, running `npm run db:migrate` and `npm run db:seed`, then restarting. These commands update source records while preserving collections. Do not run maintenance concurrently with the embedded server.

For a dedicated PostgreSQL server, use `.env.local` with **ATLAS_DATABASE_URL**, then:

```powershell
npm run db:migrate
npm run db:seed
```

`docker-compose.yml` supplies an optional PostgreSQL 17 + pgvector service. Set `POSTGRES_PASSWORD` yourself before starting it. Docker is not required for the default local app. The database URL must point to a dedicated Atlas database. Generic process-level `DATABASE_URL` is deliberately ignored to avoid connecting to another project’s database.

## Optional model services

Copy `.env.example` to `.env.local`. No model key is required for local evidence retrieval. Set `ATLAS_LLM_BASE_URL`, `ATLAS_LLM_API_KEY`, and `ATLAS_LLM_MODEL` to enable an API compatible with the chat-completions message format. The provider is abstracted in `packages/ai`. A synthesis needs valid retrieved passage identifiers and must pass a second evidence/neutrality check; otherwise the app keeps source results and explains that synthesis was unavailable.

Embedding ingestion is available through `npm run embed` with explicitly configured `ATLAS_EMBEDDING_*` values. It sends corpus segments to the configured provider and may incur charges. No paid service was invoked during development. Secrets remain server-side and are ignored by Git.

## Data, rights and historical review

Catalog coverage is broad; detailed scholarly coverage is intentionally more limited. Most seed records are metadata-only and say when dates, manuscripts, language or authorship are unavailable. Enriched composition ranges and geographic anchors are **provisional editorial estimates**, not peer-reviewed scholarly consensus. Map markers indicate broad contexts, not precise findspots, migration paths or ancient borders.

The local question/comparison engine retrieves evidence and provides three cited editorial guides and two textual-tension examples. These provisional readings distinguish textual differences from possible reconciliations. Free-form model synthesis requires a configured provider. Trade-route overlays, original-language transcription, manuscript variant alignment and comprehensive scholarly annotation require additional sourced datasets; they are not fabricated in the interface.

The full historical translation files retain Project Gutenberg license information. Public-domain status is stated for the USA. Contemporary copyrighted works such as _The Satanic Bible_ remain metadata-only. Oral traditions are not reduced to one fixed canon. See `docs/source-policy.md`, `docs/copyright-policy.md`, and `docs/coverage.md`.

## Reproduce the corpus

The current corpus is bundled; no downloads are needed to start. To regenerate it:

```powershell
python scripts/download.py
npm run ingest:metadata
npm run ingest:text
npm run ingest:egypt
npm run ingest:mesopotamia
npm run ingest:china
npm run ingest:horn
npm run ingest:esoteric
npm run ingest:modern
npm run ingest:disputed
npm run ingest:ontology
npm run classify
npm run ingest:images
```

To import explicitly selected Met objects with confirmed public-domain images:

```powershell
npm run ingest:met -- 548344 553673 551786 590941 553720 550820 --book-of-dead
python scripts/import-met.py --review-file data/intake/met-egypt-reviewed.json
```

The optional work association is specific to institutionally identified Book of the Dead records. The reviewed Egyptian manifest records title expectations, minimum image counts, witness decisions and per-object sensitivity notes. The importer validates a complete batch before replacing the seed, stores provenance, verifies image URLs, preserves unchanged verification timestamps, deduplicates records and refuses objects without confirmed public-domain image rights. Stop the app and run `npm run db:migrate` after imports, then rebuild. `/api/iiif/[artifactId]` exposes Atlas-generated Presentation 3 manifests of accepted CC0 images; these are not institutional manifests.

Metadata generation reads the preserved `docs/product-spec.md`. Ingestion uses explicitly mapped Gutenberg IDs, checks edition delimiters, preserves the edition body or named anthology section, retains sequence order, and records source SHA-256 values. The Egypt ingester uses exact, occurrence-aware source boundaries; it excludes out-of-scope introductions and remarks and separately labels retained footnotes and headings. The Mesopotamia ingester verifies the retained ORACC archives' embedded CC0 metadata and hashes, preserves ePSD2 Q-catalog composite transliteration lines, and keeps Q composition identifiers separate from CDLI P object identifiers. Its default retained-only mode rebuilds without a network request. Atlas segment numbers are application locators; biblical chapter:verse and ORACC line labels are retained where present. Update the corresponding ingestion script when adding an approved edition. Run `npm run refresh:manifest` to refresh provenance from bundled source files.

## Map and timeline coverage

The map includes all 34 reviewed work anchors by default, including records without dates, and keeps unlocated records discoverable. Layer, community, region, geographic evidence and availability filters update the same coverage counts. Overlapping records share their original anchor. The timeline uses 5000 BCE–present and offers physical-witness dates separately from work composition. An earlier unsupported Gilgamesh point and date were removed during the Mesopotamia review rather than being repeated as precise evidence.

`/api/map?view=coverage` and `/api/timeline?view=coverage&layer=witness` return typed records, source context and scoped counts. Legacy record-array responses remain available; unknown-date records are included by default (`undated=false` excludes them). Invalid years, evidence states and boolean filters return 400. Historical borders, religious-influence geometry and conflict transitions still require sourced datasets.

## Tradition taxonomy

Tradition pages retain all 26 original catalog groupings and add seven regional discovery collections plus a source-backed, nonexclusive taxonomy graph. The current seed contains 42 introductory branch, community, regional and practice-context records with sourced, nonexclusive relationships. Chinese Buddhism and Horn communities demonstrate multiple navigation parents; this does not assert exclusive membership or collapse regional identities into one institution. New records have no automatic text assignments, and Indigenous/Oceanic entries explicitly retain community-protocol review gates.

`/api/taxonomy` returns the persisted nodes, cited relationships and current limitation statement. Repeated initialization adds missing source records without replacing legacy IDs or curator-edited rows. The current hierarchy is a Phase 2 foundation, not complete global community coverage.

Unverified research leads use a separate durable queue with explicit source, rights, cultural and scholarly review states. Publishing requires HTTPS evidence, a destination record and completed review gates. The queue has no public API and does not enter search or model synthesis; its curator interface remains scheduled for Phase 26.

## Passage source classification

Every bundled segment now carries an explicit source type. The conservative reviewed set marks 18,011 segments as `Primary text`, including 242 bounded Egyptian translation segments, 477 exact ORACC composite-transliteration blocks, and 7,519 Chinese-script transcription blocks. Here `Primary text` describes composition content in the edition; it does not assert that a composite line belongs to one physical tablet or that its claims are historically true. The 281 editorial segments include 199 bundled Gilgamesh and Egyptian Book of the Dead study segments plus separately labeled historical-edition footnotes. Another 13,192 mixed, reconstructed or structural segments remain `Unknown` pending review. Search accepts repeatable `contentType` filters and prioritizes reviewed primary material for question retrieval. Reader cards and citation drawers display the classification instead of calling every excerpt primary evidence.

## Federated search

The global search route queries works, broad traditions, sourced subtraditions, the 89-record concept ontology, 17 entity/institution records, reviewed author labels, physical witnesses, institutional artifacts, and edition passages. Catalog/archive records and quoted passages render in separate sections so metadata-only records remain discoverable without becoming textual evidence. Unicode-aware search retains non-Latin scripts and resolves only sourced name assertions, including Anunna/Anunnaki, Laozi/Lao Tzu and Yijing/I Ching. Contextual relationships and later conflations do not become unconditional aliases. Broad, Scholarly, Opposition, Deep Archive, and Manuscripts modes plus record-type, language/script, region, canon, rights, and confidence filters narrow the candidate scope before limits are applied.

## Completion baseline

Run `npm run audit:coverage` to regenerate repository coverage and requirement reports, or `npm run audit:check` to check for drift. CI runs the drift check. Reports are in [docs/generated/coverage.md](docs/generated/coverage.md), [docs/generated/requirements.md](docs/generated/requirements.md), and [docs/generated/corpus-targets.json](docs/generated/corpus-targets.json). The command does not connect to a database or fetch sources; deployment counts remain unknown.

The audit reports 78 metrics, maps all 233 authoritative audit sections and 58 quality rules, and preserves the 250 original title requirements (248 distinct targets) plus all 53 expansion sections. Catalog presence is separate from reviewed depth and completion. See [Phase 0 model evaluation](docs/phase-0-model-evaluation.md) for normalization decisions and representative acceptance targets. The authoritative execution order remains [the completion roadmap](docs/atlas-completion-roadmap.md).

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit tests cover catalog/edition integrity, source-preserving search, diversification, database-backed question retrieval, relationship provenance and safe exports. Browser tests cover reading/citation/saving, note persistence and downloads, questions, comparison, maps/timelines, canon filtering, mobile layout, dark mode, and API validation.

Verification covers the original research workflows and additive archive migration, eligibility rules and witness browsing. Optional paid model/embedding provider calls and a separate server PostgreSQL deployment were not exercised; the embedded PostgreSQL runtime was exercised. See `docs/expansion-progress.md` for current scope.

## Project layout

```text
app/                 Next.js routes, API, layout, styles
components/          Research interfaces and reusable controls
packages/ai/         Provider abstraction and evidence audit
packages/db/         PostgreSQL schema and embedded/server adapters
packages/search/     Lexical, theme and PostgreSQL retrieval
packages/citation/   Citations and export formatting
packages/ontology/   Explicit English concept taxonomy
packages/shared/     Typed catalog and shared data model
data/seed/           Portable metadata, editions and passage corpus
data/public-domain/  Original downloaded editions with license text
data/user/           Private local database (ignored by Git)
scripts/             Download, ingestion, classification and DB tools
tests/               Unit/integration and Playwright workflows
docs/                Specification, policies, coverage and architecture
```

The source specification is reference material. Its proposed future modules are tracked separately from this local release. This software does not adjudicate the truth of a religion or worldview.
