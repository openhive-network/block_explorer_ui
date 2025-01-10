import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationTabContent from "./operations/OperationsTabContent";
import CommentsTabContent from "./comments/CommentsTabContent";

interface AccountOperationViewTabs {
  liveDataEnabled: boolean;
}

const AccountOperationViewTabs: React.FC<AccountOperationViewTabs> = ({
  liveDataEnabled,
}) => {
  return (
    <Tabs
      defaultValue="operations"
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
            value="comments"
          >
            Comment Search
          </TabsTrigger>
        </div>
      </TabsList>
      <OperationTabContent liveDataEnabled={liveDataEnabled} />
      <CommentsTabContent />
    </Tabs>
  );
};

export default AccountOperationViewTabs;
