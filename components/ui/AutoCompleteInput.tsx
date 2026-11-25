import React, {
  useState,
  useEffect,
  useId,
  useRef,
  useCallback,
  useMemo,
  RefObject,
  MouseEvent,
  FocusEvent,
} from "react";
import {
  X,
  Search,
  SearchX,
  List,
  ArrowLeftRight,
  ArrowRightLeft,
  MessageSquare,
  Wallet,
  Box,
  Landmark,
  Layers,
} from "lucide-react";
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
import { deploySettings } from "@/utils/deploySettings";
import {
  SearchAction,
  SearchActionKey,
  accountActions,
  blockNumberActions,
} from "@/utils/searchActions";
import { useRecentlyViewed } from "@/hooks/common/useRecentlyViewed";
import {
  RecentEntry,
  recentEntryHref,
  recentEntryLabel,
} from "@/utils/recentlyViewed";
import SuggestionRow from "./SuggestionRow";
import HiveAvatar from "./HiveAvatar";

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

const ACTION_ICON: Record<SearchActionKey, React.ElementType> = {
  operations: List,
  transfers: ArrowRightLeft,
  comments: MessageSquare,
  balanceHistory: Wallet,
  blocksProduced: Box,
  proposals: Landmark,
  blocksUpTo: Layers,
  proposal: Landmark,
};

