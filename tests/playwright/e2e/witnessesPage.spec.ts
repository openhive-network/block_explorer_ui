import { test, Locator, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { Witnesses } from "../support/pages/witnesses";
import { AccountPage } from "../support/pages/accountPage";

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
    await accountPage.validateAccountPageIsLoaded();
    await accountPage.validateAccountName(witnessName);
  });

});
