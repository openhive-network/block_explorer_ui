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

    // Extract number as string from Head Block Card Block Link
    const block: string = await mainPage.headBlockCardBlockLink.textContent() || '';
    const foundNumberInBlock: any = block.match(RegExp(/\d+$/gm));
    const blockNumber: string = foundNumberInBlock[0];


    await mainPage.headBlockCardBlockLink.click();
    await blockPage.validateBlockPageIsLoaded();

    // Extract number as string from Block Page Details Card
    const blockNumberBlockPage = await blockPage.blockDetailsBlockNumber.textContent();
    const foundNumberInBlockDetails: any = block.match(RegExp(/\d+$/gm));
    const blockNumberDetails: string = foundNumberInBlockDetails[0];

    await blockPage.validateBlockNumber(blockNumber); // against block number in head block card
  });
});
