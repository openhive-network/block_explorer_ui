import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, WaxFormattable, comment, vote } from "@hive/wax/web";
import moment from "moment";

class OperationsFormatter {
  @WaxFormattable({matchProperty: "type", matchValue: "vote_operation"})
  formatVote({ source: { value: op }, target }: IFormatFunctionArguments<{ value: vote }>) {
    const message = `${op.voter} voted on "@${op.author}/${op.permlink}"`;
    return {...target, value: message};
  }
}

export default OperationsFormatter