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
  // The navbar's sync indicator opens the "Blockchain Sync" dialog.
  const trigger = page
    .locator(
      '[data-testid="navbar"] [aria-haspopup="dialog"][style*="32px"]:visible'
    )
    .first();
  await trigger.waitFor();
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(async () => (await pageState(page)).scrollY).toBe(400);
  const before = await pageState(page);

  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Blockchain Sync" });
  await expect(dialog).toBeVisible();
  const open = await pageState(page);
  expect(open.locked).toBe(true);
  expect(open.clientWidth).toBe(before.clientWidth);
  expect(open.navRight).toBe(before.navRight);

  // Focus the dialog itself, not its close button, so the keys don't close it.
  await dialog.focus();
  for (const key of ["PageDown", "ArrowDown", "End"]) {
    await page.keyboard.press(key);
  }
  await page.mouse.move(before.clientWidth - 5, 360);
  await page.mouse.wheel(0, 600);
  await expect(dialog).toBeVisible();
  expect((await pageState(page)).scrollY).toBe(before.scrollY);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  const closed = await pageState(page);
  expect(closed.locked).toBe(false);
  expect(closed.scrollY).toBe(before.scrollY);
  expect(closed.clientWidth).toBe(before.clientWidth);
});
