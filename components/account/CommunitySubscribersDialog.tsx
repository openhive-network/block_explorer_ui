// components/CommunitySubscribersDialog.tsx

import React, { useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import Link from "next/link";
import ErrorMessage from "../ErrorMessage";
import useCommunitySubscribers from "@/hooks/api/accountPage/useCommunitySubscribers";
import Hive from "@/types/Hive";
import NoResult from "../NoResult";
import HiveAvatar from "@/components/ui/HiveAvatar";

interface CommunitySubscribersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  communityTitle: string;
}

const SubscriberCard = ({
  subscriber,
}: {
  subscriber: Hive.CommunitySubscriber;
}) => {
  const name = subscriber?.name;
  if (!name) return null;
  return (
    <Link
      href={`/@${name}`}
      className="group flex flex-col items-center justify-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl aspect-square transition-all duration-200 ease-in-out hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105"
    >
      <HiveAvatar
        accountName={name}
        alt={`${name} avatar`}
        size={60}
        className="transition-transform duration-200 group-hover:scale-110"
      />
      <p className="w-full text-center text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
        {name}
      </p>
    </Link>
  );
};

const LoadingNextPage = () => (
  <div className="col-span-full flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
  </div>
);

const CommunitySubscribersDialog: React.FC<CommunitySubscribersDialogProps> = ({
  isOpen,
  onClose,
  communityName,
  communityTitle,
}) => {
  const { t } = useI18n();
  const {
    subscribersData,
    isCommunitySubscribersLoading,
    isCommunitySubscribersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunitySubscribers(communityName);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 300;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const renderContent = () => {
    if (isCommunitySubscribersLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
        </div>
      );
    }
    if (isCommunitySubscribersError) {
      return <ErrorMessage message={t("CommunitySubscribersDialog.error")} />;
    }
    if (subscribersData.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <NoResult
            descriptionKey={t("CommunitySubscribersDialog.noResults")}
          />
        </div>
      );
    }
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 px-2">
          {subscribersData.map((subscriber, index) => (
            <SubscriberCard
              key={`${subscriber.name}-${index}`}
              subscriber={subscriber}
            />
          ))}
          {isFetchingNextPage && <LoadingNextPage />}
        </div>
        {!hasNextPage && (
          <div className="text-center pt-8 pb-4 text-sm text-slate-500">
            {t("CommunitySubscribersDialog.noMoreResults")}
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90%] flex flex-col p-4 sm:p-6 overflow-x-hidden">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="text-center text-xl font-semibold">
            {t("CommunitySubscribersDialog.title")}
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {" "}
              / {communityTitle}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          className="flex-grow min-h-0 overflow-y-auto mt-4"
        >
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySubscribersDialog;
