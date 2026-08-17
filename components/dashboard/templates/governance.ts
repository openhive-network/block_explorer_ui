import { Landmark } from "lucide-react";
import { BoardTemplate, header, section, i18nRef } from "./shared";

const governance: BoardTemplate = {
  key: "governance",
  nameKey: "boards.governance.name",
  descriptionKey: "boards.governance.description",
  icon: Landmark,
  accent: "teal",
  items: [
    header("governance", "landmark", "teal"),

    section(
      0,
      2,
      3,
      "boards.governance.sectionYours",
      "boards.governance.hintYours",
      "teal"
    ),
    { type: "witness-health", x: 0, y: 3.4, w: 3, h: 6 },
    { type: "my-proposal-votes", x: 0, y: 9.4, w: 3, h: 6 },
    {
      type: "note",
      x: 0,
      y: 15.4,
      w: 3,
      h: 2.8,
      state: {
        title: i18nRef("boards.governance.noteVotesTitle"),
        text: i18nRef("boards.governance.noteVotes"),
        variant: "tip",
      },
    },
    {
      type: "quick-links",
      x: 0,
      y: 18.2,
      w: 3,
      h: 5,
      state: {
        title: i18nRef("boards.governance.linksTitle"),
        accent: "teal",
        links: [
          { label: i18nRef("boards.links.witnesses"), url: "/witnesses" },
          { label: i18nRef("boards.links.proposals"), url: "/proposals" },
          { label: i18nRef("boards.links.schedule"), url: "/schedule" },
          { label: i18nRef("boards.links.topHolders"), url: "/top-holders" },
        ],
      },
    },

    section(
      3,
      2,
      6,
      "boards.governance.sectionWitnessSet",
      "boards.governance.hintWitnessSet",
      "teal"
    ),
    { type: "witness-schedule", x: 3, y: 3.4, w: 6, h: 9 },
    { type: "top-witnesses", x: 3, y: 12.4, w: 6, h: 13 },
    {
      type: "note",
      x: 3,
      y: 25.4,
      w: 6,
      h: 2.5,
      state: {
        title: i18nRef("boards.governance.noteRanksTitle"),
        text: i18nRef("boards.governance.noteRanks"),
        variant: "info",
      },
    },

    section(
      9,
      2,
      3,
      "boards.governance.sectionStake",
      "boards.governance.hintStake",
      "teal"
    ),
    { type: "voting-activity", x: 9, y: 3.4, w: 3, h: 6 },
    { type: "network-hp-distribution", x: 9, y: 9.4, w: 3, h: 7 },
    {
      type: "glossary",
      x: 9,
      y: 16.4,
      w: 3,
      h: 7,
      state: {
        title: i18nRef("boards.governance.glossaryTitle"),
        terms: i18nRef("boards.governance.glossaryTerms"),
        accent: "teal",
      },
    },
  ],
};

export default governance;
