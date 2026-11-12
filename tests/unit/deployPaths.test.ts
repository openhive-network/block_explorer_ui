import type { GetServerSidePropsContext } from "next";
import {
  loadWithSettings,
  mockResponse,
  restoreEnv,
} from "./support/deployEnv";

type Settings = typeof import("@/utils/deploySettings");
type Sitemap = typeof import("@/pages/sitemap.xml");

const sitemapXml = async (settings: Record<string, string>) => {
  const { getServerSideProps } = loadWithSettings<Sitemap>(
    "@/pages/sitemap.xml",
    settings
  );
  const res = mockResponse();
  await getServerSideProps({
    req: { headers: { host: "explorer.example" } },
    res,
  } as unknown as GetServerSidePropsContext);
  return res.written;
};

describe("isPathEnabled", () => {
  afterEach(restoreEnv);

  it("keeps every page with the defaults", () => {
    const { isPathEnabled } = loadWithSettings<Settings>(
      "@/utils/deploySettings"
    );
    for (const path of [
      "/tools/compare",
      "/compare",
      "/communities",
      "/proposals",
      "/top-holders",
    ]) {
      expect(isPathEnabled(path)).toBe(true);
    }
  });

  it("drops the pages a switched-off section owns", () => {
    const { isPathEnabled } = loadWithSettings<Settings>(
      "@/utils/deploySettings",
      {
        TOOLS: "false",
        COMMUNITIES: "false",
        PROPOSALS: "false",
        TOP_HOLDERS: "false",
      }
    );
    expect(isPathEnabled("/tools/compare")).toBe(false);
    expect(isPathEnabled("/compare?a=x")).toBe(false);
    expect(isPathEnabled("/communities")).toBe(false);
    expect(isPathEnabled("/proposals")).toBe(false);
    expect(isPathEnabled("/top-holders")).toBe(false);
    expect(isPathEnabled("/blocks")).toBe(true);
  });
});

describe("sitemap", () => {
  afterEach(restoreEnv);

  it("lists every page with the defaults", async () => {
    const xml = await sitemapXml({});
    expect(xml).toContain("/tools/compare");
    expect(xml).toContain("/proposals");
  });

  it("leaves out switched-off pages", async () => {
    const xml = await sitemapXml({ TOOLS: "false", PROPOSALS: "false" });
    expect(xml).not.toContain("/tools/");
    expect(xml).not.toContain("/proposals");
    expect(xml).toContain("/communities");
    expect(xml).toContain("/schedule");
    expect(xml).toContain("/hardforks");
  });
});
