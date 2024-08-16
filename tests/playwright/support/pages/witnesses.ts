import { Locator, Page, expect } from "@playwright/test";

export class Witnesses {
  readonly page: Page;
  readonly tableBody: Locator;
  readonly topWitnessesNames: Locator; // Home Page elements
  readonly witnessName: Locator; // Witnesses Page elements
  readonly witnessLink: Locator;
  readonly witnessesTableRows: Locator;
  readonly witnessesTableFirstRow: Locator;
  readonly witnessesTableLastRow: Locator;
  readonly witnessesTableSecondRow: Locator;
  readonly witnessVotesButtons: Locator;
  readonly witnessVotersButtons: Locator;
  readonly firstWitnessVotesButton: Locator;
  readonly firstWitnessVotersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableBody = page.getByTestId("table-body");
    this.topWitnessesNames = page.getByTestId('witnesses-name').locator('a[class="text-explorer-turquoise"]');
    this.witnessName = page.getByTestId("witness-name");
    this.witnessLink = page.getByTestId("witness-link");
    this.witnessesTableRows = page.getByTestId("witnesses-table-row");
    this.witnessesTableFirstRow = this.witnessesTableRows.first();
    this.witnessesTableLastRow = this.witnessesTableRows.last();
    this.witnessesTableSecondRow = this.witnessesTableRows.nth(1);
    this.witnessVotesButtons = page.getByTestId("witness-votes-button");
    this.witnessVotersButtons = page.getByTestId("witness-voters-button");
    this.firstWitnessVotesButton = this.witnessVotesButtons.first();
    this.firstWitnessVotersButton = this.witnessVotersButtons.first();
  }

  async gotoWitnessesPage() {
    await this.page.goto("/witnesses");
    await this.page.waitForLoadState("networkidle");
  }

  async validateWitnessesPageIsLoaded() {
    await this.page.waitForLoadState("networkidle");
    await expect(this.tableBody).toBeVisible();
    await expect(this.page.url()).toContain("/witnesses");
  }
}
