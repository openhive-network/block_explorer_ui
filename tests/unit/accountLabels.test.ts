import { ACCOUNT_LABELS, resolveAccountLabel } from "@/utils/accountLabels";

describe("resolveAccountLabel", () => {
  it("labels a curated account", () => {
    expect(resolveAccountLabel("hive.fund")).toEqual({
      type: "treasury",
      label: "DHF",
      tooltipKey: "accountLabel.treasuryInfo",
      status: undefined,
    });
  });

  it("keeps the inactive status of a defunct exchange wallet", () => {
    expect(resolveAccountLabel("bittrex")?.status).toBe("inactive");
  });

  it("does not label an unknown account", () => {
    expect(resolveAccountLabel("somerandomuser")).toBeNull();
  });

  it("falls back to the witness label only when asked", () => {
    expect(resolveAccountLabel("somerandomuser", { isWitness: true })).toEqual({
      type: "witness",
      label: "",
      tooltipKey: "accountLabel.witnessInfo",
    });
  });

  // Account names come from the search box, so Object.prototype members must
  // not resolve as curated labels.
  it.each([
    "constructor",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "__proto__",
  ])("does not label the prototype member %s", (name) => {
    expect(resolveAccountLabel(name)).toBeNull();
  });

  it("still reports a prototype-named account as a witness", () => {
    expect(resolveAccountLabel("constructor", { isWitness: true })?.type).toBe(
      "witness"
    );
  });

  it("exposes no inherited keys on the label map", () => {
    expect(Object.getPrototypeOf(ACCOUNT_LABELS)).toBeNull();
    expect(ACCOUNT_LABELS["constructor"]).toBeUndefined();
  });
});
