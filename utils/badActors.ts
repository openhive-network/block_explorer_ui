import list from "./BadActorList";

// Set-backed lookup: callers check many names per keystroke (search
// autocomplete), where the raw list's linear scan would be O(list) each time.
const SET = new Set(
  (list as string[]).filter(Boolean).map((name) => name.trim().toLowerCase())
);

const normalize = (name: string) => name.trim().toLowerCase().replace(/^@/, "");

export const isBadActor = (name?: string | null): boolean =>
  !!name && SET.has(normalize(name));

export const badActorCount = (): number => SET.size;

export default SET;
