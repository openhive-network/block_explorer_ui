// The proposals page lists 300+ cards and re-renders while the search box is
// typed in; each card must skip re-rendering when its props are unchanged (#876).
jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: {},
}));
jest.mock(
  "@hiveio/wax",
  () => ({
    WaxError: class WaxError extends Error {},
    WaxRequestAbortedByUser: class WaxRequestAbortedByUser extends Error {},
  }),
  { virtual: true }
);
jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

import { ProposalCard } from "@/components/proposals/ProposalCard";

it("ProposalCard is memoized", () => {
  expect((ProposalCard as unknown as { $$typeof: symbol }).$$typeof).toBe(
    Symbol.for("react.memo")
  );
});
