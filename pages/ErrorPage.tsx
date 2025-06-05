import { useRouter } from "next/router";
import React from "react";
import { Button } from "../components/ui/button";
import useApiAddresses from "@/utils/ApiAddresses";
import HealthCheckerDialog from "@/components/HealthCheckerDialog";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

const ErrorPage: React.FC = () => {
  const router = useRouter();
  const apiAdresses = useApiAddresses();
  const {restApiHealthCheckerService, nodeHealthCheckerService} = useHealthCheckerContext()
  return (
    <div className="page-container bg-theme h-screen flex flex-col justify-between items-center">
      <div></div>
      <div className="flex justify-center flex-col">
        <div className="flex justify-center">An error occured</div>
        <div className="flex mt-10 gap-x-8">
          <Button
            variant={"outline"}
            className="hover:bg-explorer-bg-start"
            onClick={() => location.reload()}
          >
            Reload Page
          </Button>
          <Button
            variant={"outline"}
            className="bg-explorer-yellow hover:bg-explorer-bg-star dark:text-black"
            onClick={() => {
              router.push("/").then(() => location.reload());
            }}
          >
            Go To Home Page
          </Button>
        </div>
      </div>
      <div className="flex justify-center gap-x-8 bg-theme dark:bg-theme w-full mt-12 text-white text-sm">
        {!!apiAdresses.apiAddress && !!restApiHealthCheckerService && (
          <HealthCheckerDialog trigerText="Explorer backend API:" apiAddress={apiAdresses.apiAddress} healthCheckerService={restApiHealthCheckerService} />
        )}
        {!!apiAdresses.nodeAddress && !!nodeHealthCheckerService  &&(
          <HealthCheckerDialog trigerText="Hive node:" apiAddress={apiAdresses.nodeAddress} healthCheckerService={nodeHealthCheckerService} />
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
