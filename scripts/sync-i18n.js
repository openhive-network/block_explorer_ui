#!/usr/bin/env node
/*
 * Backfill missing i18n keys in non-English locales with English values
 * and drop orphan keys not present in en.json. Run after adding new
 * strings to en.json so `npm run validate:i18n` (and CI) stays green
 * while real translations come in over time.
 *
 * Run: node scripts/sync-i18n.js
 *
 * After running, use `node scripts/find-untranslated.js` to see which
 * keys per locale still hold the English fallback.
 */
const fs = require("fs");
const path = require("path");

const I18N_DIR = path.join(__dirname, "..", "i18n");
const REFERENCE_LOCALE = "en";
const BOM = /^﻿/;

function readLocale(locale) {
  const file = path.join(I18N_DIR, `${locale}.json`);
  const raw = fs.readFileSync(file, "utf8");
  return {
    file,
    data: JSON.parse(raw.replace(BOM, "")),
    hadBom: BOM.test(raw),
  };
}

function writeLocale(file, data, hadBom) {
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(file, (hadBom ? "﻿" : "") + json);
}

const { data: enData } = readLocale(REFERENCE_LOCALE);
const enKeys = Object.keys(enData);

const locales = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"))
  .filter((l) => l !== REFERENCE_LOCALE)
  .sort();

let totalAdded = 0;
let totalDropped = 0;

for (const locale of locales) {
  const { file, data, hadBom } = readLocale(locale);
  let added = 0;
  let dropped = 0;

  // Rebuild strictly in en.json key order. Orphan keys (not in en.json) are
  // dropped — grep refs before each run if you want to be sure.
  const next = {};
  for (const k of enKeys) {
    if (k in data) {
      next[k] = data[k];
    } else {
      next[k] = enData[k];
      added++;
    }
  }
  for (const k of Object.keys(data)) {
    if (!(k in next)) dropped++;
  }

  writeLocale(file, next, hadBom);
  totalAdded += added;
  totalDropped += dropped;
  console.log(`${locale}: backfilled ${added}, dropped ${dropped} orphans`);
}

console.log(
  `\nDone. Backfilled ${totalAdded} missing keys with EN values, dropped ${totalDropped} orphans.`
);
