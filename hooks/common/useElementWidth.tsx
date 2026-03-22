import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook to get the width of an element.
 * 
 * @returns [ref, width] - Ref to attach to the element and the current width
 */
const useElementWidth = <T extends HTMLElement>(): [React.RefObject<T | null>, number] => {
  const [width, setWidth] = useState<number>(0);
  const elementRef = useRef<T | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!Array.isArray(entries) || !entries.length) {
      return;
    }
    const { width: newWidth } = entries[0].contentRect;
    setWidth(newWidth);
  }, []);

  useEffect(() => {
    if (!elementRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => handleResize(entries));
    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  return [elementRef, width];
};

export default useElementWidth;
