import React from "react";
import env from "@beam-australia/react-env";
import type { NextApiResponse } from "next";
import { LOGIN_METHODS, LoginMethod } from "@/lib/smart-signer/types";
import { missingHivesignerSettings } from "@/Config";

export const EXPLORER_MODES = ["full", "classic"] as const;

export const FOOTERS = ["full", "classic"] as const;

export const THEMES = ["system", "light", "dark"] as const;

export type DefaultTheme = (typeof THEMES)[number];

export type FooterKind = (typeof FOOTERS)[number];

export type ExplorerMode = (typeof EXPLORER_MODES)[number];

// Boards a visitor can land on; the rest exist only as dashboard templates.
export const HOME_TEMPLATES = [
  "overview",
  "essentials",
  "network",
  "market",
  "governance",
] as const;

export type HomeTemplate = (typeof HOME_TEMPLATES)[number];

export const DASHBOARD_ONLY_TEMPLATES = ["me", "creator", "growth"] as const;

export const TEMPLATE_NAMES = [
  ...HOME_TEMPLATES,
  ...DASHBOARD_ONLY_TEMPLATES,
] as const;

// Arabic last, so dropping English does not make the default site RTL.
export const LANGUAGES = [
  "en",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "pl",
  "pt",
  "ro",
  "zh",
  "ar",
] as const;

export type TemplateName = (typeof TEMPLATE_NAMES)[number];

export type Language = (typeof LANGUAGES)[number];

export interface DeploySettings {
  mode: ExplorerMode;
  login: boolean;
  loginMethods: LoginMethod[];
  dashboard: boolean;
  dashboardSync: boolean;
  defaultTemplate: HomeTemplate;
  homeTabs: boolean;
  templates: TemplateName[];
  recentVisits: boolean;
  tools: boolean;
  accountAnalytics: boolean;
  communities: boolean;
  proposals: boolean;
  topHolders: boolean;
  exports: boolean;
  languages: Language[];
  defaultLanguage: Language;
  footer: FooterKind;
  defaultTheme: DefaultTheme;
}

export interface DeploySettingsIssues {
  warnings: string[];
  errors: string[];
}

type ReadSetting = (key: string) => string | undefined;

const ENV_PREFIX = "REACT_APP_";

const parseBoolean = (
  key: string,
  raw: string | undefined,
  fallback: boolean,
  issues: DeploySettingsIssues
): boolean => {
  const value = raw?.trim().toLowerCase();
  if (!value) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  issues.warnings.push(
    `${ENV_PREFIX}${key}="${raw}" is not true or false, using ${fallback}`
  );
  return fallback;
};

const parseChoice = <T extends string>(
  key: string,
  raw: string | undefined,
  choices: readonly T[],
  fallback: T,
  issues: DeploySettingsIssues
): T => {
  const value = raw?.trim().toLowerCase();
  if (!value) return fallback;
  if (choices.includes(value as T)) return value as T;
  issues.warnings.push(
    `${ENV_PREFIX}${key}="${raw}" is not one of ${choices.join(", ")}, using ${fallback}`
  );
  return fallback;
};

