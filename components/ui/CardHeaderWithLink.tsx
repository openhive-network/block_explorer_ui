import React from "react";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface CardHeaderWithLinkProps {
  title: React.ReactNode;
  href?: string;
  onSeeMore?: () => void;
  seeMoreLabel?: string;
  linkTestId?: string;
  className?: string;
  actions?: React.ReactNode;
  // The time window the card's figures cover, e.g. "Last 30 days".
  period?: string;
}

const CardHeaderWithLink: React.FC<CardHeaderWithLinkProps> = ({
  title,
  href,
  onSeeMore,
  seeMoreLabel,
  linkTestId = "see-more-link",
  className,
  actions,
  period,
}) => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const label = seeMoreLabel ?? t("common.seeMore");

  const icon = <SeeMoreIcon width={18} />;

  const seeMore = href ? (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="shrink-0 text-link"
      data-testid={linkTestId}
    >
      {icon}
    </Link>
  ) : onSeeMore ? (
    <button
      type="button"
      onClick={onSeeMore}
      title={label}
      aria-label={label}
      className="shrink-0 text-link"
      data-testid={linkTestId}
    >
      {icon}
    </button>
  ) : null;

  return (
    <CardHeader
      className={cn(
        "flex flex-row flex-wrap items-center justify-between gap-2 border-b px-3 py-2",
        className
      )}
    >
      <CardTitle className="w-auto max-w-full shrink-0 wrap-break-word text-start text-base font-semibold">
        {title}
        {/* Inside the heading, so jumping between headings reads the period too. */}
        {period && (
          <span
            className="ms-2 inline-block rounded-full border border-gray-300 px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:border-gray-600 dark:text-gray-400"
            data-testid="card-period"
          >
            {period}
          </span>
        )}
      </CardTitle>

      {(actions || seeMore) && (
        <div className="ms-auto flex shrink-0 items-center gap-2">
          {actions}
          {seeMore}
        </div>
      )}
    </CardHeader>
  );
};

export default CardHeaderWithLink;
