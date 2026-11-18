import { useEffect, useRef, useState } from "react";

const prefersReduced = (): boolean =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface CountUpOptions {
  // "zero": every change counts up from 0.
  // "previous": the first value counts up from 0, later changes ease from the
  // value currently shown, so a live refresh from 99.98 to 100 barely moves.
  from?: "zero" | "previous";
}

// Ease a number towards `target` with requestAnimationFrame whenever it changes.
// Snaps instantly when the target is null, on the server, or if the user
// prefers reduced motion.
const useCountUp = (
  target: number | null,
  durationMs = 700,
  { from = "zero" }: CountUpOptions = {}
): number => {
  const initial = from === "previous" ? 0 : (target ?? 0);
  const [value, setValue] = useState(initial);
  const shownRef = useRef(initial);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const show = (v: number) => {
      shownRef.current = v;
      setValue(v);
    };
    if (target == null) {
      show(0);
      return;
    }
    if (prefersReduced() || typeof requestAnimationFrame === "undefined") {
      show(target);
      return;
    }
    const start = from === "previous" ? shownRef.current : 0;
    const delta = target - start;
    let startTs: number | null = null;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min(1, (ts - startTs) / durationMs);
      show(start + delta * ease(p));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, from]);

  return value;
};

export default useCountUp;
