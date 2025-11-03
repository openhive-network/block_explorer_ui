// components/home/TopWitnessesCard.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveRight, MoveLeft } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Witness {
  witness_name: string;
}

interface WitnessesData {
  witnesses: Witness[];
}

interface TopWitnessesCardProps {
  witnessesData?: WitnessesData;
  isLoading: boolean;
}

const TopWitnessesCard = ({
  witnessesData,
  isLoading,
}: TopWitnessesCardProps) => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  return (
    <Card
      className="col-span-12 md:col-span-12 lg:col-span-3 overflow-hidden h-full max-h-[1315px] flex flex-col"
      data-testid="top-witnesses-sidebar"
    >
      <CardHeader className="flex justify-between items-center border-b px-1 py-3">
        <CardTitle>{t("home.topWitnesses")}</CardTitle>
        <Link
          href="/witnesses"
          className="text-sm flex items-center space-x-1"
          data-testid="see-witnesses-link"
        >
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-2 overflow-y-auto flex-grow">
        <Table>
          <TableBody className="text-base">
            {witnessesData &&
              witnessesData.witnesses.map((witness, index) => (
                <TableRow key={index} data-testid="witnesses-name">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/@${witness.witness_name}`}
                      className="text-link"
                    >
                      {witness.witness_name}
                    </Link>
                  </TableCell>
                  <TableCell className="py-2">
                    <Link href={`/@${witness.witness_name}`}>
                      <div className="min-w-[30px]">
                        <Image
                          className="rounded-full border-2 border-link transition-all transform hover:scale-110"
                          src={getHiveAvatarUrl(witness.witness_name)}
                          alt="avatar"
                          width={40}
                          height={40}
                        />
                      </div>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="py-4 px-4 bg-explorer-extra-light-gray">
        <div className="w-full flex justify-center">
          <Link
            data-testid="see-more-btn"
            href="/witnesses"
            className="text-link"
          >
            {t("common.seeMore")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TopWitnessesCard;
