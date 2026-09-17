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
let wasmReady: Promise<void> | null = null;

const ensureReady = async (): Promise<void> => {
  if (!wasmReady) {
    wasmReady = initWasm(fs.readFileSync(wasmPath())).catch((error) => {
      wasmReady = null;
      throw error;
    });
  }
  await wasmReady;
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
  return Buffer.from(renderer.render().asPng());
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
