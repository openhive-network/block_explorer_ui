import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Loader2,
  ListChecks,
  Upload,
} from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import useBulkAccounts from "@/hooks/api/common/useBulkAccounts";
import {
  BulkAccountRow,
  MAX_NAMES,
  namesFromFile,
  parseAccountList,
} from "@/utils/bulkAccounts";
import { isBadActor, useBadActorsState } from "@/utils/badActors";
import { downloadCsv } from "@/utils/csvDownload";

// A pasted file bigger than this isn't a list of account names.
const MAX_FILE_BYTES = 1024 * 1024;

type ColumnKey =
  | "ownPower"
  | "effectivePower"
  | "hive"
  | "hbd"
  | "savingsHive"
  | "savingsHbd"
  | "reputation"
  | "lastActivity"
  | "created"
  | "flagged";

const COLUMNS: ColumnKey[] = [
  "ownPower",
  "effectivePower",
  "hive",
  "hbd",
  "savingsHive",
  "savingsHbd",
  "reputation",
  "lastActivity",
  "created",
  "flagged",
];

type SortKey = ColumnKey | "account";
type Cell = number | string | Date | boolean | null;

// Numbers with units stay left-to-right inside an Arabic sentence.
const ltr = (text: string) => `⁦${text}⁩`;

interface NamesFormProps {
  busy: boolean;
  onLookUp: (text: string) => void;
}

// The list being typed lives here, so typing doesn't redraw a long table.
const NamesForm: React.FC<NamesFormProps> = ({ busy, onLookUp }) => {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typed = useMemo(() => parseAccountList(text), [text]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLookUp(text);
  };

  const readFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError(true);
      return;
    }
    setFileError(false);
    file.text().then(
      (content) =>
        setText(
          namesFromFile(
            content,
            /\.csv$/i.test(file.name),
            t("tools.bulkLookup.column.account")
          )
        ),
      () => setFileError(true)
    );
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700"
    >
      <label
        htmlFor="bulk-lookup-names"
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {t("tools.bulkLookup.inputLabel")}
      </label>
      <textarea
        id="bulk-lookup-names"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("tools.bulkLookup.inputPlaceholder")}
        rows={6}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="w-full rounded-lg border border-slate-300 bg-theme p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-slate-600"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={!typed.names.length || busy}>
          {t("tools.bulkLookup.lookupButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="me-1.5 h-4 w-4" />
          {t("tools.bulkLookup.uploadButton")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          onChange={readFile}
          className="hidden"
          data-testid="bulk-lookup-file"
        />
        <span
          className="text-xs text-slate-500 dark:text-slate-400"
          data-testid="bulk-lookup-count"
        >
          {t("tools.bulkLookup.nameCount", {
            count: typed.names.length.toLocaleString(locale),
          })}
        </span>
      </div>
      {fileError && (
        <p
          className="mt-2 text-sm text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {t("tools.bulkLookup.fileError")}
        </p>
      )}
      {typed.overLimit > 0 && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {t("tools.bulkLookup.overLimit", {
            max: MAX_NAMES.toLocaleString(locale),
            count: typed.overLimit.toLocaleString(locale),
          })}
        </p>
      )}
    </form>
  );
};

