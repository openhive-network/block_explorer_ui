import { resolveEChartOpts } from "@/utils/echartOpts";

describe("resolveEChartOpts", () => {
  it("applies the svg renderer when a caller passes nothing", () => {
    expect(resolveEChartOpts()).toEqual({ renderer: "svg" });
    expect(resolveEChartOpts({})).toEqual({ renderer: "svg" });
  });

  it("keeps the caller's other opts alongside the default renderer", () => {
    expect(resolveEChartOpts({ locale: "en", devicePixelRatio: 2 })).toEqual({
      renderer: "svg",
      locale: "en",
      devicePixelRatio: 2,
    });
  });

  it("lets a caller opt back to canvas", () => {
    expect(resolveEChartOpts({ renderer: "canvas" })).toEqual({
      renderer: "canvas",
    });
  });
});
