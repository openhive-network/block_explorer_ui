import { useEffect, useState } from "react";


export interface ApiAddressesResult {
  nodeAddressFromLocalStorage: string;
  apiAddressFromLocalStorage: string;
  writeNodeAddressToLocalStorage: (url: string) => void;
  writeApiAddressToLocalStorage: (url: string) => void;
}

const NODE_KEY = "nodeAddress";
const API_KEY = "apiAddress"

const useApiAddresses = () => {

  const [nodeAddress, setNodeAddress] = useState<string | null>(null);
  const [apiAddress, setApiAddress] = useState<string | null>(null);

  const readNodeAddressFromLocalStorage = () => {
    try {
      const reeadValue = window.localStorage.getItem(NODE_KEY);
      setNodeAddress(reeadValue)
    } catch (error) {
      console.log(error);
    }
  }

  const readApiAddressFromLocalStorage = () => {
    try {
      const reeadValue = window.localStorage.getItem(API_KEY);
      setApiAddress(reeadValue)
    } catch (error) {
      console.log(error);
    }
  }

  const writeNodeAddressToLocalStorage = (url: string) => {
    try {
      window.localStorage.setItem(NODE_KEY, url);
      setNodeAddress(url);
    } catch (error) {
      console.log(error);
    }
  }

  const writeApiAddressToLocalStorage = (url: string) => {
    try {
      window.localStorage.setItem(API_KEY, url);
      setApiAddress(url);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    readNodeAddressFromLocalStorage();
    readApiAddressFromLocalStorage();
  }, [])

  return {
    nodeAddressFromLocalStorage: nodeAddress,
    apiAddressFromLocalStorage: apiAddress,
    writeNodeAddressToLocalStorage,
    writeApiAddressToLocalStorage
  } as ApiAddressesResult
  
}

export default useApiAddresses;