import type { GetServerSideProps } from "next";

// Compare moved into the Tools hub. Preserve any ?a=&b= pair on the way.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = new URLSearchParams();
  const { a, b } = ctx.query;
  if (typeof a === "string") params.set("a", a);
  if (typeof b === "string") params.set("b", b);
  const qs = params.toString();
  return {
    redirect: {
      destination: `/tools/compare${qs ? `?${qs}` : ""}`,
      permanent: false,
    },
  };
};

const CompareRedirect = () => null;

export default CompareRedirect;
