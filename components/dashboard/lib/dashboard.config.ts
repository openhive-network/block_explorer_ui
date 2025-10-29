import { Layouts, Layout } from "react-grid-layout";

// --- Storage Keys ---
export const LAYOUT_STORAGE_KEY = "hivescan_dashboard_layout";
export const WIDGETS_STORAGE_KEY = "hivescan_dashboard_widgets";
export const WIDGET_STATES_STORAGE_KEY = "hivescan_dashboard_widget_states";

// --- Layout Constants ---
export const COLLAPSED_WIDGET_HEIGHT = 1.2;

export const EDITABLE_BREAKPOINTS = ['lg', 'xl'];

// --- Default Widgets ---
export const DEFAULT_WIDGETS: Array<{ i: string; type: string }> = [
  { i: "live-info-1", type: "live-info" }, 
  { i: "market-data-1", type: "market-data" },
  { i: "hive-price-chart-1", type: "hive-price-chart" }, 
  { i: "fund-and-supply-1", type: "fund-and-supply" },
  { i: "hive-params-1", type: "hive-parameters" }, 
  { i: "blockchain-dates-1", type: "blockchain-dates" },
  { i: "last-blocks-1", type: "last-blocks" }, 
  { i: "tx-stats-1", type: "tx-stats" },
  { i: "searches-1", type: "searches" }, 
  { i: "top-witnesses-1", type: "top-witnesses" },
  { i: "top-communities-1", type: "top-communities" },
];

export const DEFAULT_MASTER_LAYOUT: Layout[] = [
  { i: "market-data-1", x: 0, y: 6, w: 2.95, h: 1.4, minW: 2, minH: 1 },
  { i: "hive-price-chart-1", x: 0, y: 7.4, w: 2.95, h: 7.2, minW: 2, minH: 0 },
  { i: "fund-and-supply-1", x: 0, y: 14.6, w: 2.95, h: 6, minW: 2, minH: 5.3 },
  { i: "hive-params-1", x: 0, y: 19.9, w: 2.95, h: 9.7, minW: 2, minH: 4 },
  { i: "blockchain-dates-1", x: 0, y: 27.7, w: 2.95, h: 5, minW: 2, minH: 4 },
  { i: "live-info-1", x: 0, y: 0, w: 2.95, h: 5.9, minW: 2, minH: 4 },
  { i: "last-blocks-1", x: 3, y: 0, w: 5.95, h: 9.4, minW: 5, minH: 7 },
  { i: "tx-stats-1", x: 3, y: 9.4, w: 5.95, h: 5.9, minW: 4, minH: 4 },
  { i: "searches-1", x: 3, y: 15.3, w: 5.95, h: 11, minW: 4, minH: 11 },
  { i: "top-witnesses-1", x: 9, y: 0, w: 3, h: 25.8, minW: 3, minH: 8 },
  { i: "top-communities-1", x: 9, y: 15, w: 3, h: 5.8, minW: 3, minH: 5 },
];


export const DEFAULT_MOBILE_WIDGET_ORDER: string[] = [
  "live-info-1",
  "market-data-1",
  "hive-price-chart-1",
  "fund-and-supply-1",
  "hive-params-1",
  "blockchain-dates-1",
  "last-blocks-1",
  "tx-stats-1",
  "searches-1",
  "top-witnesses-1",
  "top-communities-1",
];


// --- Helper Function ---

/**
 * Generates responsive layouts using a custom, content-aware algorithm.
 * This function provides full control over the responsive behavior.
 * - lg/xl: Uses the master layout.
 * - md: Creates a balanced, content-aware 2-column layout using `minW` as a hint.
 * - sm/xs: Creates a single-column stacked layout.
 *
 * @param masterLayout The user's current customized layout.
 * @returns A `Layouts` object for all breakpoints.
 */
export const generateDerivedLayouts = (masterLayout: Layout[]): Layouts => {
  const colsMap: { [key: string]: number } = { lg: 12, md: 10, sm: 6, xs: 4 };
  const layouts: Layouts = { lg: masterLayout, xl: masterLayout };

  // Sort the master layout once for a predictable processing order.
  const sortedMaster = [...masterLayout].sort((a, b) => a.y - b.y || a.x - b.x);

  // --- Generate Tablet Layout ('md') ---
  const mdLayout: Layout[] = [];
  const mdColCount = 2;
  const mdColWidth = colsMap.md / mdColCount; // 10 / 2 = 5
  const yTops = Array(mdColCount).fill(0); // Tracks the bottom of each column: [0, 0]

  sortedMaster.forEach(item => {
    const { minW, minH, ...restOfItem } = item;

    const isWide = minW && minW >= mdColWidth;

    if (isWide) {
      const y = Math.max(...yTops);
      mdLayout.push({ ...restOfItem, x: 0, y, w: colsMap.md });
      yTops.fill(y + item.h);
    } else {
      const shorterColIndex = yTops.indexOf(Math.min(...yTops));
      mdLayout.push({
        ...restOfItem,
        x: shorterColIndex * mdColWidth,
        y: yTops[shorterColIndex],
        w: mdColWidth,
      });
      yTops[shorterColIndex] += item.h;
    }
  });
  layouts.md = mdLayout;

  // --- Generate Mobile Layouts ('sm', 'xs') ---
  ['sm', 'xs'].forEach(bp => {
    let currentY = 0;
    layouts[bp] = sortedMaster.map(item => {
      const { minW, minH, ...restOfItem } = item;
      const newItem = {
        ...restOfItem,
        x: 0,
        y: currentY,
        w: colsMap[bp],
      };
      currentY += item.h;
      return newItem;
    });
  });

  return layouts;
};