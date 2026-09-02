import { useState, useEffect, useRef } from "react";
import type { GetServerSideProps } from "next";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  absoluteBaseUrl,
  canonicalUrl,
  clamp,
  defaultOgImage,
  pageTitle,
  profilePageJsonLd,
  siteConfig,
  SeoMeta,
  notFoundMeta,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { isAccountName, queryStringOf } from "@/utils/seo/entityIds";
import { rpcOrNull } from "@/utils/seo/serverRpc";
import { seoText } from "@/utils/seo/seoStrings";
import ErrorPage from "@/components/ErrorPage";
import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import useConvertedAccountDetails from "@/hooks/common/useConvertedAccountDetails";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import ScrollTopButton from "@/components/ScrollTopButton";
import AccountDetailsSection from "@/components/account/AccountDetailsSection";
import MobileAccountNameCard from "@/components/account/MobileAccountNameCard";
import AccountOperationViewTabs from "@/components/account/tabs/AccountOperationViewTabs";
import { AccountTabsProvider } from "@/contexts/TabsContext";
import { useI18n } from "@/i18n/i18n";
import useCommunity from "@/hooks/api/accountPage/useCommunity";
import { useSettings } from "@/contexts/SettingsContext";
import SidebarToggleButton from "@/components/SideBarToggleButton";

// Meta copy only, so a slow node falls back to the bare id rather than holding the render.
const COMMUNITY_LOOKUP_TIMEOUT_MS = 2500;

export interface AccountSearchParams {
  accountName?: string | undefined;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
  filters: boolean[];
  activeTab?: "operations" | "comments" | "interactions";
  history: [];
  direction?: "include" | "exclude" | undefined;
}

export const defaultSearchParams: AccountSearchParams = {
  accountName: undefined,
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  timeUnit: "days",
  rangeSelectKey: "none",
  page: undefined,
  filters: [],
  history: [],
};

interface AccountPageProps {
  // SEO meta rendered server-side by the app-level <Seo> in _app.tsx (which sits
  // above the hiveChain-gated Layout, so it actually reaches the crawler HTML).
  meta: SeoMeta;
}

export default function Account() {
  const { t } = useI18n();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );
  const { settings, updateSettings } = useSettings();
  const liveDataEnabled = settings.liveData;
  const changeLiveRefresh = () => {
    updateSettings({
      liveData: !settings.liveData,
    });
  };

  const [showMobileAccountDetails, setShowMobileAccountDetails] =
    useState(false);
  const [
    isDesktopAccountDetailsCollapsed,
    setIsDesktopAccountDetailsCollapsed,
  ] = useState(false);

  // Collapse the sidebar on Analytics for full width; restore on leave, but only
  // if we auto-collapsed it (don't override a manual collapse).
  const autoCollapsedSidebarRef = useRef(false);
  useEffect(() => {
    if (router.query.activeTab === "analytics") {
      setIsDesktopAccountDetailsCollapsed(true);
      autoCollapsedSidebarRef.current = true;
    } else if (autoCollapsedSidebarRef.current) {
      setIsDesktopAccountDetailsCollapsed(false);
      autoCollapsedSidebarRef.current = false;
    }
  }, [router.query.activeTab]);

  const { dynamicGlobalData } = useDynamicGlobal();
  const {
    formattedAccountDetails: accountDetails,
    notFound,
    isAccountDetailsLoading,
  } = useConvertedAccountDetails(
    accountNameFromRoute,
    liveDataEnabled,
    dynamicGlobalData
  );

  //Check if the account name is a community
  const isCommunityAccount = accountNameFromRoute?.startsWith("hive-");
  const { communityDetails } = useCommunity(
    isCommunityAccount && !isAccountDetailsLoading && !notFound
      ? accountNameFromRoute
      : null
  );

  const renderAccountDetailsView = () => {
    if (isMobile) {
      return (
        <>
          <SidebarToggleButton
            isCollapsed={true}
            onClick={() => setShowMobileAccountDetails(true)}
          />

          <div
            className={cn(
              "fixed top-0 left-0 p-5 bg-theme dark:bg-theme w-full h-full -translate-x-full duration-500 z-50 overflow-auto",
              { "-translate-x-0": showMobileAccountDetails }
            )}
          >
            <div className="w-full flex items-center justify-end">
              <X
                onClick={() => setShowMobileAccountDetails(false)}
                height={40}
                width={40}
                className="cursor-pointer"
              />
            </div>
            <AccountDetailsSection
              accountName={accountNameFromRoute}
              liveDataEnabled={liveDataEnabled}
              changeLiveRefresh={changeLiveRefresh}
              accountDetails={accountDetails}
              communityDetails={communityDetails}
              dynamicGlobalData={dynamicGlobalData}
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <SidebarToggleButton
            isCollapsed={isDesktopAccountDetailsCollapsed}
            onClick={() => setIsDesktopAccountDetailsCollapsed((prev) => !prev)}
          />
          {!isDesktopAccountDetailsCollapsed && (
            <div className="col-start-1 col-span-1 flex flex-col gap-y-2">
              <AccountDetailsSection
                accountName={accountNameFromRoute}
                liveDataEnabled={liveDataEnabled}
                changeLiveRefresh={changeLiveRefresh}
                accountDetails={accountDetails}
                communityDetails={communityDetails}
                dynamicGlobalData={dynamicGlobalData}
              />
            </div>
          )}
        </>
      );
    }
  };

  // get the accountName and treat it as a string
  const routeAccountName = Array.isArray(router.query.accountName)
    ? router.query.accountName[0] // If it's an array, get the first element
    : router.query.accountName; // Otherwise, treat it as a string directly

  if (routeAccountName && !routeAccountName.startsWith("@")) {
    return <ErrorPage />;
  }

  if (notFound && !isAccountDetailsLoading) {
    const accountNotFoundError = `${routeAccountName} : ${t(
      "accountName.accountNotFound"
    )}`;
    if (notFound && !isAccountDetailsLoading) {
      return <ErrorPage errorMessage={accountNotFoundError} />;
    }
  }

  if (!accountDetails) {
    return (
      <>
        <Loader2 className="animate-spin mt-1 text-black dark:text-white h-12 w-12 ml-3 ..." />
      </>
    );
  }

  return (
    <AccountTabsProvider>
      <Head>
        <title>
          {pageTitle(`@${communityDetails?.title || accountNameFromRoute}`)}
        </title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-3 text-white page-container gap-4">
        {isMobile && (
          <MobileAccountNameCard
            accountName={accountNameFromRoute}
            communityName={communityDetails?.title}
            liveDataEnabled={liveDataEnabled}
            accountDetails={accountDetails}
          />
        )}

        {renderAccountDetailsView()}
        <div
          className={cn(
            "col-start-1 col-span-1",
            !isMobile &&
              (isDesktopAccountDetailsCollapsed
                ? "md:col-start-1 md:col-span-3"
                : "md:col-start-2 md:col-span-2")
          )}
          data-testid="account-operation-list"
        >
          <AccountOperationViewTabs
            liveDataEnabled={liveDataEnabled}
            accountName={accountDetails.name}
            dynamicGlobalData={dynamicGlobalData}
          />
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </AccountTabsProvider>
  );
}

