import { Locator, Page, expect } from "@playwright/test";

export class BlockPage {
  readonly page: Page;
  readonly blockPageSearch: Locator;
  readonly blockPageBlockDetails: Locator;
  readonly blockPageOperationList: Locator;
  readonly blockDetailsBlockNumber: Locator;

  constructor(page: Page) {
    this.page = page;
    this.blockPageSearch = page.getByTestId('block-page-search');
    this.blockPageBlockDetails = page.getByTestId('block-page-block-details');
    this.blockPageOperationList = page.getByTestId('block-page-operation-list');
    this.blockDetailsBlockNumber = page.getByTestId('block-number');
  }

  async validateBlockPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.blockPageSearch).toBeVisible();
    await expect(this.blockPageBlockDetails).toBeVisible();
    await expect(this.blockPageOperationList).toBeVisible();
  }
}
