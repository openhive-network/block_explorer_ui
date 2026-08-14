import { test, expect } from "@playwright/test";
import { DashboardPage, MY_BOARD_KEY } from "../support/pages/dashboardPage";
import {
  TEST_ACCOUNT,
  boardKeys,
  readStorage,
  resetDashboard,
  signIn,
} from "../support/session";

const LAYOUT_KEY = `hivescan_dashboard_layouts_${TEST_ACCOUNT}`;
const WIDGETS_KEY = `hivescan_dashboard_widgets_${TEST_ACCOUNT}`;
const ACTIVE_BOARD_KEY = `hivescan_dashboard_active_board_${TEST_ACCOUNT}`;
const UNDO_KEY = `hivescan_board_undo_${TEST_ACCOUNT}`;

test.describe("Dashboard boards", () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await signIn(page);
    await resetDashboard(page);
  });

  test("A signed-in visitor lands on the modular dashboard", async () => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    await expect(dashboard.boardTab(MY_BOARD_KEY)).toBeVisible();
    await expect(dashboard.previewBadge).toBeHidden();
    expect(await dashboard.widgetCount()).toBeGreaterThan(0);
  });

  test("Every shipped board has a tab", async () => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    for (const key of ["me", "network", "market", "governance", "creator"]) {
      await expect(dashboard.boardTab(key)).toBeVisible();
    }
  });

  test("Opening a template shows the preview bar", async () => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    await dashboard.previewTemplate("network");

    await expect(dashboard.previewBadge).toBeVisible();
  });

  // The whole point of a preview: looking must not write to the user's board.
  test("Previewing a template leaves My board untouched in storage", async ({
    page,
  }) => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    const widgetsBefore = await readStorage(page, WIDGETS_KEY);
    const layoutBefore = await readStorage(page, LAYOUT_KEY);

    await dashboard.previewTemplate("market");

    expect(await readStorage(page, WIDGETS_KEY)).toBe(widgetsBefore);
    expect(await readStorage(page, LAYOUT_KEY)).toBe(layoutBefore);
  });

  // A template is read-only, so the edit affordances must not be reachable.
  test("A template cannot be edited", async () => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    await dashboard.previewTemplate("governance");

    await expect(dashboard.editToggle).toBeHidden();
    await expect(dashboard.addWidgetButton).toBeHidden();
  });

  test("The chosen tab is remembered across a reload", async ({ page }) => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    await dashboard.previewTemplate("creator");
    await expect
      .poll(() => readStorage(page, ACTIVE_BOARD_KEY), { timeout: 10000 })
      .toBe("creator");

    await page.reload();
    await dashboard.waitForBoard();

    await expect(dashboard.previewBadge).toBeVisible();
  });

  test("Returning to My board leaves the preview", async () => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    await dashboard.previewTemplate("network");
    await expect(dashboard.previewBadge).toBeVisible();

    await dashboard.boardTab(MY_BOARD_KEY).click();

    await expect(dashboard.previewBadge).toBeHidden();
    await expect(dashboard.editToggle).toBeVisible();
  });

  test("Adopting a template replaces My board and offers an undo", async ({
    page,
  }) => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    const widgetsBefore = await readStorage(page, WIDGETS_KEY);

    await dashboard.previewTemplate("market");
    await dashboard.adoptCurrentTemplate();

    // Back on My board, now holding the template's widgets.
    await expect(dashboard.previewBadge).toBeHidden();
    await expect
      .poll(() => readStorage(page, ACTIVE_BOARD_KEY), { timeout: 10000 })
      .toBe(MY_BOARD_KEY);
    expect(await readStorage(page, WIDGETS_KEY)).not.toBe(widgetsBefore);

    // The replaced board is recoverable.
    expect(await readStorage(page, UNDO_KEY)).not.toBeNull();
    await expect(dashboard.undoBoardButton).toBeVisible();
  });

  test("Undo puts the replaced board back", async ({ page }) => {
    await dashboard.goto();
    await dashboard.waitForBoard();

    const widgetsBefore = await readStorage(page, WIDGETS_KEY);

    await dashboard.previewTemplate("governance");
    await dashboard.adoptCurrentTemplate();
    await expect(dashboard.undoBoardButton).toBeVisible();

    await dashboard.undoBoardButton.click();

    await expect
      .poll(() => readStorage(page, WIDGETS_KEY), { timeout: 15000 })
      .toBe(widgetsBefore);
    // The snapshot is spent, so the undo affordance goes with it.
    await expect(dashboard.undoBoardButton).toBeHidden();
    expect(await readStorage(page, UNDO_KEY)).toBeNull();
  });

  test("Board tabs collapse to a select on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await dashboard.goto();
    await expect(dashboard.boardTabs).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId("board-tabs-mobile")).toBeVisible();
    await expect(dashboard.boardTab(MY_BOARD_KEY)).toBeHidden();
  });

  // A fresh context, because signIn() seeds through addInitScript and that
  // re-runs on every navigation — clearing the key in-page would be undone.
  test("Without a session the guest home is served instead", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const guestPage = await context.newPage();
    const guestDashboard = new DashboardPage(guestPage);

    await guestPage.goto("/");

    await expect(guestPage.getByTestId("guest-view-tab-overview")).toBeVisible({
      timeout: 30000,
    });
    await expect(guestDashboard.boardTabs).toBeHidden();

    await context.close();
  });
});
