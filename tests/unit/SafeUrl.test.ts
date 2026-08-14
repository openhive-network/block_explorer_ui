import { isInAppPath, normalizeExternalUrl } from "@/utils/SafeUrl";

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
    expect(isInAppPath("witnesses")).toBe(false);
    expect(isInAppPath("")).toBe(false);
    expect(isInAppPath(undefined)).toBe(false);
    expect(isInAppPath(null)).toBe(false);
    expect(isInAppPath(42)).toBe(false);
    expect(isInAppPath({})).toBe(false);
  });
});
