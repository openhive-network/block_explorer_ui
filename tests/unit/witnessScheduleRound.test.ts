import { currentRoundBlockRange } from "@/utils/witnessScheduleRound";

describe("currentRoundBlockRange", () => {
  it("recovers the head block from the blocks-left counter", () => {
    // Observed on /schedule: next shuffle 109,300,149 with 14 blocks left, and
    // the producing witness signing 109,300,135. Only toBlock is pinned by that
    // reading - fromBlock depends on the schedule length, which was not observed.
    expect(currentRoundBlockRange(109_300_149, 14, 21)?.toBlock).toBe(
      109_300_135
    );
    expect(currentRoundBlockRange(109_300_149, 14, 30)?.toBlock).toBe(
      109_300_135
    );
  });

  it("starts the round one schedule-length before the next shuffle", () => {
    // fromBlock tracks the length of current_shuffled_witnesses, never a
    // hard-coded round size: the two differ and only the list is authoritative.
    expect(currentRoundBlockRange(109_300_149, 14, 21)?.fromBlock).toBe(
      109_300_128
    );
    expect(currentRoundBlockRange(109_300_149, 14, 30)?.fromBlock).toBe(
      109_300_119
    );
  });

  it("spans a single block at the start of a round", () => {
    // Blocks-left equal to the round length means the round just began.
    expect(currentRoundBlockRange(1_000, 21, 21)).toEqual({
      fromBlock: 979,
      toBlock: 979,
    });
  });

  it("reaches the last block before the next shuffle", () => {
    expect(currentRoundBlockRange(1_000, 1, 21)).toEqual({
      fromBlock: 979,
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
