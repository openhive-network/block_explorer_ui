import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import AutocompleteInput from "./ui/AutoCompleteInput";
import { Search } from "lucide-react";
import { X } from "lucide-react";
import useMediaQuery from "@/hooks/common/useMediaQuery";
interface SearchBarProps {
  open: boolean;
  onChange?: (open: boolean) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ open, onChange, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAutocompleteVisible, setAutocompleteVisible] = useState(open);
  const [isClicked, setIsClicked] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");


  const handleToggle = () => {
    setAutocompleteVisible(!isAutocompleteVisible);
    if (onChange) onChange(!isAutocompleteVisible);
  };

  const handleClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    setIsClicked(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {   
    setIsClicked(false);
  };
  return (
    <>
      {isAutocompleteVisible && (
        <AutocompleteInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="User, Block, Trx #"
          inputType={['block_num', 'transaction_hash', 'block_hash', 'account_name']}
          className={cn(
            "bg-theme dark:bg-theme border-b transition-width duration-300 ease-in-out",
            (isClicked&& !isMobile) ? "w-3/5" : "w-[full]",
            className
          )}
          onClick={handleClick}
          onBlur={handleBlur}
          linkResult={true}
          addLabel={true}
        />
      )}
      {!isAutocompleteVisible && (
        <Button
          onClick={handleToggle}
          className="md:hidden px-2 py-1 h-[36px]"
        >
          <Search />
        </Button>
      )}
      {isAutocompleteVisible && (
         <X
          onClick={handleToggle}
          className="md:hidden"
        />
      )}
    </>
  );
};

export default SearchBar;
