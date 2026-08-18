import { parseDisplayOrChainDate, parseChainDate } from "@/utils/TimeUtils";

describe("parseDisplayOrChainDate", () => {
  // The chain sends no zone but means UTC. new Date() would read it as local
  // time, skewing every derived "x ago" by the viewer's offset.
  it("reads a zone-less chain timestamp as UTC", () => {
    const date = parseDisplayOrChainDate("2016-03-24T16:05:00");
    expect(date?.toISOString()).toBe("2016-03-24T16:05:00.000Z");
  });

  // useAccountDetails formats some fields before the widget sees them, and
  // new Date() on this shape is Invalid Date on Firefox and WebKit.
  it("reads the app's own display format as UTC", () => {
    const date = parseDisplayOrChainDate("2016/03/24 16:05:00 UTC");
    expect(date?.toISOString()).toBe("2016-03-24T16:05:00.000Z");
  });

  it("accepts the display format without the UTC suffix", () => {
    const date = parseDisplayOrChainDate("2016/03/24 16:05:00");
    expect(date?.toISOString()).toBe("2016-03-24T16:05:00.000Z");
  });

  // Both shapes must land on the same instant, or the same account shows two
  // different join dates depending on which hook fed the widget.
  it("agrees with parseChainDate on the raw form", () => {
    expect(parseDisplayOrChainDate("2016-03-24T16:05:00")?.getTime()).toBe(
      parseChainDate("2016-03-24T16:05:00")?.getTime()
    );
  });

  it("keeps an explicit zone rather than forcing UTC", () => {
    expect(
      parseDisplayOrChainDate("2016-03-24T16:05:00+02:00")?.toISOString()
    ).toBe("2016-03-24T14:05:00.000Z");
  });

  it("passes a Date through and rejects an invalid one", () => {
    const d = new Date("2020-01-01T00:00:00Z");
    expect(parseDisplayOrChainDate(d)).toBe(d);
    expect(parseDisplayOrChainDate(new Date("nope"))).toBeNull();
  });

  it("returns null for empty and unparseable input", () => {
    expect(parseDisplayOrChainDate(undefined)).toBeNull();
    expect(parseDisplayOrChainDate(null)).toBeNull();
    expect(parseDisplayOrChainDate("")).toBeNull();
    expect(parseDisplayOrChainDate("not a date")).toBeNull();
  });
});
