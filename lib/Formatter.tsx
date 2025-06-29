import React, { ReactElement } from "react";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import {
  CommunityOperationData,
  DeepReadonly,
  FollowOperationData,
  IFormatFunctionArguments,
  IWaxBaseInterface,
  IWaxCustomFormatter,
  ReblogOperationData,
  ResourceCreditsOperationData,
  WaxFormattable,
  account_create,
  account_create_with_delegation,
  account_created,
  account_update,
  account_update2,
  account_witness_proxy,
  account_witness_vote,
  author_reward,
  change_recovery_account,
  changed_recovery_account,
  claim_account,
  claim_reward_balance,
  clear_null_account_balance,
  collateralized_convert,
  collateralized_convert_immediate_conversion,
  comment,
  comment_benefactor_reward,
  comment_options,
  comment_payout_update,
  comment_reward,
  consolidate_treasury_balance,
  convert,
  create_claimed_account,
  create_proposal,
  curation_reward,
  custom,
  custom_json,
  decline_voting_rights,
  declined_voting_rights,
  delayed_voting,
  delegate_vesting_shares,
  delete_comment,
  dhf_conversion,
  dhf_funding,
  effective_comment_vote,
  expired_account_notification,
  feed_publish,
  fill_collateralized_convert_request,
  fill_convert_request,
  fill_order,
  fill_vesting_withdraw,
  hardfork,
  hardfork_hive,
  hardfork_hive_restore,
  ineffective_delete_comment,
  interest,
  limit_order_cancel,
  limit_order_cancelled,
  limit_order_create,
  limit_order_create2,
  liquidity_reward,
  operation,
  pow,
  pow2,
  pow_reward,
  producer_missed,
  producer_reward,
  proposal_fee,
  proposal_pay,
  proxy_cleared,
  recover_account,
  remove_proposal,
  request_account_recovery,
  return_vesting_delegation,
  set_withdraw_vesting_route,
  shutdown_witness,
  system_warning,
  transfer_to_vesting_completed,
  update_proposal,
  update_proposal_votes,
  vesting_shares_split,
  vote,
  withdraw_vesting,
  witness_set_properties,
  witness_update,
} from "@hiveio/wax";
import { formatPercent } from "./utils";
import Link from "next/link";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import ConvertedHiveTooltip from "@/components/ConvertedHiveTooltip";
import TranslatedFormatterOperation from "@/components/TranslatedFormatterOperation";

class OperationsFormatter implements IWaxCustomFormatter {
   public constructor(
    private readonly wax: IWaxBaseInterface,
  ) {}

 private i18n = {
    /**
     * This method doesn't do the translation itself.
     * It returns the React component that will do the translation during render.
     * @param key The i18n key to translate.
     * @returns A React component.
     */
    t: (key: string): React.JSX.Element | string => {
      return <TranslatedFormatterOperation i18nKey={key} />;
    },
  };

  private getFormattedAmount(
    supply: Hive.Supply | undefined
  ): React.JSX.Element | string {
    if (!supply) return "";

    const formattedValue = this.wax.formatter.format(supply);

    if (formattedValue.includes("VESTS")) {
      return this.getConvertedHiveTooltip(formattedValue, supply);
    }

    return formattedValue;
  }

  private getFormattedDate(time: Date | string): string {
    return formatAndDelocalizeTime(time);
  }

  private getConvertedHiveTooltip(tooltipTrigger: string, supply: Hive.Supply) {
    return (
      <ConvertedHiveTooltip
        tooltipTrigger={tooltipTrigger}
        supply={supply}
      />
    );
  }

  private getFormattedMultipleAssets(
    assets: DeepReadonly<Hive.Supply[]>
  ): string {
    let assetsMessage = "";
    assets.forEach((asset, index) => {
      assetsMessage += `${index !== 0 ? ", " : ""}${this.getFormattedAmount(
        asset
      )}`;
    });
    return assetsMessage;
  }

  private getAccountLink(account: string): React.JSX.Element {
    return (
      <Link href={`/@${account}`}>
        <span className="text-link">@{account}</span>
      </Link>
    );
  }

  private getOperationMemo(
    memo: string | undefined
  ): React.JSX.Element | string {
    if (!memo) return "";

    return (
      <p className="break-words">
        {this.i18n.t("formatter.getOperationMemo.prefix")}
        <span className="bg-gray-200 dark:bg-gray-700 text-red-500 px-1">
          {memo}
        </span>
      </p>
    );
  }

  private getMultipleAccountsListLink(accounts: DeepReadonly<string[]>) {
    return (
      <>
        {accounts.map((account, index) => (
          <React.Fragment key={index}>
            {this.getAccountLink(account)}{" "}
          </React.Fragment>
        ))}
      </>
    );
  }

  private getPermlink(author: string, permlink: string): React.JSX.Element {
    return (
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={`/@${author}/${permlink}`}
      >
        <span className="text-explorer-light-green">{permlink}</span>
      </Link>
    );
  }

  private generateReactLink(
    elements: Array<string | React.JSX.Element>
  ): React.JSX.Element {
    return (
      <div>
        {elements.map((element, index) => (
          <React.Fragment key={index}>{element} </React.Fragment>
        ))}
      </div>
    );
  }

  /**
   * Use in transfer, transfer_to_saving and transfer_from_saving operations.
   * @param transfer
   * @returns
   */
  private getTransferMessage(
    transfer: Hive.TransferOperation
  ): React.JSX.Element {
    const message = this.generateReactLink([
      this.getAccountLink(transfer.from),
      this.i18n.t("formatter.getTransferMessage.action"),
      this.getFormattedAmount(transfer.amount),
      this.i18n.t("formatter.getTransferMessage.prepositionTo"),
      this.getAccountLink(transfer.to),
      this.getOperationMemo(transfer.memo),
    ]);
    return message;
  }

