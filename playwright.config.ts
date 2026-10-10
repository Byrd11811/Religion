import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const e2ePort = 3100;
const e2eDataDirectory = mkdtempSync(path.join(tmpdir(), "atlas-e2e-"));

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 20000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${e2ePort}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${e2ePort}`,
    url: `http://127.0.0.1:${e2ePort}`,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      ...process.env,
      ATLAS_DATA_DIR: e2eDataDirectory,
      ATLAS_LLM_API_KEY: "",
      ATLAS_LLM_MODEL: "",
      ATLAS_LLM_BASE_URL: "",
    },
  },
});
