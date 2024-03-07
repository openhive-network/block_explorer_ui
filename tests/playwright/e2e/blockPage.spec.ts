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
        await expect(blockPage.seeMoreDetailsBtn.first()).toBeVisible()
    })

    test('Validate that you can move to the authors operation page', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await page.waitForTimeout(2000)
        await blockPage.blockProducer.click()
        await expect(accountPage.accountOperationList).toBeVisible()
    });  

    test.skip('Validate that you can move to the authors operation page after clicking link hidden in See more details', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.detailedOperationCard.first()).toBeVisible()

        // const operationType = await blockPage.operationTypeTitle.allInnerTexts()
        // const operationInCard = await blockPage.detailedOperationCard.filter({hasText: 'comment'})
        // console.log(operationType)

        // if(operationInCard){
        //     await page.getByRole('button', {name: 'See more details'}).first().click()
        // }
        // await page.waitForTimeout(2000)
        // await blockPage.blockProducer.click()
        // await expect(accountPage.accountOperationList).toBeVisible()


        const operationType = await blockPage.detailedOperationCard.allTextContents()
 
        console.log(operationType)
           
        if(operationType.includes('vote')){
            await page.locator('.w-full > div > div:nth-child(3) > .inline-flex').click()
            await expect(page.locator('.flex.flex-col.justify-center.mt-2')).toBeVisible()
          }
    });

    test('Validate that you can move to the transaction page of the operation', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await blockPage.firstTransactionLink.click()
        await expect(transactionPage.transactionHeader).toBeVisible()
        await expect(transactionPage.transactionDetails).toBeVisible()
        await expect(page.url()).toContain('transaction')
    });  

    test('Validate that operation properties have correct colors', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        await expect(blockPage.operationType.first()).toHaveCSS('color', 'rgb(255, 172, 51)')
        await expect(blockPage.firstTransactionLink).toHaveCSS('color', 'rgb(0, 217, 255)')
        await expect(blockPage.usernameInOperationDetails).toHaveCSS('color', 'rgb(100, 255, 170)')

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
        await mainPage.RawJsonViewToggle.click()
        await expect(blockPage.operationsJsonFormat).toBeVisible()
    });  

    test('Validate that user can move to the next block', async ({page}) =>{
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

    test('Validate that user can change the Block Time', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()

        const blockNumberOnBlockPage = await (blockPage.blockNumber).inputValue()
        console.log(blockNumberOnBlockPage)
        await blockPage.dataTimePicker.click()
        await blockPage.firstDayInDataPicker.click()
        await page.waitForTimeout(2000)

        const blockNumberChangedDate = await (blockPage.blockNumber).inputValue()

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

    test('Validate the buttons To Top and To Virtual Ops do not work in Raw Json view option', async ({page}) =>{
        await mainPage.headBlockCardBlockLink.click()
        await expect(blockPage.blockProducer).toBeVisible()
        const blockProducerBounding = await blockPage.blockProducer.boundingBox()
        const blockProducerPosition = blockProducerBounding?.y

        await mainPage.RawJsonViewToggle.click()
        await blockPage.toVirtualOpsBtn.click()

        const blockProducerBoundingAfter = await blockPage.blockProducer.boundingBox()
        const blockProducerPositionAfter = blockProducerBoundingAfter?.y

        expect(blockProducerPositionAfter).toEqual(blockProducerPosition)
    }); 
});