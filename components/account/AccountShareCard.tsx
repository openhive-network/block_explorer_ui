import React, { useMemo, useState } from "react";
import { Download, Link2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/i18n/i18n";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import useAccountTopHolderRank from "@/hooks/api/common/useAccountTopHolderRank";
import useFinancialSummary from "@/hooks/api/accountPage/useFinancialSummary";
import { convertVestsToHP, getVestsToHiveRatio } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { getImageSrc } from "@/utils/PathUtils";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import {
  buildAccountCardSvg,
  AccountCardData,
  ACCOUNT_CARD_WIDTH,
  ACCOUNT_CARD_HEIGHT,
} from "@/components/account/accountCard/accountCardSvg";

interface Props {
  accountName: string;
  accountDetails: Explorer.FormattedAccountDetails;
}

const compact = (n: number, locale: string) =>
  Math.abs(n) >= 1000
    ? n.toLocaleString(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
      })
    : n.toLocaleString(locale, { maximumFractionDigits: 0 });

// Parse an integer VESTS balance string to BigInt (drops any fractional part);
// returns null for empty/non-numeric values.
const toBigInt = (s?: string): bigint | null => {
  if (!s) return null;
  const intPart = String(s).trim().split(".")[0];
  if (!/^-?\d+$/.test(intPart)) return null;
  try {
    return BigInt(intPart);
  } catch {
    return null;
  }
};

