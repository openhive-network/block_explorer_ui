import type { GetServerSideProps } from "next";
import PageNotFound from "@/components/PageNotFound";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";

// /tools lands on the first tab.
export const getServerSideProps: GetServerSideProps = async ({ res }) =>
  deploySettings.tools
    ? { redirect: { destination: "/tools/compare", permanent: false } }
    : notFoundProps(res);

// Only rendered when Tools is off; otherwise the request redirects.
export default PageNotFound;
