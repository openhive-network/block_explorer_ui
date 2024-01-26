import { config } from "@/Config";
import { useEffect, useState } from "react";
import fetchingService from "@/services/FetchingService";
import { useRouter } from 'next/router';


export interface ApiAddressesResult {
  nodeAddress: string | null;
  apiAddress: string | null;
  writeNodeAddressToLocalStorage: (url: string | null) => void;
  writeApiAddressToLocalStorage: (url: string | null) => void;
}

const NODE_KEY = "nodeAddress";
const API_KEY = "apiAddress"

const useApiAddresses = () => {

  const [nodeAddress, setNodeAddress] = useState<string | null>(null);
  const [apiAddress, setApiAddress] = useState<string | null>(null);

  const router = useRouter();

  const readNodeAddressFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(NODE_KEY);
      if (readValue) {
        fetchingService.setNodeUrl(readValue);
        setNodeAddress(readValue);
      } else {
        fetchingService.setNodeUrl(config.nodeAddress);
        setNodeAddress(config.nodeAddress);
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  const readApiAddressFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(API_KEY);
      if (readValue) { 
        fetchingService.setApiUrl(readValue);
        setApiAddress(readValue);
      } else {
        fetchingService.setApiUrl(config.apiAddress);
        setApiAddress(config.apiAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const writeNodeAddressToLocalStorage = async (url: string | null) => {
    try {
      if (url && url !== "") {
        await window.localStorage.setItem(NODE_KEY, url);
        router.reload();
        setNodeAddress(url);
      } else {
        await window.localStorage.removeItem(NODE_KEY);
        router.reload();
        setApiAddress(config.nodeAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const writeApiAddressToLocalStorage = async (url: string | null) => {
    try {
      if (url && url !== "") {
        await window.localStorage.setItem(API_KEY, url);
        router.reload();
        setApiAddress(url);
      } else {
        await window.localStorage.removeItem(API_KEY);
        router.reload();
        setApiAddress(config.apiAddress);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    readNodeAddressFromLocalStorage();
    readApiAddressFromLocalStorage();
  }, []);

  return {
    nodeAddress,
    apiAddress,
    writeNodeAddressToLocalStorage,
    writeApiAddressToLocalStorage
  } as ApiAddressesResult
  
}

export default useApiAddresses;