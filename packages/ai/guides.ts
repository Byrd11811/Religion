import { allPassages, type SearchOptions } from "@/packages/search";
import { texts, editions } from "@/packages/shared/catalog";
import { protocolDecision } from "@/packages/shared/protocols";
import { passageAiRightsAllowed } from "@/packages/shared/rights";
import type { QueryAnswer, SearchHit } from "@/packages/shared/types";

type Guide = NonNullable<QueryAnswer["guide"]> & { match: RegExp };
export function evidence(id: string): SearchHit {
  const p = allPassages().find((p) => p.id === id);
  if (!p) throw new Error(`Missing editorial evidence: ${id}`);
  const t = texts.find((t) => t.id === p.textId)!;
  return {
    ...p,
    score: 0,
    textTitle: t.title,
    tradition: t.tradition,
    translator: editions.find((e) => e.id === p.editionId)!.translator,
  };
}
function perspective(id: string, label: string, interpretation: string) {
  return {
    textId: evidence(id).textId,
    label,
    interpretation,
    passageIds: [id],
  };
}
export function readingGuides(): Guide[] {
  return [
    {
      match: /forgiv|enem|hatred|injur|kindness/i,
      title: "Responding to injury",
      summary:
        "These passages propose different responses to hostility: love, kindness, and justice. Their terms and rhetorical settings deserve separate attention.",
      perspectives: [
        perspective(
          "pg-2017-2",
          "Dhammapada · ending hatred",
          "Verse 5 presents love as the way hatred ceases. This is a practical ethical maxim within the opening paired verses.",
        ),
        perspective(
          "pg-216-30",
          "Tao Te Ching · kindness",
          "Chapter 63 includes recompensing injury with kindness among instructions about action and handling difficulties while they are small.",
        ),
        perspective(
          "pg-3330-75",
          "Analects · differentiated response",
          "The Master distinguishes recompensing injury with justice from recompensing kindness with kindness. The response resists treating injury and kindness identically.",
        ),
        perspective(
          "pg-10-gospel-of-matthew-91",
          "Matthew · love of enemies",
          "Matthew 5:44–45 commands love and prayer for enemies and connects this conduct to the heavenly Father's sun and rain reaching both just and unjust.",
        ),
      ],
      agreements:
        "Each selected passage addresses conduct in the presence of hostility. None of these excerpts recommends simply reproducing hatred.",
      differences:
        "The Analects explicitly distinguishes justice from kindness; the Tao Te Ching calls for kindness toward injury, while Matthew adds prayer for persecutors. These are textual differences, not interchangeable doctrines.",
      scope:
        "Editorial comparison of four English excerpts; not a comprehensive account of Buddhist, Daoist, Confucian, or Christian ethics. Translation choices affect the comparison.",
    },
    {
      match: /afterlife|after death|resurrect|immortal|soul/i,
      title: "Death, continuity, and resurrection",
      summary:
        "The selected passages describe an enduring spirit, the limits of the dead's knowledge, and a future resurrection. They do not use one shared account of personal continuity.",
      perspectives: [
        perspective(
          "pg-2388-10",
          "Bhagavad Gita · enduring spirit",
          "The spirit is described as birthless and deathless, with changes of embodiment compared to changing worn clothing. This teaching occurs in Krishna's response to Arjuna's battlefield crisis.",
        ),
        perspective(
          "pg-10-ecclesiastes-131",
          "Ecclesiastes · the dead's knowledge",
          "Ecclesiastes 9:5 contrasts the living's knowledge that they will die with the dead knowing nothing. The verse requires the surrounding discussion of life and activity for interpretation.",
        ),
        perspective(
          "pg-10-gospel-of-john-158",
          "John · future resurrection",
          "John 5:28–29 depicts those in graves hearing a voice and coming forth, with different outcomes linked to their deeds.",
        ),
      ],
      agreements:
        "All three excerpts place present embodied life in relation to death. That shared topic alone establishes no agreement about what persists.",
      differences:
        "The Gita describes an enduring spirit and renewed embodiment; John depicts resurrection and judgment. Ecclesiastes' statement about the dead creates an interpretive tension with future-life readings, depending on its scope.",
      scope:
        "Editorial reading of specific translated passages. These voices do not represent every position within their communities; literary context and later interpretation can change the comparison.",
    },
    {
      match: /suffer|evil|pain/i,
      title: "Suffering and the limits of explanation",
      summary:
        "These excerpts approach suffering through practice, a challenge to divine attributes, and a challenge to human understanding.",
      perspectives: [
        perspective(
          "pg-2017-28",
          "Dhammapada · a path of practice",
          "Verses 273–278 commend the path, personal effort, and recognition of impermanence and pain. The emphasis is on a response to suffering through practice.",
        ),
        perspective(
          "pg-4583-95",
          "Hume's Dialogues · Philo's challenge",
          "Philo asks how evil can be reconciled with divine willingness and power to prevent it. This is a speaker's argument in a philosophical dialogue, not an unqualified statement of the author's position.",
        ),
        perspective(
          "pg-10-job-640",
          "Job · limits of human understanding",
          "Job 38:4 asks where Job was when the earth's foundations were laid. The divine speech challenges Job's standpoint rather than supplying a complete causal explanation of his suffering in this verse.",
        ),
      ],
      agreements:
        "Each excerpt makes suffering or human limitation a serious matter for reflection. They do not supply the same kind of explanation.",
      differences:
        "The Dhammapada passage emphasizes practice; Philo presses a philosophical objection; Job's divine speech challenges the reach of human understanding. These differences in genre matter to comparison.",
      scope:
        "Editorial guide to three excerpts, not a comprehensive theodicy or a summary of entire traditions. Read the full dialogue and surrounding verses.",
    },
  ];
}
export function guideFor(question: string, filters: SearchOptions) {
  const guide = readingGuides().find((g) => g.match.test(question));
  if (!guide) return;
  // The whole guide compares a fixed set. Omit it when any source falls outside scope.
  const allowed = guide.perspectives.every((p) => {
    const t = texts.find((t) => t.id === p.textId)!;
    const citedPassages = p.passageIds.map(evidence);
    return (
      protocolDecision(t.id, "search").allowed &&
      (!filters.textIds?.length || filters.textIds.includes(t.id)) &&
      (!filters.traditions?.length ||
        filters.traditions.includes(t.traditionId)) &&
      (!filters.region || filters.region === t.region) &&
      (filters.before === undefined ||
        (t.startDate !== null && t.startDate <= filters.before)) &&
      (filters.after === undefined ||
        (t.endDate !== null && t.endDate >= filters.after)) &&
      (!filters.editionIds?.length ||
        citedPassages.every((passage) =>
          filters.editionIds!.includes(passage.editionId),
        )) &&
      (!filters.contentTypes?.length ||
        citedPassages.every((passage) =>
          filters.contentTypes!.includes(passage.contentType),
        )) &&
      citedPassages.every((passage) => passageAiRightsAllowed(passage))
    );
  });
  if (!allowed) return;
  const { match: _match, ...result } = guide;
  void _match;
  return result;
}

