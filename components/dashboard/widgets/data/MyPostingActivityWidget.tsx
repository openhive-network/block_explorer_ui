import React, { useState } from "react";
import TimeAgo from "timeago-react";
import {
  ArrowUpRight,
  MessageSquare,
  PenLine,
  Repeat2,
  ThumbsUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountContentFeed, {
  ContentFeedKind,
} from "@/hooks/api/accountPage/useAccountContentFeed";
import { useI18n } from "@/i18n/i18n";
import { parseChainDate } from "@/utils/TimeUtils";
import { getHivePostUrl } from "@/utils/HiveBlogUtils";

const KINDS: ContentFeedKind[] = ["posts", "comments", "reblogs"];

const KIND_ICON: Record<ContentFeedKind, typeof PenLine> = {
  posts: PenLine,
  comments: MessageSquare,
  reblogs: Repeat2,
};

const payoutOf = (entry: {
  payout?: number;
  pending_payout_value?: string;
}): number => {
  if (typeof entry.payout === "number") return entry.payout;
  const parsed = parseFloat(entry.pending_payout_value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
};

const MyPostingActivityWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();
  const [kind, setKind] = useState<ContentFeedKind>("posts");

  const { entries, truncated, scannedEntries, isLoading, isError } =
    useAccountContentFeed(
      isLoggedIn && username ? username : undefined,
      kind,
      settings.liveData
    );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={PenLine}
        message={t("widgets.myPostingActivityLoggedOut")}
      />
    );
  }

  if (isError) return <WidgetUnavailable />;
  const Icon = KIND_ICON[kind];

  return (
    <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
      <CardHeaderWithLink
        className="flex-shrink-0"
        href={`/@${username}`}
        title={t("widgets.myPostingActivityName")}
      />

      <div className="flex-shrink-0 px-2 pt-2">
        <SegmentedToggle<ContentFeedKind>
          options={KINDS.map((value) => ({
            value,
            label: t(`widgets.myPostingActivity_${value}`),
          }))}
          value={kind}
          onChange={setKind}
          ariaLabel={t("widgets.myPostingActivityFilter")}
          className="w-fit"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && !entries ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : !entries?.length ? (
          <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{t(`widgets.myPostingActivityEmpty_${kind}`)}</p>
            {truncated && (
              <p className="mt-1 text-[11px]">
                {t("widgets.myPostingActivityReblogsScanned").replace(
                  "{count}",
                  String(scannedEntries)
                )}
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {entries.map((entry, index) => {
              const created = parseChainDate(entry.created);
              return (
                <li key={`${entry.author}-${entry.permlink}-${index}`}>
                  <a
                    href={getHivePostUrl(entry.author, entry.permlink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2.5 rounded px-1.5 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/40"
                  >
                    <Icon
                      size={13}
                      className="mt-1 shrink-0 text-gray-400 dark:text-gray-500"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-gray-900 dark:text-white">
                        {entry.title || entry.permlink}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                        {/* A reblog's payout belongs to its author, not you. */}
                        {kind === "reblogs" ? (
                          <span className="truncate">@{entry.author}</span>
                        ) : (
                          <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            ${payoutOf(entry).toFixed(2)}
                          </span>
                        )}
                        {entry.net_votes !== undefined && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={11} />
                            {entry.net_votes}
                          </span>
                        )}
                        {entry.children !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            {entry.children}
                          </span>
                        )}
                        {created && (
                          <TimeAgo locale={locale} datetime={created} />
                        )}
                      </span>
                    </span>

                    <ArrowUpRight
                      size={14}
                      className="mt-0.5 shrink-0 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-300"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Say the list stopped early rather than implying it is everything. */}
      {truncated && !!entries?.length && (
        <p className="flex-shrink-0 border-t px-2 py-1.5 text-center text-[11px] text-gray-400 dark:text-gray-500">
          {t("widgets.myPostingActivityReblogsScanned").replace(
            "{count}",
            String(scannedEntries)
          )}
        </p>
      )}
    </Card>
  );
};

export default MyPostingActivityWidget;
