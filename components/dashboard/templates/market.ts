import { Wallet } from "lucide-react";
import { BoardTemplate, header, section, i18nRef, userRef } from "./shared";

// Price, liquidity and your balances, on three equal columns.
const market: BoardTemplate = {
  key: "market",
  nameKey: "boards.market.name",
  descriptionKey: "boards.market.description",
  icon: Wallet,
  accent: "amber",
  items: [
    header("market", "wallet", "amber"),

    section(
      0,
      2,
      4,
      "boards.market.sectionMarket",
      "boards.market.hintMarket",
      "amber"
    ),
    { type: "market-data", x: 0, y: 3.4, w: 4, h: 1.4 },
    { type: "hive-price-chart", x: 0, y: 4.8, w: 4, h: 6 },
    {
      type: "note",
      x: 0,
      y: 10.8,
      w: 4,
      h: 2.8,
      state: {
        title: i18nRef("boards.market.noteFeedTitle"),
        text: i18nRef("boards.market.noteFeed"),
        variant: "info",
      },
    },
    { type: "tvl", x: 0, y: 13.6, w: 4, h: 4 },
    { type: "transfer-volume", x: 0, y: 17.6, w: 4, h: 5 },
    { type: "fund-and-supply", x: 0, y: 22.6, w: 4, h: 1.4 },

    section(
      4,
      2,
      4,
      "boards.market.sectionFlow",
      "boards.market.hintFlow",
      "amber"
    ),
    { type: "hp-momentum", x: 4, y: 3.4, w: 4, h: 5 },
    { type: "top-holders", x: 4, y: 8.4, w: 4, h: 8 },
    {
      type: "glossary",
      x: 4,
      y: 16.4,
      w: 4,
      h: 6,
      state: {
        title: i18nRef("boards.market.glossaryTitle"),
        terms: i18nRef("boards.market.glossaryTerms"),
        accent: "amber",
      },
    },
    {
      type: "quick-links",
      x: 4,
      y: 22.4,
      w: 4,
      h: 4.5,
      state: {
        title: i18nRef("boards.market.linksTitle"),
        accent: "amber",
        links: [
          { label: i18nRef("boards.links.topHolders"), url: "/top-holders" },
          {
            label: i18nRef("boards.links.hiveWallet"),
            url: userRef("https://wallet.hive.blog/@{user}"),
          },
          {
            label: i18nRef("boards.links.coingecko"),
            url: "https://www.coingecko.com/en/coins/hive",
          },
        ],
      },
    },

    section(
      8,
      2,
      4,
      "boards.market.sectionWallet",
      "boards.market.hintWallet",
      "amber"
    ),
    { type: "my-wallet", x: 8, y: 3.4, w: 4, h: 8 },
    { type: "my-pending-rewards", x: 8, y: 11.4, w: 4, h: 11 },
    { type: "my-balance-history", x: 8, y: 22.4, w: 4, h: 10.5 },
    { type: "my-recurring-transfers", x: 8, y: 32.9, w: 4, h: 8 },
  ],
};

export default market;
