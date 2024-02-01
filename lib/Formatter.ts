import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, WaxFormattable } from "@hive/wax/web";
import moment from "moment";


class OperationsFormatter {
    // Example formatter
    @WaxFormattable()
    operation({ target }: IFormatFunctionArguments<Hive.OperationResponse>) {
      const message: string = "Test";
      const previousObject = structuredClone(target);
      previousObject.operation.message = message;
      return previousObject;
    }
  
  }


export default OperationsFormatter