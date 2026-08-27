import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getDefaultAvatarUrl, getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

interface HiveAvatarProps {
  accountName?: string | null;
  size: number;
  className?: string;
  alt?: string;
  title?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

// images.hive.blog answers 400 for images it cannot decode, at every size
// variant, so those fall back to its own no-avatar placeholder.
const HiveAvatar: React.FC<HiveAvatarProps> = ({
  accountName,
  size,
  className,
  alt,
  title,
  style,
  "data-testid": testId,
}) => {
  const [failed, setFailed] = useState(false);

  // Lists reuse rows across accounts, so a stale failure must not follow.
  useEffect(() => {
    setFailed(false);
  }, [accountName]);

  const url = getHiveAvatarUrl(accountName ?? undefined);
  const src = !url || failed ? getDefaultAvatarUrl() : url;

  return (
    // Plain img: long re-keyed lists skip the Next optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? accountName ?? ""}
      title={title}
      data-testid={testId}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("rounded-full object-cover shrink-0", className)}
      style={style}
    />
  );
};

export default HiveAvatar;
