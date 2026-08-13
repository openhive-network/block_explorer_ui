import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, UserCircle } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import LiveHeadBlock from "@/components/dashboard/ui/LiveHeadBlock";
import LiveDataToggle from "@/components/dashboard/ui/LiveDataToggle";
import {
  ACCENT_HEX,
  ACCENT_KEYS,
  AccentKey,
  resolveAccent,
} from "@/components/dashboard/lib/accents";

interface ProfileBannerWidgetProps {
  initialTagline?: string;
  initialAccent?: AccentKey;
  headBlock?: number;
  blockTime?: string;
  showLiveData?: boolean;
  showBlockTime?: boolean;
  showBlockNumber?: boolean;
  isEditMode: boolean;
  onTaglineChange: (v: string) => void;
  onAccentChange: (v: AccentKey) => void;
  onShowLiveDataChange: (v: boolean) => void;
  onShowBlockTimeChange: (v: boolean) => void;
  onShowBlockNumberChange: (v: boolean) => void;
}

const ProfileBannerWidget: React.FC<ProfileBannerWidgetProps> = ({
  initialTagline,
  initialAccent,
  headBlock,
  blockTime,
  showLiveData = true,
  showBlockTime = true,
  showBlockNumber = true,
  isEditMode,
  onTaglineChange,
  onAccentChange,
  onShowLiveDataChange,
  onShowBlockTimeChange,
  onShowBlockNumberChange,
}) => {
  const { t } = useI18n();
  const { username } = useAuth();
  const [tagline, setTagline] = useState(initialTagline ?? "");

  useEffect(() => setTagline(initialTagline ?? ""), [initialTagline]);

  const accent = resolveAccent(initialAccent);
  const plate = cn(
    "relative h-full w-full overflow-hidden rounded border bg-theme",
    accent.ring
  );
  const spine = (
    <span
      className={cn("absolute inset-y-0 start-0 w-[3px]", accent.spine)}
      aria-hidden="true"
    />
  );

  if (!username) {
    return (
      <div className={plate}>
        {spine}
        <div className="relative flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
          <UserCircle className={cn("h-7 w-7", accent.text)} />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("profileBannerWidget.signedOut")}
          </p>
          <Link
            href="/login"
            className="text-xs font-semibold text-link hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={plate}>
      {spine}
      <div className="relative flex h-full flex-col justify-center gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-4 sm:px-0 sm:py-2 sm:ps-5 sm:pe-4">
        <div className="flex min-w-0 items-center gap-3 sm:contents">
          <img
            src={getHiveAvatarUrl(username)}
            alt=""
            className="h-10 w-10 shrink-0 rounded-2xl object-cover ring-2 ring-white/70 dark:ring-black/30 sm:h-14 sm:w-14"
          />
          <div className="min-w-0 flex-1 sm:flex-none">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-lg font-bold leading-tight tracking-[-0.02em] text-gray-900 dark:text-white sm:text-2xl">
                @{username}
              </p>
              {!isEditMode && (
                <Link
                  href={`/@${username}`}
                  aria-label={t("profileBannerWidget.viewAccount")}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-lg p-1 transition-colors sm:hidden",
                    accent.chip,
                    accent.text
                  )}
                >
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>
              )}
            </div>

            {isEditMode ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  onBlur={() => onTaglineChange(tagline)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder={t("profileBannerWidget.taglinePlaceholder")}
                  className="w-64 max-w-full rounded border bg-white px-2 py-0.5 text-xs text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
                />
                <div
                  className="flex shrink-0 items-center gap-1"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {ACCENT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onAccentChange(key)}
                      aria-label={key}
                      aria-pressed={initialAccent === key}
                      className={cn(
                        "h-3.5 w-3.5 rounded-[2px] transition-all",
                        initialAccent === key
                          ? "ring-2 ring-gray-500 dark:ring-gray-300"
                          : "opacity-70 hover:opacity-100"
                      )}
                      style={{ backgroundColor: ACCENT_HEX[key] }}
                    />
                  ))}
                </div>

                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showBlockNumber}
                      onChange={(e) =>
                        onShowBlockNumberChange(e.target.checked)
                      }
                      className="h-3.5 w-3.5 accent-indigo-500"
                    />
                    {t("boardHeaderWidget.showBlockNumber")}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showLiveData}
                      onChange={(e) => onShowLiveDataChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-indigo-500"
                    />
                    {t("boardHeaderWidget.showLiveData")}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={showBlockTime}
                      onChange={(e) => onShowBlockTimeChange(e.target.checked)}
                      className="h-3.5 w-3.5 accent-indigo-500"
                    />
                    {t("boardHeaderWidget.showBlockTime")}
                  </label>
                </div>
              </div>
            ) : (
              tagline && (
                <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400 sm:truncate">
                  {tagline}
                </p>
              )
            )}
          </div>
          {!isEditMode && (
            <Link
              href={`/@${username}`}
              aria-label={t("profileBannerWidget.viewAccount")}
              className={cn(
                "group ms-auto hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:ms-0 sm:inline-flex",
                accent.chip,
                accent.text
              )}
            >
              <span className="hidden sm:inline">
                {t("profileBannerWidget.viewAccount")}
              </span>
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          )}

          {showLiveData && <LiveDataToggle className="self-start sm:hidden" />}
        </div>

        <div className="hidden flex-1 sm:block" />

        <div className="-mx-3 -mb-2 mt-2 border-t border-gray-100 bg-gray-50/70 px-3 py-2 dark:border-gray-700/60 dark:bg-gray-800/30 sm:contents">
          <LiveHeadBlock
            headBlock={headBlock}
            dotClass={accent.dot}
            glyphClass={accent.text}
            showLiveData={showLiveData}
            showBlockNumber={showBlockNumber}
            blockTime={showBlockTime ? blockTime : undefined}
            hideToggleOnMobile
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileBannerWidget;
