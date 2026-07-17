import { Layouts, Layout } from "react-grid-layout";

// --- Storage Keys (per-user; suffixed with username to avoid cross-user pollution) ---
export const getLayoutStorageKey = (username: string) =>
  `hivescan_dashboard_layout_${username}`;
export const getWidgetsStorageKey = (username: string) =>
  `hivescan_dashboard_widgets_${username}`;
export const getWidgetStatesStorageKey = (username: string) =>
  `hivescan_dashboard_widget_states_${username}`;

export const COLLAPSED_WIDGET_HEIGHT = 1.1;
export const EDITABLE_BREAKPOINTS = ["lg", "xl"];

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
  { i: "top-accounts-1", type: "top-accounts" },
  { i: "top-communities-1", type: "top-communities" },
  { i: "transfer-volume-1", type: "transfer-volume" },
  { i: "tvl-1", type: "tvl" },
  { i: "network-hp-distribution-1", type: "network-hp-distribution" },
  { i: "top-holders-1", type: "top-holders" },
  { i: "network-growth-1", type: "network-growth" },
  { i: "daily-active-users-1", type: "daily-active-users" },
  { i: "account-retention-funnel-1", type: "account-retention-funnel" },
  { i: "network-author-retention-1", type: "network-author-retention" },
  { i: "op-mix-1", type: "op-mix" },
  { i: "network-rc-utilization-1", type: "network-rc-utilization" },
  { i: "network-engagement-1", type: "network-engagement" },
  { i: "voting-activity-1", type: "voting-activity" },
  { i: "hp-momentum-1", type: "hp-momentum" },
  { i: "network-content-volume-1", type: "network-content-volume" },
  { i: "network-dapp-usage-1", type: "network-dapp-usage" },
];

const MOBILE_WIDGET_HEIGHTS: Record<string, number> = {
  "live-info-1": 2,
  "market-data-1": 1.2,
  "hive-price-chart-1": 5.6,
  "fund-and-supply-1": 1,
  "hive-params-1": 1,
  "blockchain-dates-1": 1,
  "last-blocks-1": 7.4,
  "tx-stats-1": 10.75,
  "transfer-volume-1": 10.25,
  "tvl-1": 6.7,
  "network-hp-distribution-1": 6.7,
  "top-holders-1": 8,
  "network-growth-1": 5,
  "daily-active-users-1": 5,
  "account-retention-funnel-1": 5,
  "network-author-retention-1": 9,
  "op-mix-1": 5,
  "network-rc-utilization-1": 5,
  "network-engagement-1": 9,
  "voting-activity-1": 7.2,
  "hp-momentum-1": 12,
  "network-content-volume-1": 9,
  "network-dapp-usage-1": 13,
  "searches-1": 10.5,
  "top-witnesses-1": 13,
  "top-accounts-1": 12,
  "top-communities-1": 5,
};

