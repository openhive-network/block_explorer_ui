import { test, expect } from "@playwright/test";
import { Footer } from "../support/pages/footer";

test.describe("Footer tests", () => {
  let footer: Footer;

  test.beforeEach(async ({ page }) => {
    footer = new Footer(page);
  });

  test("footer of block explorer is loaded", async ({ page }) => {
    await footer.gotoBlockExplorerPage();
    await expect(footer.footerElement).toBeVisible();
    await expect(footer.footerHead).toContainText("Block Explorer by HIVE");
    await expect(footer.footerLastCommitHash).toContainText("Last commit hash");
    await expect(footer.footerHafbeVersionHash).toContainText("Hafbe version hash");
  });
});
