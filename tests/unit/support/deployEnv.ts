import type { NextApiRequest, NextApiResponse } from "next";

import { DEPLOY_KEYS } from "./clearDeployEnv";

const originalEnv = { ...process.env };

// Jest loads the developer's .env, so every deploy setting is cleared first and
// only the ones a test names apply. The tests switch features off one at a time,
// so they start from full mode unless they name another.
export const setDeployEnv = (settings: Record<string, string> = {}) => {
  for (const key of DEPLOY_KEYS) delete process.env[`REACT_APP_${key}`];
  process.env.REACT_APP_EXPLORER_MODE = "full";
  Object.assign(process.env, {
    NEXT_PUBLIC_HIVESIGNER_APP: "explorer-app",
    NEXT_PUBLIC_HIVESIGNER_CALLBACK: "http://localhost/",
    HIVESIGNER_APP: "explorer-app",
    HIVESIGNER_SECRET: "test-secret",
    WORKSPACE_ENCRYPTION_KEY: "ab".repeat(32),
  });
  for (const [key, value] of Object.entries(settings)) {
    process.env[`REACT_APP_${key}`] = value;
  }
};

export const restoreEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
};

// Settings are resolved when the module loads, so each load gets a fresh registry.
export const loadWithSettings = <T>(
  modulePath: string,
  settings: Record<string, string> = {}
): T => {
  setDeployEnv(settings);
  let loaded!: T;
  jest.isolateModules(() => {
    loaded = require(modulePath);
  });
  return loaded;
};

export const mockRequest = (overrides: Record<string, unknown> = {}) =>
  ({
    method: "POST",
    headers: {},
    cookies: {},
    body: {},
    query: {},
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  }) as unknown as NextApiRequest;

export const mockResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    written: "",
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    write(chunk: string) {
      res.written += chunk;
      return true;
    },
    end() {
      return res;
    },
    setHeader() {
      return res;
    },
  };
  return res as typeof res & NextApiResponse;
};
