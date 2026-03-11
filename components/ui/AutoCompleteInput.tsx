import {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefObject,
  MouseEvent,
  FocusEvent,
} from "react";
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
import { useI18n } from "@/i18n/i18n";

const isNumeric = (v: string) => /^\d+$/.test(v);
const isHash = (v: string) => /^[a-fA-F0-9]{40}$/.test(v);

const getResultTypeHeader = (r: Hive.InputTypeResponse) =>
  r.input_type === "block_num"
    ? "block"
    : r.input_type === "transaction_hash"
    ? "tx"
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
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  expand?: boolean;
  cleanup?: boolean;
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
  expand = false,
  cleanup = false,
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const [inputFocus, setInputFocus] = useState(false);
  const [selected, setSelected] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [query, setQuery] = useState("");
  const { inputTypeData } = useInputType(query);

  const debouncedSearch = useDebounce(
    (v: string) => setQuery(trimAccountName(v)),
    600
  );

  const submitClosestForm = useCallback(() => {
    const form =
      inputRef.current?.form ??
      (inputRef.current?.closest("form") as HTMLFormElement | null);
    if (!form) return;

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  }, []);

  const pick = useCallback(
    (account: string) => {
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
      submitClosestForm();
      if (cleanup) {
        setTimeout(() => onChange(""), 0);
      }
    },
    [inputTypeData, linkResult, cleanup, onChange, router, submitClosestForm]
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

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((p) => Math.min(p + 1, arr.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((p) => Math.max(p - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      pick(arr.length === 1 ? arr[0] : arr[selected]);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      pick(arr.length === 1 ? arr[0] : arr[selected]);
      return;
    }
  };

  useOnClickOutside(wrapRef as RefObject<HTMLDivElement>, () =>
    setInputFocus(false)
  );

  useEffect(() => {
    const el = itemRefs.current[selected];
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected]);

  useEffect(() => {
    setIsInputDisabled(inputTypeData?.input_type === "invalid_input");
  }, [inputTypeData?.input_type]);

  useEffect(() => {
    if (inputTypeData?.input_value) setSelected(0);
  }, [inputTypeData?.input_value]);

  const renderOptions = (d: Hive.InputTypeResponse) => {
    if (d.input_type === "invalid_input") {
      return (
        <div className="p-2">
          {t("autocompleteInput.invalidInput")}: {searchTerm}
        </div>
      );
    }

    const resType = getResultTypeHeader(d);
    const arr = Array.isArray(d.input_value) ? d.input_value : [d.input_value];

    itemRefs.current = arr.map((_, i) => itemRefs.current[i] || null);

    return (
      <div
        className="autocomplete-result-container !h-[200px] !overflow-auto !border border-explorer-light-gray dark:border-explorer-dark-gray !bg-theme scrollbar-autocomplete"
        ref={containerRef}
        role="listbox"
        aria-activedescendant={String(selected)}
      >
        {arr.map((acc, i) => (
          <div
            key={acc}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={cn("autocomplete-result-item cursor-pointer", {
              "bg-navbar-listHover": selected === i,
            })}
            role="option"
            aria-selected={selected === i}
            onClick={() => pick(acc)}
            onMouseEnter={() => setSelected(i)}
          >
            {linkResult ? (
              <>
                {addLabel && (
                  <span className="autocomplete-result-label">
                    {capitalizeFirst(t(`autocompleteInput.${resType}`))}:&nbsp;
                  </span>
                )}
                <Link
                  className="autocomplete-result-link"
                  href={
                    resType === "account" ? `/@${acc}` : `/${resType}/${acc}`
                  }
                  onClick={(e) => e.preventDefault()}
                  data-testid="navbar-search-content-link"
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
      className={cn(
        "relative",
        { "w-1/2": expand && inputFocus, "w-1/3": !expand },
        className
      )}
    >
      <div className="flex items-center pr-2 z-50">
        <Input
          ref={inputRef}
          className={cn("autocomplete_input")}
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder}
          value={value ?? ""}
          onChange={handleInput}
          onClick={!isInputDisabled ? onClick : undefined}
          onBlur={onBlur}
          onFocus={() => setInputFocus(true)}
          onKeyDown={!isInputDisabled ? handleKeyDown : undefined}
          aria-expanded={
            !!(
              inputFocus &&
              value &&
              value.length &&
              inputTypeData?.input_value
            )
          }
          aria-autocomplete="list"
          aria-controls="autocomplete-listbox"
          data-testid="search-bar-input"
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
        <div
          id="autocomplete-listbox"
          className="absolute bg-theme w-full rounded-lg shadow-lg z-50"
        >
          {renderOptions(inputTypeData)}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
