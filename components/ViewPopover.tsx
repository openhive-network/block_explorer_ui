import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ViewPopoverProps {
  isMobile?: boolean;
}

const ViewPopover: React.FC<ViewPopoverProps> = ({ isMobile }) => {
  const { settings, setSettings } = useUserSettingsContext();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const popupDefaultValue = (() => {
    const { prettyJsonView, rawJsonView } = settings;
    if (!prettyJsonView && !rawJsonView) return "visualised-data";
    else if (prettyJsonView && !rawJsonView) return "pretty-json";
    else return "raw-json";
  })();

  const handleSelect = (value: string) => {
    if (value === "visualised-data") {
      setSettings({ ...settings, prettyJsonView: false, rawJsonView: false });
    } else if (value === "raw-json") {
      setSettings({ ...settings, prettyJsonView: false, rawJsonView: true });
    } else if (value === "pretty-json") {
      setSettings({ ...settings, prettyJsonView: true, rawJsonView: false });
    }
    setPopoverOpen(false); // Close the popover
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "rounded-[6px] text-sm text-center cursor-pointer flex jusitfy-center items-center p-1 ml-3 py-0 border-2 border-explorer-blue dark:border-explorer-turquoise",
            { "p-0 m-0 border-none text-base justify-normal": isMobile }
          )}
          data-testid="data-view-dropdown"
        >
          <span>Data View</span>
          <ChevronDown className="w-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={`w-60 bg-theme dark:bg-theme text-white rounded-[8px] border  ${
          isMobile && "ml-[30px]"
        }`}
      >
        <RadioGroup defaultValue={popupDefaultValue} onValueChange={handleSelect}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              onClick={() =>
                setSettings({
                  ...settings,
                  prettyJsonView: false,
                  rawJsonView: false,
                })
              }
              value="visualised-data"
              id="r1"
            />
            <Label
              className="cursor-pointer"
              htmlFor="r1"
            >
              Visualised Data
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              onClick={() =>
                setSettings({
                  ...settings,
                  prettyJsonView: false,
                  rawJsonView: true,
                })
              }
              value="raw-json"
              id="r2"
            />
            <Label
              className="cursor-pointer"
              htmlFor="r2"
            >
              Raw JSON
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              onClick={() =>
                setSettings({
                  ...settings,
                  prettyJsonView: true,
                  rawJsonView: false,
                })
              }
              value="pretty-json"
              id="r3"
            />
            <Label
              className="cursor-pointer"
              htmlFor="r3"
            >
              Pretty JSON
            </Label>
          </div>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};

export default ViewPopover;
