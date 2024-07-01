import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";


interface ProviderCardProps {
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  apiList: string[];
  switchToProvider: (providerLink: string |null) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  apiList,
  switchToProvider
}) => {
  return (
    <Card className="flex flex-col my-1 p-2">
      <div className="flex justify-between items-center">
        <div className={cn({"text-red-600": disabled, "font-semibold": isSelected})}>
          {providerLink}
        </div>
        <Button disabled={disabled} className="hover:bg-slate-400 rounded" onClick={() => {switchToProvider(providerLink)}}>Switch to API</Button>
      </div>
      <div>
        {apiList.map((api) => 
          <Badge variant={"outline"}>{api}</Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
