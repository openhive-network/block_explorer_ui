export const OTHER_PRODUCER_KEY = "__other__";

export const DEFAULT_TOP_PRODUCERS = 10;

interface ProducerRow {
  producer_account: string;
  block_num?: number;
}

export interface ProducerShare {
  producer: string;
  blocks: number;
  percentage: number;
  isOther: boolean;
  missed: number;
}

export const countMissedByProducer = (
  missedProducersByBlock: Record<number, string[]>
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const producers of Object.values(missedProducersByBlock)) {
    for (const producer of producers) {
      if (!producer) continue;
      counts[producer] = (counts[producer] ?? 0) + 1;
    }
  }
  return counts;
};

// Includes Other: it aggregates the tail and often outweighs the top producer.
export const producerBarScale = (share: ProducerShare[]): number =>
  Math.max(1, ...share.map((entry) => entry.blocks));

export const computeProducerShare = (
  rows: ProducerRow[],
  topN: number = DEFAULT_TOP_PRODUCERS,
  missedByProducer: Record<string, number> = {}
): ProducerShare[] => {
  const counts = new Map<string, number>();
  let total = 0;

  for (const row of rows) {
    if (!row.producer_account) continue;
    counts.set(
      row.producer_account,
      (counts.get(row.producer_account) ?? 0) + 1
    );
    total += 1;
  }
  if (!total) return [];

  // Alphabetical tie-break keeps the order stable across live refetches.
  const ranked = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  const pct = (blocks: number) => Math.round((blocks / total) * 1000) / 10;

  const top: ProducerShare[] = ranked
    .slice(0, topN)
    .map(([producer, blocks]) => ({
      producer,
      blocks,
      percentage: pct(blocks),
      isOther: false,
      missed: missedByProducer[producer] ?? 0,
    }));

  // Consensus witnesses fill the top ranks and rarely miss; the ones that do
  // are low-ranked, so folding them into "Other" would hide the whole signal.
  const topNames = new Set(ranked.slice(0, topN).map(([producer]) => producer));
  const missedNames = Object.keys(missedByProducer).filter(
    (producer) => missedByProducer[producer] > 0 && !topNames.has(producer)
  );

  const flagged: ProducerShare[] = missedNames
    .sort(
      (a, b) => missedByProducer[b] - missedByProducer[a] || a.localeCompare(b)
    )
    .map((producer) => ({
      producer,
      blocks: counts.get(producer) ?? 0,
      percentage: pct(counts.get(producer) ?? 0),
      isOther: false,
      missed: missedByProducer[producer],
    }));

  const flaggedNames = new Set(missedNames);
  const remainder = ranked
    .slice(topN)
    .filter(([producer]) => !flaggedNames.has(producer))
    .reduce((sum, [, blocks]) => sum + blocks, 0);

  const other: ProducerShare[] = remainder
    ? [
        {
          producer: OTHER_PRODUCER_KEY,
          blocks: remainder,
          percentage: pct(remainder),
          isOther: true,
          missed: 0,
        },
      ]
    : [];

  return [...top, ...flagged, ...other];
};
