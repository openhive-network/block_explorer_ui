import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { AccountPage } from "../support/pages/accountPage";
import { TransactionPage } from "../support/pages/transactionPage";

test.describe('Account page - account details tests', () => {
    let mainPage: MainPage;
    let blockPage: BlockPage;
    let accountPage: AccountPage;
    let transactionPage: TransactionPage;

    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        blockPage = new BlockPage(page);
        accountPage = new AccountPage(page);
        transactionPage = new TransactionPage(page);

        await mainPage.gotoBlockExplorerPage();

    });

    test('Check if account details table is displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.accountDetails).toBeVisible();
        await expect(accountPage.accountTopBar).toBeVisible();
        await expect(accountPage.accountOperationList).toBeVisible();
        await expect(accountPage.accountJsonMetadataDropdown).toBeVisible();
        await expect(accountPage.accountPostingJsonMetadataDropdown).toBeVisible();
    })

    test('Check if username and avatar are displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.accountName).toBeVisible()
        await expect(accountPage.userAvatar).toBeVisible()
        
  
    })
});