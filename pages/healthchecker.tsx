import HealthCheckerComponent from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";
import { useHealthCheckerServiceContext } from "@/contexts/HealthCheckerServiceContext";

export default function HealthcheckerPage() {

  const {
    healthCheckerService
  } = useHealthCheckerServiceContext();

  if (healthCheckerService)
  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          className=""
          healthCheckerService={healthCheckerService}
        />
      </div>
    </>
  );
}
