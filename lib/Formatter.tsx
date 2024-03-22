import React from "react";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import {
  CommunityOperation,
  DeepReadonly,
  FollowOperation,
  IFormatFunctionArguments,
  IWaxBaseInterface,
  IWaxCustomFormatter,
  ReblogOperation,
  ResourceCreditsOperation,
  WaxFormattable,
  account_create,
  account_create_with_delegation,
  account_created,
  account_update,
  account_update2,
  account_witness_proxy,
  account_witness_vote,
  author_reward,
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
  custom_json,
  decline_voting_rights,
  declined_voting_rights,
  delayed_voting,
  delegate_vesting_shares,
  delete_comment,
  dhf_conversion,
  dhf_funding,
  effective_comment_vote,
  expired_account_notification,
  feed_publish,
  fill_collateralized_convert_request,
  fill_convert_request,
  fill_order,
  fill_vesting_withdraw,
  hardfork,
  hardfork_hive,
  hardfork_hive_restore,
  ineffective_delete_comment,
  interest,
  limit_order_cancel,
  limit_order_cancelled,
  limit_order_create,
  limit_order_create2,
  liquidity_reward,
  operation,
  pow,
  pow2,
  pow_reward,
  producer_missed,
  producer_reward,
  proposal_fee,
  proposal_pay,
  proxy_cleared,
  recover_account,
  remove_proposal,
  request_account_recovery,
  return_vesting_delegation,
  set_withdraw_vesting_route,
  shutdown_witness,
  system_warning,
  transfer_to_vesting_completed,
  update_proposal,
  update_proposal_votes,
  vesting_shares_split,
  vote,
  withdraw_vesting,
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

  private getAccountLink(account: string): React.JSX.Element {
    return <Link href={`/@${account}`}><span className="text-explorer-turquoise">@{account}</span></Link>
  }

  private getMultipleAccountsListLink(accounts: DeepReadonly<string[]>) {
    return <>{accounts.map((account, index) =>  (
      <React.Fragment key={index}>{this.getAccountLink(account)}{" "}</React.Fragment>
      ))}</>
  }

  private getPermlink(author: string, permlink: string): React.JSX.Element {
    return <Link rel="noopener noreferrer" target="_blank" href={`https://hive.blog/@${author}/${permlink}`}><span className="text-explorer-ligh-green">{permlink}</span></Link>
  }

  private generateReactLink(elements: Array<string | React.JSX.Element>): React.JSX.Element {
    return (
      <div>
        {elements.map((element, index) => (
          <React.Fragment key={index}>
            {element}{" "}
          </ React.Fragment>
          )
        )}
      </div>
    )
  }

  /**
   * Use in transfer, transfer_to_saving and transfer_from_saving operations.
   * @param transfer 
   * @returns 
   */
  private getTransferMessage(transfer: Hive.TransferOperation): React.JSX.Element {
    const message = this.generateReactLink([this.getAccountLink(transfer.from), "transfered", this.getFormattedAmount(transfer.amount), "to", this.getAccountLink(transfer.to)]);
    return message;
  }

  private getEscrowMessage(initialMessage: string, escrow: Hive.EscrowOperation, amounts?: {hbd_amount?: Hive.Supply, hive_amount?: Hive.Supply}): React.JSX.Element {
    const amountMessage = amounts ? `sent: ${this.getFormattedAmount(amounts.hbd_amount)} and ${this.getFormattedAmount(amounts.hive_amount)}` : "";
    return this.generateReactLink([initialMessage, this.getAccountLink(escrow.from), "to", this.getAccountLink(escrow.to), "by agent", this.getAccountLink(escrow.agent), amountMessage] );
  }

  // Formatters

  @WaxFormattable({matchProperty: "type", matchValue: "vote_operation"})
  formatVote({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vote }>) {
    const message = this.generateReactLink([this.getAccountLink(op.voter), "voted on", this.getAccountLink(op.author), "/", this.getPermlink(op.author, op.permlink), ` with ${formatPercent(op.weight)}`])
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_operation"})
  formatComment({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment }>) {
    let message: string | React.JSX.Element = "";
    if (op.parent_author === "") {
      message = this.generateReactLink([this.getAccountLink(op.author), "created new comment:", this.getPermlink(op.author, op.permlink)])
    } else {
      message = this.generateReactLink([this.getAccountLink(op.author), "wrote a comment", this.getPermlink(op.author, op.permlink), "for a post:", this.getPermlink(op.parent_author, op.parent_permlink)]);
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_operation"})
  formatTransfer({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_vesting_operation"})
  formatTransferToVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.generateReactLink([this.getAccountLink(op.from), "transfered", this.getFormattedAmount(op.amount), "to vesting"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "withdraw_vesting_operation"})
  formatWithdrawVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: withdraw_vesting }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), "withdrawed", this.getFormattedAmount(op.vesting_shares)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create_operation"})
  formatLimitOrderCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${this.getFormattedDate(op.expiration)}`;
    const message = this.generateReactLink([this.getAccountLink(op.owner), "created limit order to sell", this.getFormattedAmount(op.amount_to_sell), "for", this.getFormattedAmount(op.min_to_receive), expiration])
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_cancel_operation"})
  formatLimitOrderCancelOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_cancel }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `cancelled limit order: ${op.orderid}`])
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "feed_publish_operation"})
  formatFeedPublishOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: feed_publish }>) {
    const message = this.generateReactLink([this.getAccountLink(op.publisher), "published the exchange rate:", this.getFormattedAmount(op.exchange_rate?.base), "for", this.getFormattedAmount(op.exchange_rate?.quote)])
    return {...target, value: message};
  }


  @WaxFormattable({matchProperty: "type", matchValue: "convert_operation"})
  formatConvertOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: convert }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `starts convert operation: ${op.requestid} with amount:`, this.getFormattedAmount(op.amount)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_operation"})
  formatAccountCreateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), "created new account:", this.getAccountLink(op.new_account_name)]);
    return {...target, value: message};
  }

  // Check for better message
  @WaxFormattable({matchProperty: "type", matchValue: "account_update_operation"})
  formatAccountUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_update }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), `updated account with memo key: ${op.memo_key}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "witness_update_operation"})
  formatWitnessUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: witness_update }>) {
    let message: string | React.JSX.Element = "";
    if (op.block_signing_key) {
      message = this.generateReactLink([this.getAccountLink(op.owner), `updated witness data - HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, max block size: ${op.props?.maximum_block_size}, account fee: ${this.getFormattedAmount(op.props?.account_creation_fee)}`])
    } else {
      message = this.generateReactLink([this.getAccountLink(op.owner), "resigned from being witness"])
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_witness_vote_operation"})
  formatAccountWitnessVoteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_witness_vote }>) {
    let message: string | React.JSX.Element = "";
    if (op.approve) {
      message = this.generateReactLink([this.getAccountLink(op.account), "voted for witness", this.getAccountLink(op.witness)]);
    } else {
      message = this.generateReactLink([this.getAccountLink(op.account), "removed vote from witness", this.getAccountLink(op.witness)]);
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_witness_proxy_operation"})
  formatAccountWitnessProxyOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_witness_proxy }>) {
    let message: string | React.JSX.Element = "";
    if (op.proxy !== "") {
      message = this.generateReactLink([this.getAccountLink(op.account), "set a proxy for user", this.getAccountLink(op.proxy)]);
    } else {
      message = this.generateReactLink([this.getAccountLink(op.account), "removed a proxy"]);
    }
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "pow_operation"})
  formatPowOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow }>) {
    const message =this.generateReactLink([this.getAccountLink(op.worker_account), "made a prove of work"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "custom_operation"})
  formatcustomOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: custom }>) {
    const message =this.generateReactLink([this.getMultipleAccountsListLink(op.required_auths), "made custom operation"]);
    return {...target, value: message};
  }

  // Skip witness block approve

  @WaxFormattable({matchProperty: "type", matchValue: "delete_comment_operation"})
  formatDeleteCommentOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delete_comment }>) {
    const message =this.generateReactLink([this.getAccountLink(op.author), "deleted comment:", this.getPermlink(op.author, op.permlink)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "custom_json_operation"})
  formatCustomJsonOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: custom_json }>) {
    const message = this.generateReactLink([this.getMultipleAccountsListLink(op.required_auths), this.getMultipleAccountsListLink(op.required_posting_auths), `made custom JSON (${op.id})`]);
    return {...target, value: {message, json: op.json}};
  }

  @WaxFormattable({matchInstanceOf: ResourceCreditsOperation}) 
  formatResourceCreditsOperation({target, source}: IFormatFunctionArguments<{ value: custom_json }, {value: ResourceCreditsOperation}>) {
    const {value: op} = target;
    if (op.rc.amount === "0")
      return { ...target, value: {message: this.generateReactLink([this.getAccountLink(op.from), `removed delegation for`, this.getMultipleAccountsListLink(op.delegatees)]), json: JSON.stringify(target.value)} };
    return { ...target, value: {message: this.generateReactLink([this.getAccountLink(op.from), `delegated ${this.getFormattedAmount(op.rc)} of RC for`, this.getMultipleAccountsListLink(op.delegatees), `(${source.value.id})`]), json: JSON.stringify(target.value)} };
  }

  @WaxFormattable({matchInstanceOf: FollowOperation}) 
  formatFollowOperation({target, source}: IFormatFunctionArguments<{ value: custom_json }, {value: FollowOperation}>) {
    const {value: op} = target;
    const actionsMap = new Map<string, string>();
    actionsMap.set("blog", "followed");
    actionsMap.set("", "unfollowed");
    actionsMap.set("ignore", "muted");
    actionsMap.set("reset_blacklist", "reset blacklist of");
    actionsMap.set("reset_follow_blacklist", "stopped following blacklist of");
    actionsMap.set("blacklist", "blacklisted");
    actionsMap.set("follow_blacklist", "followed blacklist of");
    actionsMap.set("unblacklist", "unblacklisted");
    actionsMap.set("unfollow_blacklist", "unfollowed blacklist of");
    actionsMap.set("reset_follow_muted_list", "stopped following muted list of");
    actionsMap.set("follow_muted", "followed muted list of");
    actionsMap.set("unfollow_muted", "unfollowed muted list of");
    actionsMap.set("reset_all_lists", "reset all lists of");
    actionsMap.set("reset_following_list", "reset following list of");
    actionsMap.set("reset_muted_list", "reset muted list of");
    return { ...target, value: {message: this.generateReactLink([this.getAccountLink(op.follower), `${actionsMap.get(op?.action) || ""}`, this.getMultipleAccountsListLink(op.following), `(${source.value.id})`]), json: JSON.stringify(target.value)}};
  }

  @WaxFormattable({matchInstanceOf: ReblogOperation}) 
  formatReblogOperation({target, source}: IFormatFunctionArguments<{ value: custom_json }, {value: ReblogOperation}>) {
    const {value: op} = target;
    return {...target, value: {message: this.generateReactLink([this.getAccountLink(op.account), `reblogged`, this.getPermlink(op.author, op.permlink), `(${source.value.id})`]), json: JSON.stringify(target.value)}};
  }

  @WaxFormattable({matchInstanceOf: CommunityOperation}) 
  formatCommunityOperation({target, source}: IFormatFunctionArguments<{ value: custom_json }, {value: CommunityOperation}>) {
    const {value: op} = target;
    return {...target, value: {message: this.generateReactLink([this.getMultipleAccountsListLink(op.accounts), `${op.data.action} to ${op.community}`, `(${source.value.id})`]), json: JSON.stringify(target.value)}};
  }


  @WaxFormattable({matchProperty: "type", matchValue: "comment_options_operation"})
  formatcommentOptionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_options }>) {
    const allowCurrationReward = !op.allow_curation_rewards ? "disallow rewards, " : "";
    const allowVotes = !op.allow_votes ? "disallow votes, " : "";
    const maxPayout = op.max_accepted_payout?.amount !== "1000000000" ? `max payout: ${this.getFormattedAmount(op.max_accepted_payout)}` : "";
    const percentHbd = op.percent_hbd !== 5000 ? `percent HBD: ${formatPercent(op.percent_hbd)}` : ""
    const message =this.generateReactLink([this.getAccountLink(op.author), "set options:",  `${allowCurrationReward} ${allowVotes} ${maxPayout} ${percentHbd} for:`, this.getPermlink(op.author, op.permlink),]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "set_withdraw_vesting_route_operation"})
  formatSetWithdrawVestingRouteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: set_withdraw_vesting_route }>) {
    const autoVests = op.auto_vest ? ", convert to HP" : "";
    const message =this.generateReactLink([this.getAccountLink(op.from_account), "set withdraw vesting route to", this.getAccountLink(op.from_account), ` with ${formatPercent(op.percent)}${autoVests}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_create2_operation"})
  formatLimitOrderCreate2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_create2 }>) {
    const expiration = op.fill_or_kill ? "" : `, expiration: ${this.getFormattedDate(op.expiration)}`;
    const message =this.generateReactLink([this.getAccountLink(op.owner), `created limit order (id: ${op.orderid}) to sell: ${this.getFormattedAmount(op.amount_to_sell)}, exchange rate: ${this.getFormattedAmount(op.exchange_rate?.base)} to ${this.getFormattedAmount(op.exchange_rate?.quote)}${expiration}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "claim_account_operation"})
  formatClaimAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: claim_account }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), `claimed an account with ${this.getFormattedAmount(op.fee)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "create_claimed_account_operation"})
  formatCreateClaimedAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: create_claimed_account }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), "created claimed account:", this.getAccountLink(op.new_account_name)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "request_account_recovery_operation"})
  formatRequestAccountRecovery({ source: { value: op }, target }: IFormatFunctionArguments<{ value: request_account_recovery }>) {
    const message = this.generateReactLink([this.getAccountLink(op.recovery_account), "requested account recovery to account:", this.getAccountLink(op.account_to_recover)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "recover_account_operation"})
  formatRecoverAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: recover_account }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account_to_recover), "account was recovered"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "change_recovery_account_operation"})
  formatChangeRecoveryAccount({ source: { value: op }, target }: IFormatFunctionArguments<{ value: change_recovery_account }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account_to_recover), "changed recovery account to:", this.getAccountLink(op.new_recovery_account)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_transfer_operation"})
  formatEscrowTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage("Escrow transfer from", op, {hbd_amount: op.hbd_amount, hive_amount: op.hive_amount});
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_dispute_operation"})
  formatEscrowDispute({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage("Escrow dispute from", op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_release_operation"})
  formatEscrowReleaseOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage("Escrow release from", op, {hbd_amount: op.hbd_amount, hive_amount: op.hive_amount});
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "pow2_operation"})
  formatPow2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow2}>) {
    const message = this.generateReactLink([`Prove of Work 2, account creation fee: ${this.getFormattedAmount(op.props?.account_creation_fee)}, HBD interest rate: ${formatPercent(op.props?.hbd_interest_rate || 0)}, maximum block size: ${op.props?.maximum_block_size}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_approve_operation"})
  formatEscroweApproveOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage("Escrow approve from", op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_savings_operation"})
  formatTransferToSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_from_savings_operation"})
  formatTransferFromSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "cancel_transfer_from_savings_operation"})
  formatCancelTransferFromSavingsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.CancelTransferOperation }>) {
    const message = this.generateReactLink([this.getAccountLink(op.from), `cancelled transfer with id: ${op.request_id}`]);
    return {...target, value: message};
  }

  // Skip custom binary

  @WaxFormattable({matchProperty: "type", matchValue: "decline_voting_rights_operation"})
  formatDeclineVotingRightsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: decline_voting_rights }>) {
    let message: string | React.JSX.Element = "";
    if (op.decline) {
      message = this.generateReactLink([this.getAccountLink(op.account), "declined voting rights"]);
    } else {
      message = this.generateReactLink([this.getAccountLink(op.account), "cancelled declining of voting rights"]);
    }
    return {...target, value: message};
  }

  // Skip reset account

  // Skip set reset account

  @WaxFormattable({matchProperty: "type", matchValue: "claim_reward_balance_operation"})
  formatClaimRewardBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: claim_reward_balance }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), `claimed rewards: ${this.getFormattedAmount(op.reward_hbd)}, ${this.getFormattedAmount(op.reward_hive)}, ${this.getFormattedAmount(op.reward_vests)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "delegate_vesting_shares_operation"})
  formatDelegateVestingSharesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delegate_vesting_shares }>) {
    const message = this.generateReactLink([this.getAccountLink(op.delegator), `delegated ${this.getFormattedAmount(op.vesting_shares)} to`, this.getAccountLink(op.delegatee)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_create_with_delegation_operation"})
  formatAccountCreateWithDelegationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_create_with_delegation }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), "created new account:", this.getAccountLink(op.new_account_name),  `with delegation: ${this.getFormattedAmount(op.delegation)} and fee: ${this.getFormattedAmount(op.fee)}`]);
    return {...target, value: message};
  }

  // Leave it with simple message, props are too complicated to handle now
  @WaxFormattable({matchProperty: "type", matchValue: "witness_set_properties_operation"})
  formatWitnessSetPropertiesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: witness_set_properties }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), "updated witness properties"]);
    return {...target, value: message};
  }

  // Talk about more detailed update
  @WaxFormattable({matchProperty: "type", matchValue: "account_update2_operation"})
  formatAccountUpdate2Operation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_update2 }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), "updated an account"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "create_proposal_operation"})
  formatCreateProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: create_proposal }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), `created a proposal for ${this.getFormattedAmount(op.daily_pay)} daily to`, this.getAccountLink(op.receiver), `, details:`, this.getPermlink(op.creator, op.permlink), `since ${this.getFormattedDate(op.start_date)} to ${this.getFormattedDate(op.end_date)}`]);
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "update_proposal_votes_operation"})
  formatUpdateProposalVotesOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: update_proposal_votes }>) {
    let message: string | React.JSX.Element = "";
    if (op.approve) {
      message = this.generateReactLink([this.getAccountLink(op.voter), `approved proposal ${op.proposal_ids}`]);
    } else {
      message = this.generateReactLink([this.getAccountLink(op.voter), `removed approval for proposal ${op.proposal_ids}`]);
    }
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "remove_proposal_operation"})
  formatRemoveProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: remove_proposal }>) {
    const message = this.generateReactLink([this.getAccountLink(op.proposal_owner),`removed proposal ${op.proposal_ids}`]);
    return {...target , value: message};
  }

  // Not sure about all properties here
  @WaxFormattable({matchProperty: "type", matchValue: "update_proposal_operation"})
  formatUpdateProposalOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: update_proposal }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), `updated proposal ${op.proposal_id} for ${this.getFormattedAmount(op.daily_pay)} daily, details:`, this.getPermlink(op.creator, op.permlink)]);
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "collateralized_convert_operation"})
  formatCollateralizedConvertOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: collateralized_convert }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `collateralized convert ${this.getFormattedAmount(op.amount)} with request ID: ${op.requestid}`]);
    return {...target , value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "recurrent_transfer_operation"})
  formatRecurrentTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.RecurrentTransferOperation }>) {
    const message = this.generateReactLink([this.getAccountLink(op.from), `transfered recurrently ${op.executions} of ${op.recurrence} times ${this.getFormattedAmount(op.amount)} to`, this.getAccountLink(op.to)]);
    return {...target , value: message};
  }

  // === VIRTUAL ===

  @WaxFormattable({matchProperty: "type", matchValue: "fill_convert_request_operation"})
  formatFillConverRequest({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_convert_request }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `converted ${this.getFormattedAmount(op.amount_in)} to ${this.getFormattedAmount(op.amount_out)} for request ID: ${op.requestid}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "author_reward_operation"})
  formatAuthorRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: author_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    const message = this.generateReactLink([this.getAccountLink(op.author), "got an author reward for", this.getPermlink(op.author, op.permlink), `curators payout: ${this.getFormattedAmount(op.curators_vesting_payout)}, payouts: ${this.getFormattedAmount(op.vesting_payout)}, ${this.getFormattedAmount(op.hive_payout)}, ${this.getFormattedAmount(op.hbd_payout)}${mustBeClaimed}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "curation_reward_operation"})
  formatCurationRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: curation_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    const message = this.generateReactLink([this.getAccountLink(op.curator), `got a curation reward ${this.getFormattedAmount(op.reward)} for`, this.getPermlink(op.author, op.permlink), mustBeClaimed]);
    return {...target, value: message};
  }

  // Detailed properties were skiped
  @WaxFormattable({matchProperty: "type", matchValue: "comment_reward_operation"})
  formatCommentReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_reward }>) {
    const message = this.generateReactLink([this.getAccountLink(op.author), `got a comment reward ${this.getFormattedAmount(op.payout)} for`, this.getPermlink(op.author, op.permlink)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "liquidity_reward_operation"})
  formatLiquidityRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: liquidity_reward }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `got a liquidity reward ${this.getFormattedAmount(op.payout)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "interest_operation"})
  formatInterestOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: interest }>) {
    const wasLiquidModified = op.is_saved_into_hbd_balance ? ", liquid balance modified" : "";
    const message = this.generateReactLink([this.getAccountLink(op.owner), `got interest paid ${this.getFormattedAmount(op.interest)}`, wasLiquidModified]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_vesting_withdraw_operation"})
  formatFillVestingWithdrawOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_vesting_withdraw }>) {
    const message = this.generateReactLink([this.getAccountLink(op.from_account), `withdrawed ${this.getFormattedAmount(op.withdrawn)} and`, this.getAccountLink(op.to_account), `deposited ${this.getFormattedAmount(op.deposited)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_order_operation"})
  formatFillOrderOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_order }>) {
    const message = this.generateReactLink([this.getAccountLink(op.current_owner), `paid ${this.getFormattedAmount(op.current_pays)} for`, this.getAccountLink(op.open_owner), ` and received ${this.getFormattedAmount(op.open_pays)} (IDs: ${op.current_orderid} -> ${op.open_orderid})`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "shutdown_witness_operation"})
  formatShutdownWitnessOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: shutdown_witness }>) {
    const message = this.generateReactLink(["Witness", this.getAccountLink(op.owner), "was shutted down"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_transfer_from_savings_operation"})
  formatFillTransferFromSavings({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const memo = op.memo !== "" ? `, memo: "${op.memo}"` : "";
    const message = this.generateReactLink([`${this.getFormattedAmount(op.amount)} was transfered from`, this.getAccountLink(op.from), "to", this.getAccountLink(op.to), `request ID: ${op.request_id}${memo}`]);

    return {...target, value: message};
  }

  // Only id
  @WaxFormattable({matchProperty: "type", matchValue: "hardfork_operation"})
  formatHardforkOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: hardfork }>) {
    const message = this.generateReactLink([`Hardfork ${op.hardfork_id}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_payout_update_operation"})
  formatCommentPayoutUpdateOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_payout_update }>) {
    const message = this.generateReactLink([this.getAccountLink(op.author), "got payout update for", this.getPermlink(op.author, op.permlink)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "return_vesting_delegation_operation"})
  formatReturnVestingDelegationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: return_vesting_delegation }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), `received ${this.getFormattedAmount(op.vesting_shares)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "comment_benefactor_reward_operation"})
  formatCommentBenefactorRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: comment_benefactor_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed ? "" : ", doesn't have to be claimed";
    const message = this.generateReactLink([this.getAccountLink(op.benefactor), `received ${this.getFormattedAmount(op.vesting_payout)}, ${this.getFormattedAmount(op.hbd_payout)}, ${this.getFormattedAmount(op.hbd_payout)} for comment`, this.getPermlink(op.author, op.permlink), mustBeClaimed]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "producer_reward_operation"})
  formatProducerReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_reward }>) {
    const message = this.generateReactLink([this.getAccountLink(op.producer), `received ${this.getFormattedAmount(op.vesting_shares)} reward`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "clear_null_account_balance_operation"})
  formatClearNullAccountBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: clear_null_account_balance }>) {
    const message = this.generateReactLink([`Totally cleared: ${this.getFormattedMultipleAssets(op.total_cleared)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proposal_pay_operation"})
  formatProposalPayOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proposal_pay }>) {
    const message = this.generateReactLink([this.getAccountLink(op.receiver), ` was paid ${this.getFormattedAmount(op.payment)} for his proposal ${op.proposal_id} by`, this.getAccountLink(op.payer)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "dhf_funding_operation"})
  formatDhfFundingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: dhf_funding }>) {
    const message = this.generateReactLink([this.getAccountLink(op.treasury), `received ${this.getFormattedAmount(op.additional_funds)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "hardfork_hive_operation"})
  formatHardforkHiveOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: hardfork_hive }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), `aidrop of ${this.getFormattedAmount(op.hbd_transferred)}, ${this.getFormattedAmount(op.hive_transferred)}, ${this.getFormattedAmount(op.total_hive_from_vests)}, ${this.getFormattedAmount(op.vests_converted)} went to`, this.getAccountLink(op.treasury)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "hardfork_hive_restore_operation"})
  formatHardforkHiveRestoreOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: hardfork_hive_restore }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), `received ${this.getFormattedAmount(op.hive_transferred)} and ${this.getFormattedAmount(op.hbd_transferred)} from`, this.getAccountLink(op.treasury)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "delayed_voting_operation"})
  formatDelayedVotingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: delayed_voting }>) {
    const message = this.generateReactLink([this.getAccountLink(op.voter), `has ${op.votes} vote power`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "consolidate_treasury_balance_operation"})
  formatConsolidateTrasuryBalanceOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: consolidate_treasury_balance }>) {
    const message = this.generateReactLink([`${this.getFormattedMultipleAssets(op.total_moved)} was consolidated into treasury`]);

    return {...target, value: message};
  }

  //Not sure where to put rest of properties
  @WaxFormattable({matchProperty: "type", matchValue: "effective_comment_vote_operation"})
  formatEffectiveCommentVoteOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: effective_comment_vote }>) {
    const message = this.generateReactLink([this.getAccountLink(op.voter), "voted for", this.getPermlink(op.author, op.permlink), `and generated ${this.getFormattedAmount(op.pending_payout)} pending payout`]);
    return {...target, value: ""};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "ineffective_delete_comment_operation"})
  formatIneffectiveDeleteCommentOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: ineffective_delete_comment }>) {
    const message = this.generateReactLink([this.getAccountLink(op.author), "ineffectively deleted", this.getPermlink(op.author, op.permlink)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "dhf_conversion_operation"})
  formatDhfConversionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: dhf_conversion }>) {
    const message = this.generateReactLink([this.getAccountLink(op.treasury), `converted ${this.getFormattedAmount(op.hive_amount_in)} to ${this.getFormattedAmount(op.hbd_amount_out)}`]);

    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "expired_account_notification_operation"})
  formatExpiredAccountNotificationOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: expired_account_notification }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), "vote was nullified"]);

    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "changed_recovery_account_operation"})
  formatChangedRecoveryAccountOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: changed_recovery_account }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account),  "changed recovery account from",this.getAccountLink(op.old_recovery_account), "to", this.getAccountLink(op.new_recovery_account)]);

    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_vesting_completed_operation"})
  formatTransferToVestingCompletedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: transfer_to_vesting_completed }>) {
    const message = this.generateReactLink(["Vesting transfer from", this.getAccountLink(op.from_account), "to", this.getAccountLink(op.to_account), `was completed with ${this.getFormattedAmount(op.hive_vested)} -> ${this.getFormattedAmount(op.vesting_shares_received)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "pow_reward_operation"})
  formatPowRewardOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: pow_reward }>) {
    const message = this.generateReactLink([this.getAccountLink(op.worker), `received ${this.getFormattedAmount(op.reward)} reward`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "vesting_shares_split_operation"})
  formatVestingSharesSplitOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vesting_shares_split }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), ` splited vests ${this.getFormattedAmount(op.vesting_shares_before_split)} -> ${this.getFormattedAmount(op.vesting_shares_after_split)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "account_created_operation"})
  formatAccountCreatedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: account_created }>) {
    const message = this.generateReactLink([this.getAccountLink(op.new_account_name), "was created by", this.getAccountLink(op.creator), `with initials: vesting shares ${this.getFormattedAmount(op.initial_vesting_shares)} and delegations ${this.getFormattedAmount(op.initial_delegation)}`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "fill_collateralized_convert_request_operation"})
  formatFillCollateralizedConvertRequestOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: fill_collateralized_convert_request }>) {
    const message = this.generateReactLink([`Collateralized convert reuqest of ${op.owner} (ID: ${op.requestid}) was filled with ${this.getFormattedAmount(op.amount_in)} -> ${this.getFormattedAmount(op.amount_out)} and ${this.getFormattedAmount(op.excess_collateral)} excess`]);
    return {...target, value: message};
  }

  // Trimmed by component
  @WaxFormattable({matchProperty: "type", matchValue: "system_warning_operation"})
  formatSystemWarningOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: system_warning }>) {
    const message = this.generateReactLink([`${op.message}`]);
    return {...target, value: message};
  }

  // Cut memo
  @WaxFormattable({matchProperty: "type", matchValue: "fill_recurrent_transfer_operation"})
  formatFillRecurrentTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.generateReactLink(["Recurrent transfer from", this.getAccountLink(op.from), "to", this.getAccountLink(op.to), `with amount: ${this.getFormattedAmount(op.amount)} and ${op.remaining_executions} remaining executions`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "failed_recurrent_transfer_operation"})
  formatFailedRecurrentTransferOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const deleted = op.deleted ? " and was deleted" : "";
    const message = this.generateReactLink(["Recurrent transfer from", this.getAccountLink(op.from), "to", this.getAccountLink(op.to), `with amount: ${this.getFormattedAmount(op.amount)} and ${op.remaining_executions} remaining executions failed for ${op.consecutive_failures} times`, deleted]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "limit_order_cancelled_operation"})
  formatLimitOrderCancelledOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: limit_order_cancelled }>) {
    const message = this.generateReactLink([`Transfer ${op.orderid} by`, this.getAccountLink(op.seller), ` was cancelled and ${this.getFormattedAmount(op.amount_back)} were sent back`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "producer_missed_operation"})
  formatProducerMissedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_missed }>) {
    const message = this.generateReactLink([this.getAccountLink(op.producer), "missed block"]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proposal_fee_operation"})
  formatProposalFeeOperations({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proposal_fee }>) {
    const message = this.generateReactLink([this.getAccountLink(op.creator), `got proposal fee ${this.getFormattedAmount(op.fee)} ID: ${op.proposal_id} from`, this.getAccountLink(op.treasury)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "collateralized_convert_immediate_conversion_operation"})
  formatCollateralizedConvertImmediateConversionOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: collateralized_convert_immediate_conversion }>) {
    const message = this.generateReactLink([this.getAccountLink(op.owner), `received ${this.getFormattedAmount(op.hbd_out)} for conversion ID: ${op.requestid}`]);

    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "escrow_approved_operation"})
  formatEscrowApprovedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.generateReactLink(["Escrow from", this.getAccountLink(op.from), "to", this.getAccountLink(op.to), "by agent", this.getAccountLink(op.agent), `with fee: ${this.getFormattedAmount(op.fee)}, ID: ${op.escrow_id} was approved`]);
    return {...target, value: message};
  }

  // Cutted numbers
  @WaxFormattable({matchProperty: "type", matchValue: "escrow_rejected_operation"})
  formatEscrowRejectedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.generateReactLink(["Escrow from", this.getAccountLink(op.from), "to", this.getAccountLink(op.to), "by agent", this.getAccountLink(op.agent), `with fee: ${this.getFormattedAmount(op.fee)}, ID: ${op.escrow_id} was rejected`]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "proxy_cleared_operation"})
  formatProxyClearedOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: proxy_cleared }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), "cleared proxy", this.getAccountLink(op.proxy)]);
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "declined_voting_rights_operation"})
  formatDeclinedVotingRightsOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: declined_voting_rights }>) {
    const message = this.generateReactLink([this.getAccountLink(op.account), "votes rights were declined"]);
    return {...target, value: message};
  }
  
}

export default OperationsFormatter