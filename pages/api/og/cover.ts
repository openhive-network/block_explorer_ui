import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { siteConfig, escapeXml } from "@/utils/seo";

// Default Open Graph share image (1200x630) for pages without their own (the
// account card supplies its own via /api/og/account). PNG where sharp is
// available (production), SVG otherwise (local Windows dev). Wired via
// utils/seo defaultOgImage; override with NEXT_PUBLIC_DEFAULT_OG_IMAGE.
const W = 1200;
const H = 630;
const FONT = "Arial, Helvetica, sans-serif";

const logoDataUri = (() => {
  try {
    const p = path.join(process.cwd(), "public", "hive-logo.png");
    return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    return null;
  }
})();

// Donut ring (segments via stroke-dasharray) — the "analytics" cue.
const donut = (cx: number, cy: number, r: number, sw: number): string => {
  const C = 2 * Math.PI * r;
  const segs = [
    { f: 0.4, c: "#E31337" },
    { f: 0.28, c: "#3f97d8" },
    { f: 0.2, c: "#0f9e78" },
    { f: 0.12, c: "#eab308" },
  ];
  let off = 0;
  const rings = segs
    .map((s) => {
      const len = s.f * C;
      const ring = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.c}" stroke-width="${sw}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off += len;
      return ring;
    })
    .join("");
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1e2b48" stroke-width="${sw}"/>${rings}`;
};

const bars = (
  xs: number,
  yb: number,
  bw: number,
  gap: number,
  heights: number[],
  colors: string[]
): string =>
  heights
    .map((h, i) => {
      const x = xs + i * (bw + gap);
      return `<rect x="${x}" y="${yb - h}" width="${bw}" height="${h}" rx="4" fill="${colors[i % colors.length]}"/>`;
    })
    .join("");

const CHIP_FS = 19;
// Auto-size the pill to its text (0.6em/char over-estimate + padding) so the
// label never spills past the rounded border.
const chipWidth = (label: string): number =>
  Math.ceil(label.length * CHIP_FS * 0.6) + 46;
// Sparkline path for the dashboard panel's "network activity" widget.
const panelSpark = (() => {
  const x0 = 748;
  const x1 = 1100;
  const y0 = 566;
  const pts = [22, 40, 34, 56, 48, 70, 62, 84, 76, 68, 82, 66, 92, 84];
  const step = (x1 - x0) / (pts.length - 1);
  return pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${Math.round(x0 + i * step)},${y0 - p}`
    )
    .join(" ");
})();

const chip = (x: number, y: number, label: string): string => {
  const w = chipWidth(label);
  const esc = label.replace(/&/g, "&amp;");
  return `<g><rect x="${x}" y="${y}" width="${w}" height="46" rx="23" fill="#ffffff" fill-opacity="0.04" stroke="#E31337" stroke-opacity="0.5"/><text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" font-family="${FONT}" font-size="${CHIP_FS}" font-weight="600" fill="#e2e8f0">${esc}</text></g>`;
};
// Lay chips out left-to-right, wrapping to the next row past maxX.
const chipRows = (
  x: number,
  y: number,
  labels: string[],
  maxX = 700,
  rowH = 60
): string => {
  let cx = x;
  let cy = y;
  const out: string[] = [];
  for (const l of labels) {
    const w = chipWidth(l);
    if (cx + w > maxX) {
      cx = x;
      cy += rowH;
    }
    out.push(chip(cx, cy, l));
    cx += w + 16;
  }
  return out.join("");
};

const buildSvg =
  (): string => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1120"/>
      <stop offset="1" stop-color="#141f38"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#E31337"/>
      <stop offset="1" stop-color="#ff5b7a"/>
    </linearGradient>
    <linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f97d8" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#3f97d8" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${[210, 320, 430, 540]
    .map(
      (y) =>
        `<line x1="0" y1="${y}" x2="720" y2="${y}" stroke="#ffffff" stroke-opacity="0.04"/>`
    )
    .join("\n  ")}

  <!-- brand -->
  ${
    logoDataUri
      ? `<image href="${logoDataUri}" x="72" y="70" width="64" height="64"/>`
      : ""
  }
  <text x="${logoDataUri ? 150 : 72}" y="105" font-family="${FONT}" font-size="42" font-weight="800" fill="#ffffff">${escapeXml(siteConfig.name)}</text>
  <text x="${logoDataUri ? 152 : 74}" y="132" font-family="${FONT}" font-size="17" font-weight="600" letter-spacing="4" fill="#64748b">HIVE BLOCK EXPLORER</text>

  <rect x="72" y="188" width="92" height="8" rx="4" fill="url(#accent)"/>

  <!-- headline (two lines, fits the left column) -->
  <text x="72" y="270" font-family="${FONT}" font-size="58" font-weight="800" fill="#ffffff">The most powerful</text>
  <text x="72" y="336" font-family="${FONT}" font-size="58" font-weight="800" fill="#ffffff">Hive explorer</text>

  <!-- value prop: the standout angle -->
  <text x="72" y="390" font-family="${FONT}" font-size="27" font-weight="600" fill="#ff7d94">Analytics · Custom Dashboards · Settings</text>
  <text x="72" y="426" font-family="${FONT}" font-size="22" fill="#94a3b8">Simple, powerful — built for everyone</text>

  <!-- feature chips (auto-sized, wrap to a second row) -->
  ${chipRows(72, 470, [
    "Live analytics",
    "Custom dashboards",
    "Export & compare",
    "Dashboard sync",
    "Login",
  ])}

  <!-- analytics dashboard mock (sells the product) -->
  <g>
    <rect x="720" y="140" width="408" height="470" rx="20" fill="#0e1830" stroke="#E31337" stroke-opacity="0.22"/>
    <circle cx="1096" cy="176" r="5" fill="#0f9e78"/>
    <text x="748" y="182" font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="2" fill="#8ea2c0">YOUR DASHBOARD</text>

    <!-- donut widget -->
    ${donut(806, 272, 50, 19)}
    <text x="806" y="280" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="#ffffff">2.6M</text>
    <text x="806" y="348" text-anchor="middle" font-family="${FONT}" font-size="15" letter-spacing="1" fill="#64748b">ACCOUNTS</text>

    <!-- bars widget -->
    <text x="946" y="214" font-family="${FONT}" font-size="14" letter-spacing="1" fill="#64748b">OPS / DAY</text>
    ${bars(946, 322, 26, 16, [50, 92, 40, 108], ["#3f97d8", "#E31337", "#3f97d8", "#0f9e78"])}
    <line x1="946" y1="322" x2="1092" y2="322" stroke="#1e2b48" stroke-width="2"/>

    <!-- sparkline widget -->
    <text x="748" y="418" font-family="${FONT}" font-size="14" letter-spacing="1" fill="#64748b">NETWORK ACTIVITY · 30D</text>
    <path d="${panelSpark} L1100,566 L748,566 Z" fill="url(#sparkArea)"/>
    <path d="${panelSpark}" fill="none" stroke="#3f97d8" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
</svg>`;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const svg = buildSvg();
  res.setHeader(
    "Cache-Control",
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800"
  );
  try {
    const sharp = (await import("sharp")).default;
    const png = await sharp(Buffer.from(svg), { density: 96 })
      .resize(W, H)
      .png()
      .toBuffer();
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(png);
  } catch {
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  }
}
