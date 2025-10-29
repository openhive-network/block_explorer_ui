
---

# Dashboard Customization System Documentation

This document provides a comprehensive guide for developers working on the dashboard feature. It covers the architecture, file structure, and best practices for extending the system, such as adding new widgets and managing data performance.

## 1. Architectural Philosophy

The dashboard system is built on a strict **Separation of Concerns** principle. It is designed as a "conductor" that orchestrates various specialized parts, rather than a monolithic block of code. This makes it scalable, maintainable, and easy to reason about.

The architecture is built on four key pillars:

1.  **The Orchestrator (`pages/index.tsx`)**: The main page component. It knows *nothing* about the internal logic of any specific widget. Its sole responsibility is to connect the other pillars and render the final grid layout.
2.  **The UI State Manager (`useDashboard`)**: A custom hook that is the single source of truth for all UI and layout state. It handles the list of active widgets, their positions, edit mode, and all user actions that modify the layout.
3.  **The Data Provider (`useDashboardData`)**: A custom hook that acts as the central provider for all **server-side data** needed by widgets. It implements smart, conditional data fetching to optimize performance.
4.  **The Configuration Hub (`widgetRegistry.ts`)**: The "brain" of the system. This central file defines every available widget, its properties, and, crucially, how it gets its data. This decouples the page from the widgets themselves.

---

## 2. File Architecture

The `components/dashboard/` directory is structured to separate the dashboard's core machinery from the plug-and-play widgets.

```
components/dashboard/
├── hooks/
│   ├── useDashboard.ts          # Manages UI state, layout, persistence, and user actions.
│   └── useDashboardData.ts      # Fetches and provides all data needed by widgets.
│
├── lib/
│   ├── widgetRegistry.ts        # The central "brain". Defines all available widgets.
│   └── dashboard.config.ts      # Constants, default layouts, and storage keys.
│
├── ui/
│   ├── DashboardControls.tsx    # The UI bar with "Edit", "Add Widget", and "Reset" buttons.
│   ├── WidgetLibrary.tsx        # The modal for selecting and adding new widgets.
│   └── WidgetRenderer.tsx       # A simple component that renders a specific widget based on its type.
│
├── widgets/
│   ├── data/                    # Widgets that primarily display data from the blockchain/API.
│   │   ├── LiveInfoWidget.tsx
│   │   └── ...
│   └── layout/                  # Widgets for structuring content (titles, markdown, etc.).
│       ├── TitleWidget.tsx
│       └── ...
│

```

---

## 3. Developer Guide: How to Add a New Widget

There are two primary patterns for creating widgets, depending on how they fetch data.

### Scenario A: Widget with Centralized Data

This pattern is best for widgets that need data shared by other widgets or for which you want to pre-fetch data for a better user experience.

**Example:** Adding a new "Reward Pool" widget.

**Step 1: Create the Component**
Create a "dumb" component that only displays data passed via props.

*File: `components/dashboard/widgets/data/RewardPoolWidget.tsx`*
```tsx
interface RewardPoolWidgetProps {
  rewardData?: { reward_balance: string; };
  isLoading: boolean;
}

const RewardPoolWidget: React.FC<RewardPoolWidgetProps> = ({ rewardData, isLoading }) => {
  // ... render logic using props
};

export default RewardPoolWidget;
```

**Step 2: Add Data Fetching to `useDashboardData`**
Modify the central data hook to fetch the data for your new widget. Make sure to make it **conditional**.

*File: `components/dashboard/hooks/useDashboardData.ts`*
```typescript
export function useDashboardData(widgets: ActiveWidgetList) {
  // ...
  // Add a flag for your new widget
  const isRewardPoolActive = activeWidgetTypes.has('reward-pool');

  // Add the data fetching hook, controlled by the flag
  const { rewardPoolData, isRewardPoolLoading } = useRewardFund({ enabled: isRewardPoolActive });

  return {
    // ... other data
    rewardPoolData,
    isRewardPoolLoading,
  };
}
```

**Step 3: Register the Widget**
Add an entry for your new widget in the central registry. This is where you connect the data from `useDashboardData` to your component's props.

