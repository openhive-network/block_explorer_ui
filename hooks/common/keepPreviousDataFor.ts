// placeholderData for paged tables: while the next page, range or filter
// loads, keep showing the current results, but only when they belong to the
// same account (or block), so another account's rows never appear.
// `sameSubject` compares the previous query's key with the new one.
export const keepPreviousDataFor =
  <T>(sameSubject: (previousKey: readonly unknown[]) => boolean) =>
  (
    previousData: T | undefined,
    previousQuery?: { queryKey: readonly unknown[] }
  ): T | undefined =>
    previousQuery && sameSubject(previousQuery.queryKey)
      ? previousData
      : undefined;
