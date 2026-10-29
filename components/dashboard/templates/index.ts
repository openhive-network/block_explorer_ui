import { BoardTemplate } from "./shared";
import governance from "./governance";
import me from "./me";
import market from "./market";
import network from "./network";
import creator from "./creator";
import growth from "./growth";
import essentials from "./essentials";
import { isTemplateEnabled } from "@/utils/deploySettings";

export * from "./shared";

export const ALL_BOARD_TEMPLATES: BoardTemplate[] = [
  me,
  network,
  market,
  governance,
  creator,
  growth,
  essentials,
];

export const BOARD_TEMPLATES: BoardTemplate[] = ALL_BOARD_TEMPLATES.filter(
  (b) => isTemplateEnabled(b.key)
);

export const getBoardTemplate = (key: string): BoardTemplate | undefined =>
  BOARD_TEMPLATES.find((b) => b.key === key);
