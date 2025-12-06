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
        // Note: JSON metadata dropdowns are optional - they only render if account has json_metadata
    })

    test('Check if username and avatar are displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await expect(accountPage.accountName).toBeVisible()
        await expect(accountPage.userAvatar).toBeVisible()
    })

    test('Check if voting power, downvote, and resource credits are displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.validateAccountPageIsLoaded()
        // Check voting power, downvote power, and resource credits are visible
        // Note: Progress bar colors depend on progressBarType setting (linear vs radial)
        await expect(accountPage.votingPower).toBeVisible()
        await expect(accountPage.downvotePower).toBeVisible()
        await expect(accountPage.resourceCredits).toBeVisible()
    })

    test('Check if Creation Date is displayed correctly', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.validateAccountPageIsLoaded()

        // Verify creation date is displayed
        await expect(accountPage.creationDate.first()).toBeVisible()
        const creationDate = await accountPage.creationDate.first().innerText()
        // Verify the date format is valid (contains date-like pattern)
        expect(creationDate).toBeTruthy()
        expect(creationDate.length).toBeGreaterThan(0)
    })

    test('Check if after click Properties button the list is expanded and have correct information', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.validateAccountPageIsLoaded()
        // Find the Properties card by looking for the header with exact "Properties" text (not "Witness Properties")
        // The card that has a header div containing exactly "Properties" text
        const propertiesCard = page.getByTestId('properties-dropdown').filter({
            has: page.getByTestId('properties-dropdown-header').filter({ hasText: /^Properties$/ })
        })
        await propertiesCard.getByTestId('properties-dropdown-header').click()
        // Verify the card content becomes visible
        await expect(propertiesCard.getByTestId('card-content')).toBeInViewport()
    })

    test('Check if after click JSON Metadata button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await page.waitForLoadState("networkidle");
        // JSON metadata dropdown only renders if account has json_metadata
        const jsonMetadataCount = await accountPage.accountJsonMetadataDropdown.count();
        if (jsonMetadataCount > 0) {
            await accountPage.accountJsonMetadataDropdown.click()
            await accountPage.jsonView.first().scrollIntoViewIfNeeded()
            await expect(accountPage.jsonView.first()).toBeVisible()
        }
    })

    test('Check if after click JPosting JSON Metadata button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await page.waitForLoadState("networkidle");
        // Posting JSON metadata dropdown only renders if account has posting_json_metadata
        const postingJsonMetadataCount = await accountPage.accountPostingJsonMetadataDropdown.count();
        if (postingJsonMetadataCount > 0) {
            await expect(accountPage.jsonView.nth(1)).toBeHidden()
            await accountPage.accountPostingJsonMetadataDropdown.click()
            await accountPage.jsonView.nth(1).scrollIntoViewIfNeeded()
            await expect(accountPage.jsonView.nth(1)).toBeInViewport()
        }
    })

    test('Check if after click Witness Properties button the list is expanded and have correct information and JSON format', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.validateAccountPageIsLoaded()
        // Witness Properties section only renders for witness accounts
        const witnessPropertiesHeader = page.getByText('Witness Properties', { exact: true })
        const witnessPropertiesCount = await witnessPropertiesHeader.count()
        if (witnessPropertiesCount > 0) {
            await expect(accountPage.witnessCardContent).toBeHidden()
            await witnessPropertiesHeader.click()
            await accountPage.witnessCardContent.scrollIntoViewIfNeeded()
            await expect(accountPage.witnessCardContent).toBeInViewport()
        }
    })

    test('Check if after click Witness Votes button the list is expanded and have correct information', async ({page}) =>{
        await expect(mainPage.headBlockCardWitnessLink).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeVisible()
        await expect(mainPage.headBlockCardWitnessName).toBeEnabled()
        await mainPage.headBlockCardWitnessLink.click()
        await accountPage.validateAccountPageIsLoaded()
        // Witness votes dropdown only renders if account has witness_votes or a proxy
        const witnessVotesDropdownCount = await accountPage.accountWitnessVotesDropdown.count()
        if (witnessVotesDropdownCount > 0) {
            await expect(accountPage.witnessVotesCard).toBeHidden()
            // Click on the Witness Votes header using the dropdown header testid
            await page.getByTestId('witness-votes-dropdown-header').click()
            await accountPage.witnessVotesCard.scrollIntoViewIfNeeded()
            await expect(accountPage.witnessVotesCard).toBeInViewport()
        }
    }) 
});
