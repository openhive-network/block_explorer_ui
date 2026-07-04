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
}

const CardHeaderWithLink: React.FC<CardHeaderWithLinkProps> = ({
  title,
  href,
  onSeeMore,
  seeMoreLabel,
  linkTestId = "see-more-link",
  className,
  actions,
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
        "flex flex-row items-center justify-between gap-2 border-b px-3 py-2",
        className
      )}
    >
      <CardTitle className="min-w-0 truncate text-start text-base font-semibold">
        {title}
      </CardTitle>

      {(actions || seeMore) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {seeMore}
        </div>
      )}
    </CardHeader>
  );
};

export default CardHeaderWithLink;
