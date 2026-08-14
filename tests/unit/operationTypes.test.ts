import { opTypeIdByName, opTypeIdsByName } from "@/utils/OperationTypes";
import Explorer from "@/types/Explorer";

const catalog = [
  { op_type_id: 2, operation_name: "transfer_operation", is_virtual: false },
  { op_type_id: 5, operation_name: "vote_operation", is_virtual: false },
  {
    op_type_id: 64,
    operation_name: "producer_reward_operation",
    is_virtual: true,
  },
  {
    op_type_id: 91,
    operation_name: "producer_missed_operation",
    is_virtual: true,
  },
] as unknown as Explorer.ExtendedOperationTypePattern[];

describe("opTypeIdByName", () => {
  it("resolves an operation to the id the catalog gave it", () => {
    expect(opTypeIdByName(catalog, "producer_missed_operation")).toBe(91);
  });

  it("does not confuse producer_missed with producer_reward", () => {
    expect(opTypeIdByName(catalog, "producer_reward_operation")).toBe(64);
    expect(opTypeIdByName(catalog, "producer_missed_operation")).not.toBe(
      opTypeIdByName(catalog, "producer_reward_operation")
    );
  });

  it("is undefined while the catalog is loading or lacks the operation", () => {
    expect(
      opTypeIdByName(undefined, "producer_missed_operation")
    ).toBeUndefined();
    expect(opTypeIdByName([], "producer_missed_operation")).toBeUndefined();
    expect(opTypeIdByName(catalog, "not_a_real_operation")).toBeUndefined();
  });
});

describe("opTypeIdsByName", () => {
  it("collects ids for every name it recognises", () => {
    expect(
      opTypeIdsByName(
        catalog,
        new Set(["transfer_operation", "vote_operation"])
      )
    ).toEqual([2, 5]);
  });

  it("accepts a plain array as well as a Set", () => {
    expect(opTypeIdsByName(catalog, ["vote_operation"])).toEqual([5]);
  });

  it("skips names the catalog does not carry", () => {
    expect(
      opTypeIdsByName(catalog, ["transfer_operation", "not_a_real_operation"])
    ).toEqual([2]);
  });

  it("returns an empty list rather than throwing on a missing catalog", () => {
    expect(opTypeIdsByName(undefined, ["transfer_operation"])).toEqual([]);
    expect(opTypeIdsByName(catalog, [])).toEqual([]);
  });
});
