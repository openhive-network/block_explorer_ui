import { useEffect, useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
      className="flex"
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
        className="w-0 min-w-[72px] p-1 pl-2 py-2 text-gray-900 border border-gray-300 rounded sm:text-xs bg-gray-50 focus:bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-theme dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:bg-gray-700"
        data-testid="input-goto-page"
      />
      <Button
        className="mx-2 hover:bg-buttonHover"
        type="submit"
        data-testid="button-goto-page"
      >
        Go
      </Button>
    </form>
  );
};

export default JumpToPage;
