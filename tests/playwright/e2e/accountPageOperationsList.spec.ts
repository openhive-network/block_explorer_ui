import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { AccountPage } from "../support/pages/accountPage";

test.describe("Account page - Operations List", () => {
  let accountPage: AccountPage;
  let accountName: string = "arcange";
  let operationPaginationNumber: string = "68002";

  test.beforeEach(async ({ page }) => {
    accountPage = new AccountPage(page);
  });

  test("Validate that account page of arctange user in specific pagination page is displayed", async ({ page }) => {
    await accountPage.gotoTheSpecificOperationPageOfSpecificUser(
      accountName,
      operationPaginationNumber
    );
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);
  });

  test("Click Operations type button and check if modal with operation types is displayed correctly", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
  });
});
