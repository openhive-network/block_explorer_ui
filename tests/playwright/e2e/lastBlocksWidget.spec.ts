import { test, expect } from "@playwright/test";
import { LastBlocksWidget } from "../support/pages/lastBlocksWidget";
import { MainPage } from "../support/pages/mainPage";
import { AccountPage } from "../support/pages/accountPage";
import { BlockPage } from "../support/pages/blockPage";

test.describe("Home Page last blocks widget", () => {
  let homePage: MainPage;
  let accountPage: AccountPage;
  let blockPage: BlockPage;
  let lastBlocksWidget: LastBlocksWidget;

  test.beforeEach(async ({ page }) => {
    homePage = new MainPage(page);
    accountPage = new AccountPage(page);
    blockPage = new BlockPage(page);
    lastBlocksWidget = new LastBlocksWidget(page);
  });

  test("Should move to the account page of the witness by clicking picutre above the bar", async ({ page }) => {
    test.slow();
    await homePage.gotoBlockExplorerPage();
    await homePage.validateMainPageIsLoaded();

    // Cut username from href image attribute
    const regexUuserFromHref: RegExp = /u\/\w+\//igm;
    const userHref: string = await lastBlocksWidget.lastUser.locator('image').getAttribute('href') || '';
    // console.log('User herf arg: ', userHref);
    const uuser: RegExpMatchArray = userHref.match(regexUuserFromHref) as RegExpMatchArray;
    // console.log('User with u: ', uuser);
    const regexUser: RegExp = /[\w+]{2,}/igm;
    const userArray: RegExpMatchArray = uuser[0].match(regexUser) as RegExpMatchArray;
    const user: string = userArray[0];
    // console.log('User ', user);

    await lastBlocksWidget.lastUser.click();
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(user);
  });

  test("Should move to the block page by clicking the bar of the latest block", async ({ page }) => {
    test.slow();
    await homePage.gotoBlockExplorerPage();
    await homePage.validateMainPageIsLoaded();

    await page.waitForSelector(lastBlocksWidget.lastUser.locator('image')['_selector']);

    const expectedUserName = await lastBlocksWidget.clickLastWitnessBar();

    await blockPage.validateBlockPageIsLoaded();
    await blockPage.validateBlockProducerName(expectedUserName);
  });
});
