import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card } from "../ui/card";


interface ProviderCardProps {
  providerLink: string;
  disabled: boolean;
  isSelected: boolean;
  switchToProvider: (providerLink: string |null) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  providerLink,
  disabled,
  isSelected,
  switchToProvider
}) => {
  return (
    <Card className="flex justify-between items-center my-1 px-2">
    <div className={cn({"text-red-800": disabled, "font-semibold": isSelected})}>
      {providerLink}
    </div>
    <Button disabled={disabled} className="hover:bg-slate-400 rounded" onClick={() => {switchToProvider(providerLink)}}>Switch</Button>
    </Card>
  )
};

export default ProviderCard;