export const getServerSideProps: GetServerSideProps<AccountPageProps> = async ({
  params,
  req,
  res,
  resolvedUrl,
}) => {
  const raw = Array.isArray(params?.accountName)
    ? params?.accountName[0]
    : params?.accountName;
  const segment = String(raw || "");
  const name = segment.replace(/^@/, "").replace(/^%40/i, "");
  const qs = queryStringOf(resolvedUrl);

  // Hive names are lowercase; a capitalised link is the same account, not a miss.
  if (name !== name.toLowerCase() && isAccountName(name.toLowerCase())) {
    return {
      redirect: {
        destination: `/@${name.toLowerCase()}${qs}`,
        permanent: true,
      },
    };
  }

  // Catches every unclaimed single-segment path: a non-name is a 404, and its text never reaches our meta.
  if (!isAccountName(name)) {
    res.statusCode = 404;
    return { props: { meta: notFoundMeta(seoText("seo.notFound.title")) } };
  }

  // /name and /@name are the same page; only the @ form is linked and indexed.
  if (!segment.startsWith("@") && !/^%40/i.test(segment)) {
    return { redirect: { destination: `/@${name}${qs}`, permanent: true } };
  }

  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const canonical = canonicalUrl({ headers: req.headers }, `/@${name}`);

  // Resolve the real community name server-side: "@hive-167922" is not what anyone searches for.
  // Only a resolved title makes it a community; a plain account that happens to
  // start with "hive-" falls through and gets account copy.
  if (name.startsWith("hive-")) {
    const details = await rpcOrNull<{ title?: string; about?: string }>(
      "bridge.get_community",
      { name },
      COMMUNITY_LOOKUP_TIMEOUT_MS
    );
    // Chain-supplied text is owner-controlled, so collapse and cap it before use.
    const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
    const communityTitle = clamp(oneLine(details?.title || ""), 60);
    if (communityTitle) {
      const about = oneLine(details?.about || "");
      return {
        props: {
          meta: {
            title: pageTitle(
              seoText("seo.community.title", { title: communityTitle })
            ),
            description: clamp(
              about ||
                seoText("seo.community.description", {
                  name: communityTitle,
                  site: siteConfig.name,
                })
            ),
            canonical,
            ogType: "website",
            ogImage: defaultOgImage(absoluteBaseUrl({ headers: req.headers })),
            ogImageAlt: communityTitle,
          },
        },
      };
    }
  }

  const title = pageTitle(`@${name}`);

  // Same base as the canonical above: prefers the configured origin so a spoofed
  // Host can't redirect the share card. Only absolute bases are usable here.
  const base = absoluteBaseUrl({ headers: req.headers });
  const ogImageUrl = /^https?:\/\//i.test(base)
    ? `${base}/api/og/account/${encodeURIComponent(name)}`
    : null;

  const description = clamp(
    seoText("seo.account.description", { name, site: siteConfig.name })
  );

  return {
    props: {
      meta: {
        title,
        description,
        canonical,
        ogImage: ogImageUrl,
        ogImageAlt: `@${name}`,
        ogType: "profile",
        jsonLd: canonical
          ? profilePageJsonLd(canonical, `@${name}`)
          : undefined,
      },
    },
  };
};
