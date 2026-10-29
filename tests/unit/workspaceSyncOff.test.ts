import type { NextApiRequest, NextApiResponse } from "next";

const mockResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end() {
      return res;
    },
    setHeader() {
      return res;
    },
  };
  return res;
};

describe("workspace routes with sync off", () => {
  const original = process.env.REACT_APP_DASHBOARD_SYNC;
  afterAll(() => {
    process.env.REACT_APP_DASHBOARD_SYNC = original;
  });

  it.each(["encrypt", "decrypt"])(
    "/api/workspace/%s answers 404 before reading the request",
    async (route) => {
      process.env.REACT_APP_DASHBOARD_SYNC = "false";
      let handler: (req: NextApiRequest, res: NextApiResponse) => unknown;
      jest.isolateModules(() => {
        handler = require(`@/pages/api/workspace/${route}`).default;
      });
      const res = mockResponse();
      await handler!(
        {
          method: "POST",
          headers: {},
          body: { data: "AAAA" },
          socket: {},
        } as unknown as NextApiRequest,
        res as unknown as NextApiResponse
      );
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Not available" });
    }
  );
});
