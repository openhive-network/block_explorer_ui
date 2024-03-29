import { Locator, Page, expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly accountDetails: Locator;
  readonly accountName: Locator;
  readonly accountTopBar: Locator;
  readonly accountOperationList: Locator;
  readonly accountPropertiesDropdown: Locator;
  readonly accountJsonMetadataDropdown: Locator;
  readonly accountPostingJsonMetadataDropdown: Locator;
  readonly accountWitnessPropertiesDropdown: Locator;
  readonly accountWitnessVotesDropdown: Locator;

  readonly accountOperationTableBlockNumber: Locator;
  readonly accountOperationTableTransactionNumber: Locator;
  readonly accountOperationTableOperationType: Locator;
  readonly accountOperationTableOperationContent: Locator;

  readonly accountOperationTypesButton: Locator;
  readonly operationTypesDialog: Locator;
  readonly operationTypeVoteCheckbox: Locator;
  readonly operationTypeCommentCheckbox: Locator;
  readonly operationTypesDialogFooter: Locator;
  readonly operationTypesDialogApplyButton: Locator;
  readonly operationTypesDialogCancelButton: Locator;

  readonly gotoPageInput: Locator;
  readonly gotoPageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountDetails = page.getByTestId('account-details');
    this.accountName = page.getByTestId('account-name');
    this.accountTopBar = page.getByTestId('account-top-bar');
    this.accountOperationList = page.getByTestId('account-operation-list');
    this.accountPropertiesDropdown = page.getByTestId('properties-dropdown').first();
    this.accountJsonMetadataDropdown = page.getByTestId('account-json-metadata-dropdown').first();
    this.accountPostingJsonMetadataDropdown = page.getByTestId('account-json-metadata-dropdown').last();
    this.accountWitnessPropertiesDropdown = page.getByTestId('properties-dropdown').last();
    this.accountWitnessVotesDropdown = page.getByTestId('witness-votes-dropdown');

    this.accountOperationTableBlockNumber = page.getByTestId('block-number-operation-table');
    this.accountOperationTableTransactionNumber = page.getByTestId('transaction-number');
    this.accountOperationTableOperationType = page.getByTestId('operation-type');
    this.accountOperationTableOperationContent = page.getByTestId('operation-content');

    this.accountOperationTypesButton = page.getByTestId('operations-types-btn');
    this.operationTypesDialog = page.getByTestId('operation-types-dialog');
    this.operationTypeVoteCheckbox = page.getByTestId('operation-type-checkbox-vote_operation');
    this.operationTypeCommentCheckbox = page.getByTestId('operation-type-checkbox-comment_operation');
    this.operationTypesDialogFooter = page.getByTestId('operation-types-dialog-footer');
    this.operationTypesDialogApplyButton = this.operationTypesDialogFooter.getByText('Apply');
    this.operationTypesDialogCancelButton = this.operationTypesDialogFooter.getByText('Cancel');

    this.gotoPageInput = page.getByTestId('input-goto-page');
    this.gotoPageButton = page.getByTestId('button-goto-page');
  }

  async validateAccountPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector(this.accountOperationList['_selector']);
    await expect(this.accountDetails).toBeVisible();
    await expect(this.accountTopBar).toBeVisible();
    await expect(this.accountOperationList).toBeVisible();
    await expect(this.accountJsonMetadataDropdown).toBeVisible();
    await expect(this.accountPostingJsonMetadataDropdown).toBeVisible();
  }

  async validateAccountName(accountName: string){
    await expect(this.accountName).toContainText(accountName);
  }

  async validateOperationTypesDialogIsLoaded(){
    await expect(this.operationTypesDialog).toContainText('Operation Types');
    await expect(this.operationTypeVoteCheckbox).toBeEnabled();
    await expect(this.operationTypeCommentCheckbox).toBeEnabled();
    await expect(this.operationTypesDialog).toContainText('Virtual operations');
    await expect(this.operationTypesDialogFooter).toBeVisible();
    await expect(this.operationTypesDialogApplyButton).toBeVisible();
    await expect(this.operationTypesDialogCancelButton).toBeVisible();
  }

  async gotoTheSpecificOperationPageOfSpecificUser(userName: string, operationPage: string){
    await this.page.goto(`/@${userName}?&page=${operationPage}`);
    await this.page.waitForLoadState("networkidle");
  }

  async gotoTheSpecificUserPage(userName: string){
    await this.page.goto(`/@${userName}`);
    await this.page.waitForLoadState("networkidle");
  }

  async validateSpecificPageUrl(userName: string, pageNumber: string){
    await expect(this.page.url()).toContain(userName);
    await expect(this.page.url()).toContain('page='+ pageNumber);
  }

}
