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

// Values are single-line, so on a narrow screen the table is wider than the
// card. The wrapper must scroll, not clip, or the end of each value is unreachable.
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

  it("lets the properties table scroll horizontally instead of clipping it", () => {
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
    expect(container.textContent).toContain("1970/01/01 00:00:00 UTC");
  });
});
