import React from "react";

import { useI18n } from "@/i18n/i18n";
import {
  formatAndDelocalizeFromTime,
  formatBlockchainTime,
} from "@/utils/TimeUtils";

interface PendingDateCellProps {
  value: string | Date | null;
}

const PendingDateCell: React.FC<PendingDateCellProps> = ({ value }) => {
  const { locale } = useI18n();
  if (!value) return <span>—</span>;

  return (
    <div className="whitespace-nowrap">
      <div>
        {/* dir="ltr": RTL bidi otherwise moves the time and "UTC" before the date. */}
        <span dir="ltr">{formatBlockchainTime(value)}</span>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-300">
        {formatAndDelocalizeFromTime(value, locale)}
      </div>
    </div>
  );
};

export default PendingDateCell;
