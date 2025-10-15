# Analytics Dashboard Feature

A modular, extensible, and persistent dashboard for displaying data analysis reports. This system allows users to add, remove, and arrange various report widgets in a responsive grid, with their layout saved across sessions.

## Table of Contents

1.  [Overview](#1-overview)
2.  [Core Architecture](#2-core-architecture)
3.  [Developer Guide: Adding a New Report](#3-developer-guide-adding-a-new-report)
4.  [Implemented Reports](#4-implemented-reports)
    -   [Influence Map Report](#41-influence-map-report)
5.  [External Resources & Documentation](#5-external-resources--documentation)

---

### 1. Overview

The dashboard is built using React and leverages several key libraries to provide a powerful and flexible user experience:

-   **`react-grid-layout`**: Powers the responsive, draggable, and resizable grid system.
-   **`echarts-for-react`**: Used for sophisticated and interactive data visualizations within report widgets.
-   **Custom React Hooks**: Encapsulate state management, data fetching, and persistence logic.

The core design principle is **modularity**. The dashboard is a generic container, and new reports can be plugged in with minimal effort by developers.

---

### 2. Core Architecture

The dashboard's functionality is divided among several key files, each with a specific responsibility.

-   **`useAnalyticsDashboardState.ts`**
    This hook is the brain of the dashboard. It manages the list of active `widgets` and their corresponding `layouts`. It persists this state to `localStorage`, ensuring a user's customized dashboard is remembered. It also exports the functions (`onAddWidget`, `onRemoveWidget`, `onLayoutChange`) needed to modify the dashboard state.

-   **`reportRegistry.ts`**
    This is the central configuration file and the key to the system's extensibility. It's an object that maps a unique report type string (e.g., `influenceMap`) to its configuration, which includes:
    1.  The React component to render.
    2.  A translation key for the report's title.
    3.  A `dataMap` that specifies which data sources the report requires.

-   **`AnalyticsTabContent.tsx`**
    This component is the **data orchestrator**. It determines which widgets are currently active and fetches only the necessary top-level data for them. It then assembles all fetched data into a single `dataSources` object that gets passed down to the main dashboard component.

-   **`AnalyticsDashboard.tsx`**
    This is the primary rendering component. It receives the widgets, layouts, and all available data. It iterates through the active widgets and uses the `reportRegistry` to dynamically render the correct report component, passing in only the specific data it needs based on its `dataMap`. It also renders the grid item "chrome" (draggable header, title, remove button).

-   **`ReportLibrary.tsx`**
    A simple UI component that reads from the `reportRegistry` to display a list of all available reports, allowing the user to add them to their dashboard.

---

### 3. Developer Guide: Adding a New Report

Follow these steps to create and integrate a new report into the dashboard.

#### Step 1: Create the Report Component

Create your new report file (e.g., `src/features/analytics/MyNewReport.tsx`). This component will receive a standard set of props from the `AnalyticsDashboard`:

-   `accountName: string`: The primary account being viewed.
-   `data: { [key: string]: any }`: An object containing the data you requested in the `dataMap`.
-   `liveDataEnabled: boolean`: Indicates if real-time updates are active.
-   `dynamicGlobalData: any`: Global blockchain data for calculations.

The component is responsible for its own rendering and any internal state, including fetching "drill-down" data if necessary.

#### Step 2: Define Data Requirements

Determine what top-level data your report needs. If it requires a new data source not already fetched in `AnalyticsTabContent.tsx`, you must add the corresponding data-fetching hook there and include its output in the `dataSources` object.

#### Step 3: Register the Report

This is the final step. Open `src/features/analytics/reportRegistry.ts` and add a new entry for your report.

```typescript
// src/features/analytics/reportRegistry.ts

import MyNewReport from "./MyNewReport"; // 1. Import your component

export const reportRegistry: ReportRegistry = {
  influenceMap: {
    // ... existing report configuration
  },

  // 2. Add your new report's configuration
  myNewReport: {
    // A unique key for your report
    component: MyNewReport,
    // A key for i18n translation
    titleKey: 'analyticsDashboard.myNewReportTitle',
    // Map prop names for your component to keys in the `dataSources` object
    dataMap: {
      delegations: 'outgoingVestingDelegations',
      someOtherData: 'newDataKeyFromStep2'
    }
  },
};
```

Your report will now automatically appear in the `ReportLibrary` and be ready to use.

---

### 4. Implemented Reports

#### 4.1 Influence Map Report

-   **Purpose**: To visually represent the flow of vesting delegations (influence) to and from a specific account.
-   **Technology**: Uses `ECharts` to render a force-directed graph.
-   **Features**:
    -   **Interactive Tree View**: The default mode. Users can click on nodes (accounts) to progressively expand the map, which triggers dynamic data fetching for the new nodes. Includes a "Load More" feature for accounts with many connections.
    -   **Expanded Circular View**: A static, high-level overview of the top N incoming and outgoing delegations, arranged in a circle. Ideal for an at-a-glance understanding of major relationships.
    -   **Data-Driven Visuals**: The size of nodes and thickness of links are scaled based on the delegation amount.
    -   **Dynamic Caching**: Caches delegation data for any expanded account to prevent redundant API calls.

---

### 5. External Resources & Documentation

For more detailed information on the libraries used, please refer to their official documentation:

-   **React Grid Layout**:
    -   [GitHub Repository (with demos)](https://github.com/react-grid-layout/react-grid-layout)
-   **ECharts**:
    -   [ECharts Official Website](https://echarts.apache.org/en/index.html)
    -   [ECharts Option Reference Guide](https://echarts.apache.org/en/option.html)
    -   [echarts-for-react GitHub](https://github.com/hustcc/echarts-for-react)
```