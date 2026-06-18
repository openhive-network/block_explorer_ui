import { test, expect } from "@playwright/test";
import { AccountPage } from "../support/pages/accountPage";

// Skipped: Account page API response too slow in CI environment
test.describe.skip("Account page - Pending Rewards Card", () => {
  let accountPage: AccountPage;

  test.beforeEach(async ({ page }) => {
    accountPage = new AccountPage(page);
  });

  test("Pending rewards card is visible in the wallet tab for an active account", async ({
    page,
  }) => {
    await accountPage.gotoTheSpecificUserPage("arcange");
    const card = page.getByTestId("pending-rewards-card");
    await expect(card).toBeVisible();
  });

  test("Pending rewards card expands to show author and curation sub-sections", async ({
    page,
  }) => {
    await accountPage.gotoTheSpecificUserPage("arcange");
    const card = page.getByTestId("pending-rewards-card");
    await expect(card).toBeVisible();

    // The card starts collapsed — click the header to expand
    await card.locator(".cursor-pointer").first().click();
    const content = page.getByTestId("pending-rewards-content");
    await expect(content).toBeVisible();
    await expect(content).toContainText("Author Rewards");
    await expect(content).toContainText("Curation Rewards");
  });

  test("Pending rewards card renders without error for an account with no pending rewards", async ({
    page,
  }) => {
    // Use a new / inactive account that is unlikely to have pending posts or votes
    await accountPage.gotoTheSpecificUserPage("null");
    const card = page.getByTestId("pending-rewards-card");
    await expect(card).toBeVisible();
  });
});
