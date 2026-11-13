import type { NextApiRequest, NextApiResponse } from "next";
import {
  loadWithSettings,
  mockRequest,
  mockResponse,
  restoreEnv,
} from "./support/deployEnv";

type Handler = (req: NextApiRequest, res: NextApiResponse) => unknown;
type SessionModule = typeof import("@/lib/smart-signer/serverSession");

const SETTINGS = {
  EXPLORER_MODE: "full",
  LOGIN: "true",
  DASHBOARD: "true",
  DASHBOARD_SYNC: "true",
};

const route = (name: "encrypt" | "decrypt") =>
  loadWithSettings<{ default: Handler }>(
    `@/pages/api/workspace/${name}`,
    SETTINGS
  ).default;

const sessionFor = (username: string) =>
  loadWithSettings<SessionModule>(
    "@/lib/smart-signer/serverSession",
    SETTINGS
  ).createSessionToken(username, "keychain")!;

const call = async (
  name: "encrypt" | "decrypt",
  body: Record<string, unknown>,
  sessionUser = "alice"
) => {
  const res = mockResponse();
  await route(name)(
    mockRequest({
      cookies: { hivescan_session: sessionFor(sessionUser) },
      body,
    }),
    res
  );
  return res;
};

const DATA = Buffer.from("workspace bundle").toString("base64");

describe("workspace encrypt/decrypt refuse another account's session", () => {
  afterEach(restoreEnv);

  it.each(["encrypt", "decrypt"] as const)(
    "%s answers 409 when the session is another account's",
    async (name) => {
      const res = await call(name, { data: DATA, expectedUser: "bob" });
      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ error: "session_user_mismatch" });
    }
  );

  it.each(["encrypt", "decrypt"] as const)(
    "%s answers 409 when the caller names no account",
    async (name) => {
      const res = await call(name, { data: DATA });
      expect(res.statusCode).toBe(409);
    }
  );

  it("encrypts and decrypts for the session's own account", async () => {
    const encrypted = await call("encrypt", {
      data: DATA,
      expectedUser: "alice",
    });
    expect(encrypted.statusCode).toBe(200);

    const decrypted = await call("decrypt", {
      data: (encrypted.body as { result: string }).result,
      expectedUser: "alice",
    });
    expect(decrypted.statusCode).toBe(200);
    expect((decrypted.body as { result: string }).result).toBe(DATA);
  });
});
