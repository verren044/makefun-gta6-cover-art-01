// Entry point for the gta6-cover-art-01 submission.
// Copies the app and the screenshots beside this file into the output
// directory and writes dossier.json with the vendored make.fun library.
// Works with no arguments and no environment variables: bare `node main.ts`
// writes to /output, and $MAKEFUN_OUTPUT_DIR overrides the destination.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Fail loudly instead of shipping a half-empty bundle: a missing app or
// screenshots folder means the build step before this one did not run.
for (const needed of ["app", "screenshots"]) {
  if (!existsSync(join(here, needed))) {
    throw new Error(`missing ${needed}/ beside main.ts — nothing to bundle`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
console.log(`Wrote dossier to ${join(out, "dossier.json")}`);
