import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { Navbar } from "../support/pages/navbar";
import { AccountPage } from "../support/pages/accountPage";

test.describe("Block Explorer UI tests", () => {
  let mainPage: MainPage;
  let blockPage: BlockPage;
  let navbar: Navbar;
  let accountPage: AccountPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    blockPage = new BlockPage(page);
    navbar = new Navbar(page);
    accountPage = new AccountPage(page);
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

  test("Move to the block page by clicking block link and back to the home page",async ({ page }) => {
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
    // Click Hive Block Explorer Link
    await navbar.navBarHiveHeaderText.click();
    // Validate Home Page is loaded
    await mainPage.validateMainPageIsLoaded();
  });

  test("Move to the Account page by clicking current witness link",async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    const currentWitnessName: string = await mainPage.headBlockCardWitnessName.textContent() || '';
    console.log('111 ', currentWitnessName);
    // Click current witness link
    await mainPage.headBlockCardWitnessLink.click();
    // Validate Account Page is loaded
    await accountPage.validateAccountPageIsLoaded();
    // Validate Account Name
    await accountPage.validateAccountName(currentWitnessName);
  });

});
