import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/i18n/i18n";
import { getImageSrc } from "@/utils/PathUtils";
import { SeoMeta, siteConfig } from "@/utils/seo";

// The served body while the chain-gated app is unavailable; without it SSR emits an empty page.

const NAV_LINKS: { href: string; labelKey: string }[] = [
  { href: "/witnesses", labelKey: "navbar.witnessesTitle" },
  { href: "/proposals", labelKey: "navbar.proposalsTitle" },
  { href: "/blocks", labelKey: "pageTitle.hiveBlocks" },
  { href: "/top-holders", labelKey: "pageTitle.topHolders" },
  { href: "/communities", labelKey: "navbar.communitiesTitle" },
  { href: "/schedule", labelKey: "witnessSchedule.title" },
  { href: "/tools/compare", labelKey: "tools.title" },
];

const TITLE_SUFFIX = ` | ${siteConfig.name}`;

interface SeoFallbackProps {
  meta?: SeoMeta;
}

const SeoFallback: React.FC<SeoFallbackProps> = ({ meta }) => {
  const { t, dir } = useI18n();

  // Strip the site-name suffix: it belongs in the tab, not in a heading.
  const heading = meta?.title?.endsWith(TITLE_SUFFIX)
    ? meta.title.slice(0, -TITLE_SUFFIX.length)
    : meta?.title || siteConfig.name;

  return (
    <main
      dir={dir}
      className="flex min-h-screen w-full flex-col items-center bg-theme px-4 py-10 text-gray-900 dark:text-white"
    >
      <div className="w-full max-w-2xl">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <Image
            src={getImageSrc("/hive-logo.png")}
            alt="Hive logo"
            width={32}
            height={32}
          />
          <span className="text-sm font-semibold">
            {t("navbar.hiveBlockExplorer")}
          </span>
        </Link>

        <h1 className="text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">
          {heading}
        </h1>
        <div className="mt-2 h-1 w-16 rounded-full bg-link" />

        {meta?.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {meta.description}
          </p>
        )}

        <nav aria-label={t("navbar.explore")} className="mt-8">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <li key={href}>
                <Link href={href} className="text-link hover:underline">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-10 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("seoShell.loading")}
        </p>
      </div>
    </main>
  );
};

export default SeoFallback;
