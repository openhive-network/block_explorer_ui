import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import AutoCompleteInput from "@/components/ui/AutoCompleteInput";
import LetterSection from "@/components/ui/LetterSection";
import HiveAvatar from "@/components/ui/HiveAvatar";
import { useI18n } from "@/i18n/i18n";
import useCommunitySubscribers, {
  useCommunitySubscriberLookup,
} from "@/hooks/api/accountPage/useCommunitySubscribers";
import Hive from "@/types/Hive";
import ErrorMessage from "../ErrorMessage";
import NoResult from "../NoResult";

interface CommunitySubscribersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  communityTitle: string;
  totalCount?: number;
}

// Roles that earn a badge; plain subscribers ("guest") get none.
const ROLE_LABEL_KEYS: Record<string, string> = {
  owner: "communityCard.roleOwner",
  admin: "communityCard.roleAdmin",
  mod: "communityCard.roleMod",
  member: "communityCard.roleMember",
};

const CommunitySubscribersDialog: React.FC<CommunitySubscribersDialogProps> = ({
  isOpen,
  onClose,
  communityName,
  communityTitle,
  totalCount,
}) => {
  const { t, locale } = useI18n();
  const [input, setInput] = useState("");
  const [lookupName, setLookupName] = useState("");
  // Picking a suggestion submits the form in the same tick, before the state
  // above has updated, so the latest text is also kept in a ref.
  const latestInput = useRef("");
  // Kept in state, not refs: the dialog mounts its content after this component,
  // and the scroll observer must be attached once those nodes actually exist.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const {
    isSubscribed,
    lookupRole,
    lookupTitle,
    isLookupLoading,
    isLookupError,
  } = useCommunitySubscriberLookup(communityName, lookupName);
  // A confirmed subscriber becomes the starting point of the list.
  const anchor = lookupName && isSubscribed ? lookupName : undefined;

  const {
    subscribersData,
    isCommunitySubscribersLoading,
    isCommunitySubscribersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunitySubscribers(communityName, anchor);

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault();
    setLookupName(latestInput.current.trim().replace(/^@/, "").toLowerCase());
  };

  const handleInputChange = (value: string) => {
    latestInput.current = value;
    setInput(value);
    if (!value) setLookupName("");
  };

  // Re-created on every change so a sentinel still in view fires again.
  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isCommunitySubscribersError
        ) {
          fetchNextPage();
        }
      },
      { root: scrollEl, rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    sentinel,
    scrollEl,
    subscribersData.length,
    hasNextPage,
    isFetchingNextPage,
    isCommunitySubscribersError,
    fetchNextPage,
  ]);

  const groups = useMemo(() => {
    // The list starts after the anchor, so the anchor itself is put back first.
    const rows: Hive.CommunitySubscriber[] = anchor
      ? [
          {
            name: anchor,
            role: lookupRole,
            title: lookupTitle,
            created_at: "",
          },
          ...subscribersData,
        ]
      : subscribersData;
    const result: { letter: string; rows: Hive.CommunitySubscriber[] }[] = [];
    rows.forEach((row) => {
      if (!row?.name) return;
      const letter = row.name[0];
      const last = result[result.length - 1];
      if (last?.letter === letter) last.rows.push(row);
      else result.push({ letter, rows: [row] });
    });
    return result;
  }, [subscribersData, anchor, lookupRole, lookupTitle]);

  const lookupMessage = !lookupName
    ? null
    : isLookupLoading
      ? null
      : isLookupError
        ? { text: t("CommunitySubscribersDialog.error"), tone: "error" }
        : isSubscribed
          ? {
              text: t("CommunitySubscribersDialog.isSubscribed", {
                name: lookupName,
              }),
              tone: "found",
            }
          : {
              text: t("CommunitySubscribersDialog.notSubscribed", {
                name: lookupName,
              }),
              tone: "missing",
            };

  const renderList = () => {
    if (isCommunitySubscribersLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      );
    }
    // A later page failing keeps the rows already loaded.
    if (isCommunitySubscribersError && subscribersData.length === 0) {
      return <ErrorMessage message={t("CommunitySubscribersDialog.error")} />;
    }
    if (groups.length === 0) {
      return (
        <NoResult descriptionKey={t("CommunitySubscribersDialog.noResults")} />
      );
    }
    return (
      <>
        {groups.map((group) => (
          <LetterSection
            key={group.letter}
            letter={group.letter}
            gridClassName="grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
          >
            {group.rows.map((row) => (
              <Link
                key={row.name}
                href={`/@${row.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-rowHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <HiveAvatar accountName={row.name} alt="" size={28} />
                <span className="whitespace-nowrap text-sm text-link">
                  @{row.name}
                </span>
                {row.role && ROLE_LABEL_KEYS[row.role] && (
                  <span className="shrink-0 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-indigo-600 dark:text-indigo-300">
                    {t(ROLE_LABEL_KEYS[row.role])}
                  </span>
                )}
                {row.created_at && (
                  <span className="ms-auto shrink-0 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {moment
                      .utc(row.created_at)
                      .locale(locale)
                      .format("MMM YYYY")}
                  </span>
                )}
              </Link>
            ))}
          </LetterSection>
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {isCommunitySubscribersError && (
          <ErrorMessage message={t("CommunitySubscribersDialog.error")} />
        )}
        <div ref={setSentinel} className="h-px" />
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="min-w-[70vw] pe-0"
        data-testid="community-subscribers-dialog"
      >
        <div
          ref={setScrollEl}
          className="max-h-[90vh] min-h-[60vh] overflow-y-auto overflow-x-hidden pe-6 scrollableContainer"
        >
          <ReportDialogHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {t("CommunitySubscribersDialog.title")}
                {totalCount !== undefined && (
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-300">
                    {totalCount.toLocaleString(locale)}
                  </span>
                )}
              </span>
            }
            subtitle={communityTitle}
          />

          <form
            onSubmit={handleLookup}
            className="sticky top-0 z-20 -mt-1 flex flex-wrap items-center gap-3 bg-theme pb-3 pr-6 pt-1 sm:pr-0"
          >
            <div className="flex w-full items-center rounded-full border border-navbar-border bg-theme ps-3 focus-within:ring-2 focus-within:ring-indigo-400 sm:w-96">
              <AutoCompleteInput
                value={input}
                onChange={handleInputChange}
                placeholder={t("CommunitySubscribersDialog.findPlaceholder")}
                inputType="account_name"
                className="w-full"
                inputClassName="focus:!bg-transparent"
              />
            </div>
            {isLookupLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {lookupMessage && (
              <span
                aria-live="polite"
                className={
                  lookupMessage.tone === "found"
                    ? "text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    : lookupMessage.tone === "error"
                      ? "text-xs font-medium text-red-500"
                      : "text-xs text-gray-500 dark:text-gray-400"
                }
              >
                {lookupMessage.text}
              </span>
            )}
          </form>

          {renderList()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySubscribersDialog;
