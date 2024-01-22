import { WaxFormattable } from "@hive/wax/web";


class TestFormatter {
    @WaxFormattable() // Match this method as `myCustomProp` custom formatter
    mid_voting_seconds(value: any) {
      return value.mid_voting_seconds.toString();
    }
  
  }


export default TestFormatter