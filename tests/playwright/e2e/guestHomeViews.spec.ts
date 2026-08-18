import { test, expect } from "@playwright/test";
import { GuestHome, GUEST_VIEW_COOKIE } from "../support/pages/guestHome";

test.describe("Guest home views", () => {
  let guestHome: GuestHome;

  test.beforeEach(async ({ page }) => {
    guestHome = new GuestHome(page);
  });

  test("Guest home opens on Overview with the full tab strip", async () => {
    await guestHome.goto();

    await guestHome.validateTabsAreVisible();
    await guestHome.validateActiveView("overview");
  });

  test("Choosing a view switches the active tab", async () => {
    await guestHome.goto();
    await guestHome.validateActiveView("overview");

    await guestHome.selectView("network");

    await guestHome.validateActiveView("network");
    await guestHome.validateViewIsNotActive("overview");
  });

  test("The chosen view is written to a cookie", async () => {
    await guestHome.goto();
    await guestHome.selectView("market");

    await expect
      .poll(() => guestHome.readViewCookie(), { timeout: 10000 })
      .toBe("market");
  });

  // The cookie is read during SSR and seeded into the initial props, so the
  // first client paint is already correct. It is not in the served HTML —
  // Layout gates on client-side chain init — the win is no flash, not SEO.
  test("The chosen view survives a reload without flashing Overview", async ({
    page,
  }) => {
    await guestHome.goto();
    await guestHome.selectView("governance");
    await expect
      .poll(() => guestHome.readViewCookie(), { timeout: 10000 })
      .toBe("governance");

    await page.reload();

    await guestHome.validateActiveView("governance");
    await guestHome.validateViewIsNotActive("overview");
  });

  // url comes from the fixture: CI serves the app on its own host, so a
  // hardcoded one would set the cookie on a domain the app never reads.
  test("A view set by cookie is the first view painted on a cold load", async ({
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: GUEST_VIEW_COOKIE,
        value: "essentials",
        url: baseURL!,
      },
    ]);

    await guestHome.goto();

    await guestHome.validateActiveView("essentials");
  });

  // An unknown value must not strand the visitor on a blank view. The cookie is
  // read back first: with none set the fallback is Overview anyway, so without
  // that check this passes whether or not the bad value ever reached the app.
  test("An unrecognised cookie value falls back to Overview", async ({
    context,
    baseURL,
  }) => {
    await context.addCookies([
      {
        name: GUEST_VIEW_COOKIE,
        value: "not-a-view",
        url: baseURL!,
      },
    ]);
    expect(await guestHome.readViewCookie()).toBe("not-a-view");

    await guestHome.goto();

    await guestHome.validateActiveView("overview");
  });

  test("The tab strip is replaced by a select on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await guestHome.goto();

    await expect(guestHome.mobileSwitcher).toBeVisible();
    await expect(guestHome.tab("overview")).toBeHidden();
  });

  // The board tabs belong to the signed-in dashboard, not the guest home.
  test("Board tabs are not shown to a guest", async ({ page }) => {
    await guestHome.goto();

    await expect(page.getByTestId("board-tabs")).toBeHidden();
  });
});
