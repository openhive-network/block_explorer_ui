import fs from "fs";
import path from "path";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

// Social platforms (X, Telegram, Discord, Facebook, LinkedIn) reject SVG for
// og:image, so the share cards must always be delivered as raster. resvg runs
// as WebAssembly rather than a native binding, so it behaves identically in
// local dev and in the Alpine standalone image.

const FONT_FAMILY = "DejaVu Sans";

// public/ is copied wholesale into the standalone bundle (copy:public), so the
// build-time copy there is the one that reliably survives into the container;
// the node_modules lookups cover `next dev`.
const wasmPath = (): string => {
  const candidates = [
    () => path.join(process.cwd(), "public/og/resvg.wasm"),
    () => require.resolve("@resvg/resvg-wasm/index_bg.wasm"),
    () =>
      path.join(
        path.dirname(require.resolve("@resvg/resvg-wasm")),
        "index_bg.wasm"
      ),
    () =>
      path.join(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm"),
  ];
  for (const resolve of candidates) {
    try {
      const resolved = resolve();
      if (fs.existsSync(resolved)) return resolved;
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error("resvg wasm binary not found");
};

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
