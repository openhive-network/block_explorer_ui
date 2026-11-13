/**
 * @jest-environment jsdom
 */
import {
  MAX_REMEMBERED_ACCOUNTS,
  REMEMBERED_ACCOUNTS_KEY,
  forgetAccount,
  readRememberedAccounts,
  rememberAccount,
} from "@/utils/rememberedAccounts";

const names = () => readRememberedAccounts().map((a) => a.username);

beforeEach(() => localStorage.clear());

describe("rememberedAccounts", () => {
  it("starts empty", () => {
    expect(readRememberedAccounts()).toEqual([]);
  });

  it("keeps the newest sign-in first, once per account", () => {
    rememberAccount("alice", "keychain");
    rememberAccount("bob", "hivesigner");
    rememberAccount("alice", "hivesigner");
    expect(readRememberedAccounts()).toEqual([
      { username: "alice", method: "hivesigner" },
      { username: "bob", method: "hivesigner" },
    ]);
  });

  it(`keeps at most ${MAX_REMEMBERED_ACCOUNTS}, dropping the oldest`, () => {
    ["aaa", "bbb", "ccc", "ddd", "eee", "fff"].forEach((name) =>
      rememberAccount(name, "keychain")
    );
    expect(names()).toEqual(["fff", "eee", "ddd", "ccc", "bbb"]);
  });

  it("forgets one account and leaves the rest", () => {
    rememberAccount("alice", "keychain");
    rememberAccount("bob", "keychain");
    forgetAccount("alice");
    expect(names()).toEqual(["bob"]);
  });

  it("ignores invalid names and methods", () => {
    rememberAccount("Not A Name", "keychain");
    rememberAccount("alice", "password" as never);
    expect(readRememberedAccounts()).toEqual([]);
  });

  it("survives corrupt or tampered storage", () => {
    localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, "{not json");
    expect(readRememberedAccounts()).toEqual([]);

    localStorage.setItem(
      REMEMBERED_ACCOUNTS_KEY,
      JSON.stringify([
        { username: "alice", method: "keychain", token: "secret" },
        { username: "<img>", method: "keychain" },
        "bob",
      ])
    );
    expect(readRememberedAccounts()).toEqual([
      { username: "alice", method: "keychain" },
    ]);
  });
});
