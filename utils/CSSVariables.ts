// setCSSVariables

/**
 * Set CSS variables dynamically based on environment variables for light and dark modes.
 * The variables are injected into the document's root element (:root).
 */

import env from "@beam-australia/react-env";

const getThemeVariables = (theme: 'light' | 'dark') => {
  const prefix = theme === 'dark' ? 'DARK' : 'LIGHT';
  return {
    "--background-start-rgb": env(`COLOR_BACKGROUND_START_RGB_${prefix}`),
    "--background-end-rgb": env(`COLOR_BACKGROUND_END_RGB_${prefix}`),
    "--color-text": env(`COLOR_TEXT_${prefix}`),
    "--color-background": env(`COLOR_BACKGROUND_${prefix}`),
    "--color-row-even": env(`COLOR_ROW_EVEN_${prefix}`),
    "--color-row-odd": env(`COLOR_ROW_ODD_${prefix}`),
    "--color-row-hover": env(`COLOR_ROW_HOVER_${prefix}`),
    "--color-button": env(`COLOR_BUTTON_${prefix}`),
    "--color-button-text": env(`COLOR_BUTTON_TEXT_${prefix}`),
    "--color-button-hover": env(`COLOR_BUTTON_HOVER_${prefix}`),
    "--color-switch-button": env(`COLOR_SWITCH_BUTTON_${prefix}`),
    "--color-switch-off": env(`COLOR_SWITCH_OFF_${prefix}`),
    "--color-switch-on": env(`COLOR_SWITCH_ON_${prefix}`),
    "--color-blocked": env(`COLOR_BLOCKED_${prefix}`),
    "--color-operation-account-management": env(`COLOR_OPERATION_ACCOUNT_MANAGEMENT_${prefix}`),
    "--color-operation-witness-management": env(`COLOR_OPERATION_WITNESS_MANAGEMENT_${prefix}`),
    "--color-operation-witness-voting": env(`COLOR_OPERATION_WITNESS_VOTING_${prefix}`),
    "--color-operation-posting": env(`COLOR_OPERATION_POSTING_${prefix}`),
    "--color-operation-curation": env(`COLOR_OPERATION_CURATION_${prefix}`),
    "--color-operation-transfer": env(`COLOR_OPERATION_TRANSFER_${prefix}`),
    "--color-operation-market": env(`COLOR_OPERATION_MARKET_${prefix}`),
    "--color-operation-vesting": env(`COLOR_OPERATION_VESTING_${prefix}`),
    "--color-operation-proposal": env(`COLOR_OPERATION_PROPOSAL_${prefix}`),
    "--color-operation-custom": env(`COLOR_OPERATION_CUSTOM_${prefix}`),
    "--color-operation-other": env(`COLOR_OPERATION_OTHER_${prefix}`),
    "--color-link": env(`COLOR_LINK_${prefix}`),
    "--color-operation-perspective-incoming": env(`COLOR_OPERATION_PERSPECTIVE_INCOMING_${prefix}`),
    "--color-yellow": env(`COLOR_YELLOW_${prefix}`),
    "--color-light-blue": env(`COLOR_LIGHT_BLUE_${prefix}`),
    "--color-dark-blue": env(`COLOR_DARK_BLUE_${prefix}`),
    "--color-blue": env(`COLOR_BLUE_${prefix}`),
    "--color-turquoise": env(`COLOR_TURQUOISE_${prefix}`),
    "--color-red": env(`COLOR_RED_${prefix}`),
    "--color-orange": env(`COLOR_ORANGE_${prefix}`),
    "--color-light-green": env(`COLOR_LIGHT_GREEN_${prefix}`),
    "--color-light-gray": env(`COLOR_LIGHT_GRAY_${prefix}`),
    "--color-dark-gray": env(`COLOR_DARK_GRAY_${prefix}`),
  };
};

export const setCSSVariables = () => {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const themeVariables = getThemeVariables(theme);
  
  // Set the CSS variables for the current theme
  Object.keys(themeVariables).forEach((key) => {
    const value = themeVariables[key as keyof typeof themeVariables];
    if (value) {
      document.documentElement.style.setProperty(key, value);
    }
  });
};