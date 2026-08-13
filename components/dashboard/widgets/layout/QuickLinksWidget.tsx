import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { isInAppPath, normalizeExternalUrl } from "@/utils/SafeUrl";
import { resolveAccent, AccentKey } from "@/components/dashboard/lib/accents";
import { Button } from "@/components/ui/button";

interface LinkItem {
  label: string;
  url: string;
}

interface QuickLinksWidgetProps {
  initialLinks?: LinkItem[];
  initialTitle?: string;
  initialAccent?: AccentKey;
  isEditMode: boolean;
  onLinksChange: (links: LinkItem[]) => void;
  onTitleChange: (title: string) => void;
}

// Render drops invalid links silently, so edit mode warns instead.
const willRender = (url: string) =>
  isInAppPath(url) || !!normalizeExternalUrl(url);

const describe = (url: string) => {
  if (isInAppPath(url)) return url;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const QuickLinksWidget: React.FC<QuickLinksWidgetProps> = ({
  initialLinks,
  initialTitle,
  initialAccent,
  isEditMode,
  onLinksChange,
  onTitleChange,
}) => {
  const { t, dir } = useI18n();
  const [links, setLinks] = useState<LinkItem[]>(initialLinks || []);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    setLinks(initialLinks || []);
  }, [initialLinks]);

  useEffect(() => setTitle(initialTitle ?? ""), [initialTitle]);

  const accent = resolveAccent(initialAccent);

  const handleAddLink = () => {
    const trimmed = newUrl.trim();
    const safeUrl = isInAppPath(trimmed)
      ? trimmed
      : normalizeExternalUrl(trimmed);
    if (newLabel.trim() && safeUrl) {
      onLinksChange([...links, { label: newLabel, url: safeUrl }]);
      setNewLabel("");
      setNewUrl("");
    }
  };

  const handleRemoveLink = (indexToRemove: number) => {
    onLinksChange(links.filter((_, index) => index !== indexToRemove));
  };

  const handleEditLink = (
    index: number,
    field: keyof LinkItem,
    value: string
  ) => {
    setLinks((current) =>
      current.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    );
  };

  const handleMoveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const reordered = [...links];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    onLinksChange(reordered);
  };

  const shell =
    "flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-theme dark:border-gray-700";
  const header = (
    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
      <Link2 size={14} className={cn("shrink-0", accent.text)} />
      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
        {initialTitle || t("quickLinksWidget.title")}
      </h3>
    </div>
  );

  if (isEditMode) {
    const iconButton =
      "flex h-5 w-5 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-200";

    return (
      <div className={shell}>
        <div className="flex items-center gap-2 border-b border-gray-200 py-1.5 ps-2.5 pe-10 dark:border-gray-700">
          <Link2 size={14} className={cn("shrink-0", accent.text)} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onTitleChange(title)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder={t("quickLinksWidget.titlePlaceholder")}
            className="min-w-0 flex-1 rounded border bg-white px-2 py-0.5 text-sm font-semibold text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex-grow space-y-1.5 overflow-y-auto p-2.5">
          {links.map((link, index) => {
            const broken = link.url.trim() !== "" && !willRender(link.url);
            return (
              <div
                key={index}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "rounded border p-1.5",
                  broken
                    ? "border-red-300 dark:border-red-500/50"
                    : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) =>
                      handleEditLink(index, "label", e.target.value)
                    }
                    onBlur={() => onLinksChange(links)}
                    placeholder={t("quickLinksWidget.labelPlaceholder")}
                    className="min-w-0 flex-1 rounded border bg-white px-1.5 py-0.5 text-sm font-medium text-gray-900 outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => handleMoveLink(index, -1)}
                    disabled={index === 0}
                    aria-label={t("quickLinksWidget.moveUp")}
                    className={iconButton}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMoveLink(index, 1)}
                    disabled={index === links.length - 1}
                    aria-label={t("quickLinksWidget.moveDown")}
                    className={iconButton}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => handleRemoveLink(index)}
                    aria-label={t("quickLinksWidget.removeLink")}
                    className={cn(iconButton, "hover:text-red-500")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleEditLink(index, "url", e.target.value)}
                  onBlur={() => onLinksChange(links)}
                  placeholder={t("quickLinksWidget.urlPlaceholder")}
                  className="mt-1 w-full rounded border bg-white px-1.5 py-0.5 font-mono text-[11px] text-gray-700 outline-none dark:bg-gray-800 dark:text-gray-200"
                />
                {broken && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {t("quickLinksWidget.invalidUrl")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div
          className="space-y-1.5 border-t border-gray-200 p-2.5 dark:border-gray-700"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t("quickLinksWidget.labelPlaceholder")}
            className="w-full rounded border bg-white p-1 text-sm outline-none dark:bg-gray-800"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={t("quickLinksWidget.urlPlaceholder")}
            className="w-full rounded border bg-white p-1 text-sm outline-none dark:bg-gray-800"
          />
          <Button
            size="sm"
            onClick={handleAddLink}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full gap-1.5"
          >
            <Plus size={15} />
            {t("quickLinksWidget.addButton")}
          </Button>
        </div>
      </div>
    );
  }

  const validLinks = links
    .map((link) => ({
      ...link,
      safeUrl: isInAppPath(link.url)
        ? link.url
        : normalizeExternalUrl(link.url),
    }))
    .filter((link): link is LinkItem & { safeUrl: string } => !!link.safeUrl);

  return (
    <div className={shell}>
      {header}
      {validLinks.length === 0 ? (
        <p className="p-3 text-xs text-gray-500 dark:text-gray-400">
          {t("quickLinksWidget.noLinks")}
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto p-1.5">
          {validLinks.map((link, index) => {
            const internal = isInAppPath(link.safeUrl);
            const Glyph = internal ? ChevronRight : ArrowUpRight;
            const rowClasses =
              "group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50";
            const row = (
              <>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold uppercase",
                    accent.chip,
                    accent.text
                  )}
                  aria-hidden="true"
                >
                  {link.label.trim().charAt(0) || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                    {link.label}
                  </span>
                  <span className="block truncate font-mono text-[10px] text-gray-400 dark:text-gray-500">
                    {describe(link.safeUrl)}
                  </span>
                </span>
                <Glyph
                  size={14}
                  className={cn(
                    "shrink-0 text-gray-300 transition-all group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-300",
                    internal && dir === "rtl" && "rotate-180"
                  )}
                />
              </>
            );
            return (
              <li key={index}>
                {internal ? (
                  <Link href={link.safeUrl} className={rowClasses}>
                    {row}
                  </Link>
                ) : (
                  <a
                    href={link.safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClasses}
                  >
                    {row}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuickLinksWidget;
