import { useState } from "react";
import { Loader2, ArrowBigRightDash, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import AccountOperationViewTabs from "@/components/account/tabs/AccountOperationViewTabs";
import { AccountTabsProvider } from "@/contexts/TabsContext";
import moment from "moment";

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
};

export default function Account() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );

  const [liveDataEnabled, setLiveDataEnabled] = useState(false);

  const changeLiveRefresh = () => {
    setLiveDataEnabled((prev) => !prev);
  };

  const [showMobileAccountDetails, setShowMobileAccountDetails] =
    useState(false);

  const { dynamicGlobalData } = useDynamicGlobal();
  const { formattedAccountDetails: accountDetails, notFound } =
    useConvertedAccountDetails(
      accountNameFromRoute,
      liveDataEnabled,
      dynamicGlobalData
    );

  const renderAccountDetailsView = () => {
    if (isMobile) {
      return (
        <>
          <div className="fixed pl-0 left-0 top-[50%] z-50">
            <Button
              className="flex justify-center bg-explorer-orange h-[100px] w-[40px] hover:bg-orange-300 align-center [writing-mode:vertical-lr] text-explorer-gray-dark rounded-r"
              onClick={() => setShowMobileAccountDetails(true)}
            >
              <ArrowBigRightDash size={30} />
            </Button>
          </div>

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
              dynamicGlobalData={dynamicGlobalData}
            />
          </div>
        </>
      );
    } else {
      return (
        <div className="col-start-1 col-span-1 flex flex-col gap-y-2">
          <AccountDetailsSection
            accountName={accountNameFromRoute}
            liveDataEnabled={liveDataEnabled}
            changeLiveRefresh={changeLiveRefresh}
            accountDetails={accountDetails}
            dynamicGlobalData={dynamicGlobalData}
          />
        </div>
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

  if (!accountDetails) {
    return (
      <Loader2 className="animate-spin mt-1 text-black dark:text-white h-12 w-12 ml-3 ..." />
    );
  }

  if (notFound) {
    return <div>Account not found</div>;
  }

  return (
    <AccountTabsProvider>
      <Head>
        <title>@{accountNameFromRoute} - Hive Explorer</title>
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-3 text-white page-container gap-4">
        {isMobile && (
          <MobileAccountNameCard
            accountName={accountNameFromRoute}
            liveDataEnabled={liveDataEnabled}
            accountDetails={accountDetails}
          />
        )}

        {renderAccountDetailsView()}
        <div
          className="col-start-1 md:col-start-2 col-span-1 md:col-span-3"
          data-testid="account-operation-list"
        >
          <AccountOperationViewTabs liveDataEnabled={liveDataEnabled} />
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </AccountTabsProvider>
  );
}
