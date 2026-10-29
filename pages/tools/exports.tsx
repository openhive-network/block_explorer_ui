import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";
import ToolsLayout from "@/components/tools/ToolsLayout";
import ExportsComingSoon from "@/components/tools/ExportsComingSoon";
import PageNotFound from "@/components/PageNotFound";

const ToolsExportsPage: React.FC = () => (
  <ToolsLayout active="exports">
    <ExportsComingSoon />
  </ToolsLayout>
);

export default deploySettings.tools ? ToolsExportsPage : PageNotFound;

// Placeholder page — nothing to rank, so it is kept out of the index rather
// than offering crawlers a "coming soon".
export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  if (!deploySettings.tools) return notFoundProps(res);
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: noindexMeta(
        req,
        "/tools/exports",
        seoText("seo.toolsExports.title"),
        seoText("seo.toolsExports.description")
      ),
    },
  };
};
