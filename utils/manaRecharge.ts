// Upvote, downvote and RC mana all regenerate linearly from empty to full in 5 days.
export const MANA_REGEN_SECONDS = 5 * 24 * 60 * 60;

export const secondsUntilFull = (percent: number): number => {
  const missing = Math.min(Math.max(100 - percent, 0), 100);
  return Math.round((missing / 100) * MANA_REGEN_SECONDS);
};
