import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { BlockPage } from "../support/pages/blockPage";
import { AccountPage } from "../support/pages/accountPage";
import { TransactionPage } from "../support/pages/transactionPage";

test.describe('Block page tests', () => {
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

    test('Validate that block number is the same as in link you clicked', async ({page}) =>{
        test.slow();
        await page.waitForTimeout(5000)
        await expect(mainPage.headBlockCardBlockLink).toBeVisible()
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

    test('Validate that amount of the operations and virtual operations are displayed correctly', async ({page, request}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.operations).toBeVisible()
        await expect(blockPage.operations).toContainText('Operations')

        await expect(blockPage.virtualOperations).toBeVisible()
        await expect(blockPage.virtualOperations).toContainText('Virtual operations')
    })

    test('Validate that See more details is able in the operation list', async ({page, request}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await page.waitForTimeout(2000)
        await expect(blockPage.detailedOperationCard.first()).toBeVisible()
        const opertionTypeList = await blockPage.operationTypeTitle.allInnerTexts()

        if(opertionTypeList.includes('custom_json_operation')){
            await blockPage.expandDetailsBtn.first().click({force:true})
            await expect(blockPage.operationDetails).toBeVisible()
        }
        else{
            console.log('empty')
        }

    })

    test('Validate that you can move to the authors operation page', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await page.waitForTimeout(2000)
        await blockPage.blockProducer.click()
        await expect(accountPage.accountOperationList).toBeVisible()
    });

    test('Validate that you can move to the transaction page of the operation', async ({page}) =>{
        test.slow();
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await blockPage.firstTransactionLink.click()
        await blockPage.page.waitForSelector(transactionPage.transactionDetails['_selector'])
        await expect(transactionPage.transactionHeader).toBeVisible()
        await expect(transactionPage.transactionDetails).toBeVisible()
        await expect(page.url()).toContain('transaction')
    });

    test('Validate that operation properties have correct colors', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.operationType.first()).toHaveCSS('color', 'rgb(0, 0, 0)')
        await expect(blockPage.firstTransactionLink).toHaveCSS('color', 'rgb(30, 79, 156)')
        await expect(blockPage.usernameInOperationDetails).toHaveCSS('color', 'rgb(30, 79, 156)')

        const voteOperationPostLink = await blockPage.voteOperationPostLink

        if(await voteOperationPostLink.isVisible()){
            await expect(blockPage.voteOperationPostLink).toHaveCSS('color', 'rgb(255, 243, 81)')
        }
        else{
            console.log("element is not visible")
        }
    });

    test('Validate that after click JSON Metadata button the list is displayed as JSON format', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.detailedOperationCard.first()).toBeVisible()
        await blockPage.viewBtn.click()
        await blockPage.jsonRawRadioBtn.click()

        await expect(blockPage.operationsJsonFormat).toBeVisible()
    });

    test('Validate that user can move to the next block', async ({page}) =>{
        test.slow();
        await page.waitForTimeout(5000)
        await expect(mainPage.headBlockCardBlockLink).toBeVisible()
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.blockNumber.first()).toBeVisible()

        const blockNumberOnBlockPage = await (blockPage.blockNumber).inputValue()

        await page.waitForTimeout(1000)
        await blockPage.nextBlockBtn.click({force:true})
        await expect(blockPage.detailedOperationCard.first()).toBeVisible()

        const nextBlockNumber = await (blockPage.blockNumber).inputValue()

        await expect(parseInt(nextBlockNumber)).toEqual(parseInt(blockNumberOnBlockPage)+1)
    });

    test('Validate that user can change the Block Time', async ({page,browserName}) =>{
        test.skip(browserName === 'firefox', 'Automatic test works well on chromium');
        test.skip(browserName === 'webkit', 'Automatic test works well on chromium');
        test.slow();
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()

        const blockNumberOnBlockPage = await (blockPage.blockNumber).inputValue()
        console.log(blockNumberOnBlockPage)
        await blockPage.dataTimePicker.click()

        const datePickerDayNotMuted = await page.locator('[data-testid="datepicker-calender"] button:not([class*="text-muted-foreground"])').nth(10);
        await blockPage.monthsDropdown.selectOption({ index: (new Date().getMonth() - 1) % 12 })
        await datePickerDayNotMuted.click();

        await page.waitForTimeout(4000)

        const blockNumberChangedDate = await (blockPage.blockNumber).inputValue()
        await page.waitForTimeout(4000)
        await expect(parseInt(blockNumberChangedDate)).not.toEqual(parseInt(blockNumberOnBlockPage))
    });

    test('Validate that user can move to the Virtual ops by clicking button', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()

        if(await blockPage.virtualOperationsHeader.isVisible()){
            await expect(blockPage.virtualOperationsHeader).toBeVisible()
            const virtualOperationsBefore = await blockPage.virtualOperationsHeader.boundingBox();

             let virtualOperationsBeforeY = virtualOperationsBefore?.y

             await blockPage.toVirtualOpsBtn.click()

            const virtualOperationsAfter = await blockPage.virtualOperationsHeader.boundingBox();

            let virtualOperationsAfterY = virtualOperationsAfter?.y

            await expect(virtualOperationsAfterY).not.toEqual(virtualOperationsBeforeY)
            await expect(blockPage.toTopBtn).toBeVisible()

            await blockPage.toTopBtn.click()
            await page.waitForTimeout(2000)
            const virtualOperationsPosition = await blockPage.virtualOperationsHeader.boundingBox();
            let virtualOperationsPositionClickBtn = virtualOperationsPosition?.y

            await expect(virtualOperationsPositionClickBtn).toEqual(virtualOperationsBeforeY)
        }

        else{
            console.log('There is no virtual operations')
        }
    });

    test.skip('Validate the buttons To Top and To Virtual Ops do not work in Raw Json view option', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        const blockProducerBounding = await blockPage.blockProducer.boundingBox()
        const blockProducerPosition = blockProducerBounding?.y

        // await mainPage.RawJsonViewToggle.click()
        await blockPage.viewBtn.click()
        await blockPage.jsonRawRadioBtn.click()
        await blockPage.toVirtualOpsBtn.click()

        const blockProducerBoundingAfter = await blockPage.blockProducer.boundingBox()
        const blockProducerPositionAfter = blockProducerBoundingAfter?.y

        expect(blockProducerPositionAfter).toEqual(blockProducerPosition)
    });
});
