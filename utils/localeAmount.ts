// Wax formats amounts against the browser locale, so its output has to be
// restated in the app locale. The separators and digits are read from the
// browser locale rather than assumed, because "1.234,5" and "1,234.5" are the
// same number and guessing inflates the value by a factor of 1000.

const partsOf = (value: number) =>
  new Intl.NumberFormat(undefined).formatToParts(value);

const separator = (type: "group" | "decimal"): string =>
  partsOf(12345.6).find((p) => p.type === type)?.value ?? "";

// Locales such as ar-EG render Arabic-Indic digits, which Number() cannot read.
const digitMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (let d = 0; d <= 9; d++) {
    const rendered = partsOf(d).find((p) => p.type === "integer")?.value;
    if (rendered && rendered !== String(d)) map[rendered] = String(d);
  }
  return map;
};

/**
 * Re-render an amount Wax formatted in the browser locale using `locale`.
 * The unit suffix ("HP", "HBD", ...) is preserved untouched.
 * Returns the input unchanged when the numeric part cannot be read.
 */
export const relocalizeAmount = (formatted: string, locale: string): string => {
  const [amount, ...unit] = formatted.split(" ");
  if (!amount) return formatted;

  const group = separator("group");
  const decimal = separator("decimal");
  const digits = digitMap();

  let normalized = amount;
  for (const [rendered, ascii] of Object.entries(digits)) {
    normalized = normalized.split(rendered).join(ascii);
  }
  if (group) normalized = normalized.split(group).join("");
  // Strip the separators Intl omits from formatToParts but browsers still emit.
  normalized = normalized.replace(/[   ]/g, "");
  if (decimal && decimal !== ".")
    normalized = normalized.split(decimal).join(".");

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return formatted;

  const decimals = normalized.split(".")[1]?.length ?? 0;

  return [
    numeric.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    ...unit,
  ].join(" ");
};
