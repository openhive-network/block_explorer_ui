import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { AccountPage } from "../support/pages/accountPage";

test.describe('Home page - account searches', () => {
    let mainPage: MainPage;
    let blockPage: BlockPage;
    let accountPage: AccountPage;
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        blockPage = new BlockPage(page);
        accountPage = new AccountPage(page);

        await mainPage.gotoBlockExplorerPage();
    });

    test('Validate that Account Search is impossible without Account Name - Search button is not clickable', async ({page}) => {
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await expect(mainPage.searchButtonInAccount).toBeDisabled()
        await expect(page.getByText('Set account name')).toBeVisible()

        await test.step('Validate that Search button is clickable if Account Name property is filled', async () =>{
        await mainPage.accountNameInputAccountSection.fill('gtg')
        await expect(mainPage.searchButtonInAccount).toBeEnabled()
        await expect(page.getByText('Set account name')).not.toBeVisible()
        })
    })

    test('Validate that got results for Account Name property', async ({page}) =>{
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputAccountSection.fill('gtg')
        await mainPage.searchButtonInAccount.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        await mainPage.goToResultPageBtn.click()
        await expect(accountPage.accountDetails).toBeVisible()
        await expect(accountPage.accountName).toContainText('gtg')
    })

    test('Validate that got results for Account Name and Last days/weeks/months properties', async ({page}) =>{
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputAccountSection.fill('gtg')
        await mainPage.lastBlockBtn.click()
        await mainPage.lastDaysWeeksMonths.click()
        await mainPage.searchButtonInAccount.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        await test.step('Validate that got results for Account Name and Block range properties', async () =>{
            await mainPage.lastDaysWeeksMonths.click()
            await mainPage.blockRange.click()
            await mainPage.searchButtonInAccount.click()
            await expect(mainPage.operationsCardResult).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        })

        await test.step('Validate that got results for Account Name and Time range properties', async () =>{
            await mainPage.blockRange.click()
            await mainPage.timeRange.click()
            await mainPage.searchButtonInAccount.click()
            await expect(mainPage.operationsCardResult).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        })
    })

    test('Validate that got results for Account Name and One Operation Type properties', async ({page}) =>{
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputAccountSection.fill('roelandp')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^vote$/ }).getByRole('checkbox').check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInAccount.click()
    
        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_ops_by_account"));
    
        expect(response.status()).toBe(200);

        await expect(page.getByText('vote', { exact: true }).nth(2)).toBeVisible()

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
                await expect(page.getByText('No operations matching given')).toBeVisible()
              } 

              else {
                await expect(mainPage.operationsCardResult).toBeVisible()
                await expect(mainPage.goToResultPageBtn).toBeVisible()
                await expect(page.getByText('vote', { exact: true }).nth(2)).toBeVisible()
            }
    })

    test('Validate that got results for Account Name and more than one Operation Types properties', async ({page}) =>{
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputAccountSection.fill('gtg')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInAccount.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_ops_by_account"));
    
        expect(response.status()).toBe(200);

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
                await expect(page.getByText('No operations matching given')).toBeVisible()
              } 

              else {
                await expect(mainPage.operationsCardResult).toBeVisible()
                await expect(mainPage.goToResultPageBtn).toBeVisible()
            }
    })

    test('Validate that got results for Account Name and all Operation Types properties', async ({page}) =>{
        await mainPage.accountSearchSection.click()
        await page.waitForTimeout(1000)
        await mainPage.accountNameInputAccountSection.fill('gtg')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByRole('button', { name: 'Select all' }).click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInAccount.click()
        await expect(mainPage.operationsCardResult).toBeVisible()
        await expect(mainPage.goToResultPageBtn).toBeVisible()
    })
});