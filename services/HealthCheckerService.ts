import { ValidationErrorDetails } from "@/contexts/HealthCheckerContext";
import { HealthChecker, IHiveChainInterface, TScoredEndpoint, WaxHealthCheckerValidatorFailedError } from "@hiveio/wax";

export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  validatorFunction: (data: any) => string | true;
}

const LOCAL_PROVIDERS = "localProviders";
const FALLBACKS = "fallbacks";

class HealthCheckerService {

  private hiveChain?: IHiveChainInterface;
  private apiCheckers?: ApiChecker[];
  private defaultProviders?: string[];
  private providers?: string[];
  private fallbacks?: string[];
  private scoredEndpoints?: TScoredEndpoint[];
  private healthChecker?: HealthChecker;
  private nodeAddress: string | null = null;
  private setNodeAddress: (node:string) => void = () => {}
  private endpointTitleById: Map<number, string> = new Map();
  private chainInitialized: boolean = false;
  private failedChecksByProvider: Map<string, ValidationErrorDetails[]> = new Map();

  constructor(
    hiveChain: IHiveChainInterface,
    apiCheckers: ApiChecker[],
    defaultProviders: string[],
    healthChecker: HealthChecker,
    nodeAddress: string | null,
    setNodeAddress: (node: string) => void,
  ) {
    this.hiveChain = hiveChain;
    this.healthChecker = healthChecker;
    this.apiCheckers = apiCheckers;
    this.readFallbacksFromLocalStorage();
    this.readLocalProvidersFromLocalStorage();
    this.nodeAddress = nodeAddress;
    this.setNodeAddress = setNodeAddress;
    this.defaultProviders = defaultProviders;
  }


  // Local Storage

  readLocalProvidersFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(LOCAL_PROVIDERS);
      if (readValue) { 
        this.providers = JSON.parse(readValue);
      } else {
        this.providers = this.defaultProviders;
      }
    } catch (error) {
      console.log(error);
    }
  }

  readFallbacksFromLocalStorage = () => {
    try {
      const readValue = window.localStorage.getItem(FALLBACKS);
      if (readValue) { 
        this.fallbacks = JSON.parse(readValue);
      } 
    } catch (error) {
      console.log(error);
    }
  }

  writeLocalProvidersToLocalStorage = async (localProviders: string[]) => {
    try {
      if (localProviders && localProviders.length > 0) {
        await window.localStorage.setItem(LOCAL_PROVIDERS, JSON.stringify(localProviders));
        this.providers = localProviders;
      } else {
        await window.localStorage.removeItem(LOCAL_PROVIDERS);
        this.providers = undefined;
      }
    } catch (error) {
      console.log(error);
    }
  }

  writeFallbacksToLocalStorage = async (fallbacks: string[]) => {
    try {
      if (fallbacks && fallbacks.length > 0) {
        await window.localStorage.setItem(FALLBACKS, JSON.stringify(fallbacks));
        this.fallbacks = fallbacks;
      } else {
        await window.localStorage.removeItem(FALLBACKS);
        this.fallbacks = undefined;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // HC Logic

  markValidationError = (endpointId: number, providerName: string, error: WaxHealthCheckerValidatorFailedError<string>) => {
    const checkTitle = this.endpointTitleById.get(endpointId);
    if (checkTitle) {
      const checkObject: ValidationErrorDetails = {
        checkName: checkTitle,
        providerName: providerName,
        message: error.message,
        paths: error.apiEndpoint.paths,
        params: error.request.data,
      }
      const prevoiusFailedChecks = [...this.failedChecksByProvider.get(providerName) || [], checkObject];
      const newFailedChecks = structuredClone(this.failedChecksByProvider).set(providerName, prevoiusFailedChecks);
      this.failedChecksByProvider = newFailedChecks;
    }
  } 

  createHealthChecker = async () => {
    this.healthChecker?.on('error', error => console.error(error.message));
    this.healthChecker?.on("data", (data: Array<TScoredEndpoint>) => { 
      console.log(JSON.stringify(data)); 
      this.checkForFallbacks(data); 
      if (data.length)this.scoredEndpoints = data
    });
    this.healthChecker?.on("validationerror", error => this.markValidationError(error.apiEndpoint.id, error.request.endpoint, error));
  }

  checkForFallbacks = (scoredEndpoints: TScoredEndpoint[]) => {
    const currentScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === this.nodeAddress);
    if (currentScoredEndpoint && !currentScoredEndpoint.up) {
      this.fallbacks?.forEach((fallback) => {
        const fallbackScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === fallback);
        if (fallbackScoredEndpoint && fallbackScoredEndpoint.up) this.setNodeAddress(fallback) ;
      })
    }
  }

  registerCalls = async () => {
    const registeredEndpoints = new Map<number, string>();
    if (this.apiCheckers)
    for (const checker of this.apiCheckers) {
      const testHC = await this.healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, this.providers);
      if (testHC)
      registeredEndpoints.set(testHC.id, checker.title);
    }
    this.endpointTitleById = registeredEndpoints;
  }

  initializeDefaultChecks = async () => {
    const initialEndpoints: TScoredEndpoint[] | undefined = this.providers?.map((customProvider) => ({endpointUrl: customProvider, score: -1, up: true, latencies: []}))
    if (!!initialEndpoints && !this.scoredEndpoints) this.scoredEndpoints = initialEndpoints;
    this.registerCalls()
    this.chainInitialized = true;
  }

  removeFallback = (provider: string) => {
    this.writeFallbacksToLocalStorage(this.fallbacks?.filter((fallback) => fallback !== provider) || []);
  }

  addProvider = (provider: string) => {
    if (this.healthChecker) {
      for (const endpoint of this.healthChecker) {
        endpoint.addEndpointUrl(provider);
      }
      if (this.providers && !this.providers.some((localProvider) => provider === localProvider)) {
        this.writeLocalProvidersToLocalStorage([...(this.providers || []), provider]);
        this.scoredEndpoints = [...this.scoredEndpoints || [], {endpointUrl: provider, score: -1, up: true, latencies: []}]
      }
    }
  }

  removeProvider = (provider: string) => {
    if (this.healthChecker && this.providers)
    for (const endpoint of this.healthChecker) {
      endpoint.removeEndpointUrl(provider);
    }
    const newLocalProviders = this.providers?.filter((localProvider) => localProvider !== provider) || [];
    this.scoredEndpoints = this.scoredEndpoints?.filter((endpoint) => endpoint.endpointUrl !== provider);
    this.writeLocalProvidersToLocalStorage(newLocalProviders);
    this.removeFallback(provider);
  }

  resetProviders = () => {
    this.writeLocalProvidersToLocalStorage(this?.defaultProviders || []);
    this.scoredEndpoints = [];
    this.healthChecker?.unregisterAll();
    this.registerCalls();
  }

}

export default HealthCheckerService;