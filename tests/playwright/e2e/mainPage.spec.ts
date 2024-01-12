import { test, expect } from "@playwright/test";
import { MainPage } from "../support/pages/mainPage";

test.describe("Block Explorer UI tests", () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
  });

  test("main page of block explorer is loaded", async ({ page }) => {
    await mainPage.gotoBlockExplorerPage();
    await mainPage.validateMainPageIsLoaded();
  });
});
