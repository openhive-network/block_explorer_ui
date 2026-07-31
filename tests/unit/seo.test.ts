// utils/seo captures SITE_URL once at module load. Load it here with no
// configured origin so this file always exercises the request-header fallback,
// regardless of what the developer happens to have in .env. The configured-origin
// branch is covered separately in seoTrustedOrigin.test.ts.
const loadSeo = () => {
  let mod: typeof import("@/utils/seo");
  jest.isolateModules(() => {
    const prev = { ...process.env };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.REACT_APP_SITE_URL;
    mod = require("@/utils/seo");
    process.env = prev;
  });
  return mod!;
};

const {
  absoluteBaseUrl,
  canonicalUrl,
  pageTitle,
  clamp,
  listPageMeta,
  webSiteJsonLd,
  organizationJsonLd,
  socialProfiles,
  siteConfig,
  serializeJsonLd,
  profilePageJsonLd,
  defaultOgImage,
  verification,
  escapeXml,
  noindexMeta,
  SEO_LIST_CACHE_CONTROL,
} = loadSeo();

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

  describe("serializeJsonLd (XSS-safe injection)", () => {
    it("escapes < so a </script> value can't break out of the tag", () => {
      const out = serializeJsonLd({
        name: "</script><img src=x onerror=alert(1)>",
      });
      expect(out).not.toContain("</script>");
      expect(out).not.toContain("<");
      expect(out).toContain("\\u003c");
    });

    it("escapes the U+2028 / U+2029 line separators", () => {
      const u2028 = String.fromCharCode(0x2028);
      const u2029 = String.fromCharCode(0x2029);
      const out = serializeJsonLd({ name: `a${u2028}b${u2029}c` });
      expect(out).toContain("\\u2028");
      expect(out).toContain("\\u2029");
      expect(out).not.toContain(u2028);
      expect(out).not.toContain(u2029);
    });

    it("still produces valid JSON", () => {
      const obj = { "@type": "Person", name: "a<b" };
      expect(JSON.parse(serializeJsonLd(obj))).toEqual(obj);
    });
  });

  describe("profilePageJsonLd", () => {
    it("builds a ProfilePage with handle + bare identifier", () => {
      const ld = profilePageJsonLd("https://h.info/@alice", "@alice");
      expect(ld["@type"]).toBe("ProfilePage");
      expect(ld.url).toBe("https://h.info/@alice");
      const person = ld.mainEntity as Record<string, unknown>;
      expect(person.name).toBe("@alice");
      expect(person.identifier).toBe("alice");
    });
  });

  describe("defaultOgImage", () => {
    const OLD_NEXT = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE;
    const OLD_RA = process.env.REACT_APP_DEFAULT_OG_IMAGE;
    afterEach(() => {
      process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE = OLD_NEXT;
      process.env.REACT_APP_DEFAULT_OG_IMAGE = OLD_RA;
    });
    it("falls back to the generated cover route", () => {
      delete process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE;
      delete process.env.REACT_APP_DEFAULT_OG_IMAGE;
      expect(defaultOgImage("https://h.info")).toBe(
        "https://h.info/api/og/cover"
      );
    });
    it("uses an absolute override verbatim", () => {
      process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE =
        "https://cdn.example.com/x.png";
      expect(defaultOgImage("https://h.info")).toBe(
        "https://cdn.example.com/x.png"
      );
    });
    it("resolves a site-relative override against the base", () => {
      process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE = "/img/share.png";
      expect(defaultOgImage("https://h.info")).toBe(
        "https://h.info/img/share.png"
      );
    });
  });

  describe("verification", () => {
    it("exposes string google/bing token slots", () => {
      expect(typeof verification.google).toBe("string");
      expect(typeof verification.bing).toBe("string");
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

  describe("escapeXml", () => {
    it("escapes the five XML entities", () => {
      expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
    });

    // A spoofed Host reaches <loc> in the sitemap; escaping keeps it from
    // closing the tag and injecting markup into the XML.
    it("neutralizes a host that tries to break out of <loc>", () => {
      expect(escapeXml("https://evil.com</loc><loc>x")).not.toContain("<loc>");
    });

    it("escapes ampersands before the other entities (no double-encoding)", () => {
      expect(escapeXml("a&amp;b")).toBe("a&amp;amp;b");
    });
  });

  // /block/[blockId] and /tx/[transactionId] accept any string, so the gSSPs
  // gate indexability on the id actually looking like one. Kept in step with the
  // regexes in those two pages.
  describe("entity-id shapes used to gate indexability", () => {
    const isBlockRef = (s: string) =>
      /^\d[\d,]*$/.test(s) || /^[0-9a-f]{40}$/i.test(s);
    const isTxId = (s: string) => /^[0-9a-f]{40}$/i.test(s);
    const HASH = "a".repeat(40);

    it("accepts a block number (with thousands separators) or a block hash", () => {
      expect(isBlockRef("12345")).toBe(true);
      expect(isBlockRef("12,345,678")).toBe(true);
      expect(isBlockRef(HASH)).toBe(true);
    });

    it("rejects arbitrary text that would become an indexable soft-404", () => {
      expect(isBlockRef("not-a-block")).toBe(false);
      expect(isBlockRef("buy cheap followers")).toBe(false);
      expect(isBlockRef("")).toBe(false);
      expect(isTxId("hello-world")).toBe(false);
      expect(isTxId("")).toBe(false);
      expect(isTxId(`${HASH}extra`)).toBe(false);
    });

    it("accepts a 40-hex transaction id in either case", () => {
      expect(isTxId(HASH)).toBe(true);
      expect(isTxId(HASH.toUpperCase())).toBe(true);
    });
  });

  describe("noindexMeta", () => {
    it("marks the page noindex but still declares a canonical", () => {
      const m = noindexMeta(
        req({ host: "h.info" }),
        "/settings",
        "Settings",
        "Prefs."
      );
      expect(m.noindex).toBe(true);
      expect(m.canonical).toBe("https://h.info/settings");
      expect(m.title).toBe(`Settings | ${siteConfig.name}`);
    });

    it("clamps the description like every other meta builder", () => {
      const m = noindexMeta(
        req({ host: "h.info" }),
        "/x",
        "T",
        "y".repeat(300)
      );
      expect(m.description.length).toBeLessThanOrEqual(160);
      expect(m.description.endsWith("…")).toBe(true);
    });

    it("tolerates an omitted description", () => {
      expect(noindexMeta(req({ host: "h.info" }), "/x", "T").description).toBe(
        ""
      );
    });
  });

  describe("SEO_LIST_CACHE_CONTROL", () => {
    // The guarantee: a response whose URLs came from request headers must never
    // be shared-cached, or one spoofed Host gets served to everyone after it.
    // This module was loaded with no configured origin, so every URL it builds is
    // host-derived and the policy must forbid shared caching.
    it("is never shared-cacheable when URLs come from request headers", () => {
      expect(SEO_LIST_CACHE_CONTROL).toBe("private, no-store");
      expect(SEO_LIST_CACHE_CONTROL).not.toContain("s-maxage");
    });
  });
});
