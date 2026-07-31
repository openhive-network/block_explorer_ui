import { useMemo } from "react";

import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useCompareAccount from "./useCompareAccount";
import { buildComparisonSections } from "@/utils/compare/rowModel";
import { CompareRange } from "@/utils/compare/range";

// Fans out the per-account comparison data for both accounts in parallel and
// shapes it into the winner-highlight section/row model. The range governs the
// windowed sections; instant sections ignore it.
const useAccountComparison = (a: string, b: string, range: CompareRange) => {
  const { dynamicGlobalData } = useDynamicGlobal();
  const aData = useCompareAccount(a, range, dynamicGlobalData);
  const bData = useCompareAccount(b, range, dynamicGlobalData);

  const sections = useMemo(
    () => buildComparisonSections(aData, bData),
    [aData, bData]
  );

  return {
    a: aData,
    b: bData,
    sections,
    isLoading: aData.isLoading || bData.isLoading,
    aNotFound: aData.notFound,
    bNotFound: bData.notFound,
  };
};

export default useAccountComparison;
