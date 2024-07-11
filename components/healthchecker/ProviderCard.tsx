import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Pencil } from 'lucide-react';


interface ProviderCardProps {
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  apiList: string[];
  switchToProvider: (providerLink: string | null) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  apiList,
  switchToProvider
}) => {

  const clickEdit = () => {

  }

  return (
    <Card className="grid grid-cols-4 grid-rows-2 my-1 p-2">
        <div className={cn("row-start-1 flex items-center", {"text-red-600": disabled, "font-semibold": isSelected})}>
          {providerLink}
        </div>
        <Button disabled={disabled} className="hover:bg-slate-400 rounded col-start-4 justify-self-end" onClick={() => {switchToProvider(providerLink)}}>Switch to API</Button>
        <Button disabled={disabled} className="hover:bg-slate-400 rounded col-start-4 justify-self-end row-start-2 w-1/2"><Pencil /></Button>
      <div className="row-start-2 flex items-center">
        {apiList.map((api) => 
          <Badge variant={"outline"}>{api}</Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
