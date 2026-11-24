// formatNumber's output is restated in the app's language by relocalizeAmount,
// which reads it in the browser's locale. Amounts too long for a Number used
// to come out with hard-coded "," and ".", which a decimal-comma browser could
// not read, so they stayed in English format next to localized ones (#878).

type Modules = {
  formatNumber: typeof import("@/lib/utils").formatNumber;
  relocalizeAmount: typeof import("@/utils/localeAmount").relocalizeAmount;
};

// Loads the modules as if the browser's locale were `browserLocale`: calls
// that pass no locale (Intl.NumberFormat(), toLocaleString()) get it instead.
const withBrowserLocale = (
  browserLocale: string,
  run: (m: Modules) => void
) => {
  const RealNumberFormat = Intl.NumberFormat;
  const realToLocaleString = Number.prototype.toLocaleString;
  const Patched = function (
    locales?: string | string[],
    options?: Intl.NumberFormatOptions
  ) {
    return new RealNumberFormat(locales ?? browserLocale, options);
  } as unknown as typeof Intl.NumberFormat;
  Object.assign(Patched, {
    supportedLocalesOf: RealNumberFormat.supportedLocalesOf,
    prototype: RealNumberFormat.prototype,
  });
  Intl.NumberFormat = Patched;
  Number.prototype.toLocaleString = function (
    this: number,
    locales?: string | string[],
    options?: Intl.NumberFormatOptions
  ) {
    return realToLocaleString.call(this, locales ?? browserLocale, options);
  };
  try {
    jest.isolateModules(() => {
      run({
        formatNumber: require("@/lib/utils").formatNumber,
        relocalizeAmount: require("@/utils/localeAmount").relocalizeAmount,
      });
    });
  } finally {
    Intl.NumberFormat = RealNumberFormat;
    Number.prototype.toLocaleString = realToLocaleString;
  }
};

// gtg's votes on 2026-11-20, in raw VESTS (6 implied decimals).
const LONG = "165944126347597857";
const SHORT = "52826894153469"; // 15 characters or fewer: the toLocaleString path

describe("formatNumber with long amounts (#878)", () => {
  it("renders them in the browser locale, like short ones", () => {
    withBrowserLocale("de-DE", ({ formatNumber }) => {
      expect(formatNumber(LONG, true)).toBe("165.944.126.347,597857");
      expect(formatNumber(SHORT, true)).toBe("52.826.894,153469");
      expect(formatNumber("-1234567890123456789", true)).toBe(
        "-1.234.567.890.123,456789"
      );
    });
  });

  it("so relocalizeAmount can read them in a decimal-comma browser", () => {
    withBrowserLocale("de-DE", ({ formatNumber, relocalizeAmount }) => {
      const vests = (raw: string, locale: string) =>
        relocalizeAmount(`${formatNumber(raw, true)} VESTS`, locale);
      expect(vests(LONG, "en")).toBe("165,944,126,347.597857 VESTS");
      expect(vests(LONG, "fr")).toBe("165 944 126 347,597857 VESTS");
      // The long and the short amount now come out in the same format.
      expect(vests(SHORT, "en")).toBe("52,826,894.153469 VESTS");
    });
  });

  it("keeps every digit, also with non-Latin digits", () => {
    withBrowserLocale("ar-EG", ({ formatNumber, relocalizeAmount }) => {
      const shown = formatNumber(LONG, true);
      expect(shown).not.toMatch(/[0-9]/);
      expect(relocalizeAmount(`${shown} VESTS`, "en")).toBe(
        "165,944,126,347.597857 VESTS"
      );
    });
  });

  it("reads negatives back in locales with their own minus sign", () => {
    for (const browser of ["sv-SE", "fi-FI", "ar-EG"])
      withBrowserLocale(browser, ({ formatNumber, relocalizeAmount }) => {
        const vests = (raw: string) =>
          relocalizeAmount(`${formatNumber(raw, true)} VESTS`, "en");
        expect(vests("-4838055429259156")).toBe("-4,838,055,429.259156 VESTS");
        expect(vests("-52826894153469")).toBe("-52,826,894.153469 VESTS");
      });
  });

  it("is unchanged in an English browser", () => {
    withBrowserLocale("en-US", ({ formatNumber }) => {
      expect(formatNumber(LONG, true)).toBe("165,944,126,347.597857");
      expect(formatNumber("1000000000000000000", true)).toBe(
        "1,000,000,000,000.000000"
      );
    });
  });

  it("leaves strings that aren't whole numbers as they were", () => {
    withBrowserLocale("de-DE", ({ formatNumber }) => {
      // Not a raw integer amount: the same output as before (malformed, but
      // callers never pass these), rather than a BigInt throw.
      expect(formatNumber("12345678901.23456789", true)).toBe(
        "12,345,678,901.23.456789"
      );
    });
  });
});
