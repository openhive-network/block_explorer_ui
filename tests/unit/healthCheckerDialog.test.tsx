/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "require", "default"]}
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { HealthCheckerService } from "@hiveio/healthchecker-component";
import HealthCheckerDialog from "@/components/HealthCheckerDialog";

// The real service runs on top of this stand-in for wax's HealthChecker, so the
// test needs neither the WASM bundle nor the network.
jest.mock(
  "@hiveio/wax",
  () => {
    const { EventEmitter } = jest.requireActual("events");
    class HealthChecker extends EventEmitter {
      private nextId = 0;
      register() {
        return { id: this.nextId++ };
      }
      unregisterAll() {}
      *[Symbol.iterator]() {}
    }
    return { HealthChecker };
  },
  { virtual: true }
);

// Imported by HealthCheckerDialog but not used to render it; the real modules
// pull in wax and next/router.
jest.mock("@/utils/ApiAddresses", () => jest.fn());
jest.mock("@/contexts/HealthCheckerContext", () => ({
  useHealthCheckerContext: jest.fn(),
}));

const PROVIDERS = ["https://api.hive.blog", "https://anyx.io"];

describe("HealthCheckerDialog", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleError: jest.SpyInstance;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    consoleError.mockRestore();
    window.localStorage.clear();
  });

  it("renders the healthchecker in the opened dialog without console errors", async () => {
    const service = new HealthCheckerService(
      "node",
      [
        {
          title: "Dynamic Global",
          method: jest.fn(),
          params: {},
          validatorFunction: () => true,
        },
      ],
      PROVIDERS,
      PROVIDERS[0],
      jest.fn()
    );

    await act(async () => {
      root.render(
        <HealthCheckerDialog
          trigerText="Hive node:"
          apiAddress={PROVIDERS[0]}
          healthCheckerService={service}
        />
      );
    });

    const trigger = container.querySelector<HTMLButtonElement>(
      '[data-testid="api-address-link"]'
    );
    expect(trigger?.textContent).toBe(`Hive node:${PROVIDERS[0]}`);
    expect(
      document.querySelector('[data-testid="api-address-dialog"]')
    ).toBeNull();

    await act(async () => {
      trigger!.click();
    });

    const dialog = document.querySelector('[data-testid="api-address-dialog"]');
    expect(dialog).not.toBeNull();
    for (const provider of PROVIDERS) {
      expect(dialog!.textContent).toContain(provider);
    }
    expect(consoleError).not.toHaveBeenCalled();
  });
});
