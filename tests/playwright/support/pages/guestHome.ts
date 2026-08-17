import { Locator, Page, expect } from "@playwright/test";

export type GuestView =
  | "overview"
  | "essentials"
  | "network"
  | "market"
  | "governance";

export const GUEST_VIEW_COOKIE = "hivescan_guest_home_view";

export class GuestHome {
  readonly page: Page;
  readonly mobileSwitcher: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileSwitcher = page.getByTestId("guest-view-mobile");
  }

  tab(view: GuestView): Locator {
    return this.page.getByTestId(`guest-view-tab-${view}`);
  }

  async goto() {
    await this.page.goto("/");
  }

  async selectView(view: GuestView) {
    await this.tab(view).click();
  }

  async validateTabsAreVisible() {
    await expect(this.tab("overview")).toBeVisible();
    await expect(this.tab("network")).toBeVisible();
    await expect(this.tab("market")).toBeVisible();
    await expect(this.tab("governance")).toBeVisible();
    await expect(this.tab("essentials")).toBeVisible();
  }

  // aria-current is the tab strip's own signal for the active view.
  async validateActiveView(view: GuestView) {
    await expect(this.tab(view)).toHaveAttribute("aria-current", "page");
  }

  async validateViewIsNotActive(view: GuestView) {
    await expect(this.tab(view)).not.toHaveAttribute("aria-current", "page");
  }

  async readViewCookie(): Promise<string | undefined> {
    const cookies = await this.page.context().cookies();
    return cookies.find((c) => c.name === GUEST_VIEW_COOKIE)?.value;
  }
}
