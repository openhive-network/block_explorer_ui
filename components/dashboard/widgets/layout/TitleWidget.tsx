import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { Palette } from "lucide-react";

// The picker only emits #rrggbb; anything else came from a restored bundle.
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const safeColor = (value?: string): string | undefined =>
  value && value !== "transparent" && HEX_COLOR.test(value) ? value : undefined;

interface TitleWidgetProps {
  initialText?: string;
  initialColor?: string;
  isEditMode: boolean;
  onTextChange: (newText: string) => void;
  onColorChange: (newColor: string) => void;
}

const TitleWidget: React.FC<TitleWidgetProps> = ({
  initialText,
  initialColor,
  isEditMode,
  onTextChange,
  onColorChange,
}) => {
  const { t } = useI18n();

  const [text, setText] = useState(initialText || t("titleWidget.defaultText"));
  const [color, setColor] = useState(safeColor(initialColor) ?? "#ffffff");

  useEffect(() => {
    setText(initialText || t("titleWidget.defaultText"));
  }, [initialText, t]);

  useEffect(() => {
    setColor(safeColor(initialColor) ?? "#ffffff");
  }, [initialColor]);

  const handleTextBlur = () => {
    onTextChange(text);
  };
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onColorChange(newColor);
  };
  const handleIconClick = () => {
    const newColor = safeColor(initialColor) ? "transparent" : "#ffffff";
    setColor(newColor);
    onColorChange(newColor);
  };

  const shell =
    "flex items-center gap-3 w-full h-full px-4 rounded-xl bg-theme border border-gray-200 dark:border-gray-700";
  const customColor = safeColor(initialColor);
  const accent = (
    <span className="h-6 w-1 shrink-0 rounded-full bg-indigo-500" />
  );

  if (isEditMode) {
    return (
      <div className={shell} style={{ backgroundColor: customColor }}>
        {accent}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextBlur}
          className="flex-grow h-full text-2xl font-bold tracking-tight bg-transparent focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-md px-2"
          placeholder={t("titleWidget.placeholder")}
          onMouseDown={(e) => e.stopPropagation()}
        />

        <div
          className="absolute top-2 end-10 flex items-center justify-center w-8 h-8"
          onMouseDown={(e) => e.stopPropagation()}
          title={t("titleWidget.colorTooltip")}
        >
          <Palette
            className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            onClick={handleIconClick}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className={shell} style={{ backgroundColor: customColor }}>
      {accent}
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white truncate">
        {text || t("titleWidget.defaultText")}
      </h2>
    </div>
  );
};

export default TitleWidget;
