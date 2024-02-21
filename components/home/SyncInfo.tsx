import { cn } from "@/lib/utils";
import { useBlockchainSyncInfo } from "@/utils/Hooks";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface SyncInfoProps {
  className?: string;
}

const SyncInfo: React.FC<SyncInfoProps> = ({ className }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
    loading: syncLoading,
  } = useBlockchainSyncInfo();

  const blockDifference = (hiveBlockNumber || 0) - (explorerBlockNumber || 0);

  return !syncLoading ? (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger>
        <div
          className={cn(
            "flex gap-x-1 border rounded-[6px] mt-px mx-6 px-1.5 py-px text-sm cursor-pointer",
            {
              "border-explorer-ligh-green text-explorer-ligh-green":
                blockDifference <= 3,
              "border-explorer-orange text-explorer-orange":
                blockDifference > 3 && blockDifference <= 20,
              "border-explorer-red text-explorer-red": blockDifference > 20,
            },
            className
          )}
          onClick={() => setDialogOpen(true)}
        >
          {!blockDifference ? (
            <p>Explorer synced with blockchain</p>
          ) : (
            <>
              <p>Blocks out of sync:</p>
              <p>{blockDifference}</p>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-explorer-dark-gray text-white">
        <DialogHeader>
          <DialogTitle>Blockchain sync</DialogTitle>
        </DialogHeader>
        <section>
          INFO
        </section>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="border rounded-[6px] mt-px mx-6 px-1.5 py-px text-sm border-explorer-yellow text-explorer-yellow">
      Connecting...
    </div>
  );
};

export default SyncInfo;
