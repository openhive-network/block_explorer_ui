import { currentRoundBlockRange } from "@/utils/witnessScheduleRound";

describe("currentRoundBlockRange", () => {
  it("recovers the head block from the blocks-left counter", () => {
    // Observed on /schedule. Only toBlock is pinned by that reading; fromBlock
    // depends on the schedule length, which was not observed.
    expect(currentRoundBlockRange(109_300_149, 14, 21)?.toBlock).toBe(
      109_300_135
    );
    expect(currentRoundBlockRange(109_300_149, 14, 30)?.toBlock).toBe(
      109_300_135
    );
  });

  it("starts the round so the next shuffle block is its last slot", () => {
    // Tracks current_shuffled_witnesses, never a hard-coded round size.
    expect(currentRoundBlockRange(109_300_149, 14, 21)?.fromBlock).toBe(
      109_300_129
    );
    expect(currentRoundBlockRange(109_300_149, 14, 30)?.fromBlock).toBe(
      109_300_120
    );
  });

  it("spans exactly the round length when the round is complete", () => {
    const range = currentRoundBlockRange(1_000, 0, 21);
    expect(range).toEqual({ fromBlock: 980, toBlock: 1_000 });
    expect(range!.toBlock - range!.fromBlock + 1).toBe(21);
  });

  it("spans a single block once the round's first block lands", () => {
    expect(currentRoundBlockRange(1_000, 20, 21)).toEqual({
      fromBlock: 980,
      toBlock: 980,
    });
  });

  it("returns null before the round has produced a block", () => {
    // Blocks-left equal to the round length means the reshuffle just happened
    // and the head is still the previous round's last block.
    expect(currentRoundBlockRange(1_000, 21, 21)).toBeNull();
  });

  it("reaches the last block before the next shuffle", () => {
    expect(currentRoundBlockRange(1_000, 1, 21)).toEqual({
      fromBlock: 980,
      toBlock: 999,
    });
  });

  it("returns null before the schedule has loaded", () => {
    expect(currentRoundBlockRange(0, 0, 21)).toBeNull();
    expect(currentRoundBlockRange(1_000, 14, 0)).toBeNull();
  });

  it("returns null when the head sits before the round start", () => {
    // More blocks left than the round is long cannot describe a live round.
    expect(currentRoundBlockRange(1_000, 30, 21)).toBeNull();
  });

  it("returns null on non-finite input", () => {
    expect(currentRoundBlockRange(NaN, 14, 21)).toBeNull();
    expect(currentRoundBlockRange(1_000, NaN, 21)).toBeNull();
    expect(currentRoundBlockRange(1_000, 14, NaN)).toBeNull();
  });

  it("returns null rather than a negative range near the genesis block", () => {
    expect(currentRoundBlockRange(10, 2, 21)).toBeNull();
  });
});
