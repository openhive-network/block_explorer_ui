import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronDown, GalleryVerticalEnd, FileJson, ListTree, LucideProps } from "lucide-react"; 
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface DataViewProps {
  isMobile?: boolean;
}
type ViewMode = "visualised-data" | "raw-json" | "pretty-json";

const DataView: React.FC<DataViewProps> = ({ isMobile }) => {

  const { settings, updateSettings } = useSettings();
  const displaySettings = settings; 

  const { t } = useI18n();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const currentView: ViewMode = (() => {
    const { prettyJsonView, rawJsonView } = settings;
    if (prettyJsonView) return "pretty-json";
    if (rawJsonView) return "raw-json";
    return "visualised-data";
  })();

 
  const handleSelect = (value: string) => {
    if (value === "visualised-data") {
      updateSettings({ prettyJsonView: false, rawJsonView: false });
    } else if (value === "raw-json") {
      updateSettings({ prettyJsonView: false, rawJsonView: true });
    } else if (value === "pretty-json") {
      updateSettings({ prettyJsonView: true, rawJsonView: false });
    }
    setPopoverOpen(false);
  };

  const ViewIconsSegmented = () => {
    const buttonBaseClass = "px-2.5 h-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative";
    const selectedClass = "bg-white dark:bg-explorer-light-gray"; 
    const notSelectedClass = "hover:bg-white";
  
    return (
      <TooltipProvider>
        <div 
          className="flex  items-center h-[35px] rounded-[6px] border-navbar-border border-[1px] overflow-hidden bg-navbar"
          role="group"
          aria-label="Data view selection"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleSelect("visualised-data")}
                className={cn(buttonBaseClass, currentView === 'visualised-data' ? selectedClass : notSelectedClass)}
                aria-pressed={currentView === 'visualised-data'}
              >
                <GalleryVerticalEnd className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{t("dataView.visualizedData")}</p></TooltipContent>
          </Tooltip>
  
          <div className="w-px h-4/5 bg-navbar-border"></div>
  
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleSelect("raw-json")}
                className={cn(buttonBaseClass, currentView === 'raw-json' ? selectedClass : notSelectedClass)}
                aria-pressed={currentView === 'raw-json'}
              >
                <FileJson className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{t("dataView.rawJson")}</p></TooltipContent>
          </Tooltip>
  
          <div className="w-px h-4/5 bg-navbar-border"></div>
  
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleSelect("pretty-json")}
                className={cn(buttonBaseClass, currentView === 'pretty-json' ? selectedClass : notSelectedClass)}
                aria-pressed={currentView === 'pretty-json'}
              >
                <ListTree className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{t("dataView.prettyJson")}</p></TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  };

  const ViewCycleButton = () => {
    const views: ViewMode[] = ["visualised-data", "raw-json", "pretty-json"];
    const viewDetails: Record<ViewMode, { icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; label: string; }> = {
      "visualised-data": { icon: GalleryVerticalEnd, label: t("dataView.visualizedData") },
      "raw-json": { icon: FileJson, label: t("dataView.rawJson") },
      "pretty-json": { icon: ListTree, label: t("dataView.prettyJson") },
    };

    const handleCycle = () => {
      const currentIndex = views.indexOf(currentView);
      const nextIndex = (currentIndex + 1) % views.length;
      handleSelect(views[nextIndex]);
    };

    const CurrentIcon = viewDetails[currentView].icon;
    const currentLabel = viewDetails[currentView].label;
    const nextLabel = viewDetails[views[(views.indexOf(currentView) + 1) % views.length]].label;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleCycle}
              className={cn(
                "w-[140px] h-[35px] rounded-[6px] text-sm text-center cursor-pointer flex justify-center items-center p-2 bg-navbar hover:bg-navbar-hover border-navbar-border border-[1px] transition-colors duration-200",
                { "p-1 m-0 text-sm justify-normal": isMobile }
              )}
            >
              <CurrentIcon className="w-5 h-5 mr-2" />
              <span className="font-semibold truncate">{currentLabel}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("dataView.cycleTooltip", { nextView: nextLabel })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const ViewPopover = () => (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-[110px] h-[35px] rounded-[6px] text-sm text-center cursor-pointer flex justify-center items-center p-2 bg-navbar hover:bg-navbar-hover border-navbar-border border-[1px] transition-colors duration-200",
            { "p-1 m-0 text-sm justify-normal": isMobile }
          )}
          data-testid="data-view-dropdown"
        >
          <span className="font-semibold">{t("dataView.dataView")}</span>
          <ChevronDown className="w-4 ml-1" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
            "w-56 bg-theme text-white rounded-lg shadow-lg border border-gray-300 dark:border-gray-700",
            isMobile ? "ml-[20px]" : ""
        )}
      >
        <RadioGroup
          defaultValue={currentView}
          onValueChange={handleSelect}
        >
          <Label htmlFor="r1" className="flex items-center space-x-2 p-2 hover:bg-navbar-listHover rounded-md transition-colors duration-200 cursor-pointer">
            <RadioGroupItem value="visualised-data" id="r1" />
            <span>{t("dataView.visualizedData")}</span>
          </Label>
          <Label htmlFor="r2" className="flex items-center space-x-2 p-2 hover:bg-navbar-listHover rounded-md transition-colors duration-200 cursor-pointer">
            <RadioGroupItem value="raw-json" id="r2" />
            <span>{t("dataView.rawJson")}</span>
          </Label>
          <Label htmlFor="r3" className="flex items-center space-x-2 p-2 hover:bg-navbar-listHover rounded-md transition-colors duration-200 cursor-pointer">
            <RadioGroupItem value="pretty-json" id="r3" />
            <span>{t("dataView.prettyJson")}</span>
          </Label>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );

  // --- Main Render Logic ---
  switch (displaySettings.dataViewSwitchStyle) {
    case 'icons':
      return <ViewIconsSegmented />;
    case 'cycle':
      return <ViewCycleButton />;
    default: 
      return <ViewPopover />;
  }
};

export default DataView;