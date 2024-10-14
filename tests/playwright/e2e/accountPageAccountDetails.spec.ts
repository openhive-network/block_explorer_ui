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

    test('Check if voting power, downvote, and resource credits are displayed correctly and have properly colors', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await page.waitForTimeout(3000)
        await expect(accountPage.votingPower).toBeVisible()
        await expect(page.locator('.h-full.w-full.flex-1.bg-primary.transition-all').first()).toHaveCSS('background-color', 'rgb(0, 192, 64)')

        await expect(accountPage.downvotePower).toBeVisible()
        await expect(page.locator('.h-full.w-full.flex-1.bg-primary.transition-all').nth(1)).toHaveCSS('background-color', 'rgb(192, 16, 0)')

        await expect(accountPage.resourceCredits).toBeVisible()
        await expect(accountPage.page.locator('.h-full.w-full.flex-1.bg-primary.transition-all').last()).toHaveCSS('background-color', 'rgb(206, 202, 250)')
    })

    test('Check if Creation Date is displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        const currentWitnessName = await mainPage.currentWitnessName.textContent();
        await mainPage.headBlockCardWitnessLink.click()

        const response = await page.waitForResponse((response) => response.url().includes(`hafbe/accounts/${currentWitnessName}`));
        const responseBody = await response.json()

        await expect(response.status()).toBe(200)

        const originalDate = await responseBody.created;
        console.log(originalDate)

        await expect(accountPage.creationDate.first()).toBeVisible()

        const creationDate = await accountPage.creationDate.first().innerText()
        const expectedDatePart = originalDate.split('T')[0];
        const receivedDatePart = creationDate.split(' ')[0].replace(/\//g, '-');

        expect(expectedDatePart).toEqual(receivedDatePart);
    })

    test('Check if after click Properties button the list is expanded and have correct information', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.propertiesCardContent).toBeHidden()
        await accountPage.accountPropertiesDropdown.click()
        await accountPage.propertiesCardContent.scrollIntoViewIfNeeded()
        await expect(accountPage.propertiesCardContent).toBeInViewport()
    })

    test('Check if after click JSON Metadata button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.accountJsonMetadataDropdown.click()
        await accountPage.jsonView.first().scrollIntoViewIfNeeded()
        await expect(accountPage.jsonView.first()).toBeVisible()
    })

    test('Check if after click JPosting JSON Metadata button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.jsonView.nth(1)).toBeHidden()
        await accountPage.accountPostingJsonMetadataDropdown.click()
        await accountPage.jsonView.nth(1).scrollIntoViewIfNeeded()
        await expect(accountPage.jsonView.nth(1)).toBeInViewport()
    })

    test('Check if after click Witness Properties button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.witnessCardContent).toBeHidden()
        await page.getByText('Witness Properties', { exact: true }).click()
        await accountPage.witnessCardContent.scrollIntoViewIfNeeded()
        await expect(accountPage.witnessCardContent).toBeInViewport()
    })

    test('Check if after click Witness Votes button the list is expanded and have correct information', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.witnessVotesCard).toBeHidden()
        await page.getByText(/Witness Votes/, { exact: true }).click()
        await accountPage.accountWitnessVotesDropdown.scrollIntoViewIfNeeded()
        await expect(accountPage.accountWitnessVotesDropdown).toBeInViewport()
    }) // 
});
