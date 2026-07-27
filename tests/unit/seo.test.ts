import {
  absoluteBaseUrl,
  canonicalUrl,
  pageTitle,
  clamp,
  listPageMeta,
  webSiteJsonLd,
  organizationJsonLd,
  socialProfiles,
  siteConfig,
} from "@/utils/seo";

const req = (headers: Record<string, string>) => ({ headers });

describe("seo utils", () => {
  describe("absoluteBaseUrl", () => {
    it("defaults protocol to https and uses host", () => {
      expect(absoluteBaseUrl(req({ host: "hivescan.info" }))).toBe(
        "https://hivescan.info"
      );
    });

    it("honors x-forwarded-proto and x-forwarded-host (proxy)", () => {
      expect(
        absoluteBaseUrl(
          req({
            "x-forwarded-proto": "http",
            "x-forwarded-host": "localhost:5000",
            host: "ignored",
          })
        )
      ).toBe("http://localhost:5000");
    });

    it("takes the first proto when comma-separated", () => {
      expect(
        absoluteBaseUrl(
          req({ "x-forwarded-proto": "https,http", host: "example.com" })
        )
      ).toBe("https://example.com");
    });
  });

  describe("canonicalUrl", () => {
    it("appends a path", () => {
      expect(canonicalUrl(req({ host: "h.info" }), "/witnesses")).toBe(
        "https://h.info/witnesses"
      );
    });

    it("returns the bare base for the home path", () => {
      expect(canonicalUrl(req({ host: "h.info" }), "/")).toBe("https://h.info");
    });
  });

  describe("pageTitle", () => {
    it("appends the site name", () => {
      expect(pageTitle("Block 5")).toBe(`Block 5 | ${siteConfig.name}`);
    });
    it("returns just the site name when empty", () => {
      expect(pageTitle()).toBe(siteConfig.name);
    });
  });

  describe("clamp", () => {
    it("truncates to the limit with an ellipsis", () => {
      const out = clamp("a".repeat(300));
      expect(out.length).toBeLessThanOrEqual(160);
      expect(out.endsWith("…")).toBe(true);
    });
    it("leaves short strings untouched", () => {
      expect(clamp("short")).toBe("short");
    });
  });

  describe("listPageMeta", () => {
    it("builds a full SeoMeta with a CollectionPage JSON-LD", () => {
      const meta = listPageMeta(
        req({ host: "h.info" }),
        "/witnesses",
        "Hive Witnesses",
        "desc"
      );
      expect(meta.title).toBe(`Hive Witnesses | ${siteConfig.name}`);
      expect(meta.canonical).toBe("https://h.info/witnesses");
      const jsonLd = meta.jsonLd as Record<string, unknown>;
      expect(jsonLd["@type"]).toBe("CollectionPage");
      expect(jsonLd.url).toBe("https://h.info/witnesses");
    });
  });

  describe("JSON-LD builders", () => {
    it("WebSite and Organization use schema.org and the base url", () => {
      const w = webSiteJsonLd("https://h.info", "desc");
      expect(w["@context"]).toBe("https://schema.org");
      expect(w["@type"]).toBe("WebSite");
      expect(w.url).toBe("https://h.info");
      expect(w.description).toBe("desc");

      const o = organizationJsonLd("https://h.info");
      expect(o["@type"]).toBe("Organization");
    });
  });

  describe("socialProfiles / sameAs", () => {
    const OLD = process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES;
    afterEach(() => {
      process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES = OLD;
    });
    it("parses a comma-separated list and drops non-URLs", () => {
      process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES =
        "https://x.com/a, https://facebook.com/b ,nope";
      const p = socialProfiles();
      expect(p).toContain("https://x.com/a");
      expect(p).toContain("https://facebook.com/b");
      expect(p).not.toContain("nope");
    });
    it("Organization gets sameAs when profiles are set, omits it otherwise", () => {
      process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES = "https://youtube.com/@c";
      expect(organizationJsonLd("https://h.info").sameAs).toEqual(
        expect.arrayContaining(["https://youtube.com/@c"])
      );
      process.env.NEXT_PUBLIC_SITE_SOCIAL_PROFILES = "";
      expect(organizationJsonLd("https://h.info").sameAs).toBeUndefined();
    });
  });
});
