import React from "react";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";

interface WidgetRendererProps {
  type: string;
  props: any;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, props }) => {
  const widgetConfig = WIDGET_REGISTRY[type];

  if (!widgetConfig) {
    return <div>{`Error: Widget type "${type}" not found.`}</div>;
  }

  const WidgetComponent = widgetConfig.component;

  return <WidgetComponent {...props} />;
};

export default WidgetRenderer;
