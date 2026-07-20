import { useState, useEffect, useRef } from "react";
import type { GetServerSideProps } from "next";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/router";
import Head from "next/head";

import ErrorPage from "./ErrorPage";
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
  ogImageUrl: string | null;
  ogTitle: string | null;
}

export default function Account({ ogImageUrl, ogTitle }: AccountPageProps) {
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

  // Open Graph / Twitter card meta, built server-side (getServerSideProps) with
  // an absolute URL so crawlers — which never run the client fetch below — can
  // unfurl the share card. Rendered on every path, including the loader.
  const ogMeta =
    ogImageUrl && ogTitle ? (
      <Head>
        <meta property="og:title" content={ogTitle} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
    ) : null;

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
        {ogMeta}
        <Loader2 className="animate-spin mt-1 text-black dark:text-white h-12 w-12 ml-3 ..." />
      </>
    );
  }

  return (
    <AccountTabsProvider>
      <Head>
        <title>
          @
          {communityDetails?.title
            ? communityDetails?.title
            : accountNameFromRoute}{" "}
          - Hive Explorer
        </title>
      </Head>
      {!communityDetails && ogMeta}
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
}) => {
  const raw = Array.isArray(params?.accountName)
    ? params?.accountName[0]
    : params?.accountName;
  const name = (raw || "").replace(/^@/, "").replace(/^%40/i, "");

  // Communities (hive-*) don't get an account share card.
  if (!name || name.startsWith("hive-")) {
    return { props: { ogImageUrl: null, ogTitle: null } };
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(
    ","
  )[0];
  const proto = forwardedProto || "https";
  const host =
    (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const ogImageUrl = host
    ? `${proto}://${host}${basePath}/api/og/account/${encodeURIComponent(name)}`
    : null;

  return {
    props: {
      ogImageUrl,
      ogTitle: `@${name} on Hive`,
    },
  };
};
