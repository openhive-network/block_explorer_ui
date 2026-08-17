import React, { useState } from "react";
import TimeAgo from "timeago-react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  PenSquare,
  Repeat,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import StatCard from "@/components/ui/StatCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import AccountFollowersDialog from "@/components/account/AccountFollowersDialog";
import AccountFollowingDialog from "@/components/account/AccountFollowingDialog";
import AccountSubscriptionsDialog from "@/components/account/AccountSubscriptionsDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import { useI18n } from "@/i18n/i18n";
import { parseDisplayOrChainDate } from "@/utils/TimeUtils";

const MyAccountSnapshotWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();
  const [openDialog, setOpenDialog] = useState<
    "followers" | "following" | "subscriptions" | null
  >(null);

  const { accountDetails, isAccountDetailsLoading, isAccountDetailsError } =
    useAccountDetails(
      isLoggedIn && username ? username : "",
      settings.liveData
    );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={UserCheck}
        message={t("widgets.myAccountSnapshotLoggedOut")}
      />
    );
  }

  if (isAccountDetailsError) return <WidgetUnavailable />;

  if (isAccountDetailsLoading && !accountDetails) {
    return (
      <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
        <CardHeaderWithLink
          className="flex-shrink-0"
          href={`/@${username}`}
          title={t("widgets.myAccountSnapshotName")}
        />
        <CardContent className="p-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[4.5rem] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const joined = parseDisplayOrChainDate(accountDetails?.created);
  const lastPost = parseDisplayOrChainDate(accountDetails?.last_post);

  const lastActive =
    lastPost && lastPost.getFullYear() > 1970 ? lastPost : null;

  const expiry = parseDisplayOrChainDate(
    accountDetails?.governance_vote_expiration_ts
  );
  const governance = (() => {
    if (!expiry) return null;
    const now = new Date();
    if (expiry < now)
      return {
        icon: <ShieldOff size={20} color="#ef4444" />,
        value: (
          <span className="text-sm text-red-500">
            {t("accountMainCard.governanceExpired")}
          </span>
        ),
      };
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    if (expiry < threeMonths)
      return {
        icon: <AlertTriangle size={20} color="#eab308" />,
        value: (
          <span className="text-sm text-yellow-500">
            {t("accountMainCard.governanceExpiring")}
          </span>
        ),
      };
    return {
      icon: <ShieldCheck size={20} color="#22c55e" />,
      value: (
        <span className="text-sm text-green-500">
          {t("accountMainCard.governanceActive")}
        </span>
      ),
    };
  })();

  const count = (value?: number) =>
    value === undefined ? "—" : Number(value).toLocaleString(locale);

  return (
    <>
      <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
        <CardHeaderWithLink
          className="flex-shrink-0"
          href={`/@${username}`}
          title={t("widgets.myAccountSnapshotName")}
        />
        <CardContent className="p-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
            <StatCard
              icon={<UserPlus size={20} />}
              label={t("accountMainCard.followers")}
              value={count(accountDetails?.follower_count)}
              onClick={() => setOpenDialog("followers")}
            />
            <StatCard
              icon={<UserCheck size={20} />}
              label={t("accountMainCard.following")}
              value={count(accountDetails?.following_count)}
              onClick={() => setOpenDialog("following")}
            />
            <StatCard
              icon={<Building2 size={20} />}
              label={t("accountMainCard.subscriptions")}
              value={count(accountDetails?.subscriptions?.length)}
              onClick={() => setOpenDialog("subscriptions")}
            />
            <StatCard
              icon={<PenSquare size={20} />}
              label={t("accountMainCard.totalPosts")}
              value={count(accountDetails?.post_count)}
              tooltipContent={<p>{t("accountMainCard.totalPostsTooltip")}</p>}
            />
            <StatCard
              icon={<Repeat size={20} />}
              label={t("accountMainCard.lastActive")}
              value={
                lastActive ? (
                  <TimeAgo
                    className="text-sm"
                    locale={locale}
                    datetime={lastActive}
                  />
                ) : (
                  <span className="text-sm">{t("accountMainCard.never")}</span>
                )
              }
              tooltipContent={<p>{t("accountMainCard.lastActiveTooltip")}</p>}
            />
            <StatCard
              icon={<CalendarDays size={20} />}
              label={t("accountMainCard.joined")}
              value={
                joined ? (
                  <TimeAgo
                    className="text-sm"
                    locale={locale}
                    datetime={joined}
                  />
                ) : (
                  "—"
                )
              }
            />
            {governance && (
              <StatCard
                icon={governance.icon}
                label={t("accountMainCard.governanceHealth")}
                value={governance.value}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* The account page's own dialogs, so a tile behaves the same in both. */}
      <AccountFollowersDialog
        accountName={username}
        isFollowersOpen={openDialog === "followers"}
        changeFollowersDialogue={(isOpen) =>
          setOpenDialog(isOpen ? "followers" : null)
        }
      />
      <AccountFollowingDialog
        accountName={username}
        isFollowingOpen={openDialog === "following"}
        changeFollowingDialogue={(isOpen) =>
          setOpenDialog(isOpen ? "following" : null)
        }
      />
      <AccountSubscriptionsDialog
        accountName={username}
        isSubscriptionsOpen={openDialog === "subscriptions"}
        changeSubscriptionsDialogue={(isOpen) =>
          setOpenDialog(isOpen ? "subscriptions" : null)
        }
        subscriptions={accountDetails?.subscriptions ?? null}
      />
    </>
  );
};

export default MyAccountSnapshotWidget;