// Returns what is left after the exclusions; leaving none of `required` keeps
// all, unless `required` is empty.
const parseExclude = <T extends string>(
  key: string,
  raw: string | undefined,
  known: readonly T[],
  issues: DeploySettingsIssues,
  required: readonly T[] = known
): T[] => {
  const names = (raw ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  if (!names.length) return [...known];

  const unknown = names.filter((name) => !known.includes(name as T));
  if (unknown.length) {
    issues.warnings.push(
      `${ENV_PREFIX}${key}: unknown ${unknown.join(", ")} ignored`
    );
  }

  const remaining = known.filter((name) => !names.includes(name));
  if (required.length && !required.some((name) => remaining.includes(name))) {
    issues.errors.push(
      `${ENV_PREFIX}${key} removes every option, so it is ignored`
    );
    return [...known];
  }
  return remaining;
};

export const resolveDeploySettings = (
  read: ReadSetting,
  hivesignerMissing: readonly string[] = []
): { settings: DeploySettings; issues: DeploySettingsIssues } => {
  const issues: DeploySettingsIssues = { warnings: [], errors: [] };

  const mode = parseChoice(
    "EXPLORER_MODE",
    read("EXPLORER_MODE"),
    EXPLORER_MODES,
    "full",
    issues
  );
  const full = mode === "full";

  let login = parseBoolean("LOGIN", read("LOGIN"), full, issues);
  // Removing every method switches login off rather than being ignored.
  let loginMethods = parseExclude(
    "LOGIN_EXCLUDE",
    read("LOGIN_EXCLUDE"),
    LOGIN_METHODS,
    issues,
    []
  );
  if (
    login &&
    loginMethods.includes("hivesigner") &&
    hivesignerMissing.length
  ) {
    issues.warnings.push(
      `Hivesigner login is hidden: ${hivesignerMissing.join(", ")} not set`
    );
    loginMethods = loginMethods.filter((method) => method !== "hivesigner");
  }
  if (login && !loginMethods.length) {
    issues.warnings.push("No login method is left, so login is off");
    login = false;
  }

  const requiresLogin = (key: string, wanted: boolean) => {
    if (wanted && !login) {
      issues.warnings.push(`${ENV_PREFIX}${key} needs login, so it is off`);
    }
    return wanted && login;
  };
  const dashboard = requiresLogin(
    "DASHBOARD",
    parseBoolean("DASHBOARD", read("DASHBOARD"), full && login, issues)
  );
  const wantedSync = requiresLogin(
    "DASHBOARD_SYNC",
    parseBoolean(
      "DASHBOARD_SYNC",
      read("DASHBOARD_SYNC"),
      full && login,
      issues
    )
  );
  if (wantedSync && !dashboard) {
    issues.warnings.push(
      `${ENV_PREFIX}DASHBOARD_SYNC needs the dashboard, so it is off`
    );
  }
  const dashboardSync = wantedSync && dashboard;

  const templates = parseExclude(
    "TEMPLATES_EXCLUDE",
    read("TEMPLATES_EXCLUDE"),
    TEMPLATE_NAMES,
    issues,
    HOME_TEMPLATES
  );
  const homeTemplates = HOME_TEMPLATES.filter((name) =>
    templates.includes(name)
  );
  let defaultTemplate = parseChoice(
    "DEFAULT_TEMPLATE",
    read("DEFAULT_TEMPLATE"),
    HOME_TEMPLATES,
    "overview",
    issues
  );
  if (!homeTemplates.includes(defaultTemplate)) {
    issues.warnings.push(
      read("DEFAULT_TEMPLATE")?.trim()
        ? `${ENV_PREFIX}DEFAULT_TEMPLATE "${defaultTemplate}" is excluded, using ${homeTemplates[0]}`
        : `${ENV_PREFIX}DEFAULT_TEMPLATE is blank and overview is excluded, using ${homeTemplates[0]}`
    );
    defaultTemplate = homeTemplates[0];
  }
  const homeTabs = parseBoolean("HOME_TABS", read("HOME_TABS"), full, issues);

  const recentVisits = parseBoolean(
    "RECENT_VISITS",
    read("RECENT_VISITS"),
    full,
    issues
  );
  const tools = parseBoolean("TOOLS", read("TOOLS"), full, issues);
  const accountAnalytics = parseBoolean(
    "ACCOUNT_ANALYTICS",
    read("ACCOUNT_ANALYTICS"),
    full,
    issues
  );
  const communities = parseBoolean(
    "COMMUNITIES",
    read("COMMUNITIES"),
    full,
    issues
  );
  const proposals = parseBoolean("PROPOSALS", read("PROPOSALS"), full, issues);
  const topHolders = parseBoolean(
    "TOP_HOLDERS",
    read("TOP_HOLDERS"),
    full,
    issues
  );
  const exports = parseBoolean("EXPORTS", read("EXPORTS"), full, issues);
  const languagesOn = parseBoolean(
    "LANGUAGES",
    read("LANGUAGES"),
    full,
    issues
  );
  const wantedLanguage = parseChoice(
    "DEFAULT_LANGUAGE",
    read("DEFAULT_LANGUAGE"),
    LANGUAGES,
    "en",
    issues
  );
  const languages: Language[] = languagesOn
    ? parseExclude(
        "LANGUAGES_EXCLUDE",
        read("LANGUAGES_EXCLUDE"),
        LANGUAGES,
        issues
      )
    : [wantedLanguage];
  // An excluded default falls back to the first language left.
  const defaultLanguage = languages.includes(wantedLanguage)
    ? wantedLanguage
    : languages[0];
  if (defaultLanguage !== wantedLanguage && read("DEFAULT_LANGUAGE")?.trim()) {
    issues.warnings.push(
      `${ENV_PREFIX}DEFAULT_LANGUAGE "${wantedLanguage}" is excluded, using ${defaultLanguage}`
    );
  }

  return {
    settings: {
      mode,
      login,
      loginMethods,
      dashboard,
      dashboardSync,
      defaultTemplate,
      homeTabs,
      templates,
      recentVisits,
      tools,
      accountAnalytics,
      communities,
      proposals,
      topHolders,
      exports,
      defaultTheme: parseChoice(
        "DEFAULT_THEME",
        read("DEFAULT_THEME"),
        THEMES,
        "system",
        issues
      ),
      footer: parseChoice(
        "FOOTER",
        read("FOOTER"),
        FOOTERS,
        full ? "full" : "classic",
        issues
      ),
      languages,
      defaultLanguage,
    },
    issues,
  };
};

declare global {
  interface Window {
    __HIVESIGNER_READY__?: boolean;
  }
}

// The server checks the Hivesigner settings and _document hands the browser
// only the yes/no answer.
const hivesignerMissing =
  typeof window === "undefined"
    ? missingHivesignerSettings()
    : window.__HIVESIGNER_READY__ === true
      ? []
      : ["Hivesigner settings"];

export const isHivesignerReady = hivesignerMissing.length === 0;

const resolved = resolveDeploySettings((key) => env(key), hivesignerMissing);

// Next evaluates this module once per server bundle; log the issues only once.
if (typeof window === "undefined") {
  const g = globalThis as Record<string, unknown>;
  if (!g.__deploySettingsLogged__) {
    g.__deploySettingsLogged__ = true;
    resolved.issues.warnings.forEach((msg) =>
      console.warn(`[deploy-settings] ${msg}`)
    );
    resolved.issues.errors.forEach((msg) =>
      console.error(`[deploy-settings] ${msg}`)
    );
  }
}

export const deploySettings: DeploySettings = resolved.settings;

export const isLoginMethodEnabled = (method: LoginMethod): boolean =>
  deploySettings.login && deploySettings.loginMethods.includes(method);

type SectionKey =
  | "tools"
  | "communities"
  | "proposals"
  | "topHolders"
  | "exports";

// Renders the component only while its section is switched on.
export const withSection = <P extends object>(
  Component: React.ComponentType<P>,
  section: SectionKey
) => {
  const Gated = (props: P) =>
    deploySettings[section] ? React.createElement(Component, props) : null;
  Gated.displayName = `withSection(${Component.displayName || Component.name})`;
  return Gated;
};

// Pages a switched-off section owns; links to them are hidden.
const SECTION_PATHS: [string, SectionKey][] = [
  ["/tools", "tools"],
  ["/compare", "tools"],
  ["/communities", "communities"],
  ["/proposals", "proposals"],
  ["/top-holders", "topHolders"],
];

export const isPathEnabled = (path: string): boolean =>
  SECTION_PATHS.every(
    ([prefix, key]) => !path.startsWith(prefix) || deploySettings[key]
  );

const SECTION_WIDGETS: Record<string, SectionKey> = {
  "top-communities": "communities",
  "my-communities": "communities",
  "my-community-activity": "communities",
  "watched-proposals": "proposals",
  "my-proposal-votes": "proposals",
  "top-holders": "topHolders",
};

export const isWidgetEnabled = (type: string): boolean => {
  const key = SECTION_WIDGETS[type];
  return !key || deploySettings[key];
};

const SECTION_REPORTS: Record<string, SectionKey> = {
  communityActivity: "communities",
};

export const isReportEnabled = (type: string): boolean => {
  const key = SECTION_REPORTS[type];
  return !key || deploySettings[key];
};

export const isTemplateEnabled = (name: string): boolean =>
  deploySettings.templates.includes(name as TemplateName);

export const isLanguageEnabled = (locale: string): boolean =>
  deploySettings.languages.includes(locale as Language);

export const defaultLanguage = (): string => deploySettings.defaultLanguage;

export const rejectUnavailable = (res: NextApiResponse) =>
  res.status(404).json({ error: "Not available" });
