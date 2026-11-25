import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";
import ToolsLayout from "@/components/tools/ToolsLayout";
import BulkLookupTool from "@/components/tools/BulkLookupTool";
import PageNotFound from "@/components/PageNotFound";

const ToolsBulkLookupPage: React.FC = () => (
  <ToolsLayout active="bulk-lookup">
    <BulkLookupTool />
  </ToolsLayout>
);

export default deploySettings.tools ? ToolsBulkLookupPage : PageNotFound;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  if (!deploySettings.tools) return notFoundProps(res);
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/tools/bulk-lookup",
        seoText("seo.toolsBulkLookup.title"),
        seoText("seo.toolsBulkLookup.description")
      ),
    },
  };
};
