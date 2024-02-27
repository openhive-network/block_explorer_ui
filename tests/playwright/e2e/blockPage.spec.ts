import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { AccountPage } from "../support/pages/accountPage";

test.describe('Block page tests', () => {
    let mainPage: MainPage;
    let blockPage: BlockPage;
    let accountPage: AccountPage;
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        blockPage = new BlockPage(page);
        accountPage = new AccountPage(page);

        await mainPage.gotoBlockExplorerPage();
        
    });

    test('Validate that block number is the same as in link you clicked', async ({page}) =>{
        const mainPageBlockNumber = await mainPage.headBlockCardBlockLink.textContent()
        const formattedReceivedValue = await mainPageBlockNumber.replace(':', '').replace(/\s/g, ' ');
        await mainPage.headBlockCardBlockLink.click()

        const blockNumber = await blockPage.blockDetailsBlockNumber.textContent()

        await expect(formattedReceivedValue).toEqual(blockNumber)

    })

    test('Validate that witness is the same as you expected', async ({page}) =>{
        const currentWitnnessName = await mainPage.currentWitnessName.textContent()

        await mainPage.headBlockCardBlockLink.click()

        const blockProducer = await blockPage.blockProducer.textContent()

        await expect(currentWitnnessName).toEqual(blockProducer)
    })

    test('Validate there are the hash and prev hash', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.hash).toBeVisible()
        await expect(blockPage.prevHash).toBeVisible()
    })
});