import HealthCheckerComponent from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";
import { config } from "@/Config";

export default function HealthcheckerPage() {

  const {
    apiCheckers,
    scoredEndpoints,
    setScoredEndpoints,
    fallbacks,
    setFallbacks,
    nodeAddress,
    setNodeAddress,
    localProviders,
    setLocalProviders,
  } = useHealthCheckerContext();

  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          currentAddress={nodeAddress ? nodeAddress : undefined} 
          customApiCheckers={apiCheckers}
          customProviders={localProviders}
          setScoredEndpoints={setScoredEndpoints}
          scoredEndpoints={scoredEndpoints}
          fallbacks={fallbacks || []}
          defaultProviders={config.defaultProviders}
          setFallbacks={setFallbacks}
          setLocalProviders={setLocalProviders}
          setNodeAddress={setNodeAddress}
        />
      </div>
    </>
  );
}
