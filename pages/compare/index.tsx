import type { GetServerSideProps } from "next";
import PageNotFound from "@/components/PageNotFound";
import { deploySettings } from "@/utils/deploySettings";
import { notFoundProps } from "@/utils/seo/notFoundProps";

// Compare moved into the Tools hub. Preserve any ?a=&b= pair on the way.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!deploySettings.tools) return notFoundProps(ctx.res);
  const params = new URLSearchParams();
  const { a, b } = ctx.query;
  if (typeof a === "string") params.set("a", a);
  if (typeof b === "string") params.set("b", b);
  const qs = params.toString();
  return {
    redirect: {
      destination: `/tools/compare${qs ? `?${qs}` : ""}`,
      permanent: true,
    },
  };
};

// Only rendered when Tools is off; otherwise the request redirects.
export default PageNotFound;
