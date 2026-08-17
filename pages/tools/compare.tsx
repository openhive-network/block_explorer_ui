import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";
import ToolsLayout from "@/components/tools/ToolsLayout";
import CompareTool from "@/components/compare/CompareTool";

const ToolsComparePage: React.FC = () => (
  <ToolsLayout active="compare">
    <CompareTool />
  </ToolsLayout>
);

export default ToolsComparePage;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/tools/compare",
        seoText("seo.toolsCompare.title"),
        seoText("seo.toolsCompare.description")
      ),
    },
  };
};
