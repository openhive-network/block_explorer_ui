import React from "react";
import Link from "next/link";
import { HandCoins, MoveRight, MoveLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";
import AccountVestingDelegationsCard from "@/components/account/AccountVestingDelegationsCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyHpDelegationsWidget: React.FC = () => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();
  const { dynamicGlobalData } = useDynamicGlobal();

  const accountName = isLoggedIn ? username || "" : "";

  const outgoing = useConvertedVestingShares(
    "outgoing",
    accountName,
    settings.liveData,
    dynamicGlobalData
  );
  const incoming = useConvertedVestingShares(
    "incoming",
    accountName,
    settings.liveData,
    dynamicGlobalData
  );

  if (!isLoggedIn || !username) {
    return (
      <Card className="col-span-12 lg:col-span-3">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <HandCoins className="h-8 w-8 opacity-20" />
          <p className="text-sm">{t("widgets.myHpDelegationsLoggedOut")}</p>
          <Link
            href="/login"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  const outgoingLen = outgoing?.length ?? 0;
  const incomingLen = incoming?.length ?? 0;
  const isEmpty = outgoingLen === 0 && incomingLen === 0;

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden h-full flex flex-col [&_td]:!text-[0.8rem] [&_th]:!text-[0.8rem] [&_td]:!px-2 [&_th]:!px-2 [&_td]:!tabular-nums [&_td]:!whitespace-nowrap [&_td]:!break-normal">
      <CardHeader className="flex justify-between items-center border-b px-3 py-2.5 flex-shrink-0">
        <CardTitle>{t("widgets.myHpDelegationsName")}</CardTitle>
        <Link
          href={`/@${username}`}
          className="text-sm flex items-center space-x-1"
        >
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <HandCoins className="h-7 w-7 opacity-20" />
            <p className="text-xs">{t("widgets.myHpDelegationsEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AccountVestingDelegationsCard
              id="my-hp-delegations-outgoing"
              direction="outgoing"
              delegations={outgoing}
              dynamicGlobalData={dynamicGlobalData}
              isInitiallyOpen={true}
              accountName={username}
            />
            <AccountVestingDelegationsCard
              id="my-hp-delegations-incoming"
              direction="incoming"
              delegations={incoming}
              dynamicGlobalData={dynamicGlobalData}
              isInitiallyOpen={true}
              accountName={username}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyHpDelegationsWidget;
