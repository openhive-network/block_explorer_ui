import React from "react";
import { PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import RcFootprintReport from "@/components/account/tabs/analytics/RcFootprintReport";

// Home-dashboard wrapper: the account RC Footprint report scoped to the
// logged-in user. Library-only (not seeded by default).
const MyRcFootprintWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={PieChart}
        message={t("widgets.myRcFootprintLoggedOut")}
      />
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-6 overflow-hidden mb-2">
      <CardHeaderWithLink
        href={`/@${username}?activeTab=analytics`}
        title={t("widgets.myRcFootprintName")}
      />
      <CardContent className="p-2">
        <RcFootprintReport
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

export default MyRcFootprintWidget;
