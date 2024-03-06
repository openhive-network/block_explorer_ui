import React from "react";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import {
  DeepReadonly,
  IFormatFunctionArguments,
  IWaxBaseInterface,
  IWaxCustomFormatter,
  WaxFormattable,
  account_create,
  account_create_with_delegation,
  account_created,
  account_update,
  account_update2,
  account_witness_proxy,
  account_witness_vote,
  author_reward,
  cancel_transfer_from_savings,
  change_recovery_account,
  changed_recovery_account,
  claim_account,
  claim_reward_balance,
  clear_null_account_balance,
  collateralized_convert,
  collateralized_convert_immediate_conversion,
  comment,
  comment_benefactor_reward,
  comment_options,
  comment_payout_update,
  comment_reward,
  consolidate_treasury_balance,
  convert,
  create_claimed_account,
  create_proposal,
  curation_reward,
  custom,
  decline_voting_rights,
  declined_voting_rights,
  delayed_voting,
  delegate_vesting_shares,
  delete_comment,
  dhf_conversion,
  dhf_funding,
  effective_comment_vote,
  escrow_approve,
  escrow_approved,
  escrow_dispute,
  escrow_transfer,
  expired_account_notification,
  failed_recurrent_transfer,
  feed_publish,
  fill_collateralized_convert_request,
  fill_convert_request,
  fill_order,
  fill_recurrent_transfer,
  fill_transfer_from_savings,
  fill_vesting_withdraw,
  hardfork,
  hardfork_hive_restore,
  interest,
  limit_order_cancel,
  limit_order_cancelled,
  limit_order_create,
  limit_order_create2,
  liquidity_reward,
  pow,
  pow2,
  pow_reward,
  producer_missed,
  producer_reward,
  proposal_fee,
  proposal_pay,
  proxy_cleared,
  recover_account,
  recurrent_transfer,
  remove_proposal,
  request_account_recovery,
  return_vesting_delegation,
  set_withdraw_vesting_route,
  shutdown_witness,
  transfer,
  transfer_from_savings,
  transfer_to_vesting,
  transfer_to_vesting_completed,
  update_proposal,
  update_proposal_votes,
  vesting_shares_split,
  vote,
  withdraw_vesting,
  witness_block_approve,
  witness_set_properties,
  witness_update,
} from "@hive/wax";
import moment from "moment";
import { formatPercent } from "./utils";
import Link from "next/link";

class OperationsFormatter implements IWaxCustomFormatter {
  
  public constructor(
    private readonly wax: IWaxBaseInterface
  ) {}

  private getFormattedAmount (supply: Hive.Supply | undefined): string {
    return(this.wax.formatter.format(supply));
  }

  private getTransferMessage(transfer: Hive.TransferOperation): string {
    const withMemo = transfer.memo !== "" ? `with memo "${transfer.memo}"` : "";
    let message = `${transfer.from} transfered ${this.getFormattedAmount(transfer.amount)} to ${transfer.to} ${withMemo}`;
    return message;
  }

  private getFormattedDate(time: Date | string) : string {
    return moment(time).format(config.baseMomentTimeFormat);
  }

  private getFormattedMultipleAssets(assets: DeepReadonly<Hive.Supply[]>): string {
    let assetsMessage = "";
    assets.forEach((asset, index) => {

      assetsMessage += `${index !== 0 ? ", " : ""}${this.getFormattedAmount(asset)}`;
    })
    return assetsMessage;
  }

  private getUserLink(user: string): React.JSX.Element {
    return <Link href={`/@${user}`}><span className="text-explorer-turquoise">@{user}</span></Link>
  }

  private getPermlink(author: string, permlink: string): React.JSX.Element {
    return <Link href={`https://hive.blog/@${author}/${permlink}`}><span className="text-explorer-ligh-green">{permlink.slice(0, 20)}...</span></Link>
  }

