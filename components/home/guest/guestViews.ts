import {
  Activity,
  Landmark,
  LayoutDashboard,
  LineChart,
  LucideIcon,
  Zap,
} from "lucide-react";
import { AccentKey } from "@/components/dashboard/lib/accents";
import { deploySettings, isTemplateEnabled } from "@/utils/deploySettings";

const ALL_GUEST_VIEWS = [
  "overview",
  "network",
  "market",
  "governance",
  "essentials",
] as const;

export type GuestView = (typeof ALL_GUEST_VIEWS)[number];

export const GUEST_VIEWS: GuestView[] =
  ALL_GUEST_VIEWS.filter(isTemplateEnabled);

export type GuestAccent = AccentKey;

export const GUEST_VIEW_META: Record<
  GuestView,
  { icon: LucideIcon; accent: GuestAccent }
> = {
  overview: { icon: LayoutDashboard, accent: "rose" },
  essentials: { icon: Zap, accent: "slate" },
  network: { icon: Activity, accent: "blue" },
  market: { icon: LineChart, accent: "amber" },
  governance: { icon: Landmark, accent: "teal" },
};

export const DEFAULT_GUEST_VIEW: GuestView = deploySettings.defaultTemplate;
export const GUEST_VIEW_COOKIE = "hivescan_guest_home_view";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// With tabs off, a view saved earlier must not override the deployment default.
export const isGuestView = (value: unknown): value is GuestView =>
  typeof value === "string" &&
  GUEST_VIEWS.includes(value as GuestView) &&
  (deploySettings.homeTabs || value === DEFAULT_GUEST_VIEW);

export const guestViewFromCookies = (
  cookies: Partial<Record<string, string>> | undefined
): GuestView => {
  const raw = cookies?.[GUEST_VIEW_COOKIE];
  return isGuestView(raw) ? raw : DEFAULT_GUEST_VIEW;
};

export const readGuestView = (): GuestView => {
  if (typeof document === "undefined") return DEFAULT_GUEST_VIEW;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${GUEST_VIEW_COOKIE}=`));
  const raw = match
    ? decodeURIComponent(match.slice(match.indexOf("=") + 1))
    : null;
  return isGuestView(raw) ? raw : DEFAULT_GUEST_VIEW;
};

export const writeGuestView = (view: GuestView) => {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_VIEW_COOKIE}=${view}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};
