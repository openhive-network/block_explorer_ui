export interface RoundBlockRange {
  fromBlock: number;
  toBlock: number;
}

/**
 * Block span of the round currently on screen.
 *
 * `next_shuffle_block_num` is set to head + one slot per witness when the
 * schedule shuffles, so the round starts exactly `roundLength` blocks before
 * it - no observation needed, and unaffected by missed slots, which produce no
 * block and so consume no block number. The head block is recovered from the
 * blocks-left counter, which is that same shuffle point minus the head.
 *
 * Returns null while any input is still unknown, so callers can hold the query.
 */
export const currentRoundBlockRange = (
  nextShuffleBlockNumber: number,
  blocksLeftBeforeRefetch: number,
  roundLength: number
): RoundBlockRange | null => {
  if (
    !Number.isFinite(nextShuffleBlockNumber) ||
    !Number.isFinite(blocksLeftBeforeRefetch) ||
    !Number.isFinite(roundLength) ||
    nextShuffleBlockNumber <= 0 ||
    roundLength <= 0
  )
    return null;

  const fromBlock = nextShuffleBlockNumber - roundLength;
  const toBlock = nextShuffleBlockNumber - blocksLeftBeforeRefetch;

  if (fromBlock <= 0 || toBlock < fromBlock) return null;

  return { fromBlock, toBlock };
};
