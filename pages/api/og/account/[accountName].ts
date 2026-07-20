import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  buildAccountCardSvg,
  ACCOUNT_CARD_WIDTH,
  ACCOUNT_CARD_HEIGHT,
} from "@/components/account/accountCard/accountCardSvg";

const NODE =
  process.env.REACT_APP_API_ADDRESS ||
  process.env.API_ADDRESS ||
  "https://api.hive.blog";

const INACTIVE_WITNESS_KEY = "STM1111111111111111111111111111111114T1Anm";

const rpc = async (method: string, params: unknown): Promise<any> => {
  const res = await fetch(NODE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const json = await res.json();
  return json.result;
};

// Raw reputation (a large signed integer) -> the familiar 25..75+ display value.
const formatReputation = (raw: string | number): number => {
  const rep = typeof raw === "string" ? Number(raw) : raw;
  if (!rep) return 25;
  if (Math.abs(rep) < 1e7) return Math.floor(rep); // already a display value
  const neg = rep < 0;
  let out = Math.max(Math.log10(Math.abs(rep)) - 9, 0);
  out = (neg ? -1 : 1) * out * 9 + 25;
  return Math.floor(out);
};

const compact = (n: number): string =>
  Math.abs(n) >= 1000
    ? n.toLocaleString("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      })
    : String(Math.round(n));

const toDataUri = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type") || "image/png";
  return `data:${type};base64,${buf.toString("base64")}`;
};

// The brand logo is bundled and never changes at runtime; read it once and
// reuse the data URI across requests instead of hitting the disk every time.
let cachedLogoHref: string | null = null;
const getLogoHref = (): string => {
  if (cachedLogoHref === null) {
    cachedLogoHref = `data:image/png;base64,${fs
      .readFileSync(path.join(process.cwd(), "public/hive-logo.png"))
      .toString("base64")}`;
  }
  return cachedLogoHref;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountName = String(req.query.accountName || "").replace(/^@/, "");
  if (!accountName) {
    res.status(400).end("Missing account");
    return;
  }

  try {
    const [accounts, props, followCount, witness] = await Promise.all([
      rpc("condenser_api.get_accounts", [[accountName]]),
      rpc("condenser_api.get_dynamic_global_properties", []),
      rpc("condenser_api.get_follow_count", [accountName]).catch(() => null),
      rpc("condenser_api.get_witness_by_account", [accountName]).catch(
        () => null
      ),
    ]);

    const acc = accounts?.[0];
    if (!acc) {
      res.status(404).end("Account not found");
      return;
    }

    const totalFund = parseFloat(props.total_vesting_fund_hive);
    const totalShares = parseFloat(props.total_vesting_shares);
    const toHp = (v: string): number =>
      totalShares > 0 ? (parseFloat(v) * totalFund) / totalShares : 0;
    const hp =
      toHp(acc.vesting_shares) +
      toHp(acc.received_vesting_shares) -
      toHp(acc.delegated_vesting_shares);

    const activeWitness = witness?.signing_key
      ? witness.signing_key !== INACTIVE_WITNESS_KEY
      : false;

    const created = new Date(`${acc.created}Z`);
    const monthYear = created.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const years = Math.max(
      0,
      Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 3600 * 1000))
    );
    const followers = Number(followCount?.follower_count) || 0;
    const posts = Number(acc.post_count) || 0;

    const logoHref = getLogoHref();
    let avatarHref = "";
    try {
      avatarHref = await toDataUri(
        `https://images.hive.blog/u/${accountName}/avatar`
      );
    } catch {
      avatarHref = "";
    }

    const svg = buildAccountCardSvg({
      name: accountName,
      avatarHref,
      reputation: formatReputation(acc.reputation),
      role: [activeWitness ? "Witness" : null, `joined ${monthYear}`]
        .filter(Boolean)
        .join(" · "),
      tenure: `${years} years on Hive`,
      isWitness: activeWitness,
      badges: [
        activeWitness ? "♛ Witness" : null,
        `✍ ${compact(posts)} posts`,
      ].filter(Boolean) as string[],
      stats: [
        { label: "Hive Power", value: compact(hp), accent: "#7dffb0" },
        { label: "Followers", value: compact(followers) },
        { label: "Posts", value: compact(posts) },
      ],
      brand: "hivescan.info",
      brandLogoHref: logoHref,
      ctaLabel: "view full profile →",
    });

    res.setHeader(
      "Cache-Control",
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400"
    );

    try {
      const sharp = (await import("sharp")).default;
      const png = await sharp(Buffer.from(svg), { density: 96 })
        .resize(ACCOUNT_CARD_WIDTH, ACCOUNT_CARD_HEIGHT)
        .png()
        .toBuffer();
      res.setHeader("Content-Type", "image/png");
      res.status(200).send(png);
    } catch {
      // sharp unavailable (e.g. local Windows dev) — serve the SVG so the card
      // is still viewable; production has sharp and returns a PNG.
      res.setHeader("Content-Type", "image/svg+xml");
      res.status(200).send(svg);
    }
  } catch {
    res.status(500).end("Failed to render card");
  }
}
