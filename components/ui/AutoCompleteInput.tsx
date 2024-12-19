import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, CornerDownLeft as Enter } from "lucide-react";
import { Input } from "./input";
import useDebounce from "@/hooks/common/useDebounce";
import useOnClickOutside from "@/hooks/common/useOnClickOutside";
import useInputType from "@/hooks/api/common/useInputType";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { trimAccountName } from "@/utils/StringUtils";
import Hive from "@/types/Hive";
import { capitalizeFirst } from "@/utils/StringUtils";
import Router, { useRouter } from "next/router";
interface AutocompleteInputProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  inputType: string | string[]; // The input type (e.g., 'account_name', 'block', 'transaction')
  className?: string; // Optional custom className for styling
  linkResult?: boolean;
  required?: boolean;
  addLabel?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  inputType,
  className,
  linkResult = false,
  required = false, // Default value is false
  addLabel = false,
}) => {
  const [inputFocus, setInputFocus] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const searchContainerRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null); 
  const selectedResultRef = useRef<HTMLDivElement>(null); 
  const [searchInputType, setSearchInputType] = useState<string>("");
  const { inputTypeData } = useInputType(searchInputType);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [isItemSelected, setIsItemSelected] = useState(false);

  
  const updateInput = async (value: string) => {
    
    setSearchInputType(value);
  };

  const debouncedSearch = useDebounce(
    (value: string) => updateInput(trimAccountName(value)),
    600
  );

  const isNumeric = (value: string): boolean => {
    return /^\d+$/.test(value);
  };
  
  const isHash = (value: string): boolean => {
    return /^[a-fA-F0-9]{40}$/.test(value); 
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSearchTerm(e.target.value);
   if(!isNumeric(e.target.value) && !isHash(e.target.value))
   {
    debouncedSearch(e.target.value + encodeURI("%"));
   }else
   {
    debouncedSearch(e.target.value);
  }
  };

  // Close the search when clicking outside of the container
  useOnClickOutside(searchContainerRef, () => closeSearchBar());

  //Reset Search Bar
  const resetSearchBar = () => {
    setInputFocus(false);
    onChange(""); // Clear the input field
    setSearchInputType("");
    setSelectedResult(0);
    setIsItemSelected(false);
  };

  const closeSearchBar = () => {
    setInputFocus(false);
  };

  //Ensure cleaning the searchbar when navigating away
  useEffect(() => {
    const handleRouteChange = () => {
      resetSearchBar();
    };
    router.events.on("routeChangeStart", handleRouteChange);
    // Cleanup the event listener on unmount
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events, resetSearchBar]);

  
  //Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputFocus && inputTypeData?.input_value) {
      let selectedAccount;

      if (Array.isArray(inputTypeData.input_value)) {
        selectedAccount = inputTypeData.input_value[selectedResult];
      } else {
        selectedAccount = inputTypeData.input_value;
      }

      if (event.key === "ArrowDown") {
        setSelectedResult((prev) =>
          prev < inputTypeData.input_value.length - 1 ? prev + 1 : prev
        );
      }
      if (event.key === "ArrowUp") {
        setSelectedResult((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (event.key === "Enter") {        
        if (isItemSelected && linkResult) {
          const href =
            inputTypeData.input_type === "account_name" || inputTypeData.input_type === "account_name_array"
              ? `/@${selectedAccount}`
              : `/${getResultTypeHeader(inputTypeData)}/${selectedAccount}`;
          router.push(href).then(() => {
            closeSearchBar();
            resetSearchBar();
          });
        } else if (!linkResult) {
          onChange(selectedAccount);
          closeSearchBar();
        }
      }
      if (event.key === "Tab") {
        event.preventDefault();
        onChange(selectedAccount);
        setIsItemSelected(true);
        setInputFocus(true);
        inputRef.current?.focus();
        linkResult ? "" : closeSearchBar();
      }
      if (event.key === "Backspace") {
        setInputFocus(true); // Reopen the suggestions on backspace
      }
    }
  };
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
  const getResultTypeHeader = (result: Hive.InputTypeResponse) => {
    switch (result.input_type) {
      case "block_num":
        return "block";
      case "transaction_hash":
        return "transaction";
      case "block_hash":
        return "block";
      default:
        return "account";
    }
  };

  // Render search results based on input type
  const renderSearchData = (
    data: Hive.InputTypeResponse,
    linkResult: boolean
  ) => {
    const inputValue = data.input_value;
    const inputTypeArray = Array.isArray(inputType) ? inputType : [inputType];
    const resultType = getResultTypeHeader(data);
    if (data.input_type === "invalid_input") {
      return (
        <div className="px-4 py-2">Account not found: {searchTerm}</div>
      );
    } else if (
      inputTypeArray.includes(data.input_type) ||
      (inputTypeArray.includes("account_name") &&
        data.input_type === "account_name_array")
    ) {
      if (
        data.input_type === "account_name_array" &&
        Array.isArray(inputValue)
      ) {
        return (
          <div className="autocomplete-result-container scrollbar-autocomplete">
            {inputValue.map((account, index) => (
              <div
                key={index}
                ref={selectedResult === index ? selectedResultRef : null}
                className={cn(
                  "autocomplete-result-item hover:bg-explorer-light-gray",
                  {
                    "bg-explorer-light-gray": selectedResult === index,
                    "autocomplete-result-item": index > 0,
                  }
                )}
                onClick={() => {
                  onChange(account);
                  inputRef.current?.focus();
                  setInputFocus(true);
                  setSearchInputType(account);
                }}
              >
                {linkResult ? (
                  <>
                    {addLabel && (
                      <span className="autocomplete-result-label">
                        {capitalizeFirst(resultType)}:&nbsp;
                      </span>
                    )}
                    <Link
                      href={`/@${account}`}
                      className="autocomplete-result-link"
                    >
                      <span className="autocomplete-result-link">
                        {account}
                      </span>
                    </Link>
                  </>
                ) : (
                  <span className="autocomplete-result-link">
                    {addLabel && (
                      <span>{capitalizeFirst(resultType)}::&nbsp;</span>
                    )}
                    {account}
                  </span>
                )}
                {selectedResult === index && (
                  <Enter className="hidden md:inline" />
                )}
              </div>
            ))}
          </div>
        );
      } else {
        const href =
          resultType === "account"
            ? `/@${data.input_value}`
            : `/${resultType}/${data.input_value}`;
        return (
          <div className="autocomplete-result-container scrollbar-autocomplete">
            <div className="autocomplete-result-item">
              {linkResult ? (
                <>
                  {addLabel && (
                    <span className="autocomplete-result-label">
                      {capitalizeFirst(resultType)}&nbsp;
                    </span>
                  )}
                  <Link href={href} data-testid="">
                    <span className="autocomplete-result-link">
                      {data.input_value}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  {addLabel && (
                    <span className="autocomplete-result-label">
                      {capitalizeFirst(resultType)}&nbsp;
                    </span>
                  )}
                  <span className="autocomplete-result-highlight">
                    {data.input_value}
                  </span>
                </>
              )}
              <Enter className="hidden md:inline text-explorer-dark-gray" />
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div ref={searchContainerRef} className={cn("relative", className)}>
      <div className="flex items-center pr-2 z-50">
        <Input
          ref={inputRef}
          className="border-0 w-full text-sm"
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder} // Add asterisk if required
          value={value || ""}
          onChange={handleInputChange}
          onFocus={() => setInputFocus(true)}
          onKeyDown={handleKeyDown}
        />
        {value && !!value.length ? (
          <X className="cursor-pointer" onClick={() => resetSearchBar()} />
        ) : linkResult ? (
          <Search />
        ) : null}
      </div>
      {inputFocus &&
        value &&
        value.length > 0 &&
        !!inputTypeData?.input_value && (
          <div className="absolute bg-theme dark:bg-theme  w-full max-h-60 border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {renderSearchData(inputTypeData, linkResult)}
          </div>
        )}
    </div>
  );
};

export default AutocompleteInput;
