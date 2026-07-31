import { useCallback, useMemo, useState } from "react";

// Tracks up to two accounts picked from a list for head-to-head compare. Picking
// a third replaces the oldest (FIFO), so the newest two are always the pair.
const MAX = 2;

export interface CompareSelection {
  selected: string[];
  isSelected: (account: string) => boolean;
  toggle: (account: string) => void;
  remove: (account: string) => void;
  clear: () => void;
  isFull: boolean;
}

const useCompareSelection = (): CompareSelection => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = useCallback((account: string) => {
    setSelected((prev) => {
      if (prev.includes(account)) return prev.filter((a) => a !== account);
      if (prev.length >= MAX) return [prev[prev.length - 1], account];
      return [...prev, account];
    });
  }, []);

  const remove = useCallback(
    (account: string) =>
      setSelected((prev) => prev.filter((a) => a !== account)),
    []
  );

  const clear = useCallback(() => setSelected([]), []);

  return useMemo(
    () => ({
      selected,
      isSelected: (account: string) => selected.includes(account),
      toggle,
      remove,
      clear,
      isFull: selected.length >= MAX,
    }),
    [selected, toggle, remove, clear]
  );
};

export default useCompareSelection;
