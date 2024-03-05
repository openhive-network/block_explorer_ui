import { config } from "@/Config";
import Hive from "@/types/Hive";
import {
  IFormatFunctionArguments,
  IWaxBaseInterface,
  IWaxCustomFormatter,
  WaxFormattable,
  account_create,
  account_create_with_delegation,
  account_update,
  account_update2,
  account_witness_proxy,
  account_witness_vote,
  cancel_transfer_from_savings,
  change_recovery_account,
  claim_account,
  claim_reward_balance,
  comment,
  comment_options,
  convert,
  create_claimed_account,
  custom,
  decline_voting_rights,
  delegate_vesting_shares,
  delete_comment,
  escrow_dispute,
  escrow_transfer,
  feed_publish,
  limit_order_cancel,
  limit_order_create,
  limit_order_create2,
  pow,
  pow2,
  producer_missed,
  producer_reward,
  recover_account,
  request_account_recovery,
  set_withdraw_vesting_route,
  transfer,
  transfer_from_savings,
  transfer_to_vesting,
  vote,
  withdraw_vesting,
  witness_block_approve,
  witness_set_properties,
  witness_update,
} from "@hive/wax";
import moment from "moment";
import { formatPercent } from "./utils";

class OperationsFormatter implements IWaxCustomFormatter {
  
  public constructor(
    private readonly wax: IWaxBaseInterface
  ) {}

  private formatAmount (supply: Hive.Supply | undefined): string {
    return(this.wax.formatter.format(supply));
  }

  private getTransferMessage(transfer: Hive.TransferOperation): string {
    const withMemo = transfer.memo !== "" ? `with memo ${transfer.memo}` : "";
    let message = `${transfer.from} transfered ${this.formatAmount(transfer.amount)} to ${transfer.to} ${withMemo}`;
    return message;
  }

