import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

describe("keepPreviousDataFor", () => {
  const sameAccount = (accountName: string) =>
    keepPreviousDataFor<string[]>(
      (previousKey) => previousKey[1] === accountName
    );

  it("keeps the previous rows for the same account (next page or filter)", () => {
    expect(
      sameAccount("gtg")(["row"], { queryKey: ["ops", "gtg", 2] })
    ).toEqual(["row"]);
  });

  it("drops them when the account changes, so its rows never show", () => {
    expect(
      sameAccount("blocktrades")(["row"], { queryKey: ["ops", "gtg", 1] })
    ).toBeUndefined();
  });

  it("has nothing to keep on the first load", () => {
    expect(sameAccount("gtg")(undefined, undefined)).toBeUndefined();
  });
});
