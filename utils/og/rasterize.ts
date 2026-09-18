import fs from "fs";
import path from "path";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

// Platforms reject SVG og:image, so cards are always rasterized. resvg runs as
// WebAssembly, so it behaves the same in dev and in the Alpine standalone image.

const FONT_FAMILY = "DejaVu Sans";

// A plain path, not require.resolve, which webpack would try to bundle and fail.
// outputFileTracingIncludes in next.config.js ships the file in standalone builds.
const wasmPath = (): string =>
  path.join(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm");

// The font is bundled rather than taken from the host so the card renders the
// same everywhere; DejaVu Sans covers the Latin text plus ★ (U+2605) and → (U+2192).
const fontPath = (): string =>
  path.join(process.cwd(), "public/fonts/DejaVuSans.ttf");

let fontBuffer: Buffer | null = null;

// initWasm is process-global and throws if called twice, but Next bundles each
// route with its own copy of this module, so the init is shared via globalThis.
const g = globalThis as unknown as { __ogResvgReady?: Promise<void> | null };

const ensureReady = async (): Promise<void> => {
  if (!g.__ogResvgReady) {
    g.__ogResvgReady = initWasm(fs.readFileSync(wasmPath())).catch((error) => {
      if (String(error?.message ?? error).includes("Already initialized")) {
        return;
      }
      g.__ogResvgReady = null;
      throw error;
    });
  }
  await g.__ogResvgReady;
  if (!fontBuffer) fontBuffer = fs.readFileSync(fontPath());
};

export const svgToPng = async (svg: string, width: number): Promise<Buffer> => {
  await ensureReady();
  const renderer = new Resvg(svg, {
    font: {
      fontBuffers: [fontBuffer as Buffer],
      defaultFontFamily: FONT_FAMILY,
      loadSystemFonts: false,
    },
    fitTo: { mode: "width", value: width },
  });
  // resvg-wasm never garbage-collects a Resvg, so its wasm memory is freed here.
  try {
    const image = renderer.render();
    try {
      return Buffer.from(image.asPng());
    } finally {
      image.free();
    }
  } finally {
    renderer.free();
  }
};

// Last-resort raster so a rasterizer failure still yields a card rather than an
// SVG no platform will render.
export const fallbackPng = (): Buffer | null => {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public/og/fallback.png"));
  } catch {
    return null;
  }
};
