import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { Navbar } from "../support/pages/navbar";
import { AccountPage } from "../support/pages/accountPage";
import { Witnesses } from "../support/pages/witnesses";
import { ApiAddressDialog } from "../support/pages/apiAddressDialog";
import { CommentsPage } from "../support/pages/commentsPage";

test.describe("Block Explorer UI tests", () => {
  let mainPage: MainPage;
  let blockPage: BlockPage;
  let navbar: Navbar;
  let accountPage: AccountPage;
  let witnessesPage: Witnesses;

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

  test("Move to the block page by clicking block link",async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'This feature is fleaky only in Webkit');
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    // Extract number as string from Head Block Card Block Link
    await mainPage.page.waitForSelector(await mainPage.headBlockCardFundAndSupplyExpandableList['_selector']);
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

  test("Move to the block page by clicking block link and back to the home page",async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'This feature is fleaky only in Webkit');
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    // Extract number as string from Head Block Card Block Link
    await mainPage.page.waitForSelector(await mainPage.headBlockCardFundAndSupplyExpandableList['_selector']);
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
    await mainPage.headBlockCardWitnessLink.click();
    // Validate Account Page is loaded
    await accountPage.validateAccountPageIsLoaded();
    // Validate Account Name
    await accountPage.validateAccountName(currentWitnessName);
    // Back to the home page
    await navbar.navBarHiveHeaderText.click();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Move to the Witness page by clicking the witness link in navbar",async ({ page }) => {
    witnessesPage = new Witnesses(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    // Click the witness link
    await navbar.navBarWitnessesLink.click();
    // Validate Witnesses Page is loaded
    await witnessesPage.validateWitnessesPageIsLoaded();
  });

  test("Move to the Witness page by clicking the witness link in navbar and back to the home page",async ({ page }) => {
    witnessesPage = new Witnesses(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    // Click the witness link
    await navbar.navBarWitnessesLink.click();
    // Validate Witnesses Page is loaded
    await witnessesPage.validateWitnessesPageIsLoaded();
    // Back to the home page
    await navbar.navBarHiveHeaderText.click();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Move to the Witness page by clicking the See more link in Top Witnesses and back to the home page",async ({ page }) => {
    witnessesPage = new Witnesses(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    // Click the See More button inside the Top Witnesses sidebar
    await mainPage.seeMoreBtn.click();
    // Validate Witnesses Page is loaded
    await witnessesPage.validateWitnessesPageIsLoaded();
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

  test("Validate that database api address link open the dialog to change api address", async ({ page }) => {
    const apiAddressDialog = new ApiAddressDialog(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await apiAddressDialog.openDatabaseApiDialog();
    await apiAddressDialog.validateDatabaseApiDialogIsLoaded();
    await apiAddressDialog.closeApiDialog();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Validate that node api address link open the dialog to change api address", async ({ page }) => {
    const apiAddressDialog = new ApiAddressDialog(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await apiAddressDialog.openNodeApiDialog();
    await apiAddressDialog.validateNodeApiDialogIsLoaded();
    await apiAddressDialog.closeApiDialog();
    await mainPage.validateMainPageIsLoaded();
  });

  test("Change database api address and back to the default one", async ({ page }) => {
    const newDatabaseApiAddress: string = 'http://steem-10.syncad.com:3000/rpc';
    const assertNewDatabeseApiAddress: string = 'Explorer backend API:http://steem-10.syncad.com:3000/rpc';
    const assertDefaultDatabaseApiAddress: string = 'Explorer backend API:https://hafbe.openhive.network/rpc';
    const apiAddressDialog = new ApiAddressDialog(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await apiAddressDialog.openDatabaseApiDialog();
    await apiAddressDialog.validateDatabaseApiDialogIsLoaded();
    await apiAddressDialog.typeApiAddress(newDatabaseApiAddress);
    await apiAddressDialog.apiAddressSubmitButton.click();
    await page.waitForTimeout(1000);
    await mainPage.validateMainPageIsLoaded();
    await apiAddressDialog.validateDatabaseApiInFooter(assertNewDatabeseApiAddress);

    await apiAddressDialog.openDatabaseApiDialog();
    await apiAddressDialog.validateDatabaseApiDialogIsLoaded();
    await apiAddressDialog.apiAddressResetButton.click( {force: true} );
    await page.waitForTimeout(1000);
    await mainPage.validateMainPageIsLoaded();
    await apiAddressDialog.validateDatabaseApiInFooter(assertDefaultDatabaseApiAddress);
  });

  test("Change node api address and back to the default one", async ({ page }) => {
    const newNodeApiAddress: string = 'https://rpc.ausbit.dev';
    const AssertNewNodeApiAddress: string = 'Hive node:https://rpc.ausbit.dev'
    const AssertDefaultNodeApiAddress: string = 'Hive node:https://api.hive.blog'
    const apiAddressDialog = new ApiAddressDialog(page);

    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();

    await apiAddressDialog.openNodeApiDialog();
    await apiAddressDialog.validateNodeApiDialogIsLoaded();
    await apiAddressDialog.typeApiAddress(newNodeApiAddress);
    await apiAddressDialog.apiAddressSubmitButton.click();
    await page.waitForTimeout(2000);
    await mainPage.validateMainPageIsLoaded();
    await apiAddressDialog.validateNodeApiInFooter(AssertNewNodeApiAddress);

    await apiAddressDialog.openNodeApiDialog();
    await apiAddressDialog.validateNodeApiDialogIsLoaded();
    await apiAddressDialog.apiAddressResetButton.click();
    await page.waitForTimeout(2000);
    await mainPage.validateMainPageIsLoaded();
    await apiAddressDialog.validateNodeApiInFooter(AssertDefaultNodeApiAddress);
  });

  test("Validate the empty Comment Search is loaded after moving to comments page", async ({ page }) => {
    const commentsPage = new CommentsPage(page);

    await commentsPage.gotoCommentsPage();
    await commentsPage.validateEmptyCommentsPageIsLoaded();
  });

  test.skip("Validate the operations list has correct information after moving to the comments page by the specific URL with author and parmlink", async ({ page }) => {
    const commentsPage = new CommentsPage(page);
    const specificUrl: string = '/comments?accountName=gtg&permlink=power-to-the-hive-but-just-a-little';

    await commentsPage.gotoSpecificCommentsPage(specificUrl);
    await commentsPage.validateSpecificCommentsPageIsLoaded('gtg', 'power-to-the-hive-but-just-a-little', '---');
    await commentsPage.validateOperationTypeCardsAreVisible();
  });

});
