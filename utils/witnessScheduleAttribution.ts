export interface ScheduleRow {
  producerName: string;
  blockNumber: number | null;
}

// Between two slots with known blocks, every slot either produced one block or
// missed producing none, so `slots between - missed between === blocks between`.
// Spans that fail to balance are left alone rather than credited to the wrong
// account, and slots outside the outermost anchors are never touched.
export const fillAttributionGaps = <T extends ScheduleRow>(
  rows: T[],
  missedProducers: ReadonlySet<string>
): T[] => {
  const anchors: number[] = [];
  rows.forEach((row, index) => {
    if (row.blockNumber !== null) anchors.push(index);
  });
  if (anchors.length < 2) return rows;

  const filled = [...rows];
  let changed = false;

  for (let a = 0; a < anchors.length - 1; a++) {
    const from = anchors[a];
    const to = anchors[a + 1];
    if (to - from < 2) continue;

    const startBlock = rows[from].blockNumber as number;
    const endBlock = rows[to].blockNumber as number;
    if (endBlock <= startBlock) continue;

    const between: number[] = [];
    for (let index = from + 1; index < to; index++) between.push(index);

    const missedCount = between.filter((index) =>
      missedProducers.has(rows[index].producerName)
    ).length;

    if (between.length - missedCount !== endBlock - startBlock - 1) continue;

    let nextBlock = startBlock + 1;
    for (const index of between) {
      if (missedProducers.has(rows[index].producerName)) continue;
      filled[index] = { ...rows[index], blockNumber: nextBlock };
      nextBlock++;
      changed = true;
    }
  }

  return changed ? filled : rows;
};