  @WaxFormattable({matchProperty: "type", matchValue: "vote_operation"})
  formatVote({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vote }>) {
    const message = <div>{this.getUserLink(op.voter)}{` voted on `} {this.getUserLink(op.author)} {"/"} {this.getPermlink(op.author, op.permlink)} {` with ${op.weight} power`}</div>;
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
    let message = `${op.from} transfered ${this.getFormattedAmount(op.amount)} to vesting`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "withdraw_vesting_operation"})
  formatWithdrawVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: withdraw_vesting }>) {
    let message = `${op.account} withdrawed ${this.getFormattedAmount(op.vesting_shares)}`;
    return {...target, value: message};
  }

  // Limit order create

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create_operation"})
  formatLimitOrderCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${this.getFormattedDate(op.expiration)}`;
    let message = `${op.owner} created limit order (id: ${op.orderid}) to sell: ${this.getFormattedAmount(op.amount_to_sell)} for: ${this.getFormattedAmount(op.min_to_receive)}${expiration}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_cancel_operation"})
  formatLimitOrderCancelOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_cancel }>) {
    let message = `${op.owner} cancelled limit order: ${op.orderid}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "feed_publish_operation"})
  formatFeedPublishOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: feed_publish }>) {
    let message = `${op.publisher} published the exchange rate: ${this.getFormattedAmount(op.exchange_rate?.base)} for ${this.getFormattedAmount(op.exchange_rate?.quote)}`;
    return {...target, value: message};
  }


  @WaxFormattable({matchProperty: "type", matchValue: "convert_operation"})
  formatConvertOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: convert }>) {
    let message = `${op.owner} starts convert operation: ${op.requestid} with amount:  ${this.getFormattedAmount(op.amount)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_operation"})
  formatAccountCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create }>) {
    let message = `${op.creator} created new account: ${op.new_account_name} with ${this.getFormattedAmount(op.fee)} fee, memo key: ${op.memo_key}`;
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
      message = `${op.owner} with page URL: ${op.url} proposed himself as witness - HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, maximum block size: ${op.props?.maximum_block_size}, account creation fee: ${this.getFormattedAmount(op.props?.account_creation_fee)}`;
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
    let message = `${op.author} set comments options for ${op.permlink}: ${op.allow_curation_rewards ? "allow rewards, " : ""} ${op.allow_votes ? "allow votes, " : ""} max payout: ${this.getFormattedAmount(op.max_accepted_payout)}, percent HBD: ${formatPercent(op.percent_hbd)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "set_withdraw_vesting_route_operation"})
  formatSetWithdrawVestingRouteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: set_withdraw_vesting_route }>) {
    let message = `${op.from_account} set withdraw vesting route to ${op.to_account} with ${formatPercent(op.percent)}${op.auto_vest ? ", convert to HP" : ""}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create2_operation"})
  formatLimitOrderCreate2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create2 }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${this.getFormattedDate(op.expiration)}`;
    let message = `${op.owner} created limit order (id: ${op.orderid}) to sell: ${this.getFormattedAmount(op.amount_to_sell)} with exchange rate: ${this.getFormattedAmount(op.exchange_rate?.base)} to ${this.getFormattedAmount(op.exchange_rate?.quote)}${expiration}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "claim_account_operation"})
  formatClaimAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: claim_account }>) {
    let message = `${op.creator} claimed an account creation with ${this.getFormattedAmount(op.fee)}`;
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
    let message = `Prove of Work 2, account creation fee: ${this.getFormattedAmount(op.props?.account_creation_fee)}, HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, maximum block size: ${op.props?.maximum_block_size}`;
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
    let message = `${op.account} claimed rewards: ${this.getFormattedAmount(op.reward_hbd)}, ${this.getFormattedAmount(op.reward_hive)}, ${this.getFormattedAmount(op.reward_vests)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "delegate_vesting_shares_operation"})
  formatDelegateVestingSharesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delegate_vesting_shares }>) {
    let message = `${op.delegator} delegated vesting shares: ${this.getFormattedAmount(op.vesting_shares)} to ${op.delegatee}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_with_delegation_operation"})
  formatAccountCreateWithDelegationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create_with_delegation }>) {
    let message = `${op.creator} created new account: ${op.new_account_name} with delegation: ${this.getFormattedAmount(op.delegation)} and fee: ${this.getFormattedAmount(op.fee)}`;
    return {...target, value: message};
  }

    //Witness set properties

  // Talk about more detailed update
  @WaxFormattable({matchProperty: "type", matchValue: "account_update2_operation"})
  formatAccountUpdate2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_update2 }>) {
    let message = `${op.account} updated an account`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "create_proposal_operation"})
  formatCreateProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: create_proposal }>) {
    let message = `${op.creator} created a proposal to daily pay ${this.getFormattedAmount(op.daily_pay)} to ${op.receiver} from ${this.getFormattedDate(op.start_date)} to ${this.getFormattedDate(op.end_date)}. Details in post: ${op.permlink}`;
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "update_proposal_votes_operation"})
  formatUpdateProposalVotesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: update_proposal_votes }>) {
    let message = "";
    if (op.approve) {
      message = `${op.voter} approved proposal ${op.proposal_ids}`;
    } else {
      message = `${op.voter} removed approval for proposal ${op.proposal_ids}`;
    }
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "remove_proposal_operation"})
  formatRemoveProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: remove_proposal }>) {
    let message = `${op.proposal_owner} removed proposal ${op.proposal_ids}`;
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "update_proposal_operation"})
  formatUpdateProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: update_proposal }>) {
    let message = `${op.creator} updated proposal ${op.proposal_id}. Daily pay: ${this.getFormattedAmount(op.daily_pay)}, permlink: ${op.permlink}`;
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "collateralized_convert_operation"})
  formatCollateralizedConvertOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: collateralized_convert }>) {
    let message = `${op.owner} collateralized convert ${this.getFormattedAmount(op.amount)} with request ID: ${op.requestid}`;
    return {...target , value: message};
  }

  // Recurrent transfer

  // === VIRTUAL ===

  @WaxFormattable({matchProperty: "type", matchValue: "fill_convert_request_operation"})
  formatFillConverRequest({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_convert_request }>) {
    let message = `${op.owner} converted ${this.getFormattedAmount(op.amount_in)} to ${this.getFormattedAmount(op.amount_out)} for request ID: ${op.requestid}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "author_reward_operation"})
  formatAuthorRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: author_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    let message = `${op.author} got a reward for comment: ${op.permlink} curators payout: ${this.getFormattedAmount(op.curators_vesting_payout)}, payouts: ${this.getFormattedAmount(op.vesting_payout)}, ${this.getFormattedAmount(op.hive_payout)}, ${this.getFormattedAmount(op.hbd_payout)}${mustBeClaimed}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "curation_reward_operation"})
  formatCurationRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: curation_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    let message = `${op.curator} got a curation reward: ${this.getFormattedAmount(op.reward)} for comment: ${op.permlink} made by ${op.author}${mustBeClaimed}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_reward_operation"})
  formatCommentReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_reward }>) {
    let message = `${op.permlink} by ${op.author} got rewards: ${this.getFormattedAmount(op.payout)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "liquidity_reward_operation"})
  formatLiquidityRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: liquidity_reward }>) {
    let message = `${op.owner} got liquidity reward ${this.getFormattedAmount(op.payout)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "interest_operation"})
  formatInterestOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: interest }>) {
    const wasLiquidModified = op.is_saved_into_hbd_balance ? ", liquid balance modified" : "";
    let message = `${op.owner} got interest paid ${this.getFormattedAmount(op.interest)}${wasLiquidModified}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_vesting_withdraw_operation"})
  formatFillVestingWithdrawOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_vesting_withdraw }>) {
    let message = `${op.from_account} withdrawed ${this.getFormattedAmount(op.withdrawn)} and ${op.to_account} deposited ${this.getFormattedAmount(op.deposited)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_order_operation"})
  formatFillOrderOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_order }>) {
    let message = `${op.current_owner} paid ${this.getFormattedAmount(op.current_pays)} for ${op.open_owner} and received ${this.getFormattedAmount(op.open_pays)} (IDs: ${op.current_orderid} -> ${op.open_orderid})`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "shutdown_witness_operation"})
  formatShutdownWitnessOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: shutdown_witness }>) {
    let message = `Witness ${op.owner} was shutted down`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_transfer_from_savings_operation"})
  formatFillTransferFromSavings({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const memo = op.memo !== "" ? `, memo: "${op.memo}"` : "";
    let message = `${this.getFormattedAmount(op.amount)} was transfered from savings of ${op.from} to ${op.to}, request ID: ${op.request_id}${memo}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "hardfork_operation"})
  formatHardforkOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: hardfork }>) {
    let message = `Hardfork ${op.hardfork_id}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_payout_update_operation"})
  formatCommentPayoutUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_payout_update }>) {
    let message = `Payout update for ${op.author} comment: ${op.permlink}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "return_vesting_delegation_operation"})
  formatReturnVestingDelegationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: return_vesting_delegation }>) {
    let message = `${op.account} received ${this.getFormattedAmount(op.vesting_shares)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_benefactor_reward_operation"})
  formatCommentBenefactorRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_benefactor_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    let message = `${op.benefactor} received ${this.getFormattedAmount(op.vesting_payout)}, ${this.getFormattedAmount(op.hbd_payout)}, ${this.getFormattedAmount(op.hbd_payout)} for comment ${op.permlink} by ${op.author}${mustBeClaimed}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "producer_reward_operation"})
  formatProducerReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_reward }>) {
    let message = `${op.producer} got ${this.getFormattedAmount(op.vesting_shares)} reward`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "clear_null_account_balance_operation"})
  formatClearNullAccountBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: clear_null_account_balance }>) {
    let message = `Totally cleared: ${this.getFormattedMultipleAssets(op.total_cleared)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proposal_pay_operation"})
  formatProposalPayOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proposal_pay }>) {
    let message = `${op.receiver} was paid ${this.getFormattedAmount(op.payment)} for his proposal ${op.proposal_id} by ${op.payer}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "dhf_funding_operation"})
  formatDhfFundingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: dhf_funding }>) {
    let message = `${op.treasury} got ${this.getFormattedAmount(op.additional_funds)}`;
    return {...target, value: message};
  }

  // Hardfork Hive

  @WaxFormattable({matchProperty: "type", matchValue: "hardfork_hive_restore_operation"})
  formatHardforkHiveRestoreOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: hardfork_hive_restore }>) {
    let message = `${op.account} received ${this.getFormattedAmount(op.hive_transferred)} and ${this.getFormattedAmount(op.hbd_transferred)} from ${op.treasury}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "delayed_voting_operation"})
  formatDelayedVotingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delayed_voting }>) {
    let message = `${op.voter} has ${op.votes} vote power`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "consolidate_treasury_balance_operation"})
  formatConsolidateTrasuryBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: consolidate_treasury_balance }>) {
    let message = `${this.getFormattedMultipleAssets(op.total_moved)} was consolidated into treasury`;
    return {...target, value: message};
  }

  //Remember to ask about the rest of properties
  @WaxFormattable({matchProperty: "type", matchValue: "effective_comment_vote_operation"})
  formatEffectiveCommentVoteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: effective_comment_vote }>) {
    let message = `${op.voter} voted for ${op.permlink} by ${op.author} and generated ${this.getFormattedAmount(op.pending_payout)} pending payout`;
    return {...target, value: message};
  }

  // Inefective delete comment

  @WaxFormattable({matchProperty: "type", matchValue: "dhf_conversion_operation"})
  formatDhfConversionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: dhf_conversion }>) {
    let message = `${op.treasury} got ${this.getFormattedAmount(op.hive_amount_in)} converted to ${this.getFormattedAmount(op.hbd_amount_out)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "expired_account_notification_operation"})
  formatExpiredAccountNotificationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: expired_account_notification }>) {
    let message = `${op.account} vote was nullified`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "changed_recovery_account_operation"})
  formatChangedRecoveryAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: changed_recovery_account }>) {
    let message = `${op.account} changed recovery account from ${op.old_recovery_account} to ${op.new_recovery_account}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_vesting_completed_operation"})
  formatTransferToVestingCompletedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: transfer_to_vesting_completed }>) {
    let message = `Vesting transfer from ${op.from_account} to ${op.to_account} was completed with ${this.getFormattedAmount(op.hive_vested)} -> ${this.getFormattedAmount(op.vesting_shares_received)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "pow_reward_operation"})
  formatPowRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow_reward }>) {
    let message = `${op.worker} got ${this.getFormattedAmount(op.reward)} reward`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "vesting_shares_split_operation"})
  formatVestingSharesSplitOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vesting_shares_split }>) {
    let message = `${op.owner} splited vests ${this.getFormattedAmount(op.vesting_shares_before_split)} -> ${this.getFormattedAmount(op.vesting_shares_after_split)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_created_operation"})
  formatAccountCreatedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_created }>) {
    let message = `${op.new_account_name} was created by ${op.creator} with initials: vesting shares ${this.getFormattedAmount(op.initial_vesting_shares)} and delegations ${this.getFormattedAmount(op.initial_delegation)}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_collateralized_convert_request_operation"})
  formatFillCollateralizedConvertRequestOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_collateralized_convert_request }>) {
    let message = `Collateralized convert reuqest of ${op.owner} (ID: ${op.requestid}) was filled with ${this.getFormattedAmount(op.amount_in)} -> ${this.getFormattedAmount(op.amount_out)} and ${this.getFormattedAmount(op.excess_collateral)} excess`;
    return {...target, value: message};
  }

  // System warning

  @WaxFormattable({matchProperty: "type", matchValue: "fill_recurrent_transfer_operation"})
  formatFillRecurrentTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = `Recurrent transfer from ${op.from} to ${op.to} with amount: ${this.getFormattedAmount(op.amount)}, memo: "${op.memo}" and ${op.remaining_executions} remaining executions`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "failed_recurrent_transfer_operation"})
  formatFailedRecurrentTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const deleted = op.deleted ? " and was deleted" : "";
    let message = `Recurrent transfer from ${op.from} to ${op.to} with amount: ${this.getFormattedAmount(op.amount)}, memo: "${op.memo}" and ${op.remaining_executions} remaining executions failed for ${op.consecutive_failures} times${deleted}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_cancelled_operation"})
  formatLimitOrderCancelledOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_cancelled }>) {
    let message = `Transfer ${op.orderid} by ${op.seller} was cancelled and ${this.getFormattedAmount(op.amount_back)} was sent back`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "producer_missed_operation"})
  formatProducerMissedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_missed }>) {
    let message = `${op.producer} missed block`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proposal_fee_operation"})
  formatProposalFeeOperations({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proposal_fee }>) {
    let message = `${op.creator} got proposal fee ${this.getFormattedAmount(op.fee)} ID: ${op.proposal_id} from ${op.treasury}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "collateralized_convert_immediate_conversion_operation"})
  formatCollateralizedConvertImmediateConversionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: collateralized_convert_immediate_conversion }>) {
    let message = `${op.owner} got ${this.getFormattedAmount(op.hbd_out)} for conversion ID: ${op.requestid}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_approved_operation"})
  formatEscrowApprovedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowDisputeOperation }>) {
    let message = `Escrow from ${op.from} to ${op.to} by agent ${op.agent} with fee: ${this.getFormattedAmount(op.fee)}, ID: ${op.escrow_id}`;
    return {...target, value: message};
  }

  // Cutted numbers
  @WaxFormattable({matchProperty: "type", matchValue: "escrow_rejected_operation"})
  formatEscrowRejectedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowDisputeOperation }>) {
    let message = `Escrow from ${op.from} to ${op.to} by agent ${op.agent} was rejected`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proxy_cleared_operation"})
  formatProxyClearedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proxy_cleared }>) {
    let message = `${op.account} cleared proxy ${op.proxy}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "declined_voting_rights_operation"})
  formatDeclinedVotingRightsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: declined_voting_rights }>) {
    let message = `${op.account} voting's rights were`;
    return {...target, value: message};
  }
  
}

export default OperationsFormatter