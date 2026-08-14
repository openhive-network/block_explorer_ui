import { headBlockRefreshInterval } from "@/contexts/headBlockRefresh";
import { config } from "@/Config";

describe("headBlockRefreshInterval", () => {
  // Guards the assertions below from passing vacuously on an undefined config.
  it("has both intervals configured as distinct numbers", () => {
    expect(typeof config.mainRefreshInterval).toBe("number");
    expect(typeof config.scheduleRefreshInterval).toBe("number");
    expect(config.mainRefreshInterval).not.toBe(config.scheduleRefreshInterval);
  });

  it("polls at the main interval whenever live data is on", () => {
    expect(headBlockRefreshInterval(true, 0)).toBe(config.mainRefreshInterval);
    expect(headBlockRefreshInterval(true, 3)).toBe(config.mainRefreshInterval);
  });

  it("does not poll when nothing on screen needs the head block", () => {
    expect(headBlockRefreshInterval(false, 0)).toBe(false);
  });

  // The regression: the witness schedule froze as a dashboard widget because
  // the poll was granted by pathname, and only /schedule matched.
  it("polls for a consumer that needs it, wherever it is rendered", () => {
    expect(headBlockRefreshInterval(false, 1)).toBe(
      config.scheduleRefreshInterval
    );
  });

  it("keeps polling while any consumer remains mounted", () => {
    expect(headBlockRefreshInterval(false, 2)).toBe(
      config.scheduleRefreshInterval
    );
  });

  it("live data wins over the slower consumer interval", () => {
    expect(config.mainRefreshInterval).not.toBe(config.scheduleRefreshInterval);
    expect(headBlockRefreshInterval(true, 1)).toBe(config.mainRefreshInterval);
  });
});
