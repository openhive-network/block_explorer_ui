import { isBadActor, loadBadActors } from "@/utils/badActors";

// Watchmen has listed live exchange wallets before (Upbit, XT.com). None are on
// the shipped list today, so this checks the label exemption with a stand-in list.
jest.mock("@/utils/BadActorList", () => ({
  __esModule: true,
  default: ["upbitshotwallet1", "upbitshotwallet1a", "@SomeScammer"],
}));

describe("bad-actor list with a labelled account on it", () => {
  it("skips the labelled account and flags the rest", async () => {
    const badActors = await loadBadActors();
    expect(isBadActor(badActors, "upbitshotwallet1")).toBe(false);
    expect(isBadActor(badActors, "upbitshotwallet1a")).toBe(true);
    expect(isBadActor(badActors, "somescammer")).toBe(true);
    expect(badActors.size).toBe(2);
  });
});
