import { test, expect } from "@playwright/test";

test.describe("Navbar tests", () => {
  test("hive block explorer link", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId('navbar')).toBeVisible();
    await expect(page.getByTestId('hive-logo')).toBeVisible();
    await expect(page.getByTestId('hive-block-explorer')).toHaveText('Hive Block Explorer');
    await expect(page.getByTestId('navbar-witnesses-link')).toHaveText('Witnesses');
    await expect(page.getByTestId('toggle')).toHaveText('Raw Json view');
  });
});
