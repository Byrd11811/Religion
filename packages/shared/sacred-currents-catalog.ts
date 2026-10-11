import { archiveImages, witnesses } from "./archive";
import { editions, texts, traditions } from "./catalog";
import { explorationRecords } from "./exploration-catalog";
import { relationshipEdges, relationshipNodes } from "./relationships";
import {
  buildChangePointYears,
  dateEvidenceStateFromNote,
  formatSacredRange,
  validateSacredCurrentsCatalog,
  type SacredCurrentsAnchor,
  type SacredCurrentsCatalog,
  type SacredCurrentsConnection,
  type SacredCurrentsCoverage,
  type SacredCurrentsEvidenceState,
  type SacredCurrentsRecord,
  type SacredCurrentsStream,
} from "./sacred-currents";

const workById = new Map(texts.map((work) => [work.id, work]));
const traditionById = new Map(
  traditions.map((tradition) => [tradition.id, tradition]),
);
const fallbackColor = "#68756b";
const httpsOnly = (values: string[]) =>
  values.filter((value) => value.startsWith("https://"));
const notesOnly = (values: string[]) =>
  values.filter((value) => !value.startsWith("https://"));

function witnessEvidenceState(evidence: string): SacredCurrentsEvidenceState {
  if (/securely attested/iu.test(evidence)) return "documented";
  if (/strong scholarly consensus/iu.test(evidence)) return "strong";
  if (
    /majority scholarly position|fragmentary|indirectly attested/iu.test(
      evidence,
    )
  )
    return "qualified";
  if (/disputed|speculative|hypothetical|reconstructed/iu.test(evidence))
    return "provisional";
  return evidence === "Unreviewed" ? "unreviewed" : "qualified";
}

function workRecords(): SacredCurrentsRecord[] {
  return texts.map((work) => {
    const tradition = traditionById.get(work.traditionId);
    const allSources = [work.sourceUrl, ...work.metadataSources].filter(
      (value): value is string => Boolean(value),
    );
    return {
      id: `work:${work.id}`,
      entityId: work.id,
      kind: "work",
      title: work.title,
      href: `/texts/${work.id}`,
      traditionId: work.traditionId,
      traditionName: tradition?.name ?? work.tradition,
      traditionColor: tradition?.color ?? fallbackColor,
      region: work.region,
      startYear: work.startDate,
      endYear: work.endDate,
      dateLabel: formatSacredRange(work.startDate, work.endDate),
      dateNote: work.dateConfidence,
      dateEvidence: dateEvidenceStateFromNote(
        work.startDate,
        work.dateConfidence,
      ),
      evidenceLabel: `Catalog confidence ${work.confidence}`,
      geography:
        work.lat !== null && work.lng !== null
          ? {
              lat: work.lat,
              lng: work.lng,
              precision: "approximate-editorial-anchor",
              label: work.region,
              note: "Approximate editorial anchor for catalog exploration. It is not a historical border, population extent, or verified route.",
            }
          : null,
      sourceUrls: [...new Set(httpsOnly(allSources))],
      sourceNotes: [...new Set(notesOnly(allSources))],
      description: work.description,
      relatedWorkIds: [work.id],
      hasImage: archiveImages.some((image) => image.workIds.includes(work.id)),
      hasText: editions.some((edition) => edition.textId === work.id),
    } satisfies SacredCurrentsRecord;
  });
}

function witnessRecords(): SacredCurrentsRecord[] {
  return witnesses.map((witness) => {
    const relatedWorks = witness.workIds
      .map((id) => workById.get(id))
      .filter((work) => work !== undefined);
    const traditionIds = [
      ...new Set(relatedWorks.map((work) => work.traditionId)),
    ];
    const tradition =
      traditionIds.length === 1
        ? traditionById.get(traditionIds[0])
        : undefined;
    return {
      id: `witness:${witness.id}`,
      entityId: witness.id,
      kind: "witness",
      title: witness.title,
      href: `/witnesses/${witness.id}`,
      traditionId: traditionIds.length === 1 ? traditionIds[0] : null,
      traditionName:
        traditionIds.length === 0
          ? "Unlinked witness"
          : traditionIds.length === 1
            ? (tradition?.name ??
              relatedWorks[0]?.tradition ??
              "Catalog tradition")
            : "Multiple traditions",
      traditionColor: tradition?.color ?? fallbackColor,
      region: witness.currentLocation,
      startYear: witness.dateStart,
      endYear: witness.dateEnd,
      dateLabel: formatSacredRange(witness.dateStart, witness.dateEnd),
      dateNote: witness.dateNotes,
      dateEvidence:
        witness.dateStart === null
          ? "unavailable"
          : witnessEvidenceState(witness.evidence),
      evidenceLabel: witness.evidence,
      geography: null,
      sourceUrls: [...new Set(httpsOnly(witness.sources))],
      sourceNotes: [...new Set(notesOnly(witness.sources))],
      description: `${witness.description} Repository and discovery names are retained without inferred coordinates.`,
      relatedWorkIds: witness.workIds,
      hasImage: archiveImages.some((image) => image.witnessId === witness.id),
      hasText: false,
    } satisfies SacredCurrentsRecord;
  });
}

