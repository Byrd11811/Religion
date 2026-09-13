# Architecture

Next.js App Router serves a client research interface and Node route handlers. The browser receives catalog metadata but never provider keys or the entire passage corpus. Passage pages are paginated; retrieval runs server-side. The default database is PGlite PostgreSQL with a persistent local filesystem. A dedicated server PostgreSQL adapter is selected only by ATLAS_DATABASE_URL. Both execute parameterized SQL.

API routes: GET /api/texts[/id], /api/traditions[/id], /api/themes, /api/concepts, /api/passages[/id], /api/search, /api/timeline, /api/map, /api/graph, /api/images, /api/collections[/id], /api/health. POST /api/query, /api/compare, /api/similarity, /api/contradictions and /api/collections. PATCH/DELETE /api/collections/id.

Search unions weighted inverted-index results and PostgreSQL full-text ranking, with explicit theme expansion. Result filtering preserves text, edition, tradition and chronology constraints. Diversity chooses at most one passage per work and two per catalog grouping for question results. Retrieved segments retain edition ID, text ID, source URL and translator metadata.

Collections use serialized mutations and PostgreSQL transactions. A legacy local collections.json can be imported on first embedded-database initialization. Server binds to loopback; mutations check the request Origin host. This is a local single-user deployment: authentication and multi-tenant authorization are required before adapting it to a public service.

Sources are trusted build-time files. Untrusted source content is passed to model providers as data. Zod validates user write payloads. No raw HTML is rendered from source passages or notes. CSV export neutralizes formula-leading cells. Model error messages do not expose provider secrets.
