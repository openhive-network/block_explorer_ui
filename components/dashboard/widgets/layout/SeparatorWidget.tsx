import React from "react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { AccentKey, resolveAccent } from "@/components/dashboard/lib/accents";
import SegmentedToggle from "@/components/ui/SegmentedToggle";

type Variant = "line" | "dashed" | "dots" | "fade";

const VARIANTS: Variant[] = ["line", "dashed", "dots", "fade"];

interface SeparatorWidgetProps {
  initialVariant?: Variant;
  initialAccent?: AccentKey;
  isEditMode: boolean;
  onVariantChange: (v: Variant) => void;
}

const SeparatorWidget: React.FC<SeparatorWidgetProps> = ({
  initialVariant,
  initialAccent,
  isEditMode,
  onVariantChange,
}) => {
  const { t } = useI18n();
  const variant: Variant =
    initialVariant && VARIANTS.includes(initialVariant)
      ? initialVariant
      : "line";
  const accent = resolveAccent(initialAccent);
  const rule = "flex-grow border-t border-gray-200 dark:border-slate-700";

  if (isEditMode) {
    return (
      <div className="flex h-full w-full items-center justify-center px-1">
        <span onMouseDown={(e) => e.stopPropagation()}>
          <SegmentedToggle<Variant>
            options={VARIANTS.map((v) => ({
              value: v,
              label: t(`separatorWidget.variant_${v}`),
            }))}
            value={variant}
            onChange={onVariantChange}
            ariaLabel={t("separatorWidget.styleLabel")}
          />
        </span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="flex h-full w-full items-center gap-3 px-1">
        <span className={rule} />
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                accent.dot,
                i !== 1 && "opacity-40"
              )}
            />
          ))}
        </span>
        <span className={rule} />
      </div>
    );
  }

  if (variant === "fade") {
    return (
      <div className="flex h-full w-full items-center px-1">
        <span
          className={cn("h-[2px] w-full rounded-full opacity-60", accent.spine)}
          style={{
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center px-1">
      <hr
        className={cn(
          "w-full border-gray-200 dark:border-slate-700",
          variant === "dashed" && "border-dashed"
        )}
      />
    </div>
  );
};

export default SeparatorWidget;
