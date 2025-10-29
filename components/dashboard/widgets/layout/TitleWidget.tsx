// components/dashboard/widgets/TitleWidget.tsx

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/i18n';
import { Palette } from 'lucide-react';

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

  const [text, setText] = useState(initialText || t('titleWidget.defaultText'));
  const [color, setColor] = useState(initialColor && initialColor !== 'transparent' ? initialColor : '#ffffff');

  useEffect(() => {
    setText(initialText || t('titleWidget.defaultText'));
  }, [initialText, t]);

  useEffect(() => {
    setColor(initialColor && initialColor !== 'transparent' ? initialColor : '#ffffff');
  }, [initialColor]);

  const handleTextBlur = () => { onTextChange(text); };
  const handleColorChange = (newColor: string) => { setColor(newColor); onColorChange(newColor); };
  const handleIconClick = () => { const newColor = initialColor && initialColor !== 'transparent' ? 'transparent' : '#ffffff'; setColor(newColor); onColorChange(newColor); };

  if (isEditMode) {
    return (
      <div
        className="flex items-center w-full h-full p-2 rounded-md"
        style={{ backgroundColor: initialColor || 'transparent' }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextBlur}
          className="flex-grow h-full text-2xl font-bold bg-transparent focus:bg-white/20 outline-none rounded-md px-2"
          placeholder={t('titleWidget.placeholder')}
          onMouseDown={(e) => e.stopPropagation()}
        />

        <div
          className="absolute top-2 right-10 flex items-center justify-center w-8 h-8" // Use `right-8` to create space
          onMouseDown={(e) => e.stopPropagation()}
          title={t('titleWidget.colorTooltip')}
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
    <div
      className="w-full h-full flex items-center p-2 rounded-[4px]"
      style={{ backgroundColor: initialColor || 'transparent' }}
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 truncate px-2">
        {text || t('titleWidget.defaultText')}
      </h2>
    </div>
  );
};

export default TitleWidget;