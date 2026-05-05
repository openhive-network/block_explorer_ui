import {
  capitalizeFirst,
  addSpacesAndCapitalizeFirst,
  formatAccountName,
  numberToTimeString,
  trimAccountName,
  splitStringValue,
  changeHBDToDollarsDisplay,
  grabNumericValue,
  formatHash,
  asCsvString,
  isHiveAccountName,
} from "@/utils/StringUtils";

describe("capitalizeFirst", () => {
  it("uppercases the first character", () => {
    expect(capitalizeFirst("hello")).toBe("Hello");
  });

  it("leaves already-capitalized strings alone", () => {
    expect(capitalizeFirst("World")).toBe("World");
  });
});

describe("addSpacesAndCapitalizeFirst", () => {
  it("replaces all underscores with spaces and capitalizes", () => {
    expect(addSpacesAndCapitalizeFirst("transfer_to_vesting")).toBe(
      "Transfer to vesting"
    );
  });
});

describe("formatAccountName", () => {
  it("strips leading @ from a string", () => {
    expect(formatAccountName("@alice")).toBe("alice");
  });

  it("uses first element when given an array", () => {
    expect(formatAccountName(["@bob", "@carol"])).toBe("bob");
  });
});

describe("numberToTimeString", () => {
  it("zero-pads single digits", () => {
    expect(numberToTimeString(7)).toBe("07");
  });

  it("leaves double digits as-is", () => {
    expect(numberToTimeString(42)).toBe("42");
  });
});

describe("trimAccountName", () => {
  it("strips leading @", () => {
    expect(trimAccountName("@alice")).toBe("alice");
  });

  it("returns trimmed name unchanged when no @", () => {
    expect(trimAccountName("  bob  ")).toBe("bob");
  });
});

describe("splitStringValue", () => {
  it("returns the substring before the keyword", () => {
    expect(splitStringValue("123.456 HIVE", " HIVE")).toBe("123.456");
  });
});

describe("changeHBDToDollarsDisplay", () => {
  // NOTE: current implementation does `split(" ")[0].slice(0, -1)`, which drops
  // the last digit of the numeric portion. These tests pin actual behavior so
  // the bug surfaces explicitly — see utils/StringUtils.ts:122.
  it("strips the last digit of the numeric portion (current behavior)", () => {
    expect(changeHBDToDollarsDisplay("12.345 HBD")).toBe("12.34 $");
  });
});

describe("grabNumericValue", () => {
  it("extracts a clean number from a formatted string", () => {
    expect(grabNumericValue("1,234.56 HIVE")).toBeCloseTo(1234.56);
  });

  it("handles negative values", () => {
    expect(grabNumericValue("-42.5 HBD")).toBeCloseTo(-42.5);
  });

  it("treats trailing comma as decimal when it appears last", () => {
    expect(grabNumericValue("1.234,56")).toBeCloseTo(1234.56);
  });
});

describe("formatHash", () => {
  it("returns the first 10 characters", () => {
    expect(formatHash("abcdef0123456789")).toBe("abcdef0123");
  });
});

describe("asCsvString", () => {
  it('wraps a value in ="..." for spreadsheet safety', () => {
    expect(asCsvString("0123")).toBe('="0123"');
  });

  it("returns empty string for null/undefined", () => {
    expect(asCsvString(null)).toBe("");
    expect(asCsvString(undefined)).toBe("");
  });
});

describe("isHiveAccountName", () => {
  it("accepts a valid lowercase name", () => {
    expect(isHiveAccountName("alice")).toBe(true);
  });

  it("accepts names with hyphens and dots", () => {
    expect(isHiveAccountName("alice-bob.eth")).toBe(true);
  });

  it("rejects names that start with a digit", () => {
    expect(isHiveAccountName("1alice")).toBe(false);
  });

  it("rejects names shorter than 3 chars", () => {
    expect(isHiveAccountName("ab")).toBe(false);
  });

  it("rejects names longer than 16 chars", () => {
    expect(isHiveAccountName("abcdefghijklmnopq")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isHiveAccountName("")).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(isHiveAccountName("Alice")).toBe(false);
  });
});
