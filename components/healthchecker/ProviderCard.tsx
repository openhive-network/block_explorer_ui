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
    <Card className={cn("grid grid-cols-8 grid-rows-5 md:grid-rows-2 gap-y-1 my-1 p-2", {"outline outline-2 outline-offset-2": isSelected})}>
      <div className={cn("row-start-1 col-start-1 col-span-6 self-center", {"text-red-600": disabled})}>
        {providerLink} {isFallback ? "- fallback" : null}
      </div>
      {!!latency && <div className="row-start-2 md:row-start-1 col-start-1 md:col-start-7 col-span-full md:col-span-1 self-center">Latency: {latency}</div>}
        {!isSelected && 
          <>
            <Button className="row-start-1 col-start-8 col-span-1 hover:bg-slate-400 bg-transparent rounded place-self-end w-fit" onClick={() => {deleteProvider(providerLink)}}>
              <X />
            </Button>
            <Button className="row-start-5 md:row-start-2 col-start-1 md:col-start-7 col-span-4 md:col-span-1 hover:bg-slate-400 rounded" onClick={() => {switchToProvider(providerLink)}}>
              Switch to provider
            </Button>
            {isFallback ?
              <Button className="row-start-5 md:row-start-2 col-start-5 md:col-start-8 col-span-4 md:col-span-1 hover:bg-slate-400 rounded ml-2" onClick={() => {removeFallback(providerLink)}}>
                Remove fallback
              </Button>
              :
              <Button className="row-start-5 md:row-start-2 col-start-5 md:col-start-8 col-span-4 md:col-span-1 hover:bg-slate-400 rounded ml-2" onClick={() => {registerFallback(providerLink)}}>
                Set fallback
              </Button>
            }
          </>
        }
      <div className={cn("row-start-3 row-span-2 md:row-span-1 flex items-center col-start-1 col-span-8 md:col-span-6 flex-wrap", {"py-2": isSelected})}>
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
