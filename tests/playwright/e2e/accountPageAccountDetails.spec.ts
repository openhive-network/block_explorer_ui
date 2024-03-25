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
        await mainPage.headBlockCardWitnessLink.click() 

        const response = await page.waitForResponse((response) => response.url().includes("rpc/get_account"));
        const responseBody = await response.json()

        await expect(response.status()).toBe(200)

        const originalDate = await responseBody.created;
        const parsedDate = new Date(originalDate);

        const addLeadingZero = (number) => (number < 10 ? '0' + number : number);

        const formattedDate = `${addLeadingZero(parsedDate.getDate())}/${addLeadingZero(parsedDate.getMonth() + 1)}/${parsedDate.getFullYear()}`;
        
        console.log(formattedDate)
        
        await expect(accountPage.creationDate).toBeVisible()

        const creationDate = await accountPage.creationDate.innerText()

        await expect(creationDate).toEqual(formattedDate)
    })

    // test('Check if after click Properties button the list is expanded and have correct information', async ({page}) =>{
    //     await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
    //     await expect(mainPage.headBlockCardWitnessName).toBeVisible()
    //     await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
    //     await mainPage.headBlockCardWitnessLink.click()
        
    //     await accountPage.accountPropertiesDropdown.click()
    //     await expect(page.getByTestId('[data-testid="properties-item"]').first()).toBeVisible()
    //     const propertiesrItemsText = await page.getByTestId('[data-testid="properties-item"]').allInnerTexts()

    //     console.log(propertiesrItemsText)
    // })
});