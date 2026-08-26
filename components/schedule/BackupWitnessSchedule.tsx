import React from "react";
import Link from "next/link";

import {
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableHeader,
  TableBody,
} from "../ui/table";
import PageTitle from "../PageTitle";
import { useI18n } from "../../i18n/i18n";

const TABLE_CELLS = [
  "backupWitnessSchedule.rank",
  "backupWitnessSchedule.witness",
  "backupWitnessSchedule.order",
];

export interface BackupWitness {
  owner: string;
  rank: number | null;
}

interface BackupWitnessScheduleProps {
  data: BackupWitness[];
}

const buildTableHeader = (t: (key: string) => string) => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        stickyLeft={index === 0 ? true : undefined}
        className="text-left text-sm font-medium uppercase tracking-wider py-1 px-2"
        key={cell}
      >
        {t(cell)}
      </TableHead>
    );
  });
};

const buildTableBody = (data: BackupWitness[], t: (key: string) => string) => {
  if (!data || !data.length) return;

  return data.map(({ rank, owner }: BackupWitness, index: number) => {
    return (
      <React.Fragment key={owner}>
        <TableRow className="transition-colors">
          <TableCell stickyLeft className="py-1 px-2 whitespace-nowrap text-sm">
            {rank !== null ? `#${rank}` : "-"}
          </TableCell>
          <TableCell className="py-1 px-2 whitespace-nowrap text-sm">
            <Link href={`/@${owner}`} className="text-link hover:underline">
              {owner}
            </Link>
          </TableCell>
          <TableCell className="py-1 px-2 whitespace-nowrap text-sm">{`[${
            index + 1
          }]`}</TableCell>
        </TableRow>
      </React.Fragment>
    );
  });
};

const BackupWitnessSchedule: React.FC<BackupWitnessScheduleProps> = ({
  data,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex w-full overflow-auto">
      <div className="bg-theme rounded-xl shadow-md w-full p-3">
        <PageTitle titleKey={t("backupWitnessSchedule.title")} classic />

        <div className="overflow-x-auto">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow rowVariant="header">{buildTableHeader(t)}</TableRow>
            </TableHeader>
            <TableBody>{buildTableBody(data, t)}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BackupWitnessSchedule;
