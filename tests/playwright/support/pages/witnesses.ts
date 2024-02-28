import { Locator, Page, expect } from "@playwright/test";

export class Witnesses {
  readonly page: Page;
  readonly tableBody: Locator;
  readonly topWitnessesNames: Locator; // Home Page elements
  readonly witnessName: Locator;    // Witnesses Page elements
  readonly witnessesTableRows: Locator;
  readonly witnessesTableFirstRow: Locator;
  readonly witnessesTableLastRow: Locator;
  readonly witnessesTableSecondRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableBody = page.getByTestId('table-body');
    this.topWitnessesNames = page.getByTestId('witnesses-name').locator('a[class="text-explorer-turquoise"]');
    this.witnessName = page.getByTestId('witness-name');
    this.witnessesTableRows = page.getByTestId('witnesses-table-row');
    this.witnessesTableFirstRow = this.witnessesTableRows.first();
    this.witnessesTableLastRow = this.witnessesTableRows.last();
    this.witnessesTableSecondRow = this.witnessesTableRows.nth(1);
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
