import { useEffect, useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useI18n } from "../i18n/i18n";

interface JumpToPageProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  pageSize: number;
}

const JumpToPage = ({
  currentPage,
  onPageChange,
  totalCount,
  pageSize,
}: JumpToPageProps) => {
  const { t } = useI18n();
  const [value, setValue] = useState<number>(currentPage);
  const [inputValue, setInputValue] = useState<string>(String(currentPage));

  const totalPageCount = Math.ceil(totalCount / pageSize);

  const onInputChange = (e: { target: { value: string } }) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const inputValueNumber = Number(inputValue);

    if (inputValue === "") {
      // Handle the case where the input is empty (e.g., reset to current page)
      setValue(currentPage);
      setInputValue(String(currentPage));
    } else if (inputValueNumber >= 1 && inputValueNumber <= totalPageCount) {
      setValue(inputValueNumber);
    } else {
      // Reset the input value and state to the current page
      setValue(currentPage);
      setInputValue(String(currentPage));
    }
  };

  const handleJumpToPage = (e: any) => {
    e.preventDefault();
    onPageChange(value);
  };

  const handleOnKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleBlur();
      onPageChange(value);
    }
  };

  useEffect(() => {
    setValue(currentPage);
    setInputValue(String(currentPage));
  }, [currentPage]);

  if (totalPageCount <= 1) {
    return null;
  }

  return (
    <form
      className="me-2 flex items-center gap-1.5"
      onSubmit={handleJumpToPage}
    >
      <Input
        type="number"
        value={inputValue}
        min="1"
        max={totalPageCount}
        onChange={onInputChange}
        onBlur={handleBlur}
        onKeyDown={handleOnKeyDown}
        className="h-7 w-16 rounded border border-navbar-border bg-theme px-2 py-0 text-xs tabular-nums text-text focus:border-indigo-500 focus:ring-indigo-500 sm:h-8 sm:text-[13px]"
        data-testid="input-goto-page"
      />
      <Button
        className="h-7 rounded px-2.5 text-xs hover:bg-buttonHover sm:h-8 sm:text-[13px]"
        type="submit"
        data-testid="button-goto-page"
      >
        {t("common.go")}
      </Button>
    </form>
  );
};

export default JumpToPage;
