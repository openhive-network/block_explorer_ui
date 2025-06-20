import React from "react";
import { useI18n } from "@/i18n/i18n";
interface NoValueErrorMessage {
  accountName: string | boolean; //boolean=true if accountName isn't required (e.g. block search)
  isSearchButtonDisabled: boolean;
}

const NoValueErrorMessage: React.FC<NoValueErrorMessage> = ({
  accountName,
  isSearchButtonDisabled,
}) => {
  const { t } = useI18n();
  let message = "";

  if (!accountName && isSearchButtonDisabled) {
    message = t("noValueErrorMessage.insertRequiredValues");
  } else if (!accountName) {
    message = t("noValueErrorMessage.setAccountName");
  } else if (isSearchButtonDisabled) {
    message = t("noValueErrorMessage.valueFieldEmpty");
  } else {
    message = "";
  }

  if (!message) return;

  return (
    <label className="ml-2 text-gray-300 dark:text-gray-500 ">{message}</label>
  );
};

export default NoValueErrorMessage;
