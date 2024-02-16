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
}
