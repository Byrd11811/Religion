import { archiveImages } from "../packages/shared/archive";
async function main() {
  for (const a of archiveImages) {
    if (
      !a.rights.includes("CC0") ||
      !a.sourceUrl.startsWith("https://www.metmuseum.org/")
    )
      throw new Error(`Unapproved image rights: ${a.id}`);
    const response = await fetch(a.imageUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(30000),
    });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.startsWith("image/")
    )
      throw new Error(`Image unavailable: ${a.id}`);
    console.log(`Verified ${a.id}: ${a.rights}`);
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
