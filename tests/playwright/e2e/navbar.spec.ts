import { test, expect } from "@playwright/test";
import { Navbar } from "../support/pages/navbar";

test.describe("Navbar tests", () => {
  let navbar: Navbar;

  test.beforeEach(async ({ page }) => {
    navbar = new Navbar(page);
  });

  test("hive block explorer link", async ({ page }) => {
    await navbar.gotoBlockExplorerPage();
    await expect(navbar.navBarElement).toBeVisible();
    await expect(navbar.navBarHiveLogo).toBeVisible();
    await expect(navbar.navBarHiveHeaderText).toHaveText("Hive Block Explorer");
    await expect(navbar.navBarWitnessesLink).toHaveText("Witnesses");
    await expect(navbar.navBarJsonRowToggle).toHaveText("Raw Json view");
    await expect(navbar.searchBarInput).toHaveAttribute("placeholder", "Search user, block, transaction");
  });
});
