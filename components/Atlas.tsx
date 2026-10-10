"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Search,
  Columns3,
  Globe2,
  Clock3,
  Network,
  Layers3,
  Shapes,
  Users,
  Bookmark,
  NotebookPen,
  Info,
  Sun,
  Moon,
  Menu,
  X,
  MessageCircle,
  Shuffle,
  ScrollText,
  Scale,
} from "lucide-react";
import { texts, editions, artifacts } from "@/packages/shared/catalog";
import { questions } from "@/packages/ontology";
import type { Finding, SearchHit } from "@/packages/shared/types";
import { CitationDrawer, SaveDialog, TextCard, Empty } from "./common";
import { Library, TextDetail, TraditionsView, CanonView } from "./Library";
import { QuestionExplorer, Compare, Workspace } from "./Research";
import {
  DeepArchive,
  WitnessDetail,
  ArtifactDetail,
  EgyptCollection,
  WorkWitnesses,
} from "./Archive";
import { SourceDepth } from "./ArchiveEvidence";
import { FederatedSearchPage } from "./FederatedSearch";
import { AnunnakiResearch, MesopotamiaCollection } from "./Mesopotamia";
import { ChinaCollection } from "./China";
import { HornCollection } from "./Horn";
import { IndigenousCollection } from "./Indigenous";
import { GlobalCoverageCollection } from "./GlobalCoverage";
import { UndecipheredCollection, UndecipheredDetail } from "./Undeciphered";
import { EsotericCollection } from "./Esoteric";
import {
  Timeline,
  WorldMap,
  Graph,
  Stories,
  ThemesView,
  People,
  Manuscripts,
  Methodology,
} from "./Explore";
const navigation = [
  [
    "Explore",
    [
      ["home", "Overview", Compass],
      ["questions", "Question Explorer", MessageCircle],
      ["library", "Text Library", BookOpen],
      ["compare", "Compare Texts", Columns3],
    ],
  ],
  [
    "Discover",
    [
      ["traditions", "Traditions", Globe2],
      ["timeline", "Timeline", Clock3],
      ["map", "World Map", Globe2],
      ["stories", "Story Parallels", Layers3],
      ["canon", "Canon / Non-Canon", Scale],
      ["graph", "Influence Graph", Network],
      ["themes", "Themes", Shapes],
      ["people", "People & Authors", Users],
      ["manuscripts", "Manuscripts & Objects", ScrollText],
      ["library/deep-archive", "Deep Archive", Layers3],
      ["library/egypt", "Ancient Egypt", ScrollText],
      ["library/mesopotamia", "Ancient Mesopotamia", ScrollText],
      ["library/china", "Chinese Traditions", ScrollText],
      ["library/horn", "Ethiopia, Eritrea & the Horn", ScrollText],
      ["library/indigenous", "Global Indigenous traditions", Globe2],
      ["library/global", "Global Religious Coverage", Globe2],
      ["library/undeciphered", "Unresolved Writing Systems", Search],
      ["library/esoteric", "Esoteric & Religious Literature", BookOpen],
      ["explore/anunnaki", "Anunna / Anunnaki", Search],
    ],
  ],
  [
    "Your research",
    [
      ["workspace", "Research Workspace", NotebookPen],
      ["collections", "Saved Collections", Bookmark],
    ],
  ],
] as const;
export default function Atlas({
  route,
  id,
  initialQuery,
  initialText,
}: {
  route: string;
  id?: string;
  initialQuery: string;
  initialText: string;
}) {
  const [menu, setMenu] = useState(false),
    [dark, setDark] = useState(false),
    [citation, setCitation] = useState<SearchHit | null>(null),
    [finding, setFinding] = useState<Finding | null>(null),
    [toast, setToast] = useState(""),
    [global, setGlobal] = useState("");
  const router = useRouter();
  useEffect(() => {
    const saved = localStorage.getItem("atlas-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.dataset.theme = "dark";
    }
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const actions = { onSave: setFinding, onOpen: setCitation };
  let content: React.ReactNode;
  switch (route) {
    case "home":
      content = <Home onSave={setFinding} />;
      break;
    case "library":
      content =
        id === "egypt" ? (
          <EgyptCollection />
        ) : id === "mesopotamia" ? (
          <MesopotamiaCollection />
        ) : id === "china" ? (
          <ChinaCollection />
        ) : id === "horn" ? (
          <HornCollection />
        ) : id === "indigenous" ? (
          <IndigenousCollection />
        ) : id === "global" ? (
          <GlobalCoverageCollection />
        ) : id === "undeciphered" ? (
          <UndecipheredCollection />
        ) : id === "esoteric" ? (
          <EsotericCollection />
        ) : id ? (
          <DeepArchive collection={id} />
        ) : (
          <Library initialQuery={initialQuery} {...actions} />
        );
      break;
    case "explore":
      content = id === "anunnaki" ? <AnunnakiResearch /> : <Empty>This research guide is not available.</Empty>;
      break;
    case "search":
      content = (
        <FederatedSearchPage initialQuery={initialQuery} {...actions} />
      );
      break;
    case "works":
      content = id ? (
        <>
          <SourceDepth id={id} />
          <TextDetail id={id} {...actions} />
          <WorkWitnesses id={id} />
        </>
      ) : (
        <DeepArchive />
      );
      break;
    case "witnesses":
      content = id ? (
        <WitnessDetail id={id} />
      ) : (
        <DeepArchive collection="manuscripts" />
      );
      break;
    case "artifacts":
      content = id ? <ArtifactDetail id={id} /> : <Manuscripts />;
      break;
    case "texts":
      content = id ? (
        <TextDetail id={id} {...actions} />
      ) : (
        <Library {...actions} />
      );
      break;
    case "traditions":
      content = <TraditionsView id={id} {...actions} />;
      break;
    case "questions":
    case "opposition":
      content = (
        <QuestionExplorer
          initialQuery={initialQuery}
          initialText={initialText}
          opposition={route === "opposition"}
          {...actions}
        />
      );
      break;
    case "compare":
      content = <Compare initialText={initialText} {...actions} />;
      break;
    case "timeline":
      content = <Timeline />;
      break;
    case "map":
      content = <WorldMap />;
      break;
    case "stories":
      content = <Stories />;
      break;
    case "canon":
      content = <CanonView {...actions} />;
      break;
    case "graph":
    case "random":
      content = <Graph random={route === "random"} />;
      break;
    case "themes":
      content = <ThemesView />;
      break;
    case "people":
      content = <People {...actions} />;
      break;
    case "workspace":
    case "collections":
      content = <Workspace />;
      break;
    case "manuscripts":
      content = id ? (
        <WitnessDetail id={id} />
      ) : (
        <>
          <DeepArchive collection="manuscripts" />
          <Manuscripts />
        </>
      );
      break;
    case "undeciphered":
      content = id ? <UndecipheredDetail id={id} /> : <UndecipheredCollection />;
      break;
    case "methodology":
      content = <Methodology />;
      break;
    default:
      content = (
        <Empty>
          This page is not in the atlas. <Link href="/">Return home</Link>.
        </Empty>
      );
  }
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-symbol">
            <Compass size={31} strokeWidth={1.15} />
          </span>
          <span>
            ATLAS<small>SACRED TEXTS & IDEAS</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <nav aria-label="Main navigation">
          {navigation.map(([group, items]) => (
            <div className="nav-group" key={group}>
              <span>{group}</span>
              {items.map(([path, label, Icon]) => (
                <Link
                  onClick={() => setMenu(false)}
                  className={
                    route === path ||
                    `${route}/${id ?? ""}` === path ||
                    (path === "library" && route === "texts")
                      ? "active"
                      : ""
                  }
                  key={path}
                  href={path === "home" ? "/" : `/${path}`}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  {label}
                  {route === path && <span className="nav-dot" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Link href="/methodology">
            <Info size={17} />
            About & methodology
          </Link>
          <div className="local-tag">
            LOCAL RESEARCH EDITION <span>1.2</span>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="app-main">
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Humanity’s search for meaning<span>/</span>
            <strong>
              {route === "home"
                ? "Overview"
                : route === "texts"
                  ? "Text profile"
                  : route.charAt(0).toUpperCase() + route.slice(1)}
            </strong>
          </div>
          <form
            className="global-search"
            onSubmit={(e) => {
              e.preventDefault();
              if (global.trim())
                router.push(`/search?q=${encodeURIComponent(global)}`);
            }}
          >
            <Search size={17} />
            <input
              aria-label="Search the atlas"
              placeholder="Search the atlas…"
              value={global}
              onChange={(e) => setGlobal(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <button
            className="icon-button theme-switch"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => {
              const next = !dark;
              setDark(next);
              document.documentElement.dataset.theme = next ? "dark" : "light";
              localStorage.setItem("atlas-theme", next ? "dark" : "light");
            }}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <span className="avatar" aria-label="Local workspace">
            A
          </span>
        </header>
        <main id="main">{content}</main>
        <footer className="main-footer">
          <span>Many traditions. Open questions.</span>
          <Link href="/methodology">Sources, uncertainty & methodology ↗</Link>
        </footer>
      </div>
      {citation && (
        <CitationDrawer passage={citation} onClose={() => setCitation(null)} />
      )}{" "}
      {finding && (
        <SaveDialog
          finding={finding}
          onClose={() => setFinding(null)}
          onSaved={setToast}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
function Home({ onSave }: { onSave: (f: Finding) => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="home-heading">
        <span className="eyebrow">
          THE UNIVERSAL RELIGION & SACRED TEXT ATLAS
        </span>
        <div className="row between">
          <h1>
            Explore humanity’s
            <br />
            <em>search for meaning.</em>
          </h1>
          <div className="home-note">
            Across cultures.
            <br />
            Across centuries.
            <br />
            Always with sources.
          </div>
        </div>
        <p>
          Sacred texts, ancient stories, and philosophical questions.
          <br className="desktop-only" /> A place to explore what connects
          us—and where our ideas diverge.
        </p>
      </div>
      <form
        className="question-form home-question"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/questions?q=${encodeURIComponent(q)}`);
        }}
      >
        <Search size={23} />
        <input
          aria-label="Ask a big question"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to understand?"
        />
        <button className="button">
          Explore a question
          <ArrowRight size={18} />
        </button>
      </form>
      <div className="question-suggestions">
        <span>BEGIN WITH</span>
        {questions.slice(0, 3).map((q) => (
          <Link key={q} href={`/questions?q=${encodeURIComponent(q)}`}>
            {q}
            <ArrowUpRight size={13} />
          </Link>
        ))}
      </div>
      <div className="stats-strip">
        <div>
          <strong>{texts.length}</strong>
          <span>texts in the catalog</span>
        </div>
        <div>
          <strong>26</strong>
          <span>tradition groupings</span>
        </div>
        <div>
          <strong>{new Set(editions.map((e) => e.textId)).size}</strong>
          <span>searchable primary works</span>
        </div>
        <div className="stats-note">
          <span className="tiny-ring" />
          <span>
            Evidence, interpretation,
            <br />
            and uncertainty—kept visible.
          </span>
        </div>
      </div>
      <section className="home-paths">
        <Link href="/map" className="path-card map-path">
          <div>
            <span className="eyebrow">ACROSS THE WORLD</span>
            <h2>
              Every idea
              <br />
              comes from somewhere.
            </h2>
            <span className="text-button">
              Explore the world map <ArrowUpRight size={17} />
            </span>
          </div>
          <Globe2 className="path-globe" size={190} strokeWidth={0.6} />
        </Link>
        <Link href="/timeline" className="path-card time-path">
          <span className="eyebrow">ACROSS TIME</span>
          <h2>
            Follow the long
            <br />
            conversation.
          </h2>
          <div className="mini-timeline">
            <span>750 BCE</span>
            <span>1 CE</span>
            <span>1900 CE</span>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="text-button">
            Explore the timeline <ArrowUpRight size={17} />
          </span>
        </Link>
      </section>
      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE READING ROOM</span>
            <h2>A few places to begin</h2>
          </div>
          <Link href="/library" className="text-button">
            Browse all texts <ArrowRight size={17} />
          </Link>
        </div>
        <div className="text-grid home-texts">
          {["bhagavad-gita", "dhammapada", "tao-te-ching"]
            .map((id) => texts.find((t) => t.id === id)!)
            .map((t) => (
              <TextCard key={t.id} text={t} onSave={onSave} />
            ))}
        </div>
      </section>
      <section className="discovery-row">
        <Link href="/stories" className="discovery-card">
          <Layers3 size={25} />
          <h3>
            Familiar stories.
            <br />
            Different worlds.
          </h3>
          <p>Explore narrative parallels with their differences in view.</p>
          <span>
            Story parallels <ArrowUpRight size={16} />
          </span>
        </Link>
        <Link href="/opposition?q=obedience" className="discovery-card">
          <Scale size={25} />
          <h3>
            Make room for
            <br />
            another perspective.
          </h3>
          <p>Find the critiques, inversions, and competing ideas.</p>
          <span>
            Show the Opposition <ArrowUpRight size={16} />
          </span>
        </Link>
        <Link href="/canon" className="discovery-card">
          <ScrollText size={25} />
          <h3>
            Beyond the
            <br />
            accepted canon.
          </h3>
          <p>Ask which communities accepted a text, and when.</p>
          <span>
            Canon / Non-Canon <ArrowUpRight size={16} />
          </span>
        </Link>
        <Link href="/library/horn" className="discovery-card">
          <Globe2 size={25} />
          <h3>
            Geʽez heritage.
            <br />
            Distinct communities.
          </h3>
          <p>Explore Ethiopia, Eritrea and the Horn through community-specific canon and manuscript evidence.</p>
          <span>
            Open the Horn collection <ArrowUpRight size={16} />
          </span>
        </Link>
      </section>
      <section className="artifact-feature">
        <div className="artifact-preview">
          <img
            src={artifacts[0].imageUrl}
            alt={artifacts[0].title}
            loading="lazy"
          />
        </div>
        <div>
          <span className="eyebrow">A MATERIAL HISTORY</span>
          <h2>Ideas leave traces.</h2>
          <p>
            A stone inscription. A palm-leaf manuscript. Meet the objects
            through which writing survives.
          </p>
          <Link className="text-button" href="/manuscripts">
            Explore manuscripts & objects <ArrowUpRight size={17} />
          </Link>
          <p className="small muted">
            {artifacts[0].date} · The Metropolitan Museum of Art
            <br />
            CC0 / Open Access ·{" "}
            <a href={artifacts[0].sourceUrl} target="_blank" rel="noreferrer">
              Object attribution
            </a>
          </p>
        </div>
        <Link href="/random" className="random-link">
          <Shuffle size={21} />
          Follow a random connection
          <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
