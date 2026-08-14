import fs from "fs";
import path from "path";
import { parseTerms } from "@/components/dashboard/lib/glossaryTerms";

const LOCALES = [
  "en",
  "ar",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "ro",
  "zh",
];

const localeFile = (locale: string): Record<string, string> =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, `../../i18n/${locale}.json`), "utf8")
  );

describe("parseTerms", () => {
  it("splits on an ASCII colon", () => {
    expect(parseTerms("Witness: an account that produces blocks.")).toEqual([
      { term: "Witness", meaning: "an account that produces blocks." },
    ]);
  });

  it("splits on a fullwidth colon", () => {
    expect(parseTerms("见证人：产生区块的账户。")).toEqual([
      { term: "见证人", meaning: "产生区块的账户。" },
    ]);
  });

  it("keeps a colon that appears inside the definition", () => {
    expect(parseTerms("RC: credits: regenerate daily.")[0]).toEqual({
      term: "RC",
      meaning: "credits: regenerate daily.",
    });
  });

  it("treats a line with no separator as a term with no meaning", () => {
    expect(parseTerms("Just a heading")).toEqual([
      { term: "Just a heading", meaning: "" },
    ]);
  });

  it("drops blank lines and trims surrounding space", () => {
    expect(parseTerms("\n  A : one  \n\n  B：two \n")).toEqual([
      { term: "A", meaning: "one" },
      { term: "B", meaning: "two" },
    ]);
  });
});

describe("every shipped glossary parses into definitions", () => {
  it.each(LOCALES)("%s", (locale) => {
    const translations = localeFile(locale);
    const keys = Object.keys(translations).filter((k) =>
      k.endsWith("glossaryTerms")
    );
    expect(keys.length).toBeGreaterThan(0);

    const undefinedLines: string[] = [];
    for (const key of keys) {
      for (const entry of parseTerms(translations[key])) {
        if (!entry.meaning) undefinedLines.push(`${key}: ${entry.term}`);
      }
    }
    expect(undefinedLines).toEqual([]);
  });
});
