// Generate bundled help and accurate store drafts from the seven UI translations.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { translations, nativeNames } from "../web/groups-i18n.js";
const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const write = (p, s) => writeFileSync(new URL(p, root), s);
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const locales = {
  tr: "tr",
  en: "en-US",
  pt: "pt-BR",
  de: "de-DE",
  fr: "fr-FR",
  ja: "ja",
  ko: "ko",
};
const head = (title) =>
  `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${title}</title><link rel="stylesheet" href="pages.css"></head><body><main class="doc"><nav class="langs">${Object.entries(
    nativeNames,
  )
    .map(([l, n]) => `<a href="#${l}" hreflang="${l}">${n}</a>`)
    .join("")}</nav>`;
for (const page of ["privacy", "support"]) {
  let html = head(page);
  for (const [l, t] of Object.entries(translations)) {
    html += `<article lang="${l}" id="${l}"><a href="index.html#${l}">← ${esc(t.back)}</a><h1>${esc(t[page])}</h1><p class="meta">${esc(t.title)} · 2026-11-13 · Evren Altındal</p>`;
    if (page === "privacy")
      html += `<p>${esc(t.dataText)}</p><p>${esc(t.backupText)}</p><p>${esc(t.deleteAllConfirm)}</p>`;
    else
      html += `<p>${esc(t.aboutText)}</p><h2>${esc(t.rule)}</h2><p>${esc(t.roundHelp)}</p><p>${esc(t.randomHelp)}</p><p>${esc(t.balanceHelp)}</p><p>${esc(t.skipHelp)} ${esc(t.cancelHelp)}</p><h2>${esc(t.undo)}</h2><p>${esc(t.backupText)}</p>`;
    html += `<h2>${esc(t.support)}</h2><p><a href="https://ewocom.com/sirada-ne-var/oyna/support#${l}">Ewocom · ${esc(t.support)} ↗</a></p><h2>${esc(t.terms)}</h2><p>${esc(t.licenseText)}</p><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple Standard EULA</a></article>`;
  }
  write(
    `web/${page}.html`,
    html + '</main><script src="pages.js"></script></body></html>',
  );
}
// Keep old quick-choice data and the complete seven-language experience intact.
let quick = read("web/quick.html");
if (!quick.includes('id="groups-back"'))
  quick = quick.replace(
    "<body>",
    '<body><a id="groups-back" href="index.html" style="display:block;padding:16px 22px;font:600 16px system-ui;background:#20594a;color:#fff;text-decoration:none">← Sırada Ne Var?</a>',
  );
if (!quick.includes("document.getElementById('groups-back')?.setAttribute"))
  quick = quick.replace(
    "  const I18N = {",
    "  document.getElementById('groups-back')?.setAttribute('href', 'index.html' + location.hash);\n  const I18N = {",
  );
write("web/quick.html", quick);
const manifest = JSON.parse(read("web/manifest.webmanifest"));
manifest.description = translations.tr.tagline;
manifest.theme_color = "#20594a";
manifest.background_color = "#f5f4ed";
write("web/manifest.webmanifest", JSON.stringify(manifest, null, 2) + "\n");
const pkg = JSON.parse(read("package.json"));
pkg.version = "1.1.0";
pkg.description =
  "Persistent turns and task sharing for small groups, with an offline quick-choice wheel";
pkg.scripts.test = "node --test tests/*.test.mjs";
pkg.scripts.dev = "node scripts/serve.mjs";
pkg.scripts["release:docs"] = "node scripts/release-groups.js";
write("package.json", JSON.stringify(pkg, null, 2) + "\n");
const lock = JSON.parse(read("package-lock.json"));
lock.version = "1.1.0";
lock.packages[""].version = "1.1.0";
write("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
for (const [l, loc] of Object.entries(locales)) {
  const t = translations[l],
    dir = new URL(`store/groups-metadata/${loc}/`, root);
  mkdirSync(dir, { recursive: true });
  const body = [
    t.emptyHelp,
    t.groups,
    t.roundHelp,
    t.randomHelp,
    t.balanceHelp,
    t.skipHelp,
    t.cancelHelp,
    t.dataText,
    t.backupText,
  ].join("\n\n");
  writeFileSync(new URL("description.txt", dir), body + "\n");
  writeFileSync(new URL("promotional_text.txt", dir), t.tagline + "\n");
}
console.log(
  "Generated bundled help and seven-language metadata drafts. No online changes.",
);
