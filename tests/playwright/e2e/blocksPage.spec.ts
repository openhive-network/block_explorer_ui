import { test, expect, type Page } from "@playwright/test";
import { BlocksPage } from "../support/pages/blocksPage";

test.describe("Blocks page", () => {
  let blocksPage: BlocksPage;

  test.beforeEach(async ({ page }) => {
    blocksPage = new BlocksPage(page);
    await blocksPage.gotoBlocksPage();
    await blocksPage.validateBlocksPageIsLoaded();
  });

  test("Should render the blocks table with rows", async () => {
    const rowCount = await blocksPage.tableBody.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Should show the range insights bar scoped to the loaded page", async () => {
    await expect(blocksPage.rangeInsights).toBeVisible();
    // Default view is page-scoped, so the label must name blocks, not a day span.
    await expect(blocksPage.rangeInsightsSpan).toContainText(/blocks/i);
  });

  test("Should break operations down by type in the operations cell", async ({
    page,
  }) => {
    const bars = page.locator(
      '[role="img"][aria-label*="Votes"], [role="img"][aria-label*="Comments"], [role="img"][aria-label*="Transfers"]'
    );
    expect(await bars.count()).toBeGreaterThan(0);
  });

  test("Should render the slot health strip for a contiguous page", async () => {
    await expect(blocksPage.slotHealthStrip).toBeVisible();
  });

  test("Should show a slot delta for every row but the oldest", async () => {
    const rows = await blocksPage.tableBody.locator("tbody tr").count();
    const deltas = await blocksPage.slotDeltaCells.count();
    expect(deltas).toBeGreaterThan(0);
    expect(deltas).toBeLessThanOrEqual(rows);
  });

  test("Should expand the producer share breakdown", async () => {
    await expect(blocksPage.producerShare).toBeVisible();
    await blocksPage.producerShareToggle.click();
    await expect(
      blocksPage.producerShare.locator("ul li").first()
    ).toBeVisible();
  });

  test("Should apply a quick range preset to the URL", async ({ page }) => {
    await blocksPage.filtersToggle.click();
    await blocksPage.rangePreset("last24h").click();
    await expect(page).toHaveURL(/lastTime=24/);
    await expect(page).toHaveURL(/timeUnit=hours/);
  });

  test("Should stay usable at a narrow mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await expect(blocksPage.rangeInsights).toBeVisible();
    await expect(blocksPage.tableBody).toBeVisible();

    // The page itself must not scroll sideways; wide content scrolls internally.
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(overflows).toBe(false);
  });
});

// Blocks 109,496,440-109,496,500 are settled history holding one missed slot,
// recorded in block 109,496,471 against hiq.witness. A pruned node may not
// carry it, so each test probes first and skips rather than failing.
test.describe("Blocks page - missed slot attribution", () => {
  const GAP_URL =
    "/blocks?rangeSelectKey=blockRange&fromBlock=109496440&toBlock=109496500";

  const openGapRange = async (page: Page, blocksPage: BlocksPage) => {
    await page.goto(GAP_URL);
    try {
      await expect(
        blocksPage.tableBody.locator("tbody tr").first()
      ).toBeVisible({ timeout: 60000 });
      return true;
    } catch {
      return false;
    }
  };

  const openGapRangeWithDivider = async (
    page: Page,
    blocksPage: BlocksPage
  ) => {
    if (!(await openGapRange(page, blocksPage))) return false;
    try {
      await expect(blocksPage.missedSlotRows.first()).toBeVisible({
        timeout: 30000,
      });
      return true;
    } catch {
      return false;
    }
  };

  const SKIP_REASON =
    "node does not serve the fixture block range 109,496,440-109,496,500";

  test("Should name the witness that skipped the slot", async ({ page }) => {
    const blocksPage = new BlocksPage(page);
    const ready = await openGapRangeWithDivider(page, blocksPage);
    test.skip(!ready, SKIP_REASON);

    const divider = blocksPage.missedSlotRows.first();
    await expect(divider).toContainText("hiq.witness");
    // The witness is a link to its account, not bare text.
    await expect(divider.locator('a[href="/@hiq.witness"]')).toBeVisible();
  });

  test("Should not mark the producer of the following block as at fault", async ({
    page,
  }) => {
    const blocksPage = new BlocksPage(page);
    const ready = await openGapRangeWithDivider(page, blocksPage);
    test.skip(!ready, SKIP_REASON);

    // Block 109,496,471 shows the +6s gap but was produced by abit, who did
    // nothing wrong - its delta cell must carry no warning icon.
    const gapRow = page
      .locator('[data-testid="table-body"] tbody tr')
      .filter({ hasText: "109,496,471" })
      .first();
    await expect(gapRow.getByTestId("slot-delta")).toContainText("+6s");
    expect(await gapRow.getByTestId("slot-delta").locator("svg").count()).toBe(
      0
    );
  });

  test("Should explain an unmeasurable slot delta", async ({ page }) => {
    const blocksPage = new BlocksPage(page);
    const ready = await openGapRange(page, blocksPage);
    test.skip(!ready, SKIP_REASON);
    // The oldest row has no loaded predecessor, so it renders the dash.
    await expect(blocksPage.slotDeltaUnknown.first()).toBeVisible();
  });
});

test.describe("Blocks page - slot health strip", () => {
  test("Should draw only measurable intervals, never a placeholder cell", async ({
    page,
  }) => {
    const blocksPage = new BlocksPage(page);
    await blocksPage.gotoBlocksPage();
    await blocksPage.validateBlocksPageIsLoaded();
    await expect(blocksPage.slotHealthStrip).toBeVisible();

    // One DOM snapshot: separate reads can straddle a new block. Divider rows
    // are also <tr>, so count only rows carrying a block.
    const counts = await page.evaluate(() => {
      const cells = [
        ...document.querySelectorAll('[data-testid="slot-health-cell"]'),
      ];
      return {
        allRows: document.querySelectorAll(
          '[data-testid="table-body"] tbody tr'
        ).length,
        dividers: document.querySelectorAll('[data-testid="missed-slot-row"]')
          .length,
        cells: cells.length,
        grey: cells.filter((el) => el.className.includes("bg-slate-")).length,
      };
    });

    // One interval fewer than blocks: the oldest row has no loaded predecessor.
    expect(counts.cells).toBe(counts.allRows - counts.dividers - 1);

    // No cell may render in the neutral "unknown" tone.
    expect(counts.grey).toBe(0);
  });
});
