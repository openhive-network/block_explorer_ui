import { useRouter } from "next/router";
import React from "react";
import { Button } from "../components/ui/button";
import useApiAddresses from "@/utils/ApiAddresses";
import AddressSwitchedDialog from "@/components/AddressSwitchedDialog";

const ErrorPage: React.FC = () => {
  const router = useRouter();
  const apiAdresses = useApiAddresses();
  return (
    <div className="w-full h-screen flex flex-col justify-between items-center">
      <div></div>
      <div className="flex justify-center flex-col">
        <div className="flex justify-center">
          An error occured
        </div>
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
            className="bg-explorer-yellow hover:bg-explorer-bg-start"
            onClick={() => {router.push("/").then(() => location.reload())}}
          >
            Go To Home Page
          </Button>
        </div>
      </div>
      <div className="flex justify-center gap-x-8 bg-explorer-dark-gray w-full mt-12 text-white text-sm">
        {!!apiAdresses.apiAddress  && (
          <AddressSwitchedDialog
            addressType="api"
            currentAddress={apiAdresses.apiAddress}
            setAddress={apiAdresses.writeApiAddressToLocalStorage}
          />
        )}
        {!!apiAdresses.nodeAddress && (
          <AddressSwitchedDialog
            addressType="api"
            currentAddress={apiAdresses.nodeAddress}
            setAddress={apiAdresses.writeNodeAddressToLocalStorage}
          />
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
