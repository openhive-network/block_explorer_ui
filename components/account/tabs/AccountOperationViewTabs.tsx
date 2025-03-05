import { useState } from "react";
import { useRouter } from "next/router";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTabContent from "./operations/OperationsTabContent";
import InteractionsTabContent from "./interactions/InteractionsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";
import { useTabs } from "@/contexts/TabsContext";
import FilterSectionToggle from "../FilterSectionToggle";

interface AccountOperationViewTabs {
  liveDataEnabled: boolean;
}

const AccountOperationViewTabs: React.FC<AccountOperationViewTabs> = ({
  liveDataEnabled,
}) => {
  const router = useRouter();
  const { activeTab, setActiveTab } = useTabs();
  const [
    isOperationsFilterSectionVisible,
    setIsOperationsFilterSectionVisible,
  ] = useState(false);
  const [isCommentsFilterSectionVisible, setIsCommentsFilterSectionVisible] =
    useState(false);
  const [
    isInteractionsFilterSectionVisible,
    setIsInteractionsFilterSectionVisible,
  ] = useState(true);

  const [isFiltersActive, setIsFiltersActive] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
    }
    if (activeTab === "comments") {
      setIsCommentsFilterSectionVisible(!isCommentsFilterSectionVisible);
    }
    if (activeTab === "interactions") {
      setIsInteractionsFilterSectionVisible(
        !isInteractionsFilterSectionVisible
      );
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex-col w-full"
    >
      <TabsList className="flex w-full justify-between">
        <div className="bg-theme p-1 flex gap-2 rounded w-auto">
          <TabsTrigger
            className="rounded cursor-pointer hover:bg-buttonHover"
            value="operations"
          >
            Operations
          </TabsTrigger>
          <TabsTrigger
            className="rounded cursor-pointer hover:bg-buttonHover"
            value="comments"
          >
            Comments
          </TabsTrigger>
          <TabsTrigger
            className="rounded cursor-pointer hover:bg-buttonHover"
            value="interactions"
          >
            Interactions
          </TabsTrigger>
        </div>
        <div>
          <FilterSectionToggle
            isFiltersActive={isFiltersActive}
            toggleFilters={handleFiltersVisibility}
          />
        </div>
      </TabsList>

      <OperationTabContent
        isVisible={isOperationsFilterSectionVisible}
        setIsVisible={setIsOperationsFilterSectionVisible}
        setIsFiltersActive={setIsFiltersActive}
        liveDataEnabled={liveDataEnabled}
      />
      <CommentsTabContent
        isVisible={isCommentsFilterSectionVisible}
        setIsVisible={setIsCommentsFilterSectionVisible}
        setIsFiltersActive={setIsFiltersActive}
      />
      <InteractionsTabContent
        isVisible={isInteractionsFilterSectionVisible}
        setIsVisible={setIsInteractionsFilterSectionVisible}
        setIsFiltersActive={setIsFiltersActive}
      />
    </Tabs>
  );
};
export default AccountOperationViewTabs;
