import { Fragment } from "react";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import Hive from "@/types/Hive";

const PROPERTY_KEYS = [
  "author",
  "permlink",
  "category",
  "json_metadata",
  "created",
  "last_update",
  "depth",
  "children",
  "last_payout",
  "cashout_time",
  "total_payout_value",
  "curator_payout_value",
  "pending_payout_value",
  "promoted",
  "body_length",
  "author_reputation",
  "root_title",
  "beneficiaries",
  "max_accepted_payout",
  "percent_hbd",
  "id",
  "net_rshares",
  "author_rewards",
];

const renderParam = (
  value:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Hive.PostPageVoteDetails[]
) => {
  if (typeof value === "string") {
    return value.toString();
  }
  return JSON.stringify(value);
};
const buildTableBody = (data: Hive.Content) => {
  return PROPERTY_KEYS.map((key, index) => (
    <Fragment key={index}>
      <TableRow className="border-b border-gray-700 hover:bg-inherit dark:hover:bg-inherit">
        <TableCell>{key}</TableCell>
        <TableCell className="text-left">
          {renderParam(data[key as keyof Hive.Content])}
        </TableCell>
      </TableRow>
    </Fragment>
  ));
};

interface PostPropertiesTableProps {
  isPropertiesOpen: boolean;
  data: Hive.Content;
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
