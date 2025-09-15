import React from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

interface TableSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const TableSearchBar: React.FC<TableSearchBarProps> = ({ value, onChange }) => {
  const { t } = useI18n();

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("filters.searchUser")}
        className="w-full border rounded pl-10 pr-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
};

export default TableSearchBar;
