import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";

test.describe("Block Explorer UI tests", () => {
  let mainPage: MainPage;
  let blockPage: BlockPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    blockPage = new BlockPage(page);
  });

  test("Home page of block explorer is loaded", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Move to the block page by clicking block link",async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    const blockNumber: string = await mainPage.headBlockCardBlockLink.textContent() || '';
    console.log('111 ', blockNumber);
    await mainPage.headBlockCardBlockLink.click();
    await blockPage.validateBlockPageIsLoaded();
    const blockNumberBlockPage = await blockPage.blockDetailsBlockNumber.textContent();
    console.log('222 ', blockNumberBlockPage);
  });
});
