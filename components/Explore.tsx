"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  texts,
  relationshipEdges,
  relationshipNodes,
  artifacts,
} from "@/packages/shared/catalog";
import { themes } from "@/packages/ontology";
import { Badge, Heading, TextCard } from "./common";
import type { Actions } from "./Library";
import type {
  Relationship,
  RelationshipEvidenceLevel,
  RelationshipNode,
  RelationshipNodeType,
  RelationshipType,
  TextRecord,
} from "@/packages/shared/types";
export { Timeline, WorldMap } from "./SpatialExplorer";

const nodeTypeOrder: RelationshipNodeType[] = [
  "work",
  "tradition",
  "person",
  "concept",
  "organization",
  "artifact",
];

const evidenceOrder: RelationshipEvidenceLevel[] = [
  "documented",
  "strong",
  "qualified",
  "exploratory",
  "disputed",
];

type GraphSelection =
  | { kind: "edge"; id: string }
  | { kind: "node"; id: string };

type PositionedNode = RelationshipNode & { x: number; y: number };

function graphLabel(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}

function layoutGraph(nodes: RelationshipNode[]) {
  const maxColumns = 6;
  const presentTypes = nodeTypeOrder.filter((type) =>
    nodes.some((node) => node.type === type),
  );
  const groupedNodes = presentTypes.map((type) => ({
    type,
    nodes: nodes
      .filter((node) => node.type === type)
      .sort((a, b) => a.label.localeCompare(b.label)),
  }));
  const longestLane = Math.max(
    1,
    ...groupedNodes.map((group) => Math.min(maxColumns, group.nodes.length)),
  );
  const width = Math.max(900, 220 + longestLane * 190);
  let cursorY = 20;
  const groups = groupedNodes.map((group) => {
    const rows = Math.ceil(group.nodes.length / maxColumns);
    const height = 30 + rows * 100;
    const positionedNodes = group.nodes.map((node, nodeIndex) => {
      const row = Math.floor(nodeIndex / maxColumns);
      const column = nodeIndex % maxColumns;
      const itemsInRow = Math.min(
        maxColumns,
        group.nodes.length - row * maxColumns,
      );
      const available = width - 220;
      const step = available / Math.max(1, itemsInRow);
      return {
        ...node,
        x: 180 + step * column + step / 2,
        y: cursorY + 48 + row * 100,
      };
    });
    const result = {
      ...group,
      height,
      positionedNodes,
      y: cursorY,
    };
    cursorY += height + 14;
    return result;
  });
  const positioned = groups.flatMap((group) => group.positionedNodes);
  const height = Math.max(390, cursorY + 6);
  return { groups, height, nodes: positioned, width };
}

