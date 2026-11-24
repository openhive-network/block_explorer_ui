import React from "react";
import type { GetServerSideProps } from "next";
import { SeoMeta, listPageMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";
import ToolsLayout from "@/components/tools/ToolsLayout";
import VotingPowerTool from "@/components/tools/VotingPowerTool";
import PageNotFound from "@/components/PageNotFound";

const ToolsVotingPowerPage: React.FC = () => (
  <ToolsLayout active="voting-power">
    <VotingPowerTool />
  </ToolsLayout>
);

export default deploySettings.tools ? ToolsVotingPowerPage : PageNotFound;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  if (!deploySettings.tools) return notFoundProps(res);
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/tools/voting-power",
        seoText("seo.toolsVotingPower.title"),
        seoText("seo.toolsVotingPower.description")
      ),
    },
  };
};
