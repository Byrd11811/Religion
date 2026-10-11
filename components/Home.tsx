"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Clock3,
  Columns3,
  Globe2,
  MessageCircle,
  Network,
  Search,
  Sparkles,
} from "lucide-react";
import { questions } from "@/packages/ontology";
import { editions, texts, traditions } from "@/packages/shared/catalog";
import { museumArtifacts } from "@/packages/shared/archive";

const collectionLinks = [
  ["/library/egypt", "Ancient Egypt"],
  ["/library/mesopotamia", "Ancient Mesopotamia"],
  ["/library/china", "Chinese traditions"],
  ["/library/horn", "Ethiopia, Eritrea & the Horn"],
  ["/library/indigenous", "Global Indigenous traditions"],
  ["/library/global", "Global religious coverage"],
  ["/library/esoteric", "Esoteric literature"],
  ["/library/modern", "Modern religions"],
  ["/library/forbidden", "Restricted texts"],
  ["/library/lost", "Lost & hypothetical works"],
  ["/library/disputed", "Disputed & forged works"],
  ["/library/undeciphered", "Unresolved writing systems"],
] as const;

function CurrentsPreview() {
  return (
    <div className="currents-preview" aria-label="Preview of Sacred Currents">
      <div className="currents-preview__map" aria-hidden="true">
        <span className="currents-land currents-land--west" />
        <span className="currents-land currents-land--east" />
        <svg
          className="currents-preview__anchors"
          viewBox="0 0 620 220"
          role="presentation"
        >
          <circle cx="145" cy="130" r="6" />
          <circle cx="269" cy="166" r="7" />
          <circle cx="375" cy="111" r="6" />
          <circle cx="489" cy="92" r="8" />
          <circle cx="529" cy="181" r="5" />
        </svg>
        <div className="currents-preview__streams">
          <span>Timeline streams · not geographic routes</span>
          <svg viewBox="0 0 620 56" role="presentation">
            <path d="M5 13 C125 4 197 25 318 14 S500 6 615 20" />
            <path d="M5 30 C122 44 208 15 326 34 S507 45 615 29" />
            <path d="M5 47 C137 32 223 52 353 43 S507 34 615 45" />
          </svg>
          <div className="currents-preview__time">
            <span>2500 BCE</span>
            <i />
            <span>1 CE</span>
            <i />
            <span>1900 CE</span>
          </div>
        </div>
      </div>
      <div className="currents-preview__legend" aria-hidden="true">
        <span>
          <i className="legend-node" /> catalog location
        </span>
        <span>
          <i className="legend-node legend-node--selected" /> selected record
        </span>
        <span>
          <i className="legend-gap" /> unlocated records remain listed
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const mappedWorks = texts.filter(
    (text) => Number.isFinite(text.lat) && Number.isFinite(text.lng),
  ).length;
  const datedWorks = texts.filter((text) => text.startDate !== null).length;

  return (
    <div className="atlas-home">
      <section className="atlas-home__hero" aria-labelledby="atlas-home-title">
        <div className="atlas-home__hero-copy">
          <span className="eyebrow">
            THE UNIVERSAL RELIGION & SACRED TEXT ATLAS
          </span>
          <h1 id="atlas-home-title">
            Follow humanity’s long
            <em>conversation about meaning.</em>
          </h1>
          <p>
            Explore sacred texts, material evidence, and historical
            relationships across time and place—with sources and uncertainty
            kept in view.
          </p>
        </div>
        <form
          className="question-form atlas-home__question"
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim()) {
              router.push(`/questions?q=${encodeURIComponent(query.trim())}`);
            }
          }}
        >
          <Search size={21} aria-hidden="true" />
          <input
            aria-label="Ask a question about religion and sacred texts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you want to understand?"
          />
          <button className="button" type="submit">
            Explore
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
        <div
          className="atlas-home__suggestions"
          aria-label="Suggested questions"
        >
          <span>Try a question</span>
          {questions.slice(0, 3).map((question) => (
            <Link
              key={question}
              href={`/questions?q=${encodeURIComponent(question)}`}
            >
              {question}
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section
        className="atlas-home__stats"
        aria-label="Atlas corpus at a glance"
      >
        <div>
          <strong>{texts.length}</strong>
          <span>cataloged works</span>
        </div>
        <div>
          <strong>{traditions.length}</strong>
          <span>tradition records</span>
        </div>
        <div>
          <strong>{editions.length}</strong>
          <span>source editions</span>
        </div>
        <div>
          <strong>{museumArtifacts.length}</strong>
          <span>material objects</span>
        </div>
        <p>
          Counts describe the current research corpus; record depth varies and
          gaps stay visible.
        </p>
      </section>

      <section
        className="atlas-home__currents"
        aria-labelledby="currents-title"
      >
        <div className="atlas-home__currents-copy">
          <span className="eyebrow">
            <Sparkles size={13} aria-hidden="true" /> NEW IMMERSIVE EXPLORER
          </span>
          <h2 id="currents-title">See ideas unfold across time and place.</h2>
          <p>
            Sacred Currents brings the map and timeline together. Move through
            dated records, inspect available location data, and open the
            evidence behind each visible relationship.
          </p>
          <div className="atlas-home__currents-actions">
            <Link className="button" href="/map">
              Enter Sacred Currents <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="text-button" href="/timeline">
              Start with the timeline <Clock3 size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="atlas-home__coverage-note">
            <span>
              <Globe2 size={14} aria-hidden="true" /> {mappedWorks} works with
              catalog coordinates
            </span>
            <span>
              <Clock3 size={14} aria-hidden="true" /> {datedWorks} works with
              catalog dates
            </span>
          </div>
        </div>
        <CurrentsPreview />
      </section>

      <section className="atlas-home__paths" aria-labelledby="paths-title">
        <div className="atlas-home__section-heading">
          <span className="eyebrow">THREE WAYS IN</span>
          <h2 id="paths-title">Choose the kind of exploration you need.</h2>
        </div>
        <div className="atlas-home__path-grid">
          <Link href="/questions" className="atlas-home__path-card">
            <span className="path-card__number">01</span>
            <MessageCircle size={24} aria-hidden="true" />
            <h3>Begin with a question</h3>
            <p>
              Trace multiple traditions without flattening their disagreements.
            </p>
            <span className="text-button">
              Open Question Explorer <ArrowUpRight size={15} />
            </span>
          </Link>
          <Link href="/library" className="atlas-home__path-card">
            <span className="path-card__number">02</span>
            <BookOpen size={24} aria-hidden="true" />
            <h3>Read the sources</h3>
            <p>
              Browse works, editions, witnesses, provenance, and coverage
              status.
            </p>
            <span className="text-button">
              Browse the library <ArrowUpRight size={15} />
            </span>
          </Link>
          <Link href="/compare" className="atlas-home__path-card">
            <span className="path-card__number">03</span>
            <Columns3 size={24} aria-hidden="true" />
            <h3>Compare with context</h3>
            <p>
              Place passages side by side and keep interpretation distinct from
              evidence.
            </p>
            <span className="text-button">
              Compare texts <ArrowUpRight size={15} />
            </span>
          </Link>
        </div>
      </section>

      <section className="atlas-home__lower">
        <details className="atlas-home__collections">
          <summary>
            <span>
              <span className="eyebrow">COLLECTIONS</span>
              <strong>Browse focused research collections</strong>
            </span>
            <ChevronDown size={20} aria-hidden="true" />
          </summary>
          <div className="atlas-home__collection-grid">
            {collectionLinks.map(([href, label]) => (
              <Link href={href} key={href}>
                {label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </details>
        <Link className="atlas-home__graph-link" href="/graph">
          <Network size={22} aria-hidden="true" />
          <span>
            <strong>Inspect evidence-backed relationships</strong>
            <small>Open the relationship graph</small>
          </span>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