function edgePath(
  source: PositionedNode,
  target: PositionedNode,
  edgeIndex: number,
) {
  const sameLane = Math.abs(source.y - target.y) < 4;
  if (sameLane) {
    const lift = 35 + (edgeIndex % 3) * 13;
    return `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${source.y - lift} ${target.x} ${target.y}`;
  }
  const bend = (edgeIndex % 5 - 2) * 18;
  const middleY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} C ${source.x + bend} ${middleY}, ${target.x - bend} ${middleY}, ${target.x} ${target.y}`;
}

function graphKeyActivate(
  event: React.KeyboardEvent,
  activate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

export function Graph({ random = false }: { random?: boolean }) {
  const [selection, setSelection] = useState<GraphSelection>({
    kind: "edge",
    id: relationshipEdges[0]?.id ?? "",
  });
  const [query, setQuery] = useState("");
  const [nodeType, setNodeType] = useState<RelationshipNodeType | "all">(
    "all",
  );
  const [relationshipType, setRelationshipType] = useState<
    RelationshipType | "all"
  >("all");
  const [evidenceLevel, setEvidenceLevel] = useState<
    RelationshipEvidenceLevel | "all"
  >("all");

  useEffect(() => {
    if (random && relationshipEdges.length) {
      setSelection({
        kind: "edge",
        id: relationshipEdges[
          Math.floor(Math.random() * relationshipEdges.length)
        ].id,
      });
    }
  }, [random]);

  const nodesById = useMemo(
    () => new Map(relationshipNodes.map((node) => [node.id, node])),
    [],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingNodeIds = useMemo(
    () =>
      new Set(
        relationshipNodes
          .filter((node) => {
            const typeMatches = nodeType === "all" || node.type === nodeType;
            const queryMatches =
              !normalizedQuery ||
              [node.label, node.subtitle, node.description]
                .join(" ")
                .toLocaleLowerCase()
                .includes(normalizedQuery);
            return typeMatches && queryMatches;
          })
          .map((node) => node.id),
      ),
    [nodeType, normalizedQuery],
  );
  const filteredEdges = useMemo(
    () =>
      relationshipEdges.filter((edge) => {
        if (
          relationshipType !== "all" &&
          edge.relationshipType !== relationshipType
        )
          return false;
        if (evidenceLevel !== "all" && edge.evidenceLevel !== evidenceLevel)
          return false;
        if (nodeType !== "all" || normalizedQuery)
          return (
            matchingNodeIds.has(edge.source) || matchingNodeIds.has(edge.target)
          );
        return true;
      }),
    [evidenceLevel, matchingNodeIds, nodeType, normalizedQuery, relationshipType],
  );
  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const edge of filteredEdges) {
      ids.add(edge.source);
      ids.add(edge.target);
    }
    if (nodeType !== "all" || normalizedQuery)
      for (const id of matchingNodeIds) ids.add(id);
    return ids;
  }, [filteredEdges, matchingNodeIds, nodeType, normalizedQuery]);
  const visibleNodes = useMemo(
    () => relationshipNodes.filter((node) => visibleNodeIds.has(node.id)),
    [visibleNodeIds],
  );
  const graph = useMemo(() => layoutGraph(visibleNodes), [visibleNodes]);
  const positionedById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );
  const selectedEdge =
    selection.kind === "edge"
      ? relationshipEdges.find((edge) => edge.id === selection.id) ?? null
      : null;
  const selectedNode =
    selection.kind === "node"
      ? relationshipNodes.find((node) => node.id === selection.id) ?? null
      : null;
  const selectionVisible =
    (selectedEdge && filteredEdges.some((edge) => edge.id === selectedEdge.id)) ||
    (selectedNode && visibleNodeIds.has(selectedNode.id));
  const firstFilteredEdgeId = filteredEdges[0]?.id ?? "";
  const firstVisibleNodeId = visibleNodes[0]?.id ?? "";

  useEffect(() => {
    if (selectionVisible) return;
    if (firstFilteredEdgeId) {
      setSelection({ kind: "edge", id: firstFilteredEdgeId });
      return;
    }
    if (firstVisibleNodeId)
      setSelection({ kind: "node", id: firstVisibleNodeId });
  }, [firstFilteredEdgeId, firstVisibleNodeId, selectionVisible]);

  const relationshipTypesInUse = useMemo(
    () =>
      [...new Set(relationshipEdges.map((edge) => edge.relationshipType))].sort(
        (a, b) => graphLabel(a).localeCompare(graphLabel(b)),
      ),
    [],
  );

  const selectNode = (node: RelationshipNode) =>
    setSelection({ kind: "node", id: node.id });
  const selectEdge = (edge: Relationship) =>
    setSelection({ kind: "edge", id: edge.id });
  const resetFilters = () => {
    setQuery("");
    setNodeType("all");
    setRelationshipType("all");
    setEvidenceLevel("all");
  };

  return (
    <>
      <Heading
        eyebrow="Connections, with evidence"
        title={random ? "A Random Connection" : "Influence Graph"}
        description="Follow documented citations, translation lines, encounters, interpretations, and carefully bounded parallels. Every connection opens to its evidence and limits."
      />
      {!random && (
        <section className="graph-controls" aria-label="Filter relationships">
          <label className="graph-search">
            <span>Find a node</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Text, tradition, person, concept…"
            />
          </label>
          <label>
            <span>Node type</span>
            <select
              aria-label="Node type"
              value={nodeType}
              onChange={(event) =>
                setNodeType(event.target.value as RelationshipNodeType | "all")
              }
            >
              <option value="all">All node types</option>
              {nodeTypeOrder.map((type) => (
                <option key={type} value={type}>
                  {graphLabel(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Relationship</span>
            <select
              aria-label="Relationship type"
              value={relationshipType}
              onChange={(event) =>
                setRelationshipType(
                  event.target.value as RelationshipType | "all",
                )
              }
            >
              <option value="all">All relationships</option>
              {relationshipTypesInUse.map((type) => (
                <option key={type} value={type}>
                  {graphLabel(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Evidence</span>
            <select
              aria-label="Evidence level"
              value={evidenceLevel}
              onChange={(event) =>
                setEvidenceLevel(
                  event.target.value as RelationshipEvidenceLevel | "all",
                )
              }
            >
              <option value="all">All evidence levels</option>
              {evidenceOrder.map((level) => (
                <option key={level} value={level}>
                  {graphLabel(level)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="text-button graph-reset"
            onClick={resetFilters}
            disabled={
              !query &&
              nodeType === "all" &&
              relationshipType === "all" &&
              evidenceLevel === "all"
            }
          >
            Clear filters
          </button>
        </section>
      )}
      <div className="graph-summary" role="status" aria-live="polite">
        <strong>{filteredEdges.length}</strong> relationships across{" "}
        <strong>{visibleNodes.length}</strong> nodes
        {filteredEdges.length !== relationshipEdges.length && (
          <span> · filtered from {relationshipEdges.length}</span>
        )}
      </div>
      <div className="graph-layout">
        <section className="graph-surface" aria-label="Relationship network">
          {visibleNodes.length ? (
            <div className="graph-scroll" tabIndex={0}>
              <div
                className="graph-stage"
                style={{ height: graph.height, width: graph.width }}
              >
                <svg
                  width={graph.width}
                  height={graph.height}
                  viewBox={`0 0 ${graph.width} ${graph.height}`}
                  aria-label="Evidence relationship network organized into node-type lanes"
                >
                  <defs>
                    <marker
                      id="graph-arrow"
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M 0 0 L 8 4 L 0 8 z" />
                    </marker>
                  </defs>
                  {graph.groups.map((group) => (
                    <g className="graph-lane" key={group.type}>
                      <rect
                        x="14"
                        y={group.y}
                        width={graph.width - 28}
                        height={group.height}
                        rx="8"
                      />
                      <text x="30" y={group.y + 20}>
                        {graphLabel(group.type)}s
                      </text>
                    </g>
                  ))}
                  {filteredEdges.map((edge, index) => {
                    const source = positionedById.get(edge.source);
                    const target = positionedById.get(edge.target);
                    if (!source || !target) return null;
                    const path = edgePath(source, target, index);
                    const sourceLabel = nodesById.get(edge.source)?.label ?? edge.source;
                    const targetLabel = nodesById.get(edge.target)?.label ?? edge.target;
                    const active = selectedEdge?.id === edge.id;
                    return (
                      <g
                        key={edge.id}
                        className={`graph-edge graph-edge--${edge.evidenceLevel}${active ? " is-selected" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={active}
                        aria-label={`${graphLabel(edge.relationshipType)}: ${sourceLabel} to ${targetLabel}. ${graphLabel(edge.evidenceLevel)} evidence.`}
                        onClick={() => selectEdge(edge)}
                        onKeyDown={(event) =>
                          graphKeyActivate(event, () => selectEdge(edge))
                        }
                      >
                        <path
                          className="graph-edge-visible"
                          d={path}
                          markerEnd="url(#graph-arrow)"
                        />
                        <path className="graph-edge-hit" d={path} />
                      </g>
                    );
                  })}
                </svg>
                {graph.nodes.map((node) => (
                  <button
                    type="button"
                    key={node.id}
                    className={`graph-node graph-node--${node.type}${selectedNode?.id === node.id ? " is-selected" : ""}`}
                    style={{ left: node.x, top: node.y }}
                    title={`${node.label} — ${node.subtitle}`}
                    aria-pressed={selectedNode?.id === node.id}
                    onClick={() => selectNode(node)}
                  >
                    <span>{node.label}</span>
                    <small>{graphLabel(node.type)}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="graph-empty">
              <h2>No relationships match these filters</h2>
              <p>Clear one or more filters to return to the full network.</p>
              <button type="button" className="button secondary" onClick={resetFilters}>
                Show all relationships
              </button>
            </div>
          )}
          <div className="graph-legend" aria-label="Graph legend">
            <span className="graph-legend-title">Evidence</span>
            {evidenceOrder.map((level) => (
              <span key={level}>
                <i className={`graph-key graph-key--${level}`} />
                {graphLabel(level)}
              </span>
            ))}
            <span className="graph-direction">Arrows show the recorded relationship direction</span>
          </div>
        </section>
        <GraphInspector
          edge={selectedEdge}
          node={selectedNode}
          nodesById={nodesById}
          onSelectEdge={selectEdge}
          onSelectNode={selectNode}
        />
      </div>
      {random && (
        <button
          className="button secondary"
          onClick={() => {
            if (!relationshipEdges.length) return;
            const currentIndex =
              selection.kind === "edge"
                ? relationshipEdges.findIndex((edge) => edge.id === selection.id)
                : -1;
            const step =
              relationshipEdges.length === 1
                ? 0
                : 1 + Math.floor(Math.random() * (relationshipEdges.length - 1));
            setSelection({
              kind: "edge",
              id: relationshipEdges[
                (Math.max(0, currentIndex) + step) % relationshipEdges.length
              ].id,
            });
          }}
        >
          Another connection
        </button>
      )}
    </>
  );
}

