CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS atlas_internal_metadata (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS traditions (id text PRIMARY KEY, name text NOT NULL, family text, region text, start_date integer, end_date integer, description text, worldview_tags text[] DEFAULT '{}', founder_or_origin text, color_token text, metadata jsonb NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS texts (id text PRIMARY KEY, title text NOT NULL, alternate_titles text[] DEFAULT '{}', tradition_id text REFERENCES traditions(id), category text NOT NULL, canon_status text, approximate_start_date integer, approximate_end_date integer, date_confidence text, origin_region text, origin_lat double precision, origin_lng double precision, original_language text[] DEFAULT '{}', authorship_summary text, authorship_confidence text, description text, historical_context text, manuscript_history text, source_status text, copyright_status text, public_domain_available boolean DEFAULT false, primary_source_url text, metadata jsonb NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), CHECK (approximate_end_date IS NULL OR approximate_start_date IS NULL OR approximate_end_date >= approximate_start_date));
CREATE TABLE IF NOT EXISTS editions (id text PRIMARY KEY, text_id text NOT NULL REFERENCES texts(id), title text NOT NULL, translator text, language text, license text NOT NULL, source_url text NOT NULL, sha256 text NOT NULL, public_domain boolean NOT NULL DEFAULT false, metadata jsonb NOT NULL);
ALTER TABLE editions ADD COLUMN IF NOT EXISTS public_domain boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS passages (id text PRIMARY KEY, text_id text NOT NULL REFERENCES texts(id), edition_id text NOT NULL REFERENCES editions(id), book text, chapter text, section text, verse text, sequence integer NOT NULL, reference text NOT NULL, original_text text, translation text NOT NULL, translation_name text, translator text, copyright_status text NOT NULL, public_domain boolean NOT NULL, source_url text NOT NULL, embedding vector, search_document tsvector GENERATED ALWAYS AS (to_tsvector('english', translation)) STORED, metadata jsonb NOT NULL DEFAULT '{}', UNIQUE(edition_id,sequence));
CREATE INDEX IF NOT EXISTS passages_search_idx ON passages USING gin(search_document);
CREATE INDEX IF NOT EXISTS passages_text_idx ON passages(text_id);
ALTER TABLE passages ADD COLUMN IF NOT EXISTS embedding_model text;
ALTER TABLE passages ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'Unknown' CHECK(content_type IN ('Primary text','Translator note','Editorial introduction','Scholarly commentary','Footnote','Appendix','Unknown'));
CREATE TABLE IF NOT EXISTS themes (id text PRIMARY KEY, name text UNIQUE NOT NULL, description text, parent_id text REFERENCES themes(id));
CREATE TABLE IF NOT EXISTS passage_themes (passage_id text REFERENCES passages(id),theme_id text REFERENCES themes(id),relevance_score real,classification_method text,confidence text,PRIMARY KEY(passage_id,theme_id));
CREATE TABLE IF NOT EXISTS people (id text PRIMARY KEY,name text NOT NULL,role text,birth_date integer,death_date integer,region text,description text);
CREATE TABLE IF NOT EXISTS text_people (text_id text REFERENCES texts(id),person_id text REFERENCES people(id),relationship_type text,PRIMARY KEY(text_id,person_id));
CREATE TABLE IF NOT EXISTS concepts (id text PRIMARY KEY,name text NOT NULL,definition text,original_language text);
CREATE TABLE IF NOT EXISTS concept_mentions (concept_id text REFERENCES concepts(id),passage_id text REFERENCES passages(id),relevance_score real,stance text,notes text,PRIMARY KEY(concept_id,passage_id));
CREATE TABLE IF NOT EXISTS relationships (id text PRIMARY KEY,source_text_id text REFERENCES texts(id),target_text_id text REFERENCES texts(id),relationship_type text NOT NULL,evidence_level text NOT NULL,scholar_summary text,confidence text NOT NULL,citation text NOT NULL,metadata jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS claims (id text PRIMARY KEY,statement text NOT NULL,claim_type text NOT NULL,confidence text NOT NULL,model_generated boolean DEFAULT false,reviewed boolean DEFAULT false,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS claim_sources (id bigserial PRIMARY KEY,claim_id text REFERENCES claims(id),source_type text,source_id text,source_url text,quote text,citation_label text);
CREATE TABLE IF NOT EXISTS images (id text PRIMARY KEY,text_id text REFERENCES texts(id),type text,caption text,source_url text NOT NULL,image_url text NOT NULL,license text NOT NULL,creator text,date text,museum text,public_domain boolean DEFAULT false,metadata jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS user_collections (id uuid PRIMARY KEY,name text NOT NULL,notes text NOT NULL DEFAULT '',items jsonb NOT NULL DEFAULT '[]',created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS saved_queries (id uuid PRIMARY KEY,collection_id uuid REFERENCES user_collections(id),question text NOT NULL,answer jsonb,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS comparison_sessions (id uuid PRIMARY KEY,collection_id uuid REFERENCES user_collections(id),text_ids text[] NOT NULL,theme text,result jsonb,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS annotations (id uuid PRIMARY KEY,collection_id uuid REFERENCES user_collections(id),passage_id text REFERENCES passages(id),note text NOT NULL,created_at timestamptz DEFAULT now());

-- Additive archive model. Existing text, edition, passage and collection IDs remain intact.
CREATE TABLE IF NOT EXISTS works (id text PRIMARY KEY, legacy_text_id text UNIQUE REFERENCES texts(id), title text NOT NULL, coverage_status text NOT NULL, evidence_status text NOT NULL, decipherment text NOT NULL, access text NOT NULL DEFAULT 'Public metadata', metadata jsonb NOT NULL, created_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS works_title_idx ON works(lower(title));
CREATE INDEX IF NOT EXISTS works_coverage_idx ON works(coverage_status);
CREATE TABLE IF NOT EXISTS recensions (id text PRIMARY KEY, work_id text NOT NULL REFERENCES works(id), title text NOT NULL, metadata jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS witnesses (id text PRIMARY KEY, title text NOT NULL, witness_type text NOT NULL, inventory_number text, repository text, access text NOT NULL DEFAULT 'Public metadata', metadata jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS witnesses_inventory_idx ON witnesses(inventory_number);
CREATE TABLE IF NOT EXISTS witness_works (witness_id text REFERENCES witnesses(id),work_id text REFERENCES works(id),recension_id text REFERENCES recensions(id),source_url text NOT NULL,PRIMARY KEY(witness_id,work_id));
CREATE TABLE IF NOT EXISTS edition_witnesses (edition_id text REFERENCES editions(id),witness_id text REFERENCES witnesses(id),source_url text NOT NULL,association_notes text NOT NULL,PRIMARY KEY(edition_id,witness_id));
CREATE TABLE IF NOT EXISTS artifacts (id text PRIMARY KEY,title text NOT NULL,witness_id text REFERENCES witnesses(id),source_url text NOT NULL,metadata jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS archive_images (id text PRIMARY KEY,artifact_id text REFERENCES artifacts(id),witness_id text REFERENCES witnesses(id),image_url text NOT NULL,source_url text NOT NULL,rights text NOT NULL CHECK(length(trim(rights))>0),metadata jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS work_images (work_id text REFERENCES works(id),image_id text REFERENCES archive_images(id),association_notes text NOT NULL,source_url text NOT NULL,PRIMARY KEY(work_id,image_id));
CREATE TABLE IF NOT EXISTS canon_memberships (id text PRIMARY KEY,work_id text REFERENCES works(id),community text NOT NULL,edition_id text REFERENCES editions(id),status text NOT NULL,enumeration_notes text,source_url text NOT NULL);
CREATE TABLE IF NOT EXISTS evidence_records (id text PRIMARY KEY,work_id text REFERENCES works(id),witness_id text REFERENCES witnesses(id),statement text NOT NULL,status text NOT NULL,source_url text NOT NULL,alternative text,counterargument text,metadata jsonb NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS cultural_protocols (id text PRIMARY KEY,work_id text REFERENCES works(id),community text NOT NULL,language text,recorder text,recorded_at text,recorder_context text,reproduction_permission text NOT NULL DEFAULT 'Unassessed',restrictions text NOT NULL,source_url text NOT NULL);
CREATE TABLE IF NOT EXISTS suppression_events (id text PRIMARY KEY,work_id text REFERENCES works(id),authority text NOT NULL,location text NOT NULL,event_date text NOT NULL,reason text NOT NULL,source_url text NOT NULL);
-- Source-backed, non-exclusive tradition relationships; legacy grouping IDs stay valid.
CREATE TABLE IF NOT EXISTS tradition_hierarchy (parent_id text NOT NULL REFERENCES traditions(id),child_id text NOT NULL REFERENCES traditions(id),relationship text NOT NULL CHECK(relationship IN ('navigation','within','cross-cutting')),source_url text NOT NULL CHECK(source_url LIKE 'https://%'),notes text NOT NULL CHECK(length(trim(notes))>0),PRIMARY KEY(parent_id,child_id,relationship),CHECK(parent_id<>child_id));
CREATE TABLE IF NOT EXISTS research_queue (id text PRIMARY KEY,title text NOT NULL CHECK(length(trim(title))>0),summary text NOT NULL CHECK(length(trim(summary))>0),status text NOT NULL CHECK(status IN ('new-lead','source-needed','primary-source-located','awaiting-rights-review','awaiting-cultural-review','awaiting-scholarly-review','disputed','provisionally-resolved','rejected-false-lead','published-to-atlas')),source_urls jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(source_urls)='array'),rights_review text NOT NULL DEFAULT 'unassessed' CHECK(rights_review IN ('unassessed','not-required','cleared','blocked')),cultural_review text NOT NULL DEFAULT 'unassessed' CHECK(cultural_review IN ('unassessed','not-required','cleared','blocked')),scholarly_review text NOT NULL DEFAULT 'unassessed' CHECK(scholarly_review IN ('unassessed','not-required','cleared','blocked')),publication_target text,metadata jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS research_queue_events (id bigserial PRIMARY KEY,queue_id text NOT NULL REFERENCES research_queue(id) ON DELETE RESTRICT,from_status text,to_status text NOT NULL,note text NOT NULL CHECK(length(trim(note))>0),created_at timestamptz NOT NULL DEFAULT now());

-- Phase 15 ontology and entity-history model. These tables stay separate from the
-- legacy flat concepts table so existing concept_mentions remain valid while the
-- source-backed hierarchy is introduced additively.
CREATE TABLE IF NOT EXISTS ontology_sources (
  id text PRIMARY KEY,
  label text NOT NULL CHECK(length(trim(label))>0),
  url text NOT NULL CHECK(url LIKE 'https://%'),
  source_type text NOT NULL CHECK(length(trim(source_type))>0),
  perspective text NOT NULL DEFAULT 'Unspecified',
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS ontology_concepts (
  id text PRIMARY KEY,
  canonical_name text NOT NULL CHECK(length(trim(canonical_name))>0),
  definition text NOT NULL CHECK(length(trim(definition))>0),
  concept_kind text NOT NULL CHECK(concept_kind IN ('root','branch','concept')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_concepts_name_idx ON ontology_concepts(lower(canonical_name));
CREATE TABLE IF NOT EXISTS ontology_concept_edges (
  id text PRIMARY KEY,
  broader_id text NOT NULL REFERENCES ontology_concepts(id) ON DELETE RESTRICT,
  narrower_id text NOT NULL REFERENCES ontology_concepts(id) ON DELETE RESTRICT,
  relationship_type text NOT NULL CHECK(relationship_type IN ('root','primary','secondary')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(broader_id,narrower_id,relationship_type),
  CHECK(broader_id<>narrower_id)
);
CREATE INDEX IF NOT EXISTS ontology_concept_edges_broader_idx ON ontology_concept_edges(broader_id);
CREATE INDEX IF NOT EXISTS ontology_concept_edges_narrower_idx ON ontology_concept_edges(narrower_id);
CREATE TABLE IF NOT EXISTS ontology_concept_terms (
  id text PRIMARY KEY,
  concept_id text NOT NULL REFERENCES ontology_concepts(id) ON DELETE RESTRICT,
  term text NOT NULL CHECK(length(trim(term))>0),
  language text NOT NULL CHECK(length(trim(language))>0),
  script text NOT NULL CHECK(length(trim(script))>0),
  transliteration text,
  semantic_relation text NOT NULL CHECK(semantic_relation IN ('tradition-specific','translation-gloss','related','contrast','language-form')),
  semantic_scope text NOT NULL CHECK(length(trim(semantic_scope))>0),
  note text NOT NULL CHECK(length(trim(note))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_concept_terms_concept_idx ON ontology_concept_terms(concept_id);
CREATE INDEX IF NOT EXISTS ontology_concept_terms_term_idx ON ontology_concept_terms(lower(term));
CREATE TABLE IF NOT EXISTS ontology_entities (
  id text PRIMARY KEY,
  canonical_name text NOT NULL CHECK(length(trim(canonical_name))>0),
  entity_type text NOT NULL CHECK(entity_type IN ('deity','person','work','religious-figure','institution','council')),
  description text NOT NULL CHECK(length(trim(description))>0),
  earliest_attestation text NOT NULL CHECK(length(trim(earliest_attestation))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_entities_name_idx ON ontology_entities(lower(canonical_name));
CREATE TABLE IF NOT EXISTS ontology_name_assertions (
  id text PRIMARY KEY,
  entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  asserted_name text NOT NULL CHECK(length(trim(asserted_name))>0),
  normalized_name text NOT NULL CHECK(length(trim(normalized_name))>0),
  assertion_kind text NOT NULL CHECK(assertion_kind IN ('canonical','alternate-name','language-form','transliteration','translation-rendering','former-name','abbreviation')),
  language text,
  script text,
  transliteration text,
  scope text NOT NULL CHECK(length(trim(scope))>0),
  confidence text NOT NULL CHECK(confidence IN ('high','medium','low','contested')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_name_assertions_entity_idx ON ontology_name_assertions(entity_id);
CREATE INDEX IF NOT EXISTS ontology_name_assertions_name_idx ON ontology_name_assertions(lower(asserted_name));
CREATE TABLE IF NOT EXISTS ontology_occurrences (
  id text PRIMARY KEY,
  entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  attested_form text NOT NULL CHECK(length(trim(attested_form))>0),
  language text NOT NULL CHECK(length(trim(language))>0),
  script text NOT NULL CHECK(length(trim(script))>0),
  transliteration text,
  work_id text,
  source_id text NOT NULL REFERENCES ontology_sources(id) ON DELETE RESTRICT,
  locator text NOT NULL CHECK(length(trim(locator))>0),
  role_or_context text NOT NULL CHECK(length(trim(role_or_context))>0),
  description text NOT NULL CHECK(length(trim(description))>0),
  confidence text NOT NULL CHECK(confidence IN ('high','medium','low','contested')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_occurrences_entity_idx ON ontology_occurrences(entity_id);
CREATE INDEX IF NOT EXISTS ontology_occurrences_work_idx ON ontology_occurrences(work_id);
CREATE TABLE IF NOT EXISTS ontology_contextual_relationships (
  id text PRIMARY KEY,
  source_entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  target_entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  relationship_type text NOT NULL CHECK(length(trim(relationship_type))>0),
  context_summary text NOT NULL CHECK(length(trim(context_summary))>0),
  scope text NOT NULL CHECK(length(trim(scope))>0),
  start_date text,
  end_date text,
  confidence text NOT NULL CHECK(confidence IN ('high','medium','low','contested')),
  is_equivalence boolean NOT NULL DEFAULT false CHECK(is_equivalence=false),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  CHECK(source_entity_id<>target_entity_id)
);
CREATE INDEX IF NOT EXISTS ontology_relationships_source_idx ON ontology_contextual_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS ontology_relationships_target_idx ON ontology_contextual_relationships(target_entity_id);
CREATE TABLE IF NOT EXISTS ontology_evolution_paths (
  id text PRIMARY KEY,
  entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK(length(trim(title))>0),
  summary text NOT NULL CHECK(length(trim(summary))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_evolution_paths_entity_idx ON ontology_evolution_paths(entity_id);
CREATE TABLE IF NOT EXISTS ontology_evolution_stages (
  id text PRIMARY KEY,
  path_id text NOT NULL REFERENCES ontology_evolution_paths(id) ON DELETE RESTRICT,
  entity_id text NOT NULL REFERENCES ontology_entities(id) ON DELETE RESTRICT,
  sequence integer NOT NULL CHECK(sequence>=0),
  stage_type text NOT NULL CHECK(length(trim(stage_type))>0),
  stage_label text NOT NULL CHECK(length(trim(stage_label))>0),
  date_label text NOT NULL CHECK(length(trim(date_label))>0),
  role_or_interpretation text NOT NULL CHECK(length(trim(role_or_interpretation))>0),
  summary text NOT NULL CHECK(length(trim(summary))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(path_id,sequence)
);
CREATE INDEX IF NOT EXISTS ontology_evolution_stages_path_idx ON ontology_evolution_stages(path_id,sequence);
CREATE TABLE IF NOT EXISTS ontology_classification_schemes (
  id text PRIMARY KEY,
  label text NOT NULL CHECK(length(trim(label))>0),
  evidence_required boolean NOT NULL DEFAULT true CHECK(evidence_required),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS ontology_classification_values (
  id text PRIMARY KEY,
  scheme_id text NOT NULL REFERENCES ontology_classification_schemes(id) ON DELETE RESTRICT,
  value text NOT NULL CHECK(length(trim(value))>0),
  label text NOT NULL CHECK(length(trim(label))>0),
  definition text NOT NULL CHECK(length(trim(definition))>0),
  evidence_required boolean NOT NULL DEFAULT true CHECK(evidence_required),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(scheme_id,value)
);
ALTER TABLE ontology_classification_values ADD COLUMN IF NOT EXISTS source_ids text[];
UPDATE ontology_classification_values
SET source_ids=ARRAY(SELECT jsonb_array_elements_text(metadata->'sourceIds'))
WHERE source_ids IS NULL AND jsonb_typeof(metadata->'sourceIds')='array';
ALTER TABLE ontology_classification_values ALTER COLUMN source_ids SET NOT NULL;
ALTER TABLE ontology_classification_values DROP CONSTRAINT IF EXISTS ontology_classification_values_source_ids_check;
ALTER TABLE ontology_classification_values ADD CONSTRAINT ontology_classification_values_source_ids_check CHECK(cardinality(source_ids)>0);
CREATE INDEX IF NOT EXISTS ontology_classification_values_scheme_idx ON ontology_classification_values(scheme_id);
CREATE TABLE IF NOT EXISTS ontology_conflict_cases (
  id text PRIMARY KEY,
  name text NOT NULL CHECK(length(trim(name))>0),
  start_date text NOT NULL CHECK(length(trim(start_date))>0),
  end_date text NOT NULL CHECK(length(trim(end_date))>0),
  date_label text NOT NULL CHECK(length(trim(date_label))>0),
  locations text[] NOT NULL CHECK(cardinality(locations)>0),
  actors text[] NOT NULL CHECK(cardinality(actors)>0),
  summary text NOT NULL CHECK(length(trim(summary))>0),
  stated_cause text NOT NULL CHECK(length(trim(stated_cause))>0),
  participant_justifications text[] NOT NULL CHECK(cardinality(participant_justifications)>0),
  scholarly_interpretations text[] NOT NULL CHECK(cardinality(scholarly_interpretations)>0),
  disputed_causation text NOT NULL CHECK(length(trim(disputed_causation))>0),
  uncertainty text NOT NULL CHECK(length(trim(uncertainty))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_conflict_cases_name_idx ON ontology_conflict_cases(lower(name));
CREATE TABLE IF NOT EXISTS ontology_conflict_cause_assignments (
  id text PRIMARY KEY,
  conflict_case_id text NOT NULL REFERENCES ontology_conflict_cases(id) ON DELETE RESTRICT,
  cause_id text NOT NULL REFERENCES ontology_classification_values(id) ON DELETE RESTRICT,
  evidence text NOT NULL CHECK(length(trim(evidence))>0),
  evidence_basis text NOT NULL CHECK(evidence_basis IN ('primary-source','archival-primary-source-dossier','scholarly-analysis','primary-and-scholarly')),
  confidence text NOT NULL CHECK(confidence IN ('high','medium','low','contested')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(conflict_case_id,cause_id)
);
CREATE INDEX IF NOT EXISTS ontology_conflict_assignments_case_idx ON ontology_conflict_cause_assignments(conflict_case_id);
CREATE INDEX IF NOT EXISTS ontology_conflict_assignments_cause_idx ON ontology_conflict_cause_assignments(cause_id);
CREATE TABLE IF NOT EXISTS ontology_conversion_cases (
  id text PRIMARY KEY,
  name text NOT NULL CHECK(length(trim(name))>0),
  start_date text NOT NULL CHECK(length(trim(start_date))>0),
  end_date text NOT NULL CHECK(length(trim(end_date))>0),
  date_label text NOT NULL CHECK(length(trim(date_label))>0),
  locations text[] NOT NULL CHECK(cardinality(locations)>0),
  actors text[] NOT NULL CHECK(cardinality(actors)>0),
  summary text NOT NULL CHECK(length(trim(summary))>0),
  stated_policy text NOT NULL CHECK(length(trim(stated_policy))>0),
  stated_justification text NOT NULL CHECK(length(trim(stated_justification))>0),
  resistance_continuity text NOT NULL CHECK(length(trim(resistance_continuity))>0),
  disputes_uncertainty text NOT NULL CHECK(length(trim(disputes_uncertainty))>0),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS ontology_conversion_cases_name_idx ON ontology_conversion_cases(lower(name));
CREATE TABLE IF NOT EXISTS ontology_conversion_mode_assignments (
  id text PRIMARY KEY,
  conversion_case_id text NOT NULL REFERENCES ontology_conversion_cases(id) ON DELETE RESTRICT,
  mode_id text NOT NULL REFERENCES ontology_classification_values(id) ON DELETE RESTRICT,
  evidence text NOT NULL CHECK(length(trim(evidence))>0),
  evidence_standard text NOT NULL CHECK(evidence_standard IN ('documented-direct-force','documented-threat','documented-state-policy','documented-continuity','documented-discrimination')),
  confidence text NOT NULL CHECK(confidence IN ('high','medium','low','contested')),
  source_ids text[] NOT NULL CHECK(cardinality(source_ids)>0),
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(conversion_case_id,mode_id)
);
CREATE INDEX IF NOT EXISTS ontology_conversion_assignments_case_idx ON ontology_conversion_mode_assignments(conversion_case_id);
CREATE INDEX IF NOT EXISTS ontology_conversion_assignments_mode_idx ON ontology_conversion_mode_assignments(mode_id);
