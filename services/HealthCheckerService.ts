import { HealthChecker, IHiveChainInterface, TScoredEndpoint, WaxHealthCheckerValidatorFailedError } from "@hiveio/wax";

export interface ApiChecker {
  title: string;
  method: any;
  params: any;
  validatorFunction: (data: any) => string | true;
}

export type ValidationErrorDetails = {
  checkName: string;
  providerName: string;
  message: string;
  paths: string[];
  params?: string | object;
}

export interface HealthCheckerFields {
  apiCheckers: ApiChecker[];
  scoredEndpoints: TScoredEndpoint[] | undefined;
  failedChecksByProvider: Map<string, ValidationErrorDetails[]>;
  nodeAddress: string | null;
  fallbacks?: string[];
  providers?: string[];
}

const LOCAL_PROVIDERS = "localProviders";
const FALLBACKS = "fallbacks";

class HealthCheckerService extends EventTarget {

  private defaultProviders?: string[];
  private healthChecker?: HealthChecker;
  private endpointTitleById: Map<number, string> = new Map();
  private hiveChain?: IHiveChainInterface;
  
  
  public scoredEndpoints?: TScoredEndpoint[];
  public failedChecksByProvider: Map<string, ValidationErrorDetails[]> = new Map();
  public nodeAddress: string | null = null;
  public fallbacks?: string[];
  public providers?: string[];
  public apiCheckers?: ApiChecker[];
  
  public changeNodeAddress: (node:string | null) => void = () => {}

  constructor(
    apiCheckers: ApiChecker[],
    defaultProviders: string[],
    hiveChain: IHiveChainInterface,
    healthChecker: HealthChecker,
    nodeAddress: string | null, // Remember to ge this inside service
    changeNodeAddress: (node: string | null) => void,
  ) {
    super();
    this.healthChecker = healthChecker;
    this.hiveChain = hiveChain;
    this.apiCheckers = apiCheckers;
    this.nodeAddress = nodeAddress;
    this.defaultProviders = defaultProviders;
    this.readFallbacksFromLocalStorage();
    this.readLocalProvidersFromLocalStorage();
    this.changeNodeAddress = changeNodeAddress;
    this.createHealthChecker();
    this.initializeDefaultChecks();
  }

  emit(eventName: string, detail?: any) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
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

  handleChangeOfNode = (nodeAddress: string | null) => {
    this.removeFallback(nodeAddress || "");
    this.changeNodeAddress(nodeAddress);
    this.emit("stateChange", this.getComponentData());
  }

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
      this.emit("stateChange", this.getComponentData());
    }
  } 

  clearValidationError = (providerName: string, checkName: string) => {
    const failedChecks = [...this.failedChecksByProvider.get(providerName) || []].filter((failedCheck) => failedCheck.checkName !== checkName);
    const newFailedChecks = structuredClone(this.failedChecksByProvider).set(providerName, failedChecks);
    this.failedChecksByProvider = newFailedChecks;
    this.emit("stateChange", this.getComponentData());
  }

  updateAppAfterScoredEndpointsChange = (data: Array<TScoredEndpoint>) => {
    console.log(JSON.stringify(data)); 
    this.checkForFallbacks(data); 
    if (data.length)this.scoredEndpoints = data;
    this.emit("stateChange", this.getComponentData());
  }

  createHealthChecker = async () => {
    this.healthChecker?.on('error', error => console.error(error.message));
    this.healthChecker?.on("data", this.updateAppAfterScoredEndpointsChange);
    this.healthChecker?.on("validationerror", error => this.markValidationError(error.apiEndpoint.id, error.request.endpoint, error));
  }

  checkForFallbacks = (scoredEndpoints: TScoredEndpoint[]) => {
    const currentScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === this.nodeAddress);
    if (currentScoredEndpoint && !currentScoredEndpoint.up) {
      this.fallbacks?.forEach((fallback) => {
        const fallbackScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === fallback);
        if (fallbackScoredEndpoint && fallbackScoredEndpoint.up) this.changeNodeAddress(fallback) ;
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
  }

  addProvider = (provider: string) => {
    if (this.healthChecker) {
      for (const endpoint of this.healthChecker) {
        endpoint.addEndpointUrl(provider);
      }
      if (this.providers && !this.providers.some((localProvider) => provider === localProvider)) {
        this.writeLocalProvidersToLocalStorage([...(this.providers || []), provider]);
        this.providers = [...(this.providers || []), provider];
        this.scoredEndpoints = [...this.scoredEndpoints || [], {endpointUrl: provider, score: -1, up: true, latencies: []}]
        this.emit("stateChange", this.getComponentData());
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
    this.providers = newLocalProviders;
    this.removeFallback(provider);
    this.emit("stateChange", this.getComponentData());
  }

  resetProviders = () => {
    this.writeLocalProvidersToLocalStorage(this?.defaultProviders || []);
    this.scoredEndpoints = [];
    this.healthChecker?.unregisterAll();
    this.registerCalls();
    this.emit("stateChange", this.getComponentData());
  }

  registerFallback = (provider: string) => {
    if (!this.fallbacks?.includes(provider)) {
      this.fallbacks = [...this.fallbacks || [], provider];
      this.writeFallbacksToLocalStorage(this.fallbacks);
      this.emit("stateChange", this.getComponentData());
    }
  }

  removeFallback = (provider: string) => {
    this.fallbacks = this.fallbacks?.filter((fallback) => fallback !== provider) || [];
    this.writeFallbacksToLocalStorage(this.fallbacks);
    this.emit("stateChange", this.getComponentData());
  }

  getComponentData = (): HealthCheckerFields | undefined => {
    if (this.apiCheckers && this.scoredEndpoints)
    return {
      apiCheckers: this.apiCheckers,
      scoredEndpoints: this.scoredEndpoints,
      failedChecksByProvider: this.failedChecksByProvider,
      fallbacks: this.fallbacks,
      nodeAddress: this.nodeAddress,
      providers: this.providers,
    }
  }

}

export default HealthCheckerService;