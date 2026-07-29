import React from "react";
import type { GetServerSideProps } from "next";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import StandardHome from "@/components/home/StandardHome";
import WidgetIndex from "@/components/home/WidgetIndex";
import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  absoluteBaseUrl,
  canonicalUrl,
  defaultOgImage,
  webSiteJsonLd,
  organizationJsonLd,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";

export default function Home({ meta }: { meta: SeoMeta }) {
  const { isLoggedIn, isInitializing } = useAuth();
  const { settings } = useSettings();

  const body =
    !isInitializing && isLoggedIn && settings.enableModularDashboard ? (
      <WidgetIndex />
    ) : (
      <StandardHome />
    );

  return (
    <>
      <Seo meta={meta} />
      {body}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const base = absoluteBaseUrl(req);
  const description =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || seoText("seo.home.description");
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
    },
  };
};
