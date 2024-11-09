// EnvCssVariables

/**
 * Set CSS variables dynamically based on environment variables for light and dark modes.
 * The variables are injected into the document's root element (:root).
 */

import env from "@beam-australia/react-env";

//Fetch environment variables
const getEnvVariable = (key: string): string | undefined => env(key);

const variables = [
  'COLOR_BACKGROUND_START_RGB', 'COLOR_BACKGROUND_END_RGB', 'COLOR_TEXT', 'COLOR_BACKGROUND', 'COLOR_ROW_EVEN', 'COLOR_ROW_ODD',
  'COLOR_ROW_HOVER', 'COLOR_BUTTON', 'COLOR_BUTTON_TEXT', 'COLOR_BUTTON_HOVER', 'COLOR_SWITCH_BUTTON', 'COLOR_SWITCH_OFF', 'COLOR_SWITCH_ON',
  'COLOR_BLOCKED', 'COLOR_OPERATION_ACCOUNT_MANAGEMENT', 'COLOR_OPERATION_WITNESS_MANAGEMENT', 'COLOR_OPERATION_WITNESS_VOTING',
  'COLOR_OPERATION_POSTING', 'COLOR_OPERATION_CURATION', 'COLOR_OPERATION_TRANSFER', 'COLOR_OPERATION_MARKET',
  'COLOR_OPERATION_VESTING', 'COLOR_OPERATION_PROPOSAL', 'COLOR_OPERATION_CUSTOM', 'COLOR_OPERATION_OTHER', 'COLOR_LINK',
  'COLOR_OPERATION_PERSPECTIVE_INCOMING', 'COLOR_YELLOW', 'COLOR_LIGHT_BLUE', 'COLOR_DARK_BLUE', 'COLOR_BLUE', 'COLOR_TURQUOISE',
  'COLOR_RED', 'COLOR_ORANGE', 'COLOR_LIGHT_GREEN', 'COLOR_LIGHT_GRAY', 'COLOR_DARK_GRAY'
];

const getThemeVariablesFromEnv = (theme: 'light' | 'dark'): { [key: string]: string | undefined } => {
  const prefix = theme === 'dark' ? 'DARK' : 'LIGHT';

  return variables.reduce((acc, variable) => {
    acc[`--${variable.toLowerCase().replace(/color_/g, 'color-')}`] = getEnvVariable(`${variable}_${prefix}`);
    return acc;
  }, {} as { [key: string]: string | undefined });
};

export const setCssVariablesFromEnv = (): void => {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const themeVariables = getThemeVariablesFromEnv(theme);

  // Set the CSS variables for the current theme
  Object.entries(themeVariables).forEach(([key, value]) => {
    if (value) {
      document.documentElement.style.setProperty(key, value);
    }
  });
};
