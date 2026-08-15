import type { Page } from "@playwright/test";

/**
 * Deterministic network mocks for the Home page account-search e2e tests.
 *
 * The account search fires three live-backend requests that historically made
 * these tests flaky:
 *   1. the account-name autocomplete (`.../input-type/<name>%`)
 *   2. the operation-types list (`.../operation-types`, fired on page load)
 *   3. the operations query (`.../<account>/operations?operation-types=...`)
 *
 * On a slow backend the operations query can exceed Playwright's default
 * response timeout, so instead of waiting on the live responses we fulfil all
 * three with fixed fixtures. This keeps the UI assertions meaningful (results
 * card renders, "vote" rows show) while removing all backend latency.
 */

export interface MockOperation {
  type: string;
  value: Record<string, unknown>;
}

const BASE_BLOCK = 90_000_000;

const buildTrxId = (index: number): string =>
  `${index.toString(16)}`.padStart(40, "a");

/**
 * Build a valid `Hive.AccountOperationsResponse` payload from a list of
 * operations. `total_operations > 0` makes `AccountSearchResults` render the
 * `operations-card` / `go-to-result-page` elements.
 */
export const buildAccountOperationsResponse = (ops: MockOperation[]) => ({
  total_operations: ops.length,
  total_pages: 1,
  block_range: { from: BASE_BLOCK, to: BASE_BLOCK + ops.length },
  operations_result: ops.map((op, index) => ({
    block: BASE_BLOCK + index,
    op_pos: index,
    operation_id: `${BASE_BLOCK + index}-${index}`,
    op: { type: op.type, value: op.value },
    timestamp: "2024-01-01T00:00:00",
    trx_id: buildTrxId(index),
    trx_in_block: 0,
    virtual_op: false,
    op_type_id: 0,
  })),
});

/**
 * A `vote_operation`. The operations table renders its type as the single word
 * "vote" (`getOperationTypeForDisplay` strips the trailing "_operation"), which
 * the tests assert on via `getByText("vote", { exact: true })`.
 */
export const voteOperation = (index: number): MockOperation => ({
  type: "vote_operation",
  value: {
    voter: `voter-${index}`,
    author: `author-${index}`,
    permlink: `permlink-${index}`,
    weight: 10000,
  },
});

/**
 * A `comment_operation`, used by the multi-operation-type test.
 */
export const commentOperation = (index: number): MockOperation => ({
  type: "comment_operation",
  value: {
    parent_author: "",
    parent_permlink: "hive",
    author: `author-${index}`,
    permlink: `permlink-${index}`,
    title: `title-${index}`,
    body: `body-${index}`,
    json_metadata: "{}",
  },
});

/**
 * Intercept the account-operations request and fulfil it with a fixed payload.
 * Matches the hafah-api `accounts.operations` endpoint
 * (`.../<account>/operations?operation-types=...`) regardless of host or query
 * order. Must be registered before the search button is clicked.
 */
export const mockAccountOperations = async (
  page: Page,
  ops: MockOperation[]
): Promise<void> => {
  await page.route(
    (url) =>
      url.pathname.endsWith("/operations") &&
      url.search.includes("operation-types"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildAccountOperationsResponse(ops)),
      });
    }
  );
};

/**
 * Intercept the account-name autocomplete request (`.../input-type/<name>%`)
 * and fulfil it with a fixed account-name list so the autocomplete dropdown
 * renders deterministically. Must be registered before typing the account name.
 */
export const mockInputTypeAccounts = async (
  page: Page,
  accounts: string[]
): Promise<void> => {
  await page.route(
    (url) => url.pathname.includes("/input-type/"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          input_type: "account_name_array",
          input_value: accounts,
        }),
      });
    }
  );
};

/**
 * The hafah-api `operation-types` list (real payload, captured live). Populates
 * the "Operation Types" filter dialog. Fired unconditionally on page load by
 * useOperationsTypes, so mocking it removes the last live-backend dependency
 * from these tests (the dialog's vote/comment/effective_comment_vote checkboxes
 * the tests click come from this list).
 */
const OPERATION_TYPES: {
  op_type_id: number;
  operation_name: string;
  is_virtual: boolean;
}[] = [
  { op_type_id: 0, operation_name: "vote_operation", is_virtual: false },
  { op_type_id: 1, operation_name: "comment_operation", is_virtual: false },
  { op_type_id: 2, operation_name: "transfer_operation", is_virtual: false },
  {
    op_type_id: 3,
    operation_name: "transfer_to_vesting_operation",
    is_virtual: false,
  },
  {
    op_type_id: 4,
    operation_name: "withdraw_vesting_operation",
    is_virtual: false,
  },
  {
    op_type_id: 5,
    operation_name: "limit_order_create_operation",
    is_virtual: false,
  },
  {
    op_type_id: 6,
    operation_name: "limit_order_cancel_operation",
    is_virtual: false,
  },
  {
    op_type_id: 7,
    operation_name: "feed_publish_operation",
    is_virtual: false,
  },
  { op_type_id: 8, operation_name: "convert_operation", is_virtual: false },
  {
    op_type_id: 9,
    operation_name: "account_create_operation",
    is_virtual: false,
  },
  {
    op_type_id: 10,
    operation_name: "account_update_operation",
    is_virtual: false,
  },
  {
    op_type_id: 12,
    operation_name: "account_witness_vote_operation",
    is_virtual: false,
  },
  {
    op_type_id: 18,
    operation_name: "custom_json_operation",
    is_virtual: false,
  },
  {
    op_type_id: 39,
    operation_name: "claim_reward_balance_operation",
    is_virtual: false,
  },
  {
    op_type_id: 49,
    operation_name: "recurrent_transfer_operation",
    is_virtual: false,
  },
  {
    op_type_id: 51,
    operation_name: "author_reward_operation",
    is_virtual: true,
  },
  {
    op_type_id: 52,
    operation_name: "curation_reward_operation",
    is_virtual: true,
  },
  {
    op_type_id: 63,
    operation_name: "comment_benefactor_reward_operation",
    is_virtual: true,
  },
  {
    op_type_id: 64,
    operation_name: "producer_reward_operation",
    is_virtual: true,
  },
  {
    op_type_id: 72,
    operation_name: "effective_comment_vote_operation",
    is_virtual: true,
  },
];

/**
 * Intercept the hafah-api `operation-types` list endpoint and fulfil it with a
 * fixed payload, so the operation-type filter dialog renders deterministically
 * without a live call. Matches the top-level and account-scoped list endpoints
 * (both end in `/operation-types`); does NOT match the ops query
 * (`.../operations?operation-types=...`, which ends in `/operations`).
 */
export const mockOperationTypes = async (page: Page): Promise<void> => {
  await page.route(
    (url) => url.pathname.endsWith("/operation-types"),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(OPERATION_TYPES),
      });
    }
  );
};
