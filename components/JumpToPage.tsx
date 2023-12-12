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
    <div className="flex end">
      <form
        className="flex"
        onSubmit={handleJumpToPage}
      >
        <Input
          type="number"
          value={value}
          onChange={onValueChange}
          className="block w-[100px] p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <Button
          className="bg-explorer-dark-gray mx-2 text-white hover:bg-gray-700"
          type="submit"
        >
          Go
        </Button>
      </form>
    </div>
  );
};

export default JumpToPage;
