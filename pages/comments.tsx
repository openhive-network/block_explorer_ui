import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import React from "react";

const Comments: React.FC = () => {
  const router = useRouter();

  return (
    <div>
      <div className="bg-explorer-dark-gray text-white p-4 rounded-[6px]">
        <div className="flex items-center m-2 ">
          {/* <OperationTypesDialog
            operationTypes={operationsTypes.filter((opType) =>
              config.commentOperationsTypeIds.includes(opType.op_type_id)
            )}
            selectedOperations={selectedCommentSearchOperationTypes}
            setSelectedOperations={setSelectedCommentSearchOperationTypes}
            colorClass="bg-gray-500"
            triggerTitle={getOperationButtonTitle()}
            desktopPercentageSize={50}
          /> */}
        </div>
        <div className="flex flex-col m-2">
          <label className="mx-2">Account name</label>
          <Input
            className="w-1/2"
            type="text"
            value={""}
            onChange={(e) => null}
            placeholder="---"
          />
        </div>
        <div className="flex m-2 flex-col">
          <label className="mx-2">Permlink</label>
          <Input
            className="w-full"
            type="text"
            value={""}
            onChange={(e) => null}
            placeholder="---"
          />
        </div>
        <div className="flex items-center  m-2">
          <div className="flex flex-col w-full">
            <label className="mx-2">From block</label>
            <Input
              type="number"
              value={""}
              onChange={(e) => null}
              placeholder="1"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="mx-2">To block</label>
            <Input
              type="number"
              value={""}
              onChange={(e) => null}
              placeholder={"Headblock"}
            />
          </div>
        </div>
        <div className="flex items-center  m-2">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded-[4px]"
            onClick={() => null}
            disabled={false}
          >
            <span>Search</span>{" "}
            {/* {loading && (
              <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
            )} */}
          </Button>
          {false && (
            <label className="ml-2 text-muted-foreground">
              Set account name
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
