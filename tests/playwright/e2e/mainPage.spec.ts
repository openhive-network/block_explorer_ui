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
    const blockNumber: string = await foundNumberInBlock[0];


    await mainPage.headBlockCardBlockLink.click();
    await blockPage.validateBlockPageIsLoaded();

    // Extract number as string from Block Page Details Card
    const blockNumberBlockPage: string = await blockPage.blockDetailsBlockNumber.textContent() || '';
    const foundNumberInBlockDetails: any = blockNumberBlockPage.match(RegExp(/\d+$/gm));
    const blockNumberDetails: string = await foundNumberInBlockDetails[0];

    await blockPage.validateBlockNumber(blockNumber); // against block number in head block card
    await blockPage.validateBlockNumber(blockNumberDetails); // against block number in Block Page Details Card
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
    const blockNumberBlockPage: string = await blockPage.blockDetailsBlockNumber.textContent() || '';
    const foundNumberInBlockDetails: any = blockNumberBlockPage.match(RegExp(/\d+$/gm));
    const blockNumberDetails: string = foundNumberInBlockDetails[0];

    await blockPage.validateBlockNumber(blockNumber); // against block number in head block card
    await blockPage.validateBlockNumber(blockNumberDetails);
    // Click Hive Block Explorer Link
    await navbar.navBarHiveHeaderText.click();
    // Validate Home Page is loaded
    await mainPage.validateMainPageIsLoaded();
  });

  test("Move to the Account page by clicking current witness link",async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    const currentWitnessName: string = await mainPage.headBlockCardWitnessName.textContent() || '';

    // Click current witness link
    await mainPage.headBlockCardWitnessLink.click();
    // Validate Account Page is loaded
    await accountPage.validateAccountPageIsLoaded();
    // Validate Account Name
    await accountPage.validateAccountName(currentWitnessName);
  });

  test("Move to the Account page by clicking current witness link and back to the home page",async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    const currentWitnessName: string = await mainPage.headBlockCardWitnessName.textContent() || '';

    // Click current witness link
    await mainPage.page.waitForSelector(mainPage.headBlockCardWitnessName['_selector']);
    await mainPage.headBlockCardWitnessLink.click();
    // Validate Account Page is loaded
    await accountPage.page.waitForSelector(accountPage.accountName['_selector']);
    await accountPage.validateAccountPageIsLoaded();
    // Validate Account Name
    await accountPage.validateAccountName(currentWitnessName);
    // Back to the home page
    await navbar.navBarHiveHeaderText.click();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Validate that expanding Fund and Supply list displays the data", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await expect(mainPage.contentFundAndSupplyExpandableList).toBeHidden();
    await mainPage.headBlockCardFundAndSupplyExpandableList.click();
    await expect(mainPage.contentFundAndSupplyExpandableList).not.toBeHidden();
    await mainPage.headBlockCardFundAndSupplyExpandableList.click();
    await expect(mainPage.contentFundAndSupplyExpandableList).toBeHidden();
  });

  test("Validate that expanding Hive Parameters list displays the data", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await expect(mainPage.contentHiveParametersExpandableList).toBeHidden();
    await mainPage.headBlockCardHiveParametersExpandableList.click();
    await expect(mainPage.contentHiveParametersExpandableList).not.toBeHidden();
    await mainPage.headBlockCardHiveParametersExpandableList.click();
    await expect(mainPage.contentHiveParametersExpandableList).toBeHidden();
  });

  test("Validate that expanding Blockchain Dates list displays the data", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await expect(mainPage.contentBlockchainDatesExpandableList).toBeHidden();
    await mainPage.headBlockCardBlockchainDatesExpandableList.click();
    await expect(mainPage.contentBlockchainDatesExpandableList).not.toBeHidden();
    await mainPage.headBlockCardBlockchainDatesExpandableList.click();
    await expect(mainPage.contentBlockchainDatesExpandableList).toBeHidden();
  });
});
