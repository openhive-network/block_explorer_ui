import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";

const EmptyTransactionPage: React.FC = () => {
  const router = useRouter();
  return (
    <div className="mt-72 md:mt-96 flex flex-col justify-center gap-y-4">
      <div>Unspecified transaction</div>
      <Button onClick={() => router.push("/")} variant={"outline"}>
        Go to home page
      </Button>
    </div>
  );
};

// noindex must come from getServerSideProps — a <Head> in the page body sits
// under the hiveChain-gated <Layout>, which renders null on the server, so a
// crawler would never see it.
export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: noindexMeta(
        req,
        "/tx",
        seoText("seo.txIndex.title"),
        seoText("seo.txIndex.description")
      ),
    },
  };
};

export default EmptyTransactionPage;
