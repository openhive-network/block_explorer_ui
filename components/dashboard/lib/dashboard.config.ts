import { Layouts, Layout } from "react-grid-layout";

// --- Storage Keys ---
export const LAYOUT_STORAGE_KEY = "hivescan_dashboard_layout";
export const WIDGETS_STORAGE_KEY = "hivescan_dashboard_widgets";
export const WIDGET_STATES_STORAGE_KEY = "hivescan_dashboard_widget_states";

export const COLLAPSED_WIDGET_HEIGHT = 1.2;
export const EDITABLE_BREAKPOINTS = ['lg', 'xl'];

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
  { i: "transfer-volume-1", type: "transfer-volume" },
  { i: "tvl-1", type: "tvl"},
];

const MOBILE_WIDGET_HEIGHTS: Record<string, number> = {
  "live-info-1": 6,
  "market-data-1": 1.4,
  "hive-price-chart-1": 7.2,
  "fund-and-supply-1": 5.8,
  "hive-params-1": 8.2,
  "blockchain-dates-1": 3.4,
  "last-blocks-1": 9.2,
  "tx-stats-1": 10.75,
  "transfer-volume-1": 10.25,
  "tvl-1": 6.7,
  "searches-1": 10.5,
  "top-witnesses-1": 25.8,
  "top-communities-1": 5,
};

export const DEFAULT_MASTER_LAYOUT: Layout[] = [
  { i: "market-data-1", x: 0, y: 6, w: 2.95, h: 1.4, minW: 2, minH: 1 },
  { i: "hive-price-chart-1", x: 0, y: 7.4, w: 2.95, h: 7.2, minW: 4, minH: 0 },
  { i: "fund-and-supply-1", x: 0, y: 14.6, w: 2.95, h: 5.3, minW: 2, minH: 5.3 },
  { i: "hive-params-1", x: 0, y: 19.9, w: 2.95, h: 7.6, minW: 2, minH: 4 },
  { i: "blockchain-dates-1", x: 0, y: 27.7, w: 2.95, h: 3.4, minW: 2, minH: 4 },
  { i: "live-info-1", x: 0, y: 0, w: 2.95, h: 6, minW: 2, minH: 4 },
  { i: "last-blocks-1", x: 3, y: 0, w: 5.95, h: 9.4, minW: 5, minH: 7 },
  { i: "tx-stats-1", x: 3, y: 9.4, w: 5.95, h: 5.8, minW: 4, minH: 4 },
  { i: "transfer-volume-1", x: 3, y: 15.3, w: 5.95, h: 5.8, minW: 4, minH: 4 },
  { i: "tvl-1", x: 3, y: 20.8, w: 5.95, h: 4.8, minW: 4, minH: 4.5 },
  { i: "searches-1", x: 3, y: 25.8, w: 5.95, h: 9, minW: 4, minH: 11 },
  { i: "top-witnesses-1", x: 9, y: 0, w: 3, h: 25.8, minW: 3, minH: 8 },
  { i: "top-communities-1", x: 9, y: 25.8, w: 3, h: 5.8, minW: 3, minH: 5 },
];

export const DEFAULT_MOBILE_WIDGET_ORDER: string[] = [
  "live-info-1",
  "market-data-1",
  "fund-and-supply-1",
  "hive-params-1",
  "blockchain-dates-1",
  "hive-price-chart-1",
  "last-blocks-1",
  "tx-stats-1",
  "transfer-volume-1",
  "tvl-1",  
  "top-witnesses-1",
  "top-communities-1",
  "searches-1",
];



export const generateDerivedLayouts = (masterLayout: Layout[]): Layouts => {
  const colsMap: { [key: string]: number } = { lg: 12, md: 10, sm: 6, xs: 4 };
  const layouts: Layouts = { lg: masterLayout, xl: masterLayout };

  const getMobileHeight = (item: Layout) => {
    // 1. If the item is currently collapsed, MUST return COLLAPSED_WIDGET_HEIGHT
    if (Math.abs(item.h - COLLAPSED_WIDGET_HEIGHT) < 0.1) {
      return COLLAPSED_WIDGET_HEIGHT;
    }
    
    // 2. Otherwise, use the Mobile Override height, or fallback to the item's current h
    return MOBILE_WIDGET_HEIGHTS[item.i] ?? item.h;
  };

  const sortedByMobileOrder = [...masterLayout].sort((a, b) => {
    const indexA = DEFAULT_MOBILE_WIDGET_ORDER.indexOf(a.i);
    const indexB = DEFAULT_MOBILE_WIDGET_ORDER.indexOf(b.i);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  // --- Generate Tablet Layout ('md') ---
  const mdLayout: Layout[] = [];
  const yTops = [0, 0];
  sortedByMobileOrder.forEach(item => {
    const targetH = getMobileHeight(item);
    const isWide = item.minW && item.minW >= 5;

    if (isWide) {
      const y = Math.max(...yTops);
      mdLayout.push({ ...item, x: 0, y, w: 10, h: targetH, minH: targetH });
      yTops.fill(y + targetH);
    } else {
      const col = yTops.indexOf(Math.min(...yTops));
      mdLayout.push({ ...item, x: col * 5, y: yTops[col], w: 5, h: targetH, minH: targetH });
      yTops[col] += targetH;
    }
  });
  layouts.md = mdLayout;

  // --- Generate Mobile Layouts ('sm', 'xs') ---
  ['sm', 'xs'].forEach(bp => {
    let currentY = 0;
    layouts[bp] = sortedByMobileOrder.map(item => {
      const targetH = getMobileHeight(item);
      const newItem = {
        ...item,
        x: 0,
        y: currentY,
        w: colsMap[bp],
        h: targetH,
        minH: targetH, 
      };
      currentY += targetH;
      return newItem;
    });
  });

  return layouts;
};