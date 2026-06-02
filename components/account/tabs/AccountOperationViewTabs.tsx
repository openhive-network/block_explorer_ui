import { useState } from "react";
import { useRouter } from "next/router";
import {
  ChartNoAxesCombined,
  List,
  MessageSquare,
  ArrowRightLeft,
  Wallet,
  Zap,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import OperationTabContent from "./operations/OperationsTabContent";
import InteractionsTabContent from "./interactions/InteractionsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";
import BalanceHistoryTabContent from "./balanceHistory/BalanceHistoryTabContent";
import PowerActivityTabContent from "./powerActivity/PowerActivityTabContent";
import { useTabs } from "@/contexts/TabsContext";
import FilterSectionToggle from "../FilterSectionToggle";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";
import Explorer from "@/types/Explorer";
import AnalyticsTabContent from "./analytics/AnalyticsTabContent";

interface AccountOperationViewTabs {
  accountName: string;
  liveDataEnabled: boolean;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
}

const AccountOperationViewTabs: React.FC<AccountOperationViewTabs> = ({
  liveDataEnabled,
  accountName,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const { activeTab, setActiveTab } = useTabs();

  const [
    isOperationsFilterSectionVisible,
    setIsOperationsFilterSectionVisible,
  ] = useState(getLocalStorage("is_operations_filters_visible", true) ?? false);
  const [isCommentsFilterSectionVisible, setIsCommentsFilterSectionVisible] =
    useState(getLocalStorage("is_comments_filters_visible", true) ?? false);
  const [
    isInteractionsFilterSectionVisible,
    setIsInteractionsFilterSectionVisible,
  ] = useState(
    getLocalStorage("is_interactions_filters_visible", true) ?? true
  );
  const [
    isBalanceHistoryFilterSectionVisible,
    setIsBalanceHistoryFilterSectionVisible,
  ] = useState(getLocalStorage("is_balance_filters_visible", true) ?? false);
  const [
    isPowerActivityFilterSectionVisible,
    setIsPowerActivityFilterSectionVisible,
  ] = useState(
    getLocalStorage("is_power_activity_filters_visible", true) ?? false
  );

  const [isFiltersActive, setIsFiltersActive] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsFiltersActive(false);
    router.push(
      {
        pathname: `/${router.query.accountName}`,
        query: { activeTab: value },
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  const handleFiltersVisibility = () => {
    if (activeTab === "operations") {
      setIsOperationsFilterSectionVisible(!isOperationsFilterSectionVisible);
      if (isFiltersActive) {
        setLocalStorage(
          "is_operations_filters_visible",
          !isOperationsFilterSectionVisible
        );
      }
    }
    if (activeTab === "comments") {
      setIsCommentsFilterSectionVisible(!isCommentsFilterSectionVisible);
      if (isFiltersActive) {
        setLocalStorage(
          "is_comments_filters_visible",
          !isCommentsFilterSectionVisible
        );
      }
    }
    if (activeTab === "interactions") {
      setIsInteractionsFilterSectionVisible(
        !isInteractionsFilterSectionVisible
      );
      if (isFiltersActive) {
        setLocalStorage(
          "is_interactions_filters_visible",
          !isInteractionsFilterSectionVisible
        );
      }
    }
    if (activeTab === "balance-history") {
      setIsBalanceHistoryFilterSectionVisible(
        !isBalanceHistoryFilterSectionVisible
      );
      if (isFiltersActive) {
        setLocalStorage(
          "is_balance_filters_visible",
          !isBalanceHistoryFilterSectionVisible
        );
      }
    }
    if (activeTab === "power-activity") {
      setIsPowerActivityFilterSectionVisible(
        !isPowerActivityFilterSectionVisible
      );
      if (isFiltersActive) {
        setLocalStorage(
          "is_power_activity_filters_visible",
          !isPowerActivityFilterSectionVisible
        );
      }
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex-col w-full"
    >
      <div className="flex w-full justify-between items-end gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabsList
          className="inline-flex items-end gap-0.5 bg-transparent p-0 h-auto rounded-none overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
        >
          {(
            [
              {
                value: "operations",
                icon: List,
                labelKey: "accountOperationViewTabs.operations",
                iconColor: "#3b82f6",
              },
              {
                value: "comments",
                icon: MessageSquare,
                labelKey: "accountOperationViewTabs.comments",
                iconColor: "#8b5cf6",
              },
              {
                value: "interactions",
                icon: ArrowRightLeft,
                labelKey: "accountOperationViewTabs.interactions",
                iconColor: "#06b6d4",
              },
              {
                value: "balance-history",
                icon: Wallet,
                labelKey: "accountOperationViewTabs.balanceHistory",
                iconColor: "#14b8a6",
              },
              {
                value: "power-activity",
                icon: Zap,
                labelKey: "accountOperationViewTabs.powerActivity",
                iconColor: "#f59e0b",
              },
              {
                value: "analytics",
                icon: ChartNoAxesCombined,
                labelKey: "accountOperationViewTabs.analytics",
                iconColor: "#10b981",
              },
            ] as const
          ).map(({ value, icon: Icon, labelKey, iconColor }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "cursor-pointer px-3.5 py-2 text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                "rounded-tl-lg rounded-tr-lg -mb-px border border-transparent",
                "text-gray-500 dark:text-gray-400",
                "hover:text-gray-900 hover:bg-gray-100/60 dark:hover:text-gray-100 dark:hover:bg-gray-800/60",
                "data-[state=active]:bg-theme data-[state=active]:text-foreground",
                "data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600",
                "data-[state=active]:border-b-theme data-[state=active]:font-semibold data-[state=active]:shadow-[0_-1px_2px_rgba(0,0,0,0.03)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" color={iconColor} />
              <span className="hidden sm:inline">{t(labelKey)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {activeTab !== "analytics" && (
          <div className="pb-1 pr-1">
            <FilterSectionToggle
              isFiltersActive={isFiltersActive}
              toggleFilters={handleFiltersVisibility}
            />
          </div>
        )}
      </div>

      <div className="bg-theme">
        <div className="pt-4">
          <OperationTabContent
            isVisible={isOperationsFilterSectionVisible}
            setIsVisible={setIsOperationsFilterSectionVisible}
            setIsFiltersActive={setIsFiltersActive}
            liveDataEnabled={liveDataEnabled}
            isFiltersActive={isFiltersActive}
          />
        </div>
        <div>
          <CommentsTabContent
            isVisible={isCommentsFilterSectionVisible}
            setIsVisible={setIsCommentsFilterSectionVisible}
            setIsFiltersActive={setIsFiltersActive}
            isFiltersActive={isFiltersActive}
          />
        </div>
        <div>
          <InteractionsTabContent
            isVisible={isInteractionsFilterSectionVisible}
            setIsVisible={setIsInteractionsFilterSectionVisible}
            setIsFiltersActive={setIsFiltersActive}
            isFiltersActive={isFiltersActive}
          />
        </div>
        {activeTab === "balance-history" && (
          <div className="pt-4">
            <BalanceHistoryTabContent
              isVisible={isBalanceHistoryFilterSectionVisible}
              setIsVisible={setIsBalanceHistoryFilterSectionVisible}
              setIsFiltersActive={setIsFiltersActive}
              isFiltersActive={isFiltersActive}
            />
          </div>
        )}
        {activeTab === "power-activity" && (
          <div className="pt-4">
            <PowerActivityTabContent
              isVisible={isPowerActivityFilterSectionVisible}
              setIsVisible={setIsPowerActivityFilterSectionVisible}
              setIsFiltersActive={setIsFiltersActive}
              isFiltersActive={isFiltersActive}
            />
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="py-4">
            <AnalyticsTabContent
              dynamicGlobalData={dynamicGlobalData}
              accountName={accountName}
              liveDataEnabled={liveDataEnabled}
            />
          </div>
        )}
      </div>
    </Tabs>
  );
};
export default AccountOperationViewTabs;
