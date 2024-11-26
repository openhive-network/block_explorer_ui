import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, CornerDownLeft as Enter } from "lucide-react";
import { Input } from "./input";
import useDebounce from "@/hooks/common/useDebounce";
import useOnClickOutside from "@/hooks/common/useOnClickOutside";
import useInputType from "@/hooks/api/common/useInputType";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputType: string; // The input type (e.g., 'account_name', 'block', 'transaction')
  className?: string; // Optional custom className for styling
  linkResult?: boolean;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  inputType,
  className,
  linkResult = false,
  required = false, // Default value is false
}) => {
  const [inputFocus, setInputFocus] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const searchContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for input field
  const selectedResultRef = useRef<HTMLDivElement>(null); // Ref for selected result
  const [searchInputType, setSearchInputType] = useState<string>("");
  const { inputTypeData } = useInputType(searchInputType);

  // Debounce the search input to avoid making too many requests
  const debouncedSearch = useDebounce((value: string) => {
    setSearchInputType(value + encodeURI("%"));
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Close the search when clicking outside of the container
  useOnClickOutside(searchContainerRef, () => setInputFocus(false));

  const resetSearchBar = () => {
    setInputFocus(false);
    onChange("");
    setSearchInputType("");
    setSelectedResult(0);
  };

  const closeSearchBar = () => {
    setInputFocus(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputFocus && inputTypeData?.input_value?.length) {
      if (event.key === "ArrowDown") {
        setSelectedResult((prev) =>
          prev < inputTypeData.input_value.length - 1 ? prev + 1 : prev
        );
      }
      if (event.key === "ArrowUp") {
        setSelectedResult((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const selectedAccount = inputTypeData.input_value[selectedResult];
        onChange(selectedAccount); // Update the input field with the selected account
        closeSearchBar();
      }
    }
  };

  useEffect(() => {
    const keyDownEvent = (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        setInputFocus(true); // Reopen the suggestions on backspace
      }
    };

    document.addEventListener("keydown", keyDownEvent);
    return () => {
      document.removeEventListener("keydown", keyDownEvent);
    };
  }, []);

  // Ensure the selected result is visible in the scrollable container
  useEffect(() => {
    if (selectedResultRef.current) {
      selectedResultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedResult]);

  // Render search results based on input type
  const renderSearchData = (data: any, linkResult: boolean) => {
    const inputValue = data.input_value;

    // If input_value is an array, we iterate over the array of accounts
    if (Array.isArray(inputValue)) {
      return (
        <div className="flex flex-col bg-white shadow-lg rounded-lg mt-1">
          {inputValue.map((account, index) => (
            <div
              key={index}
              ref={selectedResult === index ? selectedResultRef : null}
              className={cn(
                "px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between rounded-md",
                {
                  "bg-gray-100": selectedResult === index,
                  "border-t border-gray-200": index > 0,
                }
              )}
              onClick={() => {
                onChange(account); // Update the input field with the selected account
                inputRef.current?.focus(); // Focus the input field after selection
                setInputFocus(true); // Reopen the suggestions on click
                setSearchInputType(account); // Update the search type for new suggestions
              }}
            >
              {linkResult ? (
                <Link href={`/@${account}`} className="w-full">
                  <span className="text-blue-600">{account}</span>
                </Link>
              ) : (
                <div className="w-full">
                  <span className="text-blue-600">{account}</span>
                </div>
              )}
              {selectedResult === index && (
                <Enter className="hidden md:inline" />
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div ref={searchContainerRef} className={cn("relative", className)}>
      <div className="flex items-center pr-2 z-50">
        <Input
          ref={inputRef} // Attach ref to input field
          className="border-0 w-full text-sm"
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder} // Add asterisk if required
          value={value} // Ensure the input field reflects the current value
          onChange={handleInputChange} // When the value in the input changes
          onFocus={() => setInputFocus(true)} // When the input is focused, show suggestions
          onKeyDown={handleKeyDown} // Handle keyboard events
        />
        {!!value.length ? (
          <X className="cursor-pointer" onClick={() => resetSearchBar()} />
        ) : linkResult ? (
          <Search />
        ) : null}
      </div>
      {inputFocus && value.length > 0 && !!inputTypeData?.input_value && (
        <div
          className="absolute 
                      bg-white dark:bg-gray-800 w-full max-h-60 overflow-y-auto border border-gray-200 rounded-lg shadow-lg z-50"
        >
          {renderSearchData(inputTypeData, linkResult)}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
