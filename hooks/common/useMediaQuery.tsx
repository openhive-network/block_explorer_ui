import { useState, useEffect } from "react";

/**
 * hook listening to screen width changes
 *
 * @param query string query in form of CSS media query e.g. (max-width: 768px)
 * @returns boolean stating if current screen size matches the media query
 */
const useMediaQuery = (query: string) => {
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

export default useMediaQuery;
