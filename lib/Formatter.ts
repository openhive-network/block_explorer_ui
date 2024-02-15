import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, WaxFormattable } from "@hive/wax/web";
import moment from "moment";


class OperationsFormatter {
    // Example formatter
    @WaxFormattable()
    operation({ target }: IFormatFunctionArguments<Hive.OperationResponse>) {
      const previousObject = structuredClone(target);
      return previousObject;
    }
  
  }


export default OperationsFormatter