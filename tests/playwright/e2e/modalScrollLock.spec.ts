import { test, expect, Page } from "@playwright/test";

// #815: an open modal must keep the page behind it still (no scrolling by
// keyboard, wheel or scrollbar) without shifting its layout.
const pageState = (page: Page) =>
  page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollY: Math.round(window.scrollY),
    locked: document.body.hasAttribute("data-scroll-locked"),
    navRight: Math.round(
      document.querySelector('[data-testid="navbar"]')?.getBoundingClientRect()
        .right ?? 0
    ),
  }));

test("an open modal locks the page behind it without shifting it", async ({
  page,
}) => {
  test.slow();
  await page.goto("/");
  // The home page keeps loading live data. Scroll anchoring would move the
  // page when content above the fold changes height, which isn't the bug.
  await page.addStyleTag({
    content: "* { overflow-anchor: none !important; }",
  });
  // The navbar's sync indicator opens the "Blockchain Sync" dialog.
  const trigger = page.getByTestId("sync-info-trigger");
  await trigger.waitFor();
  // Retried until the page has loaded enough content to scroll that far.
  await expect
    .poll(async () => {
      await page.evaluate(() => window.scrollTo(0, 400));
      return (await pageState(page)).scrollY;
    })
    .toBe(400);
  const before = await pageState(page);

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Blockchain Sync" });
  await expect(dialog).toBeVisible();
  // The lock is set in an effect, so it can trail the dialog by a moment.
  await expect.poll(async () => (await pageState(page)).locked).toBe(true);
  const open = await pageState(page);
  expect(open.clientWidth).toBe(before.clientWidth);
  expect(open.navRight).toBe(before.navRight);

  // With focus inside the dialog, these keys scroll the page if the lock is off.
  await dialog.focus();
  for (const key of ["PageDown", "ArrowDown", "End"]) {
    await page.keyboard.press(key);
  }
  await page.mouse.move(before.clientWidth - 5, 360);
  await page.mouse.wheel(0, 600);
  // Give smooth scrolling time to move the page, if it is going to.
  await page.waitForTimeout(500);
  await expect(dialog).toBeVisible();
  expect((await pageState(page)).scrollY).toBe(before.scrollY);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect.poll(async () => (await pageState(page)).locked).toBe(false);
  const closed = await pageState(page);
  expect(closed.scrollY).toBe(before.scrollY);
  expect(closed.clientWidth).toBe(before.clientWidth);
});
