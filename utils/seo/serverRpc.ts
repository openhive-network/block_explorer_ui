import { config } from "@/Config";

// Server-side Hive access: the Wax chain is browser-only, so SSR speaks plain JSON-RPC/REST.

const RPC = config.nodeAddress;
const REST = config.apiAddress.replace(/\/+$/, "");

// A slow node must not hang a render.
export const DEFAULT_FETCH_TIMEOUT_MS = 4000;

export const fetchWithTimeout = async (
  url: string,
  opts: RequestInit = {},
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT_MS
): Promise<Response> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
};

export const rpc = async (
  method: string,
  params: unknown,
  timeoutMs?: number
): Promise<any> => {
  const res = await fetchWithTimeout(
    RPC,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
    },
    timeoutMs
  );
  const json = await res.json();
  return json.result;
};

export const restGet = async (
  route: string,
  timeoutMs?: number
): Promise<any> => {
  const res = await fetchWithTimeout(`${REST}${route}`, {}, timeoutMs);
  if (!res.ok) throw new Error(`REST ${res.status} for ${route}`);
  return res.json();
};

// Never fail a render on a slow node; callers fall back.
export const rpcOrNull = async <T>(
  method: string,
  params: unknown,
  timeoutMs?: number
): Promise<T | null> => {
  try {
    return (await rpc(method, params, timeoutMs)) ?? null;
  } catch {
    return null;
  }
};
