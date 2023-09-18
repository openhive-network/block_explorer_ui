import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import fetchingService from "@/services/FetchingService";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Witnesses() {
  const witnessesQuery = useQuery({
    queryKey: ["witnesses"],
    queryFn: () => fetchingService.getWitnesses(200, 0, "votes", "desc"),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="m-8 max-w-[100vw]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-explorer-bg-start"></TableHead>
            <TableHead className="sticky left-6 bg-explorer-bg-start">Name</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Voters</TableHead>
            <TableHead>Block Size</TableHead>
            <TableHead>Price Feed</TableHead>
            <TableHead>Feed Age</TableHead>
            <TableHead>Signing Key</TableHead>
            <TableHead>Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {witnessesQuery.data?.map((singleWitness, index) => (
            <TableRow
              key={index}
              className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}`}
            >
              <TableCell
                className={
                  `${index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}` +
                  " sticky left-0"
                }
              >
                {index + 1}
              </TableCell>
              <TableCell
                className={
                  `${index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}` +
                  " text-blue-800 sticky left-6"
                }
              >
                {" "}
                <Link href={`/witness/${singleWitness.witness}`}>
                  {singleWitness.witness}
                </Link>
              </TableCell>
              <TableCell>{singleWitness.votes_vests.toLocaleString()}</TableCell>
              <TableCell>{singleWitness.voters_num.toLocaleString()}</TableCell>
              <TableCell>
                {singleWitness.block_size
                  ? singleWitness.block_size.toLocaleString()
                  : "--"}
              </TableCell>
              <TableCell>
                {singleWitness.price_feed
                  ? singleWitness.price_feed.toLocaleString()
                  : "--"}
              </TableCell>
              <TableCell>
                {singleWitness.feed_age ? singleWitness.feed_age : "--"}
              </TableCell>
              <TableCell>
                {singleWitness.signing_key
                  ? `${singleWitness.signing_key.slice(0, 10)}...`
                  : "--"}
              </TableCell>
              <TableCell>{singleWitness.version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