function supportingRecords(): SacredCurrentsRecord[] {
  return explorationRecords
    .filter(
      (record) => record.kind === "artifact" || record.kind === "tradition",
    )
    .map((record) => {
      const traditionId =
        record.traditionIds.length === 1 ? record.traditionIds[0] : null;
      const tradition = traditionId ? traditionById.get(traditionId) : null;
      const entityId = record.id.replace(/^[^:]+:/u, "");
      const relatedWorkIds =
        record.kind === "artifact"
          ? [
              ...new Set(
                archiveImages
                  .filter(({ artifactId }) => artifactId === entityId)
                  .flatMap(({ workIds }) => workIds),
              ),
            ]
          : [];
      return {
        id: record.id,
        entityId,
        kind: record.kind,
        title: record.title,
        href: record.href,
        traditionId,
        traditionName:
          record.kind === "tradition"
            ? record.title
            : tradition?.name ??
              (record.traditionIds.length > 1
                ? "Multiple traditions"
                : "Unlinked artifact"),
        traditionColor: tradition?.color ?? fallbackColor,
        region: record.region,
        startYear: record.startDate,
        endYear: record.endDate,
        dateLabel: formatSacredRange(record.startDate, record.endDate),
        dateNote: record.dateNotes,
        dateEvidence: dateEvidenceStateFromNote(
          record.startDate,
          record.dateNotes,
        ),
        evidenceLabel: record.precision,
        geography:
          record.lat !== null && record.lng !== null
            ? {
                lat: record.lat,
                lng: record.lng,
                precision: "approximate-editorial-anchor",
                label: record.region,
                note: "Approximate editorial anchor for catalog exploration. It is not a historical border, population extent, or verified route.",
              }
            : null,
        sourceUrls: [...new Set(httpsOnly(record.sources))],
        sourceNotes: [...new Set(notesOnly(record.sources))],
        description: record.context,
        relatedWorkIds,
        hasImage: record.images,
        hasText: record.fullText,
      } satisfies SacredCurrentsRecord;
    });
}

function buildStreams(records: SacredCurrentsRecord[]): SacredCurrentsStream[] {
  const groups = new Map<string, SacredCurrentsRecord[]>();
  for (const record of records) {
    if (record.startYear === null || record.traditionId === null) continue;
    const current = groups.get(record.traditionId) ?? [];
    current.push(record);
    groups.set(record.traditionId, current);
  }
  return [...groups.entries()]
    .map(([traditionId, group]) => {
      const tradition = traditionById.get(traditionId);
      const endYears = group.map(
        (record) => record.endYear ?? record.startYear!,
      );
      return {
        id: `stream:${traditionId}`,
        traditionId,
        label: tradition?.name ?? group[0].traditionName,
        color: tradition?.color ?? group[0].traditionColor,
        recordIds: group
          .sort(
            (a, b) =>
              a.startYear! - b.startYear! || a.title.localeCompare(b.title),
          )
          .map((record) => record.id),
        workCount: group.filter(({ kind }) => kind === "work").length,
        witnessCount: group.filter(({ kind }) => kind === "witness").length,
        startYear: Math.min(...group.map((record) => record.startYear!)),
        endYear: Math.max(...endYears),
      } satisfies SacredCurrentsStream;
    })
    .sort(
      (a, b) => a.startYear - b.startYear || a.label.localeCompare(b.label),
    );
}

