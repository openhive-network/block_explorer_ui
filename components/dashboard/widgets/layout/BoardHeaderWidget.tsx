import React, { useEffect, useState } from "react";
import {
  Activity,
  Landmark,
  LayoutDashboard,
  LucideIcon,
  PenLine,
  TrendingUp,
  UserCircle,
  Wallet,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import LiveHeadBlock from "@/components/dashboard/ui/LiveHeadBlock";
import LiveDataToggle from "@/components/dashboard/ui/LiveDataToggle";
import {
  ACCENT_HEX,
  ACCENT_KEYS,
  AccentKey,
  resolveAccent,
} from "@/components/dashboard/lib/accents";

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  activity: Activity,
  wallet: Wallet,
  penLine: PenLine,
  trendingUp: TrendingUp,
  userCircle: UserCircle,
  zap: Zap,
  board: LayoutDashboard,
};

interface BoardHeaderWidgetProps {
  initialEyebrow?: string;
  initialTitle?: string;
  initialSubtitle?: string;
  initialAccent?: AccentKey;
  initialIcon?: string;
  headBlock?: number;
  blockTime?: string;
  showLiveData?: boolean;
  showBlockTime?: boolean;
  showBlockNumber?: boolean;
  isEditMode: boolean;
  onEyebrowChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  onAccentChange: (v: AccentKey) => void;
  onShowLiveDataChange: (v: boolean) => void;
  onShowBlockTimeChange: (v: boolean) => void;
  onShowBlockNumberChange: (v: boolean) => void;
}

const BoardHeaderWidget: React.FC<BoardHeaderWidgetProps> = ({
  initialEyebrow,
  initialTitle,
  initialSubtitle,
  initialAccent,
  initialIcon,
  headBlock,
  blockTime,
  showLiveData = true,
  showBlockTime = true,
  showBlockNumber = true,
  isEditMode,
  onEyebrowChange,
  onTitleChange,
  onSubtitleChange,
  onAccentChange,
  onShowLiveDataChange,
  onShowBlockTimeChange,
  onShowBlockNumberChange,
}) => {
  const { t } = useI18n();
  const [eyebrow, setEyebrow] = useState(initialEyebrow ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [subtitle, setSubtitle] = useState(initialSubtitle ?? "");

  useEffect(() => setEyebrow(initialEyebrow ?? ""), [initialEyebrow]);
  useEffect(() => setTitle(initialTitle ?? ""), [initialTitle]);
  useEffect(() => setSubtitle(initialSubtitle ?? ""), [initialSubtitle]);

  const accent = resolveAccent(initialAccent);
  const Icon = ICONS[initialIcon ?? "board"] ?? LayoutDashboard;

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

  if (isEditMode) {
    return (
      <div className={plate}>
        {spine}
        <div className="relative flex h-full flex-col justify-center gap-1.5 ps-9 pe-10 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              onBlur={() => onEyebrowChange(eyebrow)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={t("boardHeaderWidget.eyebrowPlaceholder")}
              className="w-28 shrink-0 rounded border bg-white px-1.5 py-0.5 text-[11px] uppercase tracking-[0.14em] text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => onTitleChange(title)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={t("boardHeaderWidget.titlePlaceholder")}
              className="min-w-0 flex-1 rounded border bg-white px-2 py-0.5 text-base font-semibold text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => onSubtitleChange(subtitle)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={t("boardHeaderWidget.subtitlePlaceholder")}
              className="min-w-0 flex-1 rounded border bg-white px-2 py-0.5 text-xs text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
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
                    "h-4 w-4 rounded-full ring-offset-1 ring-offset-transparent transition-all",
                    initialAccent === key
                      ? "ring-2 ring-gray-500 dark:ring-gray-300"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{ backgroundColor: ACCENT_HEX[key] }}
                />
              ))}
            </div>
          </div>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <label className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showBlockNumber}
                onChange={(e) => onShowBlockNumberChange(e.target.checked)}
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
      </div>
    );
  }

  return (
    <div className={plate}>
      {spine}
      <div className="relative flex h-full flex-col justify-center gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-3.5 sm:px-0 sm:py-2 sm:ps-5 sm:pe-4">
        <div className="flex min-w-0 items-center gap-3 sm:contents">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md sm:h-11 sm:w-11",
              accent.chip,
              accent.text
            )}
            aria-hidden="true"
          >
            <Icon size={22} strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase leading-none tracking-[0.18em]",
                  accent.text
                )}
              >
                {eyebrow}
              </p>
            )}
            {/* Both wrap on a phone rather than hiding half the words; still one
              line each on desktop, where the row has the width for it. */}
            <h2 className="mt-1 text-lg font-bold leading-tight tracking-[-0.02em] text-gray-900 dark:text-white sm:truncate sm:text-2xl">
              {title || t("boardHeaderWidget.defaultTitle")}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400 sm:truncate">
                {subtitle}
              </p>
            )}
          </div>

          {showLiveData && <LiveDataToggle className="self-start sm:hidden" />}
        </div>

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

export default BoardHeaderWidget;
