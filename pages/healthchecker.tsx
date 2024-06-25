import HealthCheckerComponent from "@/components/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";
import { useAddressesContext } from "@/components/contexts/AddressesContext";

export default function HealthcheckerPage() {

  const {hiveChain} = useHiveChainContext();
  const { nodeAddress, apiAddress, setNodeAddress, setApiAddress } =
    useAddressesContext();


  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent hiveChain={hiveChain} currentAddress={nodeAddress} />
      </div>
    </>
  );
}
