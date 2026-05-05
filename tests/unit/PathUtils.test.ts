import { withBasePath, getBasePath, getImageSrc } from "@/utils/PathUtils";

describe("PathUtils with no base path configured", () => {
  beforeEach(() => {
    delete (globalThis as any).window;
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it("withBasePath returns the path unchanged", () => {
    expect(withBasePath("/foo")).toBe("/foo");
  });

  it("getBasePath returns empty string", () => {
    expect(getBasePath()).toBe("");
  });

  it("getImageSrc returns the src unchanged", () => {
    expect(getImageSrc("/avatar.png")).toBe("/avatar.png");
  });
});

describe("PathUtils with base path from process.env", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/explorer";
    delete (globalThis as any).window;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it("getBasePath reads from env", () => {
    expect(getBasePath()).toBe("/explorer");
  });

  it("getImageSrc prepends the base path to a relative src", () => {
    expect(getImageSrc("/avatar.png")).toBe("/explorer/avatar.png");
  });

  it("getImageSrc leaves absolute URLs alone", () => {
    expect(getImageSrc("https://images.hive.blog/u/x/avatar")).toBe(
      "https://images.hive.blog/u/x/avatar"
    );
  });

  it("getImageSrc does not double-prepend when src already starts with the base path", () => {
    expect(getImageSrc("/explorer/avatar.png")).toBe("/explorer/avatar.png");
  });
});

describe("withBasePath with browser window.__ENV", () => {
  beforeEach(() => {
    (globalThis as any).window = {
      __ENV: { REACT_APP_BASE_PATH: "/explorer" },
    };
  });
  afterEach(() => {
    delete (globalThis as any).window;
  });

  it("prepends base path to a relative path", () => {
    expect(withBasePath("/blocks")).toBe("/explorer/blocks");
  });

  it("normalizes path without leading slash", () => {
    expect(withBasePath("blocks")).toBe("/explorer/blocks");
  });

  it("leaves absolute URLs alone", () => {
    expect(withBasePath("https://hive.blog/post")).toBe(
      "https://hive.blog/post"
    );
  });

  it("leaves protocol-relative URLs alone", () => {
    expect(withBasePath("//cdn.example.com/x")).toBe("//cdn.example.com/x");
  });

  it("leaves hash and query fragments alone", () => {
    expect(withBasePath("#section")).toBe("#section");
    expect(withBasePath("?q=foo")).toBe("?q=foo");
  });
});
