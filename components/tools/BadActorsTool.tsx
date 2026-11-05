import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Search } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trimAccountName } from "@/utils/StringUtils";
import { BadActors, isBadActor, useBadActors } from "@/utils/badActors";

const fill = (s: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), s);

// Bucket the flagged names by first letter. Non a–z first chars fall into
// the "#" bucket.
const groupByLetter = (list: BadActors) => {
  const grouped: Record<string, string[]> = {};
  for (const name of list) {
    const c = name[0];
    const key = c >= "a" && c <= "z" ? c : "#";
    (grouped[key] ||= []).push(name);
  }
  for (const key of Object.keys(grouped)) grouped[key].sort();
  const letters = Object.keys(grouped).sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
  );
  return { grouped, letters };
};

const BadActorsTool: React.FC = () => {
  const { t, locale } = useI18n();
  const badActors = useBadActors();
  const { grouped, letters } = useMemo(
    () => groupByLetter(badActors ?? new Set<string>()),
    [badActors]
  );
  const [lookup, setLookup] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const active = picked ?? letters[0] ?? "#";

  const lookupName = trimAccountName(lookup);
  const verdict =
    badActors && lookupName.length > 0
      ? isBadActor(badActors, lookupName)
        ? "flagged"
        : "clear"
      : null;

  const rows = grouped[active] ?? [];

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
          {t("tools.badActors.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          {t("tools.badActors.subtitle")}
        </p>
      </div>

      {/* Lookup */}
      <div className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700">
        <label
          htmlFor="bad-actor-lookup"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {t("tools.badActors.lookupLabel")}
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-theme px-2 focus-within:ring-2 focus-within:ring-indigo-400 dark:border-slate-600">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <Input
            id="bad-actor-lookup"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder={t("tools.badActors.lookupPlaceholder")}
            className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        {verdict === "flagged" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm dark:border-rose-900/50 dark:bg-rose-950/30">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <div>
              <p className="font-bold text-rose-700 dark:text-rose-300">
                {fill(t("tools.badActors.flagged"), { account: lookupName })}
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                {t("tools.badActors.warning")}
              </p>
            </div>
          </div>
        )}
        {verdict === "clear" && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">
              {fill(t("tools.badActors.notFlagged"), { account: lookupName })}
            </p>
          </div>
        )}
      </div>

      {/* Browsable list, indexed A–Z */}
      <div className="rounded-xl border border-slate-200 bg-theme shadow-xs dark:border-slate-700">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {fill(t("tools.badActors.count"), {
              n: badActors ? badActors.size.toLocaleString(locale) : "…",
            })}
          </span>
          <div className="mt-2 flex flex-wrap gap-1">
            {letters.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPicked(l)}
                aria-pressed={active === l}
                className={cn(
                  "h-7 min-w-[28px] rounded-md px-2 text-xs font-bold uppercase transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400",
                  active === l
                    ? "bg-indigo-500 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pb-2 pt-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {fill(t("tools.badActors.inLetter"), {
              n: rows.length.toLocaleString(locale),
              letter: active.toUpperCase(),
            })}
          </span>
          {/* Stated once for the whole list — every entry below carries it. */}
          <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
            {t("tools.badActors.warning")}
          </span>
        </div>
        <ul className="flex flex-wrap gap-2 px-4 pb-4">
          {rows.map((name) => (
            <li key={name}>
              <Link
                href={`/@${name}`}
                className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                @{name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {t("tools.badActors.source")}
        </div>
      </div>
    </div>
  );
};

export default BadActorsTool;
