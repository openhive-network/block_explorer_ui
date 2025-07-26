import React, { useState } from "react";
import {
  Users,
  CalendarDays,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Scale,
  Languages,
  Shield,
  Crown,
  UserCircle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { Card, CardContent } from "../ui/card";
import { Toggle } from "../ui/toggle";
import { useI18n } from "../../i18n/i18n";
import TimeAgo from "timeago-react";
import { cn } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import CommunitySubscribersDialog from "./CommunitySubscribersDialog";

const roleConfig = {
  owner: {
    icon: <Crown size={12} />,
    label: "communityCard.roleOwner",
    className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  },
  admin: {
    icon: <Crown size={12} />,
    label: "communityCard.roleAdmin",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  mod: {
    icon: <Shield size={12} />,
    label: "communityCard.roleMod",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  },
  member: {
    icon: <UserCircle size={12} />,
    label: "communityCard.roleMember",
    className:
      "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  },
};

const roleOrder = { owner: 0, admin: 1, mod: 2, member: 3 };

type RoleKey = "owner" | "admin" | "mod" | "member";
type TeamMemberTuple = [string, RoleKey, string];

const CompactStat = ({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors",
      onClick && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
    )}
  >
    <div className="text-explorer-orange">{icon}</div>
    <div>
      <p className="font-bold text-lg text-explorer-dark-gray dark:text-white">
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  </div>
);

const TeamMember = ({ memberTuple }: { memberTuple: TeamMemberTuple }) => {
  const { t } = useI18n();
  const [name, role, title] = memberTuple;
  const currentRoleConfig = roleConfig[role] || roleConfig.member;

  return (
    <Link
      href={`/@${name}`}
      className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50"
    >
      <Image
        src={getHiveAvatarUrl(name)}
        alt={`${name} avatar`}
        width={40}
        height={40}
        className="rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 dark:text-gray-200 break-words">
            {name}
          </p>
          {title && (
            <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
              {title}
            </p>
          )}
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5",
            currentRoleConfig.className
          )}
        >
          {currentRoleConfig.icon}
          <span>{t(currentRoleConfig.label)}</span>
        </div>
      </div>
    </Link>
  );
};

const InfoSection = ({
  title,
  content,
  icon,
  children,
}: {
  title: string;
  content?: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!content && !children) return null;
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
      <button
        className="w-full flex justify-between items-center text-left font-semibold text-gray-700 dark:text-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          {icon} {title}
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-3">
          {content && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-600 dark:text-gray-400">
              {content}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

interface CommunityMainCardProps {
  communityDetails: Hive.CommunityDetails;
  accountDetails: Explorer.FormattedAccountDetails;
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
}

const CommunityMainCard: React.FC<CommunityMainCardProps> = ({
  communityDetails,
  accountDetails,
  liveDataEnabled,
  changeLiveRefresh,
}) => {
  const { t, locale } = useI18n();
  const {
    name,
    title,
    about,
    lang,
    subscribers,
    sum_pending,
    num_authors,
    num_pending,
    created_at,
    flag_text,
    description,
    team,
  } = communityDetails;
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);

  let profileMetadata;
  try {
    profileMetadata = JSON.parse(accountDetails.posting_json_metadata);
  } catch (error) {
    profileMetadata = null;
  }
  const coverImageFromProfile = profileMetadata?.profile?.cover_image;
  const hasCover = !!coverImageFromProfile;

  const sortedTeam = [...(team as unknown as TeamMemberTuple[])].sort(
    (a, b) => {
      return (roleOrder[a[1]] ?? 99) - (roleOrder[b[1]] ?? 99);
    }
  );

  return (
    <>
      <Card data-testid="community-details" className="overflow-hidden">
        {hasCover && (
          <div className="relative h-32 bg-slate-200 dark:bg-slate-700">
            <Image
              src={coverImageFromProfile}
              alt={`${title} cover image`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              className="z-0 object-cover" 
            />
            <div className="absolute -bottom-10 left-4 z-10">
              <Image
                className="rounded-full border-4 border-white dark:border-slate-800 shadow-lg"
                src={getHiveAvatarUrl(name)}
                alt={`${title} avatar`}
                width={80}
                height={80}
              />
            </div>
          </div>
        )}

        <CardContent
          className={cn("p-4 flex flex-col gap-4", hasCover && "pt-14")}
        >
          <div className="flex flex-col">
            <div className="self-end mb-4">
              <Toggle
                checked={liveDataEnabled}
                onClick={changeLiveRefresh}
                className="text-base"
                leftLabel={t("headBlockCard.liveData")}
              />
            </div>

            <div className="flex-1">
              {!hasCover ? (
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    className="rounded-full shadow-md"
                    src={getHiveAvatarUrl(name)}
                    alt={`${title} avatar`}
                    width={64}
                    height={64}
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{title}</h2>
                      <div className="bg-slate-200 text-slate-600 text-xs font-bold uppercase px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                        {t("communityCard.community")}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{name}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <div className="bg-slate-200 text-slate-600 text-xs font-bold uppercase px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                      {t("communityCard.community")}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{name}
                  </p>
                </>
              )}
              <p
                className={cn(
                  "text-sm text-gray-700 dark:text-gray-300",
                  hasCover ? "mt-2" : ""
                )}
              >
                {about}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 py-4 border-y border-slate-200 dark:border-slate-700">
            <CompactStat
              icon={<Users size={20} />}
              label={t("communityCard.subscribers")}
              value={subscribers.toLocaleString()}
              onClick={() => setIsSubscribersModalOpen(true)}
            />
            <CompactStat
              icon={<Sparkles size={20} />}
              label={t("communityCard.activeAuthors")}
              value={num_authors.toLocaleString()}
            />
            <CompactStat
              icon={<Award size={20} />}
              label={t("communityCard.pendingRewards")}
              value={`$${sum_pending.toFixed(2)}`}
            />
            <CompactStat
              icon={<FileText size={20} />}
              label={t("communityCard.pendingPosts")}
              value={num_pending.toLocaleString()}
            />
          </div>
          <div className="flex flex-col gap-3">
            <InfoSection
              title={t("communityCard.team")}
              icon={<Users size={16} />}
            >
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
                {sortedTeam.map((memberTuple) => (
                  <TeamMember
                    key={memberTuple[0]}
                    memberTuple={memberTuple as TeamMemberTuple}
                  />
                ))}
              </div>
            </InfoSection>
            <InfoSection
              title={t("communityCard.description")}
              content={description}
              icon={<BookOpen size={16} />}
            />
            <InfoSection
              title={t("communityCard.rules")}
              content={flag_text}
              icon={<Scale size={16} />}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1">
              <CalendarDays size={14} />
              <span>
                {t("communityCard.created")}{" "}
                <TimeAgo
                  locale={locale}
                  datetime={new Date(formatAndDelocalizeTime(created_at))}
                />
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Languages size={14} />
              <span>{lang.toUpperCase()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {isSubscribersModalOpen && (
        <CommunitySubscribersDialog
          isOpen={isSubscribersModalOpen}
          onClose={() => setIsSubscribersModalOpen(false)}
          communityName={name}
          communityTitle={title}
        />
      )}
    </>
  );
};

export default CommunityMainCard;