const recentIcon = ({ kind, id }: RecentEntry) =>
  kind === "account" ? (
    <HiveAvatar
      accountName={id}
      size={16}
      alt=""
      className="h-4 w-4 rounded-full"
    />
  ) : kind === "block" ? (
    <Box className="h-4 w-4" />
  ) : (
    <ArrowLeftRight className="h-4 w-4" />
  );

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
  cleanup = false,
}) => {
  const { t, locale } = useI18n();
  const router = useRouter();
  // Several of these can share a page (block search, dialogs), so the listbox
  // and option ids have to be instance-scoped.
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;
  const actionId = (i: number) => `${listboxId}-action-${i}`;
  const recentId = (i: number) => `${listboxId}-recent-${i}`;
  const [inputFocus, setInputFocus] = useState(false);
  // The highlighted result (or recent entry), and which of its ready-made
  // searches is highlighted, if any.
  const [selected, setSelected] = useState(0);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const { entries: recentEntries, clear: clearRecent } = useRecentlyViewed();

  const results = useMemo(() => {
    const v = inputTypeData?.input_value;
    if (!v) return [];
    return (Array.isArray(v) ? v : [v]).map(String);
  }, [inputTypeData?.input_value]);

  // Ready-made searches for the highlighted result (the navbar search only).
  const highlighted = results[selected];
  const actions: SearchAction[] = useMemo(() => {
    if (!linkResult || !highlighted) return [];
    const proposals = deploySettings.proposals;
    if (showsAccounts)
      return accountActions(highlighted, {
        isWitness: witnessNames.has(highlighted),
        proposals,
      });
    if (inputTypeData?.input_type === "block_num")
      return blockNumberActions(highlighted, { proposals });
    return [];
  }, [
    linkResult,
    highlighted,
    showsAccounts,
    witnessNames,
    inputTypeData?.input_type,
  ]);

  // Focusing the empty navbar box lists the latest lookups.
  const showRecent =
    linkResult &&
    inputFocus &&
    !value &&
    deploySettings.recentVisits &&
    recentEntries.length > 0;

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

  const go = useCallback(
    (href: string) => {
      router.push(href);
      setInputFocus(false);
      if (cleanup) setTimeout(() => onChange(""), 0);
    },
    [router, cleanup, onChange]
  );

  // The recent list opens on focus or once the box is emptied; it starts at
  // its top.
  const resetHighlight = () => {
    setSelected(0);
    setActionIndex(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFocus(true);
    // Any edit starts the list over: an index from the old list (or the
    // recent list) means nothing in the new one.
    resetHighlight();
    onChange(e.target.value);
    setSearchTerm(e.target.value);

    if (!isNumeric(e.target.value) && !isHash(e.target.value)) {
      debouncedSearch(e.target.value + encodeURI("%"));
    } else {
      debouncedSearch(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInputFocus(false);
      return;
    }

    if (isInputDisabled) return;

    // The navbar box acts only on a list it shows: once closed, Tab moves
    // on and Enter does nothing; ArrowDown opens it again.
    if (linkResult && !isOpen && !showRecent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setInputFocus(true);
      }
      return;
    }

    if (showRecent) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setSelected((p) =>
          Math.min(Math.max(p + step, 0), recentEntries.length - 1)
        );
      } else if (e.key === "Enter" && recentEntries[selected]) {
        e.preventDefault();
        go(recentEntryHref(recentEntries[selected]));
      }
      return;
    }

    if (!results.length) return;

    // The highlighted result's searches sit right under it: down walks
    // into them before the next result, up walks back out.
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = actionIndex === null ? 0 : actionIndex + 1;
      if (next < actions.length) setActionIndex(next);
      else if (selected < results.length - 1) {
        setSelected(selected + 1);
        setActionIndex(null);
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (actionIndex !== null)
        setActionIndex(actionIndex === 0 ? null : actionIndex - 1);
      else setSelected(Math.max(selected - 1, 0));
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (actionIndex !== null && actions[actionIndex])
        go(actions[actionIndex].href);
      else pick(results[selected] ?? results[0]);
      return;
    }
  };

  useOnClickOutside(wrapRef as RefObject<HTMLDivElement>, () =>
    setInputFocus(false)
  );

  // Clamped: the list can shrink under the highlight (another tab clearing
  // the recent list, a shorter result list).
  const activeId = showRecent
    ? recentId(Math.min(selected, recentEntries.length - 1))
    : actionIndex !== null
      ? actionId(actionIndex)
      : optionId(selected < results.length ? selected : 0);

  useEffect(() => {
    document
      .getElementById(activeId)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);

  useEffect(() => {
    setIsInputDisabled(inputTypeData?.input_type === "invalid_input");
  }, [inputTypeData?.input_type]);

  useEffect(() => {
    if (inputTypeData?.input_value) {
      setSelected(0);
      setActionIndex(null);
    }
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

    return (
      <div className="autocomplete-result-container overflow-hidden rounded-xl border border-explorer-light-gray bg-theme shadow-lg dark:border-explorer-dark-gray">
        {addLabel && (
          <div className="flex items-center justify-between gap-2 border-b border-explorer-light-gray px-3 py-1.5 dark:border-explorer-dark-gray">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t(GROUP_LABEL_KEY[resType])}
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {results.length}
            </span>
          </div>
        )}
        <div
          className="scrollbar-autocomplete max-h-[min(20rem,60vh)] space-y-0.5 overflow-y-auto p-1.5"
          ref={containerRef}
          id={listboxId}
          role="listbox"
        >
          {results.map((acc, i) => (
            <React.Fragment key={acc}>
              <AutocompleteResultRow
                id={optionId(i)}
                value={acc}
                resultType={resType}
                query={searchTerm}
                selected={selected === i && actionIndex === null}
                isWitness={witnessNames.has(acc)}
                linkResult={linkResult}
                onSelect={() => pick(acc)}
                onHover={() => {
                  setSelected(i);
                  setActionIndex(null);
                }}
              />
              {selected === i &&
                actions.map((action, j) => {
                  const Icon = ACTION_ICON[action.key];
                  return (
                    <SuggestionRow
                      key={action.key}
                      id={actionId(j)}
                      href={action.href}
                      nested
                      icon={<Icon className="h-3.5 w-3.5" />}
                      label={t(`autocompleteInput.action.${action.key}`, {
                        value:
                          action.key === "blocksUpTo"
                            ? Number(acc).toLocaleString(locale)
                            : acc,
                      })}
                      hint={
                        action.recent
                          ? t("autocompleteInput.last7Days")
                          : undefined
                      }
                      selected={actionIndex === j}
                      onSelect={() => go(action.href)}
                      onHover={() => setActionIndex(j)}
                    />
                  );
                })}
            </React.Fragment>
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
  const hasOptions =
    showRecent || (isOpen && inputTypeData?.input_type !== "invalid_input");

  const renderRecent = () => (
    <div className="autocomplete-result-container overflow-hidden rounded-xl border border-explorer-light-gray bg-theme shadow-lg dark:border-explorer-dark-gray">
      <div className="flex items-center justify-between gap-2 border-b border-explorer-light-gray px-3 py-1.5 dark:border-explorer-dark-gray">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("navbar.recent")}
        </span>
        <button
          type="button"
          onClick={clearRecent}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {t("navbar.clearRecent")}
        </button>
      </div>
      <div
        className="space-y-0.5 p-1.5"
        id={listboxId}
        role="listbox"
        aria-label={t("navbar.recent")}
      >
        {recentEntries.map((entry, i) => {
          const href = recentEntryHref(entry);
          return (
            <SuggestionRow
              key={`${entry.kind}-${entry.id}`}
              id={recentId(i)}
              href={href}
              icon={recentIcon(entry)}
              label={
                <span className="tabular-nums">
                  {recentEntryLabel(entry, locale)}
                </span>
              }
              selected={selected === i}
              onSelect={() => go(href)}
              onHover={() => setSelected(i)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className={cn("relative w-1/3", className)}>
      <div className="flex items-center pr-2 z-50">
        <Input
          ref={inputRef}
          className={cn("autocomplete_input", inputClassName)}
          type="text"
          placeholder={required ? `${placeholder} *` : placeholder}
          value={value ?? ""}
          onChange={handleInput}
          onClick={(e) => {
            // Clicking the box after Escape shows the list again.
            setInputFocus(true);
            if (!isInputDisabled) onClick?.(e);
          }}
          onBlur={onBlur}
          onFocus={() => {
            setInputFocus(true);
            if (!value) resetHighlight();
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen || showRecent}
          aria-autocomplete="list"
          aria-controls={hasOptions ? listboxId : undefined}
          aria-activedescendant={hasOptions ? activeId : undefined}
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

      {(isOpen || showRecent) && (
        <div className="absolute z-50 mt-1 w-max min-w-full max-w-[min(24rem,calc(100vw-2rem))]">
          {showRecent
            ? renderRecent()
            : renderOptions(inputTypeData as Hive.InputTypeResponse)}
        </div>
      )}
    </div>
  );
};

export default AutoCompleteInput;
