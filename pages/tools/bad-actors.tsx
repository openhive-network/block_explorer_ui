import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";
import ToolsLayout from "@/components/tools/ToolsLayout";
import BadActorsTool from "@/components/tools/BadActorsTool";
import PageNotFound from "@/components/PageNotFound";

const ToolsBadActorsPage: React.FC = () => (
  <ToolsLayout active="bad-actors">
    <BadActorsTool />
  </ToolsLayout>
);

export default deploySettings.tools ? ToolsBadActorsPage : PageNotFound;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  if (!deploySettings.tools) return notFoundProps(res);
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/tools/bad-actors",
        seoText("seo.toolsBadActors.title"),
        seoText("seo.toolsBadActors.description")
      ),
    },
  };
};
