import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, ExternalLink, X } from "lucide-react";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";
import useAccountRcFootprintTimeline from "@/hooks/api/accountPage/useAccountRcFootprintTimeline";
import { formatRc } from "./rcFootprintUtils";

// Hive protocol op-type id for custom_json_operation (the ops RC footprint covers).
const CUSTOM_JSON_OP_TYPE_ID = 18;

interface RcFootprintDrilldownProps {
  accountName: string;
  dapp: string;
  category: string;
  fromDate: string;
  toDate: string;
  onClose: () => void;
}

const RcFootprintDrilldown: React.FC<RcFootprintDrilldownProps> = ({
  accountName,
  dapp,
  category,
  fromDate,
  toDate,
  onClose,
}) => {
  const { t, locale } = useI18n();
  const router = useRouter();

  const {
    rows,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAccountRcFootprintTimeline(accountName, dapp, fromDate, toDate);

  const openInOperations = () => {
    // The Operations tab decodes date params only in the app's
    // "YYYY.MM.DD_HH.mm.ss" form (utils/URLutils); a plain ISO day stays a
    // string and crashes the date picker. from/to are "YYYY-MM-DD".
    const encodeDay = (day: string, endOfDay: boolean) =>
      `${day.replaceAll("-", ".")}_${endOfDay ? "23.59.59" : "00.00.00"}`;
    // Pre-filter Operations to custom_json (same hex-flag encoding the tab uses).
    const filters = dataToURL(
      convertIdsToBooleanArray([CUSTOM_JSON_OP_TYPE_ID])
    );
    router.push(
      {
        pathname: `/@${accountName}`,
        query: {
          activeTab: "operations",
          rangeSelectKey: "timeRange",
          fromDate: encodeDay(fromDate, false),
          toDate: encodeDay(toDate, true),
          filters,
        },
      },
      undefined,
      { shallow: false }
    );
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h4 className="min-w-0 truncate text-sm font-semibold">
          {t("rcFootprint.eventsForDapp", { dapp })}
        </h4>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("rcFootprint.close")}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : isError ? (
          <p className="text-red-500 text-sm py-4">
            {t("common.errorLoadingData")}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">
            {t("common.noDataAvailable")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-1.5 pe-3 font-medium">
                    {t("rcFootprint.colTime")}
                  </th>
                  <th className="py-1.5 pe-3 font-medium">
                    {t("rcFootprint.colBlock")}
                  </th>
                  <th className="py-1.5 pe-3 font-medium">
                    {t("rcFootprint.colCustomJsonId")}
                  </th>
                  <th className="py-1.5 text-end font-medium">
                    {t("rcFootprint.colRcEst")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.op_seq}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-1.5 pe-3 whitespace-nowrap tabular-nums text-gray-600 dark:text-gray-300">
                      {moment.utc(r.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                    <td className="py-1.5 pe-3 whitespace-nowrap">
                      <Link
                        href={`/block/${r.block_num}`}
                        className="text-link hover:underline tabular-nums"
                      >
                        {r.block_num.toLocaleString(locale)}
                      </Link>
                    </td>
                    <td className="py-1.5 pe-3 truncate max-w-[200px]">
                      {r.custom_json_id ?? "—"}
                    </td>
                    <td className="py-1.5 text-end tabular-nums text-gray-600 dark:text-gray-300">
                      ~{formatRc(r.rc_consumed, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasNextPage && (
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                  )}
                  {t("rcFootprint.loadMore")}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          <button
            type="button"
            onClick={openInOperations}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-link hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("rcFootprint.viewInOperations", { category })}
          </button>
          <p className="text-[11px] text-gray-400">
            {t("rcFootprint.timelineEstimateNote")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RcFootprintDrilldown;