export function comparisonCases(textIds: string[], theme: string) {
  const cases = [
    {
      id: "injury",
      title: "Kindness or justice in response to injury?",
      match: /forgiv|enem|hatred|injur|kindness|justice/i,
      ids: ["pg-216-30", "pg-3330-75"],
      tension:
        "Tao Te Ching 63 calls for recompensing injury with kindness. The Analects distinguishes justice toward injury from kindness toward kindness.",
      alternative:
        "The statements may address different practical situations, and justice need not exclude benevolence. Translation of the ethical terms also affects the apparent opposition.",
    },
    {
      id: "dead",
      title: "The dead know nothing—and later rise?",
      match: /death|dead|afterlife|resurrect|soul/i,
      ids: ["pg-10-ecclesiastes-131", "pg-10-gospel-of-john-158"],
      tension:
        "Ecclesiastes 9:5 says the dead know nothing; John 5:28–29 describes those in graves coming forth to resurrection. Read without qualifications, the passages suggest different pictures of death.",
      alternative:
        "A reader may distinguish present earthly activity from a future resurrection. That reconciliation depends on an interpretation of scope; these excerpts alone do not establish it.",
    },
  ];
  return cases
    .filter(
      (c) =>
        c.match.test(theme) &&
        c.ids.every((id) => textIds.includes(evidence(id).textId)),
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      tension: c.tension,
      alternative: c.alternative,
      confidence: "D" as const,
      passages: c.ids.map(evidence),
    }));
}