  @WaxFormattable({matchProperty: "type", matchValue: "vote_operation"})
  formatVote({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vote }>) {
    const message = `${op.voter} voted on "@${op.author}/${op.permlink}"`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_operation"})
  formatComment({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment }>) {
    let message = "";
    if (op.parent_author === "") {
      message = `${op.author} created new post: ${op.permlink}`;
    } else {
      message = `${op.author} commented on post: ${op.parent_permlink} of ${op.parent_author}`;
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_operation"})
  formatTransfer({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_vesting_operation"})
  formatTransferToVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = `${op.from} transfered ${this.formatAmount(op.amount)} to vesting`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "withdraw_vesting_operation"})
  formatWithdrawVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: withdraw_vesting }>) {
    let message = `${op.account} withdrawed ${this.formatAmount(op.vesting_shares)}`;
    return {...target, value: message};
  }

  // Limit order create

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create_operation"})
  formatLimitOrderCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${moment(op.expiration).format(config.baseMomentTimeFormat)}`;
    let message = `${op.owner} created limit order (id: ${op.orderid}) to sell: ${this.formatAmount(op.amount_to_sell)} for: ${this.formatAmount(op.min_to_receive)}${expiration}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_cancel_operation"})
  formatLimitOrderCancelOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_cancel }>) {
    let message = `${op.owner} cancelled limit order: ${op.orderid}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "feed_publish_operation"})
  formatFeedPublishOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: feed_publish }>) {
    let message = `${op.publisher} published the exchange rate: ${this.formatAmount(op.exchange_rate?.base)} for ${this.formatAmount(op.exchange_rate?.quote)}`;
    return {...target, value: message};
  }


  @WaxFormattable({matchProperty: "type", matchValue: "convert_operation"})
  formatConvertOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: convert }>) {
    let message = `${op.owner} starts convert operation: ${op.requestid} with amount:  ${this.formatAmount(op.amount)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_operation"})
  formatAccountCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create }>) {
    let message = `${op.creator} created new account: ${op.new_account_name} with ${this.formatAmount(op.fee)} fee, memo key: ${op.memo_key}`;
    return {...target, value: message};
  }

  // Check for better message
  @WaxFormattable({matchProperty: "type", matchValue: "account_update_operation"})
  formatAccountUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_update }>) {
    let message = `${op.account} updated account with memo key: ${op.memo_key}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "witness_update_operation"})
  formatWitnessUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: witness_update }>) {
    let message = "";
    if (op.block_signing_key) {
      message = `${op.owner} with page URL: ${op.url} proposed himself as witness - HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, maximum block size: ${op.props?.maximum_block_size}, account creation fee: ${this.formatAmount(op.props?.account_creation_fee)}`;
    } else {
      message = `${op.owner} resigned from being witness`
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_witness_vote_operation"})
  formatAccountWitnessVoteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_witness_vote }>) {
    let message = "";
    if (op.approve) {
      message = `${op.account} voted for witness ${op.witness}`;
    } else {
      message = `${op.account} removed vote from witness ${op.witness}`;
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_witness_proxy_operation"})
  formatAccountWitnessProxyOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_witness_proxy }>) {
    let message = "";
    if (op.proxy !== "") {
      message = `${op.account} set a proxy for user ${op.proxy}`;
    } else {
      message = `${op.account} removed a proxy`;
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "pow_operation"})
  formatPowOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow }>) {
    let message = `${op.worker_account} made a prove of work`
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "custom_operation"})
  formatcustomOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: custom }>) {
    let message = `${op.required_auths} made custom operation`
    return {...target, value: message};
  }

  // Skip witness block approve

  @WaxFormattable({matchProperty: "type", matchValue: "delete_comment_operation"})
  formatDeleteCommentOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delete_comment }>) {
    let message = `${op.author} deleted comment: ${op.permlink}`
    return {...target, value: message};
  }

  // Wait for custom JSON

  @WaxFormattable({matchProperty: "type", matchValue: "comment_options_operation"})
  formatcommentOptionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_options }>) {
    let message = `${op.author} set comments options for ${op.permlink}: ${op.allow_curation_rewards ? "allow rewards, " : ""} ${op.allow_votes ? "allow votes, " : ""} max payout: ${this.formatAmount(op.max_accepted_payout)}, percent HBD: ${formatPercent(op.percent_hbd)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "set_withdraw_vesting_route_operation"})
  formatSetWithdrawVestingRouteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: set_withdraw_vesting_route }>) {
    let message = `${op.from_account} set withdraw vesting route to ${op.to_account} with ${formatPercent(op.percent)}${op.auto_vest ? ", convert to HP" : ""}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create2_operation"})
  formatLimitOrderCreate2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create2 }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${moment(op.expiration).format(config.baseMomentTimeFormat)}`;
    let message = `${op.owner} created limit order (id: ${op.orderid}) to sell: ${this.formatAmount(op.amount_to_sell)} with exchange rate: ${this.formatAmount(op.exchange_rate?.base)} to ${this.formatAmount(op.exchange_rate?.quote)}${expiration}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "claim_account_operation"})
  formatClaimAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: claim_account }>) {
    let message = `${op.creator} claimed an account creation with ${this.formatAmount(op.fee)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "create_claimed_account_operation"})
  formatCreateClaimedAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: create_claimed_account }>) {
    let message = `${op.creator} created claimed account: ${op.new_account_name} with memo key: ${op.memo_key}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "request_account_recovery_operation"})
  formatRequestAccountRecovery({ source: { value: op }, target }: IFormatFunctionArguments<{ value: request_account_recovery }>) {
    let message = `${op.recovery_account} requested account recovery to account: ${op.account_to_recover}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "recover_account_operation"})
  formatRecoverAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: recover_account }>) {
    let message = `${op.account_to_recover} account was recovered`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "change_recovery_account_operation"})
  formatChangeRecoveryAccount({ source: { value: op }, target }: IFormatFunctionArguments<{ value: change_recovery_account }>) {
    let message = `${op.account_to_recover} changed recovery account to: ${op.new_recovery_account}`;
    return {...target, value: message};
  }

  //Wait for escrow_transfer

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_dispute_operation"})
  formatEscrowDispute({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowDisputeOperation }>) {
    let message = `Escrow dispute from ${op.from}, to ${op.to}, agent: ${op.agent}, who: ${op.who}, escrow ID: ${op.escrow_id}`;
    return {...target, value: message};
  }

  // Escrow release

  @WaxFormattable({matchProperty: "type", matchValue: "pow2_operation"})
  formatPow2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow2}>) {
    let message = `Prove of Work 2, account creation fee: ${this.formatAmount(op.props?.account_creation_fee)}, HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, maximum block size: ${op.props?.maximum_block_size}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_approve_operation"})
  formatEscroweApproveOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowDisputeOperation }>) {
    let message = `Escrow approve from ${op.from}, to ${op.to}, agent: ${op.agent}, who: ${op.who}, escrow ID: ${op.escrow_id}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_savings_operation"})
  formatTransferToSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_from_savings_operation"})
  formatTransferFromSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "cancel_transfer_from_savings_operation"})
  formatCancelTransferFromSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.CancelTransferOperation }>) {
    let message = `${op.from} cancelled transfer with id: ${op.request_id}`
    return {...target, value: message};
  }

  // Custom binary

  @WaxFormattable({matchProperty: "type", matchValue: "decline_voting_rights_operation"})
  formatDeclineVotingRightsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: decline_voting_rights }>) {
    let message = "";
    if (op.decline) {
      message = `${op.account} declined voting rights`;
    } else {
      message = `${op.account} cancelled declined voting rights`;
    }
    return {...target, value: message};
  }

  // Reset account

  // Set reset Account

  @WaxFormattable({matchProperty: "type", matchValue: "claim_reward_balance_operation"})
  formatClaimRewardBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: claim_reward_balance }>) {
    let message = `${op.account} claimed rewards: ${this.formatAmount(op.reward_hbd)}, ${this.formatAmount(op.reward_hive)}, ${this.formatAmount(op.reward_vests)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "delegate_vesting_shares_operation"})
  formatDelegateVestingSharesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delegate_vesting_shares }>) {
    let message = `${op.delegator} delegated vesting shares: ${this.formatAmount(op.vesting_shares)} to ${op.delegatee}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_with_delegation_operation"})
  formatAccountCreateWithDelegationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create_with_delegation }>) {
    let message = `${op.creator} created new account: ${op.new_account_name} with delegation: ${this.formatAmount(op.delegation)} and fee: ${this.formatAmount(op.fee)}`;
    return {...target, value: message};
  }

  //Witness set properties

  // Virtual

  @WaxFormattable({matchProperty: "type", matchValue: "producer_reward_operation"})
  formatProducerReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_reward }>) {
    let message = `${op.producer} got ${this.formatAmount(op.vesting_shares)} reward`;
    return {...target, value: message};
  }

  
}

export default OperationsFormatter