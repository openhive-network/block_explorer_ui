import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import PageTitle from "@/components/PageTitle";
import { TOOLS, ToolDef } from "./toolsRegistry";

// Shared with anything that lines up with the content column from outside the
// flow (CompareHeader's sticky bar).
export const TOOLS_GUTTER = "page-container";
export const TOOLS_ROW = "flex flex-col gap-3 lg:flex-row";
export const TOOLS_RAIL_WIDTH = "lg:w-72 lg:flex-shrink-0";

interface ToolsLayoutProps {
  active: string;
  children: React.ReactNode;
}

const RailItem: React.FC<{
  tool: ToolDef;
  active: boolean;
  t: (k: string) => string;
}> = ({ tool, active, t }) => {
  const Icon = tool.icon;
  const base =
    "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors";

  if (!tool.enabled) {
    return (
      <span
        className={cn(
          base,
          "cursor-default text-slate-400 dark:text-slate-600"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {t(tool.labelKey)}
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {t("tools.soon")}
        </span>
      </span>
    );
  }

  return (
    <Link
      href={tool.route}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {t(tool.labelKey)}
    </Link>
  );
};

// Shared shell for the Tools hub: a left rail of tabs (a horizontal scroll strip
// on small screens) and the active tool's content on the right.
const ToolsLayout: React.FC<ToolsLayoutProps> = ({ active, children }) => {
  const { t } = useI18n();
  const activeTool = TOOLS.find((x) => x.key === active);

  return (
    <>
      <Head>
        <title>
          {activeTool ? `${t(activeTool.labelKey)} · ` : ""}
          {t("tools.title")}
        </title>
      </Head>
      <div className={cn(TOOLS_GUTTER)}>
        <div className="mb-3">
          <PageTitle titleKey="tools.title" className="py-4 ml-6" />
        </div>
        <div className={TOOLS_ROW}>
          <nav
            aria-label={t("tools.title")}
            className={cn(
              "flex flex-row gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-theme p-1.5 shadow-sm dark:border-slate-700 lg:flex-col lg:overflow-visible",
              TOOLS_RAIL_WIDTH
            )}
          >
            {TOOLS.map((tool) => (
              <RailItem
                key={tool.key}
                tool={tool}
                active={tool.key === active}
                t={t}
              />
            ))}
          </nav>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
};

export default ToolsLayout;
