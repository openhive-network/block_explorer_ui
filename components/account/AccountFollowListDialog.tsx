import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import HiveAvatar from "@/components/ui/HiveAvatar";
import LetterSection from "@/components/ui/LetterSection";
import DialogSearchInput from "@/components/ui/DialogSearchInput";
import NoResult from "@/components/NoResult";
import ErrorMessage from "@/components/ErrorMessage";
import { useI18n } from "@/i18n/i18n";
import useAccountFollowList, {
  FollowListType,
} from "@/hooks/api/accountPage/useAccountFollowList";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { downloadCsv } from "@/utils/csvDownload";

interface AccountFollowListDialogProps {
  type: FollowListType;
  accountName: string;
  totalCount?: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  searchPlaceholder: string;
  noMatchKey: string;
  exportHeader: string;
  testId: string;
}

const REVEAL_STEP = 200;

const AccountFollowListDialog: React.FC<AccountFollowListDialogProps> = ({
  type,
  accountName,
  totalCount,
  isOpen,
  onOpenChange,
  title,
  searchPlaceholder,
  noMatchKey,
  exportHeader,
  testId,
}) => {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("");
  const [revealCount, setRevealCount] = useState(REVEAL_STEP);
  const [isExporting, setIsExporting] = useState(false);
  // Kept in state, not refs: the dialog mounts its content after this component,
  // and the scroll observer must be attached once those nodes actually exist.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const {
    names,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAccountFollowList(type, accountName, { enabled: isOpen });

  useEffect(() => {
    if (isOpen) return;
    setFilter("");
    setRevealCount(REVEAL_STEP);
    setIsExporting(false);
  }, [isOpen]);

  const query = filter.trim().toLowerCase();
  const filtered = useMemo(
    () => (query ? names.filter((name) => name.includes(query)) : names),
    [names, query]
  );

  // Searching and exporting need the whole list; browsing loads it on scroll.
  const needsAll = !!query || isExporting;
  useEffect(() => {
    if (needsAll && hasNextPage && !isFetchingNextPage && !isError)
      fetchNextPage();
  }, [needsAll, hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  useEffect(() => {
    if (isExporting && isError) setIsExporting(false);
  }, [isExporting, isError]);

  const filename = `${accountName}_${spacesToUnderscores(
    title
  ).toLowerCase()}.csv`;

  useEffect(() => {
    if (!isExporting || hasNextPage) return;
    downloadCsv(
      filename,
      filtered.map((name) => ({ [exportHeader]: name })),
      [exportHeader]
    );
    setIsExporting(false);
  }, [isExporting, hasNextPage, filename, exportHeader, filtered]);

  // Re-created on every change so a sentinel still in view fires again.
  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (revealCount < filtered.length) {
          setRevealCount((count) => count + REVEAL_STEP);
        } else if (hasNextPage && !isFetchingNextPage && !isError) {
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
    revealCount,
    filtered.length,
    hasNextPage,
    isFetchingNextPage,
    isError,
    fetchNextPage,
  ]);

  const groups = useMemo(() => {
    const result: { letter: string; names: string[] }[] = [];
    filtered.slice(0, revealCount).forEach((name) => {
      const letter = name[0];
      const last = result[result.length - 1];
      if (last?.letter === letter) last.names.push(name);
      else result.push({ letter, names: [name] });
    });
    return result;
  }, [filtered, revealCount]);

  const total = hasNextPage ? (totalCount ?? names.length) : names.length;
  const isWorking = isFetchingNextPage || (needsAll && hasNextPage && !isError);

  const renderName = (name: string) => {
    const index = query ? name.indexOf(query) : -1;
    if (index < 0) return `@${name}`;
    return (
      <>
        @{name.slice(0, index)}
        <mark className="rounded-sm bg-indigo-500/20 text-inherit">
          {name.slice(index, index + query.length)}
        </mark>
        {name.slice(index + query.length)}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw] pe-0" data-testid={testId}>
        <div
          ref={setScrollEl}
          className="max-h-[90vh] min-h-[60vh] overflow-y-auto overflow-x-hidden pe-6 scrollableContainer"
        >
          <ReportDialogHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {title}
                {!isLoading && !isError && (
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-300">
                    {total.toLocaleString(locale)}
                  </span>
                )}
              </span>
            }
            subtitle={`@${accountName}`}
            actions={
              names.length > 0 && (
                <button
                  type="button"
                  className="report-export-btn"
                  disabled={isExporting}
                  onClick={() => setIsExporting(true)}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {t("common.export")}
                </button>
              )
            }
          />

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : isError && names.length === 0 ? (
            <ErrorMessage message={t("common.errorLoadingData")} />
          ) : names.length === 0 ? (
            <NoResult />
          ) : (
            <>
              <div className="sticky top-0 z-20 -mt-1 flex flex-wrap items-center gap-3 bg-theme pb-3 pr-6 pt-1 sm:pr-0">
                <DialogSearchInput
                  value={filter}
                  onChange={(value) => {
                    setFilter(value);
                    setRevealCount(REVEAL_STEP);
                  }}
                  placeholder={searchPlaceholder}
                />
                {(query || isWorking) && (
                  <span
                    className="flex items-center gap-2 text-xs tabular-nums text-gray-500 dark:text-gray-400"
                    aria-live="polite"
                  >
                    {isWorking && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {query && (
                      <strong className="font-semibold text-text">
                        {filtered.length.toLocaleString(locale)}
                      </strong>
                    )}
                    {hasNextPage && (
                      <span dir="ltr">
                        {names.length.toLocaleString(locale)} /{" "}
                        {total.toLocaleString(locale)}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {groups.map((group) => (
                <LetterSection key={group.letter} letter={group.letter}>
                  {group.names.map((name) => (
                    <Link
                      key={name}
                      href={`/@${name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-rowHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                    >
                      <HiveAvatar accountName={name} size={28} />
                      <span className="whitespace-nowrap text-sm text-link">
                        {renderName(name)}
                      </span>
                    </Link>
                  ))}
                </LetterSection>
              ))}

              {filtered.length === 0 && !hasNextPage && (
                <NoResult descriptionKey={noMatchKey} />
              )}

              {isError && (
                <ErrorMessage
                  message={t("common.errorLoadingData")}
                  onRetry={() => fetchNextPage()}
                />
              )}

              <div ref={setSentinel} className="h-px" />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountFollowListDialog;
