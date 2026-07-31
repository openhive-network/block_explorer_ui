import { ArrowLeftRight, ShieldAlert, Download } from "lucide-react";

export interface ToolDef {
  key: string;
  route: string;
  labelKey: string;
  icon: React.ElementType;
  // Disabled tools render as a non-clickable "Soon" entry in the rail.
  enabled: boolean;
}

// Single source of truth for the Tools hub: drives the rail, the active-tab
// highlight and the browser title. Add a tool here and it appears everywhere.
export const TOOLS: ToolDef[] = [
  {
    key: "compare",
    route: "/tools/compare",
    labelKey: "tools.tabs.compare",
    icon: ArrowLeftRight,
    enabled: true,
  },
  {
    key: "bad-actors",
    route: "/tools/bad-actors",
    labelKey: "tools.tabs.badActors",
    icon: ShieldAlert,
    enabled: true,
  },
  {
    key: "exports",
    route: "/tools/exports",
    labelKey: "tools.tabs.exports",
    icon: Download,
    enabled: false,
  },
];
