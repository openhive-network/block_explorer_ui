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
import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  absoluteBaseUrl,
  canonicalUrl,
  clamp,
  defaultOgImage,
  webSiteJsonLd,
  organizationJsonLd,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";

const GUEST_VIEWS: Record<GuestView, React.ComponentType> = {
  overview: StandardHome,
  essentials: GuestEssentialsHome,
  network: GuestNetworkHome,
  market: GuestMarketHome,
  governance: GuestGovernanceHome,
};

interface HomeProps {
  meta: SeoMeta;
  initialGuestView: GuestView;
}

export default function Home({ meta, initialGuestView }: HomeProps) {
  const { isLoggedIn, isInitializing } = useAuth();
  const { t } = useI18n();

  // Seeded from the cookie the server already read, so the first client paint is
  // correct. Not in the served HTML — Layout gates on client-side chain init —
  // so the win is no flash rather than SEO.
  const [guestView, setGuestView] = useState<GuestView>(
    initialGuestView ?? DEFAULT_GUEST_VIEW
  );

  const chooseGuestView = (view: GuestView) => {
    setGuestView(view);
    writeGuestView(view);
  };

  const GuestHome = GUEST_VIEWS[guestView] ?? StandardHome;

  // Meta is server-rendered and must emit whichever body is chosen, so every
  // branch sits below it rather than returning early.
  const body = isInitializing ? (
    // Restoring a session needs a node round trip, and isLoggedIn is false until
    // it lands. Rendering the guest home meanwhile would flash it — with its
    // whole data-fetching tree — at someone who is signed in.
    <div className="flex w-full items-center justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
    </div>
  ) : isLoggedIn ? (
    // The modular dashboard is the signed-in home. StandardHome lives on only as
    // the guest Overview view below.
    <WidgetIndex />
  ) : (
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

  return (
    <>
      <Seo meta={meta} />
      {body}
    </>
  );
}

// The guest view lives in a cookie so the choice is known before the first
// client paint. Reading it after mount instead would paint the default view,
// then tear down its whole data-fetching tree to mount the real one.
export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const base = absoluteBaseUrl(req);
  const description = clamp(
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || seoText("seo.home.description")
  );
  return {
    props: {
      meta: {
        title: seoText("seo.home.title"),
        description,
        canonical: canonicalUrl(req, "/"),
        ogType: "website",
        ogImage: defaultOgImage(base),
        jsonLd: [webSiteJsonLd(base, description), organizationJsonLd(base)],
      },
      initialGuestView: guestViewFromCookies(req.cookies),
    },
  };
};
