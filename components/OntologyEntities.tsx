"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import {
  conflictCases,
  conflictCauseAssignments,
  conflictCauseVocabulary,
  conversionCases,
  conversionModeAssignments,
  conversionModeVocabulary,
  entityEvolutionPaths,
  entityEvolutionStages,
  entityNameAssertions,
  entityOccurrences,
  entityRelationships,
  ontologyConceptEdges,
  ontologyConceptTerms,
  ontologyConcepts,
  ontologyEntities,
  ontologySources,
} from "@/packages/shared/ontology-entities";
import { texts } from "@/packages/shared/catalog";
import { Empty, Heading } from "./common";

const sourceById = new Map(
  ontologySources.map((source) => [source.id, source]),
);
const conceptById = new Map(
  ontologyConcepts.map((concept) => [concept.id, concept]),
);
const entityById = new Map(
  ontologyEntities.map((entity) => [entity.id, entity]),
);
const catalogWorkIds = new Set(texts.map((work) => work.id));
const conflictCauseById = new Map(
  conflictCauseVocabulary.map((cause) => [cause.id, cause]),
);
const conversionModeById = new Map(
  conversionModeVocabulary.map((mode) => [mode.id, mode]),
);

function unique(values: string[]) {
  return [...new Set(values)];
}

function searchTokens(value: string) {
  const originals =
    value
      .normalize("NFC")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  const folded =
    value
      .normalize("NFKD")
      .toLocaleLowerCase()
      .replace(/\p{M}+/gu, "")
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? [];
  return unique([...originals, ...folded]);
}

function matchesSearch(value: string, query: string) {
  const sought = searchTokens(query);
  if (!sought.length) return true;
  const available = new Set(searchTokens(value));
  return sought.every((term) => available.has(term));
}

function label(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function EvidenceLinks({ sourceIds }: { sourceIds: string[] }) {
  const sources = unique(sourceIds)
    .map((id) => sourceById.get(id))
    .filter((source) => source !== undefined);
  if (!sources.length) return null;
  return (
    <span className="ontology-sources" aria-label="Sources">
      Sources:{" "}
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 && " · "}
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label} <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </span>
      ))}
    </span>
  );
}

function Confidence({ value }: { value: string }) {
  return <span className="ontology-confidence">Confidence: {value}</span>;
}

