// next/jest loads the developer's .env; unit tests must not follow its deploy
// settings, so every test file starts from the defaults.
const DEPLOY_KEYS = [
  "EXPLORER_MODE",
  "LOGIN",
  "LOGIN_EXCLUDE",
  "DASHBOARD",
  "DASHBOARD_SYNC",
  "DEFAULT_TEMPLATE",
  "HOME_TABS",
  "TEMPLATES_EXCLUDE",
  "RECENT_VISITS",
  "TOOLS",
  "ACCOUNT_ANALYTICS",
  "COMMUNITIES",
  "PROPOSALS",
  "TOP_HOLDERS",
  "EXPORTS",
  "LANGUAGES",
  "LANGUAGES_EXCLUDE",
  "DEFAULT_LANGUAGE",
  "FOOTER",
  "DEFAULT_THEME",
];

for (const key of DEPLOY_KEYS) delete process.env[`REACT_APP_${key}`];

module.exports = { DEPLOY_KEYS };
