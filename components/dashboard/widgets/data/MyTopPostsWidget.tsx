import React from "react";
import TimeAgo from "timeago-react";
import { ArrowUpRight, MessageSquare, PenSquare, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { config } from "@/Config";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountTopPosts from "@/hooks/api/accountPage/useAccountTopPosts";
import { useI18n } from "@/i18n/i18n";
import { parseChainDate } from "@/utils/TimeUtils";

// bridge reports payout as a number once paid, a string while pending.
const payoutOf = (post: {
  payout?: number;
  pending_payout_value?: string;
}): number => {
  if (typeof post.payout === "number") return post.payout;
  const parsed = parseFloat(post.pending_payout_value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
};

const MyTopPostsWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();

  const { topPosts, isLoading, isError } = useAccountTopPosts(
    isLoggedIn && username ? username : undefined,
    settings.liveData
  );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={PenSquare}
        message={t("widgets.myTopPostsLoggedOut")}
      />
    );
  }

  if (isError) return <WidgetUnavailable />;
  return (
    <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
      <CardHeaderWithLink
        className="flex-shrink-0"
        href={`/@${username}`}
        title={t("widgets.myTopPostsName")}
      />

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && !topPosts ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : !topPosts?.length ? (
          <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("widgets.myTopPostsEmpty")}
          </p>
        ) : (
          <ol className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {topPosts.map((post, index) => {
              const created = parseChainDate(post.created);
              return (
                <li key={`${post.permlink}-${index}`}>
                  <a
                    href={`${config.hiveFrontendUrl}/@${post.author}/${post.permlink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2.5 rounded px-1.5 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/40"
                  >
                    <span className="mt-0.5 w-4 shrink-0 text-end font-mono text-xs text-gray-400 dark:text-gray-500">
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {post.title || post.permlink}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                        <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          ${payoutOf(post).toFixed(2)}
                        </span>
                        {post.net_votes !== undefined && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={11} />
                            {post.net_votes}
                          </span>
                        )}
                        {post.children !== undefined && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            {post.children}
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
          </ol>
        )}
      </div>
    </Card>
  );
};

export default MyTopPostsWidget;
