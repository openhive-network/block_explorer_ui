import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Hive from "@/types/Hive";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";
import { cn } from "@/lib/utils";

type OperationTypesDialogProps = {
  operationTypes: Hive.OperationPattern[] | undefined;
  triggerTitle: string;
  selectedOperations: number[];
  buttonClassName: string;
  setSelectedOperations: (operationIds: number[]) => void;
};

const categorizedTypes = [
  {
    name: "Posting",
    types: [
      "comment_operation",
      "delete_comment_operation",
      "comment_options_operation",
      "ineffective_delete_comment_operation",
      "author_reward_operation",
      "comment_reward_operation",
      "comment_payout_update_operation",
      "comment_benefactor_reward_operation",
    ],
  },
  {
    name: "Curation",
    types: [
      "vote_operation",
      "effective_comment_vote_operation",
      "curation_reward_operation",
      "claim_reward_balance_operation",
    ],
  },
  {
    name: "Transfer",
    types: [
      "transfer_operation",
      "recurrent_transfer_operation",
      "fill_recurrent_transfer_operation",
      "failed_recurrent_transfer_operation",
      "transfer_to_savings_operation",
      "transfer_from_savings_operation",
      "cancel_transfer_from_savings_operation",
      "fill_transfer_from_savings_operation",
    ],
  },
  {
    name: "Market",
    types: [
      "interest_operation",
      "limit_order_create_operation",
      "limit_order_create2_operation",
      "limit_order_cancel_operation",
      "limit_order_cancelled_operation",
      "fill_order_operation",
      "liquidity_reward_operation",
      "convert_operation",
      "fill_convert_request_operation",
      "collateralized_convert_operation",
      "collateralized_convert_immediate_conversion_operation",
      "fill_collateralized_convert_request_operation",
      "escrow_transfer_operation",
      "escrow_approve_operation",
      "escrow_approved_operation",
      "escrow_rejected_operation",
      "escrow_dispute_operation",
      "escrow_release_operation",
    ],
  },
  {
    name: "Vesting",
    types: [
      "transfer_to_vesting_operation",
      "transfer_to_vesting_completed_operation",
      "withdraw_vesting_operation",
      "fill_vesting_withdraw_operation",
      "set_withdraw_vesting_route_operation",
      "delegate_vesting_shares_operation",
      "return_vesting_delegation_operation",
    ],
  },
  {
    name: "Account management",
    types: [
      "account_create_operation",
      "claim_account_operation",
      "create_claimed_account_operation",
      "account_create_with_delegation_operation",
      "account_created_operation",
      "account_update_operation",
      "account_update2_operation",
      "request_account_recovery_operation",
      "recover_account_operation",
      "change_recovery_account_operation",
      "changed_recovery_account_operation",
      "set_reset_account_operation",
      "reset_account_operation",
    ],
  },
  {
    name: "Witness management",
    types: [
      "feed_publish_operation",
      "witness_update_operation",
      "witness_set_properties_operation",
      "shutdown_witness_operation",
      "producer_reward_operation",
      "pow_operation",
      "pow2_operation",
      "pow_reward_operation",
      "producer_missed_operation",
      "witness_block_approve_operation",
    ],
  },
  {
    name: "Witness voting",
    types: [
      "account_witness_vote_operation",
      "account_witness_proxy_operation",
      "proxy_cleared_operation",
      "delayed_voting_operation",
      "expired_account_notification_operation",
      "decline_voting_rights_operation",
      "declined_voting_rights_operation",
    ],
  },
  {
    name: "Proposals",
    types: [
      "update_proposal_votes_operation",
      "create_proposal_operation",
      "proposal_fee_operation",
      "remove_proposal_operation",
      "update_proposal_operation",
      "proposal_pay_operation",
    ],
  },
  {
    name: "Custom",
    types: [
      "custom_operation",
      "custom_json_operation",
      "custom_binary_operation",
    ],
  },
  {
    name: "Other",
    types: [
      "hardfork_operation",
      "hardfork_hive_operation",
      "hardfork_hive_restore_operation",
      "clear_null_account_balance_operation",
      "consolidate_treasury_balance_operation",
      "dhf_funding_operation",
      "dhf_conversion_operation",
      "vesting_shares_split_operation",
      "system_warning_operation",
    ],
  },
];

