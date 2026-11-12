import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import Seo from "@/components/seo/Seo";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import PageTitle from "@/components/PageTitle";
import ErrorMessage from "@/components/ErrorMessage";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePlaceholderRows from "@/components/ui/TablePlaceholderRows";
import useHardforks from "@/hooks/api/common/useHardforks";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { eraDuration, hardforkAnchor, hardforkDate } from "@/utils/hardforks";
import {
  formatAndDelocalizeFromTime,
  formatAndDelocalizeTime,
} from "@/utils/TimeUtils";

// The URL hash without "#". Next's asPath lacks it on a fresh load, and CSS
// :target misses hashes set by client-side navigation, so read the location
// and follow both kinds of change. Empty during SSR and hydration.
const useLocationHash = () => {
  const { events } = useRouter();
  const subscribe = useCallback(
    (onChange: () => void) => {
      events.on("hashChangeComplete", onChange);
      events.on("routeChangeComplete", onChange);
      window.addEventListener("hashchange", onChange);
      return () => {
        events.off("hashChangeComplete", onChange);
        events.off("routeChangeComplete", onChange);
        window.removeEventListener("hashchange", onChange);
      };
    },
    [events]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash.slice(1),
    () => ""
  );
};

const HardforksPage = ({ meta }: { meta: SeoMeta }) => {
  const { t, locale } = useI18n();
  const {
    hardforks,
    isHardforksLoading,
    isHardforksError,
    isHardforksUnsupported,
  } = useHardforks();
  // The current era runs until now; read once so renders stay pure.
  const [now] = useState(() => Date.now());

  // The row a link like /hardforks#hf-24 (from a block page) points at.
  const targetId = useLocationHash();

  // On a fresh load the rows arrive after the browser's own jump to the hash.
  useEffect(() => {
    if (!hardforks?.length || !targetId) return;
    document.getElementById(targetId)?.scrollIntoView();
  }, [hardforks, targetId]);

  const formatEra = (ms: number) => {
    const { value, unit } = eraDuration(ms);
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    }).format(value);
  };

  // Newest first; each era lasts until the next hardfork, the current one until now.
  const rows = (hardforks ?? [])
    .map((hardfork, index, all) => {
      const next = all[index + 1];
      const end = next ? hardforkDate(next).getTime() : now;
      return {
        hardfork,
        isCurrent: !next,
        eraMs: end - hardforkDate(hardfork).getTime(),
      };
    })
    .reverse();

  const current = rows[0]?.hardfork;

  const renderBody = () => {
    if (isHardforksLoading) return <TablePlaceholderRows columns={4} />;
    if (rows.length === 0)
      return (
        <TableRow>
          <TableCell colSpan={4} className="py-6 text-center">
            {t("hardforksPage.empty")}
          </TableCell>
        </TableRow>
      );
    return rows.map(({ hardfork, isCurrent, eraMs }) => (
      <TableRow
        key={hardfork.hardfork_num}
        id={hardforkAnchor(hardfork.hardfork_num)}
        data-testid="hardfork-row"
        className={cn(
          "scroll-mt-24",
          targetId === hardforkAnchor(hardfork.hardfork_num) && "bg-rowHover"
        )}
      >
        <TableCell className="font-semibold whitespace-nowrap">
          HF{hardfork.hardfork_num}
          {isCurrent && (
            <span className="ms-2 rounded-full bg-link/10 px-2 py-0.5 text-xs font-medium text-link">
              {t("hardforksPage.current")}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Link
            href={`/block/${hardfork.block_num}`}
            className="text-link"
            data-testid="hardfork-block-link"
          >
            {hardfork.block_num.toLocaleString(locale)}
          </Link>
        </TableCell>
        <TableCell>
          <div className="whitespace-nowrap">
            {formatAndDelocalizeTime(hardfork.timestamp)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatAndDelocalizeFromTime(hardfork.timestamp, locale)}
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {isCurrent
            ? t("hardforksPage.eraSoFar", { duration: formatEra(eraMs) })
            : formatEra(eraMs)}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Seo meta={meta} />
      <div className="page-container">
        <PageTitle titleKey="pageTitle.hardforks" className="py-4" />

        {isHardforksError ? (
          <ErrorMessage
            message={
              isHardforksUnsupported
                ? t("hardforksPage.unsupported")
                : t("hardforksPage.errorMessage")
            }
          />
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {current && (
              <p className="px-1 text-sm" data-testid="hardforks-summary">
                {t("hardforksPage.summary", {
                  count: rows.length,
                  num: current.hardfork_num,
                  date: formatAndDelocalizeTime(current.timestamp),
                })}
              </p>
            )}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table aria-busy={isHardforksLoading}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("hardforksPage.columnHardfork")}</TableHead>
                      <TableHead>{t("hardforksPage.columnBlock")}</TableHead>
                      <TableHead>{t("hardforksPage.columnDate")}</TableHead>
                      <TableHead>{t("hardforksPage.columnEra")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{renderBody()}</TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/hardforks",
        seoText("seo.hardforks.title"),
        seoText("seo.hardforks.description")
      ),
    },
  };
};

export default HardforksPage;
