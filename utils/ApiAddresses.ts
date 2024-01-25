import { config } from "@/Config";
import { useEffect, useState } from "react";
import fetchingService from "@/services/FetchingService";


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
  }, []);

  return {
    nodeAddress,
    apiAddress,
    writeNodeAddressToLocalStorage,
    writeApiAddressToLocalStorage
  } as ApiAddressesResult
  
}

export default useApiAddresses;