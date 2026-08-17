import React, { useState } from "react";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StandardHome from "@/components/home/StandardHome";
import WidgetIndex from "@/components/home/WidgetIndex";
import { GuestViewProvider } from "@/components/home/guest/GuestViewTabs";
import GuestBoardHeader from "@/components/home/guest/GuestBoardHeader";
import { useI18n } from "@/i18n/i18n";
import GuestEssentialsHome from "@/components/home/guest/GuestEssentialsHome";
import GuestNetworkHome from "@/components/home/guest/GuestNetworkHome";
import GuestMarketHome from "@/components/home/guest/GuestMarketHome";
import GuestGovernanceHome from "@/components/home/guest/GuestGovernanceHome";
import {
  DEFAULT_GUEST_VIEW,
  GUEST_VIEW_META,
  GuestView,
  guestViewFromCookies,
  writeGuestView,
} from "@/components/home/guest/guestViews";

const GUEST_VIEWS: Record<GuestView, React.ComponentType> = {
  overview: StandardHome,
  essentials: GuestEssentialsHome,
  network: GuestNetworkHome,
  market: GuestMarketHome,
  governance: GuestGovernanceHome,
};

interface HomeProps {
  initialGuestView: GuestView;
}

// The guest view lives in a cookie so the choice is known before the first
// client paint. Reading it after mount instead would paint the default view,
// then tear down its whole data-fetching tree to mount the real one.
// Note: this is not SSR-visible content — Layout returns null until the Hive
// chain initialises on the client, so the served HTML carries no view at all.
export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
}) => ({
  props: { initialGuestView: guestViewFromCookies(req.cookies) },
});

export default function Home({ initialGuestView }: HomeProps) {
  const { isLoggedIn, isInitializing } = useAuth();
  const { t } = useI18n();

  // Seeded from the cookie the server already read, so first paint is correct
  // and hydration matches.
  const [guestView, setGuestView] = useState<GuestView>(
    initialGuestView ?? DEFAULT_GUEST_VIEW
  );

  const chooseGuestView = (view: GuestView) => {
    setGuestView(view);
    writeGuestView(view);
  };

  if (isInitializing) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  // The modular dashboard is the signed-in home. StandardHome lives on only as
  // the guest Overview view below.
  if (isLoggedIn) return <WidgetIndex />;

  const GuestHome = GUEST_VIEWS[guestView] ?? StandardHome;
  return (
    <GuestViewProvider value={guestView} onChange={chooseGuestView}>
      {/* The other four draw their own; StandardHome is shared, so it gets one here */}
      {guestView === "overview" && (
        <GuestBoardHeader
          icon={GUEST_VIEW_META.overview.icon}
          accent={GUEST_VIEW_META.overview.accent}
          eyebrow={t("guestHome.overview.eyebrow")}
          title={t("guestHome.overview.title")}
          subtitle={t("guestHome.overview.subtitle")}
          headingLevel="h1"
        />
      )}
      <GuestHome />
    </GuestViewProvider>
  );
}
