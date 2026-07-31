import type { GetServerSideProps } from "next";
import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/i18n/i18n";

// Balance History was moved into the account page as a tab. This route
// preserves backward-compatibility — anything pointing at
// /balanceHistory/@user redirects to /@user?activeTab=balance-history while
// forwarding the rest of the URL params so chart/table state survives.
export default function BalanceHistoryRedirect() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.accountName;
    const accountName = Array.isArray(raw) ? raw[0] : raw;
    if (!accountName) return;
    const target = accountName.startsWith("@")
      ? accountName
      : `@${accountName}`;
    const { accountName: _drop, ...forwardedQuery } = router.query;
    router.replace(
      {
        pathname: `/${target}`,
        query: { ...forwardedQuery, activeTab: "balance-history" },
      },
      undefined,
      { shallow: false }
    );
  }, [router]);

  return (
    <>
      <Head>
        <title>{t("balanceHistoryPage.loadingTitle")}</title>
      </Head>
      <div className="flex justify-center text-center items-center py-10">
        <Loader2 className="animate-spin mt-1 h-12 w-12" />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res, params }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const raw = Array.isArray(params?.accountName)
    ? params?.accountName[0]
    : params?.accountName;
  const name = String(raw || "").replace(/^@/, "");
  return {
    props: {
      meta: noindexMeta(
        req,
        `/balanceHistory/${encodeURIComponent(name)}`,
        seoText("pageTitle.balanceHistory"),
        seoText("seo.balanceHistory.description")
      ),
    },
  };
};
