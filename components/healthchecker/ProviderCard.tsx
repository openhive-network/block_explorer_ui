import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Pencil } from 'lucide-react';


interface ProviderCardProps {
  index: number;
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  apiList: string[];
  switchToProvider: (providerLink: string | null) => void;
  onDialogOpenChange: (isOpened: boolean, provider?: string) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  index,
  providerLink,
  disabled,
  isSelected,
  apiList,
  switchToProvider,
  onDialogOpenChange
}) => {

  const clickEdit = () => {

  }

  return (
    <Card className="grid grid-cols-8 grid-rows-2 my-1 p-2">
      <div className="col-start-1 row-start-1 col-span-1 row-span-2 flex justify-center items-center">{index + 1}</div>
      <div className={cn("row-start-1 col-start-2 col-span-5 flex items-center", {"text-red-600": disabled, "font-semibold": isSelected})}>
        {providerLink}
      </div>
      <Button disabled={disabled} className="hover:bg-slate-400 rounded col-start-7 col-span-2 justify-self-end" onClick={() => {switchToProvider(providerLink)}}>Switch to API</Button>
      <Button className="hover:bg-slate-400 rounded col-start-7 col-span-2 justify-self-end row-start-2" onClick={() => {onDialogOpenChange(true, providerLink)}}><Pencil /></Button>
      <div className="row-start-2 flex items-center col-start-2 col-span-3">
        {apiList.map((api) => 
          <Badge variant={"outline"}>{api}</Badge>
        )}
      </div>
    </Card>
  )
};

export default ProviderCard;
