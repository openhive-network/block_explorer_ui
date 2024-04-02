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

  test("Click Operations type button then click select all option and check if all checkboxes are checked", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click select all
    await accountPage.operationsTypeSelectAllButton.click();
    // Validate checked operations
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).toBeChecked();
    // Validate checkied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).toBeChecked();
  });

  test("Click Operations type button then click select real option and check if correct checkboxes are checked", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click select all
    await accountPage.operationsTypeSelectRealButton.click();
    // Validate checked operations
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).toBeChecked();
    // Validate checkied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
  });

  test("Click Operations type button then click select virtual option and check if correct checkboxes are checked", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click select all
    await accountPage.operationsTypeSelectVirtualButton.click();
    // Validate checked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate checkied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).toBeChecked();
  });

  test("Click Operations type button then click invert option and check if correct checkboxes are checked", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click select all
    await accountPage.operationsTypeInvertButton.click();
    // Validate checked operations
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).toBeChecked();
    // Validate checkied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).toBeChecked();
  });

  test("Click Operations type button then click e.g Select Real option then click clear and check if checkboxes will be unchecked", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click select real
    await accountPage.operationsTypeSelectRealButton.click();
    // Validate checked operations
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).toBeChecked();
    // Validate checkied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click clear
    await accountPage.operationsTypeClearButton.click();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
  });

  test("From operation types list choose one vote operation click apply button and check if filter is working correctly", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click vote operation checkbox
    await accountPage.operationTypeVoteCheckbox.check();
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    // Click Apply button
    await accountPage.operationTypesDialogApplyButton.click();
    // Wait for opeartion type selector
    await accountPage.page.waitForSelector(accountPage.accountOperationTableOperationType.first()['_selector']);
    // Assert vote operation in the list of operations
    await expect(accountPage.accountOperationTableOperationType.first()).toHaveText('vote');
  });

  test("From operation types list choose two operation types click apply button and check if filters are working correctly", async ({ page }) => {
    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    // Validate unchecked operations
    await expect(accountPage.operationTypeVoteCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeCommentCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeTransferCheckbox).not.toBeChecked();
    await expect(accountPage.operationTypeRecurrentTransfer).not.toBeChecked();
    // Validate uncheckied virtual operations
    await expect(accountPage.virtualOpTypeFillConvertRequest).not.toBeChecked();
    await expect(accountPage.virtualOpTypeAuthorReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeCurationReward).not.toBeChecked();
    await expect(accountPage.virtualOpTypeEffectiveCommentVote).not.toBeChecked();
    // Click vote operation checkbox
    await accountPage.operationTypeVoteCheckbox.check();
    await expect(accountPage.operationTypeVoteCheckbox).toBeChecked();
    // Click producer reward virtual operation
    await accountPage.virtualOpTypeProducerReward.check();
    await expect(accountPage.virtualOpTypeProducerReward).toBeChecked();
    // Click Apply button
    await accountPage.operationTypesDialogApplyButton.click();
    // Wait for opeartion type selector
    await accountPage.page.waitForSelector(accountPage.accountOperationTableOperationType.first()['_selector'], {timeout: 30000});
    // Assert vote operation and producer reward virtual operation in the list of operations
    const listOfOperationTypes = await accountPage.accountOperationTableOperationType.allTextContents();
    await expect(listOfOperationTypes).toContain('vote');
    await expect(listOfOperationTypes).toContain('producer_reward');
  });

});
