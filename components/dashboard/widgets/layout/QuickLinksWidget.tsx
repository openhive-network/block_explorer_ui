import React, { useState, useEffect } from "react";
import { Link, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

interface LinkItem {
  label: string;
  url: string;
}

interface QuickLinksWidgetProps {
  initialLinks?: LinkItem[];
  isEditMode: boolean;
  onLinksChange: (links: LinkItem[]) => void;
}

const QuickLinksWidget: React.FC<QuickLinksWidgetProps> = ({
  initialLinks,
  isEditMode,
  onLinksChange,
}) => {
  const { t } = useI18n();
  const [links, setLinks] = useState<LinkItem[]>(initialLinks || []);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    setLinks(initialLinks || []);
  }, [initialLinks]);

  const handleAddLink = () => {
    if (newLabel.trim() && newUrl.trim()) {
      const newLinksArray = [...links, { label: newLabel, url: newUrl }];
      onLinksChange(newLinksArray);
      setNewLabel("");
      setNewUrl("");
    }
  };

  const handleRemoveLink = (indexToRemove: number) => {
    const newLinksArray = links.filter((_, index) => index !== indexToRemove);
    onLinksChange(newLinksArray);
  };

  if (isEditMode) {
    return (
      <div className="p-3 bg-theme h-full rounded-lg flex flex-col">
        <div className="flex-grow overflow-y-auto mt-9">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-center justify-between mb-2 text-sm"
            >
              <span className="truncate" title={`${link.label} (${link.url})`}>
                {link.label}
              </span>
              <button
                onClick={() => handleRemoveLink(index)}
                className="p-1 "
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Trash2 size={16} color="#FF0000" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t pt-2 space-y-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={t("quickLinksWidget.labelPlaceholder")}
            className="w-full text-sm p-1 rounded border bg-white dark:bg-gray-800"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={t("quickLinksWidget.urlPlaceholder")}
            className="w-full text-sm p-1 rounded border bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleAddLink}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center p-1 text-sm bg-buttonBg"
          >
            <Plus size={16} className="mr-1" />
            {t("quickLinksWidget.addButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-theme  h-full rounded-[4px]">
      <h3 className="font-bold mb-2">{t("quickLinksWidget.title")}</h3>
      <div className="space-y-2">
        {links.length > 0 ? (
          links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2  text-link"
              title={link.url}
            >
              <Link size={14} />
              <span className="truncate text-md text-link">{link.label}</span>
            </a>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {t("quickLinksWidget.noLinks")}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickLinksWidget;
