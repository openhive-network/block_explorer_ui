import React from "react";
import { useI18n } from "@/i18n/i18n";

interface DataCountMessageProps {
  count: number;
  dataType: string;
}

const DataCountMessage: React.FC<DataCountMessageProps> = ({
  count,
  dataType,
}) => {
  const { t, locale } = useI18n();
  if (!count) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50  rounded-md animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <span>
        {t("dataCountMessage.aTotalOf")}{" "}
        <strong className="font-semibold text-foreground">
          {count.toLocaleString(locale)}
        </strong>{" "}
        {t(`${dataType}`)} {t("dataCountMessage.found")}
      </span>
    </div>
  );
};

export default DataCountMessage;
