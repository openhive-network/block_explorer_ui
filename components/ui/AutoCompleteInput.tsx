import {
  useState,
  useEffect,
  useId,
  useRef,
  useCallback,
  RefObject,
  MouseEvent,
  FocusEvent,
} from "react";
import { X, Search, SearchX } from "lucide-react";
import { Input } from "./input";
import useDebounce from "@/hooks/common/useDebounce";
import useOnClickOutside from "@/hooks/common/useOnClickOutside";
import useInputType from "@/hooks/api/common/useInputType";
import useActiveWitnessNames from "@/hooks/api/common/useActiveWitnessNames";
import { cn } from "@/lib/utils";
import AutocompleteResultRow from "./AutocompleteResultRow";
import { trimAccountName } from "@/utils/StringUtils";
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

const GROUP_LABEL_KEY = {
  account: "autocompleteInput.accounts",
  block: "autocompleteInput.blocks",
  tx: "autocompleteInput.transactions",
} as const;

interface Props {
  value: string | null;
  onChange: (v: string) => void;
  placeholder: string;
  inputType: string | string[];
  className?: string;
  inputClassName?: string;
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
  inputClassName,
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
  // Several of these can share a page (block search, dialogs), so the listbox
  // and option ids have to be instance-scoped.
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;
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

  // Only pull the witness list while account suggestions are actually on
  // screen — otherwise every page mounting the navbar would fetch it.
  const showsAccounts =
    inputFocus &&
    ["account_name", "account_name_array"].includes(
      inputTypeData?.input_type as string
    );
  const { witnessNames } = useActiveWitnessNames(showsAccounts);

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
        <div className="autocomplete-result-container flex items-center gap-2 rounded-xl border border-explorer-light-gray bg-theme px-3 py-2.5 text-sm shadow-lg dark:border-explorer-dark-gray">
          <SearchX className="h-4 w-4 shrink-0 text-rose-500" />
          <span className="min-w-0 truncate">
            {t("autocompleteInput.invalidInput")}: {searchTerm}
          </span>
        </div>
      );
    }

    const resType = getResultTypeHeader(d);
    const arr = Array.isArray(d.input_value) ? d.input_value : [d.input_value];

    itemRefs.current = arr.map((_, i) => itemRefs.current[i] || null);

    return (
      <div className="autocomplete-result-container overflow-hidden rounded-xl border border-explorer-light-gray bg-theme shadow-lg dark:border-explorer-dark-gray">
        {addLabel && (
          <div className="flex items-center justify-between gap-2 border-b border-explorer-light-gray px-3 py-1.5 dark:border-explorer-dark-gray">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t(GROUP_LABEL_KEY[resType])}
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {arr.length}
            </span>
          </div>
        )}
        <div
          className="scrollbar-autocomplete max-h-[min(20rem,60vh)] space-y-0.5 overflow-y-auto p-1.5"
          ref={containerRef}
          id={listboxId}
          role="listbox"
        >
          {arr.map((acc, i) => (
            <AutocompleteResultRow
              key={acc}
              id={optionId(i)}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              value={acc}
              resultType={resType}
              query={searchTerm}
              selected={selected === i}
              isWitness={witnessNames.has(acc)}
              linkResult={linkResult}
              onSelect={() => pick(acc)}
              onHover={() => setSelected(i)}
            />
          ))}
        </div>
      </div>
    );
  };

  const isOpen = !!(
    inputFocus &&
    value &&
    value.length &&
    inputTypeData?.input_value
  );
  // The invalid-input branch renders no listbox, so nothing to point at.
  const hasOptions = isOpen && inputTypeData?.input_type !== "invalid_input";

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
          className={cn("autocomplete_input", inputClassName)}
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder}
          value={value ?? ""}
          onChange={handleInput}
          onClick={!isInputDisabled ? onClick : undefined}
          onBlur={onBlur}
          onFocus={() => setInputFocus(true)}
          onKeyDown={!isInputDisabled ? handleKeyDown : undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={hasOptions ? listboxId : undefined}
          aria-activedescendant={hasOptions ? optionId(selected) : undefined}
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

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[15rem]">
          {renderOptions(inputTypeData)}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
