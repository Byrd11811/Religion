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

- 252 distinct metadata records based on the specification’s 250-item list, deduplicated to 248 records, plus four additional works.
- 44 English source editions covering 43 works and 20,991 verbatim segments. Forty-one works have a complete named work or digitized edition; Gilgamesh and the Egyptian Book of the Dead have historical studies with translated selections. Completeness does not imply every ancient recension is present.
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

`packages/db/schema.sql` includes texts, traditions, editions, passages, themes, people, concepts, relationships, claims, citations, images, collections, saved queries, comparison sessions and annotations. Normalized seed JSON remains the portable catalog source of truth. After editing the corpus, stop the app, run `npm run db:migrate` and `npm run db:seed`, then restart. These commands update source records while preserving collections. Do not run maintenance concurrently with the embedded server.

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

The full historical translation files retain Project Gutenberg license information. Public-domain status is stated for the USA. Contemporary copyrighted works such as *The Satanic Bible* remain metadata-only. Oral traditions are not reduced to one fixed canon. See `docs/source-policy.md`, `docs/copyright-policy.md`, and `docs/coverage.md`.

## Reproduce the corpus

The current corpus is bundled; no downloads are needed to start. To regenerate it:

```powershell
python scripts/download.py
npm run ingest:metadata
npm run ingest:text
npm run classify
npm run ingest:images
```

Metadata generation reads the preserved `docs/product-spec.md`. Ingestion uses explicitly mapped Gutenberg IDs, checks edition delimiters, preserves the edition body or named anthology section, retains sequence order, and records source SHA-256 values. Atlas segment numbers are application locators; biblical chapter:verse labels are retained where present. Update `scripts/ingest.py` or `scripts/extend_corpus.py` when adding an approved edition. Run `python scripts/refresh-manifest.py` to refresh provenance from bundled source files.

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

Verified on this machine: 10 data/integration tests and 6 Playwright browser tests pass. Typecheck, lint, and optimized production build pass. Both museum image URLs were checked. Optional paid model/embedding provider calls and a separate server PostgreSQL deployment were not exercised; the embedded PostgreSQL runtime was exercised.

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
