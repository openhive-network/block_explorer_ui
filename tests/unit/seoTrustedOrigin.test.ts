// utils/seo reads SITE_URL once at module load, so each case needs a fresh
// module registry with the env set beforehand.
const load = (env: Record<string, string | undefined>) => {
  let mod: typeof import("@/utils/seo");
  jest.isolateModules(() => {
    const prev = { ...process.env };
    Object.assign(process.env, env);
    mod = require("@/utils/seo");
    process.env = prev;
  });
  return mod!;
};

const spoofed = {
  headers: { host: "evil.com", "x-forwarded-host": "evil.com" },
};

describe("trusted origin beats a spoofed Host", () => {
  it("ignores Host / X-Forwarded-Host when SITE_URL is configured", () => {
    const seo = load({ NEXT_PUBLIC_SITE_URL: "https://hivescan.info" });
    expect(seo.absoluteBaseUrl(spoofed)).toBe("https://hivescan.info");
    expect(seo.canonicalUrl(spoofed, "/witnesses")).toBe(
      "https://hivescan.info/witnesses"
    );
  });

  it("allows shared caching only when the origin is trusted", () => {
    expect(
      load({ NEXT_PUBLIC_SITE_URL: "https://hivescan.info" })
        .SEO_LIST_CACHE_CONTROL
    ).toContain("s-maxage");
  });

  // The hazard: without a configured origin the body is host-derived, so it must
  // never be stored by a shared cache and replayed to other visitors.
  it("refuses shared caching when falling back to request headers", () => {
    const seo = load({
      NEXT_PUBLIC_SITE_URL: undefined,
      REACT_APP_SITE_URL: undefined,
    });
    expect(seo.absoluteBaseUrl(spoofed)).toBe("https://evil.com");
    expect(seo.SEO_LIST_CACHE_CONTROL).toBe("private, no-store");
  });

  it("accepts the runtime REACT_APP_SITE_URL alias", () => {
    expect(
      load({
        NEXT_PUBLIC_SITE_URL: undefined,
        REACT_APP_SITE_URL: "https://hivescan.info",
      }).absoluteBaseUrl(spoofed)
    ).toBe("https://hivescan.info");
  });
});
