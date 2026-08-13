import { Zap } from "lucide-react";
import { BoardTemplate, header, section, i18nRef } from "./shared";

const essentials: BoardTemplate = {
  key: "essentials",
  nameKey: "boards.essentials.name",
  descriptionKey: "boards.essentials.description",
  icon: Zap,
  accent: "slate",
  items: [
    header("essentials", "zap", "slate"),

    section(
      0,
      2,
      4,
      "boards.essentials.sectionNow",
      "boards.essentials.hintNow",
      "slate"
    ),
    { type: "live-info", x: 0, y: 3.4, w: 4, h: 2.5 },
    { type: "market-data", x: 0, y: 5.9, w: 4, h: 1.4 },
    { type: "fund-and-supply", x: 0, y: 7.3, w: 4, h: 1.4 },
    { type: "hive-parameters", x: 0, y: 8.7, w: 4, h: 1.4 },
    { type: "blockchain-dates", x: 0, y: 10.1, w: 4, h: 1.4 },
    { type: "top-communities", x: 0, y: 11.5, w: 4, h: 6 },
    {
      type: "quick-links",
      x: 0,
      y: 17.5,
      w: 4,
      h: 4.5,
      state: {
        title: i18nRef("boards.essentials.linksTitle"),
        accent: "slate",
        links: [
          { label: i18nRef("boards.links.blocks"), url: "/blocks" },
          { label: i18nRef("boards.links.witnesses"), url: "/witnesses" },
          { label: i18nRef("boards.links.communities"), url: "/communities" },
        ],
      },
    },

    section(
      4,
      2,
      8,
      "boards.essentials.sectionWatch",
      "boards.essentials.hintWatch",
      "slate"
    ),
    { type: "hive-price-chart", x: 4, y: 3.4, w: 8, h: 6 },
    { type: "last-blocks", x: 4, y: 9.4, w: 8, h: 8 },
    { type: "searches", x: 4, y: 17.4, w: 8, h: 8 },
  ],
};

export default essentials;
