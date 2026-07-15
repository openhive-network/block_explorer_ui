import React from "react";
import { Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import RcConsumptionReport from "@/components/account/tabs/analytics/rcConsumption/RcConsumptionReport";

// Home-dashboard wrapper: the account RC Consumption report scoped to the
// logged-in user. Library-only (not seeded by default).
const MyRcConsumptionWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Gauge}
        message={t("widgets.myRcConsumptionLoggedOut")}
      />
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-6 overflow-hidden mb-2">
      <CardHeaderWithLink
        href={`/@${username}?activeTab=analytics`}
        title={t("widgets.myRcConsumptionName")}
      />
      <CardContent className="p-2">
        <RcConsumptionReport
          accountName={username}
          data={{}}
          liveDataEnabled={false}
          dynamicGlobalData={undefined}
          fillHeight={false}
        />
      </CardContent>
    </Card>
  );
};

export default MyRcConsumptionWidget;
