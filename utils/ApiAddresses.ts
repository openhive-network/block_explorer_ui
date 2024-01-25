import { config } from "@/Config";
import { useEffect, useState } from "react";


export interface ApiAddressesResult {
  nodeAddress: string;
  apiAddress: string;
  writeNodeAddressToLocalStorage: (url: string | null) => void;
  writeApiAddressToLocalStorage: (url: string | null) => void;
}

const NODE_KEY = "nodeAddress";
const API_KEY = "apiAddress"

const useApiAddresses = () => {

  const [nodeAddress, setNodeAddress] = useState<string>(config.nodeAddress);
  const [apiAddress, setApiAddress] = useState<string>(config.apiAddress);

  const readNodeAddressFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(NODE_KEY);
      if (readValue) setNodeAddress(readValue)
      
    } catch (error) {
      console.log(error);
    }
  }

  const readApiAddressFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(API_KEY);
      if (readValue) setApiAddress(readValue)
    } catch (error) {
      console.log(error);
    }
  }

  const writeNodeAddressToLocalStorage = (url: string | null) => {
    try {
      if (url) {
        window.localStorage.setItem(NODE_KEY, url);
        setNodeAddress(url);
      } else {
        window.localStorage.removeItem(NODE_KEY);
        setApiAddress(config.nodeAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const writeApiAddressToLocalStorage = (url: string | null) => {
    try {
      if (url) {
        window.localStorage.setItem(API_KEY, url);
        setApiAddress(url);
      } else {
        window.localStorage.removeItem(API_KEY);
        setApiAddress(config.apiAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    readNodeAddressFromLocalStorage();
    readApiAddressFromLocalStorage();
  }, [])

  return {
    nodeAddress,
    apiAddress,
    writeNodeAddressToLocalStorage,
    writeApiAddressToLocalStorage
  } as ApiAddressesResult
  
}

export default useApiAddresses;