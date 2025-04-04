import React from "react";

interface NoValueErrorMessage {
  accountName: string | boolean; //boolean=true if accountName isn't required (e.g. block search)
  isSearchButtonDisabled: boolean;
}

const NoValueErrorMessage: React.FC<NoValueErrorMessage> = ({
  accountName,
  isSearchButtonDisabled,
}) => {
  let message = "";

  if (!accountName && isSearchButtonDisabled) {
    message = "Please insert required values";
  } else if (!accountName) {
    message = "Set account name";
  } else if (isSearchButtonDisabled) {
    message = `Value field can't be empty`;
  } else {
    message = "";
  }

  if (!message) return;

  return (
    <label className="ml-2 text-gray-300 dark:text-gray-500 ">{message}</label>
  );
};

export default NoValueErrorMessage;
