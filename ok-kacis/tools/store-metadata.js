#!/usr/bin/env node
/*
 * store/listing.json'daki App Store metinlerini denetler ve fastlane'in
 * okuyacağı klasöre yazar: store/fastlane/metadata/<dil>/*.txt
 *
 *   node ok-kacis/tools/store-metadata.js                     # sadece denetle ve yaz
 *   node ok-kacis/tools/store-metadata.js --site https://ornek.com/ok-kacis
 *       # ayrıca gizlilik / destek / pazarlama adreslerini de yazar
 *
 * GitHub'daki "App Store sayfasını güncelle" iş akışı bunu kendisi çalıştırır.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const listing = JSON.parse(fs.readFileSync(path.join(ROOT, 'store', 'listing.json'), 'utf8'));
const OUT = path.join(ROOT, 'store', 'fastlane', 'metadata');

const LIMITS = { name: 30, subtitle: 30, promotionalText: 170, keywords: 100, description: 4000 };
const FILES = {
  name: 'name.txt',
  subtitle: 'subtitle.txt',
  promotionalText: 'promotional_text.txt',
  keywords: 'keywords.txt',
  description: 'description.txt',
};

const args = process.argv.slice(2);
const siteIdx = args.indexOf('--site');
let site = siteIdx >= 0 ? String(args[siteIdx + 1] || '').trim() : '';
if (site && !/^https:\/\/[^\s]+$/.test(site)) {
  console.error('--site https:// ile başlayan tam adres olmalı, girilen: ' + site);
  process.exit(1);
}
site = site.replace(/\/+$/, '');

const problems = [];
const report = [];
for (const [lang, locale] of Object.entries(listing.locales)) {
  const L = listing[lang];
  if (!L) {
    problems.push(`${lang}: metin yok`);
    continue;
  }
  const dir = path.join(OUT, locale);
  fs.mkdirSync(dir, { recursive: true });
  const row = [locale.padEnd(6)];
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = String(L[key] || '').trim();
    const len = [...value].length;
    if (!value) problems.push(`${locale}: ${key} boş`);
    if (len > max) problems.push(`${locale}: ${key} ${len}/${max} karakter, ${len - max} fazla`);
    if (key === 'keywords' && /,\s/.test(value)) problems.push(`${locale}: keywords virgülden sonra boşluk içermesin`);
    row.push(`${key} ${len}/${max}`);
    fs.writeFileSync(path.join(dir, FILES[key]), value + '\n');
  }
  if (site) {
    fs.writeFileSync(path.join(dir, 'privacy_url.txt'), `${site}/gizlilik.html\n`);
    fs.writeFileSync(path.join(dir, 'support_url.txt'), `${site}/#iletisim\n`);
    fs.writeFileSync(path.join(dir, 'marketing_url.txt'), `${site}/\n`);
  }
  report.push(row.join('  '));
}

console.log(report.join('\n'));
if (problems.length) {
  console.error('\nSORUNLAR:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log(`\nOK: ${Object.keys(listing.locales).length} dil yazıldı -> ${path.relative(process.cwd(), OUT)}` + (site ? ` (site: ${site})` : ''));
