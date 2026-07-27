import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import Head from "next/head";

const EmptyTransactionPage: React.FC = () => {
  const router = useRouter();
  return (
    <div className="mt-72 md:mt-96 flex flex-col justify-center gap-y-4">
      <Head>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div>Unspecified transaction</div>
      <Button onClick={() => router.push("/")} variant={"outline"}>
        Go to home page
      </Button>
    </div>
  );
};

export default EmptyTransactionPage;
