import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";

test.describe('Home page - searches', () => {
    let mainPage: MainPage;
    
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
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
        await expect(page.locator("[data-testid='produced-data'] > p:nth-of-type(2)")).toContainText(monthText)
        await expect(page.locator("[data-testid='produced-data'] > p:nth-of-type(2)")).toContainText(dayText)
    })
})