import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, X } from 'lucide-react';


interface ProviderCardProps {
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  isTop: boolean;
  checkerNamesList: string[];
  latency: number | null;
  score: number;
  isFallback: boolean;
  index: number;
  failedChecks: string[];
  switchToProvider: (providerLink: string | null) => void;
  deleteProvider: (provider: string) => void;
  registerFallback: (provider: string) => void;
  removeFallback: (provider: string) => void;
  selectValidator: (providerName: string, checkTitle: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  isTop,
  checkerNamesList,
  latency,
  score,
  isFallback,
  index,
  failedChecks,
  deleteProvider,
  switchToProvider,
  registerFallback,
  removeFallback,
  selectValidator
}) => {

  const handleBadgeClick = (checkerName: string) => {
    if (failedChecks.includes(checkerName))
    selectValidator(providerLink, checkerName);
  }

  return (
    <Card className={cn("grid grid-cols-10 grid-rows-5 lg:grid-rows-2 gap-y-1 my-1 p-2 mx-2 lg:mx-0", {"outline outline-2 outline-offset-2 mb-6": isTop})}>
      <div className="lg:col-start-1 lg:col-span-1 lg:row-start-1 lg:row-span-full justify-self-center self-center">{index}</div>
      <div className={cn("row-start-1 col-start-2 col-span-6 self-center", {"text-red-600": disabled})}>
        {providerLink} {isFallback ? "- fallback" : null}
      </div>
      <div className="row-start-2 lg:row-start-1 col-start-1 lg:col-start-8 col-span-full lg:col-span-2 self-center">
        {score !== -1 ?
          <>{score !==0 && <>Latency: {latency}, Score: {score.toFixed(3)} </>}</> :
          <Loader2 className="animate-spin h-6 w-6 ..." /> 
        }
      </div> 
      {!isSelected && 
        <>
          <Button className="row-start-1 col-start-10 col-span-1 hover:bg-slate-400 bg-transparent rounded place-self-end w-fit" onClick={() => {deleteProvider(providerLink)}}>
            <X />
          </Button>
          <div className="row-start-5 lg:row-start-2 col-start-1 lg:col-start-8 col-span-10 lg:col-span-3 flex justify-end ml-2">
            <Button className="hover:bg-slate-400 rounded w-full" onClick={() => {switchToProvider(providerLink)}}>
              Switch to provider
            </Button>
            {isFallback ?
              <Button className="hover:bg-slate-400 rounded ml-2 w-full" onClick={() => {removeFallback(providerLink)}}>
                Remove fallback
              </Button>
              :
              <Button className="hover:bg-slate-400 rounded ml-2 w-full" onClick={() => {registerFallback(providerLink)}}>
                Set fallback
              </Button>
            }
          </div>
        </>
      }
      <div className={cn("row-start-3 row-span-2 lg:row-start-2 lg:row-span-1 flex items-center col-start-1 col-span-10 lg:col-span-6 lg:col-start-2 flex-wrap", {"py-2": isSelected})}>
        {checkerNamesList.map((checkerName) => 
          <Badge 
            key={checkerName} 
            variant={"outline"} 
            className={cn("m-0.5", {"border-red-600 cursor-pointer": failedChecks.includes(checkerName), "border-red-600": disabled})}
            onClick={() => handleBadgeClick(checkerName)}
          >
              {checkerName}
          </Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
