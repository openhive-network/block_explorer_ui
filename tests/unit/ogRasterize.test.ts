import { svgToPng } from "@/utils/og/rasterize";

// Guards the defect behind #771: the OG routes used to fall back to SVG, which
// no social platform renders. These assert real raster bytes come out.

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#15121a"/>
  <text x="60" y="120" font-family="DejaVu Sans" font-size="48" fill="#ffffff">@libanista rep 57 ★</text>
  <text x="60" y="200" font-family="DejaVu Sans" font-size="32" fill="#cccccc">view full profile →</text>
</svg>`;

describe("svgToPng", () => {
  it("returns PNG bytes, not SVG", async () => {
    const out = await svgToPng(sampleSvg, 1200);
    expect(Array.from(out.subarray(0, 8))).toEqual(PNG_MAGIC);
    expect(out.toString("utf8", 0, 200)).not.toContain("<svg");
  }, 30000);

  it("renders at the requested Open Graph dimensions", async () => {
    const out = await svgToPng(sampleSvg, 1200);
    expect(out.readUInt32BE(16)).toBe(1200);
    expect(out.readUInt32BE(20)).toBe(630);
  }, 30000);
});

// Next gives each OG route its own copy of rasterize.ts but one shared,
// process-global resvg-wasm; this loads such a copy.
const realResvg = jest.requireActual("@resvg/resvg-wasm");
const loadRouteCopy = (resvg = realResvg) => {
  let mod: typeof import("@/utils/og/rasterize");
  jest.isolateModules(() => {
    jest.doMock("@resvg/resvg-wasm", () => resvg);
    mod = require("@/utils/og/rasterize");
  });
  return mod!;
};

describe("svgToPng memory", () => {
  // resvg-wasm never garbage-collects a Resvg, so every render must free it.
  it("frees the renderer and the rendered image", async () => {
    const freed: string[] = [];
    class TrackedResvg extends realResvg.Resvg {
      free() {
        freed.push("renderer");
        super.free();
      }
      render() {
        const image = super.render();
        const freeImage = image.free.bind(image);
        image.free = () => {
          freed.push("image");
          freeImage();
        };
        return image;
      }
    }

    const route = loadRouteCopy({ ...realResvg, Resvg: TrackedResvg });
    await route.svgToPng(sampleSvg, 1200);

    expect(freed.sort()).toEqual(["image", "renderer"]);
  }, 30000);
});

describe("svgToPng across route bundles", () => {
  it("renders from a second route after the first initialized resvg", async () => {
    const coverRoute = loadRouteCopy();
    const accountRoute = loadRouteCopy();

    await coverRoute.svgToPng(sampleSvg, 1200);
    const out = await accountRoute.svgToPng(sampleSvg, 1200);

    expect(Array.from(out.subarray(0, 8))).toEqual(PNG_MAGIC);
  }, 30000);
});

describe("/api/og/cover route", () => {
  const mockRes = () => {
    const headers: Record<string, string> = {};
    const res: Record<string, unknown> = { headers };
    res.setHeader = (k: string, v: string) => {
      headers[k.toLowerCase()] = v;
    };
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.send = (body: unknown) => {
      res.body = body;
      return res;
    };
    res.end = (body: unknown) => {
      res.body = body;
      return res;
    };
    return res;
  };

  it("responds with a PNG, never an SVG", async () => {
    const handler = (await import("@/pages/api/og/cover")).default;
    const res = mockRes();
    await handler({ query: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect((res.headers as Record<string, string>)["content-type"]).toBe(
      "image/png"
    );
    const body = res.body as Buffer;
    expect(Array.from(body.subarray(0, 8))).toEqual(PNG_MAGIC);
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  }, 30000);
});
