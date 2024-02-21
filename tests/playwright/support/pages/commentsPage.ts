import { Locator, Page, expect } from "@playwright/test";

export class CommentsPage {
  readonly page: Page;
  readonly commentsSearch: Locator;
  readonly descriptionCommentsSearch: Locator;
  readonly accountNameInput: Locator;
  readonly permlinkInput: Locator;
  readonly rangeDropDownList: Locator;
  readonly operationsTypesButton: Locator;
  readonly searchButton: Locator;
  readonly labelSetAccountName: Locator;
  readonly operationTypeCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.commentsSearch = page.getByTestId('comments-search-comments-page');
    this.descriptionCommentsSearch = this.commentsSearch.locator('div > p');
    this.accountNameInput = this.commentsSearch.getByTestId('account-name');
    this.permlinkInput = this.commentsSearch.getByTestId('permlink-input');
    this.rangeDropDownList = this.commentsSearch.getByTestId('dropdown-list');
    this.operationsTypesButton = this.commentsSearch.getByTestId('operations-types-btn');
    this.searchButton = this.commentsSearch.getByTestId('search-button');
    this.labelSetAccountName = this.commentsSearch.getByText('Set account name');
    this.operationTypeCard = page.getByTestId('detailed-operation-card');
  }

  async gotoCommentsPage() {
    await this.page.goto("/comments");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoSpecificCommentsPage(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  async validateEmptyCommentsPageIsLoaded() {
    await expect(this.commentsSearch).toBeVisible();
    await expect(this.descriptionCommentsSearch).toHaveText('Find all operations related to comments of given account or for exact permlink.');
    await expect(this.labelSetAccountName).toHaveText('Set account name');
    await expect(this.accountNameInput).toBeVisible();
    await expect(this.permlinkInput).toBeVisible();
    await expect(this.rangeDropDownList).toBeVisible();
    await expect(this.operationsTypesButton).toBeEnabled();
    await expect(this.searchButton).toBeVisible();
    await expect(this.searchButton).not.toBeEnabled();
  }

  async validateSpecificCommentsPageIsLoaded(accountName: string, permlink: string, range: string) {
    await expect(this.commentsSearch).toBeVisible();
    await expect(this.descriptionCommentsSearch).toHaveText('Find all operations related to comments of given account or for exact permlink.');
    await expect(this.labelSetAccountName).not.toBeVisible();
    await expect(this.accountNameInput).toHaveAttribute('value', accountName);
    await expect(this.permlinkInput).toHaveAttribute('value', permlink);
    await expect(this.rangeDropDownList).toHaveText(range);
    await expect(this.operationsTypesButton).toBeEnabled();
    await expect(this.searchButton).toBeVisible();
    await expect(this.searchButton).toBeEnabled();
  }

  async validateOperationTypeCardsAreVisible() {
    await expect((await this.operationTypeCard.all()).length).toBeGreaterThan(0);
  }
}
