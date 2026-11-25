/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import BulkLookupTool from "@/components/tools/BulkLookupTool";
import { BulkAccountRow } from "@/utils/bulkAccounts";

jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

jest.mock("@/components/ui/button", () => ({
  Button: ({
    variant: _variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button {...props} />
  ),
}));

// t() returns the key followed by its options, so the test sees which text is used.
jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({
    locale: "en-US",
    t: (key: string, options?: Record<string, string>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

let mockVestsMode = false;
jest.mock("@/contexts/SettingsContext", () => ({
  useSettings: () => ({
    settings: { displayVestHpMode: mockVestsMode ? "vests" : "hp" },
  }),
}));

jest.mock("@/utils/badActors", () => ({
  useBadActorsState: () => ({ list: new Set(["mallory"]), failed: false }),
  isBadActor: (list: Set<string>, name: string) => list.has(name),
}));

const mockDownload = jest.fn();
jest.mock("@/utils/csvDownload", () => ({
  downloadCsv: (...args: unknown[]) => mockDownload(...args),
}));

const row = (account: string, over: Partial<BulkAccountRow> = {}) => ({
  account,
  ownVests: 1000000,
  effectiveVests: 2000000,
  hive: 10,
  hbd: 1,
  savingsHive: 0,
  savingsHbd: 0,
  reputation: 60.4,
  lastActivity: new Date("2026-11-20T00:00:00Z"),
  created: new Date("2020-01-01T00:00:00Z"),
  ...over,
});

const mockLookups: string[][] = [];
jest.mock("@/hooks/api/common/useBulkAccounts", () => ({
  __esModule: true,
  default: (names: string[]) => {
    mockLookups.push(names);
    if (!names.length) return { isFetching: false, progress: 0 };
    return {
      data: {
        rows: names
          .filter((name) => name !== "ghost")
          .map((name) =>
            name === "bob"
              ? row("bob", { ownVests: 5000000, reputation: null })
              : row(name)
          ),
        notFound: names.filter((name) => name === "ghost"),
        hivePerVests: 0.0006,
        profilesFailed: false,
      },
      isFetching: false,
      isError: false,
      progress: names.length,
      refetch: jest.fn(),
    };
  },
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  mockVestsMode = false;
  mockLookups.length = 0;
  mockDownload.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<BulkLookupTool />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const byTestId = (id: string) =>
  container.querySelector(`[data-testid="${id}"]`);
const text = (id: string) => byTestId(id)?.textContent ?? "";

const lookUp = (value: string) => {
  const area =
    container.querySelector<HTMLTextAreaElement>("#bulk-lookup-names")!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    )!.set!.call(area, value);
    area.dispatchEvent(new Event("input", { bubbles: true }));
  });
  act(() => {
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};

const columnTexts = (index: number) =>
  Array.from(
    container.querySelectorAll(`[data-testid="bulk-lookup-table"] tbody tr`)
  ).map((tr) => tr.children[index]?.textContent ?? "");

describe("BulkLookupTool", () => {
  it("looks up the pasted names and lists what it couldn't find", () => {
    lookUp("alice, @Bob\nghost 1x mallory");
    expect(mockLookups).toContainEqual(["alice", "bob", "ghost", "mallory"]);
    expect(columnTexts(0)).toEqual(["@alice", "@bob", "@mallory"]);
    expect(text("bulk-lookup-not-found")).toContain("ghost");
    expect(text("bulk-lookup-invalid")).toContain("1x");
    expect(text("bulk-lookup-summary")).toContain('"found":"3"');
    expect(text("bulk-lookup-summary")).toContain(
      'tools.bulkLookup.flaggedCount {"count":"1"}'
    );
  });

  it("shows HP, or VESTS when the settings ask for it", () => {
    lookUp("alice");
    // 1,000,000 VESTS at 0.0006 HP each.
    expect(columnTexts(1)).toEqual(["⁦600.000⁩"]);
    act(() => root.unmount());
    mockVestsMode = true;
    root = createRoot(container);
    act(() => root.render(<BulkLookupTool />));
    lookUp("alice");
    expect(columnTexts(1)).toEqual(["⁦1,000,000.000000⁩"]);
  });

  it("sorts by a column, empty cells last, and back", () => {
    lookUp("alice bob mallory");
    const ownHeader = Array.from(container.querySelectorAll("th button")).find(
      (b) => b.textContent?.includes("column.ownPower")
    ) as HTMLButtonElement;
    act(() => ownHeader.click());
    expect(columnTexts(0)).toEqual(["@alice", "@mallory", "@bob"]);
    act(() => ownHeader.click());
    expect(columnTexts(0)).toEqual(["@bob", "@alice", "@mallory"]);
    act(() => ownHeader.click());
    expect(columnTexts(0)).toEqual(["@alice", "@bob", "@mallory"]);

    const repHeader = Array.from(container.querySelectorAll("th button")).find(
      (b) => b.textContent?.includes("column.reputation")
    ) as HTMLButtonElement;
    act(() => repHeader.click());
    act(() => repHeader.click());
    // bob has no reputation: last, even sorting high to low.
    expect(columnTexts(0)[2]).toBe("@bob");
  });

  it("drops an unticked column from the table and the CSV", () => {
    lookUp("alice mallory");
    const columnsBefore = container.querySelectorAll("thead th").length;
    const box = Array.from(
      container.querySelectorAll<HTMLInputElement>("fieldset input")
    ).find((input) =>
      input.parentElement?.textContent?.includes("column.hbd")
    )!;
    act(() => box.click());
    expect(container.querySelectorAll("thead th").length).toBe(
      columnsBefore - 1
    );

    const download = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("tools.bulkLookup.download")
    )!;
    act(() => download.click());
    expect(mockDownload).toHaveBeenCalledTimes(1);
    const [filename, rows, columns] = mockDownload.mock.calls[0];
    expect(filename).toMatch(/^hive-accounts-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(columns).not.toContain("tools.bulkLookup.column.hbd");
    expect(columns[0]).toBe("tools.bulkLookup.column.account");
    const ownColumn = columns[1];
    expect(rows[0][ownColumn]).toBe("600.000");
    expect(rows[1]["tools.bulkLookup.column.flagged"]).toBe(
      "tools.bulkLookup.flaggedYes"
    );
    expect(rows[0]["tools.bulkLookup.column.created"]).toBe(
      "2020-01-01T00:00:00.000Z"
    );
  });

  it("counts the names as they're typed and warns past the limit", () => {
    const area =
      container.querySelector<HTMLTextAreaElement>("#bulk-lookup-names")!;
    act(() => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )!.set!.call(
        area,
        Array.from({ length: 1003 }, (_, i) => `user${i}`).join("\n")
      );
      area.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(text("bulk-lookup-count")).toContain('"count":"1,000"');
    expect(container.textContent).toContain(
      'tools.bulkLookup.overLimit {"max":"1,000","count":"3"}'
    );
  });
});
