// Anchored on the head block's producer rather than a slot number, so the strip
// stays in step with the head block the rest of the app renders. Deriving it
// from the chain's own slot counter instead put it up to two blocks ahead of the
// table. A witness appears once per round, so its position is unambiguous.
export const nextScheduledAfterProducer = (
  shuffledWitnesses: string[] | undefined,
  headProducer: string | undefined | null,
  futureShuffledWitnesses?: string[]
): string | null => {
  if (!shuffledWitnesses?.length || !headProducer) return null;

  const index = shuffledWitnesses.indexOf(headProducer);
  if (index === -1) return null;

  if (index < shuffledWitnesses.length - 1) {
    return shuffledWitnesses[index + 1] ?? null;
  }

  // Last slot: the chain has reshuffled, so wrapping this round would be wrong.
  return futureShuffledWitnesses?.[0] ?? null;
};

// The table trails the head by a block or two; past this the view is history,
// where a "next producer" means nothing.
export const HEAD_TOLERANCE_BLOCKS = 10;

export const isFollowingHead = (
  headBlockNumber: number | undefined,
  latestBlockNumber: number | undefined
): boolean =>
  typeof headBlockNumber === "number" &&
  typeof latestBlockNumber === "number" &&
  Math.abs(headBlockNumber - latestBlockNumber) <= HEAD_TOLERANCE_BLOCKS;

// The list only describes slots before the next shuffle; past it the chain has
// reordered and the names would be wrong.
export const isScheduleStale = (
  headBlockNumber: number | undefined,
  nextShuffleBlockNumber: number | undefined
): boolean =>
  typeof headBlockNumber === "number" &&
  typeof nextShuffleBlockNumber === "number" &&
  nextShuffleBlockNumber > 0 &&
  headBlockNumber >= nextShuffleBlockNumber;
