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
        await expect(mainPage.resultBlock).toBeVisible()
    })

    test('Validate searching only by property Account Name', async ({page}) => {
        await mainPage.gotoBlockExplorerPage();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.resultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })
})