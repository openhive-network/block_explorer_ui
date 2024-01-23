import { config } from "@/Config";
import Hive from "@/types/Hive";
import { WaxFormattable } from "@hive/wax/web";
import moment from "moment";


class TestFormatter {
    // Example formatter
    @WaxFormattable()
    time(value: Hive.DynamicGlobalBlock) {
      const time = moment(value.time).format(config.baseMomentTimeFormat);
      return {...value, time};
    }
  
  }


export default TestFormatter