function GraphInspector({
  edge,
  node,
  nodesById,
  onSelectEdge,
  onSelectNode,
}: {
  edge: Relationship | null;
  node: RelationshipNode | null;
  nodesById: Map<string, RelationshipNode>;
  onSelectEdge: (edge: Relationship) => void;
  onSelectNode: (node: RelationshipNode) => void;
}) {
  if (node) {
    const connections = relationshipEdges.filter(
      (edge) => edge.source === node.id || edge.target === node.id,
    );
    return (
      <aside className="panel graph-inspector" aria-live="polite">
        <div className="graph-inspector-heading">
          <span className={`graph-node-kind graph-node-kind--${node.type}`}>
            {graphLabel(node.type)}
          </span>
          <span>{connections.length} connections</span>
        </div>
        <h2>{node.label}</h2>
        <p className="muted">{node.subtitle}</p>
        <p>{node.description}</p>
        {node.href && (
          <Link className="text-button" href={node.href}>
            Open Atlas profile →
          </Link>
        )}
        {node.sourceUrls.length > 0 && (
          <div className="graph-source-list">
            <h3>Node sources</h3>
            {node.sourceUrls.map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                Source {index + 1} ↗
              </a>
            ))}
          </div>
        )}
        <div className="graph-connection-list">
          <h3>Relationships</h3>
          {connections.map((connection) => {
            const otherId =
              connection.source === node.id
                ? connection.target
                : connection.source;
            const other = nodesById.get(otherId);
            return (
              <button
                type="button"
                key={connection.id}
                onClick={() => onSelectEdge(connection)}
              >
                <span>{graphLabel(connection.relationshipType)}</span>
                <strong>{other?.label ?? otherId}</strong>
                <small>{graphLabel(connection.evidenceLevel)} evidence</small>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  if (!edge)
    return (
      <aside className="panel graph-inspector" aria-live="polite">
        <h2>Select a node or relationship</h2>
        <p>Its description, evidence, limits, and source chain will appear here.</p>
      </aside>
    );

  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  const citationById = new Map(
    edge.citations.map((citation) => [citation.id, citation]),
  );
  return (
    <aside className="panel graph-inspector" aria-live="polite">
      <div className="graph-inspector-heading">
        <span className={`graph-evidence graph-evidence--${edge.evidenceLevel}`}>
          {graphLabel(edge.evidenceLevel)} evidence
        </span>
        <Badge level={edge.confidence} />
      </div>
      <p className="eyebrow">{graphLabel(edge.relationshipType)}</p>
      <h2 className="graph-edge-title">
        <button type="button" onClick={() => source && onSelectNode(source)}>
          {source?.label ?? edge.source}
        </button>
        <span aria-hidden="true">→</span>
        <button type="button" onClick={() => target && onSelectNode(target)}>
          {target?.label ?? edge.target}
        </button>
      </h2>
      <p className="graph-display-type">{edge.type}</p>
      <p>{edge.summary}</p>

      <dl className="graph-claim-status">
        <div>
          <dt>Track C claim status</dt>
          <dd>{graphLabel(edge.claimStatus)}</dd>
        </div>
        <div>
          <dt>Relationship ID</dt>
          <dd>{edge.id}</dd>
        </div>
      </dl>

      <section className="graph-evidence-section">
        <h3>Supporting citations</h3>
        {edge.citations.length ? (
          <ol className="graph-citations">
            {edge.citations.map((citation) => (
              <li key={citation.id}>
                <a href={citation.url} target="_blank" rel="noreferrer">
                  <strong>{citation.label}</strong>
                  <span>
                    {graphLabel(citation.sourceType)}
                    {citation.locator ? ` · ${citation.locator}` : ""} ↗
                  </span>
                </a>
              </li>
            ))}
          </ol>
        ) : (
          <p className="notice">No supporting citation is recorded.</p>
        )}
      </section>

      <section className="graph-evidence-section">
        <h3>Source chain</h3>
        <ol className="graph-source-chain">
          {edge.sourceChain.map((link) => (
            <li key={`${link.citationId}-${link.role}`}>
              <span>{graphLabel(link.role)}</span>
              <strong>
                {citationById.get(link.citationId)?.label ?? link.citationId}
              </strong>
              <p>{link.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="graph-evidence-section">
        <h3>Counterarguments and limits</h3>
        {edge.counterarguments.length ? (
          <ul className="graph-counterarguments">
            {edge.counterarguments.map((counterargument) => (
              <li key={counterargument.id}>
                <p>{counterargument.summary}</p>
                {counterargument.citationIds.length > 0 && (
                  <span>
                    Sources:{" "}
                    {counterargument.citationIds
                      .map(
                        (id) => citationById.get(id)?.label ?? id,
                      )
                      .join("; ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No separate counterargument is recorded for this scoped claim.</p>
        )}
      </section>

      <section className="graph-context-grid" aria-label="Evaluation context">
        <div>
          <h3>Chronology</h3>
          <p>{edge.chronology}</p>
        </div>
        <div>
          <h3>Contact</h3>
          <p>{edge.contact}</p>
        </div>
        <div>
          <h3>Important differences</h3>
          <p>{edge.difference}</p>
        </div>
      </section>

      {edge.interpretation && (
        <section className="graph-interpretation">
          <p className="eyebrow">Track D · object interpretation</p>
          <h3>{graphLabel(edge.interpretation.kind)}</h3>
          <p>{edge.interpretation.explanation}</p>
          <p className="small muted">
            Object facts: {edge.interpretation.objectFactIds.join(", ")}. This
            record does not assert occult intent.
          </p>
        </section>
      )}
    </aside>
  );
}
export function Stories() {
  const [selected, setSelected] = useState("Flood");
  const groups: Record<string, string[]> = {
    Flood: ["atrahasis-epic", "epic-of-gilgamesh", "torah-pentateuch"],
    Creation: ["rig-veda", "plato-timaeus", "prose-edda", "popol-vuh"],
    Afterlife: ["book-of-the-dead", "odyssey", "plato-phaedo", "quran"],
    "Cosmic battle": ["enuma-elish", "rig-veda", "theogony", "revelation"],
  };
  return (
    <>
      <Heading
        eyebrow="Familiar stories, different worlds"
        title="Story Parallels"
        description="Compare narrative motifs without erasing their different settings and meanings."
      />
      <div className="tabs">
        {Object.keys(groups).map((g) => (
          <button
            key={g}
            className={selected === g ? "active" : ""}
            onClick={() => setSelected(g)}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="story-feature">
        <span className="eyebrow">Comparative reading path</span>
        <h2>
          {selected === "Flood"
            ? "After the waters rise."
            : selected === "Creation"
              ? "How does a world begin?"
              : selected === "Afterlife"
                ? "Journeys beyond a lifetime."
                : "Conflict on a cosmic scale."}
        </h2>
        <p>
          These are candidate reading sets, not claims that every work tells the
          same story. Inspect the primary passage, narrative purpose,
          chronology, and evidence for cultural contact.
        </p>
        <Link
          className="button"
          href={`/questions?q=${selected.toLowerCase()}`}
        >
          Explore source passages →
        </Link>
      </div>
      <div className="text-grid">
        {groups[selected]
          .map((id) => texts.find((t) => t.id === id))
          .filter((t): t is TextRecord => !!t)
          .map((t) => (
            <TextCard key={t.id} text={t} />
          ))}
      </div>
      <section className="panel">
        <h2>Independent or influenced?</h2>
        <p>
          Chronological possibility, geographic contact, linguistic evidence and
          a known translation chain must be evaluated separately. No numeric
          similarity or historical connection score has been invented.
        </p>
        <Badge level="D" />
        <p>
          For the flood reading path, compare the Met’s historical introduction,
          then follow the surviving sources. Differences in divine agency and
          literary context matter.
        </p>
        <a
          href="https://www.metmuseum.org/essays/flood-stories"
          target="_blank"
          rel="noreferrer"
        >
          The Metropolitan Museum of Art · Flood Stories ↗
        </a>
      </section>
    </>
  );
}
export function ThemesView() {
  return (
    <>
      <Heading
        eyebrow="Words, concepts & questions"
        title="Themes"
        description="An English term is a starting point. It may gather concepts that are very different in their original languages."
      />
      <div className="tradition-grid">
        {themes.map((theme, i) => (
          <Link
            key={theme}
            href={`/questions?q=${theme}`}
            className="tradition-card"
          >
            <span className="ordinal">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="capitalize">{theme}</h3>
            <span>
              {texts.filter((t) => t.themes.includes(theme)).length} tagged
              texts →
            </span>
          </Link>
        ))}
      </div>
      <section className="panel">
        <h2>Same word, different idea</h2>
        <p>
          “Soul,” “spirit,” and “self” are English search labels. They do not
          establish equivalence among the source-language concepts. Compare the
          translation, genre and surrounding passage before equating them.
        </p>
      </section>
    </>
  );
}
export function People(actions: Actions) {
  const authored = texts.filter(
    (t) =>
      t.author !== "Data unavailable" && !t.author.startsWith("See edition"),
  );
  return (
    <>
      <Heading
        eyebrow="Voices & attribution"
        title="People & Authors"
        description="Historical authorship, traditional attribution, and a text’s named speaker are different kinds of claims."
      />
      <div className="two-col">
        {authored.map((t) => (
          <section className="panel" key={t.id}>
            <h3>{t.author}</h3>
            <Badge level="D">Attribution · review required</Badge>
            <p>
              <Link href={`/texts/${t.id}`}>{t.title}</Link>
            </p>
            <TextCard text={t} onSave={actions.onSave} />
          </section>
        ))}
      </div>
    </>
  );
}
export function Manuscripts() {
  return (
    <>
      <Heading
        eyebrow="Material witnesses"
        title="Manuscripts & Objects"
        description="See the material forms in which writing survives. Object dates are not composition dates."
      />
      <div className="two-col">
        {artifacts.map((a) => (
          <figure className="artifact-card" key={a.id}>
            <div className="artifact-image">
              <img src={a.imageUrl} alt={a.title} loading="lazy" />
            </div>
            <figcaption>
              <span className="eyebrow">{a.date}</span>
              <h2>{a.title}</h2>
              <p>{a.caption}</p>
              <p className="small muted">
                {a.institution}
                <br />
                {a.creator}
                <br />
                {a.license}
              </p>
              <a href={a.sourceUrl} target="_blank" rel="noreferrer">
                Museum record & image source ↗
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="notice">
        These objects illustrate material traditions. They are not asserted to
        be witnesses of a specific bundled edition. Variant readings and
        manuscript-to-edition links have not been established.
      </p>
    </>
  );
}
export function Methodology() {
  return (
    <>
      <Heading
        eyebrow="How to read the atlas"
        title="Evidence before certainty"
        description="The atlas does not decide what is true. It makes the source, interpretation, and gaps visible."
      />
      <div className="two-col">
        <section className="panel">
          <h2>Five levels of evidence</h2>
          {(["A", "B", "C", "D", "E"] as const).map((level, i) => (
            <p key={level}>
              <Badge level={level} />
              <br />
              {
                [
                  "Direct support in the cited source. An edition excerpt may contain commentary rather than primary text.",
                  "Reserved for externally supported strong scholarly consensus.",
                  "Reserved for a documented majority interpretation with dissent.",
                  "A disputed claim or provisional editorial estimate. Inspect its source and limitations.",
                  "An exploratory hypothesis or model interpretation; not established history.",
                ][i]
              }
            </p>
          ))}
        </section>
        <section className="panel">
          <h2>What is in this release?</h2>
          <p>
            {texts.length} distinct catalog entries,{" "}
            {new Set(texts.filter((t) => t.editionId).map((t) => t.id)).size}{" "}
            works with searchable editions, and 26 broad catalog groupings.
          </p>
          <p>
            Catalog names come from the supplied specification. Most entries
            still need detailed editorial review. No date, language, passage or
            manuscript is filled in when the record lacks that data.
          </p>
          <p>
            Chronology on enriched records is provisional editorial metadata,
            explicitly marked D. It is not independently peer-reviewed.
          </p>
          <p>Metadata-only records are not counted as ingested full texts.</p>
        </section>
        <section className="panel">
          <h2>Retrieval & interpretation</h2>
          <p>
            The local engine combines weighted lexical search and explicit theme
            expansion, then diversifies results by catalog grouping. It provides
            evidence to read, not an invented doctrinal consensus.
          </p>
          <p>
            An optional compatible model provider can synthesize retrieved
            passages. Citations are checked against the retrieved set and a
            second model pass audits evidence and neutrality. These checks do
            not replace expert review.
          </p>
          <p>
            English segments preserve source text. Atlas segment numbers are
            navigation locators, not invented chapter or verse identifiers.
          </p>
        </section>
        <section className="panel">
          <h2>Rights & cultural context</h2>
          <p>
            Bundled historical editions are public domain in the United States.
            Their original Project Gutenberg files retain license and
            attribution information. Translation rights can differ by
            jurisdiction.
          </p>
          <p>
            Oral traditions are not treated as a single fixed scripture.
            Restricted or culturally sensitive material is not ingested merely
            because a catalog record exists.
          </p>
          <p>
            Images are CC0 under the Met’s Open Access program. Attribution
            accompanies each object. The map uses OpenStreetMap attribution.
          </p>
        </section>
        <section className="panel">
          <h2>Local research data</h2>
          <p>
            Collections and notes persist in this project’s local data
            directory. No sign-in or cloud synchronization is implied. Export
            Markdown, CSV, JSON, or use the browser’s Save as PDF.
          </p>
          <p>
            The server binds to this computer by default. Configuring a model
            provider sends the submitted question and retrieved passages to that
            provider.
          </p>
        </section>
        <section className="panel">
          <h2>Sources & corrections</h2>
          <p>
            Primary edition links are available from every text and passage.
            Museum objects link to their collection records.
          </p>
          <p>
            Similarity does not establish borrowing. Canon does not establish
            truth. A corpus gap is not evidence that a community lacks a belief.
          </p>
          <p>
            See the repository documentation for reproduction, database setup,
            content review, and current coverage limitations.
          </p>
        </section>
      </div>
    </>
  );
}
