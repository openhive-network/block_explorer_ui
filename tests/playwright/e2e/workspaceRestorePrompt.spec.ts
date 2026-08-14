import { test, expect, Page } from "@playwright/test";
import { DashboardPage } from "../support/pages/dashboardPage";
import {
  TEST_ACCOUNT,
  readStorage,
  resetDashboard,
  signIn,
} from "../support/session";

const CLOUD_DIFFERS_EVENT = "hivescan:workspace-cloud-differs";
const LAST_SYNC_KEY = `hivescan_workspace_last_sync_${TEST_ACCOUNT}`;
const WIDGETS_KEY = `hivescan_dashboard_widgets_${TEST_ACCOUNT}`;

/**
 * The prompt is driven by a window event that AuthContext fires after it has
 * decrypted a bundle out of account metadata. Raising the event directly tests
 * the prompt and its two actions without needing a crafted on-chain bundle.
 */
async function raiseCloudDiffers(page: Page, widgetTypes: string[]) {
  await page.evaluate(
    ({ eventName, user, types }) => {
      const widgets = types.map((type: string, i: number) => ({
        i: `${type}-${i}`,
        type,
      }));
      const bundle = {
        version: 1,
        theme: "light",
        settings: {},
        dashboard: {
          layout: {
            lg: widgets.map((w: any, i: number) => ({
              i: w.i,
              x: 0,
              y: i * 2,
              w: 3,
              h: 2,
            })),
          },
          widgets,
          widgetStates: {},
        },
        watchlist: {},
        proposalChanges: [],
        witnessHealthSort: null,
        savedAt: new Date().toISOString(),
      };
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { bundle, username: user, compressed: "", immediate: true },
        })
      );
    },
    { eventName: CLOUD_DIFFERS_EVENT, user: TEST_ACCOUNT, types: widgetTypes }
  );
}

test.describe("Workspace restore prompt", () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await signIn(page);
    await resetDashboard(page);
    await dashboard.goto();
    await dashboard.waitForBoard();
  });

  test("A differing saved workspace raises the prompt", async ({ page }) => {
    await raiseCloudDiffers(page, ["note", "title"]);

    await expect(page.getByTestId("workspace-restore-prompt")).toBeVisible({
      timeout: 15000,
    });
  });

  test("The prompt offers both keeping local and restoring", async ({
    page,
  }) => {
    await raiseCloudDiffers(page, ["note"]);
    await expect(page.getByTestId("workspace-restore-prompt")).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByTestId("workspace-keep-local")).toBeVisible();
    await expect(page.getByTestId("workspace-restore-cloud")).toBeVisible();
  });

  // Keeping local records the cloud state as seen and leaves the board alone.
  test("Keeping local dismisses without touching the board", async ({
    page,
  }) => {
    const widgetsBefore = await readStorage(page, WIDGETS_KEY);

    await raiseCloudDiffers(page, ["note", "title"]);
    await expect(page.getByTestId("workspace-restore-prompt")).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId("workspace-keep-local").click();

    await expect(page.getByTestId("workspace-restore-prompt")).toBeHidden();
    expect(await readStorage(page, WIDGETS_KEY)).toBe(widgetsBefore);
    // The cloud version is now the recorded baseline.
    expect(await readStorage(page, LAST_SYNC_KEY)).not.toBeNull();
  });

  test("Restoring applies the saved board", async ({ page }) => {
    test.slow();
    const widgetsBefore = await readStorage(page, WIDGETS_KEY);

    await raiseCloudDiffers(page, ["note", "title"]);
    await expect(page.getByTestId("workspace-restore-prompt")).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId("workspace-restore-cloud").click();

    // The click reloads the page, so wait for the board to come back.
    await dashboard.waitForBoard();
    const widgetsAfter = await readStorage(page, WIDGETS_KEY);
    expect(widgetsAfter).not.toBe(widgetsBefore);
    expect(widgetsAfter).toContain("note");
  });

  test("A restore offers an undo once it lands", async ({ page }) => {
    test.slow();
    await raiseCloudDiffers(page, ["note", "title"]);
    await expect(page.getByTestId("workspace-restore-prompt")).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId("workspace-restore-cloud").click();
    await dashboard.waitForBoard();

    await expect(page.getByText(/undo/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
