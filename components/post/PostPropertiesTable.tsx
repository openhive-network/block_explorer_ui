import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";

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

  return visibleKeys.map((key) => (
    <TableRow
      key={key}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <TableCell className="font-semibold align-top w-1/4 pr-8">
        {key}
      </TableCell>
      <TableCell className="text-left">
        <pre className="whitespace-pre-wrap font-sans text-sm break-all">
          {renderParam(data[key as keyof Hive.HivePost])}
        </pre>
      </TableCell>
    </TableRow>
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
  const { t } = useI18n();
  if (!isPropertiesOpen) return null; 

  return (
    <div className="rounded-[4px]  border bg-card text-card-foreground overflow-x-auto ">
      <div className="p-4 border-b bg-theme">
        <h3 className="text-lg font-semibold">
          {t("postPropertiesTable.title")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableBody>{buildTableBody(data)}</TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PostPropertiesTable;
