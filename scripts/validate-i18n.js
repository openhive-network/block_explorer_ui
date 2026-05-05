#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const I18N_DIR = path.join(__dirname, "..", "i18n");
const REFERENCE_LOCALE = "en";

function flatten(obj, prefix = "") {
  const out = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const k of flatten(value, next)) out.add(k);
    } else {
      out.add(next);
    }
  }
  return out;
}

function loadLocale(locale) {
  const file = path.join(I18N_DIR, `${locale}.json`);
  const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  return flatten(JSON.parse(raw));
}

const locales = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.basename(f, ".json"))
  .sort();

if (!locales.includes(REFERENCE_LOCALE)) {
  console.error(
    `Reference locale '${REFERENCE_LOCALE}.json' not found in ${I18N_DIR}`
  );
  process.exit(2);
}

const referenceKeys = loadLocale(REFERENCE_LOCALE);
let hasGaps = false;

for (const locale of locales) {
  if (locale === REFERENCE_LOCALE) continue;
  const keys = loadLocale(locale);
  const missing = [...referenceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !referenceKeys.has(k));
  if (missing.length || extra.length) {
    hasGaps = true;
    console.error(
      `\n[${locale}.json] missing ${missing.length}, extra ${extra.length}`
    );
    if (missing.length)
      console.error(
        "  missing:",
        missing.slice(0, 20).join(", ") +
          (missing.length > 20 ? `, …(+${missing.length - 20})` : "")
      );
    if (extra.length)
      console.error(
        "  extra:  ",
        extra.slice(0, 20).join(", ") +
          (extra.length > 20 ? `, …(+${extra.length - 20})` : "")
      );
  } else {
    console.log(`[${locale}.json] OK (${keys.size} keys)`);
  }
}

if (hasGaps) {
  console.error(
    `\nFAIL: locale files are out of sync with ${REFERENCE_LOCALE}.json`
  );
  process.exit(1);
}
console.log(
  `\nAll ${locales.length} locale files match ${REFERENCE_LOCALE}.json (${referenceKeys.size} keys).`
);
