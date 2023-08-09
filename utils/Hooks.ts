import { useRef, RefObject, useEffect, useState } from "react";

/**
 * hook for using debounce
 *
 * @param func function to be called after wait
 * @param wait wait in ms
 * @returns callable debounce function
 */
export const useDebounce = <T extends (...args: any) => any>(
  func: T,
  wait: number
) => {
  let timeoutID = useRef(setTimeout(() => null, 0));

  const debounced = (...args: any) => {
    clearTimeout(timeoutID.current);
    timeoutID.current = setTimeout(() => func(...args), wait);
  };

  return debounced;
};

/**
 * hook listening for clicks outside of ref element
 *
 * @param ref ref to an element
 * @param handler function to be called on outside click
 */
export const useOnClickOutside = (
  ref: RefObject<HTMLDivElement>,
  handler: Function
) => {
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
};

/**
 * hook listening to screen width changes
 *
 * @param query string query in form of CSS media query e.g. (max-width: 768px)
 * @returns boolean stating if current screen size matches the media query
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    if (matches === null) {
      setMatches(window.matchMedia(query).matches);
    }

    const matchQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    matchQueryList.addEventListener("change", handleChange);

    return () => {
      matchQueryList.removeEventListener("change", handleChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
};
