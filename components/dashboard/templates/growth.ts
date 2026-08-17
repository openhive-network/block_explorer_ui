import { TrendingUp } from "lucide-react";
import { BoardTemplate, header, section, i18nRef } from "./shared";

const growth: BoardTemplate = {
  key: "growth",
  nameKey: "boards.growth.name",
  descriptionKey: "boards.growth.description",
  icon: TrendingUp,
  accent: "emerald",
  items: [
    header("growth", "trendingUp", "emerald"),

    section(
      0,
      2,
      7,
      "boards.growth.sectionAcquisition",
      "boards.growth.hintAcquisition",
      "emerald"
    ),
    { type: "network-growth", x: 0, y: 3.4, w: 7, h: 4 },
    { type: "daily-active-users", x: 0, y: 7.4, w: 7, h: 4 },
    { type: "account-retention-funnel", x: 0, y: 11.4, w: 7, h: 4 },
    {
      type: "note",
      x: 0,
      y: 15.4,
      w: 7,
      h: 2.5,
      state: {
        title: i18nRef("boards.growth.noteCohortTitle"),
        text: i18nRef("boards.growth.noteCohort"),
        variant: "warning",
      },
    },
    { type: "network-engagement", x: 0, y: 17.9, w: 7, h: 5 },
    { type: "top-accounts", x: 0, y: 22.9, w: 7, h: 11 },

    section(
      7,
      2,
      5,
      "boards.growth.sectionDepth",
      "boards.growth.hintDepth",
      "emerald"
    ),
    { type: "network-author-retention", x: 7, y: 3.4, w: 5, h: 8 },
    { type: "network-content-volume", x: 7, y: 11.4, w: 5, h: 5 },
    { type: "network-dapp-usage", x: 7, y: 16.4, w: 5, h: 7 },
    { type: "hp-momentum", x: 7, y: 23.4, w: 5, h: 5 },
    {
      type: "glossary",
      x: 7,
      y: 28.4,
      w: 5,
      h: 6,
      state: {
        title: i18nRef("boards.growth.glossaryTitle"),
        terms: i18nRef("boards.growth.glossaryTerms"),
        accent: "emerald",
      },
    },
    {
      type: "quick-links",
      x: 7,
      y: 34.4,
      w: 5,
      h: 4.5,
      state: {
        title: i18nRef("boards.growth.linksTitle"),
        accent: "emerald",
        links: [
          { label: i18nRef("boards.links.communities"), url: "/communities" },
          { label: i18nRef("boards.links.topHolders"), url: "/top-holders" },
          { label: i18nRef("boards.links.blocks"), url: "/blocks" },
        ],
      },
    },
  ],
};

export default growth;