const OperationTypesDialog: React.FC<OperationTypesDialogProps> = ({
  operationTypes,
  triggerTitle,
  selectedOperations,
  buttonClassName,
  setSelectedOperations,
}) => {
  const [selectedOperationsIds, setSelectedOperationsIds] = useState<number[]>(
    []
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOperationFilterHover, setIsOperationFilterHover] = useState(false);
  const { settings } = useUserSettingsContext();

  if (!operationTypes || !operationTypes.length) return;

  const virtualOperations = operationTypes.filter(
    (operationType) => operationType.is_virtual
  );
  const nonVirtualOperations = operationTypes.filter(
    (operationType) => !operationType.is_virtual
  );

  const onFiltersSelect = (id: number) => {
    if (selectedOperationsIds.includes(id)) {
      setSelectedOperationsIds(
        selectedOperationsIds.filter((operationId) => operationId !== id)
      );
    } else {
      setSelectedOperationsIds([...selectedOperationsIds, id]);
    }
  };

  const handleOnSubmit = () => {
    setSelectedOperations(
      Array.isArray(selectedOperationsIds)
        ? selectedOperationsIds
        : [selectedOperationsIds]
    );
    onOpenChange(false);
  };

  const handleOnClear = () => {
    setSelectedOperationsIds([]);
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setSelectedOperationsIds(selectedOperations);
    }
    setIsOpen(open);
  };

  const selectAll = () => {
    const allIds = operationTypes.map(
      (operationType) => operationType.op_type_id
    );
    setSelectedOperationsIds(allIds);
  };

  const selectReal = () => {
    const realIds = nonVirtualOperations.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...realIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds([...finaList]);
  };

  const selectVirtual = () => {
    const virtualIds = virtualOperations.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...virtualIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds(finaList);
  };

  const selectAllOfCategory = (operationTypes: Hive.OperationPattern[]) => {
    const operationsIds = operationTypes.map(
      (operationType) => operationType.op_type_id
    );
    let finaList = [...operationsIds, ...selectedOperationsIds];
    finaList = finaList.filter((id, index) => finaList.indexOf(id) === index);
    setSelectedOperationsIds(finaList);
  };

  const clearCategory = (operationTypes: Hive.OperationPattern[]) => {
    const operationsIds = operationTypes.map(
      (operationType) => operationType.op_type_id
    );
    const finalOperations = [...selectedOperationsIds].filter(
      (selectedOperationId) => !operationsIds.includes(selectedOperationId)
    );
    setSelectedOperationsIds(finalOperations);
  };

  const invertSelection = () => {
    const allIds = operationTypes.map(
      (operationType) => operationType.op_type_id
    );
    const finaList = allIds.filter(
      (id) =>
        selectedOperationsIds.find((selectedId) => selectedId === id) ===
        undefined
    );
    setSelectedOperationsIds(finaList);
  };

  const renderOperation = (operation: Hive.OperationPattern) => {
    return (
      <li
        onClick={() => onFiltersSelect(operation.op_type_id)}
        key={operation.op_type_id}
        className="col-span-3 pl-2 md:col-span-1 flex items-center font-bold text-base rounded-lg bg-inherit hover:border-2-gray group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white "
      >
        <Input
          type="checkbox"
          checked={selectedOperationsIds.includes(operation.op_type_id)}
          name="bordered-checkbox"
          className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 "
          {...{
            "data-testid": `operation-type-checkbox-${operation.operation_name}`,
          }}
          onChange={() => onFiltersSelect(operation.op_type_id)}
        />
        <Label
          htmlFor="bordered-checkbox-1"
          className={cn(
            "p-1 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis",
            {
              "text-sky-900 dark:text-sky-200": operation.is_virtual,
            }
          )}
          {...{
            "data-testid": `operation-type-label-${operation.operation_name}`,
          }}
        >
          {settings.rawJsonView
            ? operation.operation_name
            : getOperationTypeForDisplay(operation.operation_name)}
        </Label>
      </li>
    );
  };

  const renderSection = (sectionName: string, operationsNames: string[]) => {
    const operations = operationsNames
      .map((name) =>
        operationTypes?.find(
          (operationType) => operationType.operation_name === name
        )
      )
      .filter((operationType) => operationType) as Hive.OperationPattern[];
    if (!operations.length) {
      return null;
    }
    const sortedOperations = operations.sort((a, b) =>
      a?.operation_name.localeCompare(b?.operation_name)
    );
    return (
      <div
        className=" border-t px-2"
        key={sectionName}
      >
        <div className="flex justify-between">
          <div className="flex items-center justify-center">{sectionName}</div>
          <div>
            <Button onClick={() => selectAllOfCategory(operations)}>
              Select
            </Button>
            <Button onClick={() => clearCategory(operations)}>Clear</Button>
          </div>
        </div>
        <ul
          className="my-4 grid grid-cols-4 gap-4 place-items-stretch text-white "
          data-testid="virtual-operations-list"
        >
          {sortedOperations.map(
            (operation) => !!operation && renderOperation(operation)
          )}
        </ul>
      </div>
    );
  };

  const handleClearOperationsFilter = () => {
    setSelectedOperations([]);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid="operations-types-btn"
          className={`${buttonClassName} text-white hover:bg-gray-700 rounded-[4px]`}
        >
          Operation Types
        </Button>
      </DialogTrigger>
      {selectedOperations.length ? (
        <Button
          onClick={handleClearOperationsFilter}
          onMouseEnter={() => setIsOperationFilterHover(true)}
          onMouseLeave={() => setIsOperationFilterHover(false)}
          className={`${buttonClassName} text-white text-ellipsis overflow-hidden w-[150px] ml-2 hover:bg-red-700 rounded-[4px]`}
        >
          {!isOperationFilterHover ? triggerTitle : "Clear Filters"}
        </Button>
      ) : null}
      <DialogContent
        className="max-w-[95%] md:max-w-[80%] max-h-[90%] md:max-h-[80%] flex-column justify-center align-center  bg-white text-black dark:bg-explorer-dark-gray dark:text-white overflow-auto px-0"
        data-testid="operation-types-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex justify-center pt-2">
            Operation types filters
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[500px] md:max-h-[600px]">
          {categorizedTypes.map((categorizedType) =>
            renderSection(categorizedType.name, categorizedType.types)
          )}
        </div>
        <DialogFooter>
          <div
            className="flex flex-wrap justify-between w-full gap-y-4 border-t pt-1 px-2"
            data-testid="operation-types-dialog-footer"
          >
            <div className="flex">
              <Button
                type="button"
                variant="secondary"
                onClick={selectAll}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={selectReal}
              >
                Select real
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={selectVirtual}
              >
                Select virtual
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={invertSelection}
              >
                Invert
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleOnClear}
              >
                Clear
              </Button>
            </div>
            <div className="flex w-full md:w-auto justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-800 hover:bg-blue-600 text-white rounded"
                type="submit"
                variant="default"
                onClick={handleOnSubmit}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OperationTypesDialog;
