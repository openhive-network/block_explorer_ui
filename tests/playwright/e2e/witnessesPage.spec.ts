import { test, Locator, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { Witnesses } from "../support/pages/witnesses";
import { AccountPage } from "../support/pages/accountPage";
import { VotesHistoryDialog } from "../support/pages/votesHistoryDialog";
import { VotersDialog } from "../support/pages/votersDialog";
import { ApiHelper } from "../support/apiHelper";

test.describe("Witnesses page", () => {
  let mainPage: MainPage;
  let witnessesPage: Witnesses;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    witnessesPage = new Witnesses(page);
  });

  test("Compare top witnesses from home page with first 20 witnesses on Witnesses page", async ({
    page,
  }) => {
    await mainPage.gotoBlockExplorerPage();

    // Get 20 Top Witnesses Names from Home Page
    const topWitnesses: Locator[] = await witnessesPage.topWitnessesNames.all();
    let topWitnessesNames: string[] = [];
    await Promise.all(
      topWitnesses.map(async (ele, i) => {
        return topWitnessesNames.push((await ele.textContent()) || "");
      })
    );

    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();

    // Get 20 Witnesses Names from Witnesses Page
    const witnesses: Locator[] = await witnessesPage.witnessName.all();
    let witnessesNames: string[] = [];
    await Promise.all(
      witnesses.map(async (ele, i) => {
        if (i <= 20)
          return witnessesNames.push((await ele.textContent()) || "");
      })
    );

    await expect(witnessesNames).toEqual(
      expect.arrayContaining(topWitnessesNames)
    );
  });

  test("Compare the first three witnesses from witnesses page and api", async ({
    page,
  }) => {
    const apiHelper = new ApiHelper(page);
    await mainPage.gotoBlockExplorerPage();

    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();

    // Get the first three witnesses names by condenser api
    const apiWitnessesRespons = await apiHelper.getWitnessesByVote();
    const apiTheFirstThreeWitnesses: string[] = [];

    let i = 0;
    while(i < 3){
      await apiTheFirstThreeWitnesses.push(apiWitnessesRespons.result[i].owner);
      i++;
    }

    // Get the first three witnesses names by ui
    const witnessesNamesArray: string [] = await witnessesPage.witnessName.allTextContents();
    const theFirstThreeWitnesses: string [] = [];

    let j = 0;
    while(j < 3){
      await theFirstThreeWitnesses.push(witnessesNamesArray[j]);
      j++;
    }

    // Compare the first three witnesses names in api and ui
    await expect(apiTheFirstThreeWitnesses).toEqual(
      expect.arrayContaining(theFirstThreeWitnesses)
    );
  });

  test("Check if after move mouse on witnesses name background color is changed", async ({
    page,
  }) => {
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();

    // Validate bg color of the first row
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableFirstRow,
        "background-color"
      )
    ).toBe("rgb(31, 41, 55)");
    // Validate bg color of the first row after hovering
    await witnessesPage.witnessesTableFirstRow.hover();
    await witnessesPage.page.waitForTimeout(1000);
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableFirstRow,
        "background-color"
      )
    ).toBe("rgb(0, 0, 0)");
    // Validate bg color of the second row
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableSecondRow,
        "background-color"
      )
    ).toBe("rgb(17, 24, 39)");
    // Validate bg color of the second row after hovering
    await witnessesPage.witnessesTableSecondRow.hover();
    await witnessesPage.page.waitForTimeout(1000);
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableSecondRow,
        "background-color"
      )
    ).toBe("rgb(0, 0, 0)");
  });

  test("Validate the witness name color", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();

    // Validate color of the first witness name
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessName.first(),
        "color"
      )
    ).toBe("rgb(0, 217, 255)");
    // Validate color of the first witness name after hovering
    await witnessesPage.witnessName.first().hover({ timeout: 2000 });
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessName.first(),
        "color"
      )
    ).toBe("rgb(0, 217, 255)");
  });

  test("Validate the witness row color", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();

    // Validate color of the first row
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableFirstRow,
        "color"
      )
    ).toBe("rgb(255, 255, 255)");
    // Validate color of the first row after hovering
    await witnessesPage.witnessesTableFirstRow.hover({ timeout: 2000 });
    expect(
      await mainPage.getElementCssPropertyValue(
        await witnessesPage.witnessesTableFirstRow,
        "color"
      )
    ).toBe("rgb(255, 255, 255)");
  });

  test("Check if after click on username you will be redirected to user account page", async ({ page }) => {
    const accountPage = new AccountPage(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the Account page
    await witnessesPage.witnessName.first().click();
    await witnessesPage.page.waitForTimeout(1000);
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(witnessName);
  });

  test("Check if after click details button in votes modal with details is displayed correctly", async ({ page }) => {
    const votesHistoryDialog = new VotesHistoryDialog(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the votes history dialog
    await witnessesPage.witnessVotesButtons.first().click();
    await votesHistoryDialog.validateVotesHistoryDialogIsLoaded();
    await votesHistoryDialog.validateWitnessName(witnessName);
    // Close the votes history dialog
    await votesHistoryDialog.votesHistoryDialogCloseButton.click();
  });

  test("Check if after click details button in Voter modal with details is displayed correctly", async ({ page }) => {
    const votersDialog = new VotersDialog(page);

    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the voter dialog
    await witnessesPage.witnessVotersButtons.first().click();
    await votersDialog.validateVotersDialogIsLoaded()
    await votersDialog.validateWitnessName(witnessName);
    // Close the votes history dialog
    await votersDialog.votersDialogCloseButton.click();
  });

  test("Check if after click toggle button category is correctly change to Hive Power in the voters dialog", async ({ page }) => {
    test.slow();
    const votersDialog = new VotersDialog(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the voters dialog
    await witnessesPage.witnessVotersButtons.first().click();
    await votersDialog.validateVotersDialogIsLoaded();
    await votersDialog.validateWitnessName(witnessName);
    // Get first voter votes value in vests
    const currentVoterPower: string = await votersDialog.votersDialogVotesValue.first().textContent() || '';
    // Set toggle button to Hive Power
    await votersDialog.votersDialogVestsHivePowerButton.click();
    await expect(votersDialog.votersDialogVestsHivePowerButton).toHaveAttribute('data-state', 'checked');
    // Get first voter votes value in Hive Power
    const currentVoterHivePower: string = await votersDialog.votersDialogVotesValue.first().textContent() || '';
    // Compare vests and hive power
    await expect(currentVoterPower).not.toMatch(currentVoterHivePower);
    // Close the votes history dialog
    await votersDialog.votersDialogCloseButton.click();
  });

  test("Check if after click toggle button category is correctly change to Hive Power in the votes history dialog", async ({ page }) => {
    const votesHistoryDialog = new VotesHistoryDialog(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the votes history dialog
    await witnessesPage.witnessVotesButtons.first().click();
    await witnessesPage.page.waitForTimeout(3000);
    await votesHistoryDialog.validateVotesHistoryDialogIsLoaded();
    await votesHistoryDialog.validateWitnessName(witnessName);
    // Get first voter vests
    if (await votesHistoryDialog.votesHistoryDialogTableBody.isVisible()){
        const currentVoterPower: string = await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.first().textContent() || '';
        // Set toggle button to Hive Power
        await votesHistoryDialog.votesHistoryDialogVestsHivePowerButton.click();
        await witnessesPage.page.waitForTimeout(3000);
        await expect(votesHistoryDialog.votesHistoryDialogVestsHivePowerButton).toHaveAttribute('data-state', 'checked');
        // Get first voter Hive Power
        const currentVoterHivePower: string = await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.first().textContent() || '';
        // Compare vests and hive power
        await expect(currentVoterPower).not.toBe(currentVoterHivePower);
    } else {
        console.log('Empty votes history');
    }
    // Close the votes history dialog
    await votesHistoryDialog.votesHistoryDialogCloseButton.click();
  });

  test("validate values of the votes history dialog in specific dates", async ({ page }) => {
    const fromDate: string = '2024-03-16T07:00';
    const toDate: string = '2024-03-17T11:20';
    const expectedVoterName: string = 'faniaviera';
    const arrowUp: string = 'lucide lucide-arrow-up-circle';
    const arrowDown: string = 'lucide lucide-arrow-down-circle';
    const expectedVoterCurrentPower: string = '2,014,602.905570'.trim().replace(/[,]/g,'');
    const expectedVoterCurrentPowerNumber: number = parseFloat(expectedVoterCurrentPower);
    // console.log('expectedVoterCurrentPower ', expectedVoterCurrentPower);
    // console.log('expectedVoterCurrentPowerNumber ', expectedVoterCurrentPowerNumber);

    const votesHistoryDialog = new VotesHistoryDialog(page);

    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the votes history dialog
    await witnessesPage.witnessVotesButtons.first().click();
    await witnessesPage.page.waitForTimeout(3000);
    await votesHistoryDialog.validateVotesHistoryDialogIsLoaded();
    await votesHistoryDialog.validateWitnessName(witnessName);

    // Validate votes history dialog
    if (await votesHistoryDialog.votesHistoryDialogTableBody.isVisible()){
      if(witnessName=='arcange'){
        await votesHistoryDialog.votesHistoryDialogFromDatepicker.locator('input').first().fill(fromDate, {force: true});
        await votesHistoryDialog.votesHistoryDialogToDatepicker.locator('input').first().fill(toDate, {force: true});
        await witnessesPage.page.waitForTimeout(3000);

        expect(await votesHistoryDialog.votesHistoryDialogVoterColumn.locator('a').first().textContent()).toBe(expectedVoterName);
        // console.log('first voter: ', await votesHistoryDialog.votesHistoryDialogVoterColumn.locator('a').first().textContent())

        expect(await votesHistoryDialog.votesHistoryDialogVoteArrowColumn.locator('svg').first().getAttribute('class')).toBe(arrowUp);
        // console.log('first voter arrow: ', await votesHistoryDialog.votesHistoryDialogVoteArrowColumn.locator('svg').first().getAttribute('class'))

        const expectedVoterCurrentPowerUi: string = await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.first().textContent() || '';
        const expectedVoterCurrentPowerUiFormated: string = expectedVoterCurrentPowerUi.trim().replace(/[,]/g,'');
        const expectedVoterCurrentPowerUiNumber: number = await parseFloat(expectedVoterCurrentPowerUiFormated);
        await expect(expectedVoterCurrentPowerUiNumber).toBeGreaterThan(expectedVoterCurrentPowerNumber);
        // console.log('first voter power: ', await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.first().textContent())

        expect(await votesHistoryDialog.votesHistoryDialogVoterColumn.locator('a').nth(1).textContent()).toBe(expectedVoterName);
        // console.log('second voter: ', await votesHistoryDialog.votesHistoryDialogVoterColumn.locator('a').nth(1).textContent())

        expect(await votesHistoryDialog.votesHistoryDialogVoteArrowColumn.locator('svg').nth(1).getAttribute('class')).toBe(arrowDown);
        // console.log('second voter arrow: ', await votesHistoryDialog.votesHistoryDialogVoteArrowColumn.locator('svg').nth(1).getAttribute('class'))

        const expectedSecondVoterCurrentPowerUi: string = await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.nth(1).textContent() || '';
        const expectedSecondVoterCurrentPowerUiFormated: string = expectedSecondVoterCurrentPowerUi.trim().replace(/[,]/g,'');
        const expectedSecondVoterCurrentPowerUiNumber: number = await parseFloat(expectedSecondVoterCurrentPowerUiFormated);
        await expect(expectedSecondVoterCurrentPowerUiNumber).toBeGreaterThan(expectedVoterCurrentPowerNumber);
        // console.log('second voter power: ', await votesHistoryDialog.votesHistoryDialogCurrentVoterPowerColumn.nth(1).textContent())

        // await page.waitForTimeout(4000);
      }
      else {
        console.log("The first Witness is different than arcange")
      }
    } else {
        console.log('Empty votes history');
    }
    // Close the votes history dialog
    await votesHistoryDialog.votesHistoryDialogCloseButton.click();
  });


  test("Check if after click arrow button ascending and descending filters work correctly by the voter name and votes", async ({ page }) => {
    const votersDialog = new VotersDialog(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the voters dialog
    await witnessesPage.witnessVotersButtons.first().click();
    await votersDialog.validateVotersDialogIsLoaded();
    await votersDialog.validateWitnessName(witnessName);
    // Get first voter votes value in vests and voter name
    const currentVoterPower: string = await votersDialog.votersDialogVotesValue.first().textContent() || '';
    const firstVoterName: string = await votersDialog.votersDialogVoterName.first().textContent() || '';
    // Filter by votes value
    await votersDialog.votersDialogHeaderVotesButton.click();
    await page.waitForTimeout(2000);
    const descendingVoterPower: string = await votersDialog.votersDialogVotesValue.first().textContent() || '';
    const firstDescendingVoterName: string = await votersDialog.votersDialogVoterName.first().textContent() || '';
    await expect(currentVoterPower).not.toMatch(descendingVoterPower);
    await expect(firstVoterName).not.toMatch(firstDescendingVoterName);
    // Filter by voter name
    await votersDialog.votersDialogHeaderVoterButton.click();
    await page.waitForTimeout(4000);
    const voterName: string = await votersDialog.votersDialogVoterName.first().textContent() || '';
    await votersDialog.votersDialogHeaderVoterButton.click();
    await page.waitForTimeout(4000);
    const filteredVoterName: string = await votersDialog.votersDialogVoterName.first().textContent() || '';
    await expect(voterName).not.toMatch(filteredVoterName);
    // Close the votes history dialog
    await votersDialog.votersDialogCloseButton.click();
  });

  test("Check if after click arrow button ascending and descending filters work correctly by the account and proxy", async ({ page }) => {
    const votersDialog = new VotersDialog(page);
    await mainPage.gotoBlockExplorerPage();
    // Move to the Witnesses page
    await witnessesPage.gotoWitnessesPage();
    await witnessesPage.validateWitnessesPageIsLoaded();
    const witnessName: string = await witnessesPage.witnessName.first().textContent() || '';
    // Move to the voters dialog
    await witnessesPage.witnessVotersButtons.first().click();
    await votersDialog.validateVotersDialogIsLoaded();
    await votersDialog.validateWitnessName(witnessName);
    // Get first voter votes value in vests and voter name
    const accountValue: string = await votersDialog.votersDialogAccountValue.first().textContent() || '';
    // Filter by account value
    await votersDialog.votersDialogHeaderAccountButton.click();
    await page.waitForTimeout(2000);
    const filteredAccountValue: string = await votersDialog.votersDialogVotesValue.first().textContent() || '';
    await expect(accountValue).not.toMatch(filteredAccountValue);
    // Filter by proxy
    await votersDialog.votersDialogHeaderProxyButton.click();
    await page.waitForTimeout(2000);
    const proxiedPowerValue: string = await votersDialog.votersDialogProxiedValue.first().textContent() || '';
    await votersDialog.votersDialogHeaderProxyButton.click();
    await page.waitForTimeout(2000);
    const filteredProxiedPowerValue: string = await votersDialog.votersDialogProxiedValue.first().textContent() || '';
    await expect(proxiedPowerValue).not.toMatch(filteredProxiedPowerValue);
    // Close the votes history dialog
    await votersDialog.votersDialogCloseButton.click();
  });

  // Only to show votes number by different ways
  test.skip("Display votes of arcange ", async ({ page }) => {
    const apiHelper = new ApiHelper(page);

    const response = await apiHelper.getWitnessesByVote();
    console.log('Witnesses by vote: ', await response.result[0]);

    const response1 = await apiHelper.getWitnessesByAccount("arcange");
    console.log('Witnesses by account: ', await response1.result.votes);

    const res2 = await apiHelper.getWitnessesByHafbe();
    console.log('Witnesses by Hafbe: ', await res2[0]);

    const res3 = await apiHelper.getWitnessesDatabaseApi("arcange");
    console.log('Witnesses by datatest api: ', await res3.result.witnesses[0]);

    console.log('     getWitnessesByVote : ', await response.result[0].votes);
    console.log('  getWitnessesByAccount : ', await response1.result.votes);
    console.log('getWitnessesDatabaseApi : ', await res3.result.witnesses[0].votes);
    console.log('    getWitnessesByHafbe : ', await res2[0].vests);
  })
});
