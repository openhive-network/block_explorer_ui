import Explorer from "@/types/Explorer"
import Image from "next/image"
import Link from "next/link"
import {getHiveAvatarUrl} from "@/utils/HiveBlogUtils"

interface HeadBlockCardProps {
  headBlockCardData?: Explorer.HeadBlockCardData,
  transactionCount: number
}

const cardNameMap = new Map([
  ["feedPrice", "Feed price"],
  ["blockchainTime", "Blockchain time"],
  ["rewardFund", "Rewards fund"],
  ["currentSupply", "Current Supply"],
  ["virtualSupply", "Virtual Supply"],
  ["initHbdSupply", "Init hbd supply"],
  ["currentHbdSupply", "Current hbd supply"],
  ["pendingRewardedVestingHive", "Total vesting fund hive"],
  ["totalVestingFundHive", "Pending rewarded vesting hive"],
  ["hbdInterestRate", "Hbd interest rate"],
  ["hbdPrintRate", "Hbd print rate"],
  ["requiredActionsPartitionPercent", "Required actions partition percent"],
  ["lastIrreversibleBlockNumber", "Last irreversible block num"],
  ["availableAccountSubsidies", "Available account subsidies"],
  ["hbdStopPercent", "Hbd stop percent"],
  ["hbdStartPercent", "Hbd start percent"],
  ["nextMaintenanceTime", "Next maintenance time"],
  ["lastBudgetTime", "Last budget time"],
  ["nextDailyMaintenanceTime", "Next daily maintenance time"],
  ["contentRewardPercent", "Content reward percent"],
  ["vestingRewardPercent", "Vesting reward percent"],
  ["downvotePoolPercent", "Downvote pool percent"],
  ["currentRemoveThreshold", "Current remove threshold"],
  ["earlyVotingSeconds", "Early voting seconds"],
  ["midVotingSeconds", "Mid voting seconds"],
  ["maxConvecutiveRecurrentTransferFailures", "Max consecutive recurrent transfer failures"],
  ["maxRecurrentTransferEndDate", "Max recurrent transfer end date"],
  ["minRecurrentTransfersRecurrence", "Min recurrent transfers recurrence"],
  ["maxOpenRecurrentTransfers", "Max open recurrent transfers"]
])

const HeadBlockCard: React.FC<HeadBlockCardProps> = ({headBlockCardData, transactionCount}) => {
  return(
    <div className='mt-6 col-start-1 col-span-4 md:col-span-1 bg-explorer-dark-gray p-2 rounded-["6px] md:mx-6 h-fit rounded'>
      <div className='text-explorer-orange text-2xl my-2'>
        <Link href={`/block/${headBlockCardData?.headBlockNumber}`} >Block: {headBlockCardData?.headBlockNumber}</Link>
      </div>
      <div className="my-2">Operations per block: {transactionCount}</div>
      <div>
        <Link className="flex justif-between items-center" href={`/account/${headBlockCardData?.witnessName}`} >
          <span>Current witness: </span> <span className="text-explorer-orange mx-2">{headBlockCardData?.witnessName}</span>
          <Image className="rounded-full" src={getHiveAvatarUrl(headBlockCardData?.witnessName)} alt="avatar" width={40} height={40} /> 
        </Link>
      </div>
      <div>
        <div className="text-center mt-8">Properties</div>
        {Object.entries(headBlockCardData?.headBlockDetails || {}).map(([key, value]) => (
          <div key={key} className="border-b border-solid border-gray-700 flex justify-between py-1"><span className="mr-2">{`${cardNameMap.get(key)}: `}</span><span>{value}</span></div>
        ))}
      </div>
    </div>
  )        
}

export default HeadBlockCard