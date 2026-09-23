// The "just arrived" wash, shared by the table's new-block row and the live
// strip's head-block chip so the colour carries one meaning per page.
// Opaque rather than an alpha tint: the table's sticky first cell uses
// bg-inherit, so a translucent row colour gets painted twice and reads darker.
export const JUST_ARRIVED_SURFACE = "bg-sky-100 dark:bg-sky-900";

export const JUST_ARRIVED_ACCENT = "border-s-sky-500 dark:border-s-sky-400";

// How long a row stays lit after it lands. The chain produces a block roughly
// every 3s, so this has to fade before the next one arrives or the whole table
// reads as new.
export const JUST_ARRIVED_MS = 2200;
