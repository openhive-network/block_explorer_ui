import React from "react";
import { LayoutDashboard, LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  BOARD_TEMPLATES,
  MY_BOARD_KEY,
} from "@/components/dashboard/templates";
import { AccentKey, resolveAccent } from "@/components/dashboard/lib/accents";

interface BoardTabsProps {
  activeBoardKey: string;
  onApplyBoard: (key: string) => void;
}

interface BoardEntry {
  key: string;
  labelKey: string;
  icon: LucideIcon;
  accent: AccentKey;
}

const BOARDS: BoardEntry[] = [
  {
    key: MY_BOARD_KEY,
    labelKey: "boards.myBoard.name",
    icon: LayoutDashboard,
    accent: "rose",
  },
  ...BOARD_TEMPLATES.map((b) => ({
    key: b.key,
    labelKey: b.nameKey,
    icon: b.icon,
    accent: b.accent,
  })),
];

const BoardTabs: React.FC<BoardTabsProps> = ({
  activeBoardKey,
  onApplyBoard,
}) => {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const label = t("boards.pickerTitle");
  const active = BOARDS.find((b) => b.key === activeBoardKey) ?? BOARDS[0];
  const ActiveIcon = active.icon;
  const activeAccent = resolveAccent(active.accent);

  return (
    <div className="page-container">
      <div
        data-testid="board-tabs"
        className="relative -mb-[2px] mx-1 overflow-hidden rounded-t border border-b-0 border-gray-200 bg-theme dark:border-gray-700"
      >
        <span
          className={cn(
            "absolute inset-y-0 start-0 w-[3px]",
            activeAccent.spine
          )}
          aria-hidden="true"
        />
        <div className="p-2 sm:hidden" data-testid="board-tabs-mobile">
          <Select value={active.key} onValueChange={onApplyBoard} dir={dir}>
            <SelectTrigger
              aria-label={label}
              className={cn(
                "h-[35px] w-full rounded-[6px] border px-3 text-sm font-semibold shadow-sm focus:ring-offset-0",
                activeAccent.ring,
                activeAccent.chip,
                activeAccent.text,
                activeAccent.hover
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse"
                )}
              >
                <ActiveIcon size={16} strokeWidth={2} className="shrink-0" />
                <span className="whitespace-nowrap">{t(active.labelKey)}</span>
              </span>
            </SelectTrigger>

            <SelectContent>
              {BOARDS.map((board) => {
                const BoardIcon = board.icon;
                return (
                  <SelectItem key={board.key} value={board.key}>
                    <div
                      className={cn(
                        "flex w-full items-center gap-2",
                        isRTL && "flex-row-reverse justify-end"
                      )}
                    >
                      <BoardIcon
                        size={15}
                        className={cn(
                          "shrink-0",
                          resolveAccent(board.accent).text
                        )}
                      />
                      <span>{t(board.labelKey)}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <nav
          aria-label={label}
          className="relative hidden items-center overflow-x-auto pe-2 ps-3 sm:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {BOARDS.map((board) => {
            const Icon = board.icon;
            const a = resolveAccent(board.accent);
            const isActive = board.key === active.key;
            return (
              <button
                key={board.key}
                type="button"
                data-testid={`board-tab-${board.key}`}
                onClick={() => onApplyBoard(board.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isActive
                    ? a.text
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                <Icon size={15} strokeWidth={2} className="shrink-0" />
                {t(board.labelKey)}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      // Clears the strip's -mb-[2px], which the next block overlaps.
                      "absolute inset-x-2 bottom-[2px] h-[2px] rounded-full",
                      a.spine
                    )}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BoardTabs;
