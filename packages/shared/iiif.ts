import { z } from "zod";
import type { ArchiveImage } from "./archive";
const body = z.object({
  id: z
    .string()
    .url()
    .regex(/^https:\/\//),
  type: z.literal("Image"),
});
const manifestSchema = z.object({
  type: z.literal("Manifest"),
  label: z.record(z.string(), z.array(z.string())),
  rights: z.string().url(),
  items: z.array(
    z.object({
      id: z.string(),
      label: z.record(z.string(), z.array(z.string())),
      items: z.array(z.object({ items: z.array(z.object({ body })) })),
    }),
  ),
});
export function readManifest(input: unknown) {
  const manifest = manifestSchema.parse(input);
  return {
    title: Object.values(manifest.label).flat().join(" / "),
    rights: manifest.rights,
    pages: manifest.items.flatMap((canvas) =>
      canvas.items.flatMap((page) =>
        page.items.map((annotation) => ({
          id: canvas.id,
          label: Object.values(canvas.label).flat().join(" / "),
          imageUrl: annotation.body.id,
        })),
      ),
    ),
  };
}
export function createManifest(
  id: string,
  title: string,
  images: ArchiveImage[],
) {
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id,
    type: "Manifest",
    label: { en: [title] },
    summary: {
      en: [
        "Atlas-generated presentation of verified museum images. Image sequence is not manuscript foliation. Square canvases are display coordinates, not measured image dimensions.",
      ],
    },
    rights: "http://creativecommons.org/publicdomain/zero/1.0/",
    requiredStatement: {
      label: { en: ["Attribution"] },
      value: { en: [...new Set(images.map((i) => i.attribution))] },
    },
    seeAlso: [...new Set(images.map((image) => image.institutionalManifest).filter((value): value is string => Boolean(value)))].map((manifest) => ({
      id: manifest,
      type: "Dataset",
      format: "application/ld+json",
      label: { en: ["Institution-maintained IIIF Presentation manifest"] },
    })),
    items: images.map((image, index) => ({
      id: `${id}/canvas/${index}`,
      type: "Canvas",
      label: { en: [image.title] },
      height: 1000,
      width: 1000,
      items: [
        {
          id: `${id}/page/${index}`,
          type: "AnnotationPage",
          items: [
            {
              id: `${id}/annotation/${index}`,
              type: "Annotation",
              motivation: "painting",
              body: { id: image.imageUrl, type: "Image", format: "image/jpeg" },
              target: `${id}/canvas/${index}`,
            },
          ],
        },
      ],
    })),
  };
}
