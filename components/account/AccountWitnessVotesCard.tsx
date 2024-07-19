import { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import { cn } from "@/lib/utils";
import { config } from "@/Config";

type AccountWitnessVotesCardProps = {
  voters: string[];
};

const buildTableBody = (voters: string[]) => {
  return voters.map((voter: string, index: number) => {
    const isLast = index === voters.length - 1;
    return (
      <Fragment key={index}>
        <TableRow
          className={cn(
            {
              "border-t border-gray-700": index !==0,
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
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const voters = [...initialVoters];
  if (!voters || !voters.length) return null;
  voters.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())  // Changed: Sorting logic to ensure alphabetical order
  );
  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  return (
    <Card
      data-testid="witness-votes-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">Witness Votes ({voters.length} / {config.maxWitnessVotes})</div>

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
