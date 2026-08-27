export interface RoundBlockRange {
  fromBlock: number;
  toBlock: number;
}

// next_shuffle_block_num is the round's last block, not the next round's first:
// the reshuffle runs as that block is applied. Null until the round has a block.
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

  const fromBlock = nextShuffleBlockNumber - roundLength + 1;
  const toBlock = nextShuffleBlockNumber - blocksLeftBeforeRefetch;

  if (fromBlock <= 0 || toBlock < fromBlock) return null;

  return { fromBlock, toBlock };
};
