import { z } from "zod";
import { currentAtlasYear, earliestAtlasYear } from "./exploration";

const flag = (value: "true" | "false") =>
  z
    .enum(["true", "false"])
    .default(value)
    .transform((v) => v === "true");
export function parseExplorationQuery(query: URLSearchParams) {
  return z
    .object({
      year: z.coerce
        .number()
        .int()
        .min(earliestAtlasYear)
        .max(currentAtlasYear())
        .refine((n) => n !== 0, "Historical years have no zero")
        .default(currentAtlasYear()),
      layer: z
        .enum(["work", "witness", "artifact", "tradition", "all"])
        .default("work"),
      tradition: z.string().max(200).default(""),
      region: z.string().max(300).default(""),
      geography: z.enum(["all", "approximate", "unlocated"]).default("all"),
      undated: flag("true"),
      fullText: flag("false"),
      images: flag("false"),
      view: z.enum(["records", "coverage"]).default("records"),
    })
    .safeParse(Object.fromEntries(query));
}
