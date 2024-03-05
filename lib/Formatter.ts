import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, IWaxBaseInterface, IWaxCustomFormatter, WaxFormattable, account_create, account_update, account_witness_proxy, account_witness_vote, comment, convert, custom, feed_publish, limit_order_cancel, limit_order_create, pow, producer_missed, producer_reward, transfer, transfer_to_vesting, vote, withdraw_vesting, witness_update } from "@hive/wax";
import moment from "moment";
import { formatPercent } from "./utils";

class OperationsFormatter implements IWaxCustomFormatter {
  
  public constructor(
    private readonly wax: IWaxBaseInterface
  ) {}

  private formatAmount (supply: Hive.Supply | undefined): string {
    return(this.wax.formatter.format(supply));
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
    let message = `${op.from} transferred ${this.formatAmount(op.amount)} to ${op.to}`;
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

  // Virtual

  @WaxFormattable({matchProperty: "type", matchValue: "producer_reward_operation"})
  formatProducerReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_reward }>) {
    let message = `${op.producer} got ${this.formatAmount(op.vesting_shares)} reward`;
    return {...target, value: message};
  }

  
}

export default OperationsFormatter