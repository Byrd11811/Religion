import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BookOpen,
  Bookmark,
  ChevronDown,
  Columns3,
  Compass,
  Globe2,
  Layers3,
  Map,
  MessageCircle,
  Network,
  NotebookPen,
  Scale,
  ScrollText,
  Shapes,
  Sparkles,
  Users,
} from "lucide-react";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  route: string;
  id?: string;
  alsoActiveFor?: string[];
};

const primary: NavigationItem[] = [
  { href: "/", label: "Overview", icon: Compass, route: "home" },
  {
    href: "/map",
    label: "Sacred Currents",
    icon: Map,
    route: "map",
  },
  {
    href: "/questions",
    label: "Question Explorer",
    icon: MessageCircle,
    route: "questions",
  },
  {
    href: "/library",
    label: "Text Library",
    icon: BookOpen,
    route: "library",
    alsoActiveFor: ["texts", "works"],
  },
  {
    href: "/compare",
    label: "Compare",
    icon: Columns3,
    route: "compare",
  },
];

const research: NavigationItem[] = [
  {
    href: "/research",
    label: "Linked research records",
    icon: Layers3,
    route: "research",
  },
  {
    href: "/timeline",
    label: "Timeline view",
    icon: Sparkles,
    route: "timeline",
  },
  {
    href: "/graph",
    label: "Relationship graph",
    icon: Network,
    route: "graph",
    alsoActiveFor: ["random"],
  },
  {
    href: "/opposition",
    label: "Show the Opposition",
    icon: Scale,
    route: "opposition",
  },
  {
    href: "/teaching-conduct",
    label: "Teaching vs conduct",
    icon: Scale,
    route: "teaching-conduct",
  },
  {
    href: "/compare/packs",
    label: "Curated comparison packs",
    icon: Layers3,
    route: "compare",
    id: "packs",
  },
  {
    href: "/traditions",
    label: "Traditions",
    icon: Globe2,
    route: "traditions",
  },
  {
    href: "/stories",
    label: "Story parallels",
    icon: Layers3,
    route: "stories",
  },
  {
    href: "/canon",
    label: "Canon / non-canon",
    icon: ScrollText,
    route: "canon",
  },
  {
    href: "/themes",
    label: "Themes",
    icon: Shapes,
    route: "themes",
  },
  {
    href: "/ontology",
    label: "Concept ontology",
    icon: Shapes,
    route: "ontology",
  },
  {
    href: "/entities",
    label: "Historical entities",
    icon: Users,
    route: "entities",
  },
  {
    href: "/people",
    label: "People & authors",
    icon: Users,
    route: "people",
  },
  {
    href: "/manuscripts",
    label: "Manuscripts & objects",
    icon: ScrollText,
    route: "manuscripts",
    alsoActiveFor: ["witnesses", "artifacts"],
  },
  {
    href: "/library/deep-archive",
    label: "Deep archive",
    icon: Archive,
    route: "library",
    id: "deep-archive",
  },
  {
    href: "/workspace",
    label: "Research workspace",
    icon: NotebookPen,
    route: "workspace",
  },
  {
    href: "/collections",
    label: "Saved collections",
    icon: Bookmark,
    route: "collections",
  },
];

const collections: NavigationItem[] = [
  {
    href: "/library/egypt",
    label: "Ancient Egypt",
    icon: ScrollText,
    route: "library",
    id: "egypt",
  },
  {
    href: "/library/mesopotamia",
    label: "Ancient Mesopotamia",
    icon: ScrollText,
    route: "library",
    id: "mesopotamia",
  },
  {
    href: "/library/china",
    label: "Chinese traditions",
    icon: ScrollText,
    route: "library",
    id: "china",
  },
  {
    href: "/library/horn",
    label: "Ethiopia, Eritrea & the Horn",
    icon: Globe2,
    route: "library",
    id: "horn",
  },
  {
    href: "/library/indigenous",
    label: "Global Indigenous traditions",
    icon: Globe2,
    route: "library",
    id: "indigenous",
  },
  {
    href: "/library/global",
    label: "Global religious coverage",
    icon: Globe2,
    route: "library",
    id: "global",
  },
  {
    href: "/library/undeciphered",
    label: "Unresolved writing systems",
    icon: Shapes,
    route: "library",
    id: "undeciphered",
  },
  {
    href: "/library/esoteric",
    label: "Esoteric literature",
    icon: BookOpen,
    route: "library",
    id: "esoteric",
  },
  {
    href: "/library/modern",
    label: "Modern religions",
    icon: Globe2,
    route: "library",
    id: "modern",
  },
  {
    href: "/library/forbidden",
    label: "Restricted texts",
    icon: Scale,
    route: "library",
    id: "forbidden",
  },
  {
    href: "/library/lost",
    label: "Lost & hypothetical works",
    icon: ScrollText,
    route: "library",
    id: "lost",
  },
  {
    href: "/library/disputed",
    label: "Disputed & forged works",
    icon: Shapes,
    route: "library",
    id: "disputed",
  },
  {
    href: "/explore/anunnaki",
    label: "Anunna / Anunnaki",
    icon: Sparkles,
    route: "explore",
    id: "anunnaki",
  },
];

function itemIsActive(item: NavigationItem, route: string, id?: string) {
  if (item.alsoActiveFor?.includes(route)) return true;
  if (item.href === "/compare/packs") return route === "compare" && Boolean(id);
  if (item.route !== route) return false;
  if (item.id !== undefined) return item.id === id;
  if (item.route === "compare" || item.route === "library") return !id;
  return true;
}

function NavigationLink({
  item,
  route,
  id,
  onNavigate,
}: {
  item: NavigationItem;
  route: string;
  id?: string;
  onNavigate: () => void;
}) {
  const active = itemIsActive(item, route, id);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} strokeWidth={1.55} aria-hidden="true" />
      <span>{item.label}</span>
      {active && <span className="nav-dot" aria-hidden="true" />}
    </Link>
  );
}

function DisclosureGroup({
  label,
  items,
  route,
  id,
  onNavigate,
}: {
  label: string;
  items: NavigationItem[];
  route: string;
  id?: string;
  onNavigate: () => void;
}) {
  const containsActive = items.some((item) => itemIsActive(item, route, id));
  return (
    <details className="nav-disclosure" open={containsActive || undefined}>
      <summary>
        <span>{label}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </summary>
      <div className="nav-disclosure__items">
        {items.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            route={route}
            id={id}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </details>
  );
}

export function AtlasNavigation({
  route,
  id,
  onNavigate,
}: {
  route: string;
  id?: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Main navigation" className="atlas-navigation">
      <div className="nav-group nav-group--primary">
        <span>Explore</span>
        {primary.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            route={route}
            id={id}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className="nav-group nav-group--disclosures">
        <span>More of the atlas</span>
        <DisclosureGroup
          label="Research tools"
          items={research}
          route={route}
          id={id}
          onNavigate={onNavigate}
        />
        <DisclosureGroup
          label="Collections"
          items={collections}
          route={route}
          id={id}
          onNavigate={onNavigate}
        />
      </div>
    </nav>
  );
}
