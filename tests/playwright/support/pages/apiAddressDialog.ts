import { Locator, Page, expect } from "@playwright/test";

export class ApiAddressDialog {
  readonly page: Page;
  readonly apiAddressDialog: Locator;
  readonly apiAddressHeaderTitle: Locator;
  readonly apiAddressInput: Locator;
  readonly apiAddressResetButton: Locator;
  readonly apiAddressSubmitButton: Locator;
  readonly closeDialog: Locator;
  readonly databaseApiLink: Locator;
  readonly nodeApiLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.apiAddressDialog = page.getByTestId('api-address-dialog');
    this.apiAddressHeaderTitle = page.getByTestId('api-address-header-title');
    this.apiAddressInput = page.getByTestId('api-address-input');
    this.apiAddressResetButton = page.getByTestId('api-address-reset-button');
    this.apiAddressSubmitButton = page.getByTestId('api-address-submit-button');
    this.closeDialog = page.getByTestId('close-dialog');
    this.databaseApiLink = page.getByTestId('api-address-link').first();
    this.nodeApiLink = page.getByTestId('api-address-link').last();
  }

  async openDatabaseApiDialog() {
    await this.databaseApiLink.click();
  }

  async openNodeApiDialog() {
    await this.nodeApiLink.click();
  }

  async closeApiDialog() {
    await this.closeDialog.click();
  }

  async validateDatabaseApiDialogIsLoaded() {
    await expect(this.apiAddressDialog).toBeVisible();
    await expect(this.apiAddressHeaderTitle).toHaveText('Block Explorer backend API address');
    await expect(this.apiAddressInput).toBeVisible();
    await expect(this.apiAddressResetButton).toBeEnabled();
    await expect(this.apiAddressSubmitButton).toBeEnabled();
  }

  async validateNodeApiDialogIsLoaded() {
    await expect(this.apiAddressDialog).toBeVisible();
    await expect(this.apiAddressHeaderTitle).toHaveText('Hive node address');
    await expect(this.apiAddressInput).toBeVisible();
    await expect(this.apiAddressResetButton).toBeEnabled();
    await expect(this.apiAddressSubmitButton).toBeEnabled();
  }

  async typeApiAddress(apiAddress: string) {
    await this.apiAddressInput.fill(apiAddress);
  }

  async validateDatabaseApiInFooter(expectedText: string) {
    await expect(this.databaseApiLink).toHaveText(expectedText);
  }

  async validateNodeApiInFooter(expectedText: string) {
    await expect(this.nodeApiLink).toHaveText(expectedText);
  }

}
