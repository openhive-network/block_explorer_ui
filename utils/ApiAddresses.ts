import { config } from "@/Config";
import { useEffect, useState } from "react";
import fetchingService from "@/services/FetchingService";
import { useRouter } from 'next/router';


export interface ApiAddresses {
  nodeAddress: string | null;
  apiAddress: string | null;
  localProviders?: string[];
  fallbacks?: string[];
  writeNodeAddressToLocalStorage: (url: string | null) => void;
  writeApiAddressToLocalStorage: (url: string | null) => void;
  writeLocalProvidersToLocalStorage: (nodes: string[]) => void;
  writeFallbacksToLocalStorage: (fallbacks: string[]) => void;
}

const NODE_KEY = "nodeAddress";
const API_KEY = "apiAddress";
const LOCAL_PROVIDERS = "localProviders";
const FALLBACKS = "fallbacks";

const useApiAddresses = () => {

  const [nodeAddress, setNodeAddress] = useState<string | null>(null);
  const [apiAddress, setApiAddress] = useState<string | null>(null);
  const [localProviders, setLocalProviders] = useState<string[] | undefined>(undefined);
  const [fallbacks, setFallbacks] = useState<string[] | undefined>(undefined);

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

  const readLocalProvidersFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(LOCAL_PROVIDERS);
      if (readValue) { 
        setLocalProviders(JSON.parse(readValue));
      } else {
        setLocalProviders(config.defaultProviders)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const readFallbacksFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(FALLBACKS);
      if (readValue) { 
        setFallbacks(JSON.parse(readValue));
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

  const writeLocalProvidersToLocalStorage = async (localProviders: string[]) => {
    try {
      if (localProviders && localProviders.length > 0) {
        await window.localStorage.setItem(LOCAL_PROVIDERS, JSON.stringify(localProviders));
        setLocalProviders(localProviders);
      } else {
        await window.localStorage.removeItem(LOCAL_PROVIDERS);
        setLocalProviders(undefined);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const writeFallbacksToLocalStorage = async (fallbacks: string[]) => {
    try {
      if (fallbacks && fallbacks.length > 0) {
        await window.localStorage.setItem(FALLBACKS, JSON.stringify(fallbacks));
        setFallbacks(fallbacks);
      } else {
        await window.localStorage.removeItem(FALLBACKS);
        setFallbacks(undefined);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    readNodeAddressFromLocalStorage();
    readApiAddressFromLocalStorage();
    readLocalProvidersFromLocalStorage();
    readFallbacksFromLocalStorage();
  }, []);

  return {
    nodeAddress,
    apiAddress,
    localProviders,
    fallbacks,
    writeNodeAddressToLocalStorage,
    writeApiAddressToLocalStorage,
    writeLocalProvidersToLocalStorage,
    writeFallbacksToLocalStorage,

  } as ApiAddresses
  
}

export default useApiAddresses;