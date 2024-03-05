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
        await mainPage.commentSearchSection.click()
        await page.waitForTimeout(1000)
    });

    test('Validate that Comment Search is impossible without Account Name - Search button is not clickable', async ({page}) => {
       await expect(mainPage.searchButtonInComment).toBeDisabled()
       await expect(page.getByText('Set account name')).toBeVisible()
    })

    test('Validate that Search button is clickable if Account Name property is filled', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await expect(mainPage.searchButtonInComment).toBeEnabled()
        await expect(page.getByText('Set account name')).not.toBeVisible()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
        
    })

    test('Validate that got results for Account Name and Last days/weeks/months properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.lastBlockBtn.click()
        await mainPage.lastDaysWeeksMonths.click()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
        
    })

    test('Validate that got results for Account Name and Block range properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.lastBlockBtn.click()
        await mainPage.blockRange.click()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name and Time range properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.lastBlockBtn.click()
        await mainPage.timeRange.click()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name and One Operation Type properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name and more than one Operation Types properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name and all Operation Types properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('gtg')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByRole('button', { name: 'Select all' }).click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();
        

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name and Permlink properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name, Permlink and Last days/weeks/months properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.lastBlockBtn.click()
        await page.waitForTimeout(2000)
        await expect(mainPage.lastDaysWeeksMonths).toBeVisible()
        await mainPage.lastDaysWeeksMonths.click()

        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name, Permlink and Block range properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.lastBlockBtn.click()
        await page.waitForTimeout(2000)
        await expect(mainPage.blockRange).toBeVisible()
        await mainPage.blockRange.click()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name, Permlink and Time range properties', async ({page, browserName}) => {
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.lastBlockBtn.click()
        await page.waitForTimeout(2000)
        await expect(mainPage.timeRange).toBeVisible()
        await mainPage.timeRange.click()
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name, Permlink and One Operation Type properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for Account Name, Permlink and more than one Operation Types properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByLabel('Operation Types').locator('li').filter({ hasText: /^comment$/ }).getByRole('checkbox').check()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })

    test('Validate that got results for searching with all inputs filled with properties', async ({page}) => {
        await mainPage.accountNameInputCommentSection.fill('hopestylist')
        await mainPage.commentPermlinkInout.fill('vibes-week-1-on-purpose')
        await mainPage.operationsTypesBtn.click()
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByRole('button', { name: 'Select all' }).click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.searchButtonInComment.click()

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_comment_operations"));
    
        await response.finished();

        if (await page.isVisible(mainPage.noOperationsMatchingTextSection)) {
            await expect(page.getByText('No operations matching given')).toBeVisible()
          } 

          else {
            await expect(mainPage.detailedOperationCard.first()).toBeVisible()
            await expect(mainPage.goToResultPageBtn).toBeVisible()
        }
    })
});