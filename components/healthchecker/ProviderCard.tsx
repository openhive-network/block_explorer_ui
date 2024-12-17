import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Pencil, X } from 'lucide-react';
import { ApiChecker } from "./HealthChecker";


interface ProviderCardProps {
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  apiList: string[];
  latency: number | null;
  customApiCheckers?: Map<string, ApiChecker>;
  providersForEndpoints: Map<string, string>;
  switchToProvider: (providerLink: string | null) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
  onEndpointProviderDialogChange: (isOpened: boolean, endpoint?: string) => void;
  resetEndpoints: () => void;
  deleteProvider: (provider: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  apiList,
  latency,
  customApiCheckers,
  providersForEndpoints,
  switchToProvider,
  onDialogOpenChange,
  onEndpointProviderDialogChange,
  resetEndpoints,
  deleteProvider
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
      <div className="row-start-1 col-start-1 col-span-6 flex items-center justify-between" >
        <span className={cn({"text-red-600": disabled})}>{providerLink}</span>{latency ? <span>Latency: {latency}</span> : null}
         
      </div>
      <div className="col-start-7 row-start-1 col-span-2 row-span-2 flex flex-col">
        <Button className="hover:bg-slate-400 bg-transparent rounded self-end w-fit" onClick={() => {deleteProvider(providerLink)}}><X /></Button>
        <div className="flex justify-center items-center gap-2">
          <Button className="hover:bg-slate-400 rounded" onClick={() => {onDialogOpenChange(true, providerLink)}}><Pencil /></Button>
          <Button disabled={disabled} className="hover:bg-slate-400 rounded" onClick={() => {onProviderChange(providerLink)}}>Switch to API</Button>
        </div>
      </div>
      <div className="row-start-2 flex items-center col-start-1 col-span-6 flex-wrap">
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
