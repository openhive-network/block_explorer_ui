// Classes are spelled out: Tailwind cannot see a computed `bg-${hue}-500`.

export type AccentKey =
  | "indigo"
  | "teal"
  | "amber"
  | "blue"
  | "violet"
  | "emerald"
  | "rose"
  | "slate";

export interface AccentTokens {
  spine: string;
  chip: string;
  text: string;
  // Flat rather than a gradient, so it needs no RTL flip.
  wash: string;
  ring: string;
  dot: string;
  hover: string;
}

export const ACCENTS: Record<AccentKey, AccentTokens> = {
  indigo: {
    spine: "bg-indigo-500",
    chip: "bg-indigo-500/10 dark:bg-indigo-400/15",
    text: "text-indigo-600 dark:text-indigo-300",
    wash: "bg-indigo-500/[0.045] dark:bg-indigo-400/[0.07]",
    ring: "border-indigo-200/80 dark:border-indigo-500/25",
    dot: "bg-indigo-500",
    hover: "hover:bg-indigo-500/20 dark:hover:bg-indigo-400/25",
  },
  teal: {
    spine: "bg-teal-500",
    chip: "bg-teal-500/10 dark:bg-teal-400/15",
    text: "text-teal-700 dark:text-teal-300",
    wash: "bg-teal-500/[0.045] dark:bg-teal-400/[0.07]",
    ring: "border-teal-200/80 dark:border-teal-500/25",
    dot: "bg-teal-500",
    hover: "hover:bg-teal-500/20 dark:hover:bg-teal-400/25",
  },
  amber: {
    spine: "bg-amber-500",
    chip: "bg-amber-500/10 dark:bg-amber-400/15",
    text: "text-amber-700 dark:text-amber-300",
    wash: "bg-amber-500/[0.05] dark:bg-amber-400/[0.07]",
    ring: "border-amber-200/80 dark:border-amber-500/25",
    dot: "bg-amber-500",
    hover: "hover:bg-amber-500/20 dark:hover:bg-amber-400/25",
  },
  blue: {
    spine: "bg-sky-500",
    chip: "bg-sky-500/10 dark:bg-sky-400/15",
    text: "text-sky-700 dark:text-sky-300",
    wash: "bg-sky-500/[0.045] dark:bg-sky-400/[0.07]",
    ring: "border-sky-200/80 dark:border-sky-500/25",
    dot: "bg-sky-500",
    hover: "hover:bg-sky-500/20 dark:hover:bg-sky-400/25",
  },
  violet: {
    spine: "bg-violet-500",
    chip: "bg-violet-500/10 dark:bg-violet-400/15",
    text: "text-violet-700 dark:text-violet-300",
    wash: "bg-violet-500/[0.045] dark:bg-violet-400/[0.07]",
    ring: "border-violet-200/80 dark:border-violet-500/25",
    dot: "bg-violet-500",
    hover: "hover:bg-violet-500/20 dark:hover:bg-violet-400/25",
  },
  emerald: {
    spine: "bg-emerald-500",
    chip: "bg-emerald-500/10 dark:bg-emerald-400/15",
    text: "text-emerald-700 dark:text-emerald-300",
    wash: "bg-emerald-500/[0.045] dark:bg-emerald-400/[0.07]",
    ring: "border-emerald-200/80 dark:border-emerald-500/25",
    dot: "bg-emerald-500",
    hover: "hover:bg-emerald-500/20 dark:hover:bg-emerald-400/25",
  },
  rose: {
    spine: "bg-rose-500",
    chip: "bg-rose-500/10 dark:bg-rose-400/15",
    text: "text-rose-600 dark:text-rose-300",
    wash: "bg-rose-500/[0.045] dark:bg-rose-400/[0.07]",
    ring: "border-rose-200/80 dark:border-rose-500/25",
    dot: "bg-rose-500",
    hover: "hover:bg-rose-500/20 dark:hover:bg-rose-400/25",
  },
  slate: {
    spine: "bg-slate-500",
    chip: "bg-slate-500/10 dark:bg-slate-400/15",
    text: "text-slate-600 dark:text-slate-300",
    wash: "bg-slate-500/[0.04] dark:bg-slate-400/[0.06]",
    ring: "border-slate-200 dark:border-slate-600/40",
    dot: "bg-slate-500",
    hover: "hover:bg-slate-500/20 dark:hover:bg-slate-400/25",
  },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

// hasOwnProperty, not `in`: `in` walks the prototype chain, so a stored accent
// of "toString" would resolve to a function instead of falling back.
export const resolveAccent = (value: unknown): AccentTokens =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(ACCENTS, value)
    ? ACCENTS[value as AccentKey]
    : ACCENTS.indigo;

// Raw values for the accent picker and thumbnails, which cannot use a class.
export const ACCENT_HEX: Record<AccentKey, string> = {
  indigo: "#6366f1",
  teal: "#14b8a6",
  amber: "#f59e0b",
  blue: "#0ea5e9",
  violet: "#8b5cf6",
  emerald: "#10b981",
  rose: "#f43f5e",
  slate: "#64748b",
};
