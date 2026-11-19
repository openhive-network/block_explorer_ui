/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import fs from "fs";
import path from "path";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";

// lucide-react ships ESM only, which Jest doesn't transform; the icons don't matter here.
jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

// #755: a card states the time window its figures cover in its header.
describe("CardHeaderWithLink period", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("shows the period next to the title", () => {
    act(() => {
      root.render(
        <CardHeaderWithLink title="Operations by Type" period="Last 30 days" />
      );
    });
    const badge = container.querySelector('[data-testid="card-period"]');
    expect(badge?.textContent).toBe("Last 30 days");
    // Inside the heading, so screen readers read it with the title.
    expect(badge?.closest("h3")).not.toBeNull();
  });

  it("shows no badge when the card has no period", () => {
    act(() => {
      root.render(<CardHeaderWithLink title="Operations by Type" />);
    });
    expect(container.querySelector('[data-testid="card-period"]')).toBeNull();
  });
});

describe("period translations", () => {
  const dir = path.join(__dirname, "../../i18n");
  const locales = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  it.each(locales)("%s defines common.last30Days", (file) => {
    const messages = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    expect(messages["common.last30Days"]).toEqual(expect.any(String));
    expect(messages["common.last30Days"].trim()).not.toBe("");
  });
});

// Both cards cover the last 30 days in every figure, so each must say so. Rendering
// them needs their data hooks; the prop is what matters, so the source is checked.
describe("cards that show a period", () => {
  it.each(["NetworkOpMixCard.tsx", "NetworkRcUtilizationCard.tsx"])(
    "%s passes the 30-day period to its header",
    (file) => {
      const source = fs.readFileSync(
        path.join(__dirname, "../../components/home", file),
        "utf8"
      );
      expect(source).toMatch(/period=\{t\("common\.last30Days"\)\}/);
    }
  );
});
