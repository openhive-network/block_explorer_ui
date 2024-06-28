import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";

interface ViewPopoverProps {
  isMobile?: boolean;
}

const ViewPopover: React.FC<ViewPopoverProps> = ({ isMobile }) => {
  const { settings, setSettings } = useUserSettingsContext();

  const popupDefaultValue = (() => {
    const { prettyJsonView, rawJsonView } = settings;
    if (!prettyJsonView && !rawJsonView) return "visualised-data";
    else if (prettyJsonView && !rawJsonView) return "pretty-json";
    else return "raw-json";
  })();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className={`${isMobile && "text-2xl p-0"}`}>View</Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-60 bg-explorer-dark-gray text-white rounded-[8px] ${
          isMobile && "ml-[30px]"
        }`}
      >
        <RadioGroup defaultValue={popupDefaultValue}>
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
            <Label htmlFor="r1">Visualised Data</Label>
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
            <Label htmlFor="r2">Raw JSON</Label>
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
            <Label htmlFor="r3">Pretty JSON</Label>
          </div>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};

export default ViewPopover;
