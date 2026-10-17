import test from "node:test";
import assert from "node:assert/strict";
import { archiveImages, archiveImageDisplayAllowed, museumArtifacts } from "../packages/shared/archive";
import { imageAdapter, imageInstitutionAdapters, institutionalImageAllowed, validateImageCorpus } from "../packages/shared/image-pipeline";

test("Phase 19 supplies 500 verified images without one institution dominating", () => {
  const summary = validateImageCorpus(archiveImages, museumArtifacts);
  assert.equal(summary.images, 500);
  assert.equal(summary.institutions, 3);
  assert.equal(imageInstitutionAdapters.length, 3);
  assert.ok(Object.values(summary.byInstitution).every((count) => count / summary.images < 0.55));
  assert.ok(archiveImages.every(archiveImageDisplayAllowed));
});

test("multi-institution records retain object diversity, hashes, rights, and IIIF provenance", () => {
  const expanded = museumArtifacts.filter((artifact) => artifact.collection === "multi-institution-open-access");
  assert.equal(expanded.length, 395);
  assert.ok(new Set(expanded.map((artifact) => artifact.objectType)).size >= 15);
  assert.ok(new Set(expanded.map((artifact) => artifact.culture)).size >= 50);
  assert.ok(expanded.every((artifact) => artifact.sourceHash?.match(/^[a-f0-9]{64}$/)));
  const aic = archiveImages.filter((image) => imageAdapter(image)?.id === "aic");
  assert.equal(aic.length, 125);
  assert.ok(aic.every((image) => image.iiifService && image.institutionalManifest && image.sourceHash));
  const cma = archiveImages.filter((image) => imageAdapter(image)?.id === "cma");
  assert.equal(cma.length, 270);
  assert.ok(cma.every((image) => image.sourceHash && image.rights.includes("CC0")));
});

test("image validation fails closed for altered rights or remote hosts", () => {
  const original = archiveImages.find((image) => imageAdapter(image)?.id === "aic")!;
  assert.equal(institutionalImageAllowed({ ...original, rights: "Rights unknown" }), false);
  assert.equal(institutionalImageAllowed({ ...original, imageUrl: "https://example.org/copy.jpg" }), false);
  assert.throws(
    () => validateImageCorpus([original, { ...original, id: "duplicate-id" }], museumArtifacts),
    /Duplicate image resource/,
  );
});
