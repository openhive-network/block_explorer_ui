import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';
import { Layout } from 'react-grid-layout';
import { reportRegistry } from './reportRegistry';

interface ReportLibraryProps {
  onAddWidget: (widgetType: string) => void;
  widgets: Layout[];
}

const ReportLibrary: React.FC<ReportLibraryProps> = ({ onAddWidget, widgets }) => {
  const { t } = useI18n();

  const existingWidgetTypes = new Set(widgets.map(widget => widget.i.split('-')[0]));

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {Object.entries(reportRegistry).map(([widgetType, config]) => (
        <Button
          key={widgetType}
          onClick={() => onAddWidget(widgetType)}
          disabled={existingWidgetTypes.has(widgetType)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t(config.titleKey)}
        </Button>
      ))}
    </div>
  );
};

export default ReportLibrary;