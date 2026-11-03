import type { NextApiRequest, NextApiResponse } from "next";
import {
  loadWithSettings,
  mockRequest,
  mockResponse,
  restoreEnv,
} from "./support/deployEnv";

// Jest can't load wax (ESM with wasm); these tests stop before any chain call.
jest.mock("@/utils/waxClient", () => ({ getWaxChain: jest.fn(), getAccount: jest.fn() }));

type Handler = (req: NextApiRequest, res: NextApiResponse) => unknown;

const call = async (route: string, settings: Record<string, string>) => {
  const handler = loadWithSettings<{ default: Handler }>(
    `@/pages/api/auth/${route}`,
    settings
  ).default;
  const res = mockResponse();
  await handler(mockRequest(), res);
  return res;
};

const KEYCHAIN_ROUTES = ["keychain-challenge", "keychain-session"];
const HIVESIGNER_ROUTES = ["hs-exchange", "broadcast"];

describe("auth routes when login is off", () => {
  afterEach(restoreEnv);

  it.each([...KEYCHAIN_ROUTES, ...HIVESIGNER_ROUTES])(
    "/api/auth/%s answers 404 with LOGIN=false",
    async (route) => {
      const res = await call(route, { LOGIN: "false" });
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Not available" });
    }
  );

  it.each(KEYCHAIN_ROUTES)(
    "/api/auth/%s answers 404 when Keychain is excluded",
    async (route) => {
      const res = await call(route, { LOGIN_EXCLUDE: "keychain" });
      expect(res.statusCode).toBe(404);
    }
  );

  it.each(HIVESIGNER_ROUTES)(
    "/api/auth/%s answers 404 when Hivesigner is excluded",
    async (route) => {
      const res = await call(route, { LOGIN_EXCLUDE: "hivesigner" });
      expect(res.statusCode).toBe(404);
    }
  );

  it("keeps the routes open when login is on", async () => {
    const res = await call("keychain-challenge", {});
    expect(res.statusCode).not.toBe(404);
  });
});
