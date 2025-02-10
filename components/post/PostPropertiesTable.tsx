import { Fragment } from "react";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import Hive from "@/types/Hive";

const EXCLUDE_PROPERTY_KEYS = ["active_votes", "body", "replies"];

const excludeKeys = (array: string[], exclude: string[]): string[] => {
  return array.filter((value) => !exclude.includes(value));
};

const renderParam = (
  value:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Hive.PostPageVoteDetails[]
    | Hive.HivePost
    | Hive.HivePostMetadata
    | Hive.HivePostStats
) => {
  if (typeof value === "string") {
    return value.toString();
  }
  return JSON.stringify(value);
};
const buildTableBody = (data: Hive.HivePost | null | undefined) => {
  if (!data) return;

  const dataKeys = Object.keys(data);
  const visibleKeys = excludeKeys(dataKeys, EXCLUDE_PROPERTY_KEYS);

  return visibleKeys.map((key, index) => (
    <Fragment key={index}>
      <TableRow className="border-b border-gray-700 hover:bg-inherit dark:hover:bg-inherit">
        <TableCell>{key}</TableCell>
        <TableCell className="text-left break-all">
          {renderParam(data[key as keyof Hive.HivePost])}
        </TableCell>
      </TableRow>
    </Fragment>
  ));
};

interface PostPropertiesTableProps {
  isPropertiesOpen: boolean;
  data: Hive.HivePost | null | undefined;
}

const PostPropertiesTable: React.FC<PostPropertiesTableProps> = ({
  isPropertiesOpen,
  data,
}) => {
  if (!isPropertiesOpen) return null;

  return (
    <div className="mt-2 mx-5">
      <Table>
        <TableBody>{buildTableBody(data)}</TableBody>
      </Table>
    </div>
  );
};

export default PostPropertiesTable;
