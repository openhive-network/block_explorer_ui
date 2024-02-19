import { Locator, Page, expect } from "@playwright/test";

export class TransactionPage {
  readonly page: Page;
  readonly transactionHeader: Locator;
  readonly transactionHeaderHashBlock: Locator;
  readonly transactionHeaderHash: Locator;
  readonly transactionHeaderBlockNumber: Locator;
  readonly transactionHeaderDate: Locator;

  readonly transactionDetails: Locator;

  readonly detailedOperationCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.transactionHeader = page.getByTestId('transaction-header');
    this.transactionHeaderHashBlock = page.getByTestId('transaction-header-hash-trx');
    this.transactionHeaderHash = this.transactionHeaderHashBlock.locator('span');
    this.transactionHeaderBlockNumber = this.transactionHeader.getByTestId('transaction-header-block-number');
    this.transactionHeaderDate = this.transactionHeader.getByTestId('transaction-header-date');
    this.transactionDetails = page.getByTestId('transaction-details');
    this.detailedOperationCard = page.getByTestId('detailed-operation-card');
  }

  async validateTransactionPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.transactionHeader).toBeVisible();
    await expect(this.detailedOperationCard).toBeVisible();
    await expect(this.transactionDetails).toBeVisible();
  }

  async validateTransactionNumber(trxNumber: string) {
    await expect(this.transactionHeaderHash).toHaveText(trxNumber);
  }

}
