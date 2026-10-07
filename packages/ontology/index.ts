export const concepts: Record<string, string[]> = {
  afterlife: ["death", "dead", "immortal", "heaven", "hell", "soul"],
  creation: ["creation", "created", "beginning", "origin", "world"],
  flood: ["flood", "deluge", "waters", "ark"],
  suffering: ["suffering", "pain", "sorrow", "grief"],
  soul: ["soul", "self", "spirit", "mind"],
  reincarnation: ["rebirth", "birth", "born", "transmigration"],
  forgiveness: ["forgive", "forgiveness", "enemy", "enemies", "mercy"],
  evil: ["evil", "wicked", "sin", "satan"],
  wisdom: ["wisdom", "knowledge", "understanding", "truth"],
  law: ["law", "duty", "obedience", "command"],
  wealth: ["wealth", "rich", "poor", "poverty", "money"],
  peace: ["peace", "war", "violence", "battle"],
  enlightenment: ["enlightenment", "liberation", "desire", "nirvana"],
  ritual: ["prayer", "sacrifice", "ritual", "worship"],
  consciousness: ["consciousness", "mind", "perception", "reality"],
  judgment: ["judgment", "judgement", "punishment", "reward"],
  anunnaki: ["anunna", "anuna", "anunnaku", "anunnaki"],
};
export const themes = Object.keys(concepts);
export function tokenize(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .match(/[a-z0-9]+/g) ?? []
  );
}
export function detectConcepts(s: string) {
  const terms = new Set(tokenize(s));
  return Object.entries(concepts)
    .filter(([key, words]) => terms.has(key) || words.some((w) => terms.has(w)))
    .map(([key]) => key);
}
export const questions = [
  "What happens after death?",
  "Why do we suffer?",
  "What is the soul?",
  "How should we treat our enemies?",
  "Which traditions describe a world flood?",
  "Is reality an illusion?",
  "What makes a life meaningful?",
  "What is the origin of evil?",
];
