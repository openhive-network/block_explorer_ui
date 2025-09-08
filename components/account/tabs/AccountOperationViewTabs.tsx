import { useState } from "react";
import { useRouter } from "next/router";
import { Filter } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTabContent from "./operations/OperationsTabContent";
import InteractionsTabContent from "./interactions/InteractionsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";
import { useTabs } from "@/contexts/TabsContext";
import FilterSectionToggle from "../FilterSectionToggle";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { useI18n } from "@/i18n/i18n";

interface AccountOperationViewTabs {
  liveDataEnabled: boolean;
}

const AccountOperationViewTabs: React.FC<AccountOperationViewTabs> = ({
  liveDataEnabled,
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
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground"
          >
            {t("accountOperationViewTabs.operations")}
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground"
          >
            {t("accountOperationViewTabs.comments")}
          </TabsTrigger>
          <TabsTrigger
            value="interactions"
            className="rounded-t-[3px] rounded-b-none cursor-pointer px-4 py-3 data-[state=active]:bg-theme data-[state=active]:text-foreground"
          >
            {t("accountOperationViewTabs.interactions")}
          </TabsTrigger>
        </div>
        <div>
          <FilterSectionToggle
            isFiltersActive={isFiltersActive}
            toggleFilters={handleFiltersVisibility}
          />
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
      </div>
    </Tabs>
  );
};
export default AccountOperationViewTabs;
