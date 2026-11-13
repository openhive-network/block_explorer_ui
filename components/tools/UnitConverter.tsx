import React, { useEffect, useId, useState } from "react";
import { useRouter } from "next/router";
import { Calculator, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Input } from "@/components/ui/input";
import useConverterRates from "@/hooks/api/common/useConverterRates";
import {
  amountForQuery,
  amountFromQuery,
  CONVERTER_UNITS,
  ConverterUnit,
  convertAmount,
  formatAmount,
  parseAmount,
} from "@/utils/unitConverter";

const UNIT_SYMBOL: Record<ConverterUnit, string> = {
  vests: "VESTS",
  hp: "HP",
  hbd: "HBD",
};

// Numbers with units stay left-to-right inside an Arabic sentence.
const ltr = (text: string) => `\u2066${text}\u2069`;

// Wait for typing to pause before rewriting the URL.
const URL_DELAY_MS = 400;

type Query = Record<string, string | string[] | undefined>;

// The address for an entry: other parameters kept, the three amounts replaced
// by at most one, written as plain ASCII.
const pathFor = (
  pathname: string,
  query: Query,
  unit: ConverterUnit,
  value: number | null
): string => {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    if ((CONVERTER_UNITS as string[]).includes(key) || raw == null) continue;
    for (const v of Array.isArray(raw) ? raw : [raw]) params.append(key, v);
  }
  if (value != null) params.set(unit, amountForQuery(value, unit));
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
};

interface Entry {
  unit: ConverterUnit;
  text: string;
  // An amount from a shared link, kept as a number so it is shown in
  // whichever language the page settles on. Typing replaces it.
  shared?: number;
}

const entryFromQuery = (query: Query): Entry => {
  const shared = amountFromQuery(query);
  return shared
    ? { unit: shared.unit, text: "", shared: shared.value }
    : { unit: "hp", text: "" };
};

const UnitConverter: React.FC = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const idPrefix = useId();
  const { rates, asOf, isRatesLoading, isRatesError } = useConverterRates();
  // The field being typed in keeps its text as typed; the other two derive.
  // The page is server-rendered, so a shared link (?hp=100) is in the query
  // on the first render.
  const [entry, setEntry] = useState<Entry>(() => entryFromQuery(router.query));
  // The address the entry last matched, and the one this page last wrote.
  const [syncedPath, setSyncedPath] = useState(router.asPath);
  const [writtenPath, setWrittenPath] = useState<string | null>(null);

  // Navigating here from outside (the tab link, another shared link) loads
  // that address's amount; the address this page wrote itself does not.
  if (router.asPath !== syncedPath) {
    setSyncedPath(router.asPath);
    if (router.asPath !== writtenPath) setEntry(entryFromQuery(router.query));
  }

  const value = entry.shared ?? parseAmount(entry.text, locale);
  const converted =
    rates && value != null ? convertAmount(entry.unit, value, rates) : null;

  // Keep the address bar linkable: one plain ASCII amount, or none.
  const target = pathFor(router.pathname, router.query, entry.unit, value);
  useEffect(() => {
    if (target === router.asPath) return;
    const timer = setTimeout(() => {
      setWrittenPath(target);
      router.replace(target, undefined, { shallow: true, scroll: false });
    }, URL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [target, router]);

  const shownText = (unit: ConverterUnit) => {
    if (unit === entry.unit)
      return entry.shared != null
        ? formatAmount(entry.shared, unit, locale)
        : entry.text;
    return converted ? formatAmount(converted[unit], unit, locale) : "";
  };

  const invalid = entry.text.trim() !== "" && value == null;
  const errorId = `${idPrefix}-error`;
  // At the market's last price: the HBD the HIVE would fetch or, starting
  // from HBD, the HIVE it would buy (feed there and market back muddles it).
  const market = rates?.marketHbdPerHive ?? null;
  const marketAmount =
    converted && market != null
      ? entry.unit === "hbd"
        ? `${formatAmount(converted.hbd / market, "hp", locale)} HIVE`
        : `${formatAmount(converted.hp * market, "hbd", locale)} HBD`
      : null;

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <Calculator className="h-5 w-5 text-indigo-500" />
          {t("tools.converter.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          {t("tools.converter.subtitle")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700">
        <div className="grid gap-3 sm:grid-cols-3">
          {CONVERTER_UNITS.map((unit) => {
            const id = `${idPrefix}-${unit}`;
            return (
              <div key={unit}>
                <label
                  htmlFor={id}
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {t(`tools.converter.label.${unit}`)}
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-theme px-2 focus-within:ring-2 focus-within:ring-indigo-400 dark:border-slate-600">
                  <Input
                    id={id}
                    data-testid={`converter-${unit}`}
                    inputMode="decimal"
                    autoComplete="off"
                    dir="ltr"
                    placeholder="0"
                    disabled={!rates}
                    value={shownText(unit)}
                    aria-invalid={unit === entry.unit && invalid}
                    aria-describedby={
                      unit === entry.unit && invalid ? errorId : undefined
                    }
                    onChange={(e) => setEntry({ unit, text: e.target.value })}
                    className="border-0 bg-transparent px-0 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <span className="shrink-0 text-xs font-bold text-slate-400">
                    {UNIT_SYMBOL[unit]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 min-h-5 text-sm">
          {/* Only the error is announced; the market line changes per key. */}
          <p
            id={errorId}
            aria-live="polite"
            className="text-rose-600 dark:text-rose-400"
          >
            {invalid ? t("tools.converter.invalid") : null}
          </p>
          {!invalid && marketAmount != null && market != null ? (
            <p
              data-testid="converter-market"
              className="text-slate-600 dark:text-slate-300"
            >
              {t("tools.converter.atMarket", {
                amount: ltr(marketAmount),
                price: ltr(
                  `${market.toLocaleString(locale, {
                    maximumFractionDigits: 5,
                  })} HBD/HIVE`
                ),
              })}
            </p>
          ) : null}
        </div>

        {isRatesLoading ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("tools.converter.loading")}
          </p>
        ) : isRatesError || !rates ? (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
            {t("tools.converter.unavailable")}
          </p>
        ) : (
          <div
            data-testid="converter-rates"
            className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"
          >
            <p>
              {t("tools.converter.rates", {
                hpRate: ltr(
                  `1 HP = ${(1 / rates.hivePerVests).toLocaleString(locale, {
                    maximumFractionDigits: 6,
                  })} VESTS`
                ),
                feedRate: ltr(
                  `1 HIVE = ${rates.feedHbdPerHive.toLocaleString(locale, {
                    maximumFractionDigits: 5,
                  })} HBD`
                ),
              })}
              {asOf &&
                ` · ${t("tools.converter.asOf", {
                  time: asOf.toLocaleString(locale, {
                    timeZone: "UTC",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}`}
            </p>
            <p>{t("tools.converter.note")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitConverter;
