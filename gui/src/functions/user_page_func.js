export const handleNextPage = (
  set_pagination,
  get_last_trx_on_page,
<<<<<<< HEAD
  get_first_trx_on_page,
  setPrevNextPage,
  setPageCount,
  pageCount
) => {
  set_pagination(get_last_trx_on_page);
  setPrevNextPage((prev) => [...prev, get_first_trx_on_page]);
  setPageCount((pageCount += 1));
};

export const handlePrevPage = (
  set_pagination,
  prevNextPage,
  setPrevNextPage,
  setPageCount,
  pageCount
) => {
  setPrevNextPage(prevNextPage.slice(0, -1));
  set_pagination(prevNextPage.pop());
  setPageCount((pageCount -= 1));
=======
  setPage,
  get_first_trx_on_page
) => {
  set_pagination(get_last_trx_on_page);
  setPage((prev) => [...prev, get_first_trx_on_page]);
};

export const handlePrevPage = (setPage, page, set_pagination) => {
  setPage(page.slice(0, -1));
  set_pagination(page.pop());
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
};

export const clearFilters = (
  setEndDateState,
  setStartDateState,
<<<<<<< HEAD
  set_op_filters,
  setPagination,
  setPageCount
=======
  set_op_filters
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
) => {
  setEndDateState(null);
  setStartDateState(null);
  set_op_filters([]);
<<<<<<< HEAD
  setPagination(-1);
  setPageCount(1);
=======
>>>>>>> 7efaf0620017e63760595dfddc85e167fc663d3c
};
