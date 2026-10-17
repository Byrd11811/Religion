import { archiveImages } from "../packages/shared/archive";
import { museumArtifacts } from "../packages/shared/archive";
import { imageAdapter, validateImageCorpus } from "../packages/shared/image-pipeline";
async function main() {
  const summary = validateImageCorpus(archiveImages, museumArtifacts);
  for (const a of archiveImages) {
    const adapter = imageAdapter(a)!;
    const response = await fetch(a.imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(30000),
    });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/")
    )
      throw new Error(`Image unavailable: ${a.id}`);
    console.log(`Verified ${adapter.id} · ${a.id}: ${a.rights}`);
  }
  console.log(JSON.stringify(summary));
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
