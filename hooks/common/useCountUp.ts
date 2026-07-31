import { useEffect, useRef, useState } from "react";

const prefersReduced = (): boolean =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Ease a number from 0 up to `target` once whenever it changes. Snaps instantly
// when the target is null, on the server, or if the user prefers reduced motion.
const useCountUp = (target: number | null, durationMs = 700): number => {
  const [value, setValue] = useState(target ?? 0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (target == null) {
      setValue(0);
      return;
    }
    if (prefersReduced() || typeof requestAnimationFrame === "undefined") {
      setValue(target);
      return;
    }
    let startTs: number | null = null;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / durationMs);
      setValue(target * ease(p));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
};

export default useCountUp;
