import { Locator, Page, expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly accountDetails: Locator;
  readonly accountName: Locator;
  readonly accountTopBar: Locator;
  readonly accountOperationList: Locator;
  readonly accountDetailedOperationCard: Locator;
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
  readonly filterToggleButton: Locator;
  readonly operationTypesDialog: Locator;
  readonly operationTypeVoteCheckbox: Locator;
  readonly operationTypeCommentCheckbox: Locator;
  readonly operationTypeTransferCheckbox: Locator;
  readonly operationTypeRecurrentTransfer: Locator;
  readonly operationTypeCustomJsonCheckbox: Locator;

  readonly virtualOpTypeFillConvertRequest: Locator;
  readonly virtualOpTypeAuthorReward: Locator;
  readonly virtualOpTypeCurationReward: Locator;
  readonly virtualOpTypeEffectiveCommentVote: Locator;
  readonly virtualOpTypeProducerReward: Locator;

  readonly operationTypesDialogFooter: Locator;
  readonly operationTypesDialogApplyButton: Locator;
  readonly operationTypesDialogCancelButton: Locator;

  readonly nonVirtualOperationsTypeList: Locator;
  readonly virtualOperationsTypeList: Locator;

  readonly operationsTypeSelectAllButton: Locator;
  readonly operationsTypeSelectRealButton: Locator;
  readonly operationsTypeSelectVirtualButton: Locator;
  readonly operationsTypeInvertButton: Locator;
  readonly operationsTypeClearButton: Locator;

  readonly gotoPageInput: Locator;
  readonly gotoPageButton: Locator;

  readonly expandDetailsButton: Locator;
  readonly detailsRow: Locator;
  readonly userAvatar: Locator;
  readonly votingPower: Locator;
  readonly downvotePower: Locator;
  readonly resourceCredits: Locator;
  readonly creationDate: Locator;
  readonly propertiesCardContent: Locator;
  readonly jsonView: Locator;
  readonly witnessCardContent: Locator;
  readonly witnessVotesCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountDetails = page.getByTestId('account-details');
    this.accountName = page.getByTestId('account-name');
    this.accountTopBar = page.getByTestId('account-top-bar');
    this.accountOperationList = page.getByTestId('account-operation-list');
    this.accountDetailedOperationCard = page.getByTestId('detailed-operation-card');
    this.accountPropertiesDropdown = page.getByTestId('properties-dropdown-header').first();
    this.accountJsonMetadataDropdown = page.getByTestId('account-json-metadata-dropdown').first();
    this.accountPostingJsonMetadataDropdown = page.getByTestId('account-json-metadata-dropdown').last();
    this.accountWitnessPropertiesDropdown = page.getByTestId('properties-dropdown-header').last();
    this.accountWitnessVotesDropdown = page.getByTestId('witness-votes-dropdown-header');

    this.accountOperationTableBlockNumber = page.getByTestId('block-number-operation-table');
    this.accountOperationTableTransactionNumber = page.getByTestId('transaction-number');
    this.accountOperationTableOperationType = page.getByTestId('operation-type');
    this.accountOperationTableOperationContent = page.getByTestId('operation-content');

    this.accountOperationTypesButton = page.getByTestId('operations-types-btn');
    this.filterToggleButton = page.getByTestId('filter-toggle-btn');
    this.operationTypesDialog = page.getByTestId('operation-types-dialog');
    this.operationTypesDialogFooter = page.getByTestId('operation-types-dialog-footer');
    this.operationTypesDialogApplyButton = this.operationTypesDialogFooter.getByText('Apply');
    this.operationTypesDialogCancelButton = this.operationTypesDialogFooter.getByText('Cancel');

    this.nonVirtualOperationsTypeList = page.getByTestId('non-virtual-operations-list');
    this.virtualOperationsTypeList = page.getByTestId('virtual-operations-list');

    // These buttons are inside the operation-types-dialog and use i18n translations
    this.operationsTypeSelectAllButton = page.getByTestId('operation-types-dialog').getByRole('button', { name: 'All' });
    this.operationsTypeSelectRealButton = page.getByTestId('operation-types-dialog').getByRole('button', { name: 'Real' });
    this.operationsTypeSelectVirtualButton = page.getByTestId('operation-types-dialog').getByRole('button', { name: 'Virtual' });
    this.operationsTypeInvertButton = page.getByTestId('operation-types-dialog').getByRole('button', { name: 'Invert' });
    this.operationsTypeClearButton = page.getByTestId('operation-types-dialog').getByRole('button', { name: 'Clear' });

    this.operationTypeVoteCheckbox = page.getByTestId('operation-type-checkbox-vote_operation');
    this.operationTypeCommentCheckbox = page.getByTestId('operation-type-checkbox-comment_operation');
    this.operationTypeTransferCheckbox = page.getByTestId('operation-type-checkbox-transfer_operation');
    this.operationTypeRecurrentTransfer = page.getByTestId('operation-type-checkbox-recurrent_transfer_operation');
    this.operationTypeCustomJsonCheckbox = page.getByTestId('operation-type-checkbox-custom_json_operation');

    this.virtualOpTypeFillConvertRequest = page.getByTestId('operation-type-checkbox-fill_convert_request_operation');
    this.virtualOpTypeAuthorReward = page.getByTestId('operation-type-checkbox-author_reward_operation');
    this.virtualOpTypeCurationReward = page.getByTestId('operation-type-checkbox-curation_reward_operation');
    this.virtualOpTypeEffectiveCommentVote = page.getByTestId('operation-type-checkbox-effective_comment_vote_operation');
    this.virtualOpTypeProducerReward = page.getByTestId('operation-type-checkbox-producer_reward_operation');

    this.gotoPageInput = page.getByTestId('input-goto-page');
    this.gotoPageButton = page.getByTestId('button-goto-page');

    this.expandDetailsButton = page.getByTestId('expand-details');
    this.detailsRow = page.getByTestId('details');
    this.userAvatar = page.getByTestId('user-avatar');
    this.votingPower = page.getByTestId('voting-power');
    this.downvotePower = page.getByTestId('downvote-power');
    this.resourceCredits = page.getByTestId('resources-credits');
    this.creationDate = page.getByTestId('creation-date');
    this.propertiesCardContent = page.getByTestId('card-content').first();
    this.jsonView = page.getByTestId('json-format-view');
    this.witnessCardContent = page.getByTestId('card-content').nth(2);
    this.witnessVotesCard = page.getByTestId('witness-votes-content');
  }

  async validateAccountPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector(this.accountOperationList['_selector']);
    await expect(this.accountDetails).toBeVisible();
    await expect(this.accountTopBar).toBeVisible();
    await expect(this.accountOperationList).toBeVisible();
    // Note: JSON metadata dropdowns are optional - they only render if account has json_metadata
  }

  async validateAccountName(accountName: string){
    await expect(this.accountName).toContainText(accountName);
  }

  async validateOperationTypesDialogIsLoaded(){
    await expect(this.operationTypesDialog).toContainText('Operation Types Filters');
    await expect(this.operationTypeVoteCheckbox).toBeEnabled();
    await expect(this.operationTypeCommentCheckbox).toBeEnabled();
    // await expect(this.operationTypesDialog).toContainText('Virtual operations');
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

  async clickOperationTypesButton() {
    // Scroll to top to avoid navbar overlap
    await this.page.evaluate(() => window.scrollTo(0, 0));

    // If dialog is currently visible (closing animation), wait for it to close
    const dialogVisible = await this.operationTypesDialog.isVisible().catch(() => false);
    if (dialogVisible) {
      await this.operationTypesDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(500); // Wait for close animation to complete
    }

    // Wait for button to be visible and stable
    await this.accountOperationTypesButton.waitFor({ state: 'visible', timeout: 10000 });
    // Additional wait for the button to be truly interactable
    await this.page.waitForTimeout(300);

    // Retry logic: try clicking the button and wait for dialog to appear
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Scroll button into view and click
      await this.accountOperationTypesButton.scrollIntoViewIfNeeded();

      // Try regular click first, then force click, then JS click
      try {
        if (attempt <= 2) {
          await this.accountOperationTypesButton.click({ timeout: 2000 });
        } else if (attempt <= 4) {
          await this.accountOperationTypesButton.click({ force: true });
        } else {
          // Last resort: use JavaScript click
          await this.accountOperationTypesButton.evaluate((el: HTMLElement) => el.click());
        }
      } catch {
        // Click failed, will retry
      }

      // Wait for dialog to appear
      try {
        await this.operationTypesDialog.waitFor({ state: 'visible', timeout: 5000 });
        // Wait for dialog content to be ready
        await this.operationTypesDialogFooter.waitFor({ state: 'visible', timeout: 3000 });
        return; // Dialog opened successfully
      } catch {
        if (attempt === maxRetries) {
          throw new Error(`Operation types dialog did not open after ${maxRetries} attempts`);
        }
        // Wait before retrying - increase wait time on each attempt
        await this.page.waitForTimeout(500 * attempt);
      }
    }
  }

}
