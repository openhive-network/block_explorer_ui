import React from "react";

import { useI18n } from "@/i18n/i18n";
import AccountFollowListDialog from "./AccountFollowListDialog";

type FollowersDialogProps = {
  accountName: string;
  totalCount?: number;
  isFollowersOpen: boolean;
  changeFollowersDialogue: (isOpen: boolean) => void;
};

const AccountFollowersDialog: React.FC<FollowersDialogProps> = ({
  accountName,
  totalCount,
  isFollowersOpen,
  changeFollowersDialogue,
}) => {
  const { t } = useI18n();

  return (
    <AccountFollowListDialog
      type="followers"
      accountName={accountName}
      totalCount={totalCount}
      isOpen={isFollowersOpen}
      onOpenChange={changeFollowersDialogue}
      title={t("accountFollowersDialog.followersDataType")}
      searchPlaceholder={t("accountFollowersDialog.searchPlaceholder")}
      noMatchText={t("accountFollowersDialog.noResultsFound")}
      exportHeader={t("accountFollowersDialog.followerHeader")}
      testId="followers-dialog"
    />
  );
};

export default AccountFollowersDialog;
