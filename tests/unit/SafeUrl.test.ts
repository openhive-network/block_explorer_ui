import {
  isInAppPath,
  normalizeExternalUrl,
  resolveLinkTarget,
} from "@/utils/SafeUrl";

describe("normalizeExternalUrl", () => {
  it("accepts a valid https URL", () => {
    expect(normalizeExternalUrl("https://example.com/path")).toBe(
      "https://example.com/path"
    );
  });

  it("accepts a valid http URL", () => {
    expect(normalizeExternalUrl("http://example.com")).toBe(
      "http://example.com/"
    );
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeExternalUrl("  https://example.com  ")).toBe(
      "https://example.com/"
    );
  });

  it("rejects javascript: URLs", () => {
    expect(normalizeExternalUrl("javascript:alert(1)")).toBeNull();
  });

  // Rejected by the http/https allowlist rather than a blocklist, so these hold
  // by construction — pinned so a future switch to blocklisting cannot slip.
  it("rejects vbscript: URLs", () => {
    expect(normalizeExternalUrl("vbscript:msgbox(1)")).toBeNull();
  });

  it("rejects a scheme regardless of case", () => {
    expect(normalizeExternalUrl("JavaScript:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("JAVASCRIPT:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("VbScript:msgbox(1)")).toBeNull();
    // The allowlist itself must stay case-insensitive the other way too.
    expect(normalizeExternalUrl("HTTPS://example.com")).toBe(
      "https://example.com/"
    );
  });

  // Browsers strip tabs and newlines out of URLs, so a split scheme can slip
  // past a naive string check. new URL() rejects it outright.
  it("rejects a scheme broken up by control characters", () => {
    expect(normalizeExternalUrl("java\tscript:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("java\nscript:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("java\rscript:alert(1)")).toBeNull();
  });

  it("rejects data: URLs", () => {
    expect(
      normalizeExternalUrl("data:text/html,<script>alert(1)</script>")
    ).toBeNull();
  });

  it("rejects file: URLs", () => {
    expect(normalizeExternalUrl("file:///etc/passwd")).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(normalizeExternalUrl("not a url")).toBeNull();
  });

  it("rejects empty input", () => {
    expect(normalizeExternalUrl("")).toBeNull();
    expect(normalizeExternalUrl("   ")).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(normalizeExternalUrl(undefined)).toBeNull();
    expect(normalizeExternalUrl(null)).toBeNull();
    expect(normalizeExternalUrl(42)).toBeNull();
    expect(normalizeExternalUrl({})).toBeNull();
  });
});

describe("isInAppPath", () => {
  it("accepts paths inside the explorer", () => {
    expect(isInAppPath("/")).toBe(true);
    expect(isInAppPath("/witnesses")).toBe(true);
    expect(isInAppPath("/@user")).toBe(true);
    expect(isInAppPath("/api/og/card.png")).toBe(true);
    expect(isInAppPath("/proposals?id=1")).toBe(true);
    expect(isInAppPath("/block/123#op")).toBe(true);
  });

  it.each([
    ["protocol-relative", "//evil.com"],
    ["backslash", "/\\evil.com"],
    ["backslash then slash", "/\\/evil.com"],
    ["double backslash", "/\\\\evil.com"],
    ["tab then slash", "/\t/evil.com"],
    ["newline then slash", "/\n/evil.com"],
    ["carriage return then slash", "/\r/evil.com"],
    ["tab then backslash", "/\t\\evil.com"],
  ])("rejects %s, which leaves the site", (_label, url) => {
    expect(new URL(url, "https://hivescan.info").origin).not.toBe(
      "https://hivescan.info"
    );
    expect(isInAppPath(url)).toBe(false);
  });

  it("rejects absolute and non-path input", () => {
    expect(isInAppPath("https://example.com")).toBe(false);
    expect(isInAppPath("javascript:alert(1)")).toBe(false);
    expect(isInAppPath("JavaScript:alert(1)")).toBe(false);
    expect(isInAppPath("vbscript:msgbox(1)")).toBe(false);
    expect(isInAppPath("java\tscript:alert(1)")).toBe(false);
    expect(isInAppPath("witnesses")).toBe(false);
    expect(isInAppPath("")).toBe(false);
    expect(isInAppPath(undefined)).toBe(false);
    expect(isInAppPath(null)).toBe(false);
    expect(isInAppPath(42)).toBe(false);
    expect(isInAppPath({})).toBe(false);
  });
});

// Witness urls are free text from witness_update; these are real values from
// chain (2026-11-07). Only a web address or an in-app path may become a link.
describe("resolveLinkTarget", () => {
  it("keeps web addresses", () => {
    expect(resolveLinkTarget("https://blocktrades.us")).toBe(
      "https://blocktrades.us/"
    );
    expect(resolveLinkTarget("http://example.com/witness")).toBe(
      "http://example.com/witness"
    );
  });

  it("keeps in-app paths as they are", () => {
    expect(
      resolveLinkTarget("/witness-category/@lapingvino/lapingvino-witness")
    ).toBe("/witness-category/@lapingvino/lapingvino-witness");
    expect(resolveLinkTarget("/@scrooger")).toBe("/@scrooger");
  });

  it("rejects values without a scheme instead of linking them relatively", () => {
    expect(resolveLinkTarget("steemit.com")).toBeNull();
    expect(resolveLinkTarget("www.steemit.com")).toBeNull();
    expect(resolveLinkTarget("witness.mayega.com")).toBeNull();
    expect(resolveLinkTarget("soon")).toBeNull();
  });

  it("rejects blank values and other schemes", () => {
    expect(resolveLinkTarget(" ")).toBeNull();
    expect(resolveLinkTarget("")).toBeNull();
    expect(resolveLinkTarget("javascript:alert(1)")).toBeNull();
    expect(resolveLinkTarget("//evil.com")).toBeNull();
  });
});
