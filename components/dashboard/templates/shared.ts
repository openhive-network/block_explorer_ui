import { LucideIcon } from "lucide-react";
import { AccentKey } from "@/components/dashboard/lib/accents";

// Translated when the board is applied, so copy follows the user's language.
export interface I18nRef {
  $t: string;
}
export const i18nRef = (key: string): I18nRef => ({ $t: key });
export const isI18nRef = (v: unknown): v is I18nRef =>
  typeof v === "object" && v !== null && typeof (v as I18nRef).$t === "string";

// Swapped for the signed-in account when the board renders.
export interface UserRef {
  $user: string;
}
export const userRef = (template: string): UserRef => ({ $user: template });
export const isUserRef = (v: unknown): v is UserRef =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as UserRef).$user === "string";

// Heights are starting values; dynamicHeight widgets resize to their content.
export interface BoardItem {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  state?: Record<string, unknown>;
}

export interface BoardTemplate {
  key: string;
  nameKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  accent: AccentKey;
  items: BoardItem[];
}

// The user's own board has no template; it is only ever what they made it.
export const MY_BOARD_KEY = "my-board";

// Full-width bands only work at the top: one lower down forces every column to
// sync at that row, leaving a hole under the shortest.
export const header = (
  key: string,
  icon: string,
  accent: AccentKey
): BoardItem => ({
  type: "board-header",
  x: 0,
  y: 0,
  w: 12,
  h: 2,
  state: {
    eyebrow: i18nRef(`boards.${key}.eyebrow`),
    title: i18nRef(`boards.${key}.title`),
    subtitle: i18nRef(`boards.${key}.subtitle`),
    icon,
    accent,
  },
});

export const section = (
  x: number,
  y: number,
  w: number,
  labelKey: string,
  hintKey: string,
  accent: AccentKey
): BoardItem => ({
  type: "labeled-divider",
  x,
  y,
  w,
  h: 1.4,
  state: {
    label: i18nRef(labelKey),
    hint: i18nRef(hintKey),
    accent,
  },
});
