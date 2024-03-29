import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { AccountPage } from "../support/pages/accountPage";

test.describe("Account page - Operations List", () => {
  let accountPage: AccountPage;
  const accountName: string = "arcange";
  const operationPaginationNumber: string = "68002";
  const operationPaginationNumber2: string =  "68091";
  const operationPaginationNumber3: string =  "68050";

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

  test("Validate user can change pagination page of arctange by type value and click button ", async ({ page }) => {
    await accountPage.gotoTheSpecificOperationPageOfSpecificUser(
      accountName,
      operationPaginationNumber2
    );
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);
    await accountPage.validateSpecificPageUrl(accountName,operationPaginationNumber2);
    await accountPage.gotoPageInput.fill(operationPaginationNumber3);
    await accountPage.gotoPageButton.click();
    await accountPage.validateSpecificPageUrl(accountName, operationPaginationNumber3);
  });

  test("Click Operations type button and check if modal with operation types is displayed correctly", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
  });
});
