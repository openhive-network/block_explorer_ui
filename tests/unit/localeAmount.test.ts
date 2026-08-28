import { relocalizeAmount } from "@/utils/localeAmount";

describe("relocalizeAmount", () => {
  it("keeps every digit of a large VESTS balance exact", () => {
    // Number() would round these to ...123000 and ...600000 respectively.
    expect(relocalizeAmount("15,000,000,000,000.123456 VESTS", "en-US")).toBe(
      "15,000,000,000,000.123456 VESTS"
    );
    expect(relocalizeAmount("380,000,000,000,000.654321 VESTS", "en-US")).toBe(
      "380,000,000,000,000.654321 VESTS"
    );
  });

  it("stays exact past 2^53 in the integer part", () => {
    expect(relocalizeAmount("9,007,199,254,740,993 VESTS", "en-US")).toBe(
      "9,007,199,254,740,993 VESTS"
    );
  });

  it("restates browser separators in the app locale", () => {
    expect(relocalizeAmount("1,234,567.891 HIVE", "de-DE")).toBe(
      "1.234.567,891 HIVE"
    );
  });

  it("preserves leading zeros in the fraction", () => {
    expect(relocalizeAmount("1,000.000001 VESTS", "en-US")).toBe(
      "1,000.000001 VESTS"
    );
  });

  it("keeps trailing zeros rather than trimming the scale", () => {
    expect(relocalizeAmount("5.100 HBD", "en-US")).toBe("5.100 HBD");
  });

  it("applies the target locale's grouping rules", () => {
    expect(relocalizeAmount("12,345,678.9 HIVE", "en-IN")).toBe(
      "1,23,45,678.9 HIVE"
    );
  });

  it("renders the fraction in the target locale's digits", () => {
    const out = relocalizeAmount("1,204.507 HIVE", "ar-EG");
    expect(out.endsWith(" HIVE")).toBe(true);
    expect(out).toContain("\u0660"); // the zero survives into both parts
    expect(out).not.toMatch(/[0-9]/);
  });

  it("keeps the unit suffix and passes unreadable amounts through", () => {
    expect(relocalizeAmount("n/a HIVE", "en-US")).toBe("n/a HIVE");
    expect(relocalizeAmount("", "en-US")).toBe("");
  });

  it("keeps the sign on a negative amount that rounds to zero", () => {
    expect(relocalizeAmount("-0.5 HIVE", "en-US")).toBe("-0.5 HIVE");
  });
});
