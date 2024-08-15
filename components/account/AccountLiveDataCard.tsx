import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { Toggle } from "../ui/toggle";
import useManabars from "@/api/accountPage/useManabars";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountAuthorities from "@/api/accountPage/useAccountAuthorities";
import useRcDelegations from "@/api/common/useRcDelegations";
import useVestingDelegations from "@/api/common/useVestingDelegations";
import useWitnessVoters from "@/api/common/useWitnessVoters";
import useWitnessVotesHistory from "@/api/common/useWitnessVotesHistory";
import moment from "moment";
import { config } from "@/Config";
import Hive from "@/types/Hive"; 
import { QueryObserverResult } from "@tanstack/react-query";
interface AccountLiveDataProps {
  accountName: string;
  refetchAccountOperations: QueryObserverResult<Hive.AccountOperationsResponse>["refetch"];
}

const AccountLiveData: React.FC<AccountLiveDataProps> = ({ accountName, refetchAccountOperations }) => {
  const [liveDataEnabled, setLiveDataEnabled] = useState(false);
  const [fromDate] = useState<Date>(moment().subtract(7, "days").toDate());
  const [toDate] = useState<Date>(moment().toDate());
  useEffect(() => {
    if (liveDataEnabled) {
      const interval = setInterval(() => {
      refetchAccountOperations();}, config.accountRefreshInterval)
      return () => clearInterval(interval);
    }
  }, [liveDataEnabled, refetchAccountOperations]);
  useManabars(accountName, liveDataEnabled ? config.accountRefreshInterval : false);
  useAccountDetails(accountName, liveDataEnabled ? config.accountRefreshInterval : false);
  useAccountAuthorities(accountName, liveDataEnabled ? config.accountRefreshInterval : false);
  useRcDelegations(accountName, 1000, liveDataEnabled ? config.accountRefreshInterval : false);
  useVestingDelegations(accountName, null, 1000, liveDataEnabled ? config.accountRefreshInterval : false);
  useWitnessVoters(accountName, false, true, "vests", liveDataEnabled ? config.accountRefreshInterval : false);
  useWitnessVotesHistory(accountName, false, fromDate, toDate, liveDataEnabled ? config.accountRefreshInterval : false);

  return (
    <Card data-testid="account-live-data" className="col-span-4 md:col-span-1">
      <CardHeader>
        <Toggle
          checked={liveDataEnabled}
          onClick={() => setLiveDataEnabled(!liveDataEnabled)}
          className="text-base"
          leftLabel="Live Data"
        />
      </CardHeader>
    </Card>
  );
};

export default AccountLiveData;
