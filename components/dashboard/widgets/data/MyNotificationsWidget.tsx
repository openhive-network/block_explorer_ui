import React, { useMemo, useState } from "react";
import Link from "next/link";
import TimeAgo from "timeago-react";
import {
  AtSign,
  Bell,
  MessageSquare,
  Repeat2,
  ThumbsUp,
  UserPlus,
  LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { config } from "@/Config";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountNotifications from "@/hooks/api/accountPage/useAccountNotifications";
import { useI18n } from "@/i18n/i18n";
import { parseChainDate } from "@/utils/TimeUtils";
import { isInAppPath, normalizeExternalUrl } from "@/utils/SafeUrl";
import { cn } from "@/lib/utils";
import HiveAvatar from "@/components/ui/HiveAvatar";

type Category =
  | "all"
  | "replies"
  | "mentions"
  | "follows"
  | "votes"
  | "reblogs";

const CATEGORIES: Record<Exclude<Category, "all">, string[]> = {
  replies: ["reply", "reply_comment"],
  mentions: ["mention"],
  follows: ["follow"],
  votes: ["vote"],
  reblogs: ["reblog"],
};

const TYPE_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  reply: { icon: MessageSquare, color: "text-violet-500" },
  reply_comment: { icon: MessageSquare, color: "text-violet-500" },
  mention: { icon: AtSign, color: "text-amber-500" },
  follow: { icon: UserPlus, color: "text-sky-500" },
  vote: { icon: ThumbsUp, color: "text-emerald-500" },
  reblog: { icon: Repeat2, color: "text-indigo-500" },
};

// The account that acted, from the message hivemind composed.
const actorOf = (msg: string) => msg.match(/@([a-z0-9.-]+)/)?.[1];

// hivemind returns a bare path: "@author/permlink" or "@account". Posts go to a
// front end. Gated like any user URL, so an odd payload degrades to a plain row.
const linkFor = (url: string): { href: string; external: boolean } | null => {
  if (url.includes("/")) {
    const href = normalizeExternalUrl(`${config.hiveFrontendUrl}/${url}`);
    return href ? { href, external: true } : null;
  }
  const href = `/${url}`;
  return isInAppPath(href) ? { href, external: false } : null;
};

const MyNotificationsWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();
  const [category, setCategory] = useState<Category>("all");

  const { notifications, isLoading, isError } = useAccountNotifications(
    isLoggedIn && username ? username : undefined,
    settings.liveData
  );

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (category === "all") return notifications;
    const types = CATEGORIES[category];
    return notifications.filter((n) => types.includes(n.type));
  }, [notifications, category]);

  // Only the types the feed actually holds, so a tab never leads nowhere.
  const tabs = useMemo(() => {
    const present = new Set((notifications ?? []).map((n) => n.type));
    const available: Category[] = ["all"];
    (Object.keys(CATEGORIES) as Exclude<Category, "all">[]).forEach((key) => {
      if (CATEGORIES[key].some((type) => present.has(type)))
        available.push(key);
    });
    return available;
  }, [notifications]);

  const options = tabs.map((value) => ({
    value,
    label: t(`widgets.myNotifications_${value}`),
  }));

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Bell}
        message={t("widgets.myNotificationsLoggedOut")}
      />
    );
  }

  if (isError) return <WidgetUnavailable />;
  return (
    <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
      <CardHeaderWithLink
        className="flex-shrink-0"
        href={`/@${username}`}
        title={t("widgets.myNotificationsName")}
      />

      {options.length > 1 && (
        <div className="flex-shrink-0 px-2 pt-2">
          <SegmentedToggle<Category>
            options={options}
            value={category}
            onChange={setCategory}
            ariaLabel={t("widgets.myNotificationsFilter")}
            className="w-fit flex-wrap"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && !notifications ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("widgets.myNotificationsEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filtered.map((notification) => {
              const actor = actorOf(notification.msg);
              const created = parseChainDate(notification.date);
              const link = linkFor(notification.url);
              const glyph = TYPE_ICON[notification.type];
              const Icon = glyph?.icon ?? Bell;
              const rowClasses =
                "flex items-start gap-2.5 rounded px-1.5 py-2 transition-colors";
              const row = (
                <>
                  {actor ? (
                    <HiveAvatar
                      accountName={actor}
                      size={28}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-7 w-7 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800" />
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug text-gray-800 dark:text-gray-100">
                      {notification.msg}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                      <Icon
                        size={12}
                        className={cn("shrink-0", glyph?.color)}
                      />
                      {created && (
                        <TimeAgo locale={locale} datetime={created} />
                      )}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={notification.id}>
                  {link ? (
                    <Link
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={cn(
                        rowClasses,
                        "hover:bg-gray-100 dark:hover:bg-gray-700/40"
                      )}
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className={rowClasses}>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default MyNotificationsWidget;
