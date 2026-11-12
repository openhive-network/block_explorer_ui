import Hive from "@/types/Hive";

// The hardfork whose rules a block was produced under. hived applies a
// hardfork at the end of its activation block, after that block's transactions
// (process_hardforks() in database::_apply_block), so the activation block
// still belongs to the previous era. HF0 covers everything from block 1.
// `hardforks` must be in activation order, as /hafbe-api/hardforks returns them.
export const hardforkForBlock = (
  hardforks: Hive.Hardfork[] | undefined,
  blockNum: number
): Hive.Hardfork | undefined => {
  let current: Hive.Hardfork | undefined;
  for (const hardfork of hardforks ?? []) {
    if (current && hardfork.block_num >= blockNum) break;
    current = hardfork;
  }
  return current;
};

// The API sends UTC times without a zone suffix.
export const hardforkDate = (hardfork: Hive.Hardfork): Date =>
  new Date(`${hardfork.timestamp}Z`);

// The largest whole unit that fits an era's length, so a 2-minute era (HF17,
// replaced 31 blocks later) doesn't read as "0 days".
export const eraDuration = (
  ms: number
): { value: number; unit: "day" | "hour" | "minute" } => {
  // Round before choosing the unit, so 59.6 minutes reads "1 hour", not "60 minutes".
  const minutes = Math.round(ms / 60000);
  const hours = Math.round(ms / 3600000);
  if (hours >= 24) return { value: Math.round(ms / 86400000), unit: "day" };
  if (minutes >= 60) return { value: hours, unit: "hour" };
  return { value: Math.max(1, minutes), unit: "minute" };
};

// Anchor id of a hardfork's row on /hardforks.
export const hardforkAnchor = (hardforkNum: number): string =>
  `hf-${hardforkNum}`;