function OntologyIndex() {
  const [query, setQuery] = useState("");
  const root = ontologyConcepts.find((concept) => concept.level === "root");
  const branches = ontologyConcepts.filter(
    (concept) => concept.level === "branch",
  );
  const termsByConcept = new Map(
    ontologyConcepts.map((concept) => [
      concept.id,
      ontologyConceptTerms.filter((term) => term.conceptId === concept.id),
    ]),
  );
  const filteredIds = !searchTokens(query).length
    ? new Set(ontologyConcepts.map((concept) => concept.id))
    : new Set(
        ontologyConcepts
          .filter((concept) =>
            matchesSearch(
              [
                concept.label,
                concept.description,
                ...concept.keywords,
                ...(termsByConcept.get(concept.id) ?? []).flatMap((term) => [
                  term.term,
                  term.transliteration,
                  term.language,
                  term.script,
                  term.semanticRelation,
                  term.scope,
                  term.note,
                ]),
              ].join(" "),
              query,
            ),
          )
          .map((concept) => concept.id),
      );

  return (
    <>
      <Heading
        eyebrow="Comparative vocabulary with boundaries"
        title="Concept ontology"
        description="Browse a polyhierarchical research vocabulary. English headings help discovery; source-language terms retain their own tradition, language, semantic relation, and evidence scope."
      />
      <div className="ontology-stats" aria-label="Ontology coverage">
        <div>
          <strong>{ontologyConcepts.length}</strong>
          <span>concept records</span>
        </div>
        <div>
          <strong>{branches.length}</strong>
          <span>top-level branches</span>
        </div>
        <div>
          <strong>{ontologyConceptEdges.length}</strong>
          <span>typed concept links</span>
        </div>
        <div>
          <strong>{ontologyConceptTerms.length}</strong>
          <span>scoped language terms</span>
        </div>
      </div>
      <p className="notice">
        A related term is not automatically a translation or equivalent idea.
        Each language term below is labeled by semantic relation and scope.
      </p>
      <label className="ontology-search input-icon">
        <Search size={18} aria-hidden="true" />
        <input
          aria-label="Search ontology concepts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a concept or keyword…"
        />
      </label>
      <p className="small muted" role="status">
        {filteredIds.size} matching concept records.
      </p>
      {searchTokens(query).length > 0 ? (
        <div className="ontology-branch-grid">
          {ontologyConcepts
            .filter((concept) => filteredIds.has(concept.id))
            .map((concept) => (
              <section className="panel ontology-branch" key={concept.id}>
                <span className="eyebrow">{label(concept.level)}</span>
                <Link href={`/ontology/${concept.id}`}>
                  <h2>{concept.label}</h2>
                </Link>
                <p>{concept.description}</p>
                {(termsByConcept.get(concept.id) ?? []).length > 0 && (
                  <p className="small muted">
                    Scoped terms:{" "}
                    {(termsByConcept.get(concept.id) ?? [])
                      .map((term) => term.term)
                      .join(", ")}
                  </p>
                )}
                <EvidenceLinks sourceIds={concept.sourceIds} />
              </section>
            ))}
        </div>
      ) : (
        <>
          {root && (
            <section className="panel ontology-branch">
              <span className="eyebrow">Ontology root</span>
              <Link href={`/ontology/${root.id}`}>
                <h2>{root.label}</h2>
              </Link>
              <p>{root.description}</p>
              <EvidenceLinks sourceIds={root.sourceIds} />
            </section>
          )}
          <div className="ontology-branch-grid">
            {branches.map((branch) => {
              const children = ontologyConceptEdges
                .filter(
                  (edge) =>
                    edge.broaderId === branch.id && edge.kind === "primary",
                )
                .flatMap((edge) => {
                  const child = conceptById.get(edge.narrowerId);
                  return child && filteredIds.has(child.id) ? [child] : [];
                });
              if (!filteredIds.has(branch.id) && !children.length) return null;
              return (
                <section className="panel ontology-branch" key={branch.id}>
                  <span className="eyebrow">Ontology branch</span>
                  <Link href={`/ontology/${branch.id}`}>
                    <h2>{branch.label}</h2>
                  </Link>
                  <p>{branch.description}</p>
                  <ul className="ontology-link-list">
                    {children.map((concept) => (
                      <li key={concept.id}>
                        <Link href={`/ontology/${concept.id}`}>
                          {concept.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <EvidenceLinks sourceIds={branch.sourceIds} />
                </section>
              );
            })}
          </div>
        </>
      )}
      <section className="panel ontology-classifications">
        <span className="eyebrow">
          Historical applications and evidence categories
        </span>
        <h2>Conflict causes and conversion modes</h2>
        <p>
          Case assignments describe documented policies, claims, and
          interpretations. They do not make theological verdicts, reduce a
          conflict to one cause, or label conversion as forced without direct
          supporting evidence.
        </p>
        <section aria-label="Conflict case applications">
          <h3>Conflict case applications</h3>
          <p className="small muted">
            Each case carries several evidenced causes because participants,
            phases, and later historical interpretations differ.
          </p>
          <div className="entity-occurrence-list">
            {conflictCases.map((conflictCase) => {
              const assignments = conflictCauseAssignments.filter(
                (assignment) => assignment.conflictCaseId === conflictCase.id,
              );
              return (
                <article
                  key={conflictCase.id}
                  data-conflict-case-id={conflictCase.id}
                >
                  <span className="eyebrow">{conflictCase.dateLabel}</span>
                  <h4>{conflictCase.name}</h4>
                  <p>{conflictCase.summary}</p>
                  <dl className="metadata">
                    <dt>Dates</dt>
                    <dd>
                      {conflictCase.startDate} to {conflictCase.endDate}
                    </dd>
                    <dt>Locations</dt>
                    <dd>{conflictCase.locations.join(" · ")}</dd>
                    <dt>Actors</dt>
                    <dd>{conflictCase.actors.join(" · ")}</dd>
                    <dt>Stated causes</dt>
                    <dd>{conflictCase.statedCause}</dd>
                  </dl>
                  <h5>Participant justifications</h5>
                  <ul>
                    {conflictCase.participantJustifications.map(
                      (justification) => (
                        <li key={justification}>{justification}</li>
                      ),
                    )}
                  </ul>
                  <h5>Scholarly interpretations</h5>
                  <ul>
                    {conflictCase.scholarlyInterpretations.map(
                      (interpretation) => (
                        <li key={interpretation}>{interpretation}</li>
                      ),
                    )}
                  </ul>
                  <h5>Evidenced cause assignments</h5>
                  <div className="entity-relationship-list">
                    {assignments.map((assignment) => {
                      const cause = conflictCauseById.get(assignment.causeId);
                      return (
                        <article
                          key={assignment.id}
                          data-cause-id={assignment.causeId}
                        >
                          <strong>
                            {cause?.label ?? label(assignment.causeId)}
                          </strong>
                          <span className="transliteration">
                            {label(assignment.evidenceBasis)} evidence
                          </span>
                          <p>{assignment.evidence}</p>
                          <Confidence value={assignment.confidence} />
                          <EvidenceLinks sourceIds={assignment.sourceIds} />
                        </article>
                      );
                    })}
                  </div>
                  <p>
                    <strong>Disputed causation:</strong>{" "}
                    {conflictCase.disputedCausation}
                  </p>
                  <p>
                    <strong>Uncertainty:</strong> {conflictCase.uncertainty}
                  </p>
                  <EvidenceLinks sourceIds={conflictCase.sourceIds} />
                </article>
              );
            })}
          </div>
        </section>
        <section aria-label="Conversion case applications">
          <h3>Conversion case applications</h3>
          <p className="small muted">
            Modes attach only to the period and policy supported by the cited
            record. They do not assign one motive or experience to every person
            affected.
          </p>
          <div className="entity-occurrence-list">
            {conversionCases.map((conversionCase) => {
              const assignments = conversionModeAssignments.filter(
                (assignment) =>
                  assignment.conversionCaseId === conversionCase.id,
              );
              return (
                <article
                  key={conversionCase.id}
                  data-conversion-case-id={conversionCase.id}
                >
                  <span className="eyebrow">{conversionCase.dateLabel}</span>
                  <h4>{conversionCase.name}</h4>
                  <p>{conversionCase.summary}</p>
                  <dl className="metadata">
                    <dt>Dates</dt>
                    <dd>
                      {conversionCase.startDate} to {conversionCase.endDate}
                    </dd>
                    <dt>Locations</dt>
                    <dd>{conversionCase.locations.join(" · ")}</dd>
                    <dt>Actors</dt>
                    <dd>{conversionCase.actors.join(" · ")}</dd>
                    <dt>Stated policy</dt>
                    <dd>{conversionCase.statedPolicy}</dd>
                    <dt>Stated justification</dt>
                    <dd>{conversionCase.statedJustification}</dd>
                    <dt>Resistance and continuity</dt>
                    <dd>{conversionCase.resistanceContinuity}</dd>
                  </dl>
                  <h5>Evidenced conversion-mode assignments</h5>
                  <div className="entity-relationship-list">
                    {assignments.map((assignment) => {
                      const mode = conversionModeById.get(assignment.modeId);
                      return (
                        <article
                          key={assignment.id}
                          data-mode-id={assignment.modeId}
                          data-evidence-standard={assignment.evidenceStandard}
                        >
                          <strong>
                            {mode?.label ?? label(assignment.modeId)}
                          </strong>
                          <span className="transliteration">
                            {label(assignment.evidenceStandard)}
                          </span>
                          <p>{assignment.evidence}</p>
                          <Confidence value={assignment.confidence} />
                          <EvidenceLinks sourceIds={assignment.sourceIds} />
                        </article>
                      );
                    })}
                  </div>
                  <p>
                    <strong>Disputes and uncertainty:</strong>{" "}
                    {conversionCase.disputesUncertainty}
                  </p>
                  <EvidenceLinks sourceIds={conversionCase.sourceIds} />
                </article>
              );
            })}
          </div>
        </section>
        <h3>Complete classification vocabularies</h3>
        <p className="small muted">
          These controlled terms remain available for future case records, but
          each application requires its own evidence.
        </p>
        <div className="two-col">
          <details>
            <summary>
              {conflictCauseVocabulary.length} conflict-cause categories
            </summary>
            <ul>
              {conflictCauseVocabulary.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </details>
          <details>
            <summary>
              {conversionModeVocabulary.length} conversion-mode categories
            </summary>
            <ul>
              {conversionModeVocabulary.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>
    </>
  );
}

function ConceptDetail({ conceptId }: { conceptId: string }) {
  const concept = conceptById.get(conceptId);
  if (!concept)
    return (
      <Empty>
        This concept is not in the reviewed ontology.{" "}
        <Link href="/ontology">Browse the ontology</Link>.
      </Empty>
    );
  const parentEdges = ontologyConceptEdges.filter(
    (edge) => edge.narrowerId === concept.id,
  );
  const childEdges = ontologyConceptEdges.filter(
    (edge) => edge.broaderId === concept.id,
  );
  const terms = ontologyConceptTerms.filter(
    (term) => term.conceptId === concept.id,
  );
  return (
    <>
      <Link href="/ontology" className="ontology-back-link">
        <ArrowLeft size={15} aria-hidden="true" /> Browse the concept ontology
      </Link>
      <Heading
        eyebrow={`${label(concept.level)} ontology record`}
        title={concept.label}
        description={concept.description}
      />
      <p className="notice">
        This comparative heading supports discovery. It does not make every
        linked or translated term equivalent across periods and traditions.
      </p>
      <section className="panel">
        <h2>Position in the ontology</h2>
        <div className="ontology-relations">
          <div>
            <h3>Broader concepts</h3>
            {parentEdges.length ? (
              <ul>
                {parentEdges.map((edge) => {
                  const parent = conceptById.get(edge.broaderId);
                  return parent ? (
                    <li key={edge.id}>
                      <Link href={`/ontology/${parent.id}`}>
                        {parent.label}
                      </Link>
                      <span>
                        {label(edge.kind)} link · {edge.rationale}
                      </span>
                      <EvidenceLinks sourceIds={edge.sourceIds} />
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <p className="muted">This is the ontology root.</p>
            )}
          </div>
          <div>
            <h3>Narrower or related concepts</h3>
            {childEdges.length ? (
              <ul>
                {childEdges.map((edge) => {
                  const child = conceptById.get(edge.narrowerId);
                  return child ? (
                    <li key={edge.id}>
                      <Link href={`/ontology/${child.id}`}>{child.label}</Link>
                      <span>
                        {label(edge.kind)} link · {edge.rationale}
                      </span>
                      <EvidenceLinks sourceIds={edge.sourceIds} />
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <p className="muted">No narrower concepts are recorded.</p>
            )}
          </div>
        </div>
      </section>
      <section className="panel">
        <h2>Source-language terms</h2>
        <p>
          Terms are shown with the precise relation asserted by the dataset.
          “Related” and “contrast” rows are not aliases.
        </p>
        {terms.length ? (
          <div className="table-scroll">
            <table className="ontology-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Language and script</th>
                  <th>Relation and scope</th>
                  <th>Evidence note</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id}>
                    <td>
                      <strong className="source-form">{term.term}</strong>
                      {term.transliteration && (
                        <span className="transliteration">
                          {term.transliteration}
                        </span>
                      )}
                    </td>
                    <td>
                      {term.language} · {term.script}
                    </td>
                    <td>
                      <strong>{label(term.semanticRelation)}</strong>
                      <span>{term.scope}</span>
                    </td>
                    <td>
                      {term.note}
                      <EvidenceLinks sourceIds={term.sourceIds} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            No source-language term is asserted for this record.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Record sources</h2>
        <EvidenceLinks sourceIds={concept.sourceIds} />
        <p className="small muted">
          Search keywords: {concept.keywords.join(", ")}
        </p>
      </section>
    </>
  );
}

export function OntologyExplorer({ conceptId }: { conceptId?: string }) {
  return conceptId ? (
    <ConceptDetail conceptId={conceptId} />
  ) : (
    <OntologyIndex />
  );
}

function EntityIndex() {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("");
  const entityTypes = unique(
    ontologyEntities.map((entity) => entity.entityType),
  );
  const filtered = ontologyEntities.filter((entity) => {
    if (entityType && entity.entityType !== entityType) return false;
    if (!searchTokens(query).length) return true;
    const names = entityNameAssertions.filter(
      (assertion) => assertion.entityId === entity.id,
    );
    const occurrences = entityOccurrences.filter(
      (occurrence) => occurrence.entityId === entity.id,
    );
    return matchesSearch(
      [
        entity.canonicalName,
        entity.description,
        entity.entityType,
        ...entity.traditions,
        ...names.flatMap((name) => [
          name.name,
          name.transliteration,
          name.scope,
        ]),
        ...occurrences.flatMap((occurrence) => [
          occurrence.attestedForm,
          occurrence.transliteration,
          occurrence.role,
          occurrence.description,
        ]),
      ].join(" "),
      query,
    );
  });
  return (
    <>
      <Heading
        eyebrow="Names, occurrences & change through time"
        title="Historical entities"
        description="Explore source-specific names and attestations for deities, religious figures, people, institutions, councils, and works without flattening contextual relationships into universal identity."
      />
      <div className="ontology-stats" aria-label="Entity coverage">
        <div>
          <strong>{ontologyEntities.length}</strong>
          <span>entity records</span>
        </div>
        <div>
          <strong>{entityNameAssertions.length}</strong>
          <span>name assertions</span>
        </div>
        <div>
          <strong>{entityOccurrences.length}</strong>
          <span>source occurrences</span>
        </div>
        <div>
          <strong>{entityRelationships.length}</strong>
          <span>contextual relationships</span>
        </div>
      </div>
      <p className="notice">
        A name assertion belongs to a language, period, source, or scholarly
        scope. Contextual identification, influence, and later conflation do not
        create automatic aliases or prove identity.
      </p>
      <div className="search-toolbar ontology-toolbar">
        <label className="input-icon">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search historical entities"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Canonical name, original form, transliteration…"
          />
        </label>
        <label>
          <span className="sr-only">Entity type</span>
          <select
            aria-label="Entity type"
            value={entityType}
            onChange={(event) => setEntityType(event.target.value)}
          >
            <option value="">All entity types</option>
            {entityTypes.map((type) => (
              <option value={type} key={type}>
                {label(type)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">
        {filtered.length} matching entity records.
      </p>
      <div className="two-col entity-card-grid">
        {filtered.map((entity) => {
          const names = entityNameAssertions.filter(
            (assertion) => assertion.entityId === entity.id,
          );
          const occurrences = entityOccurrences.filter(
            (occurrence) => occurrence.entityId === entity.id,
          );
          return (
            <article className="panel entity-card" key={entity.id}>
              <span className="eyebrow">{label(entity.entityType)}</span>
              <Link href={`/entities/${entity.id}`}>
                <h2>{entity.canonicalName}</h2>
              </Link>
              <p>{entity.description}</p>
              <p className="small muted">{entity.traditions.join(" · ")}</p>
              <p className="entity-card-counts">
                <span>{names.length} sourced names</span>
                <span>{occurrences.length} occurrences</span>
              </p>
              <Link href={`/entities/${entity.id}`}>
                Inspect record <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <Empty>No entity record matches these filters.</Empty>
      )}
    </>
  );
}

function EntityDetail({ entityId }: { entityId: string }) {
  const entity = entityById.get(entityId);
  if (!entity)
    return (
      <Empty>
        This entity is not in the reviewed collection.{" "}
        <Link href="/entities">Browse historical entities</Link>.
      </Empty>
    );
  const names = entityNameAssertions.filter(
    (assertion) => assertion.entityId === entity.id,
  );
  const occurrences = entityOccurrences.filter(
    (occurrence) => occurrence.entityId === entity.id,
  );
  const relationships = entityRelationships.filter(
    (relationship) =>
      relationship.sourceEntityId === entity.id ||
      relationship.targetEntityId === entity.id,
  );
  const paths = entityEvolutionPaths.filter(
    (path) => path.entityId === entity.id,
  );
  const identityNote = ["belial", "baal"].includes(entity.id)
    ? "Belial and Baal remain separate entity records. Any relationship shown here is contextual evidence, not a name-equivalence."
    : ["lucifer", "satan"].includes(entity.id)
      ? "Lucifer and Satan remain separate entity records. Their later conflation is period- and source-specific, not an unconditional identity."
      : "Names are source-specific assertions. Related figures are not aliases unless a name assertion explicitly supports that use in its stated scope.";
  return (
    <>
      <Link href="/entities" className="ontology-back-link">
        <ArrowLeft size={15} aria-hidden="true" /> Browse historical entities
      </Link>
      <Heading
        eyebrow={label(entity.entityType)}
        title={entity.canonicalName}
        description={entity.description}
      />
      <p className="notice">{identityNote}</p>
      <section className="panel entity-profile">
        <dl className="metadata">
          <dt>Canonical display</dt>
          <dd>{entity.canonicalName}</dd>
          <dt>Entity type</dt>
          <dd>{label(entity.entityType)}</dd>
          <dt>Traditions</dt>
          <dd>{entity.traditions.join(" · ")}</dd>
          <dt>Earliest attestation</dt>
          <dd>{entity.earliestAttestation}</dd>
        </dl>
        <EvidenceLinks sourceIds={entity.sourceIds} />
      </section>
      <section className="panel">
        <h2>Names and original-language forms</h2>
        <p>
          Every row records what kind of name claim is made and where it
          applies. Relationships and later conflations are excluded from this
          table.
        </p>
        <div className="table-scroll">
          <table className="ontology-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Language and script</th>
                <th>Assertion</th>
                <th>Scope and evidence</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name) => (
                <tr key={name.id}>
                  <td>
                    <strong className="source-form">{name.name}</strong>
                    {name.transliteration &&
                      name.transliteration !== name.name && (
                        <span className="transliteration">
                          {name.transliteration}
                        </span>
                      )}
                  </td>
                  <td>
                    {name.language} · {name.script}
                  </td>
                  <td>{label(name.assertionType)}</td>
                  <td>
                    {name.scope}
                    <Confidence value={name.confidence} />
                    <EvidenceLinks sourceIds={name.sourceIds} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Source occurrences</h2>
        <p>
          Occurrences preserve the form, locator, role, and source rather than
          projecting a later role backward.
        </p>
        {occurrences.length ? (
          <div className="entity-occurrence-list">
            {occurrences.map((occurrence) => (
              <article key={occurrence.id}>
                <div className="card-top">
                  <span className="eyebrow">{occurrence.locator}</span>
                  <Confidence value={occurrence.confidence} />
                </div>
                <h3>
                  <span className="source-form">{occurrence.attestedForm}</span>
                  {occurrence.transliteration && (
                    <span className="transliteration">
                      {occurrence.transliteration}
                    </span>
                  )}
                </h3>
                <p className="small muted">
                  {occurrence.language} · {occurrence.script} · Role:{" "}
                  {occurrence.role}
                </p>
                <p>{occurrence.description}</p>
                {occurrence.workId && catalogWorkIds.has(occurrence.workId) && (
                  <p>
                    <Link href={`/texts/${occurrence.workId}`}>
                      Open linked Atlas work →
                    </Link>
                  </p>
                )}
                <EvidenceLinks sourceIds={occurrence.sourceIds} />
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">
            No source occurrence is included in this release.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Contextual relationships</h2>
        <p>
          These typed claims preserve direction, dates, scope, confidence, and
          evidence. They do not create global aliases.
        </p>
        {relationships.length ? (
          <div className="entity-relationship-list">
            {relationships.map((relationship) => {
              const outbound = relationship.sourceEntityId === entity.id;
              const other = entityById.get(
                outbound
                  ? relationship.targetEntityId
                  : relationship.sourceEntityId,
              );
              return (
                <article key={relationship.id}>
                  <span className="eyebrow">
                    {label(relationship.relationshipType)}
                  </span>
                  <h3>
                    {outbound ? "Related to " : "Relationship from "}
                    {other ? (
                      <Link href={`/entities/${other.id}`}>
                        {other.canonicalName}
                      </Link>
                    ) : (
                      "Unknown entity"
                    )}
                  </h3>
                  <p>{relationship.summary}</p>
                  <p className="small muted">
                    Scope: {relationship.scope} ·{" "}
                    {relationship.startDate ?? "start date unknown"} to{" "}
                    {relationship.endDate ?? "end date unknown"}
                  </p>
                  <strong className="non-equivalence">
                    Contextual relation · not an unconditional equivalence
                  </strong>
                  <Confidence value={relationship.confidence} />
                  <EvidenceLinks sourceIds={relationship.sourceIds} />
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            No contextual relationship is asserted for this record.
          </p>
        )}
      </section>
      <section className="panel">
        <h2>Evolution through sources</h2>
        <p>
          Stages summarize documented roles in chronological sequence. They do
          not imply a smooth, universal, or inevitable development.
        </p>
        {paths.length ? (
          paths.map((path) => {
            const stages = entityEvolutionStages
              .filter((stage) => stage.pathId === path.id)
              .sort((a, b) => a.sequence - b.sequence);
            return (
              <article className="entity-evolution" key={path.id}>
                <h3>{path.title}</h3>
                <p>{path.summary}</p>
                <ol>
                  {stages.map((stage) => (
                    <li key={stage.id}>
                      <span className="evolution-sequence">
                        {stage.sequence}
                      </span>
                      <div>
                        <span className="eyebrow">
                          {stage.dateLabel} · {label(stage.stageType)}
                        </span>
                        <h4>{stage.label}</h4>
                        <p>
                          <strong>Role:</strong> {stage.role}. {stage.summary}
                        </p>
                        <EvidenceLinks sourceIds={stage.sourceIds} />
                      </div>
                    </li>
                  ))}
                </ol>
                <EvidenceLinks sourceIds={path.sourceIds} />
              </article>
            );
          })
        ) : (
          <p className="muted">
            No evolution path is included for this record.
          </p>
        )}
      </section>
    </>
  );
}

export function EntityExplorer({ entityId }: { entityId?: string }) {
  return entityId ? <EntityDetail entityId={entityId} /> : <EntityIndex />;
}
