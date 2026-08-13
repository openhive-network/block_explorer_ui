import { UserCircle } from "lucide-react";
import { BoardTemplate, section, i18nRef, userRef } from "./shared";

const me: BoardTemplate = {
  key: "me",
  nameKey: "boards.me.name",
  descriptionKey: "boards.me.description",
  icon: UserCircle,
  accent: "indigo",
  items: [
    {
      type: "profile-banner",
      x: 0,
      y: 0,
      w: 12,
      h: 2.4,
      state: {
        tagline: i18nRef("boards.me.tagline"),
        accent: "indigo",
      },
    },

    section(
      0,
      2.4,
      4,
      "boards.me.sectionWallet",
      "boards.me.hintWallet",
      "indigo"
    ),
    { type: "my-wallet", x: 0, y: 3.8, w: 4, h: 8 },
    { type: "my-pending-rewards", x: 0, y: 11.8, w: 4, h: 11 },
    { type: "my-balance-history", x: 0, y: 22.8, w: 4, h: 10.5 },
    { type: "my-recurring-transfers", x: 0, y: 33.3, w: 4, h: 8 },
    {
      type: "note",
      x: 0,
      y: 41.3,
      w: 4,
      h: 2.8,
      state: {
        title: i18nRef("boards.me.notePowerDownTitle"),
        text: i18nRef("boards.me.notePowerDown"),
        variant: "info",
      },
    },
    { type: "my-hp-activity", x: 0, y: 44.1, w: 4, h: 6 },

    section(
      4,
      2.4,
      5,
      "boards.me.sectionWhatIDo",
      "boards.me.hintWhatIDo",
      "indigo"
    ),
    { type: "my-content-activity", x: 4, y: 3.8, w: 5, h: 8 },
    { type: "my-financial-summary", x: 4, y: 11.8, w: 5, h: 8 },
    { type: "my-recent-activity", x: 4, y: 19.8, w: 5, h: 7 },
    {
      type: "note",
      x: 4,
      y: 26.8,
      w: 5,
      h: 2.5,
      state: {
        title: i18nRef("boards.me.noteRcTitle"),
        text: i18nRef("boards.me.noteRc"),
        variant: "tip",
      },
    },
    { type: "my-rc-consumption", x: 4, y: 29.3, w: 5, h: 8 },
    { type: "my-rc-footprint", x: 4, y: 37.3, w: 5, h: 8 },

    section(9, 2.4, 3, "boards.me.sectionLent", "boards.me.hintLent", "indigo"),
    { type: "my-hp-delegations", x: 9, y: 3.8, w: 3, h: 8 },
    { type: "my-rc-delegations", x: 9, y: 11.8, w: 3, h: 8 },

    section(
      9,
      19.8,
      3,
      "boards.me.sectionBacked",
      "boards.me.hintBacked",
      "indigo"
    ),
    { type: "watched-proposals", x: 9, y: 21.2, w: 3, h: 6 },
    { type: "witness-health", x: 9, y: 27.2, w: 3, h: 6 },

    {
      type: "glossary",
      x: 9,
      y: 33.2,
      w: 3,
      h: 7,
      state: {
        title: i18nRef("boards.me.glossaryTitle"),
        terms: i18nRef("boards.me.glossaryTerms"),
        accent: "indigo",
      },
    },

    // Reference material rather than daily reading, so it tails the column.
    section(
      9,
      40.2,
      3,
      "boards.me.sectionWhoIAm",
      "boards.me.hintWhoIAm",
      "indigo"
    ),
    { type: "my-account-snapshot", x: 9, y: 41.6, w: 3, h: 6 },

    section(
      9,
      47.6,
      3,
      "boards.me.sectionPlaces",
      "boards.me.hintPlaces",
      "indigo"
    ),
    {
      type: "quick-links",
      x: 9,
      y: 49,
      w: 3,
      h: 5,
      state: {
        title: i18nRef("boards.me.linksTitle"),
        accent: "indigo",
        links: [
          {
            label: i18nRef("boards.links.myBlog"),
            url: userRef("https://hive.blog/@{user}"),
          },
          {
            label: i18nRef("boards.links.peakd"),
            url: userRef("https://peakd.com/@{user}"),
          },
          {
            label: i18nRef("boards.links.ecency"),
            url: userRef("https://ecency.com/@{user}"),
          },
          {
            label: i18nRef("boards.links.hiveWallet"),
            url: userRef("https://wallet.hive.blog/@{user}"),
          },
        ],
      },
    },
  ],
};

export default me;
