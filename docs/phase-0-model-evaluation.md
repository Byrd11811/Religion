# Phase 0 model evaluation and delivery gates

Evaluated against the schema, seed adapters and authoritative requirements at the start of implementation. This is a model decision record, not a migration or a claim of populated historical coverage. The current normalized tables are works, recensions, witnesses, artifacts, images, texts, editions, passages, traditions, people, concepts, relationships, claims, claim_sources, evidence_records, cultural_protocols, canon_memberships and suppression_events, plus research-workspace tables and associations. Inspecting their definitions does not establish deployed row counts.

## Source boundary and baseline

`npm run audit:coverage` reads the eight registered seed JSON files and the same shared witness/artifact/image exports used by the application. It never imports the database accessor, opens the user's database, reads environment files, calls providers, fetches sources or changes corpus records. All deployment persisted counts are null/unknown. A source-registry absence is explicitly zero only for the reviewed repository seeds. New seed files fail until adapters are reconciled. Source fingerprints include the seed, schema, initialization/synchronization code and active map component; CI rejects stale generated reports after changes.

Existing work profiles default to unreviewed, no transcription and no reviewed bibliography. All edition language metadata describes English editions; original-language metadata is not original-language content. Source URLs and historical source notes are not a reviewed bibliography. Generic themes such as sacrifice or names in passages are not first-class practice, entity or event records. The two legacy museum objects and six papyri are object coverage, not a dedicated artwork/architecture catalog. These distinctions explain explicit zero seed metrics; they make no claim that source passages never mention the subject.

The fixed 2026 measurement year remains explicit for reproducibility. Phase 1 now shares map scope predicates with the audit, includes undated anchors, and uses the current year in the UI. Metric `exposed` values currently mean source-predicate eligibility, not fresh browser certification. Reviewed, tested and complete states require separate evidence. Recorded image rights are intake evidence, not current remote availability or new legal review.

## Normalization decisions

Use stable IDs and independently cited relationships, not parallel text catalogs. Store uncertain date intervals, source precision and competing assertions without choosing a fabricated midpoint. Source titles, authors/institutions, publication dates, locators, rights, source-chain dependencies and confidence belong to shared evidence/provenance records. A source's category is independent of the historical claim's confidence. Phase 2 implements these foundations before dependent intake; later phases provide depth and views.

| Proposed model(s) | Decision and reuse | Required distinction / delivery owner |
|---|---|---|
| Historical polities | Normalize polity identity; link existing people and traditions | Polity succession is not religious continuity; Track A, Phase 2 |
| Territorial snapshots | Normalize dated spatial assertions linked to polities and geographic provenance | Independent snapshots, boundary type, uncertainty, source and disputed alternatives; A, 2/20 |
| Conflicts; conflict parties | Normalize events and typed actor/community/polity associations | Do not collapse whole communities into an army or responsible institution; A, 2 |
| Conflict causation | Many-to-many sourced claims through shared claim/evidence infrastructure | Stated cause, participant justification and scholarly interpretation remain separate; A, 2/15 |
| Religious-policy events | Typed historical event subtype; normalize policy, jurisdiction and effective interval | State religion, legal status and population practice differ; A, 2 |
| Persecution events | Typed event with actors, targets, place, source and uncertainty | Sourced event; never inferred from two traditions being present; A, 2 |
| Coercion/conversion events | Typed event plus independently evidenced conversion classifications | Voluntary, incentives, pressure, threats, force, gradual change and continuity; A, 2/15 |
| Migration events; exile events | Typed events and sourced route geometry, linked communities | Forced transfer, exile, migration, trade and missionary movement retain mechanism; A, 2/20 |
| Sacred-site events | Normalize site identity and event history; link artifact/building evidence | Founding, damage, destruction, confiscation and reuse are different events; A/D, 2 |
| Organizations; organization aliases | Normalize organization identity using shared entity infrastructure | Religious order, fraternal group and claimed successor are not interchangeable; C, 2/15 |
| Organization memberships; membership evidence | Normalize time-bounded person/organization association, evidence via shared sources | Contact, membership, attribution and disproven identification retain eight statuses; C, 2/17 |
| Religious/esoteric entities; entity aliases; entity occurrences | Extend existing concepts/people with typed entities and occurrence associations | Source/language/period-specific forms and roles; contested identification is a relationship, not alias merge; B, 2/15/24 |
| Ritual practices; practice evidence | Normalize community-specific practices; link source passages, witnesses and claims | Ancestor contact, necromancy, demonology, divination and ritual functions stay distinct; B, 2/12 |
| Sacrifice evidence | Typed evidence associations on practice/event claims | Retain all nine categories; archaeology, human remains, texts, hostile/colonial accounts and interpretation differ; B, 2/12 |
| Artwork; architecture | Extend artifact/site identities with typed object records and creation/patronage relations | Object identity, documented access and purpose before interpretations; D, 2/19 |
| Symbols; symbol interpretations | Normalize symbols, object occurrences and attributed interpretation assertions | No universal meaning or intentionality inferred from resemblance; D, 2/24 |
| Map layers; geographic provenance | Normalize layer descriptors, source-backed features and temporal snapshots | Political control and religious presence/influence use independent layers; uncertainty accessible without color; A, 2/20 |
| Unresolved research queue | Durable workflow records referencing the same entities/claims/sources | Ten statuses, review history, rights/cultural checks and deliberate publication; no automatic verified retrieval; E, 2/25/26 |