function coordinateKey(lat: number, lng: number) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function buildAnchors(records: SacredCurrentsRecord[]): SacredCurrentsAnchor[] {
  const groups = new Map<string, SacredCurrentsRecord[]>();
  for (const record of records) {
    if (!record.geography) continue;
    const key = coordinateKey(record.geography.lat, record.geography.lng);
    const current = groups.get(key) ?? [];
    current.push(record);
    groups.set(key, current);
  }
  return [...groups.entries()]
    .map(
      ([key, group]) =>
        ({
          id: `anchor:${key}`,
          lat: group[0].geography!.lat,
          lng: group[0].geography!.lng,
          label: group[0].geography!.label,
          recordIds: group.map(({ id }) => id).sort(),
          datedRecordCount: group.filter(({ startYear }) => startYear !== null)
            .length,
          undatedRecordCount: group.filter(
            ({ startYear }) => startYear === null,
          ).length,
          precision: "approximate-editorial-anchor",
          note: "Coincident catalog coordinates remain grouped at their original approximate editorial anchor; marker size is a record count, not a population measure.",
        }) satisfies SacredCurrentsAnchor,
    )
    .sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
}

function buildConnections(
  records: SacredCurrentsRecord[],
): SacredCurrentsConnection[] {
  const recordByKindAndEntityId = new Map(
    records.map(
      (record) => [`${record.kind}:${record.entityId}`, record] as const,
    ),
  );
  const nodeById = new Map(relationshipNodes.map((node) => [node.id, node]));
  return relationshipEdges.map((edge) => {
    const sourceNode = nodeById.get(edge.source)!;
    const targetNode = nodeById.get(edge.target)!;
    const sourceRecord =
      sourceNode.type === "work" ||
      sourceNode.type === "artifact" ||
      sourceNode.type === "tradition"
        ? (recordByKindAndEntityId.get(`${sourceNode.type}:${sourceNode.id}`) ??
          null)
        : null;
    const targetRecord =
      targetNode.type === "work" ||
      targetNode.type === "artifact" ||
      targetNode.type === "tradition"
        ? (recordByKindAndEntityId.get(`${targetNode.type}:${targetNode.id}`) ??
          null)
        : null;
    return {
      id: edge.id,
      relationshipType: edge.relationshipType,
      evidenceLevel: edge.evidenceLevel,
      confidence: edge.confidence,
      summary: edge.summary,
      source: {
        nodeId: sourceNode.id,
        nodeType: sourceNode.type,
        label: sourceNode.label,
        href: sourceNode.href,
        recordId: sourceRecord?.id ?? null,
      },
      target: {
        nodeId: targetNode.id,
        nodeType: targetNode.type,
        label: targetNode.label,
        href: targetNode.href,
        recordId: targetRecord?.id ?? null,
      },
      citations: edge.citations.map(({ id, label, url, locator }) => ({
        id,
        label,
        url,
        ...(locator ? { locator } : {}),
      })),
      counterarguments: edge.counterarguments.map(({ summary }) => summary),
      geographicMeaning: "relationship-not-route",
      renderAsRoute: false,
      drawableBetweenAnchors: Boolean(
        sourceRecord?.geography && targetRecord?.geography,
      ),
    } satisfies SacredCurrentsConnection;
  });
}

