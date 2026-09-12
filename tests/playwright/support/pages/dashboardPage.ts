import { Locator, Page, expect } from "@playwright/test";

export const MY_BOARD_KEY = "my-board";

export class DashboardPage {
  readonly page: Page;
  readonly boardTabs: Locator;
  readonly previewBadge: Locator;
  readonly editToggle: Locator;
  readonly addWidgetButton: Locator;
  readonly resetLayoutButton: Locator;
  readonly undoBoardButton: Locator;
  readonly widgetLibrary: Locator;
  readonly adoptConfirmButton: Locator;
  readonly confirmDialogConfirm: Locator;
  readonly confirmDialogCancel: Locator;
  readonly grid: Locator;
  readonly gridWrapper: Locator;

  constructor(page: Page) {
    this.page = page;
    this.boardTabs = page.getByTestId("board-tabs");
    this.previewBadge = page.getByTestId("template-preview-badge");
    this.editToggle = page.getByTestId("dashboard-edit-toggle");
    this.addWidgetButton = page.getByTestId("dashboard-add-widget");
    this.resetLayoutButton = page.getByTestId("dashboard-reset-layout");
    this.undoBoardButton = page.getByTestId("dashboard-undo-board");
    this.widgetLibrary = page.getByTestId("widget-library");
    this.adoptConfirmButton = page.getByTestId("adopt-confirm");
    this.confirmDialogConfirm = page.getByTestId("confirm-dialog-confirm");
    this.confirmDialogCancel = page.getByTestId("confirm-dialog-cancel");
    this.grid = page.locator(".react-grid-layout").first();
    this.gridWrapper = page.getByTestId("dashboard-grid").first();
  }

  boardTab(boardKey: string): Locator {
    return this.page.getByTestId(`board-tab-${boardKey}`);
  }

  libraryAddButton(widgetId: string): Locator {
    return this.page.getByTestId(`widget-library-add-${widgetId}`);
  }

  async goto() {
    await this.page.goto("/");
  }

  /** The grid only mounts once useDashboard has read storage and set isLoaded. */
  async waitForBoard() {
    await expect(this.boardTabs).toBeVisible({ timeout: 30000 });
    await expect(this.grid).toBeVisible({ timeout: 30000 });
    await this.waitForSeedingToSettle();
  }

  /**
   * On a fresh profile the seeding pass places one widget per render, so the
   * board keeps growing for a moment after it first paints. Interacting during
   * that churn loses clicks, so wait until seeding stops adding widgets.
   *
   * The stop signal is the authoritative placed-widget count (data-widget-count,
   * mirrored from useDashboard's `widgets`), not the raw react-grid-item count:
   * the attribute changes only while seeding places widgets and seeding
   * deterministically terminates, whereas the DOM item count can keep shifting
   * as widgets re-measure their height and the grid re-lays-out — which on a
   * slow CI browser could keep two consecutive samples from ever matching. Once
   * that count holds for a poll (seeding done) we additionally require the grid
   * to have rendered exactly that many items, so a caller snapshotting
   * widgetCount() right after reads the final total, not a mid-mount value.
   * Bounded by the poll timeout, so it can never spin indefinitely.
   */
  async waitForSeedingToSettle() {
    let previous = -1;
    await expect
      .poll(
        async () => {
          const target = Number(
            await this.gridWrapper.getAttribute("data-widget-count")
          );
          const rendered = await this.widgetCount();
          // Seeding has stopped growing the count (target held for a poll) and
          // the grid has caught up to it, so widgetCount() is now the final
          // total — callers that snapshot it right after won't read a low value.
          const settled =
            target > 0 && target === previous && rendered === target;
          previous = target;
          return settled;
        },
        { timeout: 30000, intervals: [200] }
      )
      .toBe(true);
  }

  /** react-grid-layout gives every placed widget a data-grid id via its key. */
  gridItems(): Locator {
    return this.grid.locator("> .react-grid-item");
  }

  async widgetCount(): Promise<number> {
    return this.gridItems().count();
  }

  async enterEditMode() {
    await this.editToggle.click();
    await expect(this.addWidgetButton).toBeVisible();
  }

  async openWidgetLibrary() {
    await this.addWidgetButton.click();
    await expect(this.widgetLibrary).toBeVisible();
  }

  /**
   * Categories render collapsed, so a widget's add button only exists once a
   * search is on — searching opens every group.
   */
  async findWidgetInLibrary(displayName: string) {
    await this.page.getByTestId("widget-library-search").fill(displayName);
  }

  async previewTemplate(boardKey: string) {
    await this.boardTab(boardKey).click();
    await expect(this.previewBadge).toBeVisible();
  }

  /** Separate mobile and desktop triggers; only one is ever visible. */
  adoptTrigger(): Locator {
    return this.page
      .getByTestId(/^template-adopt-trigger-(mobile|desktop)$/)
      .locator("visible=true");
  }

  async adoptCurrentTemplate() {
    await this.adoptTrigger().click();
    await expect(this.adoptConfirmButton).toBeVisible();
    await this.adoptConfirmButton.click();
    await expect(this.previewBadge).toBeHidden();
  }
}
