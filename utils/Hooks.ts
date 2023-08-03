import { useRef, RefObject, useEffect } from "react";

/**
 * hook for using debounce
 * 
 * @param func function to be called after wait
 * @param wait wait in ms
 * @returns callable debounce function
 */
export const useDebounce = <T extends ((...args: any) => any)>(func: T, wait: number) => {
  let timeoutID = useRef(setTimeout(() => null, 0));

  const debounced = (...args: any) => {
    clearTimeout(timeoutID.current);
    timeoutID.current = setTimeout(() => func(...args), wait);
  }

  return debounced;
}

/**
 * hook for listening for clicks outside of ref element
 * 
 * @param ref ref to an element
 * @param handler function to be called on outside click
 */
export const useOnClickOutside = (ref: RefObject<HTMLDivElement>, handler: Function) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };
    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
}