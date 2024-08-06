import { useState, useEffect } from "react";
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
import { QueryObserverResult } from "@tanstack/react-query";
import Hive from "@/types/Hive";
import { config } from "@/Config";

interface AccountLiveDataProps {
  accountName: string;
  liveDataOperations: boolean;
  setLiveDataOperations: (state: boolean) => void;
  refetchAccountOperations: QueryObserverResult<Hive.AccountOperationsResponse>["refetch"];
}

const AccountLiveData: React.FC<AccountLiveDataProps> = ({ 
    accountName, 
    liveDataOperations,
    setLiveDataOperations,
    refetchAccountOperations }) => {
  const [liveDataManabars, setLiveDataManabars] = useState(false);
  const { refetchManabars } = useManabars(accountName);
  const [liveDataDetails, setLiveDataDetails] = useState(false);
  const {refetchAccountDetails} = useAccountDetails(accountName);
  const [liveDataAuth, setLiveDataAuth] = useState(false);
  const {refetchAccountAuthorities} = useAccountAuthorities(accountName);
  const [liveDataRc, setLiveDataRc] =  useState(false);
  const {refetchRcDelegations} = useRcDelegations(accountName, 1000);
  const [liveDataVesting, setLiveDataVesting] = useState(false);
  const {refetchVestingDelegations} = useVestingDelegations(accountName, null, 1000);
  const [liveDataWitnessVoters, setLiveDataWitnessVoters] = useState(false);
  const {refetchWitnessVoters,} = useWitnessVoters(accountName, false, true, "vests");
  const [liveDataWitnessVotesHistory, setLiveDataWitnessVotesHistory] = useState(false);
  const [fromDate] = useState<Date>(
    moment().subtract(7, "days").toDate()
  );
  const [toDate] = useState<Date>(moment().toDate());
  const {refetchVotesHistory} = useWitnessVotesHistory(accountName, false, fromDate, toDate);
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveDataManabars) refetchManabars();
      if (liveDataDetails) refetchAccountDetails();
      if (liveDataOperations) refetchAccountOperations();
      if (liveDataAuth) refetchAccountAuthorities();
      if (liveDataRc) refetchRcDelegations();
      if (liveDataVesting) refetchVestingDelegations();
      if (liveDataWitnessVoters) refetchWitnessVoters();
      if (liveDataWitnessVotesHistory) refetchVotesHistory();
    }, config.accountRefreshInterval);

    return () => clearInterval(interval);
  }, [
    liveDataManabars, refetchManabars,
    liveDataDetails, refetchAccountDetails,
    liveDataOperations, refetchAccountOperations,
    liveDataAuth, refetchAccountAuthorities,
    liveDataRc, refetchRcDelegations,
    liveDataVesting, refetchVestingDelegations,
    liveDataWitnessVoters, refetchWitnessVoters,
    liveDataWitnessVotesHistory, refetchVotesHistory
  ]);
  
  return (
    <Card data-testid="account-live-data" className="col-span-4 md:col-span-1">
      <CardHeader>
        <Toggle
          checked={[
            liveDataManabars, 
            liveDataDetails, 
            liveDataOperations, 
            liveDataAuth,
            liveDataRc,
            liveDataVesting,
            liveDataWitnessVoters,
            liveDataWitnessVotesHistory
        ]}
          onClick={[
            () => setLiveDataManabars(!liveDataManabars),
            () => setLiveDataDetails(!liveDataDetails),
            () => setLiveDataOperations(!liveDataOperations),
            () => setLiveDataAuth(!liveDataAuth),
            () => setLiveDataRc(!liveDataRc),
            () => setLiveDataVesting(!liveDataVesting),
            () => setLiveDataWitnessVoters(!liveDataWitnessVoters),
            () => setLiveDataWitnessVotesHistory(!liveDataWitnessVotesHistory)
        ]}
          className="text-base"
          leftLabel="Live data"
        />
      </CardHeader>
    </Card>
  );
};

export default AccountLiveData;