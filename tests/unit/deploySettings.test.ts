import {
  HOME_TEMPLATES,
  LANGUAGES,
  TEMPLATE_NAMES,
  resolveDeploySettings,
} from "@/utils/deploySettings";
import { ALL_BOARD_TEMPLATES } from "@/components/dashboard/templates";
import { SUPPORTED_LOCALES } from "@/i18n/i18n";

const resolve = (values: Record<string, string>) =>
  resolveDeploySettings((key) => values[key]);

describe("resolveDeploySettings", () => {
  it("keeps everything on when nothing is set", () => {
    const { settings, issues } = resolve({});
    expect(settings).toEqual({
      mode: "full",
      login: true,
      loginMethods: ["keychain", "hivesigner"],
      dashboard: true,
      dashboardSync: true,
      defaultTemplate: "overview",
      homeTabs: true,
      templates: [...TEMPLATE_NAMES],
      recentVisits: true,
      tools: true,
      accountAnalytics: true,
      communities: true,
      proposals: true,
      topHolders: true,
      exports: true,
      languages: [...LANGUAGES],
      defaultLanguage: "en",
      footer: "full",
      defaultTheme: "system",
    });
    expect(issues).toEqual({ warnings: [], errors: [] });
  });

  it("turns login off in classic mode and lets an explicit setting win", () => {
    expect(resolve({ EXPLORER_MODE: "classic" }).settings.login).toBe(false);
    expect(
      resolve({ EXPLORER_MODE: "Classic", LOGIN: "true" }).settings.login
    ).toBe(true);
  });

  it("removes excluded login methods and warns about unknown names", () => {
    const { settings, issues } = resolve({
      LOGIN_EXCLUDE: " HiveSigner , ledger",
    });
    expect(settings.loginMethods).toEqual(["keychain"]);
    expect(issues.warnings).toHaveLength(1);
  });

  it("turns login off when every method is excluded", () => {
    const { settings, issues } = resolve({
      LOGIN_EXCLUDE: "keychain,hivesigner",
    });
    expect(settings.login).toBe(false);
    expect(settings.dashboard).toBe(false);
    expect(settings.dashboardSync).toBe(false);
    expect(issues.warnings).toHaveLength(1);
  });

  it("hides Hivesigner while one of its settings is missing", () => {
    const { settings, issues } = resolveDeploySettings(
      () => undefined,
      ["HIVESIGNER_SECRET"]
    );
    expect(settings.loginMethods).toEqual(["keychain"]);
    expect(settings.login).toBe(true);
    expect(issues.warnings[0]).toContain("HIVESIGNER_SECRET");
  });

  it("turns login off when Hivesigner was the only method and is not set up", () => {
    const { settings } = resolveDeploySettings(
      (key) => (key === "LOGIN_EXCLUDE" ? "keychain" : undefined),
      ["HIVESIGNER_APP"]
    );
    expect(settings.login).toBe(false);
    expect(settings.dashboard).toBe(false);
  });

  it("falls back on values it cannot read", () => {
    const { settings, issues } = resolve({
      EXPLORER_MODE: "simple",
      LOGIN: "no",
    });
    expect(settings.mode).toBe("full");
    expect(settings.login).toBe(true);
    expect(issues.warnings).toHaveLength(2);
  });

  it("keeps the dashboard and sync off without login", () => {
    const { settings, issues } = resolve({ LOGIN: "false", DASHBOARD: "true" });
    expect(settings.dashboard).toBe(false);
    expect(settings.dashboardSync).toBe(false);
    expect(issues.warnings).toHaveLength(1);
  });

  it("turns sync off with the dashboard", () => {
    expect(resolve({ DASHBOARD: "false" }).settings.dashboardSync).toBe(false);
    const { settings, issues } = resolve({
      DASHBOARD: "false",
      DASHBOARD_SYNC: "true",
    });
    expect(settings.dashboardSync).toBe(false);
    expect(issues.warnings).toHaveLength(1);
  });

  it("gives classic a single home board and lets settings override it", () => {
    const classic = resolve({ EXPLORER_MODE: "classic" }).settings;
    expect(classic.homeTabs).toBe(false);
    expect(classic.dashboard).toBe(false);

    const withDashboard = resolve({
      EXPLORER_MODE: "classic",
      LOGIN: "true",
      DASHBOARD: "true",
    }).settings;
    expect(withDashboard.dashboard).toBe(true);
    expect(withDashboard.dashboardSync).toBe(false);
  });

  it("moves the default template off an excluded one", () => {
    const { settings, issues } = resolve({
      DEFAULT_TEMPLATE: "market",
      TEMPLATES_EXCLUDE: "market,overview",
    });
    expect(settings.defaultTemplate).toBe("essentials");
    expect(settings.templates).not.toContain("market");
    expect(issues.warnings).toHaveLength(1);
  });

  it("ignores a templates exclude list that leaves no home board", () => {
    const { settings, issues } = resolve({
      TEMPLATES_EXCLUDE: HOME_TEMPLATES.join(","),
    });
    expect(settings.templates).toEqual([...TEMPLATE_NAMES]);
    expect(issues.errors).toHaveLength(1);
  });

  it("knows every dashboard template", () => {
    for (const board of ALL_BOARD_TEMPLATES) {
      expect(TEMPLATE_NAMES).toContain(board.key);
    }
  });

  it("turns the extras off in classic mode", () => {
    const { settings } = resolve({ EXPLORER_MODE: "classic" });
    expect(settings.recentVisits).toBe(false);
    expect(settings.tools).toBe(false);
    expect(settings.accountAnalytics).toBe(false);
    expect(settings.communities).toBe(false);
    expect(settings.proposals).toBe(false);
    expect(settings.topHolders).toBe(false);
    expect(settings.exports).toBe(false);
    expect(settings.languages).toEqual(["en"]);
    expect(settings.footer).toBe("classic");
  });

  it("can leave a single language, English or not", () => {
    const others = LANGUAGES.filter((lang) => lang !== "de").join(",");
    expect(resolve({ LANGUAGES_EXCLUDE: others }).settings.languages).toEqual([
      "de",
    ]);
    expect(
      resolve({ LANGUAGES_EXCLUDE: "ja,zh" }).settings.languages
    ).not.toContain("ja");
  });

  it("uses the default language, or the first one left when it is excluded", () => {
    expect(resolve({ DEFAULT_LANGUAGE: "de" }).settings.defaultLanguage).toBe(
      "de"
    );
    expect(
      resolve({ LANGUAGES: "false", DEFAULT_LANGUAGE: "de" }).settings.languages
    ).toEqual(["de"]);
    const { settings, issues } = resolve({
      DEFAULT_LANGUAGE: "de",
      LANGUAGES_EXCLUDE: "en,de",
    });
    expect(settings.defaultLanguage).toBe("es");
    expect(issues.warnings).toHaveLength(1);
  });

  it("ignores a languages exclude list that removes every language", () => {
    const { settings, issues } = resolve({
      LANGUAGES_EXCLUDE: LANGUAGES.join(","),
    });
    expect(settings.languages).toEqual([...LANGUAGES]);
    expect(issues.errors).toHaveLength(1);
  });

  it("ignores the languages exclude list when languages are off", () => {
    const { settings } = resolve({
      LANGUAGES: "false",
      LANGUAGES_EXCLUDE: "ja",
    });
    expect(settings.languages).toEqual(["en"]);
  });
});

describe("LANGUAGES", () => {
  it("lists every language the app can load", () => {
    expect([...LANGUAGES].sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });
});
