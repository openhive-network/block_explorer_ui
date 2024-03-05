import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, IWaxBaseInterface, IWaxCustomFormatter, WaxFormattable, comment, producer_missed, producer_reward, transfer, transfer_to_vesting, vote } from "@hive/wax";
import moment from "moment";

class OperationsFormatter implements IWaxCustomFormatter {
  
  public constructor(
    private readonly wax: IWaxBaseInterface
  ) {}

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
    let message = `${op.from} transferred ${this.wax.formatter.format(op.amount)} to ${op.to}`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "transfer_to_vesting_operation"})
  formatTransferToVestingOperation({ source: { value: op }, target }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    let message = `${op.from} transfered ${this.wax.formatter.format(op.amount)} to vesting`;
    return {...target, value: message};
  }

  @WaxFormattable({matchProperty: "type", matchValue: "producer_reward_operation"})
  formatProducerReward({ source: { value: op }, target }: IFormatFunctionArguments<{ value: producer_reward }>) {
    let message = `${op.producer} got ${this.wax.formatter.format(op.vesting_shares)} reward`;
    return {...target, value: message};
  }

  
}

export default OperationsFormatter