const AccountShareCard: React.FC<Props> = ({ accountName, accountDetails }) => {
  const { t, locale } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const from1y = useMemo(() => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 1);
    return d.toISOString();
  }, []);
  const from13mo = useMemo(() => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - 13);
    return d;
  }, []);

  const { data: rawAccount } = useQuery({
    queryKey: ["share_card_account", accountName],
    queryFn: () => fetchingService.getAccount(accountName),
    enabled: !!accountName,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { witnessDetails } = useWitnessDetails(
    accountName,
    !!accountDetails.is_witness
  );
  const { entries: topHolderEntries } = useAccountTopHolderRank(accountName);
  const { data: finRows } = useFinancialSummary(
    accountName,
    from1y,
    undefined,
    "month"
  );
  const { data: vestsHistory } = useQuery({
    queryKey: ["share_card_vests_hist", accountName],
    queryFn: () =>
      fetchingService.geAccountAggregatedtBalanceHistory(
        accountName,
        "VESTS",
        "monthly",
        "desc",
        from13mo,
        undefined
      ),
    enabled: !!accountName,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const g = dynamicGlobalData?.headBlockDetails;
  const canConvert =
    !!hiveChain && !!g?.rawTotalVestingShares && !!g?.rawTotalVestingFundHive;
  const toHp = useMemo(() => {
    if (!canConvert) return null;
    return (vests: string): number => {
      const s = convertVestsToHP(
        hiveChain!,
        vests,
        g!.rawTotalVestingFundHive,
        g!.rawTotalVestingShares
      );
      return s ? grabNumericValue(s) : 0;
    };
  }, [canConvert, hiveChain, g]);

  const hp = useMemo(() => {
    if (!rawAccount || !toHp) return 0;
    try {
      return (
        toHp(rawAccount.vesting_shares) +
        toHp(rawAccount.received_vesting_shares) -
        toHp(rawAccount.delegated_vesting_shares)
      );
    } catch {
      return 0;
    }
  }, [rawAccount, toHp]);

  const hpPerVest = useMemo(() => {
    const r = dynamicGlobalData
      ? Number(
          getVestsToHiveRatio(dynamicGlobalData as Explorer.HeadBlockCardData)
        )
      : 0;
    return r > 0 ? 1 / r : 0;
  }, [dynamicGlobalData]);

  const earnedHp = useMemo(() => {
    if (!finRows?.length || hpPerVest <= 0) return undefined;
    let vests = 0;
    finRows.forEach((r) => {
      if (
        r.direction === "incoming" &&
        r.category.includes("reward") &&
        r.category !== "claim_reward_balance_operation"
      ) {
        vests += Number(r.vests_nai) || 0;
      }
    });
    const value = (vests / 1e6) * hpPerVest;
    return value > 0 ? value : undefined;
  }, [finRows, hpPerVest]);

  const voteWeightHp = useMemo(() => {
    if (!witnessDetails?.vests || !toHp) return undefined;
    try {
      const v = toHp(witnessDetails.vests);
      return v > 0 ? v : undefined;
    } catch {
      return undefined;
    }
  }, [witnessDetails, toHp]);

  const accountValue = useMemo(
    () =>
      grabNumericValue(String(accountDetails.dollars?.account_value ?? "0")),
    [accountDetails]
  );

  // Year-over-year HP trend from the account's VESTS balance history (now vs
  // ~12 months ago). % change in own stake — a growth signal.
  const hpTrend = useMemo(() => {
    const arr = vestsHistory as unknown as
      | { balance?: { balance?: string } }[]
      | undefined;
    if (!arr?.length || arr.length < 2) return undefined;
    const current = toBigInt(arr[0]?.balance?.balance);
    const past = toBigInt(arr[arr.length - 1]?.balance?.balance);
    if (current === null || past === null || past <= BigInt(0))
      return undefined;
    // Percentage from a BigInt delta so whale-sized VESTS balances (> 2^53)
    // don't lose integer precision before the ratio is taken.
    const pct = (Number(current - past) / Number(past)) * 100;
    return isFinite(pct) ? pct : undefined;
  }, [vestsHistory]);

  // HP-over-12-months line for the card sparkline, from the same VESTS balance
  // series (API returns newest-first, so reverse to oldest→newest).
  const sparkline = useMemo(() => {
    const arr = vestsHistory as unknown as
      | { balance?: { balance?: string } }[]
      | undefined;
    if (!arr?.length) return undefined;
    const pts = arr
      .map((r) => Number(r?.balance?.balance))
      .filter((v) => isFinite(v) && v > 0)
      .reverse();
    return pts.length >= 2 ? pts : undefined;
  }, [vestsHistory]);

  const cardData: AccountCardData = useMemo(() => {
    const created = accountDetails.created
      ? new Date(accountDetails.created)
      : null;
    const monthYear = created
      ? created.toLocaleString(locale, { month: "long", year: "numeric" })
      : null;
    const years = created
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - created.getTime()) / (365.25 * 24 * 3600 * 1000)
          )
        )
      : null;

    // Only treat as a witness if the witness is active (a deactivated witness
    // uses the null signing key); otherwise present as a regular account.
    const isWit =
      !!accountDetails.is_witness &&
      !!witnessDetails &&
      witnessDetails.signing_key !== config.inactiveWitnessKey;
    const followers = Number(accountDetails.follower_count) || 0;
    const posts = Number(accountDetails.post_count) || 0;
    const voters = witnessDetails?.voters_num ?? 0;

    const rolePieces = [
      isWit ? t("accountShareCard.witness") : null,
      monthYear ? t("accountShareCard.joined", { date: monthYear }) : null,
    ].filter(Boolean) as string[];

    const witnessRank =
      isWit && witnessDetails?.rank ? witnessDetails.rank : null;
    const stakeRank = topHolderEntries?.find(
      (e) => e.coinType === "VESTS"
    )?.rank;

    const badges = [
      witnessRank
        ? `♛ ${t("accountShareCard.topWitness", { rank: witnessRank })}`
        : isWit
          ? `♛ ${t("accountShareCard.witness")}`
          : null,
      stakeRank
        ? `◆ ${t("accountShareCard.stakeRank", { rank: stakeRank })}`
        : null,
      `✍ ${compact(posts, locale)} ${t("accountShareCard.posts")}`,
    ].filter(Boolean) as string[];

    const hpStat = {
      label: t("accountShareCard.hivePower"),
      value: compact(Math.round(hp), locale),
      accent: "#7dffb0",
      ...(sparkline ? { spark: sparkline } : {}),
      ...(hpTrend !== undefined && Math.abs(hpTrend) >= 0.5
        ? {
            delta: `${hpTrend >= 0 ? "▲" : "▼"}${Math.abs(hpTrend).toFixed(0)}%`,
            deltaUp: hpTrend >= 0,
          }
        : {}),
    };
    const valueStat =
      accountValue > 0
        ? {
            label: t("accountShareCard.accountValue"),
            value: `$${compact(accountValue, locale)}`,
          }
        : null;
    const followersStat = {
      label: t("accountShareCard.followers"),
      value: compact(followers, locale),
    };
    const earnedStat = earnedHp
      ? {
          label: t("accountShareCard.earned"),
          value: compact(earnedHp, locale),
          sub: t("accountShareCard.authorCuration"),
        }
      : null;

    let stats: (AccountCardData["stats"][number] | null)[];
    if (isWit) {
      // Witness-focused: HP, vote weight, voters, then value/earned.
      stats = [
        hpStat,
        voteWeightHp
          ? {
              label: `${t("accountShareCard.voteWeight")} (${t(
                "accountShareCard.hp"
              )})`,
              value: compact(Math.round(voteWeightHp), locale),
            }
          : null,
        {
          label: t("accountShareCard.witnessVoters"),
          value: compact(voters, locale),
        },
        valueStat ?? earnedStat ?? followersStat,
      ];
    } else {
      stats = [hpStat, valueStat, followersStat, earnedStat];
    }

    return {
      name: accountName,
      avatarHref: getHiveAvatarUrl(accountName),
      reputation: Math.round(Number(accountDetails.reputation) || 0),
      role: rolePieces.join(" · "),
      tenure: years !== null ? t("accountShareCard.tenure", { years }) : "",
      isWitness: isWit,
      badges,
      stats: stats.filter(Boolean).slice(0, 4) as AccountCardData["stats"],
      brand: "hivescan.info",
      brandLogoHref: getImageSrc("/hive-logo.png"),
      ctaLabel: t("accountShareCard.cta"),
    };
  }, [
    accountName,
    accountDetails,
    hp,
    hpTrend,
    sparkline,
    accountValue,
    earnedHp,
    voteWeightHp,
    witnessDetails,
    topHolderEntries,
    t,
    locale,
  ]);

  const svg = useMemo(() => buildAccountCardSvg(cardData), [cardData]);
  const svgDataUri = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    [svg]
  );

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  // Best-effort: embed the avatar as a data URI so the rasterised PNG is
  // self-contained; fall back to the initials placeholder if it can't be fetched.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      let avatarHref = "";
      try {
        const res = await fetch(cardData.avatarHref, { mode: "cors" });
        const blob = await res.blob();
        avatarHref = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } catch {
        avatarHref = "";
      }

      const pngSvg = buildAccountCardSvg({ ...cardData, avatarHref });
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pngSvg)}`;
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = ACCOUNT_CARD_WIDTH;
      canvas.height = ACCOUNT_CARD_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, ACCOUNT_CARD_WIDTH, ACCOUNT_CARD_HEIGHT);
      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = `hivescan-${accountName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      /* rasterisation failed */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <a
        href={shareUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        title={t("accountShareCard.cta")}
        className="block w-full cursor-pointer overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-lg [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {t("accountShareCard.download")}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold dark:border-gray-600"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {copied
            ? t("accountShareCard.copied")
            : t("accountShareCard.copyLink")}
        </button>
        <a
          href={svgDataUri}
          download={`hivescan-${accountName}.svg`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold dark:border-gray-600"
        >
          SVG
        </a>
      </div>
    </div>
  );
};

export default AccountShareCard;
