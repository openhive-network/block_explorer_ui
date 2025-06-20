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
  const { t } = useI18n();
  if (!count) return null;

  const message = `${t("dataCountMessage.aTotalOf")} ${count.toLocaleString()} ${t(`${dataType}`)} ${t("dataCountMessage.found")}`;
  return <div className="text-gray-500">{message}</div>;
};

export default DataCountMessage;
