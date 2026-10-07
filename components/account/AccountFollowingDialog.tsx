import React from "react";

import { useI18n } from "@/i18n/i18n";
import AccountFollowListDialog from "./AccountFollowListDialog";

type FollowingDialogProps = {
  accountName: string;
  totalCount?: number;
  isFollowingOpen: boolean;
  changeFollowingDialogue: (isOpen: boolean) => void;
};

const AccountFollowingDialog: React.FC<FollowingDialogProps> = ({
  accountName,
  totalCount,
  isFollowingOpen,
  changeFollowingDialogue,
}) => {
  const { t } = useI18n();

  return (
    <AccountFollowListDialog
      type="following"
      accountName={accountName}
      totalCount={totalCount}
      isOpen={isFollowingOpen}
      onOpenChange={changeFollowingDialogue}
      title={t("accountFollowingDialog.followingDataType")}
      searchPlaceholder={t("accountFollowingDialog.searchPlaceholder")}
      noMatchText={t("accountFollowingDialog.noResultsFound")}
      exportHeader={t("accountFollowingDialog.followingHeader")}
      testId="following-dialog"
    />
  );
};

export default AccountFollowingDialog;
