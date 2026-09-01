// @hiveio/wax is mocked virtually so importing the Hive types never pulls WASM.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import {
  opTypeBucket,
  orderBucketsByShare,
  bucketOperations,
  bucketSharePercentages,
  totalBucketed,
  NON_VIRTUAL_BUCKET_ORDER,
  emptyBuckets,
  type OpBucket,
} from "@/utils/operationBuckets";

describe("opTypeBucket", () => {
  it("maps the four named protocol ops to their own buckets", () => {
    expect(opTypeBucket(0)).toBe("vote");
    expect(opTypeBucket(1)).toBe("comment");
    expect(opTypeBucket(2)).toBe("transfer");
    expect(opTypeBucket(18)).toBe("custom");
  });

  it("prefers an explicit is_virtual flag over the id heuristic", () => {
    // A node that reports a low-numbered op as virtual must win over the floor.
    expect(opTypeBucket(2, true)).toBe("virtual");
    // ...and the converse: a high id declared non-virtual is bucketed by id.
    expect(opTypeBucket(80, false)).toBe("other");
  });
});

describe("bucketOperations", () => {
  it("sums counts into the right buckets", () => {
    const result = bucketOperations([
      { op_type_id: 0, op_count: 42 },
      { op_type_id: 1, op_count: 11 },
      { op_type_id: 2, op_count: 3 },
      { op_type_id: 18, op_count: 7 },
      { op_type_id: 5, op_count: 2 },
      { op_type_id: 64, op_count: 9 },
    ]);
    expect(result).toEqual({
      vote: 42,
      comment: 11,
      transfer: 3,
      custom: 7,
      other: 2,
      virtual: 9,
    });
  });

  it("honours an is-virtual lookup when one is supplied", () => {
    const isVirtual = (id: number) => id === 2;
    const result = bucketOperations(
      [
        { op_type_id: 2, op_count: 5 },
        { op_type_id: 0, op_count: 1 },
      ],
      isVirtual
    );
    expect(result.virtual).toBe(5);
    expect(result.transfer).toBe(0);
    expect(result.vote).toBe(1);
  });
});

describe("orderBucketsByShare", () => {
  const of = (over: Partial<Record<OpBucket, number>>) => ({
    ...emptyBuckets(),
    ...over,
  });

  it("sorts the named buckets by share, largest first", () => {
    expect(
      orderBucketsByShare(of({ vote: 5, comment: 12, transfer: 1 }))
    ).toEqual(["comment", "vote", "transfer"]);
  });

  it("puts 'other' last even when it outweighs every named bucket", () => {
    expect(orderBucketsByShare(of({ other: 99, vote: 5, comment: 2 }))).toEqual(
      ["vote", "comment", "other"]
    );
  });
});

const sumShares = (shares: Partial<Record<OpBucket, number>>): number =>
  Object.values(shares).reduce((sum: number, value) => sum + (value ?? 0), 0);

describe("bucketSharePercentages", () => {
  it("adds up to exactly 100 where independent rounding would not", () => {
    const buckets = { ...emptyBuckets(), vote: 1, comment: 1, transfer: 1 };
    const shares = bucketSharePercentages(buckets, [
      "vote",
      "comment",
      "transfer",
    ]);
    const total = sumShares(shares);
    expect(total).toBe(100);
  });
});

describe("totalBucketed", () => {
  const buckets = {
    ...emptyBuckets(),
    vote: 4,
    comment: 3,
    virtual: 10,
  };

  // Both composition bars must share one denominator, excluding virtual ops.
  it("sums only the requested order when one is given", () => {
    expect(totalBucketed(buckets, NON_VIRTUAL_BUCKET_ORDER)).toBe(7);
  });
});
