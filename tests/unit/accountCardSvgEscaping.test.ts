import {
  buildAccountCardSvg,
  AccountCardData,
} from "@/components/account/accountCard/accountCardSvg";

// This SVG string reaches two injection sinks: the /api/og/account route serves
// it as image/svg+xml (which executes script if opened directly), and
// AccountShareCard injects it via dangerouslySetInnerHTML. Its internal esc()
// is the only guard on both, so every user-controlled field is asserted here.
const XSS = `"><script>alert(1)</script>`;

const cardWith = (over: Partial<AccountCardData>): AccountCardData => ({
  name: "alice",
  avatarHref: "",
  reputation: 70,
  role: "Investor",
  tenure: "5 YEARS",
  isWitness: false,
  badges: [],
  stats: [],
  brand: "Hive Block Explorer",
  brandLogoHref: "",
  ctaLabel: "View profile",
  ...over,
});

const assertInert = (svg: string) => {
  expect(svg).not.toContain("<script>");
  expect(svg).not.toContain("</script>");
  // The payload's quote must not be able to close an attribute.
  expect(svg).not.toContain('"><script');
  expect(svg).toContain("&lt;script&gt;");
};

describe("account card SVG escaping", () => {
  it("escapes a script payload in the account name", () => {
    assertInert(buildAccountCardSvg(cardWith({ name: XSS })));
  });

  it("escapes a script payload in the role", () => {
    assertInert(buildAccountCardSvg(cardWith({ role: XSS })));
  });

  it("escapes a script payload in badges and stats", () => {
    assertInert(
      buildAccountCardSvg(
        cardWith({
          badges: [{ text: XSS }],
          stats: [{ label: XSS, value: XSS, sub: XSS, delta: XSS }],
        })
      )
    );
  });

  it("escapes a script payload in witness metrics", () => {
    assertInert(
      buildAccountCardSvg(
        cardWith({
          isWitness: true,
          witnessMetrics: [{ value: XSS, label: XSS }],
        })
      )
    );
  });

  it("escapes brand, tenure, cta and avatar href", () => {
    assertInert(
      buildAccountCardSvg(
        cardWith({
          brand: XSS,
          tenure: XSS,
          ctaLabel: XSS,
          avatarHref: XSS,
          brandLogoHref: XSS,
        })
      )
    );
  });

  it("coerces reputation to a number so it can't carry markup", () => {
    const svg = buildAccountCardSvg(
      cardWith({
        reputation: "70<script>alert(1)</script>" as unknown as number,
      })
    );
    expect(svg).not.toContain("<script>");
  });

  it("still renders the real content around the escaping", () => {
    const svg = buildAccountCardSvg(cardWith({ name: "alice" }));
    expect(svg).toContain("@alice");
    expect(svg.startsWith("<svg")).toBe(true);
  });
});
