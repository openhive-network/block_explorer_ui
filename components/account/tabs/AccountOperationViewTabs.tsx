import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTabContent from "./operations/OperationsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";
import PostsTabContent from "./posts/PostsTabContent";
import { useTabs } from "@/contexts/TabsContext";

interface AccountOperationViewTabs {
  liveDataEnabled: boolean;
}

const AccountOperationViewTabs: React.FC<AccountOperationViewTabs> = ({
  liveDataEnabled,
}) => {
  const { activeTab, setActiveTab } = useTabs();

  const handleTabChange = (value: string) => setActiveTab(value);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex-col w-full"
    >
      <TabsList className="flex w-full justify-start">
        <div className="bg-theme p-1 flex gap-2 rounded w-auto">
          <TabsTrigger
            className="rounded"
            value="operations"
          >
            Operations
          </TabsTrigger>
          <TabsTrigger
            className="rounded"
            value="posts"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            className="rounded"
            value="comments"
          >
            Comment Search
          </TabsTrigger>
        </div>
      </TabsList>
      <OperationTabContent liveDataEnabled={liveDataEnabled} />
      <PostsTabContent />
      <CommentsTabContent />
    </Tabs>
  );
};
export default AccountOperationViewTabs;
