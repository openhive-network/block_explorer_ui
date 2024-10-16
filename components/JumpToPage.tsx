import { useEffect, useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

const JumpToPage = ({ currentPage, onPageChange }: any) => {
  const [value, setValue] = useState<number>(0);

  const onValueChange = (e: { target: { value: string } }) => {
    const { value } = e.target;

    const valueToNumber = Number(value);
    setValue(valueToNumber);
  };

  const handleJumpToPage = (e: any) => {
    e.preventDefault();
    onPageChange(value);
  };

  useEffect(() => {
    setValue(currentPage);
  }, [currentPage]);

  return (
    <form
      className="flex"
      onSubmit={handleJumpToPage}
    >
      <Input
        type="number"
        value={value}
        onChange={onValueChange}
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
