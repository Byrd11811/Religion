"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { texts, relationships, artifacts } from "@/packages/shared/catalog";
import { themes } from "@/packages/ontology";
import { Badge, Heading, relatedTitle, TextCard } from "./common";
import type { Actions } from "./Library";
import type { TextRecord } from "@/packages/shared/types";
export { Timeline, WorldMap } from "./SpatialExplorer";
export function Graph({ random = false }: { random?: boolean }) {
  const [active, setActive] = useState(relationships[0].id);
  useEffect(() => {
    if (random)
      setActive(
        relationships[Math.floor(Math.random() * relationships.length)].id,
      );
  }, [random]);
  const relation = relationships.find((r) => r.id === active)!;
  const nodes = [
    ...new Set(relationships.flatMap((r) => [r.source, r.target])),
  ];
  const positions = nodes.map((id, i) => ({
    id,
    x: 370 + 250 * Math.cos((i / nodes.length) * Math.PI * 2 - Math.PI / 2),
    y: 220 + 155 * Math.sin((i / nodes.length) * Math.PI * 2 - Math.PI / 2),
  }));
  return (
    <>
      <Heading
        eyebrow="Connections, with evidence"
        title={random ? "A Random Connection" : "Influence Graph"}
        description="A small, explicit network of comparison records. Each edge has its own evidence and uncertainty."
      />
      <div className="graph-layout">
        <div className="graph-surface">
          <svg
            viewBox="0 0 740 460"
            role="img"
            aria-label="Network of texts with thematic relationship edges"
          >
            {relationships.map((r) => {
              const a = positions.find((n) => n.id === r.source)!,
                b = positions.find((n) => n.id === r.target)!;
              return (
                <g
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${relatedTitle(r.source)} and ${relatedTitle(r.target)}`}
                  onClick={() => setActive(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActive(r.id);
                  }}
                >
                  <line
                    x1={a.x}
                    x2={b.x}
                    y1={a.y}
                    y2={b.y}
                    stroke={active === r.id ? "#caa36b" : "#9d9e9a"}
                    strokeWidth={active === r.id ? 4 : 2}
                    strokeDasharray="7 6"
                  />
                  <line
                    x1={a.x}
                    x2={b.x}
                    y1={a.y}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth={22}
                  />
                </g>
              );
            })}
            {positions.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={17}
                  fill="#d2b47d"
                  stroke="#222d2b"
                  strokeWidth={7}
                />
                <text
                  x={n.x}
                  y={n.y + 36}
                  textAnchor="middle"
                  fill="#eee8dc"
                  fontSize={14}
                >
                  {relatedTitle(n.id).replace("Plato - ", "")}
                </text>
              </g>
            ))}
          </svg>
          <div className="graph-legend">
            Dashed edges: thematic / provisional relationships · no causal claim
          </div>
        </div>
        <section className="panel">
          <Badge level={relation.confidence} />
          <h2>
            {relatedTitle(relation.source)}
            <br />
            <span className="muted">↔</span>
            <br />
            {relatedTitle(relation.target)}
          </h2>
          <p>
            <strong>{relation.type}</strong>
          </p>
          <p>{relation.summary}</p>
          <details>
            <summary>Evaluate the connection</summary>
            <h4>Chronology</h4>
            <p>{relation.chronology}</p>
            <h4>Contact</h4>
            <p>{relation.contact}</p>
            <h4>Important differences</h4>
            <p>{relation.difference}</p>
            <p>
              Linguistic evidence, translation chain and narrative-specificity
              analysis: data unavailable.
            </p>
          </details>
          <a
            className="text-button"
            href={relation.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Inspect source ↗
          </a>
        </section>
      </div>
      <div className="chips">
        {relationships.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className={active === r.id ? "selected" : ""}
          >
            {relatedTitle(r.source)} ↔ {relatedTitle(r.target)}
          </button>
        ))}
      </div>
      {random && (
        <button
          className="button secondary"
          onClick={() =>
            setActive(
              relationships[
                (relationships.findIndex((r) => r.id === active) +
                  1 +
                  Math.floor(Math.random() * (relationships.length - 1))) %
                  relationships.length
              ].id,
            )
          }
        >
          Another connection
        </button>
      )}
    </>
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
