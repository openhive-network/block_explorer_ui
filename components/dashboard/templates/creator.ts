import { PenLine } from "lucide-react";
import { BoardTemplate, header, section, i18nRef, userRef } from "./shared";

const creator: BoardTemplate = {
  key: "creator",
  nameKey: "boards.creator.name",
  descriptionKey: "boards.creator.description",
  icon: PenLine,
  accent: "violet",
  items: [
    header("creator", "penLine", "violet"),
    section(
      0,
      2,
      5,
      "boards.creator.sectionMine",
      "boards.creator.hintMine",
      "violet"
    ),
    { type: "my-content-activity", x: 0, y: 3.4, w: 5, h: 8 },
    { type: "my-community-activity", x: 0, y: 11.4, w: 5, h: 8 },
    { type: "my-top-posts", x: 0, y: 19.4, w: 5, h: 8 },
    { type: "my-pending-rewards", x: 0, y: 27.4, w: 5, h: 11 },
    {
      type: "note",
      x: 0,
      y: 38.4,
      w: 5,
      h: 2.8,
      state: {
        title: i18nRef("boards.creator.noteCurationTitle"),
        text: i18nRef("boards.creator.noteCuration"),
        variant: "tip",
      },
    },

    section(
      5,
      2,
      4,
      "boards.creator.sectionReach",
      "boards.creator.hintReach",
      "violet"
    ),
    { type: "my-notifications", x: 5, y: 3.4, w: 4, h: 9 },
    { type: "my-social-interactions", x: 5, y: 12.4, w: 4, h: 13 },

    section(
      5,
      25.4,
      4,
      "boards.creator.sectionContext",
      "boards.creator.hintContext",
      "violet"
    ),
    { type: "network-engagement", x: 5, y: 26.8, w: 4, h: 5 },
    { type: "network-content-volume", x: 5, y: 31.8, w: 4, h: 5 },
    { type: "network-author-retention", x: 5, y: 36.8, w: 4, h: 8 },

    section(
      9,
      2,
      3,
      "boards.creator.sectionAudience",
      "boards.creator.hintAudience",
      "violet"
    ),
    { type: "my-account-snapshot", x: 9, y: 3.4, w: 3, h: 6 },
    { type: "my-posting-activity", x: 9, y: 9.4, w: 3, h: 7 },
    {
      type: "glossary",
      x: 9,
      y: 16.4,
      w: 3,
      h: 7,
      state: {
        title: i18nRef("boards.creator.glossaryTitle"),
        terms: i18nRef("boards.creator.glossaryTerms"),
        accent: "violet",
      },
    },
    {
      type: "quick-links",
      x: 9,
      y: 23.4,
      w: 3,
      h: 5,
      state: {
        title: i18nRef("boards.creator.linksTitle"),
        accent: "violet",
        links: [
          {
            label: i18nRef("boards.links.myBlog"),
            url: userRef("https://hive.blog/@{user}"),
          },
          {
            label: i18nRef("boards.links.peakd"),
            url: userRef("https://peakd.com/@{user}"),
          },
          { label: i18nRef("boards.links.communities"), url: "/communities" },
        ],
      },
    },
  ],
};

export default creator;
