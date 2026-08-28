// Wax formats amounts against the browser locale, so its output has to be
// restated in the app locale. The separators and digits are read from each
// locale rather than assumed, because "1.234,5" and "1,234.5" are the same
// number and guessing inflates the value by a factor of 1000.

interface LocaleNumbers {
  format: Intl.NumberFormat;
  group: string;
  decimal: string;
  minus: string;
  // Locale digit -> ASCII, for locales such as ar-EG that render Arabic-Indic.
  toAscii: Record<string, string>;
  // ASCII -> locale digit, indexed by value, to re-render the fraction.
  fromAscii: string[];
}

const probes = new Map<string, LocaleNumbers>();

const probe = (locale?: string): LocaleNumbers => {
  const key = locale ?? "";
  const cached = probes.get(key);
  if (cached) return cached;

  const format = new Intl.NumberFormat(locale);
  const partOf = (value: number, type: Intl.NumberFormatPartTypes) =>
    format.formatToParts(value).find((p) => p.type === type)?.value;

  const toAscii: Record<string, string> = {};
  const fromAscii: string[] = [];
  for (let d = 0; d <= 9; d++) {
    const rendered = partOf(d, "integer") ?? String(d);
    fromAscii[d] = rendered;
    if (rendered !== String(d)) toAscii[rendered] = String(d);
  }

  const probed: LocaleNumbers = {
    format,
    group: partOf(12345.6, "group") ?? "",
    decimal: partOf(12345.6, "decimal") ?? "",
    minus: partOf(-1, "minusSign") ?? "-",
    toAscii,
    fromAscii,
  };
  probes.set(key, probed);
  return probed;
};

/**
 * Re-render an amount Wax formatted in the browser locale using `locale`.
 * The unit suffix ("HP", "HBD", ...) is preserved untouched.
 * Returns the input unchanged when the numeric part cannot be read.
 */
export const relocalizeAmount = (formatted: string, locale: string): string => {
  const [amount, ...unit] = formatted.split(" ");
  if (!amount) return formatted;

  const source = probe();

  let normalized = amount;
  for (const [rendered, ascii] of Object.entries(source.toAscii)) {
    normalized = normalized.split(rendered).join(ascii);
  }
  if (source.group) normalized = normalized.split(source.group).join("");
  // Strip the separators Intl omits from formatToParts but browsers still emit.
  normalized = normalized.replace(/[\u00a0\u202f\u2009]/g, "");
  if (source.decimal && source.decimal !== ".")
    normalized = normalized.split(source.decimal).join(".");

  const parsed = /^(-?)(\d+)(?:\.(\d*))?$/.exec(normalized);
  if (!parsed) return formatted;

  const [, sign, integer, fraction = ""] = parsed;
  const target = probe(locale);

  // Wax formats the integer part through BigInt to stay exact, so the digits
  // are regrouped as a string: Number() drops them past 2^53, which a network
  // total of ~3.8e14 VESTS at six decimals is well beyond.
  const signed = BigInt(sign + integer);
  const grouped =
    sign && signed === BigInt(0)
      ? target.minus + target.format.format(signed)
      : target.format.format(signed);

  const rendered = fraction
    .split("")
    .map((digit) => target.fromAscii[Number(digit)] ?? digit)
    .join("");

  return [grouped + (fraction ? target.decimal + rendered : ""), ...unit].join(
    " "
  );
};