JSON remains suitable for retained raw institution payloads, source-specific optional fields and versioned snapshots. It must not replace foreign keys and typed relationships needed for source chains, membership, competing interpretations or temporal joins. Curated overrides survive re-import. Revocation must affect search, API, media, IIIF, model input, saved snapshots and export. The full curation UI may arrive in Phase 26; enforcement cannot wait until then.

## Representative acceptance cases and source intake gates

These are scoped research targets, not new historical assertions or populated corpus records. Existing documented sources may satisfy a target only after source-chain and rights review. No mandatory source can be replaced by invented evidence. The Phase 0 coverage matrix preserves every original title and expansion section so the examples below do not become a corpus ceiling.

| Track | Representative target set | Acceptance before track closure |
|---|---|---|
| A | Roman Christianization; early Islamic conquest versus later religious change; colonial Mexico/Indigenous continuity | Reviewed cases spanning state patronage, conquest and colonial coercion/continuity; each with at least two independently sourced snapshots and explicit unknown intermediate states. Shared-location inspection, delta, long-term versus immediate changes, cited teaching/action pair and mixed motives must work. Unsupported demographic estimates stay absent. Source discovery and geometry licensing remain intake work. |
| B | Public Mesopotamian ghost rites; Endor textual tradition; medieval grimoire material; Belial/Baal disambiguation; Mesoamerican and Punic sacrifice evidence comparisons | Real source occurrences across differing contexts; no automatic equivalence, fabricated entity evolution or flattening of archaeology/hostile accusation. Review public/community permissions before use. No ritual instruction workflow. |
| C | Freemasonry, Bavarian Illuminati, Knights Templar, Skull and Bones and Rosicrucian traditions | Documented organizational identity and publicly available sources; exercise documented membership, contact-only and unsupported-attribution states. Do not invent a named person's membership to fill a fixture. Safe synthetic negative fixtures test gesture-only rejection; not published research. |
| D | A documented religious artwork and building, plus object-only records for the named Yeo portrait, Paul VI Audience Hall, Raphael works and Holy Doors where rights permit | Creator/patron/date/purpose/access/source before interpretation. Views distinguish all interpretation categories; contested intentionality cases stay deferred. No reproduction merely because a photograph is online. |
| E | Source-needed lead, rights-review lead, cultural-review lead, rejected lead and approved publication | Durable status/history and deliberate publication transition. Use clearly synthetic test fixtures for safety paths, never count them as real research coverage. No private/restricted content leakage. |

The listed source targets are not declared researched or verified here. Their research, scholarly review, licensed spatial data and representative populated cases are requirements of the assigned intake and feature phases. Acceptance is behavioral and evidential; collecting arbitrary numbers of duplicate images or names cannot satisfy it. Existing 500 meaningful records / 100 searchable works / image exception gates remain unchanged.

## Traceability and known limits

The generated matrix includes all 110 audit sections, all 23 expansion quality rules and all 35 historical regression rules. Full section hashes detect changed acceptance criteria. The matrix starts conservatively incomplete/unverified: it is not a claim that all current workflows are absent. Existing tests may substantiate partial behavior but do not automatically close the larger acceptance criteria. Feature-level completion evidence must be added as phases are delivered.

Deployment-specific counts, live source URL health, paid providers, scholarly review and complete historical coverage remain unverified. Phase 0 tooling tests must cover duplicate IDs, orphan links, empty editions, commentary labeling, null/zero separation and inventory drift. CI checks deterministic reports as well as the existing application checks.
