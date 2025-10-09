import { useState } from "react";
import { useRouter } from "next/router";
import { Filter, ChartNoAxesCombined, List, MessageSquare, ArrowRightLeft } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTabContent from "./operations/OperationsTabContent";
import InteractionsTabContent from "./interactions/InteractionsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";
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
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex-col w-full"
    >
      <TabsList className="flex w-full justify-between p-0 h-auto bg-muted text-muted-foreground">
        <div className="flex items-center">
          <TabsTrigger
            value="operations"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("accountOperationViewTabs.operations")}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("accountOperationViewTabs.comments")}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="interactions"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("accountOperationViewTabs.interactions")}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground flex items-center gap-2"
          >
            <ChartNoAxesCombined className="h-4 w-6" color="#10b981" />
            <span className="hidden sm:inline">
              {t("accountOperationViewTabs.analytics")}
            </span>
          </TabsTrigger>
        </div>
        <div>
          {activeTab !== "analytics" && (
            <FilterSectionToggle
              isFiltersActive={isFiltersActive}
              toggleFilters={handleFiltersVisibility}
            />
          )}
        </div>
      </TabsList>

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