function buildCoverage(
  records: SacredCurrentsRecord[],
  connections: SacredCurrentsConnection[],
): SacredCurrentsCoverage {
  const works = records.filter(({ kind }) => kind === "work");
  const witnessRows = records.filter(({ kind }) => kind === "witness");
  const artifactRows = records.filter(({ kind }) => kind === "artifact");
  const traditionRows = records.filter(({ kind }) => kind === "tradition");
  const datedWorks = works.filter(({ startYear }) => startYear !== null);
  const mappedWorks = works.filter(({ geography }) => geography !== null);
  const datedWitnesses = witnessRows.filter(
    ({ startYear }) => startYear !== null,
  );
  const mappedWitnesses = witnessRows.filter(
    ({ geography }) => geography !== null,
  );
  const drawable = connections.filter(
    ({ drawableBetweenAnchors }) => drawableBetweenAnchors,
  );
  const layers: SacredCurrentsCoverage["layers"] = [
    {
      id: "work-chronology",
      label: "Work chronology",
      status: "partial",
      recordCount: datedWorks.length,
      totalCount: works.length,
      note: "Only catalog works with explicit start dates receive timeline positions; date notes and confidence remain visible.",
    },
    {
      id: "work-anchors",
      label: "Approximate work anchors",
      status: "partial",
      recordCount: mappedWorks.length,
      totalCount: works.length,
      note: "Coordinates are approximate editorial anchors. They do not describe historical borders, religious populations, or travel.",
    },
    {
      id: "witness-chronology",
      label: "Physical witness chronology",
      status: "partial",
      recordCount: datedWitnesses.length,
      totalCount: witnessRows.length,
      note: "Witness dates describe surviving physical objects and do not establish a work's composition date.",
    },
    {
      id: "witness-geography",
      label: "Witness geography",
      status: "unavailable",
      recordCount: mappedWitnesses.length,
      totalCount: witnessRows.length,
      note: "Repository and discovery names are searchable, but no reviewed coordinate gazetteer has been supplied.",
    },
    {
      id: "artifact-catalog",
      label: "Museum object catalog",
      status: "partial",
      recordCount: artifactRows.length,
      totalCount: artifactRows.length,
      note: "Museum objects retain institutional metadata and image associations; repository names do not supply geographic coordinates.",
    },
    {
      id: "tradition-catalog",
      label: "Tradition groupings",
      status: "partial",
      recordCount: traditionRows.length,
      totalCount: traditionRows.length,
      note: "Traditions are catalog navigation groups, not uniform populations or historical territory polygons.",
    },
    {
      id: "evidence-connections",
      label: "Evidence-backed relationships",
      status: "partial",
      recordCount: connections.length,
      totalCount: connections.length,
      note: "Phase 17 relationships carry citations and counterarguments. Their lines express evidence claims, never travel or transmission routes.",
    },
    {
      id: "historical-borders",
      label: "Historical borders",
      status: "unavailable",
      recordCount: 0,
      totalCount: 0,
      note: "No reviewed historical boundary dataset is present, so modern base-map boundaries cannot be presented as historical borders.",
    },
    {
      id: "migration-routes",
      label: "Migration routes",
      status: "unavailable",
      recordCount: 0,
      totalCount: 0,
      note: "No sourced route-event dataset is present. The interface must not infer migration from work anchors.",
    },
    {
      id: "trade-routes",
      label: "Trade routes",
      status: "unavailable",
      recordCount: 0,
      totalCount: 0,
      note: "No reviewed trade-route dataset is present. Similar texts or nearby anchors do not establish contact.",
    },
    {
      id: "repository-paths",
      label: "Repository and discovery paths",
      status: "unavailable",
      recordCount: 0,
      totalCount: witnessRows.length,
      note: "Named repositories and discovery places are distinct fields; no coordinates or journeys are inferred from those names.",
    },
  ];
  return {
    totals: {
      works: works.length,
      datedWorks: datedWorks.length,
      mappedWorks: mappedWorks.length,
      datedAndMappedWorks: works.filter(
        ({ startYear, geography }) => startYear !== null && geography !== null,
      ).length,
      witnesses: witnessRows.length,
      datedWitnesses: datedWitnesses.length,
      mappedWitnesses: mappedWitnesses.length,
      artifacts: artifactRows.length,
      traditions: traditionRows.length,
      relationships: connections.length,
      drawableRelationshipConnections: drawable.length,
    },
    layers,
    limitations: [
      "Map anchors are editorial catalog aids rather than polygons of belief, political control, or population.",
      "Composition ranges, witness dates, and modern repository locations describe different evidence and remain separate.",
      "A Phase 17 relationship is an inspectable evidence claim; even a drawable connection is not a route or proof of direct contact.",
      "Undated and unlocated records remain discoverable without invented positions.",
    ],
  };
}

export const sacredCurrentsRecords = [
  ...workRecords(),
  ...witnessRecords(),
  ...supportingRecords(),
];
export const sacredCurrentsStreams = buildStreams(sacredCurrentsRecords);
export const sacredCurrentsAnchors = buildAnchors(sacredCurrentsRecords);
export const sacredCurrentsConnections = buildConnections(
  sacredCurrentsRecords,
);
export const sacredCurrentsCoverage = buildCoverage(
  sacredCurrentsRecords,
  sacredCurrentsConnections,
);
export const sacredCurrentsCatalog: SacredCurrentsCatalog = {
  records: sacredCurrentsRecords,
  streams: sacredCurrentsStreams,
  anchors: sacredCurrentsAnchors,
  connections: sacredCurrentsConnections,
  changePointYears: buildChangePointYears(sacredCurrentsRecords),
  coverage: sacredCurrentsCoverage,
};

validateSacredCurrentsCatalog(sacredCurrentsCatalog);

export function sacredCurrentsRecord(id: string) {
  return (
    sacredCurrentsRecords.find(
      (record) => record.id === id || record.entityId === id,
    ) ?? null
  );
}

export function sacredCurrentsConnectionsForRecord(id: string) {
  const record = sacredCurrentsRecord(id);
  if (!record) return [];
  return sacredCurrentsConnections.filter(
    ({ source, target }) =>
      source.recordId === record.id || target.recordId === record.id,
  );
}
