import React from "react";
import Link from "next/link";
import { Zap, MoveRight, MoveLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useRcDelegations from "@/hooks/api/common/useRcDelegations";
import AccountOutgoingRcDelegationsCard from "@/components/account/AccountOutgoingRcDelegationsCard";
import AccountIncomingRcDelegationsCard from "@/components/account/AccountIncomingRcDelegationsCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyRcDelegationsWidget: React.FC = () => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();

  const accountName = isLoggedIn ? username || "" : "";

  const { outgoingRcDelegations, incomingRcDelegations } = useRcDelegations(
    accountName,
    settings.liveData
  );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Zap}
        message={t("widgets.myRcDelegationsLoggedOut")}
      />
    );
  }

  const outgoingLen = outgoingRcDelegations?.length ?? 0;
  const incomingLen = incomingRcDelegations?.length ?? 0;
  const isEmpty = outgoingLen === 0 && incomingLen === 0;

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2 h-full flex flex-col [&_td]:!text-[0.8rem] [&_th]:!text-[0.8rem] [&_td]:!px-2 [&_th]:!px-2 [&_td]:!tabular-nums [&_td]:!whitespace-nowrap [&_td]:!break-normal">
      <CardHeader className="flex justify-between items-center border-b px-3 py-2.5 flex-shrink-0">
        <CardTitle>{t("widgets.myRcDelegationsName")}</CardTitle>
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
            <Zap className="h-7 w-7 opacity-20" />
            <p className="text-xs">{t("widgets.myRcDelegationsEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AccountOutgoingRcDelegationsCard
              delegations={outgoingRcDelegations}
              isInitiallyOpen={true}
              accountName={username}
            />
            <AccountIncomingRcDelegationsCard
              delegations={incomingRcDelegations}
              isInitiallyOpen={true}
              accountName={username}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRcDelegationsWidget;
