import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";

test.describe('Home page - searches', () => {
    let mainPage: MainPage;
    let blockPage: BlockPage;
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        blockPage = new BlockPage(page);
    });

    test('Validate default searching - Block Search Form with empty inputs', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await expect(mainPage.SearchesSection).toBeVisible();
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.blocksearchResultHeader).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    })

    test('Validate searching only by property Account Name', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching only by property Last blocks', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last blocks')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    })

    test('Validate searching only by property Last days/weeks/months', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last days/weeks/months')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    })

    test('Validate searching only by property Block range', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Block range')
        await mainPage.headblockNumber.fill('3')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        const results = await mainPage.resultBlock.all();
        await expect(results.length).toBe(3);
    })

    test('Validate searching only by Time range', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Time range')
       
        await mainPage.createDate(8, 'February')

        await expect(mainPage.monthName).toBeVisible()
        const monthText = await (mainPage.monthName).inputValue()
        const dayText = await (mainPage.dayName).inputValue()
    
        await mainPage.blockSearchBtn.click()
        await mainPage.resultBlock.last().click()

        await page.waitForLoadState('domcontentloaded')
        await expect(blockPage.producedData).toContainText(monthText)
        await expect(blockPage.producedData).toContainText(dayText)
    })

    test('Validate searching for property Account Name and Last days/weeks/months', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last days/weeks/months')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching for property Account Name and Block range', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Block range')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching for property Account Name and Time range', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()
       
        await mainPage.getOptionfromDropdownOptions('Time range')
       
        await mainPage.createDate(8, 'February')

        await expect(mainPage.monthName).toBeVisible()
        const monthText = await (mainPage.monthName).inputValue()
        const dayText = await (mainPage.dayName).inputValue()
    
        await mainPage.blockSearchBtn.click()
        await mainPage.resultBlock.last().click()

        await page.waitForLoadState('domcontentloaded')
        await expect(blockPage.producedData).toContainText(monthText)
        await expect(blockPage.producedData).toContainText(dayText)
        await mainPage.RawJsonViewToggle.click()
        await expect(blockPage.jsonView).toBeVisible()
        await expect((blockPage.jsonView)).toContainText('gtg')
    })

    test('Validate searching for property only one Operation types', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.blockSearchResultSection).toBeVisible();
        await mainPage.firstResultBlock.click();

        await expect(blockPage.operationType.first()).toBeVisible()
        const operationsType = await blockPage.operationType.allInnerTexts();
        await expect(operationsType).toContain('vote');

    });

    test('Validate searching for property only one Operation types with Property and Value inputs filled', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.pickPropertyBtn.click()
        await mainPage.choosePropertyOption('voter')
        await page.locator('div').filter({ hasText: /^Value$/ }).getByPlaceholder('---').fill('roelandp')
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    });

    test('Validate searching for property only two Operation types - Property and Value inputs should be blocked', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await expect(mainPage.blockSearchBtn).toBeVisible()
        const pickpropertyText = await mainPage.pickPropertyBtnBlocked.innerText()

        await expect(pickpropertyText).toContain('Select exactly 1 operation to use key-value search')
        await expect(mainPage.pickPropertyBtnBlocked).toBeDisabled()
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    });

    test('Validate searching for property only all Operation types - Property and Value inputs should be blocked', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.operationsTypesBtn.click();
        await page.getByRole('button', { name: 'Select all' }).click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await expect(mainPage.SearchesSection).toBeVisible()
        await expect(mainPage.pickPropertyBtnBlocked).toBeDisabled()
        await expect(page.locator('div').filter({ hasText: /^Value$/ }).getByPlaceholder('---')).toBeDisabled()
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    });

    test('Validate searching for property Account Name and one Operation types', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('roelandp')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    });

    test('Validate searching for property Account Name and one Operation types with Property and Value inputs filled', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('roelandp')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.pickPropertyBtn.click()
        await mainPage.choosePropertyOption('voter')
        await page.locator('div').filter({ hasText: /^Value$/ }).getByPlaceholder('---').fill('roelandp')
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    });

    test('Validate searching for property Account Name and two Operation types - Property and Value inputs should be blocked', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('roelandp')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await expect(mainPage.blockSearchBtn).toBeVisible()
        const pickpropertyText = await mainPage.pickPropertyBtnBlocked.innerText()

        await expect(pickpropertyText).toContain('Select exactly 1 operation to use key-value search')
        await expect(mainPage.pickPropertyBtnBlocked).toBeDisabled()
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    });
});