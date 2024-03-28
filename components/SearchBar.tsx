import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, X, CornerDownLeft as Enter } from "lucide-react";
import { useDebounce, useMediaQuery, useOnClickOutside } from "@/utils/Hooks";
import { capitalizeFirst } from "@/utils/StringUtils";
import { Input } from "./ui/input";
import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import useInputType from "@/api/common/useInputType";
import { Button } from "./ui/button";

interface SearchBarProps {
  open: boolean;
  onChange?: (open: boolean) => void;
  className?: string;
}

const getResultTypeHeader = (result: Hive.InputTypeResponse) => {
  switch (result.input_type) {
    case "block_num":
      return "block";

    case "transaction_hash":
      return "transaction";

    default:
      return "account";
  }
};

const renderSearchData = (
  data: Hive.InputTypeResponse,
  onClick: Function,
  selected: number
) => {
  if (data.input_type === "account_name_array") {
    return (
      <div className="flex flex-col">
        {(data.input_value as string[]).map((account, index) => {
          return (
            <div
              key={index}
              className={cn("px-4 py-2 flex items-center justify-between", {
                "md:bg-explorer-ligh-gray bg-opacity-50": selected === index,
                "border-t border-gray-700": !!index,
              })}
            >
              <Link
                onClick={() => onClick()}
                href={`/@${account}`}
                className="w-full"
              >
                User <span className="text-explorer-turquoise">{account}</span>
              </Link>
              {selected === index && <Enter className="hidden md:inline" />}
            </div>
          );
        })}
      </div>
    );
  } else if (data.input_type === "invalid_input") {
    return <div className="px-4 py-2">Invalid search input: {data.input_value}</div>
  } else {
    const resultType = getResultTypeHeader(data);
    const href =
      resultType === "account"
        ? `/@${data.input_value}`
        : `/${resultType}/${data.input_value}`;
    return (
      <div className="px-4 py-2 flex items-center justify-between">
        <Link
          onClick={() => onClick()}
          className="w-full block"
          href={href}
          data-testid="navbar-search-content-link"
        >
          {capitalizeFirst(resultType)}{" "}
          <span className="text-explorer-turquoise">{data.input_value}</span>
        </Link>
        <Enter className="hidden md:inline" />
      </div>
    );
  }
};

const SearchBar: React.FC<SearchBarProps> = ({ open, onChange, className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const searchContainerRef = useRef(null);
  const [searchInputType, setSearchInputType] = useState<string>("");

  useOnClickOutside(searchContainerRef, () => setInputFocus(false));

  const isMobile = useMediaQuery("(max-width: 768px)");

  const router = useRouter();
  const { inputTypeData } = useInputType(searchInputType);

  const updateInput = async (value: string) => {
    setSearchInputType(value);
  };

  const debouncedSearch = useDebounce(
    (value: string) => updateInput(value),
    1000
  );

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const resetSearchBar = () => {
    setInputFocus(false);
    setSearchTerm("");
    updateInput("");
    setSelectedResult(0);
  };

  useEffect(() => {
    const keyDownEvent = (event: KeyboardEvent) => {
      if (inputFocus && inputTypeData?.input_value?.length) {
        if (event.code === "ArrowDown") {
          setSelectedResult((selectedResult) =>
            selectedResult < inputTypeData.input_value.length - 1
              ? selectedResult + 1
              : selectedResult
          );
        }
        if (event.code === "ArrowUp") {
          setSelectedResult((selectedResult) =>
            selectedResult > 0 ? selectedResult - 1 : selectedResult
          );
        }
        if (event.code === "Enter") {
          if (inputTypeData.input_type === "account_name_array") {
            router.push(`/@${inputTypeData.input_value[selectedResult]}`);
          } else {
            router.push(
              `/${getResultTypeHeader(inputTypeData)}/${
                inputTypeData.input_value
              }`
            );
          }
          resetSearchBar();
          setInputFocus(false);
        }
      }
    };

    document.addEventListener("keydown", keyDownEvent);
    return () => {
      document.removeEventListener("keydown", keyDownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputFocus, inputTypeData, selectedResult]);

  return (
    <>
      <div
        className={cn(
          "w-0 hidden md:w-1/3 relative bg-gray-700",
          {
            "w-full inline": open,
          },
          className
        )}
        ref={searchContainerRef}
      >
        <div className="border-input border flex items-center pr-2">
          <Input
            className="border-0"
            type="text"
            placeholder="Search user, block, transaction"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setInputFocus(true)}
            data-testid="search-bar-input"
          />
          {isMobile ? (
            <X
              className="cursor-pointer"
              onClick={() => {
                resetSearchBar();
                onChange && onChange(false);
              }}
            />
          ) : !!searchTerm.length ? (
            <X className="cursor-pointer" onClick={() => resetSearchBar()} />
          ) : (
            <Search />
          )}
        </div>
        {inputFocus && !!inputTypeData?.input_value && (
          <div className="absolute bg-explorer-dark-gray w-full max-h-96 overflow-y-auto border border-input border-t-0">
            {renderSearchData(inputTypeData, resetSearchBar, selectedResult)}
          </div>
        )}
      </div>
      {!open && (
        <Button className="px-0" onClick={() => onChange && onChange(true)}>
          <Search />
        </Button>
      )}
    </>
  );
};

export default SearchBar;
