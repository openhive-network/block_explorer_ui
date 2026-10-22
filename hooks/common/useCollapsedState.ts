import { useEffect, useState } from "react";

// Collapsed state of a sidebar card. It follows `isInitiallyOpen` when the
// section's expand/collapse-all flips it, so the card can stay mounted and keep
// its own sort, page and toggles.
const useCollapsedState = (isInitiallyOpen: boolean | undefined) => {
  const [isHidden, setIsHidden] = useState(!isInitiallyOpen);

  useEffect(() => {
    setIsHidden(!isInitiallyOpen);
  }, [isInitiallyOpen]);

  return [isHidden, setIsHidden] as const;
};

export default useCollapsedState;
