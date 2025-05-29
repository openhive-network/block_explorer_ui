import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, CornerDownLeft as Enter } from "lucide-react";
import { Input } from "./input";
import useDebounce from "@/hooks/common/useDebounce";
import useOnClickOutside from "@/hooks/common/useOnClickOutside";
import useInputType from "@/hooks/api/common/useInputType";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { trimAccountName, capitalizeFirst } from "@/utils/StringUtils";
import Hive from "@/types/Hive";
import { useRouter } from "next/router";

const isNumeric = (v: string) => /^\d+$/.test(v);
const isHash = (v: string) => /^[a-fA-F0-9]{40}$/.test(v);

const getResultTypeHeader = (r: Hive.InputTypeResponse) =>
  r.input_type === "block_num"
    ? "block"
    : r.input_type === "transaction_hash"
    ? "transaction"
    : r.input_type === "block_hash"
    ? "block"
    : "account";

interface Props {
  value: string | null;
  onChange: (v: string) => void;
  placeholder: string;
  inputType: string | string[];
  className?: string;
  linkResult?: boolean;
  required?: boolean;
  addLabel?: boolean;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const AutoCompleteInput: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  inputType,
  className,
  linkResult = false,
  required = false,
  addLabel = false,
  onClick,
  onBlur,
}) => {
  const router = useRouter();
  const [inputFocus, setInputFocus] = useState(false);
  const [selected, setSelected] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isChosen, setIsChosen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const { inputTypeData } = useInputType(query);
  const debouncedSearch = useDebounce(
    (v: string) => setQuery(trimAccountName(v)),
    600
  );

  const pick = useCallback(
    (account: string) => {
      setIsChosen(true);
      onChange(account);

      if (linkResult) {
        const base = ["account_name", "account_name_array"].includes(
          inputTypeData?.input_type as string
        )
          ? `/@${account}`
          : `/${getResultTypeHeader(
              inputTypeData as Hive.InputTypeResponse
            )}/${account}`;
        router.push(base);
      }
      setInputFocus(false);
    },
    [inputTypeData, linkResult, onChange, router]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFocus(true);
    onChange(e.target.value);
    setSearchTerm(e.target.value);
    if (!isNumeric(e.target.value) && !isHash(e.target.value)) {
      debouncedSearch(e.target.value + encodeURI("%"));
    } else {
      debouncedSearch(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputTypeData?.input_value) return;

    const arr = Array.isArray(inputTypeData.input_value)
      ? inputTypeData.input_value
      : [inputTypeData.input_value];

    if (e.key === "ArrowDown")
      setSelected((p) => Math.min(p + 1, arr.length - 1));
    if (e.key === "ArrowUp") setSelected((p) => Math.max(p - 1, 0));

    if (e.key === "Enter") pick(arr.length === 1 ? arr[0] : arr[selected]);
    if (e.key === "Tab") {
      e.preventDefault();
      pick(arr[selected]);
    }
  };

  useOnClickOutside(wrapRef, () => setInputFocus(false));

  useEffect(() => {
    resultRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const renderOptions = (d: Hive.InputTypeResponse) => {
    const resType = getResultTypeHeader(d);
    const arr = Array.isArray(d.input_value) ? d.input_value : [d.input_value];

    return (
      <div
        className="autocomplete-result-container scrollbar-autocomplete"
        ref={resultRef}
      >
        {arr.map((acc, i) => (
          <div
            key={acc}
            className={cn("autocomplete-result-item cursor-pointer", {
              "bg-navbar-listHover": selected === i,
            })}
            onClick={() => pick(acc)}
          >
            {linkResult ? (
              <>
                {addLabel && (
                  <span className="autocomplete-result-label">
                    {capitalizeFirst(resType)}:&nbsp;
                  </span>
                )}
                <Link
                  className="autocomplete-result-link"
                  href={
                    resType === "account" ? `/@${acc}` : `/${resType}/${acc}`
                  }
                  onClick={(e) => e.preventDefault()}
                >
                  {acc}
                </Link>
              </>
            ) : (
              <>
                {addLabel && (
                  <span className="autocomplete-result-label">
                    {capitalizeFirst(resType)}:&nbsp;
                  </span>
                )}
                {acc}
              </>
            )}
            {selected === i && <Enter className="hidden md:inline ml-1" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={wrapRef}
      className={cn("relative", className)}
    >
      <div className="flex items-center pr-2 z-50">
        <Input
          ref={inputRef}
          className={cn("autocomplete_input")}
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder}
          value={value ?? ""}
          onChange={handleInput}
          onClick={onClick}
          onBlur={onBlur}
          onFocus={() => setInputFocus(true)}
          onKeyDown={handleKeyDown}
        />
        {value ? (
          <X
            className="cursor-pointer"
            onClick={() => {
              onChange("");
              setInputFocus(false);
            }}
          />
        ) : linkResult ? (
          <Search />
        ) : null}
      </div>

      {inputFocus && value && value.length && inputTypeData?.input_value && (
        <div className="absolute bg-theme w-full max-h-60 border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {renderOptions(inputTypeData)}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
