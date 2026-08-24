/**
 * @jest-environment jsdom
 */
import { REQUEST_LOGIN_EVENT, requestLogin } from "@/utils/loginPrompt";

describe("requestLogin", () => {
  it("dispatches the event LoginControl listens for", () => {
    const listener = jest.fn();
    window.addEventListener(REQUEST_LOGIN_EVENT, listener);

    requestLogin();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(REQUEST_LOGIN_EVENT, listener);
  });

  it("stops firing once the listener is detached", () => {
    const listener = jest.fn();
    window.addEventListener(REQUEST_LOGIN_EVENT, listener);
    window.removeEventListener(REQUEST_LOGIN_EVENT, listener);

    requestLogin();

    expect(listener).not.toHaveBeenCalled();
  });
});
