import HealthCheckerComponent from "@/components/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";

export default function HealthcheckerPage() {

  const {hiveChain} = useHiveChainContext();


  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent hiveChain={hiveChain} />
      </div>
    </>
  );
}
