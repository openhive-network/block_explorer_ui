import { test, expect } from "@playwright/test";
import { DashboardPage } from "../support/pages/dashboardPage";
import {
  TEST_ACCOUNT,
  readStorage,
  resetDashboard,
  signIn,
} from "../support/session";

const WIDGETS_KEY = `hivescan_dashboard_widgets_${TEST_ACCOUNT}`;

// A layout widget: no API of its own, so the assertions are about the board
// rather than about whichever node the run happens to hit.
const ADDABLE_WIDGET = "note";
const ADDABLE_WIDGET_NAME = "Note";

test.describe("Widget library", () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await signIn(page);
    await resetDashboard(page);
    await dashboard.goto();
    await dashboard.waitForBoard();
  });

  test("The library is only reachable from edit mode", async () => {
    await expect(dashboard.addWidgetButton).toBeHidden();

    await dashboard.enterEditMode();

    await expect(dashboard.addWidgetButton).toBeVisible();
  });

  test("Opening the library shows the widget catalogue", async () => {
    await dashboard.enterEditMode();
    await dashboard.openWidgetLibrary();

    await expect(dashboard.widgetLibrary).toBeVisible();
    await dashboard.findWidgetInLibrary(ADDABLE_WIDGET_NAME);
    await expect(dashboard.libraryAddButton(ADDABLE_WIDGET)).toBeVisible();
  });

  test("Adding a widget places it on the board and persists it", async ({
    page,
  }) => {
    const before = await dashboard.widgetCount();

    await dashboard.enterEditMode();
    await dashboard.openWidgetLibrary();
    await dashboard.findWidgetInLibrary(ADDABLE_WIDGET_NAME);
    await dashboard.libraryAddButton(ADDABLE_WIDGET).click();

    await expect
      .poll(() => dashboard.widgetCount(), { timeout: 15000 })
      .toBe(before + 1);

    const stored = await readStorage(page, WIDGETS_KEY);
    expect(stored).toContain(ADDABLE_WIDGET);
  });

  test("An added widget survives a reload", async ({ page }) => {
    const before = await dashboard.widgetCount();

    await dashboard.enterEditMode();
    await dashboard.openWidgetLibrary();
    await dashboard.findWidgetInLibrary(ADDABLE_WIDGET_NAME);
    await dashboard.libraryAddButton(ADDABLE_WIDGET).click();
    await expect
      .poll(() => dashboard.widgetCount(), { timeout: 15000 })
      .toBe(before + 1);

    await page.reload();
    await dashboard.waitForBoard();

    expect(await dashboard.widgetCount()).toBe(before + 1);
  });

  // Singletons are refused by the board, and the library has to say so rather
  // than silently doing nothing.
  test("A singleton widget cannot be added twice", async ({ page }) => {
    await dashboard.enterEditMode();
    await dashboard.openWidgetLibrary();
    await dashboard.findWidgetInLibrary("Snapshot");

    const singleton = "my-account-snapshot";
    const addButton = dashboard.libraryAddButton(singleton);
    if ((await addButton.count()) === 0) test.skip();

    await addButton.click();
    const afterFirst = await dashboard.widgetCount();

    await expect(addButton).toBeDisabled();
    expect(await dashboard.widgetCount()).toBe(afterFirst);
  });

  test("Reset asks before it replaces the board", async ({ page }) => {
    await dashboard.enterEditMode();
    await dashboard.resetLayoutButton.click();

    await expect(dashboard.confirmDialogConfirm).toBeVisible();

    // Cancelling must leave the board exactly as it was.
    const before = await readStorage(page, WIDGETS_KEY);
    await dashboard.confirmDialogCancel.click();
    await expect(dashboard.confirmDialogConfirm).toBeHidden();
    expect(await readStorage(page, WIDGETS_KEY)).toBe(before);
  });
});
