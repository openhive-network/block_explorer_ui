import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { config } from "@/Config";
import en from "@/i18n/en.json";
import {
  buildAccountCardSvg,
  ACCOUNT_CARD_WIDTH,
  ACCOUNT_CARD_HEIGHT,
} from "@/components/account/accountCard/accountCardSvg";
import { buildAccountCardData } from "@/components/account/accountCard/accountCardData";

const RPC = config.nodeAddress;
const REST = config.apiAddress.replace(/\/+$/, "");

// A slow node/gateway must not hang the handler until the platform timeout —
// every outbound fetch is bounded by an AbortController.
const FETCH_TIMEOUT_MS = 4000;
const fetchWithTimeout = async (
  url: string,
  opts: RequestInit = {}
): Promise<Response> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
};

// The crawler-facing image is always English; resolve the same accountShareCard
// keys the in-app card uses from en.json so labels stay in sync.
const t = (key: string, opts?: Record<string, unknown>): string => {
  let s = (en as Record<string, string>)[key] ?? key;
  if (opts) {
    for (const [k, v] of Object.entries(opts)) {
      s = s.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
    }
  }
  return s;
};

const rpc = async (method: string, params: unknown): Promise<any> => {
  const res = await fetchWithTimeout(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const json = await res.json();
  return json.result;
};

const restGet = async (route: string): Promise<any> => {
  const res = await fetchWithTimeout(`${REST}${route}`);
  if (!res.ok) throw new Error(`REST ${res.status} for ${route}`);
  return res.json();
};

// Raw reputation (a large signed integer) -> the familiar 25..75+ display value.
// hafbe already returns the display value; condenser returns the raw form.
const formatReputation = (raw: string | number): number => {
  const rep = typeof raw === "string" ? Number(raw) : raw;
  if (!rep) return 25;
  if (Math.abs(rep) < 1e7) return Math.floor(rep); // already a display value
  const neg = rep < 0;
  let out = Math.max(Math.log10(Math.abs(rep)) - 9, 0);
  out = (neg ? -1 : 1) * out * 9 + 25;
  return Math.floor(out);
};

const toDataUri = async (url: string): Promise<string> => {
  const res = await fetchWithTimeout(url);
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

// VESTS balance series (newest-first) -> { trend %, sparkline oldest->newest }.
const deriveVestsSeries = (
  rows: { balance?: { balance?: string } }[] | undefined
): { hpTrend?: number; sparkline?: number[] } => {
  if (!rows?.length) return {};
  const nums = rows.map((r) => Number(r?.balance?.balance));
  let hpTrend: number | undefined;
  if (rows.length >= 2) {
    const current = nums[0];
    const past = nums[nums.length - 1];
    if (isFinite(current) && isFinite(past) && past > 0) {
      const pct = ((current - past) / past) * 100;
      if (isFinite(pct)) hpTrend = pct;
    }
  }
  const pts = nums.filter((v) => isFinite(v) && v > 0).reverse();
  return { hpTrend, sparkline: pts.length >= 2 ? pts : undefined };
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
    // Reliable core over JSON-RPC.
    const [accounts, props, followCount, priceFeed] = await Promise.all([
      rpc("condenser_api.get_accounts", [[accountName]]),
      rpc("condenser_api.get_dynamic_global_properties", []),
      rpc("condenser_api.get_follow_count", [accountName]).catch(() => null),
      rpc("condenser_api.get_current_median_history_price", []).catch(
        () => null
      ),
    ]);

    const acc = accounts?.[0];
    if (!acc) {
      res.status(404).end("Account not found");
      return;
    }

    const num = (v: unknown): number => parseFloat(String(v ?? "0")) || 0;
    const totalFund = parseFloat(props.total_vesting_fund_hive);
    const totalShares = parseFloat(props.total_vesting_shares);
    const toHp = (v: string | number): number =>
      totalShares > 0 ? (num(v) * totalFund) / totalShares : 0;
    // Net effective HP (own + received - delegated) — the headline HP stat.
    const hp =
      toHp(acc.vesting_shares) +
      toHp(acc.received_vesting_shares) -
      toHp(acc.delegated_vesting_shares);

    const followers = Number(followCount?.follower_count) || 0;
    const posts = Number(acc.post_count) || 0;
    const created = new Date(`${acc.created}Z`);

    // Account value in HBD (≈USD), matching the wallet exactly: every balance
    // component valued at the median feed (delegated/received HP excluded). The
    // base (HBD + HIVE + own HP + rewards) comes from get_accounts; the extras
    // (open orders, escrow, pending conversions/savings) come from balance-api —
    // the same source the wallet folds in.
    const hivePriceHbd =
      priceFeed && num(priceFeed.quote) > 0
        ? num(priceFeed.base) / num(priceFeed.quote)
        : 0;
    let accountValue: number | undefined;
    if (hivePriceHbd > 0) {
      const hbdSide =
        num(acc.hbd_balance) +
        num(acc.savings_hbd_balance) +
        num(acc.reward_hbd_balance);
      const hiveSide =
        num(acc.balance) +
        num(acc.savings_balance) +
        num(acc.reward_hive_balance) +
        num(acc.reward_vesting_hive) +
        toHp(acc.vesting_shares) +
        toHp(acc.vesting_withdraw_rate);
      let v = hbdSide + hiveSide * hivePriceHbd;

      // balance-api extras (raw amounts, precision 3 -> /1000). Same components
      // the wallet adds; savings-pending is taken as an absolute amount.
      try {
        const b = await restGet(
          `/balance-api/accounts/${encodeURIComponent(accountName)}/balances`
        );
        if (b) {
          const H = (raw: unknown) => num(raw) / 1000;
          const extraHbd =
            H(b.open_orders_hbd_amount) +
            H(b.conversion_pending_amount_hbd) +
            Math.abs(H(b.savings_pending_amount_hbd)) +
            H(b.escrow_pending_amount_hbd);
          const extraHive =
            H(b.open_orders_hive_amount) +
            H(b.conversion_pending_amount_hive) +
            Math.abs(H(b.savings_pending_amount_hive)) +
            H(b.escrow_pending_amount_hive);
          v += extraHbd + extraHive * hivePriceHbd;
        }
      } catch {
        /* extras unavailable — value falls back to the base components */
      }

      if (v > 0) accountValue = v;
    }

    // Overlays from the HAF REST stack — the same sources the in-app card reads,
    // so the shared image matches the preview. Each degrades independently: on
    // failure the field is simply omitted and the reliable core still renders.

    // 1) Real reputation. condenser returns 0 on the HAF stack (rep moved to
    //    hivemind) -> would fall to the default 25; hafbe returns the true value.
    let reputation = formatReputation(acc.reputation);
    try {
      const hafAcc = await restGet(
        `/hafbe-api/accounts/${encodeURIComponent(accountName)}`
      );
      if (hafAcc?.reputation != null) {
        reputation = formatReputation(hafAcc.reputation);
      }
    } catch {
      /* keep condenser reputation */
    }

    // 2) Witness identity + rank + voters + vote weight (active = non-null key).
    let isWitness = false;
    let witnessRank: number | null = null;
    let voters = 0;
    let voteWeightHp: number | undefined;
    try {
      const w = await restGet(
        `/hafbe-api/witnesses/${encodeURIComponent(accountName)}`
      );
      if (w?.signing_key && w.signing_key !== config.inactiveWitnessKey) {
        isWitness = true;
        witnessRank = Number(w.rank) || null;
        voters = Number(w.voters_num) || 0;
        if (w.vests) voteWeightHp = toHp(w.vests) || undefined;
      }
    } catch {
      /* not a witness / hafbe witness unavailable */
    }

    // 3) HP trend + sparkline from the VESTS balance history (last ~13 months).
    let hpTrend: number | undefined;
    let sparkline: number[] | undefined;
    try {
      const from = new Date();
      from.setUTCMonth(from.getUTCMonth() - 13);
      const hist = await restGet(
        `/balance-api/accounts/${encodeURIComponent(
          accountName
        )}/aggregated-history?coin-type=VESTS&granularity=monthly&direction=desc&from-block=${from.toISOString()}`
      );
      const rows = Array.isArray(hist) ? hist : hist?.aggregated_history;
      ({ hpTrend, sparkline } = deriveVestsSeries(rows));
    } catch {
      /* no trend/sparkline */
    }

    // 4) Earned HP over the last year — sum of incoming reward vests (author +
    //    curation), matching the in-app card. haf-stats-api endpoint.
    let earnedHp: number | undefined;
    try {
      const from = new Date();
      from.setUTCFullYear(from.getUTCFullYear() - 1);
      const fin = await restGet(
        `/haf-stats-api/accounts/${encodeURIComponent(
          accountName
        )}/financial-summary?from-date=${from.toISOString()}&granularity=month`
      );
      const rows: {
        category?: string;
        direction?: string;
        vests_nai?: number;
      }[] = Array.isArray(fin) ? fin : fin?.financial_summary;
      if (rows?.length) {
        let vests = 0;
        rows.forEach((r) => {
          if (
            r.direction === "incoming" &&
            String(r.category).includes("reward") &&
            r.category !== "claim_reward_balance_operation"
          ) {
            vests += Number(r.vests_nai) || 0;
          }
        });
        const val = toHp(vests / 1e6);
        if (val > 0) earnedHp = val;
      }
    } catch {
      /* no earned figure */
    }

    let avatarHref = "";
    try {
      avatarHref = await toDataUri(
        `https://images.hive.blog/u/${acc.name}/avatar`
      );
    } catch {
      avatarHref = "";
    }

    const cardData = buildAccountCardData(
      {
        accountName,
        avatarHref,
        brandLogoHref: getLogoHref(),
        reputation,
        hp,
        accountValue,
        followers,
        posts,
        earnedHp,
        isWitness,
        witnessRank,
        voteWeightHp,
        voters,
        created,
        hpTrend,
        sparkline,
      },
      t,
      "en-US"
    );

    const svg = buildAccountCardSvg(cardData);

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
