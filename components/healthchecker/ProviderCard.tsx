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
  checkerNamesList: string[];
  latency: number | null;
  customApiCheckers?: Map<string, ApiChecker>;
  isFallback: boolean;
  switchToProvider: (providerLink: string | null) => void;
  deleteProvider: (provider: string) => void;
  registerFallback: (provider: string) => void;
  removeFallback: (provider: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  checkerNamesList,
  latency,
  customApiCheckers,
  isFallback,
  deleteProvider,
  switchToProvider,
  registerFallback,
  removeFallback
}) => {


  return (
    <Card className={cn("grid grid-cols-8 grid-rows-2 gap-y-1 my-1 p-2", {"outline outline-2 outline-offset-2": isSelected})}>
      <div className="row-start-1 col-start-1 col-span-7 flex items-center justify-between" >
        <span className={cn({"text-red-600": disabled})}>{providerLink} {isFallback ? "- fallback" : null}</span>
        {latency ? <span>Latency: {latency}</span> : null}
      </div>
      <div className="col-start-7 row-start-1 col-span-2 row-span-2 flex flex-col">
        {isSelected ?   
          <div className="flex justify-end">Selected</div> :
          <>
            <Button className="hover:bg-slate-400 bg-transparent rounded self-end w-fit" onClick={() => {deleteProvider(providerLink)}}><X /></Button>
            <div className="flex justify-end items-center gap-2">
              <Button className="hover:bg-slate-400 rounded" onClick={() => {switchToProvider(providerLink)}}>Switch to provider</Button>
              {isFallback ?
                <Button className="hover:bg-slate-400 rounded" onClick={() => {removeFallback(providerLink)}}>Remove fallback</Button>
                :
                <Button className="hover:bg-slate-400 rounded" onClick={() => {registerFallback(providerLink)}}>Set fallback</Button>
              }
            </div>
          </>
        }
      </div>
      <div className="row-start-2 flex items-center col-start-1 col-span-6 flex-wrap">
        {checkerNamesList.map((checkerName) => 
          <Badge 
            key={customApiCheckers?.get(checkerName)?.title} 
            variant={"outline"} 
          >
              {customApiCheckers?.get(checkerName)?.title}
          </Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
