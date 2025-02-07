import HealthCheckerComponent from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

export default function HealthcheckerPage() {

  const {
    healthCheckerProps
  } = useHealthCheckerContext();

  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          className=""
          healthCheckerProps={healthCheckerProps}
        />
      </div>
    </>
  );
}
