import { hasHiveCover } from "@/utils/HiveBlogUtils";

const profile = (fields: Record<string, unknown>) =>
  JSON.stringify({ profile: fields });

describe("hasHiveCover", () => {
  it("reads posting metadata when its profile has a version", () => {
    expect(
      hasHiveCover({
        posting_json_metadata: profile({ version: 2, cover_image: "" }),
        json_metadata: profile({ cover_image: "https://x.io/c.png" }),
      })
    ).toBe(false);
    expect(
      hasHiveCover({
        posting_json_metadata: profile({
          version: 2,
          cover_image: "https://x.io/c.png",
        }),
      })
    ).toBe(true);
  });

  it("falls back to json metadata without a version", () => {
    expect(
      hasHiveCover({
        posting_json_metadata: profile({ cover_image: "" }),
        json_metadata: profile({ cover_image: "http://x.io/c.png" }),
      })
    ).toBe(true);
  });

  it("ignores covers that are not http(s) and broken metadata", () => {
    expect(
      hasHiveCover({
        posting_json_metadata: profile({
          version: 2,
          cover_image: "javascript:alert(1)",
        }),
      })
    ).toBe(false);
    expect(
      hasHiveCover({ posting_json_metadata: "{", json_metadata: "" })
    ).toBe(false);
  });
});

describe("next.config images", () => {
  // The server must never fetch or decode images (#835).
  it("keeps the image optimizer off", () => {
    const { images } = require("../../next.config.js");
    expect(images.unoptimized).toBe(true);
    expect(images.remotePatterns).toBeUndefined();
    expect(images.domains).toBeUndefined();
    expect(images.loader).toBeUndefined();
  });
});
