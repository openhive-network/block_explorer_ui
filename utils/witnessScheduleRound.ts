export interface RoundBlockRange {
  fromBlock: number;
  toBlock: number;
}

// next_shuffle_block_num is set to head plus one slot per scheduled witness, so
// the round starts that many blocks before it. Null while anything is unknown.
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
