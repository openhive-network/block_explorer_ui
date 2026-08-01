import React from "react";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import CommunityActivityReport from "@/components/account/tabs/analytics/CommunityActivityReport";

// Home-dashboard wrapper: the account Community Activity treemap scoped to the
// logged-in user. Library-only (not seeded by default).
const MyCommunityActivityWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={LayoutGrid}
        message={t("widgets.myCommunityActivityLoggedOut")}
      />
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-6 overflow-hidden mb-2">
      <CardHeaderWithLink
        href={`/@${username}?activeTab=analytics`}
        title={t("widgets.myCommunityActivityName")}
      />
      <CardContent className="p-2">
        <CommunityActivityReport
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

export default MyCommunityActivityWidget;
