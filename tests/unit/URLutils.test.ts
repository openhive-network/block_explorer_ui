import { dataToURL, URLToData, paramsShallowEqual } from "@/utils/URLutils";

describe("dataToURL", () => {
  it("returns null for null/undefined", () => {
    expect(dataToURL(null)).toBeNull();
    expect(dataToURL(undefined)).toBeNull();
  });

  it("returns null for empty arrays and empty strings", () => {
    expect(dataToURL([])).toBeNull();
    expect(dataToURL("")).toBeNull();
  });

  it("encodes a boolean array with the _h suffix", () => {
    expect(dataToURL([true, false, true])).toMatch(/_h$/);
  });

  it("joins string arrays with - and appends _s suffix", () => {
    expect(dataToURL(["a", "b", "c"])).toBe("a-b-c_s");
  });

  it("returns the first element for arrays of other types", () => {
    expect(dataToURL([7, 8, 9])).toBe(7);
  });

  it("encodes a Date as YYYY.MM.DD_HH.MM.SS", () => {
    const d = new Date(2026, 0, 5, 9, 8, 7);
    expect(dataToURL(d)).toBe("2026.01.05_09.08.07");
  });

  it("passes scalars through", () => {
    expect(dataToURL(42)).toBe(42);
    expect(dataToURL("hello")).toBe("hello");
  });
});

describe("URLToData", () => {
  it("parses numeric strings to numbers", () => {
    expect(URLToData("42")).toBe(42);
  });

  it("preserves unsafe-int strings as strings", () => {
    expect(URLToData("9007199254740993")).toBe("9007199254740993");
  });

  it("decodes a string-array suffix back into an array", () => {
    expect(URLToData("a-b-c_s")).toEqual(["a", "b", "c"]);
  });

  it("decodes a date string", () => {
    const result = URLToData("2026.01.05_09.08.07");
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2026);
  });

  it("returns the input unchanged when no encoding matches", () => {
    expect(URLToData("plain-text-value")).toBe("plain-text-value");
  });
});

describe("paramsShallowEqual", () => {
  it("returns true for identical objects", () => {
    expect(paramsShallowEqual({ a: 1, b: "x" }, { a: 1, b: "x" })).toBe(true);
  });

  it("returns false when keys differ", () => {
    expect(paramsShallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("returns false when values differ", () => {
    expect(paramsShallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("uses reference equality for nested objects (shallow only)", () => {
    const inner = { x: 1 };
    expect(paramsShallowEqual({ a: inner }, { a: inner })).toBe(true);
    expect(paramsShallowEqual({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false);
  });
});
