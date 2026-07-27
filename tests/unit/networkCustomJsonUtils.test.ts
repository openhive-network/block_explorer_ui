// Unit tests for the pure shaping/formatting helpers behind the Network DApp
// Usage widget. @hiveio/wax is mocked virtually so importing the Hive types
// (via the util module) never pulls the WASM bundle.
jest.mock("@hiveio/wax", () => ({}), { virtual: true });

import type Hive from "@/types/Hive";
import {
  metricValue,
  formatBytes,
  formatMetricValue,
  isColoredCategory,
  getCategoryColor,
  foldCategories,
  buildCategorySlices,
  rowLabelFor,
  rowSubLabelFor,
  homepageFor,
  computeCustomJsonKpis,
  OTHER_COLOR,
} from "@/components/home/NetworkDappUsage/networkCustomJsonUtils";

const L = "en-US";
const OTHERS = "Others";

const row = (
  o: Partial<Hive.NetworkTopCustomJsonRow>
): Hive.NetworkTopCustomJsonRow => ({
  json_id: null,
  app_name: null,
  category: "",
  op_count: 0,
  op_bytes: 0,
  rc_estimate: 0,
  ...o,
});

describe("metricValue", () => {
  const r = row({ op_count: 5, op_bytes: 99, rc_estimate: 1000 });
  it("selects the field for each metric", () => {
    expect(metricValue(r, "ops")).toBe(5);
    expect(metricValue(r, "bytes")).toBe(99);
    expect(metricValue(r, "rc")).toBe(1000);
  });
});

describe("formatBytes", () => {
  it("handles zero / negatives", () => {
    expect(formatBytes(0, L)).toBe("0 B");
    expect(formatBytes(-10, L)).toBe("0 B");
  });
  it("scales units and rounds small values to 1 decimal", () => {
    expect(formatBytes(512, L)).toBe("512 B");
    expect(formatBytes(1024, L)).toBe("1 KB");
    expect(formatBytes(1536, L)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024, L)).toBe("1 MB");
    // >=10 in a non-byte unit drops the decimal
    expect(formatBytes(15 * 1024 * 1024, L)).toBe("15 MB");
  });
});

describe("formatMetricValue", () => {
  it("groups ops as integers for the locale", () => {
    expect(formatMetricValue(1234567, "ops", L)).toBe("1,234,567");
  });
  it("delegates bytes to formatBytes", () => {
    expect(formatMetricValue(2048, "bytes", L)).toBe("2 KB");
  });
  it("returns a string for rc", () => {
    expect(typeof formatMetricValue(1e12, "rc", L)).toBe("string");
  });
});

describe("category palette", () => {
  it("isColoredCategory only for the fixed named categories", () => {
    expect(isColoredCategory("Gaming")).toBe(true);
    expect(isColoredCategory("DeFi & Tokens")).toBe(true);
    expect(isColoredCategory("Uncategorized")).toBe(false);
    expect(isColoredCategory("")).toBe(false);
  });
  it("getCategoryColor falls back to the neutral OTHER color", () => {
    expect(getCategoryColor("Gaming", false)).toBe("#0072B2");
    expect(getCategoryColor("Gaming", true)).toBe("#3f97d8");
    expect(getCategoryColor("Uncategorized", false)).toBe(OTHER_COLOR.light);
    expect(getCategoryColor("Uncategorized", true)).toBe(OTHER_COLOR.dark);
  });
});

describe("rowLabelFor / rowSubLabelFor", () => {
  const r = row({
    json_id: "sm_sell_cards",
    app_name: "Splinterlands",
    category: "Gaming",
  });
  it("labels by the grouping dimension", () => {
    expect(rowLabelFor(r, "id")).toBe("sm_sell_cards");
    expect(rowLabelFor(r, "app")).toBe("Splinterlands");
    expect(rowLabelFor(r, "category")).toBe("Gaming");
  });
  it("falls back when a field is missing", () => {
    expect(rowLabelFor(row({ app_name: "X" }), "id")).toBe("X");
    expect(rowLabelFor(row({}), "category")).toBe("—");
  });
  it("sublabel shows the app only in id mode when it differs from the id", () => {
    expect(rowSubLabelFor(r, "id")).toBe("Splinterlands");
    expect(rowSubLabelFor(r, "app")).toBeNull();
    expect(
      rowSubLabelFor(row({ json_id: "follow", app_name: "follow" }), "id")
    ).toBeNull();
  });
});

