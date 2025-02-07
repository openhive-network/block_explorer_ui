import HealthCheckerComponent from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

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
    addProvider,
    removeProvider,
    resetProviders,
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
          setFallbacks={setFallbacks}
          setLocalProviders={setLocalProviders}
          setNodeAddress={setNodeAddress}
          addProvider={addProvider}
          removeProvider={removeProvider}
          resetProviders={resetProviders}
        />
      </div>
    </>
  );
}