export const DEFAULT_MASTER_LAYOUT: Layout[] = [
  // Left column
  { i: "live-info-1", x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 1 },
  { i: "market-data-1", x: 0, y: 3, w: 3, h: 1.4, minW: 2, minH: 1 },
  { i: "hive-price-chart-1", x: 0, y: 4.4, w: 3, h: 5.5, minW: 3, minH: 1 },
  { i: "hive-params-1", x: 0, y: 9.9, w: 3, h: 7, minW: 2, minH: 1 },
  { i: "blockchain-dates-1", x: 0, y: 16.9, w: 3, h: 3.4, minW: 2, minH: 1 },
  { i: "fund-and-supply-1", x: 0, y: 20.3, w: 3, h: 4.5, minW: 2, minH: 1 },
  { i: "voting-activity-1", x: 0, y: 24.8, w: 3, h: 5.8, minW: 2, minH: 4 },
  {
    i: "network-hp-distribution-1",
    x: 0,
    y: 30.6,
    w: 3,
    h: 7,
    minW: 2,
    minH: 5,
  },
  { i: "top-holders-1", x: 0, y: 37.6, w: 3, h: 8, minW: 2, minH: 3 },

  // Middle column
  { i: "last-blocks-1", x: 3, y: 0, w: 6, h: 8.3, minW: 5, minH: 8 },
  { i: "network-growth-1", x: 3, y: 8.3, w: 6, h: 3.3, minW: 3, minH: 3 },
  { i: "daily-active-users-1", x: 3, y: 11.6, w: 6, h: 3.3, minW: 3, minH: 3 },
  {
    i: "account-retention-funnel-1",
    x: 3,
    y: 14.9,
    w: 6,
    h: 3.3,
    minW: 3,
    minH: 3,
  },
  {
    i: "network-author-retention-1",
    x: 3,
    y: 18.2,
    w: 6,
    h: 8,
    minW: 3,
    minH: 4,
  },
  { i: "op-mix-1", x: 3, y: 23.2, w: 6, h: 3.3, minW: 3, minH: 3 },
  {
    i: "network-rc-utilization-1",
    x: 3,
    y: 26.5,
    w: 6,
    h: 3.3,
    minW: 3,
    minH: 3,
  },
  { i: "network-engagement-1", x: 3, y: 29.8, w: 6, h: 5, minW: 3, minH: 4 },
  { i: "tx-stats-1", x: 3, y: 34.8, w: 6, h: 5, minW: 3, minH: 4 },
  { i: "transfer-volume-1", x: 3, y: 39.8, w: 6, h: 5, minW: 3, minH: 4 },
  { i: "tvl-1", x: 3, y: 44.8, w: 6, h: 3, minW: 3, minH: 3 },
  { i: "hp-momentum-1", x: 3, y: 47.8, w: 6, h: 5, minW: 3, minH: 4 },
  {
    i: "network-content-volume-1",
    x: 3,
    y: 52.8,
    w: 6,
    h: 5,
    minW: 3,
    minH: 4,
  },
  { i: "network-dapp-usage-1", x: 3, y: 57.8, w: 6, h: 8, minW: 3, minH: 4 },
  { i: "searches-1", x: 3, y: 65.8, w: 6, h: 9, minW: 4, minH: 3 },

  // Right column
  { i: "top-witnesses-1", x: 9, y: 0, w: 3, h: 14, minW: 2, minH: 6 },
  { i: "top-accounts-1", x: 9, y: 14, w: 3, h: 11, minW: 2, minH: 11 },
  { i: "top-communities-1", x: 9, y: 25, w: 3, h: 5.8, minW: 2, minH: 5 },
];

export const DEFAULT_MOBILE_WIDGET_ORDER: string[] = [
  "live-info-1",
  "market-data-1",
  "hive-price-chart-1",
  "fund-and-supply-1",
  "hive-params-1",
  "blockchain-dates-1",
  "voting-activity-1",
  "network-hp-distribution-1",
  "top-holders-1",
  "last-blocks-1",
  "network-growth-1",
  "daily-active-users-1",
  "account-retention-funnel-1",
  "network-author-retention-1",
  "op-mix-1",
  "network-rc-utilization-1",
  "network-engagement-1",
  "tx-stats-1",
  "transfer-volume-1",
  "tvl-1",
  "hp-momentum-1",
  "network-content-volume-1",
  "network-dapp-usage-1",
  "top-witnesses-1",
  "top-accounts-1",
  "top-communities-1",
  "searches-1",
];

export const generateDerivedLayouts = (masterLayout: Layout[]): Layouts => {
  const colsMap: { [key: string]: number } = { lg: 12, md: 10, sm: 6, xs: 4 };
  const layouts: Layouts = { lg: masterLayout, xl: masterLayout };

  const getMobileHeight = (item: Layout) => {
    // 1. If the item is currently collapsed, MUST return COLLAPSED_WIDGET_HEIGHT
    if (Math.abs(item.h - COLLAPSED_WIDGET_HEIGHT) < 0.2) {
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
  sortedByMobileOrder.forEach((item) => {
    const targetH = getMobileHeight(item);
    const isWide = item.minW && item.minW >= 5;

    if (isWide) {
      const y = Math.max(...yTops);
      mdLayout.push({ ...item, x: 0, y, w: 10, h: targetH, minH: targetH });
      yTops.fill(y + targetH);
    } else {
      const col = yTops.indexOf(Math.min(...yTops));
      mdLayout.push({
        ...item,
        x: col * 5,
        y: yTops[col],
        w: 5,
        h: targetH,
        minH: targetH,
      });
      yTops[col] += targetH;
    }
  });
  layouts.md = mdLayout;

  // --- Generate Mobile Layouts ('sm', 'xs') ---
  ["sm", "xs"].forEach((bp) => {
    let currentY = 0;
    layouts[bp] = sortedByMobileOrder.map((item) => {
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
