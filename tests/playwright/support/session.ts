import { Page } from "@playwright/test";

/**
 * A real account, because AuthContext.login() resolves the name against the
 * Hive node before it accepts a restored session. No keys are involved: every
 * dashboard flow under test is read-only.
 */
export const TEST_ACCOUNT = "gtg";

const DASHBOARD_KEYS = (username: string) => [
  `hivescan_dashboard_layouts_${username}`,
  `hivescan_dashboard_widgets_${username}`,
  `hivescan_dashboard_widget_states_${username}`,
  `hivescan_dashboard_active_board_${username}`,
  `hivescan_board_undo_${username}`,
  `hivescan_board_adopted_from_${username}`,
];

/**
 * Restores a session the way a returning visitor would: AuthContext reads
 * `hivescan_user` on mount and re-runs login() from it. Seeding it before any
 * script runs means the first paint is already signed in.
 */
export async function signIn(page: Page, username: string = TEST_ACCOUNT) {
  await page.addInitScript((user) => {
    window.localStorage.setItem(
      "hivescan_user",
      JSON.stringify({ username: user, method: "keychain" })
    );
  }, username);
}

/**
 * Wipes every board key so a spec starts on the default dashboard. Seed flags
 * are left alone — clearing them would make the seeding pass re-add widgets
 * mid-test and move things under the assertions.
 *
 * Runs on the first navigation only. addInitScript re-runs on every navigation,
 * so without the guard a reload would wipe the very keys a test just asserted
 * were written.
 */
export async function resetDashboard(
  page: Page,
  username: string = TEST_ACCOUNT
) {
  await page.addInitScript((keys) => {
    const ONCE = "__pw_dashboard_reset__";
    if (window.sessionStorage.getItem(ONCE)) return;
    window.sessionStorage.setItem(ONCE, "1");
    keys.forEach((key: string) => window.localStorage.removeItem(key));
  }, DASHBOARD_KEYS(username));
}

/** Reads a board key out of the page, for asserting what was persisted. */
export async function readStorage(page: Page, key: string) {
  return page.evaluate((k) => window.localStorage.getItem(k), key);
}

export const boardKeys = DASHBOARD_KEYS;
