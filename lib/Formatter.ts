import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IFormatFunctionArguments, WaxFormattable } from "@hive/wax/web";
import moment from "moment";


class TestFormatter {
    // Example formatter
    @WaxFormattable()
    time({ source }: IFormatFunctionArguments<Hive.DynamicGlobalBlock>) {
      const time = moment(source.time).format(config.baseMomentTimeFormat);
      return {...structuredClone(source), time};
    }
  
  }


export default TestFormatter