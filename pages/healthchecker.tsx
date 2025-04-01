import Head from "next/head";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";
import { useHealthCheckerServiceContext } from "@/contexts/HealthCheckerServiceContext";
import { HealthCheckerComponent } from "@hiveio/healthchecker-component"

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
