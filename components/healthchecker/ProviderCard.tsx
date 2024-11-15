import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Pencil } from 'lucide-react';
import { ApiChecker } from "./HealthChecker";


interface ProviderCardProps {
  index: number;
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  apiList: string[];
  customApiCheckers?: Map<string, ApiChecker>;
  providersForEndpoints: Map<string, string>;
  switchToProvider: (providerLink: string | null) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
  onEndpointProviderDialogChange: (isOpened: boolean, endpoint?: string) => void;
  resetEndpoints: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  index,
  providerLink,
  disabled,
  isSelected,
  apiList,
  customApiCheckers,
  providersForEndpoints,
  switchToProvider,
  onDialogOpenChange,
  onEndpointProviderDialogChange,
  resetEndpoints
}) => {

  const onProviderChange = (providerLink: string) => {
    switchToProvider(providerLink);
    resetEndpoints();
  }

  const checkProvider = (apiKey: string): boolean => {
    if (providersForEndpoints?.get(apiKey) === providerLink) return true;
    if (isSelected && !providersForEndpoints?.get(apiKey)) return true;
    return false
  }

  return (
    <Card className="grid grid-cols-8 grid-rows-2 gap-y-1 my-1 p-2">
      <div className="col-start-1 row-start-1 col-span-1 row-span-2 flex justify-center items-center">{index + 1}</div>
      <div className={cn("row-start-1 col-start-2 col-span-5 flex items-center", {"text-red-600": disabled})}>
        {providerLink}
      </div>
      <Button disabled={disabled} className="hover:bg-slate-400 rounded col-start-7 col-span-2 justify-self-end" onClick={() => {onProviderChange(providerLink)}}>Switch to API</Button>
      <Button className="hover:bg-slate-400 rounded col-start-7 col-span-2 justify-self-end row-start-2" onClick={() => {onDialogOpenChange(true, providerLink)}}><Pencil /></Button>
      <div className="row-start-2 flex items-center col-start-2 col-span-6 flex-wrap">
        {apiList.map((apiKey) => 
          <Badge 
            key={customApiCheckers?.get(apiKey)?.title} 
            variant={"outline"} 
            className={cn("cursor-pointer", {"text-green-400": checkProvider(apiKey)})}
            onClick={() => {onEndpointProviderDialogChange(true, apiKey)}}>
              {customApiCheckers?.get(apiKey)?.title}
          </Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
