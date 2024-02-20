import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";

test.describe('Home page - searches', () => {
    let mainPage: MainPage;
    let blockPage: BlockPage;
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        blockPage = new BlockPage(page);

        await mainPage.gotoBlockExplorerPage();
    });

    test('Validate that Comment Search is impossible without Account Name - Search button is not clickable', async ({page}) => {
       await mainPage.commentSearchSection.click()
       await page.waitForTimeout(1000)
       await expect(mainPage.searchButtonInComment).toBeDisabled()
       await expect(page.getByText('Set account name')).toBeVisible()
    })

    test('Validate that Search button is clickable if Account Name property is filled', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await expect(mainPage.searchButtonInComment).toBeEnabled()
        await expect(page.getByText('Set account name')).not.toBeVisible()
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()
    })

    test('Validate that got results for Account Name and Last days/weeks/months properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.lastBlockBtn.click()
        await mainPage.lastDaysWeeksMonths.click()
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()
    })

    test('Validate that got results for Account Name and Block range properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.lastBlockBtn.click()
        await mainPage.blockRange.click()
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()
    })

    test('Validate that got results for Account Name and Time range properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.lastBlockBtn.click()
        await mainPage.timeRange.click()
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()
    })

    test.skip('Validate that got results for Account Name and One Operation Type properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        // add if 
    })

    test.skip('Validate that got results for Account Name and more than one Operation Types properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        // add if 
    })

    test.skip('Validate that got results for Account Name and all Operation Types properties', async ({page}) => {
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputCommentSection.fill('phyna')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByRole('button', { name: 'Select all' }).click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        // add if 
    })
});