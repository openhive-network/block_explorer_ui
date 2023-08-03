
import { useRouter } from 'next/router';
import { useQuery  } from '@tanstack/react-query';
import fetchingService from '@/services/FetchingService';
import Link from 'next/link';


const witnessPropertiesMap = new Map([
  ["witness", "Name"],
  ["rank",  "Rank"],
  ["url", "Site"],
  ["votes", "Votes"],
  ["votes_daily_change", "Votes daily change"],
  ["voters_num", "Number of voters"],
  ["voters_num_daily_change", "Daily change of voters number"],
  ["price_feed", "Price feed"],
  ["feed_age",  "Feed age"],
  ["bias",  "Bias"],
  ["block_size", "Block Size"],
  ["signing_key", "Signing key"],
  ["version", "Version"]
])

const linkMap = new Map<string, Function>([
  ["witness", (value: string) => <Link className=' text-blue-600' href={`/account/${value}`}>{value}</Link>],
  ["url", (value: string) => <a className=' text-blue-600' target="_blank" href={value}>{value}</a>]
])

export default function WitnessDetails() {
  const router = useRouter();
  const witnessName = router.query.witnessName as string;

  const witnessQuery = useQuery({
    queryKey: ["witness"],
    queryFn: () => fetchingService.getWitness(witnessName),
    select: (witnessData) => witnessData[0]
  })

  return (
    <div className='mt-6 w-full bg-explorer-dark-gray py-2 rounded-[6px] max-w-5xl px-4 text-white'>
        <h3 className='text-center text-xl'>Witness</h3>
        <div className='w-full'>
          {witnessQuery.data && Object.entries(witnessQuery.data)?.map(([key, value]) => (
            <div className="border-b border-solid border-gray-700 flex py-1" key={key}>
              <span className='mr-4'>{witnessPropertiesMap.get(key)}</span>
              {linkMap.get(key) ? (
                linkMap.get(key)?.(value)
              ) : (
                <span> {value}</span>
              )}
              
            </div>
          ))}
        </div>
    </div>
  )
}