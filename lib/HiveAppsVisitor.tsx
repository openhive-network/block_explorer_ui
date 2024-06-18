/*
import Hive from "@/types/Hive";
import {
  DeepReadonly,
  EFollowActions,
  FormattedCommunityOperation,
  FormattedFollowOperation,
  FormattedRcOperation,
  FormattedReblogOperation,
  HiveAppsOperationVisitor,
} from "@hiveio/wax";
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
    const message = this.generateReactLink([this.getAccountLink(op.from), `delegated ${op.rc} of RC for`, this.getMultipleAccountsListLink(op.delegatees)]);
    return message;
  }

  follow(op: FormattedFollowOperation): JSX.Element {
    const actionsMap = new Map<string, string>();
    actionsMap.set("blog", "followed");
    actionsMap.set("", "unfollowed");
    actionsMap.set("ignore", "muted");
    actionsMap.set("reset_blacklist", "reset blacklist of");
    actionsMap.set("reset_follow_blacklist", "stopped following blacklist of");
    actionsMap.set("blacklist", "blacklisted");
    actionsMap.set("follow_blacklist", "followed blacklist of");
    actionsMap.set("unblacklist", "unblacklisted");
    actionsMap.set("unfollow_blacklist", "unfollowed blacklist of");
    actionsMap.set("reset_follow_muted_list", "stopped following muted list of");
    actionsMap.set("follow_muted", "followed muted list of");
    actionsMap.set("unfollow_muted", "unfollowed muted list of");
    actionsMap.set("reset_all_lists", "reset all lists of");
    actionsMap.set("reset_following_list", "reset following list of");
    actionsMap.set("reset_muted_list", "reset muted list of");
    const message = this.generateReactLink([this.getAccountLink(op.follower), `${actionsMap.get(op?.action) || ""}`, this.getMultipleAccountsListLink(op.following)]);
    return message;
  }

  reblog(op: FormattedReblogOperation): JSX.Element {
    const message = this.generateReactLink([this.getAccountLink(op.account), `reblogged`, this.getPermlink(op.author, op.permlink)]);
    return message;
  }
}

export default HiveAppsVisitor;
*/
