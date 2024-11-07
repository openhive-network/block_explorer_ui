import { useState, useEffect, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import { cn } from "@/lib/utils";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

type AccountWitnessVotesCardProps = {
  voters: string[];
  accountName: string;
  proxy: string;
};

const buildTableBody = (voters: string[], isProxy: boolean) => {
  return voters.map((voter: string, index: number) => {
    const isLast = index === voters.length - 1;
    return (
      <Fragment key={index}>
        <TableRow
          className={cn(
            {
              "border-t border-gray-700": index !== 0,
              "border-b border-gray-700": !isLast,
            },
            "hover:bg-inherit"
          )}
        >
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            <Link
              className={cn("text-blue-400", { "italic": isProxy })} // Apply italic class conditionally
              href={`/@${voter}`}
            >
              {voter}
            </Link>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountWitnessVotesCard: React.FC<AccountWitnessVotesCardProps> = ({
  voters: initialVoters,
  accountName: accountName,
  proxy: proxy,
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const voters = [...initialVoters];
  const [votersForProxy, setVotersForProxy] = useState<any[]>([]);
  const [allProxies, setAllProxies] = useState<string[]>([]);

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };
  
  const fetchWitnessVotes = async (
    proxy: string,
    currentDepth: number,
    maxDepth: number,
    proxiesList: string[],
  ): Promise<any[]> => {
    if (currentDepth > maxDepth || (!proxy)) return [];
    
    const result = await fetchingService.getAccount(proxy);
    // Add the current proxy to the proxies list
    proxiesList.push(proxy);

    // If there's another proxy, go deeper if within maxDepth
    if (result.proxy && currentDepth < maxDepth) {
      const nestedVotes = await fetchWitnessVotes(result.proxy, currentDepth + 1, maxDepth, proxiesList);
      return [...result.witness_votes, ...nestedVotes];
    }
    
    return result.witness_votes?.slice().sort(
      (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))  || [];
  };

  
  useEffect(() => {  
    if (!proxy) return;
    const getVotersForProxy = async () => {
      const proxiesList: string[] = [];  // Local list to track all proxy names
      const votes = await fetchWitnessVotes(proxy, 1, config.maxProxyDepth, proxiesList);
      setVotersForProxy(votes);
      setAllProxies(proxiesList);  // Update state with the complete list of proxies
    };
    getVotersForProxy();
  }, [proxy]);

  if (proxy != null && proxy.length > 0) {     
    return (
      <Card
        data-testid="witness-votes-dropdown"
        className="overflow-hidden"
      >
        <CardHeader className="p-0">
          <div
            onClick={handlePropertiesVisibility}
            className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
          >
            <div className="text-lg">Witness Votes (proxy)</div>

            {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
          </div>
        </CardHeader>
        <CardContent hidden={isPropertiesHidden}>
          <div>
            <Link className="text-link" href={`/@${accountName}`}>
              @{accountName}
            </Link>
            <span> uses </span>

            {allProxies.map((proxyName, index) => (
              <span key={index}>
                <Link className="text-link" href={`/@${proxyName}`}>
                  @{proxyName}
                </Link>
                {index < allProxies.length - 1 && <span>, who uses </span>}
              </span>
            ))}
            
            <span> as a voting proxy</span><br /><br />
            <h1>Votes of <Link className="text-link" href={`/@${allProxies[allProxies.length - 1]}`}>
              @{allProxies[allProxies.length - 1]}
            </Link></h1>
            <Table>
              <TableBody>{buildTableBody(votersForProxy, true)}</TableBody>
            </Table>

          </div>
        </CardContent>


      </Card>
    );
  }
  else if (!voters || !voters.length) return null;
  voters.sort(
    (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) // Changed: Sorting logic to ensure alphabetical order
  );

  return (
    <Card
      data-testid="witness-votes-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">
            Witness Votes ({voters.length} / {config.maxWitnessVotes})
          </div>

          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table>
          <TableBody>{buildTableBody(voters, false)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountWitnessVotesCard;
