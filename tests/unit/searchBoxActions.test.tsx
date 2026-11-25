/**
 * @jest-environment jsdom
 */
import React, { act, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import AutoCompleteInput from "@/components/ui/AutoCompleteInput";

jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({
    locale: "en-US",
    t: (key: string, options?: Record<string, string>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({ push: mockPush, query: {}, pathname: "/" }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/utils/deploySettings", () => ({
  deploySettings: { proposals: true, recentVisits: true },
}));

// What the input-type lookup answers, whatever was typed.
let mockInputType: { input_type: string; input_value: string | string[] } = {
  input_type: "account_name_array",
  input_value: ["gtg", "gtg2"],
};
jest.mock("@/hooks/api/common/useInputType", () => ({
  __esModule: true,
  default: () => ({ inputTypeData: mockInputType }),
}));

let mockWitnesses = new Set<string>();
jest.mock("@/hooks/api/common/useActiveWitnessNames", () => ({
  __esModule: true,
  default: () => ({ witnessNames: mockWitnesses, isLoading: false }),
}));

const mockClear = jest.fn();
let mockRecent: { kind: string; id: string }[] = [];
jest.mock("@/hooks/common/useRecentlyViewed", () => ({
  useRecentlyViewed: () => ({ entries: mockRecent, clear: mockClear }),
}));

// The result row's badges and avatar need data this test doesn't cover.
jest.mock("@/components/ui/AutocompleteResultRow", () => ({
  __esModule: true,
  default: ({
    id,
    value,
    selected,
    onSelect,
  }: {
    id: string;
    value: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <div id={id} role="option" aria-selected={selected} onClick={onSelect}>
      {value}
    </div>
  ),
}));
jest.mock("@/components/ui/HiveAvatar", () => ({
  __esModule: true,
  default: () => null,
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

Element.prototype.scrollIntoView = jest.fn();

const Box = ({ linkResult = true }: { linkResult?: boolean }) => {
  const [value, setValue] = useState("");
  return (
    <AutoCompleteInput
      value={value}
      onChange={setValue}
      placeholder="search"
      inputType="account_name"
      linkResult={linkResult}
    />
  );
};

let container: HTMLDivElement;
let root: Root;

const input = () =>
  container.querySelector<HTMLInputElement>("[data-testid=search-bar-input]")!;

const options = () =>
  Array.from(container.querySelectorAll<HTMLElement>("[role=option]"));

const optionTexts = () => options().map((o) => o.textContent);

const type = (text: string) =>
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!;
    setter.call(input(), text);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });

// Returns whether the box took the key (prevented its default).
const press = (key: string) => {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    input().dispatchEvent(event);
  });
  return event.defaultPrevented;
};

const click = (el: Element, init: MouseEventInit = {}) =>
  act(() => {
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ...init })
    );
  });

const active = () =>
  document.getElementById(input().getAttribute("aria-activedescendant")!);

const render = (props?: { linkResult?: boolean }) =>
  act(() => {
    root.render(<Box {...props} />);
  });

beforeEach(() => {
  jest.useFakeTimers();
  mockPush.mockClear();
  mockClear.mockClear();
  mockWitnesses = new Set();
  mockRecent = [];
  mockInputType = {
    input_type: "account_name_array",
    input_value: ["gtg", "gtg2"],
  };
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.useRealTimers();
});

const ACTION = (key: string, value = "gtg") =>
  `autocompleteInput.action.${key} {"value":"${value}"}`;

