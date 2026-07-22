import React from "react";
import { Loader2 } from "lucide-react";
import { useNodeSupport } from "@/contexts/NodeSupportContext";
import { getWidgetNodeSupport } from "@/components/dashboard/lib/widgetNodeSupport";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import WidgetUnavailable from "./WidgetUnavailable";
import { useI18n } from "@/i18n/i18n";

interface NodeSupportGateProps {
  widgetId: string;
  children: React.ReactNode;
}

// Wraps a home widget/card and renders a graceful "unavailable on this node" card
// instead of the widget when the active node can't serve it:
//   - whole required app missing (proactive probe) -> gate before it ever fetches
//   - probe still resolving                          -> brief loader
//   - app present but its specific endpoint missing  -> swap once the widget's
//     query reports the 404 (reactive)
// Widgets with no node-support requirement render their children untouched.
const NodeSupportGate: React.FC<NodeSupportGateProps> = ({
  widgetId,
  children,
}) => {
  const { isSupported, isEndpointUnsupported, isEndpointTransient } =
    useNodeSupport();
  const { t } = useI18n();

  const cap = getWidgetNodeSupport(widgetId);
  if (!cap) return <>{children}</>;

  const appStatus = isSupported(cap.app);
  const endpointMissing = isEndpointUnsupported(cap.endpoint);
  // Transient only when a present app's endpoint is merely erroring (5xx/timeout).
  // A missing whole app (appStatus === false) or a 404/501 route is definitive.
  const transient =
    appStatus !== false && endpointMissing && isEndpointTransient(cap.endpoint);

  // App present and endpoint (if any) fine -> render the real widget.
  if (appStatus === true && !endpointMissing) return <>{children}</>;

  const titleKey = WIDGET_REGISTRY[widgetId]?.name;
  const title = titleKey ? t(titleKey) : undefined;

  // Probe not resolved yet and nothing reported missing -> brief loader.
  if (appStatus === undefined && !endpointMissing) {
    return (
      <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
        {title && <CardHeaderWithLink title={title} />}
        <div className="flex min-h-[140px] items-center justify-center p-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      {title && <CardHeaderWithLink title={title} />}
      <div className="min-h-[140px] p-3">
        <WidgetUnavailable transient={transient} />
      </div>
    </div>
  );
};

export default NodeSupportGate;
