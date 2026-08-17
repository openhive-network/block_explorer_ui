import {
  ACCENTS,
  ACCENT_KEYS,
  ACCENT_HEX,
  resolveAccent,
} from "@/components/dashboard/lib/accents";

describe("resolveAccent", () => {
  it("returns the matching token set for every shipped accent", () => {
    ACCENT_KEYS.forEach((key) => {
      expect(resolveAccent(key)).toBe(ACCENTS[key]);
    });
  });

  it("falls back to indigo for anything it does not ship", () => {
    ["nonsense", "", "INDIGO", undefined, null, 0, {}, []].forEach((value) => {
      expect(resolveAccent(value)).toBe(ACCENTS.indigo);
    });
  });

  // Accents travel in restored bundles, so prototype members must not resolve.
  it("falls back for prototype members rather than returning a non-token", () => {
    [
      "toString",
      "constructor",
      "valueOf",
      "hasOwnProperty",
      "__proto__",
    ].forEach((value) => {
      expect(resolveAccent(value)).toBe(ACCENTS.indigo);
    });
  });

  it("always yields a usable token set", () => {
    ["toString", "__proto__", "nope"].forEach((value) => {
      const accent = resolveAccent(value);
      expect(typeof accent.spine).toBe("string");
      expect(typeof accent.text).toBe("string");
      expect(typeof accent.chip).toBe("string");
    });
  });

  it("keeps the picker's key list free of prototype members", () => {
    expect(ACCENT_KEYS).toEqual(Object.keys(ACCENTS));
    expect(ACCENT_KEYS).not.toContain("toString");
    ACCENT_KEYS.forEach((key) =>
      expect(ACCENT_HEX[key]).toMatch(/^#[0-9a-f]{6}$/)
    );
  });
});
