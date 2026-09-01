export const HIVE_SLOT_SECONDS = 3;

export interface SlotGapRow {
  block_num: number;
  created_at: Date | string;
}

export type UnknownDeltaReason =
  | "no-predecessor"
  | "non-consecutive"
  | "bad-timestamp";

export interface SlotDelta {
  blockNum: number;
  deltaSeconds: number | null;
  missedSlots: number;
  reason: UnknownDeltaReason | null;
}

const timestampOf = (value: Date | string): number => {
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(ms) ? NaN : ms;
};

// Rows arrive newest-first, so a row's predecessor is the next one along. A
// filtered set is sparse, so only consecutive block numbers can be measured.
export const computeSlotDeltas = (rows: SlotGapRow[]): SlotDelta[] =>
  rows.map((row, index) => {
    const previous = rows[index + 1];
    const unknown = (reason: UnknownDeltaReason): SlotDelta => ({
      blockNum: row.block_num,
      deltaSeconds: null,
      missedSlots: 0,
      reason,
    });

    if (!previous) return unknown("no-predecessor");
    if (row.block_num - previous.block_num !== 1)
      return unknown("non-consecutive");

    const current = timestampOf(row.created_at);
    const before = timestampOf(previous.created_at);
    if (Number.isNaN(current) || Number.isNaN(before))
      return unknown("bad-timestamp");

    const deltaSeconds = Math.round((current - before) / 1000);
    const missedSlots = Math.max(
      0,
      Math.round(deltaSeconds / HIVE_SLOT_SECONDS) - 1
    );

    return { blockNum: row.block_num, deltaSeconds, missedSlots, reason: null };
  });

// True only for an unbroken run, which is what the gap markers require.
export const isContiguousRange = (deltas: SlotDelta[]): boolean =>
  deltas.length > 1 &&
  deltas.slice(0, -1).every((delta) => delta.deltaSeconds !== null);
