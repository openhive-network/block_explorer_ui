import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import DialogSearchInput from "@/components/ui/DialogSearchInput";
import HiveAvatar from "@/components/ui/HiveAvatar";
import NoResult from "@/components/NoResult";
import DataExport from "@/components/DataExport";
import { useI18n } from "@/i18n/i18n";
import { spacesToUnderscores } from "@/utils/StringUtils";

type SubscriptionsDialogProps = {
  accountName: string;
  isSubscriptionsOpen: boolean;
  changeSubscriptionsDialogue: (isOpen: boolean) => void;
  subscriptions: string[] | null;
};

// Roles that earn a badge, in display order; plain subscribers get none.
const ROLE_LABEL_KEYS: Record<string, string> = {
  owner: "communityCard.roleOwner",
  admin: "communityCard.roleAdmin",
  mod: "communityCard.roleMod",
  member: "communityCard.roleMember",
};
const ROLE_ORDER = Object.keys(ROLE_LABEL_KEYS);

const AccountSubscriptionsDialog: React.FC<SubscriptionsDialogProps> = ({
  accountName,
  isSubscriptionsOpen,
  changeSubscriptionsDialogue,
  subscriptions,
}) => {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!isSubscriptionsOpen) setFilter("");
  }, [isSubscriptionsOpen]);

  // Each entry arrives as [id, name, role, title in that community].
  const communities = useMemo(() => {
    const rank = (role: string) => {
      const index = ROLE_ORDER.indexOf(role);
      return index < 0 ? ROLE_ORDER.length : index;
    };
    return (subscriptions ?? [])
      .map((entry) => {
        const [id, name, role, userTitle] = entry as unknown as string[];
        return { id, name: name || id, role, userTitle };
      })
      .sort(
        (a, b) => rank(a.role) - rank(b.role) || a.name.localeCompare(b.name)
      );
  }, [subscriptions]);

  const query = filter.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      query
        ? communities.filter(
            (community) =>
              community.name.toLowerCase().includes(query) ||
              community.id.includes(query)
          )
        : communities,
    [communities, query]
  );

  const exportData = useMemo(
    () =>
      filtered.map((community) => ({
        [t("accountSubscriptionsDialog.communityID")]: community.id,
        [t("accountSubscriptionsDialog.communityHeader")]: community.name,
      })),
    [filtered, t]
  );

  const title = t("accountSubscriptionsDialog.title");

  return (
    <Dialog
      open={isSubscriptionsOpen}
      onOpenChange={changeSubscriptionsDialogue}
    >
      <DialogContent
        className="min-w-[70vw] pr-0"
        data-testid="subscriptions-dialog"
      >
        <div className="max-h-[90vh] min-h-[60vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {title}
                {subscriptions && (
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-300">
                    {communities.length.toLocaleString(locale)}
                  </span>
                )}
              </span>
            }
            subtitle={`@${accountName}`}
            actions={
              filtered.length > 0 && (
                <DataExport
                  data={exportData}
                  filename={`${accountName}_${spacesToUnderscores(
                    title
                  ).toLowerCase()}.csv`}
                  skipColumnSelection
                >
                  <button type="button" className="report-export-btn">
                    <Download className="h-4 w-4" />
                    {t("common.export")}
                  </button>
                </DataExport>
              )
            }
          />

          {!subscriptions ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : communities.length === 0 ? (
            <NoResult />
          ) : (
            <>
              <div className="sticky top-0 z-20 -mt-1 flex flex-wrap items-center gap-3 bg-theme pb-3 pt-1">
                <DialogSearchInput
                  value={filter}
                  onChange={setFilter}
                  placeholder={t(
                    "accountSubscriptionsDialog.searchPlaceholder"
                  )}
                />
                {query && (
                  <strong
                    className="text-xs font-semibold tabular-nums text-text"
                    aria-live="polite"
                  >
                    {filtered.length.toLocaleString(locale)}
                  </strong>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-2 gap-y-0.5">
                  {filtered.map((community) => (
                    <Link
                      key={community.id}
                      href={`/@${community.id}`}
                      target="_blank"
                      className="flex min-w-0 items-center gap-3 rounded-md px-2 py-2 hover:bg-rowHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                    >
                      <HiveAvatar accountName={community.id} alt="" size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-link">
                            {community.name}
                          </span>
                          {ROLE_LABEL_KEYS[community.role] && (
                            <span className="shrink-0 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-indigo-600 dark:text-indigo-300">
                              {t(ROLE_LABEL_KEYS[community.role])}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                          <span dir="ltr">{community.id}</span>
                          {community.userTitle && (
                            <span className="ms-2">{community.userTitle}</span>
                          )}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <NoResult
                  descriptionKey={t(
                    "accountSubscriptionsDialog.noResultsFound"
                  )}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSubscriptionsDialog;
