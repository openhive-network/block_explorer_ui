import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";
import ToolsLayout from "@/components/tools/ToolsLayout";
import UnitConverter from "@/components/tools/UnitConverter";
import PageNotFound from "@/components/PageNotFound";

const ToolsConverterPage: React.FC = () => (
  <ToolsLayout active="converter">
    <UnitConverter />
  </ToolsLayout>
);

export default deploySettings.tools ? ToolsConverterPage : PageNotFound;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  if (!deploySettings.tools) return notFoundProps(res);
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/tools/converter",
        seoText("seo.toolsConverter.title"),
        seoText("seo.toolsConverter.description")
      ),
    },
  };
};
