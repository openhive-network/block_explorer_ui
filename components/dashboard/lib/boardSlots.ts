import { Layout, Layouts } from "react-grid-layout";
import { WIDGET_LAYOUT_DEFAULTS } from "./widgetLayoutDefaults";
import {
  BoardTemplate,
  MY_BOARD_KEY,
  getBoardTemplate,
  isI18nRef,
  isUserRef,
} from "@/components/dashboard/templates";

// Local only: a view preference, never part of the synced bundle.
export const getActiveBoardStorageKey = (username: string) =>
  `hivescan_dashboard_active_board_${username}`;

// Local only: makes an accidental "set as my board" recoverable on this device.
export const getBoardUndoStorageKey = (username: string) =>
  `hivescan_board_undo_${username}`;

// Set while My board is still an untouched template copy, cleared on any edit.
export const getBoardOriginStorageKey = (username: string) =>
  `hivescan_board_adopted_from_${username}`;

export interface BoardSlot {
  widgets: Array<{ i: string; type: string }>;
  masterLayout: Layout[];
  widgetStates: Record<string, any>;
  /** Auto-add flags before an adoption forced them on, so undo restores them.
   *  Undo snapshots only; `null` records a key that was absent. */
  autoAddFlags?: Record<string, string | null>;
}

type TFunction = (key: string) => string;

export interface SeedContext {
  t: TFunction;
  username?: string;
}

// Resolved at render, not at store time, so boards follow a language switch.
export const resolveSeeds = (value: unknown, ctx: SeedContext): unknown => {
  if (isI18nRef(value)) return ctx.t(value.$t);
  if (isUserRef(value)) {
    return ctx.username ? value.$user.replace(/\{user\}/g, ctx.username) : null;
  }
  if (Array.isArray(value)) return value.map((v) => resolveSeeds(v, ctx));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveSeeds(v, ctx)])
    );
  }
  return value;
};

// Derived from the template rather than Date.now() so re-applying replaces
// widgets instead of stacking duplicates.
export const boardItemId = (templateKey: string, type: string, index: number) =>
  `${templateKey}-${type}-${index}`;

export function materializeTemplate(template: BoardTemplate): BoardSlot {
  const widgets: BoardSlot["widgets"] = [];
  const masterLayout: Layout[] = [];
  const widgetStates: Record<string, any> = {};

  template.items.forEach((item, index) => {
    const id = boardItemId(template.key, item.type, index);
    const defaults = WIDGET_LAYOUT_DEFAULTS[item.type];
    widgets.push({ i: id, type: item.type });
    masterLayout.push({
      i: id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: defaults?.minW,
      minH: defaults?.minH,
    });
    if (item.state) widgetStates[id] = { ...item.state };
  });

  return { widgets, masterLayout, widgetStates };
}

export function captureBoard(
  widgets: BoardSlot["widgets"],
  layouts: Layouts,
  widgetStates: Record<string, any>
): BoardSlot {
  return {
    widgets,
    masterLayout: layouts.lg || [],
    widgetStates,
  };
}

// Templates are read-only, so a key only resolves to a fresh materialization.
export function resolveBoard(key: string): BoardSlot | null {
  const template = getBoardTemplate(key);
  return template ? materializeTemplate(template) : null;
}

export function readActiveBoardKey(username: string): string {
  try {
    const raw = localStorage.getItem(getActiveBoardStorageKey(username));
    if (!raw) return MY_BOARD_KEY;
    // A removed template must not strand the user on a blank tab.
    return raw === MY_BOARD_KEY || getBoardTemplate(raw) ? raw : MY_BOARD_KEY;
  } catch {
    return MY_BOARD_KEY;
  }
}

export function writeActiveBoardKey(username: string, key: string): void {
  try {
    localStorage.setItem(getActiveBoardStorageKey(username), key);
  } catch {
    // A lost tab preference is not worth failing the switch over.
  }
}

export function readBoardUndo(username: string): BoardSlot | null {
  try {
    const raw = localStorage.getItem(getBoardUndoStorageKey(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.widgets)) return null;
    return {
      widgets: parsed.widgets,
      masterLayout: Array.isArray(parsed.masterLayout)
        ? parsed.masterLayout
        : [],
      widgetStates: parsed.widgetStates ?? {},
      autoAddFlags:
        parsed.autoAddFlags && typeof parsed.autoAddFlags === "object"
          ? parsed.autoAddFlags
          : undefined,
    };
  } catch {
    return null;
  }
}

export function isUntouchedAdoption(username: string): boolean {
  try {
    return !!localStorage.getItem(getBoardOriginStorageKey(username));
  } catch {
    return false;
  }
}

// Called from every path that edits My board.
export function clearBoardOrigin(username: string): void {
  try {
    localStorage.removeItem(getBoardOriginStorageKey(username));
  } catch {
    // Best effort.
  }
}

// A wholesale replacement is the user's own board, so the view must follow it —
// otherwise a restore made while previewing a template lands on the template.
export function selectMyBoard(username: string): void {
  writeActiveBoardKey(username, MY_BOARD_KEY);
}

export function clearBoardUndo(username: string): void {
  try {
    localStorage.removeItem(getBoardUndoStorageKey(username));
  } catch {
    // Best effort.
  }
}

export function writeAllOrNothing(
  entries: Array<[string, string | null]>
): boolean {
  const previous = entries.map(
    ([key]) => [key, localStorage.getItem(key)] as const
  );
  try {
    for (const [key, value] of entries) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    return true;
  } catch {
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Best effort: the throw above already means storage is unwritable.
      }
    }
    return false;
  }
}
