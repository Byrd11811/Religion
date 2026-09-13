import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: [
    "pg",
    "@electric-sql/pglite",
    "@electric-sql/pglite-pgvector",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./data/seed/**/*",
      "./data/public-domain/**/*",
      "./packages/db/schema.sql",
    ],
  },
  outputFileTracingExcludes: {
    "/*": ["./data/user/**/*", "./work/**/*", "./.env*"],
  },
  devIndicators: false,
};
export default config;
