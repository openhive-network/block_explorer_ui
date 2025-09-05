import React from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface Props {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const TopHoldersPagination: React.FC<Props> = ({ currentPage, onPageChange, totalPages }) => {
  const pagesToShow = 5; // Number of page buttons to display
  const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <Pagination>
      <PaginationPrevious
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      />
      {pageNumbers.map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationNext
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      />
    </Pagination>
  );
};

export default TopHoldersPagination;
