import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(
  new URL("../web/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
);
const types = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
http
  .createServer(async (req, res) => {
    try {
      const path = resolve(
        root,
        "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
      if (path !== root && !path.startsWith(root + sep)) throw Error();
      const file = path === root ? resolve(root, "index.html") : path;
      res.setHeader(
        "Content-Type",
        types[extname(file)] || "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  })
  .listen(8096, "127.0.0.1", () => console.log("http://127.0.0.1:8096"));
