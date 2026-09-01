jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  HEAD_TOLERANCE_BLOCKS,
  isFollowingHead,
  isScheduleStale,
  nextScheduledAfterProducer,
} from "@/utils/nextScheduledWitness";

// A real round reads in production order and holds each witness once.
const ROUND = [
  "blocktrades",
  "therealwolf",
  "deathwing",
  "guiltyparties",
  "good-karma",
];

// A reshuffle reorders the same witnesses, so the next round starts elsewhere.
const NEXT_ROUND = [
  "gtg",
  "deathwing",
  "blocktrades",
  "good-karma",
  "therealwolf",
];

describe("nextScheduledAfterProducer", () => {
  it("names the witness after the one that produced the head block", () => {
    // Observed side by side with /schedule: therealwolf produced 109,503,313
    // and deathwing was next, not guiltyparties.
    expect(nextScheduledAfterProducer(ROUND, "therealwolf")).toBe("deathwing");
    expect(nextScheduledAfterProducer(ROUND, "blocktrades")).toBe(
      "therealwolf"
    );
  });

  // The chain reshuffles at the boundary, so the front of this round is wrong.
  it("takes the first name of the next round after the last slot", () => {
    expect(nextScheduledAfterProducer(ROUND, "good-karma", NEXT_ROUND)).toBe(
      "gtg"
    );
  });

  it("says nothing rather than guessing when the next round is unknown", () => {
    expect(nextScheduledAfterProducer(ROUND, "good-karma")).toBeNull();
    expect(nextScheduledAfterProducer(ROUND, "good-karma", [])).toBeNull();
  });
});

describe("isScheduleStale", () => {
  it("is stale once the head reaches the next shuffle", () => {
    expect(isScheduleStale(100, 100)).toBe(true);
    expect(isScheduleStale(101, 100)).toBe(true);
  });
});

describe("isFollowingHead", () => {
  const HEAD = 109_527_324;

  it("tolerates the block or two the table trails by", () => {
    expect(isFollowingHead(HEAD, HEAD)).toBe(true);
    expect(isFollowingHead(HEAD, HEAD - 2)).toBe(true);
    expect(isFollowingHead(HEAD, HEAD - HEAD_TOLERANCE_BLOCKS)).toBe(true);
  });

  it("rejects a view paged back into history", () => {
    expect(isFollowingHead(HEAD, HEAD - HEAD_TOLERANCE_BLOCKS - 1)).toBe(false);
    expect(isFollowingHead(HEAD, 100_000_000)).toBe(false);
  });
});
