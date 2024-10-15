import { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import { cn } from "@/lib/utils";
import { config } from "@/Config";

type AccountWitnessVotesCardProps = {
  voters: string[];
  accountName: string;
  proxy: string;
};

const buildTableBody = (voters: string[]) => {
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
              className="text-blue-400"
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

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

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
            <Link
              className="text-link"
              href={`/@${accountName}`}
            >
              @{accountName}
            </Link>
            <span> uses </span>
            <Link
              className="text-link"
              href={`/@${proxy}`}
            >
              @{proxy}
            </Link>
            <span> as a voting proxy</span>
          </div>
        </CardContent>
      </Card>
    );
  } else if (!voters || !voters.length) return null;
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
          <TableBody>{buildTableBody(voters)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountWitnessVotesCard;
