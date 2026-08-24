export const REQUEST_LOGIN_EVENT = "hivescan:request-login";

// Lets any gated control open the sign-in dialog that LoginControl owns.
export const requestLogin = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REQUEST_LOGIN_EVENT));
};
