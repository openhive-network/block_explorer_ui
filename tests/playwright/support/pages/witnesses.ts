import { Locator, Page, expect } from "@playwright/test";

export class Witnesses {
  readonly page: Page;
  readonly tableBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableBody = page.getByTestId('table-body');
  }

  async gotoWitnessesPage() {
    await this.page.goto("/witnesses");
    await this.page.waitForLoadState("networkidle");
  }

  async validateWitnessesPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.tableBody).toBeVisible();
    await expect(this.page.url()).toContain('/witnesses');
  }
}
