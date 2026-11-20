// Tiny static server for Vice Coast Cover Studio.
// Serves the app/ folder on port 8080 (or $PORT) so the editor can be
// opened in a browser. Node standard library only, no dependencies.

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "app");
const port = Number(process.env.PORT || 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const path = rawPath === "/" ? "/index.html" : rawPath;
  const file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(file)] || "application/octet-stream",
  });
  res.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`Vice Coast Cover Studio at http://localhost:${port}/`);
});
