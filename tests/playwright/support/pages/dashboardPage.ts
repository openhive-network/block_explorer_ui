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
   * that churn loses clicks, so wait until the count holds steady.
   */
  async waitForSeedingToSettle() {
    let previous = -1;
    await expect
      .poll(
        async () => {
          const current = await this.widgetCount();
          const settled = current === previous && current > 0;
          previous = current;
          return settled;
        },
        { timeout: 30000, intervals: [400] }
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

  /** Mobile and desktop each render a trigger; only one is visible at a time. */
  adoptTrigger(): Locator {
    return this.page
      .getByTestId("template-adopt-trigger")
      .locator("visible=true");
  }

  async adoptCurrentTemplate() {
    await this.adoptTrigger().click();
    await expect(this.adoptConfirmButton).toBeVisible();
    await this.adoptConfirmButton.click();
    await expect(this.previewBadge).toBeHidden();
  }
}
