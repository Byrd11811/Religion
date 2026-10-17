import test from "node:test";
import assert from "node:assert/strict";
import {
  alignmentsForText,
  priorityLanguageCoverage,
  translationAlignments,
  validateTranslationAlignments,
} from "../packages/shared/translation-alignments";

test("aligned translations use exact reviewed passage spans and shared references", () => {
  assert.equal(validateTranslationAlignments(), true);
  assert.equal(translationAlignments.length, 4);
  assert.deepEqual(
    new Set(translationAlignments.map((row) => row.textId)),
    new Set(["tao-te-ching", "analects"]),
  );
  assert.ok(translationAlignments.every((row) => row.sharedReference));
  assert.ok(translationAlignments.every((row) => row.translations.length));
  assert.ok(
    translationAlignments
      .flatMap((row) => [row.original, ...row.translations])
      .every(
        (rendering) =>
          !rendering.machineGenerated &&
          rendering.source.attribution &&
          rendering.source.url.startsWith("https://"),
      ),
  );
});

test("unavailable priority languages remain explicit instead of receiving synthetic text", () => {
  assert.equal(priorityLanguageCoverage.length, 8);
  assert.equal(
    priorityLanguageCoverage.find((item) => item.language === "Chinese")
      ?.status,
    "aligned",
  );
  assert.equal(
    priorityLanguageCoverage.find((item) => item.language === "Arabic")
      ?.status,
    "unavailable",
  );
  assert.equal(alignmentsForText("quran").length, 0);
});
