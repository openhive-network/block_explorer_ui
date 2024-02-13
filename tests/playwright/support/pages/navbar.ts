import { Locator, Page } from "@playwright/test";

export class Navbar {
  readonly page: Page;
  readonly navBarElement: Locator;
  readonly navBarHiveLogo: Locator;
  readonly navBarHiveHeaderText: Locator;
  readonly navBarWitnessesLink: Locator;
  readonly navBarJsonRowToggle: Locator;
  readonly searchBarInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBarElement = page.getByTestId('navbar');
    this.navBarHiveLogo = page.getByTestId('navbar');
    this.navBarHiveHeaderText = page.getByTestId('hive-block-explorer');
    this.navBarWitnessesLink = page.getByTestId('navbar-witnesses-link');
    this.navBarJsonRowToggle = this.navBarElement.getByTestId('toggle');
    this.searchBarInput = page.getByTestId('search-bar-input');
  }

  async gotoBlockExplorerPage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }
}