describe("search box actions", () => {
  it("lists the highlighted account's searches under it", () => {
    render();
    type("gtg");
    expect(optionTexts()).toEqual([
      "gtg",
      ACTION("operations") + "autocompleteInput.last7Days",
      ACTION("transfers") + "autocompleteInput.last7Days",
      ACTION("comments"),
      ACTION("balanceHistory"),
      ACTION("proposals"),
      "gtg2",
    ]);
  });

  it("adds blocks produced for an active witness", () => {
    mockWitnesses = new Set(["gtg"]);
    render();
    type("gtg");
    expect(optionTexts()).toContain(
      ACTION("blocksProduced") + "autocompleteInput.last7Days"
    );
  });

  it("keeps the highlight when the witness list arrives late", () => {
    render();
    type("gtg");
    for (let i = 0; i < 5; i++) press("ArrowDown");
    expect(active()?.textContent).toBe(ACTION("proposals"));
    mockWitnesses = new Set(["gtg"]);
    render();
    expect(active()?.textContent).toBe(ACTION("proposals"));
  });

  it("still opens the direct match on Enter", () => {
    render();
    type("gtg");
    press("Enter");
    expect(mockPush).toHaveBeenCalledWith("/@gtg");
  });

  it("walks into the searches with the arrow keys and opens one", () => {
    render();
    type("gtg");
    press("ArrowDown");
    press("ArrowDown");
    expect(active()?.textContent).toContain(ACTION("transfers"));
    press("Enter");
    const href = mockPush.mock.calls[0][0] as string;
    expect(href).toMatch(/^\/@gtg\?filters=/);
  });

  it("moves the searches to the next account and back", () => {
    render();
    type("gtg");
    // Five searches under gtg, then gtg2.
    for (let i = 0; i < 6; i++) press("ArrowDown");
    expect(active()?.textContent).toBe("gtg2");
    expect(optionTexts()).toEqual([
      "gtg",
      "gtg2",
      ACTION("operations", "gtg2") + "autocompleteInput.last7Days",
      ACTION("transfers", "gtg2") + "autocompleteInput.last7Days",
      ACTION("comments", "gtg2"),
      ACTION("balanceHistory", "gtg2"),
      ACTION("proposals", "gtg2"),
    ]);
    press("ArrowUp");
    expect(active()?.textContent).toBe("gtg");
  });

  it("closes the list on Escape", () => {
    render();
    type("gtg");
    press("Escape");
    expect(options()).toHaveLength(0);
  });

  it("offers block searches for a block number", () => {
    mockInputType = { input_type: "block_num", input_value: "110298000" };
    render();
    type("110298000");
    expect(optionTexts()).toEqual([
      "110298000",
      ACTION("blocksUpTo", "110,298,000"),
    ]);
  });

  it("does nothing on Enter or Tab once Escape has closed the list", () => {
    render();
    type("gtg");
    press("ArrowDown");
    press("Escape");
    expect(press("Enter")).toBe(false);
    // Tab moves focus on, as in any field.
    expect(press("Tab")).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("opens the list again on ArrowDown or a click", () => {
    render();
    type("gtg");
    press("Escape");
    press("ArrowDown");
    expect(options().length).toBeGreaterThan(0);
    press("Escape");
    click(input());
    expect(options().length).toBeGreaterThan(0);
  });

  it("starts over when the text changes", () => {
    render();
    type("gtg");
    for (let i = 0; i < 6; i++) press("ArrowDown");
    expect(active()?.textContent).toBe("gtg2");
    // A shorter list: the old highlight (the second row) is gone.
    mockInputType = { input_type: "account_name_array", input_value: ["gtgx"] };
    type("gtgx");
    expect(active()?.textContent).toBe("gtgx");
    press("Enter");
    expect(mockPush).toHaveBeenCalledWith("/@gtgx");
  });

  it("dismisses the invalid-input note on Escape", () => {
    mockInputType = { input_type: "invalid_input", input_value: "!!" };
    render();
    type("!!");
    expect(container.textContent).toContain("autocompleteInput.invalidInput");
    press("Escape");
    expect(container.textContent).not.toContain(
      "autocompleteInput.invalidInput"
    );
  });

  it("opens a search on click, but leaves a Ctrl-click to the browser", () => {
    render();
    type("gtg");
    const transfers = options().find((o) =>
      o.textContent?.startsWith(ACTION("transfers"))
    )!;
    click(transfers, { ctrlKey: true });
    expect(mockPush).not.toHaveBeenCalled();
    click(transfers);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/@gtg\?filters=/)
    );
  });

  it("keeps a form field's Enter and Tab as they were", () => {
    render({ linkResult: false });
    type("gtg");
    press("Escape");
    // The form field still picks on Enter after the list closes.
    expect(press("Enter")).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("adds nothing for a transaction", () => {
    mockInputType = {
      input_type: "transaction_hash",
      input_value: "a".repeat(40),
    };
    render();
    type("a".repeat(40));
    expect(optionTexts()).toEqual(["a".repeat(40)]);
  });

  it("adds nothing to a form's account field", () => {
    render({ linkResult: false });
    type("gtg");
    expect(optionTexts()).toEqual(["gtg", "gtg2"]);
  });
});

describe("recent searches", () => {
  beforeEach(() => {
    mockRecent = [
      { kind: "account", id: "gtg" },
      { kind: "block", id: "123" },
    ];
  });

  const focus = () => act(() => input().focus());

  it("lists the latest lookups when the empty box gets focus", () => {
    render();
    focus();
    expect(optionTexts()).toEqual(["gtg", "#123"]);
    press("ArrowDown");
    press("Enter");
    expect(mockPush).toHaveBeenCalledWith("/block/123");
  });

  it("clears them", () => {
    render();
    focus();
    act(() => {
      container
        .querySelector<HTMLButtonElement>("button")!
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(mockClear).toHaveBeenCalled();
  });

  it("doesn't show them in a form field", () => {
    render({ linkResult: false });
    focus();
    expect(options()).toHaveLength(0);
  });
});
