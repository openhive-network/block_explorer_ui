import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { AccountPage } from "../support/pages/accountPage";
import { TransactionPage } from "../support/pages/transactionPage"

test.describe('Transaction page - tests', () => {
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

    test('Validate that transaction details are displayed correctly', async ({page}) =>{
        test.slow();
        await page.waitForTimeout(5000);
        await mainPage.headBlockCardBlockLink.click()
        await page.locator('[href*="transaction"]').first().click()
        await expect(transactionPage.transactionHeader).toBeVisible()
        await expect(transactionPage.transactionHeaderBlockNumber).toBeVisible()
        await expect(transactionPage.transactionHeaderDate).toBeVisible()
        await expect(transactionPage.transactionHeaderHash).toBeVisible()
        await expect(transactionPage.transactionHeaderHashBlock).toBeVisible()
        await expect(transactionPage.transactionDetails).toBeVisible()
    });

    test('Validate that transaction details and the list of operations are displayed as JSON format after clicking Raw JSON view toggle', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await page.locator('[href*="transaction"]').first().click()
        await expect(transactionPage.transactionHeader).toBeVisible()
        await expect(transactionPage.transactionDetails).toBeVisible()
        await expect(blockPage.operationTypeTitle).toBeVisible()
        await mainPage.RawJsonViewToggle.click()
        await expect(blockPage.operationsJsonFormat).toBeVisible()
    });
});
