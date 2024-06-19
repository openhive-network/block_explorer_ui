import { test, expect, chromium } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { AccountPage } from "../support/pages/accountPage";
import { AccountPageFilter } from "../support/pages/accountPageFilter";

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
    test.slow();
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
    await accountPage.page.waitForTimeout(5000);
    // Assert vote operation and producer reward virtual operation in the list of operations
    const listOfOperationTypes = await page.locator('.flex.justify-stretch.p-1.rounded > span').allTextContents();
    await page.waitForTimeout(5000)
   
    await expect(listOfOperationTypes).toContain('vote')
    await expect(listOfOperationTypes).toContain('producer_reward');
  });

  test("From operation types list choose vote operation click apply button then click Clear filters button and check if filter is removed", async ({ page }) => {
    test.slow();
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
    await accountPage.page.waitForSelector(accountPage.accountOperationTableOperationType.first()['_selector'], {timeout: 30000});
    await accountPage.page.waitForTimeout(5000);
    // Assert vote operation and producer reward virtual operation in the list of operations
    const listOfOperationTypes = await accountPage.accountOperationTableOperationType.allTextContents();
    await expect(listOfOperationTypes).toContain('vote');
    // Click Clear in operation types
    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
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
    // Click Apply button
    await accountPage.operationTypesDialogApplyButton.click();
    // Wait for opeartion type selector
    await accountPage.page.waitForSelector(accountPage.accountOperationTableOperationType.first()['_selector'], {timeout: 30000});
    await accountPage.page.waitForTimeout(5000);
    // Assert vote operation and producer reward virtual operation in the list of operations
    const listOfOperationTypesAfterClear = await accountPage.accountOperationTableOperationType.allTextContents();
    await expect(listOfOperationTypesAfterClear).toContain('vote');
    await expect(listOfOperationTypesAfterClear).toContain('producer_reward');
  });

  test("From filters dropdown list choose - Last blocks and click apply filters and check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptLastBlocks.click();
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(7000);
    await expect(await accountPage.accountDetailedOperationCard.first()).toBeVisible();
  });

  test("From filters dropdown list choose - Last days/weeks/months and check option for days, click apply filters and check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptLastDaysWeeksMonths.click();
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(7000);
    await expect(await accountPage.accountDetailedOperationCard.first()).toBeVisible();
  });

  test("From filters dropdown list choose - Last days/weeks/months and check option for weeks, click apply filters and check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptLastDaysWeeksMonths.click();
    await accountFilter.searchSelectOptionsListTimesUnits.click();
    await accountFilter.selectOptionWeeksInLastTimesUnits.click();
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(7000);
    await expect(await accountPage.accountDetailedOperationCard.first()).toBeVisible();
  });

  test("From filters dropdown list choose - Last days/weeks/months and check option for months, click apply filters and check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptLastDaysWeeksMonths.click();
    await accountFilter.searchSelectOptionsListTimesUnits.click();
    await accountFilter.selectOptionMonthsInLastTimesUnits.click();
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(7000);
    await expect(await accountPage.accountDetailedOperationCard.first()).toBeVisible();
  });

  test("From filters dropdown list choose - Block range and check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptBlockRange.click();
    await accountFilter.fromBlockInput.fill('84237380');
    await accountFilter.toBlockInput.fill('84237451');
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(5000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe('84,237,451');
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe('84,237,380');
  });

  test("From filters dropdown choose Block range, click apply filters then click clear filters and check if filter is removed", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptBlockRange.click();
    await accountFilter.fromBlockInput.fill('84237380');
    await accountFilter.toBlockInput.fill('84237451');
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(5000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe('84,237,451');
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe('84,237,380');

    await accountFilter.clearFiltersBtn.click();
    await page.waitForTimeout(5000);
    if (await accountPage.accountOperationTableBlockNumber.first().isVisible()){
      expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).not.toBe('84,237,451');
    }
  });

  test("From filters dropdown choose Block range, click apply filters, click clear filters and then again choose the same filter - Block range", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptBlockRange.click();
    await accountFilter.fromBlockInput.fill('84237380');
    await accountFilter.toBlockInput.fill('84237451');
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(5000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe('84,237,451');
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe('84,237,380');

    await accountFilter.clearFiltersBtn.click();
    await page.waitForTimeout(5000);
    if (await accountPage.accountOperationTableBlockNumber.first().isVisible()){
      expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).not.toBe('84,237,451');
    }

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptBlockRange.click();
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(5000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe('84,237,451');
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe('84,237,380');
  });

  // Set bigger viewport to fit the calender in the browser window
  test.use({
    viewport: { width: 1600, height: 1200 },
  });

  test("From filters dropdown list choose - time range and check if filter is working correctly", async ({ browserName, page }) => {
    test.skip(browserName === 'webkit', 'Automatic test works well on chromium');
    test.skip(browserName === 'firefox', 'Automatic test works well on chromium');

    const accountFilter = new AccountPageFilter(page);
    const expectedFirstBlockNumber: string = '84,207,952';
    const expectedLastBlockNumber: string = '84,206,775';

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptTimeRange.click();
    await page.waitForTimeout(3000);
    await accountFilter.datePickerTriggerFromDate.click();
    await accountFilter.setDateTime('2024', 'April', '3', '10', '00', '00', accountFilter.datePickerTriggerFromDate);
    await accountFilter.datePickerTriggerToDate.click();
    await accountFilter.setDateTime('2024', 'April', '3', '11', '00', '00', accountFilter.datePickerTriggerToDate);
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(5000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe(expectedFirstBlockNumber);
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe(expectedLastBlockNumber);
  });

  test("From filters dropdown list choose - Block range and operation types as custom json check if filter is working correctly", async ({ page }) => {
    const accountFilter = new AccountPageFilter(page);

    await accountPage.gotoTheSpecificUserPage(accountName);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(accountName);

    await accountPage.accountOperationTypesButton.click();
    await accountPage.validateOperationTypesDialogIsLoaded();
    await accountPage.operationTypeCustomJsonCheckbox.check();
    await expect(accountPage.operationTypeCustomJsonCheckbox).toBeChecked();
    await accountPage.operationTypesDialogApplyButton.click();

    await accountFilter.filterDropdownList.click();
    await accountFilter.searchSelectOptBlockRange.click();
    await accountFilter.fromBlockInput.fill('84181162');
    await accountFilter.toBlockInput.fill('84239571');
    await accountFilter.applyFiltersBtn.click();
    await page.waitForTimeout(10000);
    expect(await accountPage.accountOperationTableBlockNumber.first().textContent()).toBe('84,239,571');
    expect(await accountPage.accountOperationTableBlockNumber.last().textContent()).toBe('84,181,162');

    await accountPage.expandDetailsButton.first().click();
    await expect(accountPage.detailsRow.first()).toBeVisible();
    await expect(accountPage.detailsRow.first()).toContainText('arcange');
  });

});
