import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly page: Page;
  readonly headBlockCard: Locator;
  readonly lastBlockWidget: Locator;
  readonly SearchesSection: Locator;
  readonly topWitnessesSidebar: Locator;
  readonly witnessesName: Locator;
  readonly seeMoreBtn: Locator;

  readonly headBlockCardBlockLink: Locator;
  readonly headBlockCardWitnessLink: Locator;
  readonly headBlockCardWitnessName: Locator;
  readonly headBlockCardFundAndSupplyExpandableList: Locator;
  readonly headBlockCardHiveParametersExpandableList: Locator;
  readonly headBlockCardBlockchainDatesExpandableList: Locator;
  readonly contentFundAndSupplyExpandableList: Locator;
  readonly contentHiveParametersExpandableList: Locator;
  readonly contentBlockchainDatesExpandableList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headBlockCard = page.getByTestId('head-block-card');
    this.lastBlockWidget = page.getByTestId('last-block-widget');
    this.SearchesSection = page.getByTestId('block-search-section');
    this.topWitnessesSidebar = page.getByTestId('top-witnesses-sidebar');
    this.witnessesName = page.getByTestId('witnesses-name')
    this.seeMoreBtn = page.getByTestId('see-more-btn')
    this.headBlockCardBlockLink = this.headBlockCard.getByTestId('block-number-link');
    this.headBlockCardWitnessLink = this.headBlockCard.getByTestId('current-witness-link');
    this.headBlockCardWitnessName = this.headBlockCard.getByTestId('current-witness-name');
    this.headBlockCardFundAndSupplyExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Fund and Supply');
    this.headBlockCardHiveParametersExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Hive Parameters');
    this.headBlockCardBlockchainDatesExpandableList = this.headBlockCard.getByTestId('expandable-list').getByText('Blockchain Dates');
    this.contentFundAndSupplyExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').first();
    this.contentHiveParametersExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').nth(1);
    this.contentBlockchainDatesExpandableList = this.headBlockCard.getByTestId('conntent-expandable-list').last();
  }

  async gotoBlockExplorerPage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async validateMainPageIsLoaded() {
    await expect(this.headBlockCard).toBeVisible();
    await expect(this.lastBlockWidget).toBeVisible();
    await expect(this.SearchesSection).toBeVisible();
    await expect(this.topWitnessesSidebar).toBeVisible();
  }

  async getElementCssPropertyValue(element: Locator, cssProperty: string) {
    const property = await element.evaluate((ele, css) => {
      return window.getComputedStyle(ele).getPropertyValue(css);
    }, cssProperty);
    // return value of element's css property
    return property;
  }
}