*File: `components/dashboard/lib/widgetRegistry.ts`*
```typescript
import RewardPoolWidget from "@/components/dashboard/widgets/data/RewardPoolWidget";

export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  // ... other widgets
  "reward-pool": {
    id: "reward-pool",
    name: "widgets.rewardPoolName", // Remember to add this to i18n files
    component: RewardPoolWidget,
    defaultLayout: { w: 3, h: 4 },
    getProps: (data) => ({
      // Map data from useDashboardData to the component's props
      rewardData: data.rewardPoolData,
      isLoading: data.isRewardPoolLoading,
    }),
  },
  // ...
};
```

### Scenario B: Widget with Internal Data Fetching

This pattern is best for highly specialized widgets that don't share data and can manage their own loading state.

**Example:** A `TransactionStatisticsCard` that fetches its own stats.

**Step 1: Create the Component with Internal Fetching**
The component is self-contained. It uses its own `useQuery` or `useEffect` to fetch data.

*File: `components/dashboard/widgets/data/TransactionStatisticsCard.tsx`*
```tsx
const TransactionStatisticsCard = () => {
  // This hook only runs when the component is mounted
  const { data, isLoading } = useQuery({ queryKey: ['tx-stats'], queryFn: fetchTxStats });

  if (isLoading) return <Spinner />;

  return (
    // ... render logic using the fetched data
  );
};

export default TransactionStatisticsCard;
```

**Step 2: Register the Widget**
The registration is simpler because you don't need a `getProps` function for server-side data.

*File: `components/dashboard/lib/widgetRegistry.ts`*
```typescript
import TransactionStatisticsCard from "@/components/dashboard/widgets/data/TransactionStatisticsCard";

export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  // ... other widgets
  "tx-stats": {
    id: "tx-stats",
    name: "widgets.txStatsName",
    component: TransactionStatisticsCard,
    defaultLayout: { w: 8, h: 5 },
    // No getProps needed for this data pattern!
  },
  // ...
};
```

---

## 4. Managing Data Performance

**The Golden Rule: Don't fetch data for widgets that aren't visible.**

*   **For Pattern B (Internal Fetching):** This happens automatically. React doesn't mount the component, so its internal hooks never run.
*   **For Pattern A (Centralized Fetching):** This is your responsibility. You **must** make the data fetching conditional within `useDashboardData.ts`.

#### How to Implement Conditional Fetching:
1.  **Ensure your custom hooks support it:** Modify your data hooks to accept an `enabled` flag.
    ```typescript
    // in useMyDataHook.ts
    const useMyDataHook = (params, enabled: boolean = true) => {
      return useQuery({
        // ...
        enabled, // Pass the flag here
      });
    };
    ```
2.  **Use the flag in `useDashboardData`:**
    ```typescript
    // in useDashboardData.ts
    const isMyWidgetActive = activeWidgetTypes.has('my-widget');
    const { myData } = useMyDataHook(params, isMyWidgetActive);
    ```

---

## 5. General Notes & Architectural Decisions

*   **Persistence:** The dashboard state (widgets, layouts, internal states) is persisted in the browser's `localStorage`. The `handleResetLayout` function clears this storage to restore the default state.
*   **Master Layout & Breakpoints:** The system is designed around a "master" layout. Edits are only saved on designated large breakpoints (defined in `EDITABLE_BREAKPOINTS` in `dashboard.config.ts`). Layouts for smaller screens are automatically derived from this master layout.
*   **Why No Editing on Mobile?** We deliberately disable edit mode (`finalIsEditMode` becomes `false`) on smaller breakpoints. This is a **user experience (UX) decision**. Drag-and-drop and resizing on a small touch screen is difficult and frustrating. The current approach provides a stable, view-only experience on mobile while offering full customization on desktop.
*   **Immutability:** When modifying state (especially in `useDashboard`), always use non-mutating methods (e.g., spread syntax `[...array]`, `{...object}`). This prevents subtle bugs and aligns with React best practices.
*   **Translations:** All user-facing strings, like widget names and descriptions in the `widgetRegistry`, should be translation keys. Remember to add these keys to the relevant i18n JSON files.