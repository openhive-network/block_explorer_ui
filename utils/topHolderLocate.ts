export interface TieGroupPage {
  totalPages: number;
  rows: { rank: number; account: string }[];
}

// The API's largest page; keeps the search to a few requests for big groups.
export const TIE_PAGE_SIZE = 1000;

// Accounts sharing a balance are listed by name (byte order), so the tie group
// can be binary-searched by page. Returns the account's exact global rank.
export const findRankInTieGroup = async (
  account: string,
  fetchPage: (page: number) => Promise<TieGroupPage>
): Promise<number | null> => {
  const first = await fetchPage(1);
  let lo = 1;
  let hi = first.totalPages;
  let rows = first.rows;
  let page = 1;

  while (lo <= hi && rows.length) {
    if (account < rows[0].account) {
      hi = page - 1;
    } else if (account > rows[rows.length - 1].account) {
      lo = page + 1;
    } else {
      return rows.find((row) => row.account === account)?.rank ?? null;
    }
    if (lo > hi) break;
    page = Math.floor((lo + hi) / 2);
    rows = (await fetchPage(page)).rows;
  }
  return null;
};
