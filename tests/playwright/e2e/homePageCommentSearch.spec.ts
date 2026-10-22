import { test, expect, Page } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import {
  mockCommentOperations,
  mockInputTypeAccounts,
  mockOperationTypes,
  voteOperation,
  commentOperation,
  MockOperation,
} from "../support/mocks/accountOperationsMock";

const ACCOUNT = "hopestylist";
const PERMLINK = "vibes-week-1-on-purpose";

test.describe("Home page - comment searches", () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    // Fail fast on a mistake (well under the old 120s live-response wait)
    // while leaving headroom for the app's one-time wax/wasm init on load.
    test.setTimeout(60_000);

    mainPage = new MainPage(page);
    await mockInputTypeAccounts(page, [ACCOUNT]);
    await mockOperationTypes(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.commentSearchSection.click();
  });

  const selectAccount = async (page: Page) => {
    await mainPage.accountNameInputCommentSection.fill(ACCOUNT);
    await page
      .locator(".autocomplete-result-item")
      .filter({ hasText: ACCOUNT })
      .first()
      .click();
  };

  const fillAccountAndPermlink = async (page: Page) => {
    await selectAccount(page);
    await mainPage.commentPermlinkInout.fill(PERMLINK);
  };

  const pickOperationTypes = async (page: Page, names: RegExp[]) => {
    await mainPage.operationsTypesBtn.click();
    await expect(mainPage.operationsTypesWindow).toBeVisible();
    for (const name of names) {
      await page
        .getByLabel("Operation Types")
        .locator("li")
        .filter({ hasText: name })
        .getByRole("checkbox")
        .check();
    }
    await page.getByRole("button", { name: "Apply" }).click();
  };

  const sortIds = (ids: number[]) => [...ids].sort((a, b) => a - b);

  // The mock answers any query, so check the request carries what was picked.
  const searchAndExpectRows = async (
    page: Page,
    ops: MockOperation[],
    typeIds: number[] = []
  ) => {
    await mockCommentOperations(page, ops);
    const request = page.waitForRequest((r) =>
      r.url().includes("/operations/comments/")
    );
    await mainPage.searchButtonInComment.click();

    const url = new URL((await request).url());
    expect(url.pathname).toContain(
      `/accounts/${ACCOUNT}/operations/comments/${PERMLINK}`
    );
    const sentTypes = url.searchParams.get("operation-types");
    expect(sortIds(sentTypes ? sentTypes.split(",").map(Number) : [])).toEqual(
      sortIds(typeIds)
    );

    await expect(mainPage.detailedOperationCard).toHaveCount(ops.length);
    await expect(mainPage.goToResultPageBtn).toBeVisible();
  };

  test("Search needs both Account Name and Permlink", async ({ page }) => {
    await expect(mainPage.searchButtonInComment).toBeDisabled();

    await selectAccount(page);
    await expect(mainPage.searchButtonInComment).toBeDisabled();

    await mainPage.commentPermlinkInout.fill(PERMLINK);
    await expect(mainPage.searchButtonInComment).toBeEnabled();
  });

  test("Validate that got results for Account Name and Permlink properties", async ({
    page,
  }) => {
    await fillAccountAndPermlink(page);
    await searchAndExpectRows(page, [
      commentOperation(1),
      voteOperation(2),
      voteOperation(3),
    ]);
  });

  test("Validate that got results for Account Name, Permlink and One Operation Type properties", async ({
    page,
  }) => {
    await fillAccountAndPermlink(page);
    await pickOperationTypes(page, [/^vote$/]);
    await searchAndExpectRows(page, [voteOperation(1), voteOperation(2)], [0]);
    await expect(
      mainPage.detailedOperationCard.first().getByText("vote", { exact: true })
    ).toBeVisible();
  });

  test("Validate that got results for Account Name, Permlink and more than one Operation Types properties", async ({
    page,
  }) => {
    await fillAccountAndPermlink(page);
    await pickOperationTypes(page, [/^vote$/, /^comment$/]);
    await searchAndExpectRows(
      page,
      [commentOperation(1), voteOperation(2), commentOperation(3)],
      [0, 1]
    );
  });

  test("Validate that got results for Account Name, Permlink and all Operation Types properties", async ({
    page,
  }) => {
    await fillAccountAndPermlink(page);
    await mainPage.operationsTypesBtn.click();
    await expect(mainPage.operationsTypesWindow).toBeVisible();
    await page.getByRole("button", { name: "All", exact: true }).click();
    await page.getByRole("button", { name: "Apply" }).click();
    // Every comment-related type in the mocked list.
    await searchAndExpectRows(
      page,
      [commentOperation(1), voteOperation(2)],
      [0, 1, 51, 63, 72]
    );
  });

  test("Shows No Results when the comment has no matching operations", async ({
    page,
  }) => {
    await fillAccountAndPermlink(page);
    await mockCommentOperations(page, []);
    await mainPage.searchButtonInComment.click();
    await expect(page.getByText("No Results Found")).toBeVisible();
    await expect(mainPage.detailedOperationCard).toHaveCount(0);
  });
});
