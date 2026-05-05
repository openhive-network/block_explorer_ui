#!/usr/bin/env node
/*
 * For each non-English locale, list keys whose value matches en.json.
 * Used to find untranslated/backfilled strings before a translation pass.
 *
 * Usage: node scripts/find-untranslated.js [locale]
 *   - no arg: list all locales
 *   - locale arg: emit JSON {key: enValue} for that locale only (for piping)
 */
const fs = require("fs");
const path = require("path");

const I18N_DIR = path.join(__dirname, "..", "i18n");
const BOM = /^﻿/;

function load(locale) {
  const raw = fs
    .readFileSync(path.join(I18N_DIR, `${locale}.json`), "utf8")
    .replace(BOM, "");
  return JSON.parse(raw);
}

const en = load("en");
const arg = process.argv[2];
const locales = arg
  ? [arg]
  : fs
      .readdirSync(I18N_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.basename(f, ".json"))
      .filter((l) => l !== "en")
      .sort();

if (arg) {
  const data = load(arg);
  const out = {};
  for (const [k, v] of Object.entries(en)) {
    if (data[k] === v) out[k] = v;
  }
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const locale of locales) {
    const data = load(locale);
    const matches = Object.keys(en).filter((k) => data[k] === en[k]);
    console.log(`${locale}: ${matches.length} keys identical to en`);
  }
}
