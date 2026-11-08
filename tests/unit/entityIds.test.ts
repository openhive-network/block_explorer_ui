import { normalizeBlockId } from "@/utils/seo/entityIds";

describe("normalizeBlockId", () => {
  it("normalizes block numbers", () => {
    expect(normalizeBlockId("109518597")).toEqual({
      normalized: "109518597",
      kind: "number",
    });
    expect(normalizeBlockId("109,518,597")).toEqual({
      normalized: "109518597",
      kind: "number",
    });
    expect(normalizeBlockId("0").kind).toBe("invalid");
  });

  it("lowercases block hashes", () => {
    const hash = "06871F05D6B3BB9362835546B907D993619A912B";
    expect(normalizeBlockId(hash)).toEqual({
      normalized: hash.toLowerCase(),
      kind: "hash",
    });
  });

  // The date jump on the block page navigates to /block/<Date.toISOString()>.
  it("accepts the UTC timestamps the date jump produces, unchanged", () => {
    const iso = new Date(Date.UTC(2026, 8, 1)).toISOString();
    expect(normalizeBlockId(iso)).toEqual({ normalized: iso, kind: "time" });
    expect(normalizeBlockId("2026-09-01T00:00:00Z")).toEqual({
      normalized: "2026-09-01T00:00:00Z",
      kind: "time",
    });
  });

  it("rejects other text, including timestamps that are not UTC ISO", () => {
    expect(normalizeBlockId("not-a-block").kind).toBe("invalid");
    expect(normalizeBlockId("2026-09-01").kind).toBe("invalid");
    expect(normalizeBlockId("2026-09-01T00:00:00+02:00").kind).toBe("invalid");
    expect(normalizeBlockId("2026-13-45T99:99:99Z").kind).toBe("invalid");
    expect(normalizeBlockId("").kind).toBe("invalid");
  });

  // hafah errors on these, so they must 404 instead of rendering an error page.
  it("rejects dates that don't exist", () => {
    expect(normalizeBlockId("2026-02-30T00:00:00Z").kind).toBe("invalid");
    expect(normalizeBlockId("2026-09-01T24:00:00Z").kind).toBe("invalid");
    expect(normalizeBlockId("2026-09-01T12:60:00Z").kind).toBe("invalid");
    expect(normalizeBlockId("2024-02-29T00:00:00Z").kind).toBe("time");
  });

  it("accepts times from block 1 up to about now", () => {
    expect(normalizeBlockId("2016-03-24T16:05:00Z").kind).toBe("time");
    expect(normalizeBlockId("2016-03-24T16:04:59Z").kind).toBe("invalid");
    expect(normalizeBlockId("2010-01-01T00:00:00Z").kind).toBe("invalid");
    const now = Date.now();
    const at = (ms: number) => new Date(ms).toISOString();
    expect(normalizeBlockId(at(now + 60 * 60 * 1000)).kind).toBe("time");
    expect(normalizeBlockId(at(now + 2 * 24 * 60 * 60 * 1000)).kind).toBe(
      "invalid"
    );
    expect(normalizeBlockId("2099-01-01T00:00:00Z").kind).toBe("invalid");
  });
});
