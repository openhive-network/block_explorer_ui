import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import { Link2, X } from "lucide-react";
import { toast } from "sonner";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { resolveAccountLabel } from "@/utils/accountLabels";
import AccountLabelBadge from "@/components/AccountLabelBadge";
import CompareExportMenu from "./CompareExportMenu";
import CompareVerdict from "./CompareVerdict";
import { CompareAccountData, govHealth } from "@/utils/compare/rowModel";
import { CompareSection, Side } from "@/utils/compare/types";
import { overallWins, deltaRatio } from "@/utils/compare/scoring";
import { formatCompareValue } from "@/utils/compare/format";
import { formatCompact } from "@/utils/chartUtils";
import { cn } from "@/lib/utils";
import { CompareRange, COMPARE_RANGES } from "@/utils/compare/range";
import { TOOLS_GUTTER, TOOLS_RAIL_WIDTH } from "@/components/tools/ToolsLayout";
import useCountUp from "@/hooks/common/useCountUp";

interface CompareHeaderProps {
  a: CompareAccountData;
  b: CompareAccountData;
  sections: CompareSection[];
  locale: string;
  t: (k: string) => string;
  range: CompareRange;
  onRangeChange: (r: CompareRange) => void;
  onRemove?: (side: Side) => void;
}

const RING: Record<Side, string> = {
  a: "ring-red-500",
  b: "ring-blue-500",
};

const descriptorParts = (
  d: CompareAccountData,
  t: (k: string) => string,
  locale: string
): string[] => {
  const parts: string[] = [];
  if (d.isWitness && d.witnessRank)
    parts.push(t("compare.desc.witness").replace("{n}", String(d.witnessRank)));
  if (d.createdMs)
    parts.push(
      t("compare.desc.joined").replace(
        "{date}",
        moment(d.createdMs).locale(locale).format("MMM YYYY")
      )
    );
  return parts;
};