  private getEscrowMessage(
  initialMessage: string | ReactElement,
  escrow: Hive.EscrowOperation,
  amounts?: { hbd_amount?: Hive.Supply; hive_amount?: Hive.Supply }
): React.JSX.Element {
  const fee = this.getFormattedAmount(escrow.fee);

  return this.generateReactLink([
  initialMessage,
  this.getAccountLink(escrow.from),
  this.i18n.t("formatter.getEscrowMessage.prepositionTo"),
  this.getAccountLink(escrow.to),
  this.i18n.t("formatter.getEscrowMessage.byAgentPhrase"),
  this.getAccountLink(escrow.agent),

  ...(amounts ? [
    this.i18n.t("formatter.getEscrowMessage.sentPrefix"),
    this.getFormattedAmount(amounts.hbd_amount),
    this.i18n.t("formatter.getEscrowMessage.andConjunction"),
    this.getFormattedAmount(amounts.hive_amount),
  ] : []), 

  ...(fee ? [
    this.i18n.t("formatter.getEscrowMessage.withFeePrefix"),
    fee,
  ] : []),
]);
}
  /**
   * if null - operation perspective always equal to `outgoing` ;
   * @param observer relates to point of view of operation perspectice. Operations done by observer are `outgoing` , rest are `incoming`;
   * @returns operation perspective from observer point of view, either `incoming` or `outgoing`;
   */
  private getOperationPerspective(observer: string | null) {
    const isAccountPage = window.location.pathname.startsWith("/@");

    //Return null if it's not account page
    if (!isAccountPage) return null;

    const {
      operationPerspective: { incoming, outgoing },
    } = config;

    if (!observer) {
      return { perspective: outgoing };
    }

    const isObserserSameAsAccountName =
      window.location.pathname === `/@${observer}`;

    return {
      perspective: isObserserSameAsAccountName ? outgoing : incoming,
    };
  }

  // Formatters

  @WaxFormattable({ matchProperty: "type", matchValue: "vote_operation" })
  formatVote({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: vote }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.voter),
      this.i18n.t("formatter.formatVote.action"),
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatVote.pathSeparator"),
      this.getPermlink(op.author, op.permlink),
      this.i18n.t("formatter.formatVote.withWeightPrefix") ,
      formatPercent(op.weight),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.voter) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "comment_operation" })
  formatComment({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: comment }>) {
    let message: string | React.JSX.Element = "";
    if (op.parent_author === "") {
      message = this.generateReactLink([
        this.getAccountLink(op.author),
        this.i18n.t("formatter.formatComment.createdNewComment"),
         this.getPermlink(op.author, op.permlink),
      ]);
    } else {
      message = this.generateReactLink([
        this.getAccountLink(op.author),
        this.i18n.t("formatter.formatComment.wroteComment"),
        this.getPermlink(op.author, op.permlink),
        this.i18n.t("formatter.formatComment.forPost"),
        this.getPermlink(op.parent_author, op.parent_permlink),
      ]);
    }
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "transfer_operation" })
  formatTransfer({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "transfer_to_vesting_operation",
  })
  formatTransferToVestingOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.from),
      this.i18n.t("formatter.formatTransferToVestingOperation.action"),
      this.getFormattedAmount(op.amount),
      this.i18n.t("formatter.formatTransferToVestingOperation.destination"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "withdraw_vesting_operation",
  })
  formatWithdrawVestingOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: withdraw_vesting }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatWithdrawVestingOperation.action"),
      this.getFormattedAmount(op.vesting_shares),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "limit_order_create_operation",
  })
 formatLimitOrderCreateOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: limit_order_create }>) {

  const message = this.generateReactLink([
    this.getAccountLink(op.owner),
    this.i18n.t("formatter.formatLimitOrderCreateOperation.actionSell"),
    this.getFormattedAmount(op.amount_to_sell),
    this.i18n.t("formatter.formatLimitOrderCreateOperation.conditionMinReceive"),
    this.getFormattedAmount(op.min_to_receive),
    this.i18n.t("formatter.formatLimitOrderCreateOperation.idPrefix"),
    `${op.orderid}`,
    ...(!op.fill_or_kill
      ? [
          this.i18n.t("formatter.formatLimitOrderCreateOperation.expirationPrefix"),
          this.getFormattedDate(op.expiration),
        ]
      : []),
  ]);

  return {
    ...target,
    value: { ...message, ...this.getOperationPerspective(op.owner) },
  };
}

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "limit_order_cancel_operation",
  })
  formatLimitOrderCancelOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: limit_order_cancel }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatLimitOrderCancelOperation.actionPrefix"),
      `${op.orderid}`,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "feed_publish_operation",
  })
  formatFeedPublishOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: feed_publish }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.publisher),
      this.i18n.t("formatter.formatFeedPublishOperation.actionRate"),
      this.getFormattedAmount(op.exchange_rate?.base),
      this.i18n.t("formatter.formatFeedPublishOperation.prepositionFor"),
      this.getFormattedAmount(op.exchange_rate?.quote),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.publisher) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "convert_operation" })
 formatConvertOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: convert }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.owner),
    this.i18n.t("formatter.formatConvertOperation.actionPrefix"),
    `${op.requestid}`,
    this.i18n.t("formatter.formatConvertOperation.amountSuffix"),
    this.getFormattedAmount(op.amount),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_create_operation",
  })
  formatAccountCreateOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_create }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatAccountCreateOperation.action"),
      this.getAccountLink(op.new_account_name),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  // Check for better message
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_update_operation",
  })
  formatAccountUpdateOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_update }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatAccountUpdateOperation.actionMemoKey"),
      `${op.memo_key}`,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "witness_update_operation",
  })
formatWitnessUpdateOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: witness_update }>) {
  let message: string | React.JSX.Element = "";
  if (op.block_signing_key) {
    message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatWitnessUpdateOperation.updatedDataHbdRatePrefix"),
      formatPercent(op.props?.hbd_interest_rate || 0),
      this.i18n.t("formatter.formatWitnessUpdateOperation.maxBlockSizePrefix"),
      String(op.props?.maximum_block_size),
      this.i18n.t("formatter.formatWitnessUpdateOperation.accountFeePrefix"),
      this.getFormattedAmount(op.props?.account_creation_fee),
    ]);
  } else {
    message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatWitnessUpdateOperation.resignedWitness"),
    ]);
  }
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_witness_vote_operation",
  })
  formatAccountWitnessVoteOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_witness_vote }>) {
    let message: string | React.JSX.Element = "";
    if (op.approve) {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatAccountWitnessVoteOperation.votedForWitness"),
        this.getAccountLink(op.witness),
      ]);
    } else {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatAccountWitnessVoteOperation.removedVoteWitness"),
        this.getAccountLink(op.witness),
      ]);
    }
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_witness_proxy_operation",
  })
  formatAccountWitnessProxyOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_witness_proxy }>) {
    let message: string | React.JSX.Element = "";
    if (op.proxy !== "") {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatAccountWitnessProxyOperation.setProxyForUser"),
        this.getAccountLink(op.proxy),
      ]);
    } else {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatAccountWitnessProxyOperation.removedProxy"),
      ]);
    }
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "pow_operation" })
  formatPowOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: pow }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.worker_account),
      this.i18n.t("formatter.formatPowOperation.action"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.worker_account) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "custom_operation" })
  formatcustomOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: custom }>) {
    const message = this.generateReactLink([
      this.getMultipleAccountsListLink(op.required_auths),
      this.i18n.t("formatter.formatcustomOperation.action"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(null) },
    };
  }

  // Skip witness block approve

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "delete_comment_operation",
  })
  formatDeleteCommentOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: delete_comment }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatDeleteCommentOperation.action"),
      this.getPermlink(op.author, op.permlink),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "custom_json_operation",
  })
  formatCustomJsonOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: custom_json }>) {
    const message = this.generateReactLink([
      this.getMultipleAccountsListLink(op.required_auths),
      this.getMultipleAccountsListLink(op.required_posting_auths),
      this.i18n.t("formatter.formatCustomJsonOperation.madeCustomJson"),
      `(${op.id})`,
    ]);
    return {
      ...target,
      value: {
        message,
        json: op.json,
        ...this.getOperationPerspective(null),
      },
    };
  }

  @WaxFormattable({ matchInstanceOf: ResourceCreditsOperationData })
  formatResourceCreditsOperation({
    target,
    source,
  }: IFormatFunctionArguments<
    { value: custom_json },
    { value: ResourceCreditsOperationData }
  >) {
    const { value: op } = target;
    if (op.rc.amount === "0")
      return {
        ...target,
        value: {
          message: this.generateReactLink([
            this.getAccountLink(op.from),
            this.i18n.t("formatter.formatResourceCreditsOperation.removedDelegationFor"),
            this.getMultipleAccountsListLink(op.delegatees),
            `(${source.value.id})`,
          ]),
          json: JSON.stringify(target.value),
          ...this.getOperationPerspective(op.from),
        },
      };
    return {
      ...target,
      value: {
        message: this.generateReactLink([
          this.getAccountLink(op.from),
          this.i18n.t("formatter.formatResourceCreditsOperation.delegatedPrefix"),
          this.getFormattedAmount(op.rc),
          this.i18n.t("formatter.formatResourceCreditsOperation.ofRcForPrefix"),
          this.getMultipleAccountsListLink(op.delegatees),
          `(${source.value.id})`,
        ]),
        json: JSON.stringify(target.value),
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({ matchInstanceOf: FollowOperationData })
  formatFollowOperation({
  target,
  source,
}: IFormatFunctionArguments<
  { value: custom_json },
  { value: FollowOperationData }
>) {
  const { value: op } = target;
  const actionsMap = new Map<string, string>();
  actionsMap.set("blog", "formatter.formatFollowOperation.actionFollowed");
  actionsMap.set("", "formatter.formatFollowOperation.actionUnfollowed");
  actionsMap.set("ignore", "formatter.formatFollowOperation.actionMuted");
  actionsMap.set("reset_blacklist", "formatter.formatFollowOperation.actionResetBlacklist");
  actionsMap.set("reset_follow_blacklist", "formatter.formatFollowOperation.actionResetFollowBlacklist");
  actionsMap.set("blacklist", "formatter.formatFollowOperation.actionBlacklisted");
  actionsMap.set("follow_blacklist", "formatter.formatFollowOperation.actionFollowBlacklist");
  actionsMap.set("unblacklist", "formatter.formatFollowOperation.actionUnblacklisted");
  actionsMap.set("unfollow_blacklist", "formatter.formatFollowOperation.actionUnfollowBlacklist");
  actionsMap.set(
    "reset_follow_muted_list",
    "formatter.formatFollowOperation.actionResetFollowMutedList"
  );
  actionsMap.set("follow_muted", "formatter.formatFollowOperation.actionFollowMuted");
  actionsMap.set("unfollow_muted", "formatter.formatFollowOperation.actionUnfollowMuted");
  actionsMap.set("reset_all_lists", "formatter.formatFollowOperation.actionResetAllLists");
  actionsMap.set("reset_following_list", "formatter.formatFollowOperation.actionResetFollowingList");
  actionsMap.set("reset_muted_list", "formatter.formatFollowOperation.actionResetMutedList");

  const actionKey = actionsMap.get(op?.action);
  const translatedAction = actionKey ? this.i18n.t(actionKey) : "";

  return {
    ...target,
    value: {
      message: this.generateReactLink([
        this.getAccountLink(op.follower),
        translatedAction,
        this.getMultipleAccountsListLink(op.following),
        `(${source.value.id})`,
      ]),
      json: JSON.stringify(target.value),
      ...this.getOperationPerspective(op.follower),
    },
  };
}
  @WaxFormattable({ matchInstanceOf: ReblogOperationData })
  formatReblogOperation({
    target,
    source,
  }: IFormatFunctionArguments<
    { value: custom_json },
    { value: ReblogOperationData }
  >) {
    const { value: op } = target;
    return {
      ...target,
      value: {
        message: this.generateReactLink([
          this.getAccountLink(op.account),
          this.i18n.t("formatter.formatReblogOperation.action"),
          this.getPermlink(op.author, op.permlink),
          `(${source.value.id})`,
        ]),
        json: JSON.stringify(target.value),
        ...this.getOperationPerspective(op.account),
      },
    };
  }

  @WaxFormattable({ matchInstanceOf: CommunityOperationData })
  formatCommunityOperation({
    target,
    source,
  }: IFormatFunctionArguments<
    { value: custom_json },
    { value: CommunityOperationData }
  >) {
    const { value: op } = target;
    return {
      ...target,
      value: {
        message: this.generateReactLink([
          this.getMultipleAccountsListLink(op.accounts),
          `${op.data.action} to ${op.community}`,
          `(${source.value.id})`,
        ]),
        json: JSON.stringify(target.value),
        ...this.getOperationPerspective(null),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "comment_options_operation",
  })
 formatcommentOptionOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: comment_options }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.author),
    this.i18n.t("formatter.formatcommentOptionOperation.setOptions"),
    ...(!op.allow_curation_rewards
      ? [this.i18n.t("formatter.formatcommentOptionOperation.disallowRewards")]
      : []),
    ...(!op.allow_votes
      ? [this.i18n.t("formatter.formatcommentOptionOperation.disallowVotes")]
      : []),
    ...(op.max_accepted_payout?.amount !== "1000000000"
      ? [
          this.i18n.t("formatter.formatcommentOptionOperation.maxPayoutPrefix"),
          this.getFormattedAmount(op.max_accepted_payout),
        ]
      : []),
    ...(op.percent_hbd !== 5000
      ? [
          this.i18n.t("formatter.formatcommentOptionOperation.percentHbdPrefix"),
          formatPercent(op.percent_hbd),
        ]
      : []),
    this.i18n.t("formatter.formatcommentOptionOperation.summarySuffixFor"),
    this.getPermlink(op.author, op.permlink),
  ]);
  
    return {
        ...target,
        value: { ...message, ...this.getOperationPerspective(op.author) },
      };
  }
    
  

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "set_withdraw_vesting_route_operation",
  })
formatSetWithdrawVestingRouteOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: set_withdraw_vesting_route }>) {
  const autoVests = op.auto_vest
    ? this.i18n.t("formatter.formatSetWithdrawVestingRouteOperation.autoVestSuffix")
    : "";
  const message = this.generateReactLink([
    this.getAccountLink(op.from_account),
    this.i18n.t("formatter.formatSetWithdrawVestingRouteOperation.actionSetRoute"),
    this.getAccountLink(op.to_account),
    this.i18n.t("formatter.formatSetWithdrawVestingRouteOperation.withPercentPrefix"),
    `${formatPercent(op.percent)}${autoVests}`,
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from_account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "limit_order_create2_operation",
  })
  formatLimitOrderCreate2Operation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: limit_order_create2 }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.owner),
    this.i18n.t("formatter.formatLimitOrderCreate2Operation.actionCreateOrder"),
    this.i18n.t("formatter.formatLimitOrderCreate2Operation.idPrefix"),
    `${op.orderid})`,
    this.i18n.t("formatter.formatLimitOrderCreate2Operation.toSellPrefix"),
    this.getFormattedAmount(op.amount_to_sell),
    this.i18n.t("formatter.formatLimitOrderCreate2Operation.exchangeRatePrefix"),
    this.getFormattedAmount(op.exchange_rate?.base),
    this.i18n.t("formatter.formatLimitOrderCreate2Operation.prepositionTo"),
    this.getFormattedAmount(op.exchange_rate?.quote),

    ...(!op.fill_or_kill
      ? [
          this.i18n.t("formatter.formatLimitOrderCreate2Operation.expirationPrefix"),
          this.getFormattedDate(op.expiration),
        ]
      : []),
  ]);

  return {
    ...target,
    value: { ...message, ...this.getOperationPerspective(op.owner) },
  };
}

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "claim_account_operation",
  })
  formatClaimAccountOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: claim_account }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatClaimAccountOperation.action"),
      this.getFormattedAmount(op.fee),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "create_claimed_account_operation",
  })
  formatCreateClaimedAccountOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: create_claimed_account }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatCreateClaimedAccountOperation.action"),
      this.getAccountLink(op.new_account_name),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "request_account_recovery_operation",
  })
  formatRequestAccountRecovery({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: request_account_recovery }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.recovery_account),
      this.i18n.t("formatter.formatRequestAccountRecovery.action"),
      this.getAccountLink(op.account_to_recover),
    ]);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.recovery_account),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "recover_account_operation",
  })
  formatRecoverAccountOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: recover_account }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account_to_recover),
      this.i18n.t("formatter.formatRecoverAccountOperation.status"),
    ]);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.account_to_recover),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "change_recovery_account_operation",
  })
  formatChangeRecoveryAccount({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: change_recovery_account }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account_to_recover),
       this.i18n.t("formatter.formatChangeRecoveryAccount.action"),
      this.getAccountLink(op.new_recovery_account),
    ]);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.account_to_recover),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_transfer_operation",
  })
  formatEscrowTransferOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage(this.i18n.t("formatter.formatEscrowTransferOperation.initialMessagePrefix"), op, {
      hbd_amount: op.hbd_amount,
      hive_amount: op.hive_amount,
    });
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_dispute_operation",
  })
  formatEscrowDispute({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage(this.i18n.t("formatter.formatEscrowDispute.initialMessagePrefix"), op);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_release_operation",
  })
  formatEscrowReleaseOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage(this.i18n.t("formatter.formatEscrowReleaseOperation.initialMessagePrefix"), op, {
      hbd_amount: op.hbd_amount,
      hive_amount: op.hive_amount,
    });
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "pow2_operation" })
  formatPow2Operation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: pow2 }>) {
    const message = this.generateReactLink([
      this.i18n.t("formatter.formatPow2Operation.pow2AccountFeePrefix"),
      this.getFormattedAmount(op.props?.account_creation_fee),
      this.i18n.t("formatter.formatPow2Operation.hbdInterestRatePrefix"),
      formatPercent(op.props?.hbd_interest_rate || 0),
      this.i18n.t("formatter.formatPow2Operation.maxBlockSizePrefix"),
      String(op.props?.maximum_block_size),
    ]);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(null),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_approve_operation",
  })
  formatEscroweApproveOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
    const message = this.getEscrowMessage( this.i18n.t("formatter.formatEscrowApproveOperation.initialMessagePrefix"), op);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "transfer_to_savings_operation",
  })
  formatTransferToSavingsOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "transfer_from_savings_operation",
  })
  formatTransferFromSavingsOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.getTransferMessage(op);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "cancel_transfer_from_savings_operation",
  })
  formatCancelTransferFromSavingsOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.CancelTransferOperation }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.from),
      this.i18n.t("formatter.formatCancelTransferFromSavingsOperation.actionPrefix"),
      `${op.request_id}`,
    ]);
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.from),
      },
    };
  }

  // Skip custom binary

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "decline_voting_rights_operation",
  })
  formatDeclineVotingRightsOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: decline_voting_rights }>) {
    let message: string | React.JSX.Element = "";
    if (op.decline) {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatDeclineVotingRightsOperation.declinedRights"),
      ]);
    } else {
      message = this.generateReactLink([
        this.getAccountLink(op.account),
        this.i18n.t("formatter.formatDeclineVotingRightsOperation.cancelledDecliningRights"),
      ]);
    }
    return {
      ...target,
      value: {
        ...message,
        ...this.getOperationPerspective(op.account),
      },
    };
  }

  // Skip reset account

  // Skip set reset account

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "claim_reward_balance_operation",
  })
  formatClaimRewardBalanceOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: claim_reward_balance }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatClaimRewardBalanceOperation.actionPrefix"),
      this.getFormattedAmount(op.reward_hbd),
      this.getFormattedAmount(op.reward_hive),
      this.getFormattedAmount(op.reward_vests),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "delegate_vesting_shares_operation",
  })
  formatDelegateVestingSharesOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: delegate_vesting_shares }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.delegator),
      this.i18n.t("formatter.formatDelegateVestingSharesOperation.action"),
      this.getFormattedAmount(op.vesting_shares),
       this.i18n.t("formatter.formatDelegateVestingSharesOperation.prepositionTo"),
      this.getAccountLink(op.delegatee),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.delegator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_create_with_delegation_operation",
  })
  formatAccountCreateWithDelegationOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_create_with_delegation }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatAccountCreateWithDelegationOperation.createdAccount"),
      this.getAccountLink(op.new_account_name),
      this.i18n.t("formatter.formatAccountCreateWithDelegationOperation.withDelegation"),
      this.getFormattedAmount(op.delegation),
      this.i18n.t("formatter.formatAccountCreateWithDelegationOperation.andFee"),
      this.getFormattedAmount(op.fee),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  // Leave it with simple message, props are too complicated to handle now
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "witness_set_properties_operation",
  })
  formatWitnessSetPropertiesOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: witness_set_properties }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatWitnessSetPropertiesOperation.action"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  // Talk about more detailed update
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_update2_operation",
  })
  formatAccountUpdate2Operation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_update2 }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatAccountUpdate2Operation.action"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "create_proposal_operation",
  })
  formatCreateProposalOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: create_proposal }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatCreateProposalOperation.createdProposalFor"),
      this.getFormattedAmount(op.daily_pay),
      this.i18n.t("formatter.formatCreateProposalOperation.dailyToReceiver"),
      this.getAccountLink(op.receiver),
      this.i18n.t("formatter.formatCreateProposalOperation.detailsPrefix"),
      this.getPermlink(op.creator, op.permlink),
      this.i18n.t("formatter.formatCreateProposalOperation.sinceDate"),
      this.getFormattedDate(op.start_date),
      this.i18n.t("formatter.formatCreateProposalOperation.toDate"),
      this.getFormattedDate(op.end_date),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "update_proposal_votes_operation",
  })
  formatUpdateProposalVotesOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: update_proposal_votes }>) {
    let message: string | React.JSX.Element = "";
    if (op.approve) {
      message = this.generateReactLink([
        this.getAccountLink(op.voter),
        this.i18n.t("formatter.formatUpdateProposalVotesOperation.approvedProposalPrefix"),
        `${op.proposal_ids}`,
      ]);
    } else {
      message = this.generateReactLink([
        this.getAccountLink(op.voter),
        this.i18n.t("formatter.formatUpdateProposalVotesOperation.removedApprovalPrefix"),
        `${op.proposal_ids}`,
      ]);
    }
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.voter) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "remove_proposal_operation",
  })
  formatRemoveProposalOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: remove_proposal }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.proposal_owner),
      this.i18n.t("formatter.formatRemoveProposalOperation.actionPrefix"),
      `${op.proposal_ids}`,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.proposal_owner) },
    };
  }

  // Not sure about all properties here
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "update_proposal_operation",
  })
  formatUpdateProposalOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: update_proposal }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatUpdateProposalOperation.updatedProposal"),
      op.proposal_id,
      this.i18n.t("formatter.formatUpdateProposalOperation.prepositionFor"),
      this.getFormattedAmount(op.daily_pay),
      this.i18n.t("formatter.formatUpdateProposalOperation.dailyDetails"),
      this.getPermlink(op.creator, op.permlink),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "collateralized_convert_operation",
  })
  formatCollateralizedConvertOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: collateralized_convert }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatCollateralizedConvertOperation.action"),
      this.getFormattedAmount(op.amount),
      this.i18n.t("formatter.formatCollateralizedConvertOperation.requestIdPrefix"),
      String(op.requestid),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "recurrent_transfer_operation",
  })
  formatRecurrentTransferOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.RecurrentTransferOperation }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.from),
      this.i18n.t("formatter.formatRecurrentTransferOperation.actionSetTransferOf"),
      this.getFormattedAmount(op.amount),
      String(op.executions),
      this.i18n.t("formatter.formatRecurrentTransferOperation.executionsEvery"),
      String(op.recurrence),
      this.i18n.t("formatter.formatRecurrentTransferOperation.hoursToDestination"),
      this.getAccountLink(op.to),
      this.getOperationMemo(op.memo),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  // === VIRTUAL ===

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "fill_convert_request_operation",
  })
  formatFillConverRequest({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: fill_convert_request }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatFillConverRequest.actionConverted"),
      this.getFormattedAmount(op.amount_in),
      this.i18n.t("formatter.formatFillConverRequest.prepositionTo"),
      this.getFormattedAmount(op.amount_out),
      this.i18n.t("formatter.formatFillConverRequest.forRequestId"),
      String(op.requestid),
      ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "author_reward_operation",
  })
  formatAuthorRewardOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: author_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed
      ? ""
      : ", doesn't have to be claimed";
    const message = this.generateReactLink([
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatAuthorRewardOperation.actionGotReward"),
      this.getPermlink(op.author, op.permlink),
      this.i18n.t("formatter.formatAuthorRewardOperation.curatorsPayoutPrefix"),
      this.getFormattedAmount(op.curators_vesting_payout),
      this.i18n.t("formatter.formatAuthorRewardOperation.payoutsPrefix"),
      this.getFormattedAmount(op.vesting_payout),
      this.i18n.t("formatter.formatAuthorRewardOperation.payoutSeparator"),
      this.getFormattedAmount(op.hive_payout),
      this.i18n.t("formatter.formatAuthorRewardOperation.payoutSeparator"),
      this.getFormattedAmount(op.hbd_payout),
      mustBeClaimed,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "curation_reward_operation",
  })
  formatCurationRewardOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: curation_reward }>) {
    const mustBeClaimed = op.payout_must_be_claimed
      ? ""
      : this.i18n.t("formatter.formatCurationRewardOperation.notClaimedSuffix");
  const message = this.generateReactLink([
    this.getAccountLink(op.curator),
    this.i18n.t("formatter.formatCurationRewardOperation.actionGotReward"),
    this.getFormattedAmount(op.reward),
    this.i18n.t("formatter.formatCurationRewardOperation.prepositionFor"),
    this.getPermlink(op.author, op.permlink),
    mustBeClaimed,
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.curator) },
    };
  }

  // Detailed properties were skiped
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "comment_reward_operation",
  })
  formatCommentReward({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: comment_reward }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatCommentReward.actionGotReward"),
      this.getFormattedAmount(op.payout),
      this.i18n.t("formatter.formatCommentReward.prepositionFor"),
      this.getPermlink(op.author, op.permlink),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "liquidity_reward_operation",
  })
  formatLiquidityRewardOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: liquidity_reward }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatLiquidityRewardOperation.actionGotReward"),
      this.getFormattedAmount(op.payout),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "interest_operation" })
  formatInterestOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: interest }>) {
    const wasLiquidModified = op.is_saved_into_hbd_balance
      ? this.i18n.t("formatter.formatInterestOperation.liquidBalanceModifiedSuffix")
      : "";
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatInterestOperation.actionGotInterest"),
      this.getFormattedAmount(op.interest),
      wasLiquidModified,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "fill_vesting_withdraw_operation",
  })
  formatFillVestingWithdrawOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: fill_vesting_withdraw }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.from_account),
      this.i18n.t("formatter.formatFillVestingWithdrawOperation.actionWithdrew"),
      this.getFormattedAmount(op.withdrawn),
      this.i18n.t("formatter.formatFillVestingWithdrawOperation.conjunctionAnd"),
      this.getAccountLink(op.to_account),
      this.i18n.t("formatter.formatFillVestingWithdrawOperation.actionDeposited"),
      this.getFormattedAmount(op.deposited),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from_account) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "fill_order_operation" })
  formatFillOrderOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: fill_order }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.current_owner),
    this.i18n.t("formatter.formatFillOrderOperation.actionPaid"),
    this.getFormattedAmount(op.current_pays),
    this.i18n.t("formatter.formatFillOrderOperation.prepositionFor"),
    this.getFormattedAmount(op.open_pays),
    this.i18n.t("formatter.formatFillOrderOperation.prepositionFrom"),
    this.getAccountLink(op.open_owner),
    this.i18n.t("formatter.formatFillOrderOperation.idsPrefix"),
    `${op.current_orderid}`,
    this.i18n.t("formatter.formatFillOrderOperation.arrowSeparator"),
    `${op.open_orderid})`,
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.current_owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "shutdown_witness_operation",
  })
  formatShutdownWitnessOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: shutdown_witness }>) {
    const message = this.generateReactLink([
      this.i18n.t("formatter.formatShutdownWitnessOperation.subjectPrefix"),
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatShutdownWitnessOperation.actionStatus"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "fill_transfer_from_savings_operation",
  })
  formatFillTransferFromSavings({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.generateReactLink([
      this.getFormattedAmount(op.amount),
      this.i18n.t("formatter.formatFillTransferFromSavings.wasTransferredFrom"),
      this.getAccountLink(op.from),
      this.i18n.t("formatter.formatFillTransferFromSavings.prepositionTo"),
      this.getAccountLink(op.to),
      this.i18n.t("formatter.formatFillTransferFromSavings.requestIdPrefix"),
      `${op.request_id}`,
      this.getOperationMemo(op.memo),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  // Only id
  @WaxFormattable({ matchProperty: "type", matchValue: "hardfork_operation" })
  formatHardforkOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: hardfork }>) {
    const message = this.generateReactLink([`Hardfork ${op.hardfork_id}`]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(null) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "comment_payout_update_operation",
  })
  formatCommentPayoutUpdateOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: comment_payout_update }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatCommentPayoutUpdateOperation.actionGotUpdate"),
      this.getPermlink(op.author, op.permlink),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "return_vesting_delegation_operation",
  })
  formatReturnVestingDelegationOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: return_vesting_delegation }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatReturnVestingDelegationOperation.actionReceived"),
      this.getFormattedAmount(op.vesting_shares),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "comment_benefactor_reward_operation",
  })
  formatCommentBenefactorRewardOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: comment_benefactor_reward }>) {
  const mustBeClaimed = op.payout_must_be_claimed
    ? ""
    : this.i18n.t("formatter.formatCommentBenefactorRewardOperation.notClaimedSuffix");
  const message = this.generateReactLink([
    this.getAccountLink(op.benefactor),
    this.i18n.t("formatter.formatCommentBenefactorRewardOperation.actionReceived"),
    this.getFormattedAmount(op.vesting_payout),
    this.i18n.t("formatter.formatCommentBenefactorRewardOperation.separator"),
    this.getFormattedAmount(op.hbd_payout),
    this.i18n.t("formatter.formatCommentBenefactorRewardOperation.separator"),
    this.getFormattedAmount(op.hbd_payout),
    this.i18n.t("formatter.formatCommentBenefactorRewardOperation.forComment"),
    this.getPermlink(op.author, op.permlink),
    mustBeClaimed,
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.benefactor) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "producer_reward_operation",
  })
  formatProducerReward({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: producer_reward }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.producer),
      this.i18n.t("formatter.formatProducerReward.actionReceived"),
      this.getFormattedAmount(op.vesting_shares),
      this.i18n.t("formatter.formatProducerReward.rewardSuffix"),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.producer) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "clear_null_account_balance_operation",
  })
  formatClearNullAccountBalanceOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: clear_null_account_balance }>) {
    const message = this.generateReactLink([
     this.i18n.t("formatter.formatClearNullAccountBalanceOperation.clearedPrefix"),
     `${this.getFormattedMultipleAssets(op.total_cleared)}`,
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(null) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "proposal_pay_operation",
  })
  formatProposalPayOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: proposal_pay }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.receiver),
      this.i18n.t("formatter.formatProposalPayOperation.wasPaid"),
      this.getFormattedAmount(op.payment),
      this.i18n.t("formatter.formatProposalPayOperation.forHisProposal"),
      String(op.proposal_id),
      this.i18n.t("formatter.formatProposalPayOperation.byPayer"),
      this.getAccountLink(op.payer),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.receiver) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "dhf_funding_operation",
  })
  formatDhfFundingOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: dhf_funding }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.treasury),
      this.i18n.t("formatter.formatDhfFundingOperation.actionReceived"),
      this.getFormattedAmount(op.additional_funds),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.treasury) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "hardfork_hive_operation",
  })
  formatHardforkHiveOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: hardfork_hive }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.account),
    this.i18n.t("formatter.formatHardforkHiveOperation.airdropOf"),
    this.getFormattedAmount(op.hbd_transferred),
    this.i18n.t("formatter.formatHardforkHiveOperation.separator"),
    this.getFormattedAmount(op.hive_transferred),
    this.i18n.t("formatter.formatHardforkHiveOperation.separator"),
    this.getFormattedAmount(op.total_hive_from_vests),
    this.i18n.t("formatter.formatHardforkHiveOperation.separator"),
    this.getFormattedAmount(op.vests_converted),
    this.i18n.t("formatter.formatHardforkHiveOperation.wentTo"),
    this.getAccountLink(op.treasury),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "hardfork_hive_restore_operation",
  })
 formatHardforkHiveRestoreOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: hardfork_hive_restore }>) {
  const message = this.generateReactLink([
    this.getAccountLink(op.account),
    this.i18n.t("formatter.formatHardforkHiveRestoreOperation.actionReceived"),
    this.getFormattedAmount(op.hive_transferred),
    this.i18n.t("formatter.formatHardforkHiveRestoreOperation.conjunctionAnd"),
    this.getFormattedAmount(op.hbd_transferred),
    this.i18n.t("formatter.formatHardforkHiveRestoreOperation.prepositionFrom"),
    this.getAccountLink(op.treasury),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "delayed_voting_operation",
  })
  formatDelayedVotingOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: delayed_voting }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.voter),
     this.i18n.t("formatter.formatDelayedVotingOperation.hasPrefix"),
     `${op.votes}`,
     this.i18n.t("formatter.formatDelayedVotingOperation.votePowerSuffix"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.voter) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "consolidate_treasury_balance_operation",
  })
  formatConsolidateTrasuryBalanceOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: consolidate_treasury_balance }>) {
    const message = this.generateReactLink([
      `${this.getFormattedMultipleAssets(
        op.total_moved
      )}`,
      this.i18n.t("formatter.formatConsolidateTrasuryBalanceOperation.consolidatedSuffix"),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(null) },
    };
  }

  //Not sure where to put rest of properties
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "effective_comment_vote_operation",
  })
  formatEffectiveCommentVoteOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: effective_comment_vote }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.voter),
      this.i18n.t("formatter.formatEffectiveCommentVoteOperation.votedFor"),
      this.getPermlink(op.author, op.permlink),
      this.i18n.t("formatter.formatEffectiveCommentVoteOperation.andGenerated"),
      this.getFormattedAmount(op.pending_payout),
      this.i18n.t("formatter.formatEffectiveCommentVoteOperation.pendingPayoutSuffix"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.voter) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "ineffective_delete_comment_operation",
  })
  formatIneffectiveDeleteCommentOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: ineffective_delete_comment }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.author),
      this.i18n.t("formatter.formatIneffectiveDeleteCommentOperation.action"),
      this.getPermlink(op.author, op.permlink),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.author) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "dhf_conversion_operation",
  })
  formatDhfConversionOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: dhf_conversion }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.treasury),
      this.i18n.t("formatter.formatDhfConversionOperation.actionConverted"),
      this.getFormattedAmount(op.hive_amount_in),
       this.i18n.t("formatter.formatDhfConversionOperation.prepositionTo"),
      this.getFormattedAmount(op.hbd_amount_out),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.treasury) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "expired_account_notification_operation",
  })
  formatExpiredAccountNotificationOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: expired_account_notification }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatExpiredAccountNotificationOperation.voteNullified"),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "changed_recovery_account_operation",
  })
  formatChangedRecoveryAccountOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: changed_recovery_account }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatChangedRecoveryAccountOperation.actionChangedFrom"),
      this.getAccountLink(op.old_recovery_account),
      this.i18n.t("formatter.formatChangedRecoveryAccountOperation.prepositionTo"),
      this.getAccountLink(op.new_recovery_account),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "transfer_to_vesting_completed_operation",
  })
  formatTransferToVestingCompletedOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: transfer_to_vesting_completed }>) {
    const message = this.generateReactLink([
      this.i18n.t("formatter.formatTransferToVestingCompletedOperation.prefix"),
      this.getAccountLink(op.from_account),
      this.i18n.t("formatter.formatTransferToVestingCompletedOperation.prepositionTo"),
      this.getAccountLink(op.to_account),
      this.i18n.t("formatter.formatTransferToVestingCompletedOperation.completedWith"),
      this.getFormattedAmount(op.hive_vested),
      this.i18n.t("formatter.formatTransferToVestingCompletedOperation.arrowSeparator"),
      this.getFormattedAmount(op.vesting_shares_received),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from_account) },
    };
  }

  @WaxFormattable({ matchProperty: "type", matchValue: "pow_reward_operation" })
  formatPowRewardOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: pow_reward }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.worker),
      this.i18n.t("formatter.formatPowRewardOperation.actionReceived"),
      this.getFormattedAmount(op.reward),
      this.i18n.t("formatter.formatPowRewardOperation.rewardSuffix"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.worker) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "vesting_shares_split_operation",
  })
  formatVestingSharesSplitOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: vesting_shares_split }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatVestingSharesSplitOperation.actionSplitted"),
      this.getFormattedAmount(op.vesting_shares_before_split),
      this.i18n.t("formatter.formatVestingSharesSplitOperation.arrowSeparator"),
      this.getFormattedAmount(op.vesting_shares_after_split),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "account_created_operation",
  })
  formatAccountCreatedOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: account_created }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.new_account_name),
      this.i18n.t("formatter.formatAccountCreatedOperation.wasCreatedBy"),
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatAccountCreatedOperation.withInitialsVestingShares"),
      this.getFormattedAmount(op.initial_vesting_shares),
      this.i18n.t("formatter.formatAccountCreatedOperation.andDelegations"),
      this.getFormattedAmount(op.initial_delegation),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "fill_collateralized_convert_request_operation",
  })
 formatFillCollateralizedConvertRequestOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: fill_collateralized_convert_request }>) {
  const message = this.generateReactLink([
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.prefix"),
    op.owner,
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.idPrefix"),
    `${op.requestid})`,
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.wasFilledWith"),
    this.getFormattedAmount(op.amount_in),
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.arrowSeparator"),
    this.getFormattedAmount(op.amount_out),
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.conjunctionAnd"),
    this.getFormattedAmount(op.excess_collateral),
    this.i18n.t("formatter.formatFillCollateralizedConvertRequestOperation.excessSuffix"),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  // Trimmed by component
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "system_warning_operation",
  })
  formatSystemWarningOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: system_warning }>) {
    const message = this.generateReactLink([`${op.message}`]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(null) },
    };
  }

  // Cut memo
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "fill_recurrent_transfer_operation",
  })
  formatFillRecurrentTransferOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
    const message = this.generateReactLink([
      this.i18n.t("formatter.formatFillRecurrentTransferOperation.prefix"),
      this.getAccountLink(op.from),
      this.i18n.t("formatter.formatFillRecurrentTransferOperation.prepositionTo"),
      this.getAccountLink(op.to),
      this.i18n.t("formatter.formatFillRecurrentTransferOperation.withAmount"),
      this.getFormattedAmount(op.amount),
      this.i18n.t("formatter.formatFillRecurrentTransferOperation.conjunctionAnd"),
      String(op.remaining_executions),
      this.i18n.t("formatter.formatFillRecurrentTransferOperation.remainingExecutionsSuffix"),
      this.getOperationMemo(op.memo),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "failed_recurrent_transfer_operation",
  })
 formatFailedRecurrentTransferOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: Hive.TransferOperation }>) {
  const deleted = op.deleted
    ? this.i18n.t("formatter.formatFailedRecurrentTransferOperation.deletedSuffix")
    : "";
  const message = this.generateReactLink([
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.prefix"),
    this.getAccountLink(op.from),
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.prepositionTo"),
    this.getAccountLink(op.to),
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.withAmount"),
    this.getFormattedAmount(op.amount),
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.conjunctionAnd"),
    String(op.remaining_executions),
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.failedForSuffix"),
    String(op.consecutive_failures),
    this.i18n.t("formatter.formatFailedRecurrentTransferOperation.timesSuffix"),
    deleted,
    this.getOperationMemo(op.memo),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "limit_order_cancelled_operation",
  })
  formatLimitOrderCancelledOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: limit_order_cancelled }>) {
    const message = this.generateReactLink([
      this.i18n.t("formatter.formatLimitOrderCancelledOperation.orderPrefix"),
      `${op.orderid}`,
      this.i18n.t("formatter.formatLimitOrderCancelledOperation.bySuffix"),
      this.getAccountLink(op.seller),
      this.i18n.t("formatter.formatLimitOrderCancelledOperation.wasCancelledAnd"),
      this.getFormattedAmount(op.amount_back),
      this.i18n.t("formatter.formatLimitOrderCancelledOperation.wasSentBackSuffix"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.seller) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "producer_missed_operation",
  })
  formatProducerMissedOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: producer_missed }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.producer),
      this.i18n.t("formatter.formatProducerMissedOperation.action"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.producer) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "proposal_fee_operation",
  })
  formatProposalFeeOperations({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: proposal_fee }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.creator),
      this.i18n.t("formatter.formatProposalFeeOperations.gotProposalFee"),
      this.getFormattedAmount(op.fee),
      this.i18n.t("formatter.formatProposalFeeOperations.idPrefix"),
      String(op.proposal_id),
      this.i18n.t("formatter.formatProposalFeeOperations.prepositionFrom"),
      this.getAccountLink(op.treasury),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.creator) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "collateralized_convert_immediate_conversion_operation",
  })
  formatCollateralizedConvertImmediateConversionOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{
    value: collateralized_convert_immediate_conversion;
  }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.owner),
      this.i18n.t("formatter.formatCollateralizedConvertImmediateConversionOperation.actionReceived"),
      this.getFormattedAmount(op.hbd_out),
      this.i18n.t("formatter.formatCollateralizedConvertImmediateConversionOperation.forConversionIdPrefix"),
      String(op.requestid),
    ]);

    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.owner) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_approved_operation",
  })
  formatEscrowApprovedOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
  const message = this.generateReactLink([
    this.i18n.t("formatter.formatEscrowApprovedOperation.prefix"),
    this.getAccountLink(op.from),
    this.i18n.t("formatter.formatEscrowApprovedOperation.prepositionTo"),
    this.getAccountLink(op.to),
    this.i18n.t("formatter.formatEscrowApprovedOperation.byAgent"),
    this.getAccountLink(op.agent),
    this.i18n.t("formatter.formatEscrowApprovedOperation.withFee"),
    this.getFormattedAmount(op.fee),
    this.i18n.t("formatter.formatEscrowApprovedOperation.separator"),
    this.i18n.t("formatter.formatEscrowApprovedOperation.idPrefix"),
    String(op.escrow_id),
    this.i18n.t("formatter.formatEscrowApprovedOperation.wasApprovedSuffix"),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  // Cutted numbers
  @WaxFormattable({
    matchProperty: "type",
    matchValue: "escrow_rejected_operation",
  })
 formatEscrowRejectedOperation({
  source: { value: op },
  target,
}: IFormatFunctionArguments<{ value: Hive.EscrowOperation }>) {
  const message = this.generateReactLink([
    this.i18n.t("formatter.formatEscrowRejectedOperation.prefix"),
    this.getAccountLink(op.from),
    this.i18n.t("formatter.formatEscrowRejectedOperation.prepositionTo"),
    this.getAccountLink(op.to),
    this.i18n.t("formatter.formatEscrowRejectedOperation.byAgent"),
    this.getAccountLink(op.agent),
    this.i18n.t("formatter.formatEscrowRejectedOperation.withFee"),
    this.getFormattedAmount(op.fee),
    this.i18n.t("formatter.formatEscrowRejectedOperation.separator"),
    this.i18n.t("formatter.formatEscrowRejectedOperation.idPrefix"),
    String(op.escrow_id),
    this.i18n.t("formatter.formatEscrowRejectedOperation.wasRejectedSuffix"),
  ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.from) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "proxy_cleared_operation",
  })
  formatProxyClearedOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: proxy_cleared }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatProxyClearedOperation.actionClearedProxy"),
      this.getAccountLink(op.proxy),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }

  @WaxFormattable({
    matchProperty: "type",
    matchValue: "declined_voting_rights_operation",
  })
  formatDeclinedVotingRightsOperation({
    source: { value: op },
    target,
  }: IFormatFunctionArguments<{ value: declined_voting_rights }>) {
    const message = this.generateReactLink([
      this.getAccountLink(op.account),
      this.i18n.t("formatter.formatDeclinedVotingRightsOperation.rightsDeclined"),
    ]);
    return {
      ...target,
      value: { ...message, ...this.getOperationPerspective(op.account) },
    };
  }
}

export default OperationsFormatter;
