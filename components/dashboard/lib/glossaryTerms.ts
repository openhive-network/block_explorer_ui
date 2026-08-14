export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export const TERM_SEPARATOR = /[:：﹕︓ː܃܄]/;

export const parseTerms = (raw: string): GlossaryEntry[] =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.search(TERM_SEPARATOR);
      return at === -1
        ? { term: line, meaning: "" }
        : {
            term: line.slice(0, at).trim(),
            meaning: line.slice(at + 1).trim(),
          };
    });
