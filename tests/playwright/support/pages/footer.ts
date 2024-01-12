import { Locator, Page } from "@playwright/test";

export class Footer {
  readonly page: Page;
  readonly footerElement: Locator;
  readonly footerHead: Locator;
  readonly footerLastCommitHash: Locator;
  readonly footerHafbeVersionHash: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footerElement = page.getByTestId('footer');
    this.footerHead = page.getByTestId('footer-head');
    this.footerLastCommitHash = page.getByTestId('footer-last-commit-hash');
    this.footerHafbeVersionHash = page.getByTestId('footer-hafbe-version-hash');
  }

  async gotoBlockExplorerPage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }
}
