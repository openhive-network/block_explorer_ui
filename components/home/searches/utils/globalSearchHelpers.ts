import { dataToURL } from "@/utils/URLutils";

export function setParamIfPositive(
  searchParams: URLSearchParams,
  key: string,
  value: any
) {
  const encodedValue = dataToURL(value);
  if (!encodedValue) return;

  searchParams.set(key, encodedValue);
}
