import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import AutocompleteInput from "./ui/AutoCompleteInput";
import { Search } from "lucide-react";
import { X } from "lucide-react";
interface SearchBarProps {
  open: boolean;
  onChange?: (open: boolean) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ open, onChange, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAutocompleteVisible, setAutocompleteVisible] = useState(open);
  const searchContainerRef = useRef(null);

  const handleToggle = () => {
    setAutocompleteVisible(!isAutocompleteVisible);
    if (onChange) onChange(!isAutocompleteVisible);
  };

  return (
    <>
      {isAutocompleteVisible && (
        <AutocompleteInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search user, block, transaction"
          inputType={['block_num', 'transaction_hash', 'block_hash', 'account_name']}
          className={cn(
            "w-full md:w-1/4 bg-theme dark:bg-theme border-0 border-b-2 width rowHover",
            className
          )}
          linkResult={true}
          addLabel={true}
        />
      )}
      {!isAutocompleteVisible && (
        <Button
          onClick={handleToggle}
          className="md:hidden"
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
