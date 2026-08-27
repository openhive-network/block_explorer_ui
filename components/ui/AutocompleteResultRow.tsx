import React, { forwardRef } from "react";
import Link from "next/link";
import { Box, Hash, CornerDownLeft as Enter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  resolveAccountLabel,
  resolveBadActorLabel,
} from "@/utils/accountLabels";
import AccountLabelBadge from "@/components/AccountLabelBadge";
import HiveAvatar from "@/components/ui/HiveAvatar";

export type AutocompleteResultType = "account" | "block" | "tx";

const highlightMatch = (text: string, query: string) => {
  const needle = query.trim().toLowerCase().replace(/^@/, "");
  if (!needle) return text;
  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <span className="autocomplete-result-highlight font-semibold">
        {text.slice(at, at + needle.length)}
      </span>
      {text.slice(at + needle.length)}
    </>
  );
};

interface Props {
  id: string;
  value: string;
  resultType: AutocompleteResultType;
  query: string;
  selected: boolean;
  isWitness?: boolean;
  linkResult?: boolean;
  onSelect: () => void;
  onHover: () => void;
}

const AutocompleteResultRow = forwardRef<HTMLDivElement, Props>(
  (
    {
      id,
      value,
      resultType,
      query,
      selected,
      isWitness = false,
      linkResult = false,
      onSelect,
      onHover,
    },
    ref
  ) => {
    const isAccount = resultType === "account";
    const badActorLabel = isAccount ? resolveBadActorLabel(value) : null;
    const accountLabel = isAccount
      ? resolveAccountLabel(value, { isWitness })
      : null;
    const name = highlightMatch(value, query);

    return (
      <div
        ref={ref}
        id={id}
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        onMouseEnter={onHover}
        className={cn(
          "autocomplete-result-item flex cursor-pointer items-center gap-2 rounded-lg border-s-2 px-2 py-1.5 transition-colors",
          selected
            ? "border-s-indigo-500 bg-navbar-listHover"
            : "border-s-transparent hover:bg-navbar-listHover/60"
        )}
      >
        {isAccount ? (
          // Plain img: the list re-renders per keystroke, so these 24px avatars
          // skip the Next optimizer.
          <HiveAvatar
            accountName={value}
            size={24}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full bg-slate-200 object-cover dark:bg-slate-700"
          />
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {resultType === "block" ? (
              <Box className="h-3.5 w-3.5" />
            ) : (
              <Hash className="h-3.5 w-3.5" />
            )}
          </span>
        )}

        <span className="min-w-0 flex-1 truncate text-sm">
          {linkResult ? (
            <Link
              className="autocomplete-result-link text-link hover:underline"
              href={isAccount ? `/@${value}` : `/${resultType}/${value}`}
              onClick={(e) => e.preventDefault()}
              data-testid="navbar-search-content-link"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </span>

        {(badActorLabel || accountLabel) && (
          <span className="flex shrink-0 items-center gap-1">
            <AccountLabelBadge label={badActorLabel} />
            <AccountLabelBadge label={accountLabel} />
          </span>
        )}

        {/* Always occupies space — showing it only when selected shifted the
            row's contents sideways on hover, which slid badges out from under
            the cursor and cancelled their tooltips. */}
        <Enter
          aria-hidden="true"
          className={cn(
            "hidden h-3.5 w-3.5 shrink-0 transition-opacity md:block",
            selected ? "opacity-60" : "opacity-0"
          )}
        />
      </div>
    );
  }
);

AutocompleteResultRow.displayName = "AutocompleteResultRow";

export default AutocompleteResultRow;
