"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Compass, Search, Info, Sun, Moon, Menu, X } from "lucide-react";
import type { Finding, SearchHit } from "@/packages/shared/types";
import { CitationDrawer, SaveDialog, Empty } from "./common";
import { Library, TextDetail, TraditionsView, CanonView } from "./Library";
import { Compare, Workspace } from "./Research";
import { StructuredQuestionExplorer } from "./StructuredQuestion";
import { ComparisonPacks } from "./ComparisonPacks";
import { OppositionExplorer, TeachingConductExplorer } from "./ResearchEngines";
import {
  DeepArchive,
  WitnessDetail,
  ArtifactDetail,
  EgyptCollection,
} from "./Archive";
import { FederatedSearchPage } from "./FederatedSearch";
import { AnunnakiResearch, MesopotamiaCollection } from "./Mesopotamia";
import { ChinaCollection } from "./China";
import { HornCollection } from "./Horn";
import { IndigenousCollection } from "./Indigenous";
import { GlobalCoverageCollection } from "./GlobalCoverage";
import { UndecipheredCollection, UndecipheredDetail } from "./Undeciphered";
import { EsotericCollection } from "./Esoteric";
import { ModernReligionsCollection } from "./ModernReligions";
import { ForbiddenLostDisputedCollection } from "./ForbiddenLostDisputed";
import { EntityExplorer, OntologyExplorer } from "./OntologyEntities";
import {
  Graph,
  Stories,
  ThemesView,
  People,
  Manuscripts,
  Methodology,
} from "./Explore";
import { AtlasNavigation } from "./AtlasNavigation";
import Home from "./Home";

const SacredCurrents = dynamic(() => import("./SacredCurrents"), {
  ssr: false,
  loading: () => (
    <div className="sacred-currents-loading" role="status">
      <Compass size={25} aria-hidden="true" />
      <span>Preparing the map and timeline…</span>
    </div>
  ),
});

const routeTitles: Record<string, string> = {
  home: "Overview",
  map: "Sacred Currents",
  timeline: "Sacred Currents · Timeline",
  questions: "Question Explorer",
  library: "Text Library",
  compare: "Compare",
  graph: "Relationship Graph",
  texts: "Text profile",
  works: "Work profile",
};
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
    [global, setGlobal] = useState(""),
    [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
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
  const sacredCurrentsRoute = route === "map" || route === "timeline";
  let content: React.ReactNode;
  switch (route) {
    case "home":
      content = <Home />;
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
        ) : id === "modern" ? (
          <ModernReligionsCollection />
        ) : id === "forbidden" || id === "lost" || id === "disputed" ? (
          <ForbiddenLostDisputedCollection section={id} />
        ) : id ? (
          <DeepArchive collection={id} />
        ) : (
          <Library initialQuery={initialQuery} {...actions} />
        );
      break;
    case "explore":
      content =
        id === "anunnaki" ? (
          <AnunnakiResearch />
        ) : (
          <Empty>This research guide is not available.</Empty>
        );
      break;
    case "search":
      content = (
        <FederatedSearchPage initialQuery={initialQuery} {...actions} />
      );
      break;
    case "works":
      content = id ? <TextDetail id={id} {...actions} /> : <DeepArchive />;
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
      content = (
        <StructuredQuestionExplorer
          initialQuery={initialQuery}
          initialText={initialText}
          {...actions}
        />
      );
      break;
    case "opposition":
      content = <OppositionExplorer initialQuery={initialQuery} />;
      break;
    case "teaching-conduct":
      content = <TeachingConductExplorer />;
      break;
    case "compare":
      content = id ? (
        <ComparisonPacks packId={id} />
      ) : (
        <Compare initialText={initialText} {...actions} />
      );
      break;
    case "timeline":
      content = (
        <SacredCurrents initialView="timeline" initialQuery={initialQuery} />
      );
      break;
    case "map":
      content = (
        <SacredCurrents initialView="map" initialQuery={initialQuery} />
      );
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
    case "ontology":
      content = <OntologyExplorer conceptId={id} />;
      break;
    case "entities":
      content = <EntityExplorer entityId={id} />;
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
      content = id ? (
        <UndecipheredDetail id={id} />
      ) : (
        <UndecipheredCollection />
      );
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
        <AtlasNavigation
          route={route}
          id={id}
          onNavigate={() => setMenu(false)}
        />
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
      <div
        className={`app-main ${sacredCurrentsRoute ? "app-main--immersive" : ""}`}
      >
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb" aria-label="Current location">
            Humanity’s search for meaning<span>/</span>
            <strong>
              {routeTitles[route] ??
                route.charAt(0).toUpperCase() + route.slice(1)}
            </strong>
          </div>
          <form
            className={`global-search ${searchOpen ? "global-search--open" : ""}`}
            onSubmit={(e) => {
              e.preventDefault();
              if (global.trim())
                router.push(`/search?q=${encodeURIComponent(global)}`);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchOpen(false);
                searchInput.current?.blur();
              }
            }}
          >
            <button
              className="icon-button global-search__toggle"
              type="button"
              aria-label={
                searchOpen ? "Close atlas search" : "Open atlas search"
              }
              aria-expanded={searchOpen}
              onClick={() => {
                const next = !searchOpen;
                setSearchOpen(next);
                if (next)
                  requestAnimationFrame(() => searchInput.current?.focus());
              }}
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
            <div className="global-search__field">
              <Search size={16} aria-hidden="true" />
              <input
                ref={searchInput}
                aria-label="Search the atlas"
                placeholder="Search texts, passages, people…"
                value={global}
                onChange={(e) => setGlobal(e.target.value)}
                tabIndex={searchOpen ? 0 : -1}
              />
              <kbd>↵</kbd>
            </div>
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
        <main
          id="main"
          className={sacredCurrentsRoute ? "atlas-main--immersive" : undefined}
        >
          {content}
        </main>
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
