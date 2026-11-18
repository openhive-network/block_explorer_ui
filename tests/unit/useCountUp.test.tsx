/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import useCountUp from "@/hooks/common/useCountUp";

// Drive requestAnimationFrame by hand so each frame's value can be checked.
let frameCallbacks: FrameRequestCallback[] = [];
const runFrame = (ts: number) =>
  act(() => {
    const callbacks = frameCallbacks;
    frameCallbacks = [];
    callbacks.forEach((cb) => cb(ts));
  });

let shown: number[] = [];
const Probe = ({
  target,
  from,
}: {
  target: number | null;
  from?: "zero" | "previous";
}) => {
  shown.push(useCountUp(target, 1000, { from }));
  return null;
};

describe("useCountUp", () => {
  let container: HTMLDivElement;
  let root: Root;
  let reducedMotion = false;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    Object.assign(window, {
      matchMedia: () => ({ matches: reducedMotion }),
      requestAnimationFrame: (cb: FrameRequestCallback) =>
        frameCallbacks.push(cb),
      cancelAnimationFrame: () => {
        frameCallbacks = [];
      },
    });
    Object.assign(globalThis, {
      requestAnimationFrame: window.requestAnimationFrame,
      cancelAnimationFrame: window.cancelAnimationFrame,
    });
  });

  beforeEach(() => {
    shown = [];
    frameCallbacks = [];
    reducedMotion = false;
    container = document.createElement("div");
    root = createRoot(container);
  });

  afterEach(() => act(() => root.unmount()));

  const last = () => shown[shown.length - 1];

  it("sweeps up from 0 on first load, easing out, and stops on the target", () => {
    act(() => root.render(<Probe target={80} from="previous" />));
    expect(last()).toBe(0);
    const values: number[] = [];
    for (let ts = 0; ts <= 1000; ts += 100) {
      runFrame(ts);
      values.push(last());
    }
    expect(values[values.length - 1]).toBe(80);
    // Never goes backwards, and the steps shrink (ease-out).
    for (let i = 1; i < values.length; i++)
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    expect(values[1] - values[0]).toBeGreaterThan(values[10] - values[9]);
    expect(frameCallbacks).toHaveLength(0);
  });

  it('"previous" eases from the value shown, not from 0, when the target changes', () => {
    act(() => root.render(<Probe target={99.98} from="previous" />));
    runFrame(0);
    runFrame(1000);
    expect(last()).toBe(99.98);

    act(() => root.render(<Probe target={100} from="previous" />));
    runFrame(2000);
    runFrame(2500);
    expect(last()).toBeGreaterThanOrEqual(99.98);
    runFrame(3000);
    expect(last()).toBe(100);
    expect(Math.min(...shown.slice(shown.indexOf(99.98)))).toBe(99.98);
  });

  it('"previous" continues from mid-animation when the target changes again', () => {
    act(() => root.render(<Probe target={100} from="previous" />));
    runFrame(0);
    runFrame(500);
    const mid = last();
    expect(mid).toBeGreaterThan(0);
    act(() => root.render(<Probe target={50} from="previous" />));
    runFrame(600);
    expect(last()).toBeCloseTo(mid, 5);
    runFrame(1600);
    expect(last()).toBe(50);
  });

  it('"zero" (the default) restarts from 0 on every change', () => {
    act(() => root.render(<Probe target={40} />));
    runFrame(0);
    runFrame(1000);
    expect(last()).toBe(40);
    act(() => root.render(<Probe target={60} />));
    runFrame(2000);
    expect(last()).toBe(0);
  });

  it("shows the final value straight away with prefers-reduced-motion", () => {
    reducedMotion = true;
    act(() => root.render(<Probe target={73.5} from="previous" />));
    expect(last()).toBe(73.5);
    expect(frameCallbacks).toHaveLength(0);
  });

  it("shows 0 while the target is null", () => {
    act(() => root.render(<Probe target={null} from="previous" />));
    expect(last()).toBe(0);
  });

  it("sweeps up from 0 again after going back to null", () => {
    act(() => root.render(<Probe target={60} from="previous" />));
    runFrame(0);
    runFrame(1000);
    expect(last()).toBe(60);
    act(() => root.render(<Probe target={null} from="previous" />));
    expect(last()).toBe(0);
    act(() => root.render(<Probe target={60} from="previous" />));
    runFrame(2000);
    expect(last()).toBe(0);
    runFrame(3000);
    expect(last()).toBe(60);
  });

  it("recovers after a NaN target instead of staying NaN", () => {
    act(() => root.render(<Probe target={NaN} from="previous" />));
    expect(last()).toBe(0);
    act(() => root.render(<Probe target={42} from="previous" />));
    runFrame(0);
    runFrame(1000);
    expect(last()).toBe(42);
  });
});
