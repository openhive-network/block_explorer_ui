import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";
import { Witnesses } from "../support/pages/witnesses";

test.describe("Home page - witnesses list", () => {
    let mainPage: MainPage;
    let witnessesPage: Witnesses;
  
    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        witnessesPage = new Witnesses(page);
    });
  
    test("Top Witnesses - Check if list is displayed correctly", async ({ page }) => {

      await mainPage.gotoBlockExplorerPage();
      await expect(mainPage.topWitnessesSidebar).toBeVisible()
      await expect(mainPage.witnessesName.first()).toBeVisible()

      const witnessesNumber = await mainPage.witnessesName.count()
      await expect(witnessesNumber).toEqual(20)
    });

    test("Top Witnesses - Check if after click on 'See More' button user is redirected to witnesses page", async ({ page }) => {
      await mainPage.gotoBlockExplorerPage();
      await mainPage.seeMoreBtn.click()
      await expect(witnessesPage.tableBody).toBeVisible()
      await expect(page).toHaveURL('/witnesses')
    });

    test("Check if after move mouse on witnesses name background color is changed", async ({ page }) => {
      await mainPage.gotoBlockExplorerPage();
      const witnessesName = await mainPage.witnessesName.first()


      // expect(
      //   await mainPage.getElementCssPropertyValue(witnessesName, 'background-color')
      // ).toBe('rgb(229, 231, 235)'); 

      await witnessesName.hover()
      await page.waitForTimeout(5000)
      // expect(
      //   await mainPage.getElementCssPropertyValue(witnessesName, 'background-color')
      // ).toBe('rgb(0, 0, 0)');
  
    });
  });
  