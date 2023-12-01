import useCommentSearch from "@/api/common/useCommentSearch";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Explorer from "@/types/Explorer";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Comments: React.FC = () => {
  const [accountName, setAccountName] = useState<string>();
  const [permlink, setPermlink] = useState<string>();
  const [fromBlock, setFromBlock] = useState<number>();
  const [toBlock, setToBlock] = useState<number>();
  const commentSearch = useCommentSearch();
  const [previousCommentSearchProps, setPreviousCommentSearchProps] = useState<Explorer.CommentSearchProps | undefined>(undefined);

  const startCommentSearch = () => {
    if (accountName) {
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName,
        permlink,
        fromBlock,
        toBlock
      };
      commentSearch.searchCommentOperations(commentSearchProps);
      setPreviousCommentSearchProps(commentSearchProps);
    }
  }

  console.log(commentSearch)

  return (
    <div className="w-full md:w-4/5">
      <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px] w-full">
        <div className="flex flex-col m-2">
          <label className="mx-2">Account name</label>
          <Input
            className="w-1/2"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="---"
          />
        </div>
        <div className="flex m-2 flex-col">
          <label className="mx-2">Permlink</label>
          <Input
            className="w-full"
            type="text"
            value={permlink}
            onChange={(e) => setPermlink(e.target.value)}
            placeholder="---"
          />
        </div>
        <div className="flex items-center m-2">
          <div className="flex flex-col w-full">
            <label className="mx-2">From block</label>
            <Input
              type="number"
              value={fromBlock}
              onChange={(e) => setFromBlock(Number(e.target.value))}
              placeholder="1"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="mx-2">To block</label>
            <Input
              type="number"
              value={toBlock}
              onChange={(e) => setToBlock(Number(e.target.value))}
              placeholder={"Headblock"}
            />
          </div>
        </div>
        <div className="flex items-center  m-2">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
            onClick={() => startCommentSearch()}
            disabled={!accountName?.length}
          >
            <span>Search</span>{" "}
            {commentSearch.commentSearchDataLoading && (
              <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
            )}
          </Button>
          {false && (
            <label className="ml-2 text-muted-foreground">
              Set account name
            </label>
          )}
        </div>
      </div>
      {commentSearch.commentSearchData?.operations_result.map((foundOperation) => (
        <DetailedOperationCard
          className="my-6 text-white"
          operation={foundOperation.body}
          key={foundOperation.operation_id}
          blockNumber={foundOperation.block_num}
          date={foundOperation.created_at}
        />
      ))}
    </div>
  );
};

export default Comments;
