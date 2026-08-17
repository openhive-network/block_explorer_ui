import React, { useMemo } from "react";
import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

// bridge returns [id, title, role, ...]; the id is an account with its own page.
type Subscription = string[];

const MyCommunitiesWidget: React.FC = () => {
  const { t, dir } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();

  const { accountDetails, isAccountDetailsLoading, isAccountDetailsError } =
    useAccountDetails(
      isLoggedIn && username ? username : "",
      settings.liveData
    );

  const communities = useMemo(() => {
    const raw = (accountDetails?.subscriptions ??
      []) as unknown as Subscription[];
    return raw
      .filter((sub) => Array.isArray(sub) && sub[0])
      .map((sub) => ({ id: sub[0], title: sub[1] || sub[0] }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [accountDetails]);

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Building2}
        message={t("widgets.myCommunitiesLoggedOut")}
      />
    );
  }

  if (isAccountDetailsError) return <WidgetUnavailable />;

  return (
    <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
      <CardHeaderWithLink
        className="flex-shrink-0"
        href="/communities"
        title={
          <span className="flex items-center gap-2">
            <span className="truncate">{t("widgets.myCommunitiesName")}</span>
            {communities.length > 0 && (
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {communities.length}
              </span>
            )}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-1.5">
        {isAccountDetailsLoading && !accountDetails ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("widgets.myCommunitiesEmpty")}
          </p>
        ) : (
          <ul>
            {communities.map((community) => (
              <li key={community.id}>
                <Link
                  href={`/@${community.id}`}
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getHiveAvatarUrl(community.id)}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                      {community.title}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-gray-400 dark:text-gray-500">
                      {community.id}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
                    className={
                      dir === "rtl"
                        ? "shrink-0 rotate-180 text-gray-300 dark:text-gray-600"
                        : "shrink-0 text-gray-300 dark:text-gray-600"
                    }
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default MyCommunitiesWidget;
