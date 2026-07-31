import React from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { trimAccountName } from "@/utils/StringUtils";
import useAccountComparison from "@/hooks/api/compare/useAccountComparison";
import { CompareRange, COMPARE_RANGES } from "@/utils/compare/range";
import AccountPicker from "@/components/compare/AccountPicker";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareTable from "@/components/compare/CompareTable";

// The Compare Accounts tool body (picker → loader → head-to-head). Rendered
// inside ToolsLayout at /tools/compare; reads the pair from ?a=&b=.
const CompareTool: React.FC = () => {
  const router = useRouter();
  const { t, locale } = useI18n();

  const rawA = typeof router.query.a === "string" ? router.query.a : "";
  const rawB = typeof router.query.b === "string" ? router.query.b : "";
  const a = trimAccountName(rawA);
  const b = trimAccountName(rawB);
  const bothChosen = !!a && !!b && a !== b;

  // In the URL so a shared comparison opens on the range the sender saw.
  const queryRange = router.query.range;
  const range: CompareRange = COMPARE_RANGES.includes(
    queryRange as CompareRange
  )
    ? (queryRange as CompareRange)
    : "30d";
  const setRange = (next: CompareRange) =>
    router.replace(
      { pathname: "/tools/compare", query: { ...router.query, range: next } },
      undefined,
      { shallow: true }
    );

  // Always called (hooks rule); the underlying queries are disabled on "".
  const comparison = useAccountComparison(
    bothChosen ? a : "",
    bothChosen ? b : "",
    range
  );

  const goCompare = (na: string, nb: string) =>
    router.push({
      pathname: "/tools/compare",
      query: { a: na, b: nb, ...(range !== "30d" && { range }) },
    });

  const notFound =
    bothChosen &&
    !comparison.isLoading &&
    (comparison.aNotFound || comparison.bNotFound);

  return (
    <div className="w-full">
      {!router.isReady ? null : !bothChosen ? (
        <AccountPicker
          initialA={a}
          initialB={b}
          sameHint={!!a && a === b}
          t={t}
          onCompare={goCompare}
        />
      ) : notFound ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-rose-500">
            {comparison.aNotFound &&
              t("compare.notFoundNamed").replace("{account}", a)}
            {comparison.aNotFound && comparison.bNotFound && " · "}
            {comparison.bNotFound &&
              t("compare.notFoundNamed").replace("{account}", b)}
          </p>
          <AccountPicker
            initialA={comparison.aNotFound ? "" : a}
            initialB={comparison.bNotFound ? "" : b}
            t={t}
            onCompare={goCompare}
          />
        </div>
      ) : comparison.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <CompareHeader
            a={comparison.a}
            b={comparison.b}
            sections={comparison.sections}
            locale={locale}
            t={t}
            range={range}
            onRangeChange={setRange}
          />
          <CompareTable
            sections={comparison.sections}
            a={comparison.a}
            b={comparison.b}
            locale={locale}
            t={t}
            rangeLabel={t(`compare.window.${range}`)}
          />
        </>
      )}
    </div>
  );
};

export default CompareTool;
