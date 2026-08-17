import fs from "fs";
import path from "path";
import { WIDGET_LAYOUT_DEFAULTS } from "@/components/dashboard/lib/widgetLayoutDefaults";
import { ACCENTS } from "@/components/dashboard/lib/accents";
import {
  BOARD_TEMPLATES,
  BoardItem,
  MY_BOARD_KEY,
  i18nRef,
  isI18nRef,
  isUserRef,
  userRef,
} from "@/components/dashboard/templates";
import {
  boardItemId,
  captureBoard,
  clearBoardOrigin,
  clearBoardUndo,
  getActiveBoardStorageKey,
  getBoardOriginStorageKey,
  getBoardUndoStorageKey,
  isUntouchedAdoption,
  materializeTemplate,
  readActiveBoardKey,
  readBoardUndo,
  resolveBoard,
  resolveSeeds,
  writeActiveBoardKey,
  writeAllOrNothing,
} from "@/components/dashboard/lib/boardSlots";

// Echoes the key back so assertions can see which key was resolved.
const t = (key: string) => `t:${key}`;
const ctx = { t, username: "alice" };

describe("board templates", () => {
  // A type with layout defaults but no registry entry gets a size on the grid
  // and then renders as "widget not found", so both halves matter. The registry
  // is read as source: importing it would pull in every widget component.
  const registeredIds = (() => {
    const source = fs.readFileSync(
      path.join(__dirname, "../../components/dashboard/lib/widgetRegistry.ts"),
      "utf8"
    );
    const body = source.slice(source.indexOf("export const WIDGET_REGISTRY"));
    return new Set(
      Array.from(body.matchAll(/^ {2}"?([a-z][a-z0-9-]*)"?: \{$/gm)).map(
        (match) => match[1]
      )
    );
  })();

  it("only references widgets that exist in the registry", () => {
    // Guard against the extraction silently matching nothing.
    expect(registeredIds.size).toBeGreaterThan(20);

    const unknown: string[] = [];
    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        expect(WIDGET_LAYOUT_DEFAULTS[item.type]).toBeDefined();
        if (!registeredIds.has(item.type)) {
          unknown.push(`${board.key}/${item.type}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  // react-grid-layout silently clamps below the registry floors, reshaping the
  // board away from how it was authored.
  it("never sizes an item below its widget's minW/minH", () => {
    const violations: string[] = [];
    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        const min = WIDGET_LAYOUT_DEFAULTS[item.type];
        if (min?.minW !== undefined && item.w < min.minW) {
          violations.push(
            `${board.key}/${item.type} w=${item.w} < ${min.minW}`
          );
        }
        if (min?.minH !== undefined && item.h < min.minH) {
          violations.push(
            `${board.key}/${item.type} h=${item.h} < ${min.minH}`
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps every item inside the 12-column grid", () => {
    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        expect(item.x).toBeGreaterThanOrEqual(0);
        expect(item.x + item.w).toBeLessThanOrEqual(12);
      }
    }
  });

  // Columns must stack without gaps, but may end at different heights.
  it("stacks every column contiguously, leaving no gap inside a column", () => {
    const gaps: string[] = [];

    for (const board of BOARD_TEMPLATES) {
      const columns = new Map<number, typeof board.items>();
      for (const item of board.items) {
        columns.set(item.x, [...(columns.get(item.x) ?? []), item]);
      }

      for (const [x, items] of columns) {
        const sorted = [...items].sort((a, b) => a.y - b.y);
        sorted.forEach((item, index) => {
          if (index === 0) return;
          const previous = sorted[index - 1];
          const expected = previous.y + previous.h;
          // Heights are fractional, so exact equality fails on float error.
          if (Math.abs(item.y - expected) > 1e-6) {
            gaps.push(
              `${board.key} column ${x}: ${item.type} starts at ${item.y}, expected ${expected}`
            );
          }
        });
      }
    }

    expect(gaps).toEqual([]);
  });

  it("never overlaps two widgets", () => {
    const overlaps: string[] = [];
    // Same float tolerance as the contiguity check above.
    const EPS = 1e-6;
    const hits = (a: BoardItem, b: BoardItem) =>
      a.x < b.x + b.w - EPS &&
      b.x < a.x + a.w - EPS &&
      a.y < b.y + b.h - EPS &&
      b.y < a.y + a.h - EPS;

    for (const board of BOARD_TEMPLATES) {
      board.items.forEach((a, i) => {
        board.items.slice(i + 1).forEach((b) => {
          if (hits(a, b))
            overlaps.push(`${board.key}: ${a.type} over ${b.type}`);
        });
      });
    }

    expect(overlaps).toEqual([]);
  });

  // Full-width bands are confined to a masthead at the top: one lower down
  // forces every column to sync at that row, leaving a hole under short ones.
  it("keeps full-width bands in a masthead at the top of the board", () => {
    // Either a plate naming the board, or the reader's own account.
    const MASTHEAD = ["board-header", "profile-banner"];

    for (const board of BOARD_TEMPLATES) {
      const [first] = board.items;
      expect(MASTHEAD).toContain(first.type);
      expect({ x: first.x, y: first.y, w: first.w }).toEqual({
        x: 0,
        y: 0,
        w: 12,
      });

      const bands = board.items
        .filter((i) => i.w === 12)
        .sort((a, b) => a.y - b.y);
      let mastheadEnd = 0;
      for (const band of bands) {
        expect(band.y).toBeCloseTo(mastheadEnd);
        mastheadEnd = band.y + band.h;
      }

      for (const item of board.items.filter((i) => i.w !== 12)) {
        expect(item.y).toBeGreaterThanOrEqual(mastheadEnd - 1e-6);
      }
    }
  });

  it("keeps every accented item on the board's own accent", () => {
    const strays: string[] = [];
    for (const board of BOARD_TEMPLATES) {
      expect(ACCENTS[board.accent]).toBeDefined();
      for (const item of board.items) {
        const accent = item.state?.accent;
        if (accent !== undefined && accent !== board.accent) {
          strays.push(`${board.key}/${item.type}: ${String(accent)}`);
        }
      }
    }
    expect(strays).toEqual([]);
  });

  // Header, section rules and glossaries are seeded copy; a missing marker
  // ships an empty plate instead of a translated one.
  it("seeds every header, section rule and glossary through i18n markers", () => {
    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        if (item.type === "board-header") {
          expect(isI18nRef(item.state?.title)).toBe(true);
          expect(isI18nRef(item.state?.subtitle)).toBe(true);
        }
        if (item.type === "labeled-divider") {
          expect(isI18nRef(item.state?.label)).toBe(true);
          expect(isI18nRef(item.state?.hint)).toBe(true);
        }
        if (item.type === "glossary") {
          expect(isI18nRef(item.state?.terms)).toBe(true);
        }
      }
    }
  });

  // A link that is neither an in-app path nor valid http(s) renders as nothing.
  it("only seeds links the widgets will actually render", () => {
    const bad: string[] = [];
    const check = (board: string, url: unknown) => {
      const raw = isUserRef(url) ? url.$user : url;
      if (typeof raw !== "string") return bad.push(`${board}: ${String(url)}`);
      if (!raw.startsWith("/") && !/^https:\/\//.test(raw))
        bad.push(`${board}: ${raw}`);
    };

    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        if (item.type === "quick-links") {
          const links = item.state?.links as Array<{ url: unknown }>;
          expect(Array.isArray(links)).toBe(true);
          links.forEach((link) => check(board.key, link.url));
        }
        if (item.type === "button") check(board.key, item.state?.url);
      }
    }

    expect(bad).toEqual([]);
  });

  // Board buttons use the app's own styles; a seeded hex turned CTAs teal.
  it("never seeds a raw colour on a button", () => {
    const coloured: string[] = [];
    for (const board of BOARD_TEMPLATES) {
      for (const item of board.items) {
        if (item.state?.color !== undefined) {
          coloured.push(`${board.key}/${item.type}`);
        }
      }
    }
    expect(coloured).toEqual([]);
  });

  it("uses unique keys and non-empty item lists", () => {
    const keys = BOARD_TEMPLATES.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain(MY_BOARD_KEY);
    for (const board of BOARD_TEMPLATES) {
      expect(board.items.length).toBeGreaterThan(0);
    }
  });
});

describe("resolveSeeds", () => {
  it("translates markers anywhere in the structure and leaves the rest alone", () => {
    const seeds = {
      text: i18nRef("boards.x.note"),
      variant: "info",
      links: [{ label: i18nRef("boards.links.witnesses"), url: "/witnesses" }],
    };
    expect(resolveSeeds(seeds, ctx)).toEqual({
      text: "t:boards.x.note",
      variant: "info",
      links: [{ label: "t:boards.links.witnesses", url: "/witnesses" }],
    });
  });

  it("fills {user} into personal URLs, in-app and external", () => {
    const seeds = {
      url: userRef("/api/og/account/{user}"),
      links: [{ label: "blog", url: userRef("https://hive.blog/@{user}") }],
    };
    expect(resolveSeeds(seeds, ctx)).toEqual({
      url: "/api/og/account/alice",
      links: [{ label: "blog", url: "https://hive.blog/@alice" }],
    });
  });

  // Signed out there is no account, so it must not link to "/@undefined".
  it("resolves personal URLs to null when nobody is signed in", () => {
    expect(resolveSeeds(userRef("/@{user}"), { t })).toBeNull();
  });
});

describe("materializeTemplate", () => {
  const board = BOARD_TEMPLATES.find((b) => b.key === "governance")!;

  it("builds widgets, layout and seeded states that line up by id", () => {
    const slot = materializeTemplate(board);
    expect(slot.widgets).toHaveLength(board.items.length);
    expect(slot.masterLayout).toHaveLength(board.items.length);

    const ids = new Set(slot.widgets.map((w) => w.i));
    expect(ids.size).toBe(board.items.length); // no id collisions
    for (const item of slot.masterLayout) expect(ids.has(item.i)).toBe(true);
    for (const id of Object.keys(slot.widgetStates))
      expect(ids.has(id)).toBe(true);
  });

  it("carries the registry size floors onto every layout item", () => {
    const slot = materializeTemplate(board);
    for (const item of slot.masterLayout) {
      const type = slot.widgets.find((w) => w.i === item.i)!.type;
      const defaults = WIDGET_LAYOUT_DEFAULTS[type];
      expect(item.minW).toBe(defaults.minW);
      expect(item.minH).toBe(defaults.minH);
    }
  });

  // Storing the resolved string froze a board into the language it was applied
  // in, so the markers have to survive.
  it("stores seeds unresolved, so a board can follow a language change", () => {
    const slot = materializeTemplate(board);
    const header = Object.values(slot.widgetStates).find((state) =>
      isI18nRef(state?.title)
    );
    expect(header).toBeDefined();
    expect(isI18nRef(header.subtitle)).toBe(true);

    // ...and resolving it at render time still produces the copy.
    const resolved = resolveSeeds(header, ctx) as Record<string, string>;
    expect(resolved.title).toBe("t:boards.governance.title");
  });

  it("is deterministic, so re-applying replaces rather than duplicates", () => {
    expect(materializeTemplate(board)).toEqual(materializeTemplate(board));
    expect(boardItemId("governance", "top-holders", 8)).toBe(
      "governance-top-holders-8"
    );
  });
});

describe("resolveBoard", () => {
  it("materializes a template fresh from code every time", () => {
    const key = BOARD_TEMPLATES[0].key;
    const first = resolveBoard(key)!;
    const second = resolveBoard(key)!;

    expect(first.widgets.length).toBe(BOARD_TEMPLATES[0].items.length);
    expect(first).toEqual(second);
  });

  it("returns null for My board and for keys that ship no template", () => {
    expect(resolveBoard(MY_BOARD_KEY)).toBeNull();
    expect(resolveBoard("nope")).toBeNull();
  });
});

describe("captureBoard", () => {
  it("snapshots the lg master layout and ignores derived breakpoints", () => {
    const widgets = [{ i: "a", type: "live-info" }];
    const lg = [{ i: "a", x: 0, y: 0, w: 3, h: 2 }];
    const slot = captureBoard(
      widgets,
      { lg, sm: [{ i: "a", x: 0, y: 0, w: 6, h: 4 }] },
      { a: { isCollapsed: true } }
    );
    expect(slot.masterLayout).toEqual(lg);
    expect(slot.widgetStates).toEqual({ a: { isCollapsed: true } });
  });

  it("falls back to an empty master layout when lg is missing", () => {
    expect(captureBoard([], {}, {}).masterLayout).toEqual([]);
  });
});

describe("board view storage", () => {
  const memoryStorage = () => {
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    };
    return store;
  };

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it("scopes both keys to the user, so accounts cannot see each other's board", () => {
    expect(getActiveBoardStorageKey("alice")).toContain("alice");
    expect(getBoardUndoStorageKey("alice")).toContain("alice");
    expect(getActiveBoardStorageKey("alice")).not.toBe(
      getActiveBoardStorageKey("bob")
    );
    expect(getBoardUndoStorageKey("alice")).not.toBe(
      getBoardUndoStorageKey("bob")
    );
  });

  it("round-trips the active board key", () => {
    memoryStorage();
    writeActiveBoardKey("alice", BOARD_TEMPLATES[0].key);
    expect(readActiveBoardKey("alice")).toBe(BOARD_TEMPLATES[0].key);
  });

  it("falls back to My board when nothing is stored", () => {
    memoryStorage();
    expect(readActiveBoardKey("alice")).toBe(MY_BOARD_KEY);
  });

  // A template dropped from a release must not strand the user on a blank tab.
  it("falls back to My board for a template that no longer ships", () => {
    memoryStorage();
    writeActiveBoardKey("alice", "retired-board");
    expect(readActiveBoardKey("alice")).toBe(MY_BOARD_KEY);
  });

  it("round-trips an undo snapshot and clears it on demand", () => {
    const store = memoryStorage();
    const previous = captureBoard(
      [{ i: "a", type: "live-info" }],
      { lg: [{ i: "a", x: 0, y: 0, w: 3, h: 2 }] },
      { a: { isCollapsed: true } }
    );
    store.set(getBoardUndoStorageKey("alice"), JSON.stringify(previous));

    expect(readBoardUndo("alice")).toEqual(previous);
    clearBoardUndo("alice");
    expect(readBoardUndo("alice")).toBeNull();
  });

  // Adopt template A, change your mind, adopt template B: undo must still
  // return the user's own board, not template A.
  it("keeps the original snapshot while the board is an untouched adoption", () => {
    memoryStorage();
    const myBoard = captureBoard(
      [{ i: "mine", type: "my-wallet" }],
      { lg: [{ i: "mine", x: 0, y: 0, w: 3, h: 2 }] },
      {}
    );

    // First adoption snapshots the real board and records its origin.
    localStorage.setItem(
      getBoardUndoStorageKey("alice"),
      JSON.stringify(myBoard)
    );
    localStorage.setItem(getBoardOriginStorageKey("alice"), "creator");

    expect(isUntouchedAdoption("alice")).toBe(true);
    expect(readBoardUndo("alice")).toEqual(myBoard);

    // Editing the adopted board makes it the user's own work again.
    clearBoardOrigin("alice");
    expect(isUntouchedAdoption("alice")).toBe(false);
  });

  it("ignores a corrupt snapshot instead of throwing", () => {
    const store = memoryStorage();
    store.set(getBoardUndoStorageKey("alice"), "{not json");
    expect(readBoardUndo("alice")).toBeNull();

    store.set(getBoardUndoStorageKey("alice"), JSON.stringify({ widgets: 7 }));
    expect(readBoardUndo("alice")).toBeNull();
  });
});

describe("writeAllOrNothing", () => {
  const fakeStorage = (initial: Record<string, string>, failOn?: string) => {
    const store = new Map(Object.entries(initial));
    return {
      store,
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        if (k === failOn) {
          const err: any = new Error("QuotaExceededError");
          err.name = "QuotaExceededError";
          throw err;
        }
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
  };

  const install = (s: ReturnType<typeof fakeStorage>) => {
    (globalThis as any).localStorage = s;
    return s;
  };

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

  it("commits every entry when storage accepts them", () => {
    const s = install(fakeStorage({}));
    expect(
      writeAllOrNothing([
        ["a", "1"],
        ["b", "2"],
      ])
    ).toBe(true);
    expect(s.store.get("a")).toBe("1");
    expect(s.store.get("b")).toBe("2");
  });

  it("rolls earlier writes back when a later one fails", () => {
    const s = install(fakeStorage({ a: "old-a", b: "old-b" }, "c"));
    expect(
      writeAllOrNothing([
        ["a", "new-a"],
        ["b", "new-b"],
        ["c", "new-c"],
      ])
    ).toBe(false);
    expect(s.store.get("a")).toBe("old-a");
    expect(s.store.get("b")).toBe("old-b");
  });

  it("removes keys that did not exist before the failed write", () => {
    const s = install(fakeStorage({}, "second"));
    expect(
      writeAllOrNothing([
        ["first", "value"],
        ["second", "value"],
      ])
    ).toBe(false);
    expect(s.store.has("first")).toBe(false);
  });

  it("reports failure when the very first write is refused", () => {
    const s = install(fakeStorage({ only: "old" }, "only"));
    expect(writeAllOrNothing([["only", "new"]])).toBe(false);
    expect(s.store.get("only")).toBe("old");
  });
});
