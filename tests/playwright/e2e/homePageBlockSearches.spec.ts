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

    test('Validate default searching - Block Search Form with empty inputs', async ({page}) => {
        await expect(mainPage.SearchesSection).toBeVisible();
        await mainPage.page.waitForTimeout(1000);
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.blocksearchResultHeader).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    })

    test('Validate searching only by property Account Name', async ({page}) => {
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching only by property Last blocks', async ({page}) => {
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last blocks')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    })

    test('Validate searching only by property Last days/weeks/months', async ({page}) => {
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last days/weeks/months')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    })

    test('Validate searching only by property Block range', async ({page}) => {
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Block range')
        await mainPage.headblockNumber.fill('3')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        const results = await mainPage.resultBlock.all();
        await expect(results.length).toBe(3);
    })

    test('Validate searching only by Time range', async ({page,browserName}) => {
        test.skip(browserName === 'webkit', 'Automatic test works well on chromium');
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Time range')
        await page.waitForTimeout(2000)

        const datePickerTriggerFromDate = await mainPage.datePickerTriggerFromDate
        const datePickerDayNotMuted = page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(10);

        await datePickerTriggerFromDate.click();
        await page.locator('[name="years"]').selectOption('2024')

        const dayText = await page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(10).innerText()
        await datePickerDayNotMuted.click();
        await page.waitForTimeout(2000);

        const datePickerTriggerToDate = await mainPage.datePickerTriggerToDate
        const datePickerDayNotMutedToDate = page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(11);
        await datePickerTriggerToDate.click();
        await datePickerDayNotMutedToDate.click();
        await page.waitForTimeout(2000);

        await mainPage.blockSearchBtn.click()
        await mainPage.resultBlock.last().click()

        await page.waitForLoadState('domcontentloaded')
        const producerData = await blockPage.producedData.innerText()
        expect(producerData).toContain(dayText)
    })

    test('Validate searching for property Account Name and Last days/weeks/months', async ({page}) => {
        test.slow();
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Last days/weeks/months')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching for property Account Name and Block range', async ({page}) => {
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()
        await mainPage.getOptionfromDropdownOptions('Block range')
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await mainPage.firstResultBlock.click()
        await expect(page.getByTestId('account-name')).toContainText('gtg')
    })

    test('Validate searching for property Account Name and Time range', async ({page, browserName}) => {
        test.skip(browserName === 'webkit', 'Automatic test works well on chromium');
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        await mainPage.accountNameInput.fill('gtg')
        await mainPage.blockSearchPropertiesFilterBtn.click()

        await mainPage.getOptionfromDropdownOptions('Time range')

        const datePickerTriggerFromDate = await mainPage.datePickerTriggerFromDate
        const datePickerDayNotMuted = page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(10);
        
        await datePickerTriggerFromDate.click();
        await page.locator('[name="years"]').selectOption('2024')

        const dayText = await page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(10).innerText()
        await datePickerDayNotMuted.click();
        await page.waitForTimeout(2000);

        const datePickerTriggerToDate = await mainPage.datePickerTriggerToDate
        const datePickerDayNotMutedToDate = page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(11);
        await datePickerTriggerToDate.click();
        await datePickerDayNotMutedToDate.click();
        await page.waitForTimeout(2000);

        await mainPage.blockSearchBtn.click()
        await mainPage.resultBlock.last().click()

        await page.waitForLoadState('domcontentloaded')

        const producerData = await blockPage.producedData.innerText()
        expect(producerData).toContain(dayText)
        await mainPage.RawJsonViewToggle.click()
        await expect(blockPage.jsonView).toBeVisible()
        await expect((blockPage.jsonView)).toContainText('gtg')
    })

    test('Validate searching for property only one Operation types', async ({page}) => {
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.firstResultBlock).toBeVisible();
        await mainPage.firstResultBlock.click();

        await expect(blockPage.operationType.first()).toBeVisible()
        const operationsType = await blockPage.operationType.allInnerTexts();
        await page.evaluate(async () => {
            for (let i = 0; i < document.body.scrollHeight; i += 100) {
              window.scrollTo(0, i);
            }
          });
        await expect(operationsType).toContain('author_reward');

    });

    test('Validate searching for property only one Operation types with Property and Value inputs filled', async ({page}) => {
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByTestId('operation-type-checkbox-comment_operation').click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.pickPropertyBtn.click()
        await page.getByLabel('author', { exact: true }).click()
        await page.waitForTimeout(2000)
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        await expect(mainPage.firstResultBlock).toBeVisible()
    });

    test('Validate searching for property only two Operation types - Property and Value inputs should be blocked', async ({page}) => {
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
        await mainPage.page.waitForLoadState('networkidle');
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
        await mainPage.page.waitForLoadState('networkidle');
        await mainPage.accountNameInput.fill('roelandp')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.locator('input[type="checkbox"]').first().check();
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.blockSearchResultSection).toBeVisible()
    });

    test('Validate searching for property Account Name and one Operation types with Property and Value inputs filled', async ({page}) => {
        await mainPage.accountNameInput.fill('blocktrades')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        // await page.locator('input[type="checkbox"]').first().check();
        await page.getByTestId('operation-type-checkbox-comment_operation').click()
        await page.getByRole('button', {name: 'Apply'}).click();
        await mainPage.pickPropertyBtn.click()
        // await mainPage.choosePropertyOption('voter')
        await page.getByLabel('author', { exact: true }).click()
        // await page.locator('div').filter({ hasText: /^Value$/ }).getByPlaceholder('---').fill('roelandp')
        await mainPage.blockSearchBtn.click();
        await expect(mainPage.blockSearchResultSection).toBeVisible()
        if(await mainPage.firstResultBlock.isVisible()){
            await expect(mainPage.firstResultBlock).toBeVisible()
        }
        else{
            await expect(page.getByText('No blocks matching given')).toBeVisible()
        }
        // await expect(mainPage.firstResultBlock).toBeVisible()

        // await mainPage.operationsTypesBtn.click();
        // await expect(mainPage.operationsTypesWindow).toBeVisible();
        // await page.getByTestId('operation-type-checkbox-comment_operation').click()
        // await page.getByRole('button', {name: 'Apply'}).click();
        // await mainPage.pickPropertyBtn.click()
        // await page.getByLabel('author', { exact: true }).click()
        // await page.waitForTimeout(2000)
        // await mainPage.blockSearchBtn.click();
        // await expect(mainPage.blockSearchResultSection).toBeVisible()
        // await expect(mainPage.firstResultBlock).toBeVisible()
    });

    test('Validate searching for property Account Name and two Operation types - Property and Value inputs should be blocked', async ({page}) => {
        await mainPage.accountNameInput.fill('roelandp')
        await mainPage.operationsTypesBtn.click();
        await expect(mainPage.operationsTypesWindow).toBeVisible();
        await page.getByTestId('operation-types-dialog').locator('li').filter({ hasText: /^vote$/ }).click()
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

    test("Check if url is correct and contain blocku number and user name", async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'Automatic test works well on chromium');
        const userName = 'gtg'

        await mainPage.accountNameInput.fill(userName)
        await mainPage.blockSearchBtn.click()
        await expect(mainPage.firstResultBlock).toBeVisible()

        const firstBlockNumber = await mainPage.firstResultBlock.innerText()

        await mainPage.firstResultBlock.click()
        await expect(blockPage.producedData).toBeVisible()
        
        const url = await page.url()
        await expect(url).toContain(firstBlockNumber)
        await expect(url).toContain(`accountName=${userName}`)
    })
});
