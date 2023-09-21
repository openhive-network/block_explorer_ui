
import { useRouter } from 'next/router';
import { useQuery  } from '@tanstack/react-query';
import fetchingService from '@/services/FetchingService';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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
    select: (witnessData) => witnessData[0],
    enabled: !!witnessName,
    refetchOnWindowFocus: false,
  })

  const votersQuery = useQuery({
    queryKey: ["voters"],
    queryFn: () => fetchingService.getWitnessVoters(witnessName, "vests", "desc"),
    enabled: !!witnessName,
    refetchOnWindowFocus: false,
  })

  return (
    <div className='w-full flex justify-center flex-col items-center'>
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
      <div className="w-1/2 items--center justify-center">
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead>Voter</TableHead>
              <TableHead>Hive power</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votersQuery?.data && votersQuery?.data?.map((voter, index) => (
              <TableRow key={index} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}`}>
                <TableCell className=' text-blue-600'><Link href={`/account/${voter.voter}`}>{voter.voter}</Link></TableCell>
                <TableCell >{voter.votes_hive_power} </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}