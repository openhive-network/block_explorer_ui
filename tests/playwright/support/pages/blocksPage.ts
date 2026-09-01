import { Locator, Page, expect } from "@playwright/test";

export class BlocksPage {
  readonly page: Page;
  readonly tableBody: Locator;
  readonly rangeInsights: Locator;
  readonly rangeInsightsSpan: Locator;
  readonly slotHealthStrip: Locator;
  readonly slotHealthCells: Locator;
  readonly missedSlotRows: Locator;
  readonly slotDeltaCells: Locator;
  readonly slotDeltaUnknown: Locator;
  readonly producerShare: Locator;
  readonly producerShareToggle: Locator;
  readonly filtersToggle: Locator;
  readonly clearFiltersBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableBody = page.getByTestId("table-body");
    this.rangeInsights = page.getByTestId("range-insights");
    this.rangeInsightsSpan = page.getByTestId("range-insights-span");
    this.slotHealthStrip = page.getByTestId("slot-health-strip");
    this.slotHealthCells = page.getByTestId("slot-health-cell");
    this.missedSlotRows = page.getByTestId("missed-slot-row");
    this.slotDeltaCells = page.getByTestId("slot-delta");
    this.slotDeltaUnknown = page.getByTestId("slot-delta-unknown");
    this.producerShare = page.getByTestId("producer-share");
    this.producerShareToggle = this.producerShare.getByRole("button");
    this.filtersToggle = page.getByTestId("filters-toggle");
    this.clearFiltersBtn = page.getByTestId("clear-filters");
  }

  async gotoBlocksPage() {
    await this.page.goto("/blocks");
  }

  // `next dev` compiles a route on first hit, so the initial visit can outrun
  // the default timeouts. Wait on the table rather than assume it is up.
  async validateBlocksPageIsLoaded() {
    await expect(this.tableBody).toBeVisible({ timeout: 60000 });
    await expect(this.tableBody.locator("tbody tr").first()).toBeVisible({
      timeout: 60000,
    });
  }

  rangePreset(key: string): Locator {
    return this.page.getByTestId(`range-preset-${key}`);
  }
}