describe("foldCategories", () => {
  const cats = [
    row({ category: "Gaming", op_count: 100 }),
    row({ category: "DeFi & Tokens", op_count: 300 }),
    row({ category: "Uncategorized", op_count: 40 }),
    row({ category: "Weird New Cat", op_count: 10 }),
  ];
  it("folds non-palette categories into one Other row and preserves totals", () => {
    const out = foldCategories(cats, "ops", OTHERS);
    // 2 colored + 1 Other
    expect(out).toHaveLength(3);
    const other = out.find((r) => r.category === OTHERS)!;
    expect(other.op_count).toBe(50); // 40 + 10
    // colored sorted by metric desc
    expect(out[0].category).toBe("DeFi & Tokens");
    expect(out[1].category).toBe("Gaming");
    // grand total unchanged
    expect(out.reduce((s, r) => s + r.op_count, 0)).toBe(450);
  });
  it("no Other row when every category is in the palette", () => {
    const out = foldCategories(
      [row({ category: "Gaming", op_count: 1 })],
      "ops",
      OTHERS
    );
    expect(out.some((r) => r.category === OTHERS)).toBe(false);
  });
});

describe("buildCategorySlices", () => {
  it("returns coloured slices + Other, dropping zero-value slices", () => {
    const slices = buildCategorySlices(
      [
        row({ category: "Gaming", op_count: 60 }),
        row({ category: "Uncategorized", op_count: 40 }),
        row({ category: "NFTs", op_count: 0 }),
      ],
      "ops",
      false,
      OTHERS
    );
    const names = slices.map((s) => s.name);
    expect(names).toContain("Gaming");
    expect(names).toContain(OTHERS);
    expect(names).not.toContain("NFTs"); // zero filtered out
    expect(slices.find((s) => s.name === OTHERS)!.color).toBe(
      OTHER_COLOR.light
    );
    expect(slices.find((s) => s.name === "Gaming")!.value).toBe(60);
  });
});

describe("homepageFor", () => {
  const registry = [
    {
      app_id_pattern: "sm_",
      app_name: "Splinterlands",
      category: "Gaming",
      homepage: "https://splinterlands.com",
    },
  ] as Hive.CustomJsonAppRegistryRow[];
  it("joins by app_name", () => {
    expect(homepageFor(row({ app_name: "Splinterlands" }), registry)).toBe(
      "https://splinterlands.com"
    );
  });
  it("null when no match / no app / no registry", () => {
    expect(homepageFor(row({ app_name: "Other" }), registry)).toBeNull();
    expect(homepageFor(row({ app_name: null }), registry)).toBeNull();
    expect(
      homepageFor(row({ app_name: "Splinterlands" }), undefined)
    ).toBeNull();
  });
});

describe("computeCustomJsonKpis", () => {
  const cats = [
    row({ category: "Gaming", op_count: 60, op_bytes: 600, rc_estimate: 6000 }),
    row({
      category: "DeFi & Tokens",
      op_count: 40,
      op_bytes: 400,
      rc_estimate: 4000,
    }),
  ];
  it("returns null for empty input", () => {
    expect(computeCustomJsonKpis([], "ops")).toBeNull();
    expect(computeCustomJsonKpis(undefined, "ops")).toBeNull();
  });
  it("totals, top category and share follow the active metric", () => {
    const k = computeCustomJsonKpis(cats, "ops")!;
    expect(k.totalOps).toBe(100);
    expect(k.totalBytes).toBe(1000);
    expect(k.totalRc).toBe(10000);
    expect(k.topCategory).toBe("Gaming");
    expect(k.topCategoryShare).toBeCloseTo(60);
    expect(k.categoryCount).toBe(2);
  });
});
