import { normalizeExternalUrl } from "@/utils/SafeUrl";

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
