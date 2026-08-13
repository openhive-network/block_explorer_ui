import { Activity } from "lucide-react";
import { BoardTemplate, header, section, i18nRef } from "./shared";

// Chain health, in two columns at 8 / 4 — the split last-blocks forces with
// its minW of 6.
const network: BoardTemplate = {
  key: "network",
  nameKey: "boards.network.name",
  descriptionKey: "boards.network.description",
  icon: Activity,
  accent: "blue",
  items: [
    header("network", "activity", "blue"),

    section(
      0,
      2,
      8,
      "boards.network.sectionProduction",
      "boards.network.hintProduction",
      "blue"
    ),
    { type: "last-blocks", x: 0, y: 3.4, w: 8, h: 8 },
    {
      type: "note",
      x: 0,
      y: 11.4,
      w: 8,
      h: 2,
      state: {
        title: i18nRef("boards.network.noteBlocksTitle"),
        text: i18nRef("boards.network.noteBlocks"),
        variant: "info",
      },
    },
    { type: "tx-stats", x: 0, y: 13.4, w: 8, h: 5 },
    { type: "op-mix", x: 0, y: 18.4, w: 8, h: 4 },
    { type: "network-rc-utilization", x: 0, y: 22.4, w: 8, h: 4 },

    section(
      8,
      2,
      4,
      "boards.network.sectionRightNow",
      "boards.network.hintRightNow",
      "blue"
    ),
    { type: "live-info", x: 8, y: 3.4, w: 4, h: 2.5 },
    { type: "hive-parameters", x: 8, y: 5.9, w: 4, h: 1.4 },
    { type: "blockchain-dates", x: 8, y: 7.3, w: 4, h: 1.4 },
    { type: "network-dapp-usage", x: 8, y: 8.7, w: 4, h: 7 },
    {
      type: "glossary",
      x: 8,
      y: 15.7,
      w: 4,
      h: 6,
      state: {
        title: i18nRef("boards.network.glossaryTitle"),
        terms: i18nRef("boards.network.glossaryTerms"),
        accent: "blue",
      },
    },
    {
      type: "quick-links",
      x: 8,
      y: 21.7,
      w: 4,
      h: 4.5,
      state: {
        title: i18nRef("boards.network.linksTitle"),
        accent: "blue",
        links: [
          { label: i18nRef("boards.links.blocks"), url: "/blocks" },
          { label: i18nRef("boards.links.schedule"), url: "/schedule" },
          { label: i18nRef("boards.links.witnesses"), url: "/witnesses" },
        ],
      },
    },
  ],
};

export default network;