const Identity: React.FC<{
  d: CompareAccountData;
  side: Side;
  t: (k: string) => string;
  locale: string;
  // Sticky bar shows only avatar + name (no descriptor) to stay compact.
  compact?: boolean;
  onRemove?: () => void;
}> = ({ d, side, t, locale, compact, onRemove }) => {
  const avatar = (
    <Image
      src={getHiveAvatarUrl(d.account)}
      alt={d.account}
      width={44}
      height={44}
      className={`h-9 w-9 flex-shrink-0 rounded-full ring-2 sm:h-11 sm:w-11 ${RING[side]}`}
    />
  );
  // No isWitness fallback — the descriptor below already says "Witness #N".
  const accountLabel = resolveAccountLabel(d.account);
  const text = (
    <div className={`min-w-0 ${side === "b" ? "text-end" : ""}`}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-1.5",
          side === "b" && "justify-end"
        )}
      >
        <Link
          href={`/@${d.account}`}
          className="truncate text-[13px] font-extrabold text-link hover:underline sm:text-[15px]"
        >
          @{d.account}
        </Link>
        {!compact && <AccountLabelBadge label={accountLabel} />}
      </div>
      {/* Each part stays whole and drops to its own line when the column is
          too narrow, rather than the whole descriptor being clipped. */}
      {!compact && (
        <div
          className={cn(
            "flex flex-wrap gap-x-1.5 text-[10px] text-slate-400 dark:text-slate-500 sm:text-[11px]",
            side === "b" && "justify-end"
          )}
        >
          {descriptorParts(d, t, locale).map((part, i) => (
            <React.Fragment key={part}>
              {i > 0 && (
                <span
                  aria-hidden
                  className="text-slate-300 dark:text-slate-600"
                >
                  ·
                </span>
              )}
              <span className="whitespace-nowrap">{part}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
  const removeBtn = onRemove ? (
    <button
      type="button"
      onClick={onRemove}
      aria-label={t("compare.removeAccount").replace("{account}", d.account)}
      className="flex-shrink-0 rounded-full p-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:text-slate-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  ) : null;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 ${
        side === "b" ? "justify-end" : ""
      }`}
    >
      {side === "a" ? (
        <>
          {removeBtn}
          {avatar}
          {text}
        </>
      ) : (
        <>
          {text}
          {avatar}
          {removeBtn}
        </>
      )}
    </div>
  );
};

const fmtStat = (v: number | null, locale: string): string =>
  v == null ? "—" : formatCompact(v, locale);

const lastActiveLabel = (ms: number | null, locale: string): string =>
  ms == null ? "—" : moment(ms).locale(locale).fromNow();

// Same bucketing the Influence row scores on, so the two can't disagree.
const govHealthLabel = (
  ms: number | null,
  t: (k: string) => string
): string => {
  const { key } = govHealth(ms);
  return key ? t(key) : "—";
};

const StatCell: React.FC<{ label: string; aVal: string; bVal: string }> = ({
  label,
  aVal,
  bVal,
}) => (
  <div className="flex flex-col items-center gap-0.5 px-1.5 py-2.5 text-center sm:px-2">
    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <span className="text-[12px] font-bold leading-tight tabular-nums sm:text-[13px]">
      <span className="text-red-600 dark:text-red-400">{aVal}</span>
      <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
      <span className="text-blue-600 dark:text-blue-400">{bVal}</span>
    </span>
  </div>
);

const RangeTabs: React.FC<{
  range: CompareRange;
  onChange: (r: CompareRange) => void;
  t: (k: string) => string;
}> = ({ range, onChange, t }) => (
  <div className="inline-flex items-stretch overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
    {COMPARE_RANGES.map((r) => (
      <button
        key={r}
        type="button"
        onClick={() => onChange(r)}
        aria-pressed={range === r}
        className={cn(
          "whitespace-nowrap px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400",
          range === r
            ? "bg-indigo-500 text-white"
            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
      >
        {t(`compare.window.${r}`)}
      </button>
    ))}
  </div>
);

const CompareHeader: React.FC<CompareHeaderProps> = ({
  a,
  b,
  sections,
  locale,
  t,
  range,
  onRangeChange,
  onRemove,
}) => {
  const race = overallWins(sections);
  const ratio = deltaRatio({
    id: "value",
    labelKey: "",
    format: "usd",
    scored: true,
    aValue: a.totalValueUsd,
    bValue: b.totalValueUsd,
  });
  const aHigher = (a.totalValueUsd ?? 0) > (b.totalValueUsd ?? 0);
  const bHigher = (b.totalValueUsd ?? 0) > (a.totalValueUsd ?? 0);

  // Count the headline totals up on load (snaps instantly under reduced motion).
  const aCount = useCountUp(a.totalValueUsd);
  const bCount = useCountUp(b.totalValueUsd);
  const aValueText =
    a.totalValueUsd == null
      ? formatCompareValue(null, "usd", locale)
      : formatCompareValue(aCount, "usd", locale);
  const bValueText =
    b.totalValueUsd == null
      ? formatCompareValue(null, "usd", locale)
      : formatCompareValue(bCount, "usd", locale);

  // Copy a ready-to-paste share line (blurb + current URL, which carries a/b/range).
  const copyShareLink = () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    const text = `@${a.account} vs @${b.account} — ${window.location.href}`;
    navigator.clipboard.writeText(text).then(
      () => toast.success(t("compare.share.copied")),
      () => undefined
    );
  };

  // Reveal the compact "who's who" bar once the full header scrolls under the navbar.
  const headerRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Sticky who's-who: the identity row, slid under the navbar once the full
          header scrolls away. Aligned to the tools content column. */}
      <div
        aria-hidden={!stuck}
        className={cn(
          "pointer-events-none fixed inset-x-0 top-[72px] z-40 transition-all duration-200 md:top-20",
          // `invisible`, not just opacity-0 — an aria-hidden subtree must not
          // keep the cloned account links in the tab order.
          stuck
            ? "translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0"
        )}
      >
        <div className={cn(TOOLS_GUTTER, "mx-auto")}>
          <div className="flex lg:gap-3">
            <div
              className={cn("hidden lg:block", TOOLS_RAIL_WIDTH)}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="pointer-events-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-theme shadow-lg dark:border-slate-700">
                <Identity d={a} side="a" t={t} locale={locale} compact />
                <div className="flex items-center justify-center bg-slate-50 px-2 text-[10px] font-bold tracking-wider text-slate-400 dark:bg-slate-800/40 sm:px-4 sm:text-[11px]">
                  {t("compare.vs")}
                </div>
                <Identity d={b} side="b" t={t} locale={locale} compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={headerRef}
        className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-theme shadow-sm dark:border-slate-700"
      >
        {/* Identities */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Identity
            d={a}
            side="a"
            t={t}
            locale={locale}
            onRemove={onRemove ? () => onRemove("a") : undefined}
          />
          <div className="flex items-center justify-center bg-slate-50 px-2 text-[10px] font-bold tracking-wider text-slate-400 dark:bg-slate-800/40 sm:px-4 sm:text-[11px]">
            {t("compare.vs")}
          </div>
          <Identity
            d={b}
            side="b"
            t={t}
            locale={locale}
            onRemove={onRemove ? () => onRemove("b") : undefined}
          />
        </div>

        {/* Value duel — light-gray band */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-3.5 dark:border-slate-800 dark:bg-slate-800/40 sm:gap-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
              {t("compare.totalValue")}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xl font-extrabold leading-none tabular-nums sm:text-[1.6rem]">
              <span className="truncate text-red-600 dark:text-red-400">
                {aValueText}
              </span>
              {aHigher && (
                <span className="text-xs text-red-500 rtl:-scale-x-100">▸</span>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {ratio && ratio !== "tie" && (
              <span
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs",
                  aHigher
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                )}
              >
                {aHigher && <span className="rtl:-scale-x-100">◂</span>}
                {ratio} {t("compare.more")}
                {bHigher && <span className="rtl:-scale-x-100">▸</span>}
              </span>
            )}
          </div>

          <div className="min-w-0 text-end">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
              {t("compare.totalValue")}
            </div>
            <div className="mt-0.5 flex items-center justify-end gap-1 text-xl font-extrabold leading-none tabular-nums sm:text-[1.6rem]">
              {bHigher && (
                <span className="text-xs text-blue-500 rtl:-scale-x-100">
                  ◂
                </span>
              )}
              <span className="truncate text-blue-600 dark:text-blue-400">
                {bValueText}
              </span>
            </div>
          </div>
        </div>

        {/* Verdict — one-line story right under the value duel. */}
        <CompareVerdict a={a.account} b={b.account} sections={sections} t={t} />

        {/* Stat strip — quick per-account facts (@a red · @b blue) */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-4">
          <StatCell
            label={t("compare.stats.posts")}
            aVal={fmtStat(a.lifetimePosts, locale)}
            bVal={fmtStat(b.lifetimePosts, locale)}
          />
          <StatCell
            label={t("compare.stats.followers")}
            aVal={fmtStat(a.followers, locale)}
            bVal={fmtStat(b.followers, locale)}
          />
          <StatCell
            label={t("compare.stats.lastActive")}
            aVal={lastActiveLabel(a.lastPostMs, locale)}
            bVal={lastActiveLabel(b.lastPostMs, locale)}
          />
          <StatCell
            label={t("compare.stats.govHealth")}
            aVal={govHealthLabel(a.govVoteExpirationMs, t)}
            bVal={govHealthLabel(b.govVoteExpirationMs, t)}
          />
        </div>

        {/* Footer — row race (left) · range control + export (right) */}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 border-t border-slate-100 px-3 pb-3.5 pt-5 dark:border-slate-800 sm:px-5">
          <div className="text-[13px] text-slate-500 dark:text-slate-400">
            {t("compare.score")}
            {" — "}
            <b className="text-red-600 dark:text-red-400">
              @{a.account} {race.a}
            </b>
            {" · "}
            <b className="text-blue-600 dark:text-blue-400">
              @{b.account} {race.b}
            </b>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RangeTabs range={range} onChange={onRangeChange} t={t} />
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Link2 className="h-3.5 w-3.5" />
              {t("compare.share.copyLink")}
            </button>
            <CompareExportMenu
              a={a}
              b={b}
              sections={sections}
              rangeLabel={t(`compare.window.${range}`)}
              locale={locale}
              t={t}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CompareHeader;
