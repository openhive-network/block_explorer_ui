import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

// Lets the Trigger toggle open state on touch taps, so tooltips work on mobile
// (Radix only opens on hover/focus). Mouse still uses Radix's hover logic.
const TooltipToggleContext = React.createContext<(() => void) | null>(null);

const Tooltip: React.FC<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
> = ({ open, defaultOpen, onOpenChange, children, ...props }) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const currentOpen = isControlled ? (open as boolean) : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const openRef = React.useRef(currentOpen);
  openRef.current = currentOpen;
  const toggle = React.useCallback(() => setOpen(!openRef.current), [setOpen]);

  return (
    <TooltipToggleContext.Provider value={toggle}>
      <TooltipPrimitive.Root
        open={currentOpen}
        onOpenChange={setOpen}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipToggleContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, onPointerDown, ...props }, ref) => {
  const toggle = React.useContext(TooltipToggleContext);
  const pointerType = React.useRef<string>("mouse");
  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      onPointerDown={(e) => {
        pointerType.current = e.pointerType;
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        // Touch/pen tap → toggle open; preventDefault skips Radix's own
        // click-close. Skip mouse (hover), keyboard (detail 0) and <a> (nav).
        const el = e.currentTarget as HTMLElement;
        if (
          toggle &&
          e.detail !== 0 &&
          pointerType.current !== "mouse" &&
          el.tagName !== "A"
        ) {
          e.preventDefault();
          toggle();
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-[6px] bg-theme text-text shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "border border-theme/70 py-1 px-1 text-xs font-medium",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
};
