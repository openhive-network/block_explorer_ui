import { BoardTemplate } from "./shared";
import governance from "./governance";
import me from "./me";
import market from "./market";
import network from "./network";
import creator from "./creator";
import growth from "./growth";
import essentials from "./essentials";

export * from "./shared";

export const BOARD_TEMPLATES: BoardTemplate[] = [
  me,
  network,
  market,
  governance,
  creator,
  growth,
  essentials,
];

export const getBoardTemplate = (key: string): BoardTemplate | undefined =>
  BOARD_TEMPLATES.find((b) => b.key === key);
