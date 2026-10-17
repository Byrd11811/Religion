import type { ArchiveImage, MuseumArtifact } from "./archive";

export const imageInstitutionAdapters = [
  {
    id: "met",
    institution: "The Metropolitan Museum of Art",
    rights: "CC0 1.0 Universal · Met Open Access",
    sourceHosts: ["www.metmuseum.org"],
    imageHosts: ["images.metmuseum.org"],
    manifestHosts: [],
  },
  {
    id: "aic",
    institution: "Art Institute of Chicago",
    rights: "CC0 1.0 Universal · Art Institute of Chicago Open Access",
    sourceHosts: ["www.artic.edu"],
    imageHosts: ["www.artic.edu"],
    manifestHosts: ["api.artic.edu"],
  },
  {
    id: "cma",
    institution: "The Cleveland Museum of Art",
    rights: "CC0 1.0 Universal · Cleveland Museum of Art Open Access",
    sourceHosts: ["www.clevelandart.org", "clevelandart.org"],
    imageHosts: ["openaccess-cdn.clevelandart.org"],
    manifestHosts: [],
  },
] as const;

function host(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.hostname : "";
  } catch {
    return "";
  }
}

export function imageAdapter(image: ArchiveImage) {
  return imageInstitutionAdapters.find(
    (adapter) =>
      image.institution.startsWith(adapter.institution) &&
      image.rights.normalize("NFKC").trim().replace(/\s+/gu, " ") === adapter.rights,
  );
}

export function institutionalImageAllowed(image: ArchiveImage) {
  const adapter = imageAdapter(image);
  if (!adapter || !image.publicDomain || !image.attribution.trim()) return false;
  if (!adapter.sourceHosts.includes(host(image.sourceUrl) as never)) return false;
  if (!adapter.imageHosts.includes(host(image.imageUrl) as never)) return false;
  if (image.thumbnail && !adapter.imageHosts.includes(host(image.thumbnail) as never)) return false;
  if (
    image.institutionalManifest &&
    !adapter.manifestHosts.includes(host(image.institutionalManifest) as never)
  ) return false;
  if (adapter.id === "aic" && !image.iiifService?.startsWith("https://www.artic.edu/iiif/2/")) return false;
  return true;
}

export function validateImageCorpus(images: ArchiveImage[], artifacts: MuseumArtifact[]) {
  const ids = new Set<string>();
  const urls = new Set<string>();
  const artifactIds = new Set(artifacts.map((artifact) => artifact.id));
  for (const image of images) {
    if (ids.has(image.id)) throw new Error(`Duplicate image ID ${image.id}`);
    ids.add(image.id);
    if (!artifactIds.has(image.artifactId)) throw new Error(`Orphan image ${image.id}`);
    const normalizedUrl = image.imageUrl.replace(/\/full\/(?:200|843|1686),\//, "/full/{size}/");
    if (urls.has(normalizedUrl)) throw new Error(`Duplicate image resource ${image.id}`);
    urls.add(normalizedUrl);
    if (!institutionalImageAllowed(image)) throw new Error(`Unapproved image provenance ${image.id}`);
  }
  return {
    images: images.length,
    institutions: new Set(images.map((image) => imageAdapter(image)!.id)).size,
    byInstitution: Object.fromEntries(
      imageInstitutionAdapters.map((adapter) => [
        adapter.institution,
        images.filter((image) => imageAdapter(image)?.id === adapter.id).length,
      ]),
    ),
  };
}
