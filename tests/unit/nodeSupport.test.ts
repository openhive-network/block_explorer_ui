// Unit tests for the supportKey-detection helpers. @hiveio/wax is mocked so we
// can construct WaxError instances without loading the WASM bundle.
jest.mock(
  "@hiveio/wax",
  () => ({
    WaxError: class WaxError extends Error {},
    WaxRequestAbortedByUser: class WaxRequestAbortedByUser extends Error {},
  }),
  { virtual: true }
);

import {
  isNaiAmount,
  classifyEndpointError,
  EndpointUnsupportedError,
  probeAppSupported,
} from "@/utils/nodeSupport";
import { WaxError, WaxRequestAbortedByUser } from "@hiveio/wax";

const CAP = "balance-api:transfer-statistics";

describe("isNaiAmount", () => {
  it("true for a NAI amount object", () => {
    expect(
      isNaiAmount({ nai: "@@000000021", amount: "123", precision: 3 })
    ).toBe(true);
  });
  it("false for a bare string (the actifit version-skew shape)", () => {
    expect(isNaiAmount("1537221848")).toBe(false);
  });
  it("false for a number", () => {
    expect(isNaiAmount(5)).toBe(false);
  });
  it("false for null / undefined (flags the rows[0]-only guard risk)", () => {
    expect(isNaiAmount(null)).toBe(false);
    expect(isNaiAmount(undefined)).toBe(false);
  });
  it("false when the nai key is missing", () => {
    expect(isNaiAmount({ amount: "1", precision: 3 })).toBe(false);
  });
});

describe("classifyEndpointError", () => {
  it("404 -> EndpointUnsupportedError (definitive, non-transient)", () => {
    const out = classifyEndpointError({ response: { status: 404 } }, CAP);
    expect(out).toBeInstanceOf(EndpointUnsupportedError);
    expect((out as EndpointUnsupportedError).supportKey).toBe(CAP);
    expect((out as EndpointUnsupportedError).transient).toBe(false);
  });

  it("501 -> EndpointUnsupportedError", () => {
    expect(
      classifyEndpointError({ response: { status: 501 } }, CAP)
    ).toBeInstanceOf(EndpointUnsupportedError);
  });

  it("500 -> passed through (transient, stays retryable)", () => {
    const err = { response: { status: 500 } };
    expect(classifyEndpointError(err, CAP)).toBe(err);
  });

  it("an existing EndpointUnsupportedError is returned unchanged", () => {
    const e = new EndpointUnsupportedError(CAP);
    expect(classifyEndpointError(e, CAP)).toBe(e);
  });

  it("a user/navigation abort is NOT treated as a supportKey gap", () => {
    // Constructed via the virtual mock; cast because the real wax types declare a
    // 2-arg constructor.
    const e = new (WaxRequestAbortedByUser as unknown as new (
      m: string
    ) => Error)("aborted");
    expect(classifyEndpointError(e, CAP)).toBe(e);
  });

  it("a plain non-Wax error is passed through", () => {
    const e = new Error("boom");
    expect(classifyEndpointError(e, CAP)).toBe(e);
  });

  // A status-less WaxError (timeout / network / CORS) is classified as unsupported
  // but marked TRANSIENT, so the retry policy gives it a couple of attempts before
  // it sticks (recovery from a blip).
  it("a status-less WaxError (timeout/CORS) -> EndpointUnsupportedError marked transient", () => {
    const timeout = new (WaxError as unknown as new (m: string) => Error)(
      "Request timed out"
    );
    const out = classifyEndpointError(timeout, CAP);
    expect(out).toBeInstanceOf(EndpointUnsupportedError);
    expect((out as EndpointUnsupportedError).transient).toBe(true);
  });
});

describe("probeAppSupported", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it("returns true on a 200 /version", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;
    await expect(
      probeAppSupported("https://node.example", "balance-api")
    ).resolves.toBe(true);
  });

  it("strips a trailing slash from the node when building the url", async () => {
    const f = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = f as unknown as typeof fetch;
    await probeAppSupported("https://node.example/", "haf-stats-api");
    expect(String(f.mock.calls[0][0])).toBe(
      "https://node.example/haf-stats-api/version"
    );
  });

  it("a definitive 404 returns false with NO retry", async () => {
    const f = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    global.fetch = f as unknown as typeof fetch;
    await expect(
      probeAppSupported("https://node.example", "balance-api")
    ).resolves.toBe(false);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("a transient 503 is RETRIED (3 attempts) then returns false", async () => {
    const f = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    global.fetch = f as unknown as typeof fetch;
    await expect(
      probeAppSupported("https://node.example", "balance-api")
    ).resolves.toBe(false);
    expect(f).toHaveBeenCalledTimes(3);
  }, 10000);

  it("retries a THROWING fetch up to 3 times, then returns false", async () => {
    const f = jest.fn().mockRejectedValue(new Error("network down"));
    global.fetch = f as unknown as typeof fetch;
    await expect(
      probeAppSupported("https://node.example", "balance-api")
    ).resolves.toBe(false);
    expect(f).toHaveBeenCalledTimes(3);
  }, 10000);
});
