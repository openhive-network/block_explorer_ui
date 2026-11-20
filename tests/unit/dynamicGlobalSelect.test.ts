// useDynamicGlobal's select runs once per component using the hook; the
// proposals page has one per card, so the heavy wax formatting must run once
// per fetched payload, not once per component (#876).
jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@/contexts/HiveChainContext", () => ({
  useHiveChainContext: () => ({ hiveChain: {} }),
}));
const mockAdjust = jest.fn((props: { id: number }) => ({ adjusted: props.id }));
jest.mock("@/utils/QueryDataSelectors", () => ({
  adjustDynamicGlobalBlockData: (props: { id: number }) => mockAdjust(props),
}));

import { selectGlobalBlockData } from "@/hooks/api/homePage/useDynamicGlobal";

type Payload = Parameters<typeof selectGlobalBlockData>[0];
const payload = (id: number) =>
  [{ id }, {}, { funds: [] }] as unknown as Payload;
const chain = {} as Parameters<typeof selectGlobalBlockData>[1];

it("formats each payload once and hands every caller the same result", () => {
  const first = payload(1);
  const results = Array.from({ length: 300 }, () =>
    selectGlobalBlockData(first, chain)
  );
  expect(mockAdjust).toHaveBeenCalledTimes(1);
  expect(new Set(results).size).toBe(1);
  expect(results[0]).toEqual({ adjusted: 1 });

  // A refetch brings a new payload, which is formatted afresh.
  expect(selectGlobalBlockData(payload(2), chain)).toEqual({ adjusted: 2 });
  expect(mockAdjust).toHaveBeenCalledTimes(2);
});
