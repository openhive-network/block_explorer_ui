import React from "react";
import Link from "next/link";
import { Repeat, MoveRight, MoveLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountRecurrentTransfers from "@/hooks/api/accountPage/useAccoutRecurrentTransfers";
import AccountRecurrentTransfersCard, {
  AllTransfers,
} from "@/components/account/AccountRecurrentTransfersCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyRecurringTransfersWidget: React.FC = () => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();

  const { recurrentTransfers, isRecurrentTransfersDataLoading } =
    useAccountRecurrentTransfers(
      isLoggedIn ? username || "" : "",
      settings.liveData
    );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Repeat}
        message={t("widgets.myRecurringTransfersLoggedOut")}
      />
    );
  }

  const outgoing =
    (recurrentTransfers?.outgoing_recurrent_transfers as AllTransfers[]) ?? [];
  const incoming =
    (recurrentTransfers?.incoming_recurrent_transfers as AllTransfers[]) ?? [];
  const isEmpty =
    !isRecurrentTransfersDataLoading &&
    outgoing.length === 0 &&
    incoming.length === 0;

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2 h-full flex flex-col">
      <CardHeader className="flex justify-between items-center border-b px-3 py-2.5 flex-shrink-0">
        <CardTitle>{t("widgets.myRecurringTransfersName")}</CardTitle>
        <Link
          href={`/@${username}`}
          className="text-sm flex items-center space-x-1"
        >
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-2 flex-1 min-h-0 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <Repeat className="h-7 w-7 opacity-20" />
            <p className="text-xs">{t("widgets.myRecurringTransfersEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AccountRecurrentTransfersCard
              direction="outgoing"
              transfers={outgoing}
              isInitiallyOpen={true}
              accountName={username}
            />
            <AccountRecurrentTransfersCard
              direction="incoming"
              transfers={incoming}
              isInitiallyOpen={true}
              accountName={username}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRecurringTransfersWidget;
