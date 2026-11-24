import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Gauge, Landmark, Loader2, Search, ThumbsUp } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isHiveAccountName, trimAccountName } from "@/utils/StringUtils";
import { rsharesToHbd, upvoteRshares } from "@/utils/voteValue";
import useVotingPower from "@/hooks/api/common/useVotingPower";

const DEFAULT_WEIGHT = 100;
// Wait for the slider to settle before rewriting the URL.
const URL_DELAY_MS = 400;

// Account names are lower case on chain; a pasted "Alice" means alice.
const accountName = (raw: string) => trimAccountName(raw).toLowerCase();

const weightFromQuery = (raw: unknown): number => {
  const n = Math.round(Number(raw));
  return n >= 1 && n <= 100 ? n : DEFAULT_WEIGHT;
};

// Numbers with units stay left-to-right inside an Arabic sentence.
const ltr = (text: string) => `⁦${text}⁩`;

const VotingPowerTool: React.FC = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const queryAccount =
    typeof router.query.account === "string"
      ? accountName(router.query.account)
      : "";
  // The address's account and weight, to tell a new link from our own writes.
  const queryKey = `${queryAccount}|${router.query.weight ?? ""}`;
  const [input, setInput] = useState(queryAccount);
  const [account, setAccount] = useState(queryAccount);
  const [weight, setWeight] = useState(() =>
    weightFromQuery(router.query.weight)
  );

  // A shared link, or the tab link, sets the account after the first render.
  // The URL effect below writes the same values, so this also runs once its
  // replace lands, without changing anything.
  const [syncedKey, setSyncedKey] = useState(queryKey);
  if (queryKey !== syncedKey) {
    setSyncedKey(queryKey);
    setInput(queryAccount);
    setAccount(queryAccount);
    setWeight(weightFromQuery(router.query.weight));
  }

  // Keep the address shareable: ?account=…&weight=… (weight only when not 100).
  useEffect(() => {
    if (!router.isReady) return;
    const timer = setTimeout(() => {
      const query: Record<string, string> = {};
      if (account) query.account = account;
      if (account && weight !== DEFAULT_WEIGHT) query.weight = String(weight);
      const current = router.query;
      if (
        (current.account ?? "") === (query.account ?? "") &&
        (current.weight ?? "") === (query.weight ?? "")
      )
        return;
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    }, URL_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, weight, router.isReady]);

  const {
    governance,
    mana,
    rates,
    isLoading,
    isError,
    account: found,
  } = useVotingPower(account);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccount(accountName(input));
  };
  const invalid = !!account && !isHiveAccountName(account);

  const amount = (value: number, unit: string) =>
    ltr(
      `${value.toLocaleString(locale, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })} ${unit}`
    );
  const hp = (value: number) => amount(value, "HP");
  // A value in HBD at the median price, not necessarily paid in HBD.
  const hbd = (value: number) =>
    value > 0 && value < 0.001
      ? ltr(`< ${(0.001).toLocaleString(locale)} HBD`)
      : `≈ ${amount(value, "HBD")}`;
  const percent = (value: number) =>
    `${value.toLocaleString(locale, { maximumFractionDigits: 2 })}%`;
  const date = (value: Date) =>
    value.toLocaleDateString(locale, { dateStyle: "medium", timeZone: "UTC" });

  // The vote at the slider's weight, from a given amount of mana.
  const worth = (fromMana: bigint) =>
    rates
      ? rsharesToHbd(
          upvoteRshares(fromMana, weight, rates.votePowerReserveRate),
          rates
        )
      : 0;
  const now = mana ? worth(mana.current) : 0;
  const full = mana ? worth(mana.max) : 0;

  return (
    <div className="w-full space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <Gauge className="h-5 w-5 text-indigo-500" />
          {t("tools.votingPower.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("tools.votingPower.subtitle")}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700"
      >
        <label
          htmlFor="voting-power-account"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {t("tools.votingPower.lookupLabel")}
        </label>
        <div className="flex gap-2">
          <div className="flex grow items-center gap-2 rounded-lg border border-slate-300 bg-theme px-2 focus-within:ring-2 focus-within:ring-indigo-400 dark:border-slate-600">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <Input
              id="voting-power-account"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("tools.votingPower.lookupPlaceholder")}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button type="submit" disabled={!trimAccountName(input)}>
            {t("tools.votingPower.lookupButton")}
          </Button>
        </div>
      </form>

      {account && invalid && (
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {t("tools.votingPower.invalid")}
        </p>
      )}
      {account && !invalid && isLoading && (
        <div className="flex justify-center py-8" role="status">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="sr-only">{t("tools.votingPower.loading")}</span>
        </div>
      )}
      {account && !invalid && !isLoading && isError && (
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {t("tools.votingPower.loadError")}
        </p>
      )}
      {account && !invalid && !isLoading && !isError && found === null && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("tools.votingPower.notFound", { account })}
        </p>
      )}

      {found && governance && mana && rates && !isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <section
              className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700"
              data-testid="voting-power-governance"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Landmark className="h-4 w-4 text-indigo-500" />
                {t("tools.votingPower.governanceTitle")}
              </h3>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {hp(governance.hp)}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {governance.status === "proxy" ? (
                  <>
                    {governance.expires
                      ? t("tools.votingPower.governanceProxyUntil", {
                          date: date(governance.expires),
                        })
                      : t("tools.votingPower.governanceProxy")}{" "}
                    <Link href={`/@${governance.proxy}`} className="text-link">
                      @{governance.proxy}
                    </Link>
                  </>
                ) : governance.status === "inactive" ? (
                  t("tools.votingPower.governanceInactive")
                ) : governance.expires ? (
                  t("tools.votingPower.governanceActiveUntil", {
                    date: date(governance.expires),
                  })
                ) : (
                  t("tools.votingPower.governanceActive")
                )}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("tools.votingPower.governanceExplain")}
              </p>
            </section>

            <section
              className="rounded-xl border border-slate-200 bg-theme p-4 shadow-xs dark:border-slate-700"
              data-testid="voting-power-upvote"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <ThumbsUp className="h-4 w-4 text-emerald-500" />
                {t("tools.votingPower.upvoteTitle")}
              </h3>
              <p
                className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white"
                data-testid="voting-power-upvote-value"
                aria-live="polite"
              >
                {hbd(now)}
              </p>
              <p
                className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                aria-live="polite"
              >
                {t("tools.votingPower.upvoteAt", {
                  weight: percent(weight),
                  power: percent(mana.percent),
                })}
              </p>
              <label
                htmlFor="voting-power-weight"
                className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {t("tools.votingPower.weightLabel")}
                <span className="tabular-nums normal-case">
                  {percent(weight)}
                </span>
              </label>
              <input
                id="voting-power-weight"
                type="range"
                min={1}
                max={100}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="mt-1 w-full accent-indigo-500"
              />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t("tools.votingPower.upvoteFull", { value: hbd(full) })}
              </p>
              {mana.max <= BigInt(0) ? (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {t("tools.votingPower.upvoteNoPower")}
                </p>
              ) : (
                now === 0 &&
                mana.current > BigInt(0) && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    {t("tools.votingPower.upvoteDust")}
                  </p>
                )
              )}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("tools.votingPower.upvoteSplit")}
              </p>
            </section>
          </div>

          <p
            className="text-xs text-slate-500 dark:text-slate-400"
            data-testid="voting-power-rates"
          >
            {t("tools.votingPower.rates", {
              price: ltr(
                rates.hbdPerHive.toLocaleString(locale, {
                  maximumFractionDigits: 6,
                })
              ),
              pool: ltr(
                `${Math.round(rates.rewardBalanceHive).toLocaleString(
                  locale
                )} HIVE`
              ),
              block: rates.headBlock.toLocaleString(locale),
              time: rates.asOf
                ? rates.asOf.toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })
                : "--",
            })}{" "}
            {t("tools.votingPower.estimate")}
          </p>
        </>
      )}
    </div>
  );
};

export default VotingPowerTool;
