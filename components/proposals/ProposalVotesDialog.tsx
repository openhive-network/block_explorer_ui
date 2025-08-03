// src/components/proposals/ProposalVotesDialog.tsx

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/i18n';
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useProposalVotes from '@/hooks/api/proposals/useProposalVotes';
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NoResult from '@/components/NoResult';
import { Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';


interface ProposalVotesDialogProps {
  proposalId: number;
  children: React.ReactNode;
}

export const ProposalVotesDialog = ({ proposalId, children }: ProposalVotesDialogProps) => {
  const { t, dir } = useI18n();
  const { votes, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useProposalVotes(proposalId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAsc, setIsAsc] = useState(true);


  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const { scrollHeight, scrollTop, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 300;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredAndSortedVotes = useMemo(() => {
    let processedVotes = [...votes];

    if (searchQuery.length > 2) {
      processedVotes = processedVotes.filter(vote => 
        vote.voter.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    processedVotes.sort((a, b) =>
      isAsc ? a.voter.localeCompare(b.voter) : b.voter.localeCompare(a.voter)
    );

    return processedVotes;
  }, [votes, searchQuery, isAsc]);
  
  const onHeaderClick = () => setIsAsc(prev => !prev);
  const showSorter = () => isAsc ? <ChevronDown size={15} /> : <ChevronUp size={15} />;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-3/4 max-w-4xl flex flex-col p-4">
        <h2 className="text-xl font-bold">
          {t('proposalVotesDialog.title')}{proposalId}
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center w-full h-full">
            <p className="text-red-500">{t('proposalVotesDialog.error')}</p>
          </div>
        ) : (
          <>
            <div className={cn("flex items-center w-full mb-2", { "justify-start": dir !== "rtl", "justify-end": dir === "rtl" })}>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-explorer-dark-gray" />
                <Input
                  placeholder={t('proposalVotesDialog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="relative flex-grow overflow-y-auto bg-theme rounded-md" onScroll={handleScroll}>
              {filteredAndSortedVotes.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 bg-theme z-10">
                    <TableRow rowVariant="header">
                      <TableHead className="cursor-pointer" onClick={onHeaderClick}>
                        <span className="flex items-center gap-1">
                          {t('proposalVotesDialog.voterHeader')} {showSorter()}
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedVotes.map((vote) => (
                      <TableRow key={vote.voter}>
                        <TableCell>
                          <Link
                            href={`/@${vote.voter}`}
                            className="flex items-center space-x-4 py-1 text-link hover:underline"
                          >
                            <Image
                              src={getHiveAvatarUrl(vote.voter)}
                              alt={vote.voter}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <span className="font-medium">
                              {vote.voter}
                            </span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <NoResult descriptionKey={t('proposalVotesDialog.noResults')} />
              )}
              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};