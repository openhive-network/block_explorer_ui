import { CompareSection, Side } from "./types";
import { CompareAccountData } from "./rowModel";
import { compareCellPair } from "./format";
import { winnerOf, sectionWins, overallWins } from "./scoring";

export interface CompareExportContext {
  a: CompareAccountData;
  b: CompareAccountData;
  sections: CompareSection[];
  rangeLabel: string;
  locale: string;
  t: (k: string) => string;
}

const rawValue = (
  row: CompareSection["rows"][number],
  side: Side
): number | null => {
  if (row.unavailable) return null;
  if (side === "a" ? row.aDisplayKey : row.bDisplayKey) return null;
  return side === "a" ? row.aValue : row.bValue;
};

const winnerLabel = (
  row: CompareSection["rows"][number],
  aCol: string,
  bCol: string,
  t: (k: string) => string
): string => {
  const w = winnerOf(row);
  if (w === "a") return aCol;
  if (w === "b") return bCol;
  if (w === "tie") return t("compare.tie");
  return "";
};

// Flat, human-readable rows for CSV — one row per metric, translated headers
// (per the "export headers translated" rule). Account columns are keyed by handle.
export const buildCompareExportRows = (
  ctx: CompareExportContext
): Record<string, string>[] => {
  const { a, b, sections, locale, t } = ctx;
  const colSection = t("compare.export.section");
  const colMetric = t("compare.export.metric");
  const colWinner = t("compare.export.winner");
  const aCol = `@${a.account}`;
  const bCol = `@${b.account}`;

  return sections.flatMap((s) =>
    s.rows.map((r) => {
      const cells = compareCellPair(r, locale, t);
      return {
        [colSection]: t(s.titleKey),
        [colMetric]: t(r.labelKey),
        [aCol]: cells.a,
        [bCol]: cells.b,
        [colWinner]: winnerLabel(r, aCol, bCol, t),
      };
    })
  );
};

// Structured JSON — keeps raw numbers alongside the display strings so the export
// is machine-usable, plus per-section and overall win tallies.
export const buildCompareExportJson = (ctx: CompareExportContext) => {
  const { a, b, sections, rangeLabel, locale, t } = ctx;
  return {
    generatedFor: { a: a.account, b: b.account },
    window: rangeLabel,
    overall: overallWins(sections),
    sections: sections.map((s) => ({
      id: s.id,
      title: t(s.titleKey),
      windowed: !!s.windowed,
      wins: sectionWins(s),
      rows: s.rows.map((r) => {
        const cells = compareCellPair(r, locale, t);
        return {
          metric: t(r.labelKey),
          format: r.format,
          // Bucket ranks are an ordering device, not data — label only.
          a: rawValue(r, "a"),
          b: rawValue(r, "b"),
          aDisplay: cells.a,
          bDisplay: cells.b,
          winner: winnerOf(r),
        };
      }),
    })),
  };
};
