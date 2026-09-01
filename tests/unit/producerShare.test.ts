// Unit tests for the producer-share aggregation on the blocks page.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  computeProducerShare,
  countMissedByProducer,
  producerBarScale,
  OTHER_PRODUCER_KEY,
} from "@/utils/producerShare";

const rows = (...producers: string[]) =>
  producers.map((producer_account, i) => ({
    block_num: i + 1,
    producer_account,
  }));

describe("computeProducerShare", () => {
  it("counts blocks per producer and sorts by count descending", () => {
    const share = computeProducerShare(
      rows("alice", "bob", "alice", "carol", "alice", "bob")
    );
    expect(share.map((s) => [s.producer, s.blocks])).toEqual([
      ["alice", 3],
      ["bob", 2],
      ["carol", 1],
    ]);
  });

  it("folds everything past the top N into a single Other row", () => {
    const share = computeProducerShare(
      rows("a", "a", "a", "b", "b", "c", "d", "e"),
      2
    );
    expect(share.map((s) => [s.producer, s.blocks])).toEqual([
      ["a", 3],
      ["b", 2],
      [OTHER_PRODUCER_KEY, 3],
    ]);
  });
});

describe("countMissedByProducer", () => {
  it("tallies a witness across separate gap blocks", () => {
    expect(
      countMissedByProducer({ 10: ["alice"], 25: ["bob", "alice"] })
    ).toEqual({ alice: 2, bob: 1 });
  });
});

describe("computeProducerShare with missed slots", () => {});

describe("witnesses that missed are never folded into Other", () => {
  it("lists a low-ranked witness that missed, instead of hiding it in Other", () => {
    // The consensus witnesses fill the top ranks and rarely miss; the ones that
    // do are backups producing a block or two, which topN would otherwise bury.
    const share = computeProducerShare(
      rows("a", "a", "a", "b", "b", "backup", "filler"),
      2,
      { backup: 2 }
    );
    const backup = share.find((s) => s.producer === "backup");
    expect(backup).toBeDefined();
    expect(backup?.blocks).toBe(1);
    expect(backup?.missed).toBe(2);
    expect(backup?.isOther).toBe(false);
  });
});

describe("producerBarScale", () => {
  it("covers the Other row when it outweighs every named producer", () => {
    // Nine witnesses on one block each past the top 2, against a top of 3.
    const share = computeProducerShare(
      rows(
        "a",
        "a",
        "a",
        "b",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k"
      ),
      2
    );
    expect(share.find((s) => s.isOther)?.blocks).toBe(9);
    expect(producerBarScale(share)).toBe(9);
  });
});
