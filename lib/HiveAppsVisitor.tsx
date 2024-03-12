import Hive from "@/types/Hive";
import {
  DeepReadonly,
  EFollowActions,
  FormattedCommunityOperation,
  FormattedFollowOperation,
  FormattedRcOperation,
  FormattedReblogOperation,
  HiveAppsOperationVisitor,
} from "@hive/wax";
import { JSX } from "react";

class HiveAppsVisitor extends HiveAppsOperationVisitor<React.JSX.Element> {

  generateReactLink = (elements: Array<string | React.JSX.Element>): React.JSX.Element => <></>;
  getAccountLink = (accountName: string): React.JSX.Element => <></>;
  getPermlink = (accountName: string, permlink: string): React.JSX.Element => <></>;
  getMultipleAccountsListLink = (accounts: DeepReadonly<string[]>): React.JSX.Element => <></>;

  constructor(
    generateReactLink: (
      elements: Array<string | React.JSX.Element>
    ) => React.JSX.Element,
    getAccountLink: (accountName: string) => React.JSX.Element,
    getPermlink: (accountName: string, permlink: string) => React.JSX.Element,
    getMultipleAccountsListLink: (accounts: DeepReadonly<string[]>) => React.JSX.Element
  ) {
    super();
    this.generateReactLink = generateReactLink;
    this.getAccountLink = getAccountLink;
    this.getPermlink = getPermlink;
    this.getMultipleAccountsListLink = getMultipleAccountsListLink
  }

  community(op: FormattedCommunityOperation): JSX.Element {
    const message = this.generateReactLink([this.getMultipleAccountsListLink(op.accounts), `${op.data.action} to ${op.community}`])
    return message;
  }

  rc(op: FormattedRcOperation): JSX.Element {
    if (op.rc === "0.00000 VESTS") {
      return this.generateReactLink([this.getAccountLink(op.from), `removed delegation for`, this.getMultipleAccountsListLink(op.delegatees)]);
    } 
    const message = this.generateReactLink([this.getAccountLink(op.from), `delegated ${op.rc} for`, this.getMultipleAccountsListLink(op.delegatees)]);
    return message;
  }

  follow(op: FormattedFollowOperation): JSX.Element {
    let action = "";
    switch(op.action) {
      case EFollowActions.BLACKLIST:
        action = "blacklisted";
        break;
      case EFollowActions.FOLLOW:
        action = "followed";
        break;
      case EFollowActions.FOLLOW_BLACKLIST:
        action = "followed blacklist of";
        break;
      case EFollowActions.FOLLOW_MUTED:
        action = "followed muted list of";
        break;
      case EFollowActions.MUTE:
        action = "muted";
        break;
      case EFollowActions.RESET_ALL_LISTS:
        action = "reset all lists of";
        break;
      case EFollowActions.RESET_BLACKLIST:
        action = "reset blacklist of";
        break;
      case EFollowActions.RESET_FOLLOWING_LIST:
        action = "reset following list of";
        break;
      case EFollowActions.RESET_FOLLOW_BLACKLIST:
        action = "stopped following blacklist of";
        break;
      case EFollowActions.RESET_FOLLOW_MUTED_LIST:
        action = "stopped following muted list of";
        break;
      case EFollowActions.RESET_MUTED_LIST:
        action = "reset muted list of";
        break;
      case EFollowActions.UNBLACKLIST:
        action = "unblacklisted";
        break;
      case EFollowActions.UNFOLLOW:
        action = "unfollowed";
        break;
      case EFollowActions.UNFOLLOW_BLACKLIST:
        action = "unfollowed blacklist of";
        break;
      case EFollowActions.UNFOLLOW_MUTED:
        action = "unfollowed muted list of";
        break;
      default:
        action = "";
        break;
    }
    const message = this.generateReactLink([this.getAccountLink(op.follower), action, this.getMultipleAccountsListLink(op.following)]);
    return message;
  }

  reblog(op: FormattedReblogOperation): JSX.Element {
    const message = this.generateReactLink([this.getAccountLink(op.account), `reblogged`, this.getPermlink(op.author, op.permlink)]);
    return message;
  }
}

export default HiveAppsVisitor;
