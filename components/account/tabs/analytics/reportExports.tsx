import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// A CSV-ready dataset a report offers for export. `rows` should already use
// translated column headers as keys (per project convention).
export interface ReportExportDataset {
  name: string; // menu label, e.g. "Categories"
  filename: string; // download filename (without needing .csv)
  rows: Record<string, unknown>[];
}

interface ReportExportsActions {
  register: (widgetId: string, datasets: ReportExportDataset[]) => void;
  unregister: (widgetId: string) => void;
}

type ExportsByWidget = Record<string, ReportExportDataset[]>;

// Two contexts on purpose: the actions are stable for the provider's lifetime,
// while the data map changes on every registration. Reports only need the
// actions (to publish), so keeping them separate means re-registering an export
// never re-renders the reports themselves — only the export-icon slots that
// read the data map. (Without this, one report changing its range re-rendered
// every report, restarting the Influence Map's force layout.)
const ReportExportsActionsContext = createContext<ReportExportsActions | null>(
  null
);
const ReportExportsDataContext = createContext<ExportsByWidget>({});

export const ReportExportsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [exportsByWidget, setExportsByWidget] = useState<ExportsByWidget>({});

  const register = useCallback(
    (widgetId: string, datasets: ReportExportDataset[]) => {
      setExportsByWidget((prev) => ({ ...prev, [widgetId]: datasets }));
    },
    []
  );

  const unregister = useCallback((widgetId: string) => {
    setExportsByWidget((prev) => {
      if (!(widgetId in prev)) return prev;
      const next = { ...prev };
      delete next[widgetId];
      return next;
    });
  }, []);

  const actions = useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  );

  return (
    <ReportExportsActionsContext.Provider value={actions}>
      <ReportExportsDataContext.Provider value={exportsByWidget}>
        {children}
      </ReportExportsDataContext.Provider>
    </ReportExportsActionsContext.Provider>
  );
};

// The datasets published for a widget (used by the export-icon slot).
export const useReportExports = (widgetId: string) =>
  useContext(ReportExportsDataContext)[widgetId];

// Called inside a report to publish its current export datasets. Memoize
// `datasets` in the caller so this doesn't re-register every render.
export const useRegisterReportExport = (
  widgetId: string | undefined,
  datasets: ReportExportDataset[]
) => {
  const actions = useContext(ReportExportsActionsContext);
  const register = actions?.register;
  const unregister = actions?.unregister;
  useEffect(() => {
    if (!register || !unregister || !widgetId) return;
    register(widgetId, datasets);
    return () => unregister(widgetId);
  }, [register, unregister, widgetId, datasets]);
};