const BulkLookupTool: React.FC = () => {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const showVests = settings.displayVestHpMode === "vests";
  const { list: badActors, failed: badActorsFailed } = useBadActorsState();

  const [submitted, setSubmitted] = useState("");
  const [hidden, setHidden] = useState<Set<ColumnKey>>(() => new Set());
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean } | null>(
    null
  );
  const parsed = useMemo(() => parseAccountList(submitted), [submitted]);
  const { data, isFetching, isError, progress, refetch } = useBulkAccounts(
    parsed.names
  );

  const lookUpText = (text: string) => {
    // The same names again (however they were typed) means "look them up
    // again": the query key doesn't change, so ask for it.
    const again = parseAccountList(text).names;
    if (again.length && again.join() === parsed.names.join()) refetch();
    setSubmitted(text);
  };

  const hivePerVests = data?.hivePerVests ?? 0;
  const power = (vests: number) => (showVests ? vests : vests * hivePerVests);
  const powerUnit = showVests ? t("common.vests") : t("common.hp");

  // The value behind each cell: what the table sorts on and the CSV holds.
  const value = (row: BulkAccountRow, key: SortKey): Cell => {
    switch (key) {
      case "account":
        return row.account;
      case "ownPower":
        return power(row.ownVests);
      case "effectivePower":
        return power(row.effectiveVests);
      case "reputation":
        return row.reputation === null ? null : Math.floor(row.reputation);
      case "flagged":
        return badActors ? isBadActor(badActors, row.account) : null;
      default:
        return row[key];
    }
  };

  // One formatter each, not one per cell: a thousand rows make thousands
  // of cells.
  const formats = useMemo(() => {
    const fixed = (digits: number) =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    return {
      three: fixed(3),
      six: fixed(6),
      whole: new Intl.NumberFormat(locale),
      date: new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: "UTC",
      }),
    };
  }, [locale]);

  const display = (row: BulkAccountRow, key: ColumnKey): React.ReactNode => {
    const cell = value(row, key);
    if (cell === null) return "—";
    if (key === "flagged")
      return cell ? (
        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {t("tools.bulkLookup.flaggedYes")}
        </span>
      ) : (
        <span className="text-slate-400">
          {t("tools.bulkLookup.flaggedNo")}
        </span>
      );
    if (cell instanceof Date) return formats.date.format(cell);
    if (typeof cell !== "number") return String(cell);
    if (key === "reputation") return formats.whole.format(cell);
    const vestsCell =
      showVests && (key === "ownPower" || key === "effectivePower");
    return ltr((vestsCell ? formats.six : formats.three).format(cell));
  };

  const header = (key: SortKey) => {
    switch (key) {
      case "account":
        return t("tools.bulkLookup.column.account");
      case "ownPower":
        return t("tools.bulkLookup.column.ownPower", { unit: powerUnit });
      case "effectivePower":
        return t("tools.bulkLookup.column.effectivePower", { unit: powerUnit });
      default:
        return t(`tools.bulkLookup.column.${key}`);
    }
  };

  const rows = useMemo(() => {
    const list = data?.rows ?? [];
    if (!sort) return list;
    const compare = (a: Cell, b: Cell) => {
      // Empty cells go last whichever way the column is sorted.
      if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
      const x = a instanceof Date ? a.getTime() : a;
      const y = b instanceof Date ? b.getTime() : b;
      const order =
        typeof x === "string" && typeof y === "string"
          ? x.localeCompare(y)
          : Number(x) - Number(y);
      return sort.desc ? -order : order;
    };
    return [...list].sort((a, b) =>
      compare(value(a, sort.key), value(b, sort.key))
    );
    // value() reads badActors, hivePerVests and showVests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sort, badActors, hivePerVests, showVests]);

  const shown = COLUMNS.filter((key) => !hidden.has(key));
  const flaggedCount = badActors
    ? (data?.rows ?? []).filter((row) => isBadActor(badActors, row.account))
        .length
    : null;

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current?.key === key
        ? current.desc
          ? null
          : { key, desc: true }
        : { key, desc: false }
    );

  const exportCsv = () => {
    const columns = ["account", ...shown].map((key) => header(key as SortKey));
    const csvRows = rows.map((row) => {
      const out: Record<string, unknown> = {};
      (["account", ...shown] as SortKey[]).forEach((key, i) => {
        const cell = value(row, key);
        out[columns[i]] =
          cell === null
            ? ""
            : cell instanceof Date
              ? cell.toISOString()
              : typeof cell === "boolean"
                ? t(
                    cell
                      ? "tools.bulkLookup.flaggedYes"
                      : "tools.bulkLookup.flaggedNo"
                  )
                : typeof cell === "number" &&
                    (key === "ownPower" || key === "effectivePower")
                  ? cell.toFixed(showVests ? 6 : 3)
                  : cell;
      });
      return out;
    });
    const day = new Date().toISOString().slice(0, 10);
    downloadCsv(`hive-accounts-${day}.csv`, csvRows, columns).catch((error) =>
      console.warn("[bulkLookup] CSV export failed:", error)
    );
  };

  const done = !!data && !isFetching;

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <ListChecks className="h-5 w-5 text-indigo-500" />
          {t("tools.bulkLookup.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("tools.bulkLookup.subtitle", {
            max: MAX_NAMES.toLocaleString(locale),
          })}
        </p>
      </div>

      <NamesForm busy={isFetching} onLookUp={lookUpText} />

      <div
        className="flex items-center gap-2 text-sm text-slate-600 empty:hidden dark:text-slate-300"
        role="status"
        aria-live="polite"
      >
        {isFetching && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            {t("tools.bulkLookup.progress", {
              done: progress.toLocaleString(locale),
              total: parsed.names.length.toLocaleString(locale),
            })}
          </>
        )}
      </div>
      {isError && !isFetching && (
        <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
          {t("tools.bulkLookup.loadError")}
        </p>
      )}

      {submitted && parsed.invalid.length > 0 && (
        <p
          className="text-sm text-slate-600 dark:text-slate-300"
          data-testid="bulk-lookup-invalid"
        >
          {t("tools.bulkLookup.invalid", {
            count: parsed.invalid.length.toLocaleString(locale),
          })}{" "}
          <span className="break-all font-mono">
            {parsed.invalid.join(", ")}
          </span>
        </p>
      )}

      {done && (
        <>
          <div
            className="flex flex-wrap items-center justify-between gap-2"
            data-testid="bulk-lookup-summary"
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("tools.bulkLookup.summary", {
                found: data.rows.length.toLocaleString(locale),
                notFound: data.notFound.length.toLocaleString(locale),
              })}
              {flaggedCount !== null && flaggedCount > 0 && (
                <span className="ms-1 font-semibold text-rose-600 dark:text-rose-400">
                  {t("tools.bulkLookup.flaggedCount", {
                    count: flaggedCount.toLocaleString(locale),
                  })}
                </span>
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={exportCsv}
              disabled={!data.rows.length}
            >
              <Download className="me-1.5 h-4 w-4" />
              {t("tools.bulkLookup.download")}
            </Button>
          </div>

          {data.notFound.length > 0 && (
            <p
              className="text-sm text-slate-600 dark:text-slate-300"
              data-testid="bulk-lookup-not-found"
            >
              {t("tools.bulkLookup.notFound")}{" "}
              <span className="break-all font-mono">
                {data.notFound.join(", ")}
              </span>
            </p>
          )}
          {data.profilesFailed && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t("tools.bulkLookup.profilesFailed")}
            </p>
          )}
          {badActorsFailed && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t("tools.bulkLookup.badActorsFailed")}
            </p>
          )}

          {data.rows.length > 0 && (
            <>
              <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <legend className="mb-1 font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("tools.bulkLookup.columns")}
                </legend>
                {COLUMNS.map((key) => (
                  <label key={key} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={!hidden.has(key)}
                      onChange={() =>
                        setHidden((current) => {
                          const next = new Set(current);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        })
                      }
                      className="accent-indigo-500"
                    />
                    {header(key)}
                  </label>
                ))}
              </fieldset>

              <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-theme shadow-xs dark:border-slate-700">
                <table
                  className="w-full text-sm"
                  data-testid="bulk-lookup-table"
                >
                  <thead className="sticky top-0 bg-theme">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {(["account", ...shown] as SortKey[]).map((key) => (
                        <th
                          key={key}
                          scope="col"
                          aria-sort={
                            sort?.key === key
                              ? sort.desc
                                ? "descending"
                                : "ascending"
                              : "none"
                          }
                          className="whitespace-nowrap px-3 py-2 text-start text-xs font-semibold text-slate-600 dark:text-slate-300"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                          >
                            {header(key)}
                            {sort?.key === key &&
                              (sort.desc ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUp className="h-3 w-3" />
                              ))}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.account}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="whitespace-nowrap px-3 py-1.5">
                          <Link href={`/@${row.account}`} className="text-link">
                            @{row.account}
                          </Link>
                        </td>
                        {shown.map((key) => (
                          <td
                            key={key}
                            className="whitespace-nowrap px-3 py-1.5 tabular-nums"
                          >
                            {display(row, key)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("tools.bulkLookup.explain")}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BulkLookupTool;
