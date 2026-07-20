export interface AccountCardStat {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  delta?: string;
  deltaUp?: boolean;
}

export interface AccountCardData {
  name: string;
  avatarHref: string;
  reputation: number;
  role: string;
  tenure: string;
  isWitness: boolean;
  badges: string[];
  stats: AccountCardStat[];
  sparkline?: number[];
  brand: string;
  brandLogoHref: string;
  ctaLabel: string;
}

const esc = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const FONT =
  "'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif";

export const ACCOUNT_CARD_WIDTH = 1200;
export const ACCOUNT_CARD_HEIGHT = 630;

const divider = (y: number): string =>
  `<rect x="72" y="${y}" width="${ACCOUNT_CARD_WIDTH - 144}" height="1.5" fill="url(#divider)"/>`;

// Full-width HP sparkline occupying the band where the divider sat, between the
// badges and the stats — it replaces that separator rather than doubling it.
const SPARK_X0 = 72;
const SPARK_W = ACCOUNT_CARD_WIDTH - 144;
const SPARK_Y0 = 344;
const SPARK_H = 28;

const sparkPath = (
  pts: number[]
): { line: string; area: string; end: number[] } => {
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = SPARK_W / (pts.length - 1);
  const coords = pts.map((v, i) => [
    SPARK_X0 + i * step,
    SPARK_Y0 + SPARK_H - ((v - min) / span) * SPARK_H,
  ]);
  const line = coords
    .map((c, i) => `${i ? "L" : "M"}${c[0].toFixed(1)} ${c[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${(SPARK_X0 + SPARK_W).toFixed(1)} ${
    SPARK_Y0 + SPARK_H
  } L${SPARK_X0} ${SPARK_Y0 + SPARK_H} Z`;
  return { line, area, end: coords[coords.length - 1] };
};

export const buildAccountCardSvg = (d: AccountCardData): string => {
  const W = ACCOUNT_CARD_WIDTH;
  const H = ACCOUNT_CARD_HEIGHT;

  let bx = 258;
  const badges = d.badges
    .slice(0, 3)
    .map((b) => {
      const label = esc(b);
      const w = 40 + label.length * 12;
      const g = `
        <g transform="translate(${bx},256)">
          <rect x="0" y="0" width="${w}" height="42" rx="21" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.16)"/>
          <text x="${w / 2}" y="27" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="800" fill="#ffffff">${label}</text>
        </g>`;
      bx += w + 16;
      return g;
    })
    .join("");

  const n = Math.max(1, Math.min(4, d.stats.length));
  const colW = (W - 144) / n;
  const vFont = n >= 4 ? 48 : 56;
  const stats = d.stats
    .slice(0, 4)
    .map((s, i) => {
      const x = 72 + i * colW;
      const sub = s.sub
        ? `<text x="0" y="72" font-family="${FONT}" font-size="18" font-weight="700" fill="${s.accent || "rgba(255,255,255,0.55)"}">${esc(s.sub)}</text>`
        : "";
      const delta = s.delta
        ? `<tspan font-size="${Math.round(vFont * 0.4)}" font-weight="800" dx="10" fill="${s.deltaUp ? "#7dffb0" : "#ff8a8a"}">${esc(s.delta)}</tspan>`
        : "";
      const labelY = s.sub ? 100 : 74;
      return `
        <g transform="translate(${x},400)">
          <text x="0" y="44" font-family="${FONT}" font-size="${vFont}" font-weight="900" fill="#ffffff" letter-spacing="-1">${esc(s.value)}${delta}</text>
          ${sub}
          <text x="0" y="${labelY}" font-family="${FONT}" font-size="17" font-weight="800" letter-spacing="1.2" fill="rgba(255,255,255,0.5)">${esc(s.label.toUpperCase())}</text>
        </g>`;
    })
    .join("");

  const crown = d.isWitness
    ? `<g transform="translate(196,232)">
         <circle cx="0" cy="0" r="27" fill="#E31337" stroke="#0d0f15" stroke-width="5"/>
         <text x="0" y="9" text-anchor="middle" font-family="${FONT}" font-size="26" fill="#ffffff">♛</text>
       </g>`
    : "";

  const spark =
    d.sparkline && d.sparkline.length > 1
      ? (() => {
          const { line, area, end } = sparkPath(d.sparkline);
          return `
    <path d="${area}" fill="url(#spark)"/>
    <path d="${line}" fill="none" stroke="#ffd7a0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="4.5" fill="#ffffff"/>`;
        })()
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="avatarClip"><circle cx="150" cy="190" r="72"/></clipPath>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#15121a"/>
      <stop offset="100%" stop-color="#0b0d13"/>
    </linearGradient>
    <radialGradient id="glow" cx="96%" cy="22%" r="95%">
      <stop offset="0%" stop-color="#8a1a3a" stop-opacity="1"/>
      <stop offset="42%" stop-color="#5c1128" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#5c1128" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff6ec4"/>
      <stop offset="100%" stop-color="#7873f5"/>
    </linearGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffd7a0" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffd7a0" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffd7a0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffd7a0" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffd7a0" stop-opacity="0"/>
    </linearGradient>
    <filter id="gray">
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="cardClip"><rect width="${W}" height="${H}" rx="32"/></clipPath>
  </defs>

  <g clip-path="url(#cardClip)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <image href="${esc(d.brandLogoHref)}" x="${W - 300}" y="${H - 300}" width="340" height="340" opacity="0.18" filter="url(#gray)" preserveAspectRatio="xMidYMid meet"/>

  <g font-family="${FONT}">
    <image href="${esc(d.brandLogoHref)}" x="64" y="56" width="40" height="40" preserveAspectRatio="xMidYMid meet"/>
    <text x="118" y="86" font-size="24" font-weight="800" letter-spacing="3" fill="#ffffff">${esc(d.brand.toUpperCase())}</text>
    <text x="${W - 72}" y="86" text-anchor="end" font-size="21" font-weight="700" letter-spacing="2" fill="rgba(255,255,255,0.5)">${esc(d.tenure.toUpperCase())}</text>
  </g>

  <circle cx="150" cy="190" r="79" fill="url(#ring)"/>
  <circle cx="150" cy="190" r="74" fill="#0d0f15"/>
  ${
    d.avatarHref
      ? `<image href="${esc(d.avatarHref)}" x="78" y="118" width="144" height="144" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
      : `<circle cx="150" cy="190" r="72" fill="url(#ring)" opacity="0.25"/><text x="150" y="212" text-anchor="middle" font-family="${FONT}" font-size="66" font-weight="900" fill="#ffffff">${esc(
          d.name.replace(/^@/, "").slice(0, 2).toUpperCase()
        )}</text>`
  }
  ${crown}

  <g font-family="${FONT}">
    <text x="260" y="180" font-size="58" font-weight="900" letter-spacing="-2" fill="#ffffff">@${esc(d.name)}<tspan font-size="27" font-weight="800" letter-spacing="0" fill="#ffd7a0" dx="18">rep ${d.reputation} ★</tspan></text>
    <text x="262" y="228" font-size="26" font-weight="600" fill="rgba(255,255,255,0.72)">${esc(d.role)}</text>
  </g>
  ${badges}

  ${spark || divider(354)}
  ${stats}
  ${divider(524)}

  <text x="72" y="594" font-family="${FONT}" font-size="17" font-weight="700" fill="rgba(255,255,255,0.45)">${esc(d.brand)}</text>
  <text x="${W - 72}" y="594" text-anchor="end" font-family="${FONT}" font-size="22" font-weight="800" fill="rgba(255,255,255,0.92)">${esc(d.ctaLabel)}</text>
  </g>
</svg>`;
};
