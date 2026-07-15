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

interface ReportExportsContextValue {
  register: (widgetId: string, datasets: ReportExportDataset[]) => void;
  unregister: (widgetId: string) => void;
  exportsByWidget: Record<string, ReportExportDataset[]>;
}

const ReportExportsContext = createContext<ReportExportsContextValue | null>(
  null
);

// Wraps the analytics grid so any report can publish export datasets that the
// widget header picks up — future reports get export by calling the hook below.
export const ReportExportsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [exportsByWidget, setExportsByWidget] = useState<
    Record<string, ReportExportDataset[]>
  >({});

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

  const value = useMemo(
    () => ({ register, unregister, exportsByWidget }),
    [register, unregister, exportsByWidget]
  );

  return (
    <ReportExportsContext.Provider value={value}>
      {children}
    </ReportExportsContext.Provider>
  );
};

export const useReportExports = () => useContext(ReportExportsContext);

// Called inside a report to publish its current export datasets. Memoize
// `datasets` in the caller so this doesn't re-register every render.
export const useRegisterReportExport = (
  widgetId: string | undefined,
  datasets: ReportExportDataset[]
) => {
  const ctx = useContext(ReportExportsContext);
  // Depend on the STABLE register/unregister callbacks, not the whole context
  // object — the context value changes on every registration, so depending on
  // `ctx` would re-run this effect and register in an infinite loop.
  const register = ctx?.register;
  const unregister = ctx?.unregister;
  useEffect(() => {
    if (!register || !unregister || !widgetId) return;
    register(widgetId, datasets);
    return () => unregister(widgetId);
  }, [register, unregister, widgetId, datasets]);
};
