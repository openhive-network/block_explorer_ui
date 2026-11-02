/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import AccountDetailsCard from "@/components/account/AccountDetailsCard";

// lucide-react ships ESM only, which Jest doesn't transform; the icons don't matter here.
jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);
jest.mock("@/components/VestsTooltip", () => () => null);
jest.mock("@/components/CopyToKeyboard", () => () => null);

// On a narrow screen long values are wider than the card. They must wrap,
// and the wrapper must scroll rather than clip, so no value is cut off.
describe("AccountDetailsCard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    // jsdom lacks these; the table, the width hook and the tooltip only need them to exist.
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.assign(globalThis, {
      IntersectionObserver: NoopObserver,
      ResizeObserver: NoopObserver,
      matchMedia: () => ({ matches: false }),
    });
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

  it("wraps long values and never clips the properties table", () => {
    act(() => {
      root.render(
        <AccountDetailsCard
          header="Properties"
          userDetails={{
            name: "alice",
            last_account_recovery: "1970/01/01 00:00:00 UTC",
          }}
          isInitiallyOpen={true}
        />
      );
    });

    const wrapper = container.querySelector("table")?.parentElement;
    expect(wrapper?.classList).toContain("overflow-auto");
    expect(wrapper?.classList).not.toContain("overflow-hidden");
    const valueCell = [...container.querySelectorAll("tr")].find((row) =>
      row.textContent?.includes("last_account_recovery")
    )?.cells[1];
    expect(valueCell?.classList).toContain("wrap-anywhere");
    expect(valueCell?.classList).not.toContain("whitespace-nowrap");
  });
});
