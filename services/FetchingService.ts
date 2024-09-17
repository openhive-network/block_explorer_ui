import Hive from "@/types/Hive";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import {
  GetDynamicGlobalPropertiesResponse,
  IHiveChainInterface,
  TWaxRestExtended,
  TWaxApiRequest,
  TWaxExtended,
} from "@hiveio/wax";
import { extendedRest } from "@/types/Rest";
import { createPathFilterString } from "@/lib/utils";

type ExplorerNodeApi = {
  database_api: {
    get_reward_funds: TWaxApiRequest<{}, { funds: Hive.RewardFunds[] }>;
    get_current_price_feed: TWaxApiRequest<{}, Hive.PriceFeed>;
    find_vesting_delegations: TWaxApiRequest<
      { account: string },
      { delegations: Hive.VestingDelegations[] }
    >;
    get_witness_schedule: TWaxApiRequest<
      { id: number },
      Hive.WitnessesSchedule
    >;
  };
  rc_api: {
    list_rc_direct_delegations: TWaxApiRequest<
      { start: [string, string]; limit: number },
      { rc_direct_delegations: Hive.RCDelegations[] }
    >;
  };
};

class FetchingService {
  private apiUrl: string | null = null;
  private nodeUrl: string | null = null;
  private extendedHiveChain:
    | TWaxExtended<ExplorerNodeApi, TWaxRestExtended<typeof extendedRest>>
    | undefined = undefined;

  public setApiUrl(newUrl: string) {
    this.apiUrl = newUrl;
  }

  public setNodeUrl(newUrl: string) {
    this.nodeUrl = newUrl;
  }

  public setHiveChain(hiveChain: IHiveChainInterface | null) {
    this.extendedHiveChain = hiveChain
      ?.extend<ExplorerNodeApi>()
      .extendRest(extendedRest);
    if (this.extendedHiveChain && this.nodeUrl) {
      this.extendedHiveChain.endpointUrl = this.nodeUrl;
    }
    if (this.extendedHiveChain && this.apiUrl) {
      this.extendedHiveChain.restApi.endpointUrl = this.apiUrl;
    }
  }

  async getHeadBlockNum(): Promise<number> {
    return await this.extendedHiveChain!.restApi.hafah.headblock();
  }

  async getHafbeLastSyncedBlock(): Promise<number> {
    return await this.extendedHiveChain!.restApi.hafbe.lastSyncedBlock();
  }

  async getBlock(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi.hafah.block({ blockNumber });
  }

  async getBlockGlobalState(blockNumber: number): Promise<Hive.BlockDetails> {
    return await this.extendedHiveChain!.restApi.hafah.globalState({
      "block-num": blockNumber,
    });
  }

  async getLastBlocks(limit: number): Promise<Hive.LastBlocksTypeResponse[]> {
    return await this.extendedHiveChain!.restApi.hafbe.operationTypeCounts({
      "result-limit": limit,
    });
  }

  async getInputType(input: string): Promise<Hive.InputTypeResponse> {
    return await this.extendedHiveChain!.restApi.hafbe.inputType({
      inputType: input,
    });
  }

  async getOpsByBlock(
    blockNumber: number,
    filter?: number[],
    page?: number,
    accountName?: string,
    keyContent?: string,
    setOfKeys?: string[]
  ): Promise<Hive.TotalOperationsResponse> {
    const requestParams: Hive.GetOperationsByBlockParams = {
      blockNumber,
      "operation-types": filter?.join(","),
      "account-name": accountName,
      page,
      "page-size": config.blockPagePaginationSize,
      "page-order": "desc",
      "data-size-limit": config.opsBodyLimit,
      "path-filter": createPathFilterString(keyContent, setOfKeys),
    };
    return await this.extendedHiveChain!.restApi.hafah.blockOperations(
      requestParams
    );
  }

  async getTransaction(
    transactionHash: string
  ): Promise<Hive.TransactionResponse> {
    return await this.extendedHiveChain!.restApi.hafah.transactions.transaction(
      { transactionId: transactionHash }
    );
  }

  async getRewardFunds(): Promise<{ funds: Hive.RewardFunds[] }> {
    return await this.extendedHiveChain!.api.database_api.get_reward_funds({});
  }

  async getDynamicGlobalProperties(): Promise<GetDynamicGlobalPropertiesResponse> {
    return await this.extendedHiveChain!.api.database_api.get_dynamic_global_properties(
      {}
    );
  }

  async getCurrentPriceFeed(): Promise<Hive.PriceFeed> {
    return await this.extendedHiveChain!.api.database_api.get_current_price_feed(
      {}
    );
  }

  async getAccOpTypes(accountName: string): Promise<number[]> {
    return await this.extendedHiveChain!.restApi.hafah.accounts.operationTypes({
      accountName,
    });
  }

  async getOpsByAccount(
    accountOperationsProps: Explorer.AccountSearchOperationsProps
  ): Promise<Hive.AccountOperationsResponse> {
    const requestParams: Hive.GetOpsByAccountParams = {
      accountName: accountOperationsProps.accountName,
      "operation-types": accountOperationsProps.operationTypes?.join(","),
      page: accountOperationsProps.pageNumber,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block": accountOperationsProps.fromBlock,
      "to-block": accountOperationsProps.toBlock,
      "start-date": accountOperationsProps.startDate,
      "end-date": accountOperationsProps.endDate,
    };
    return await this.extendedHiveChain!.restApi.hafah.accounts.operations(
      requestParams
    );
  }

  async getAccount(accountName: string): Promise<Hive.AccountDetails> {
    return await this.extendedHiveChain!.restApi.hafbe.accounts.account({
      accountName,
    });
  }

  async getWitnesses(
    limit: number,
    offset: number,
    sort: string,
    direction: "asc" | "desc"
  ): Promise<Hive.Witness[]> {
    const requestParams: Hive.GetWitnessesParams = {
      limit,
      offset,
      sort,
      direction,
    };
    return await this.extendedHiveChain!.restApi.hafbe.witnesses({
      limit,
      offset,
      sort,
      direction,
    });
  }

  async getWitnessVoters(
    witness: string,
    sort: string,
    direction: "asc" | "desc",
    limit?: number
  ): Promise<Hive.Voter[]> {
    return await this.extendedHiveChain!.restApi.hafbe.voters({
      accountName: witness,
      sort,
      direction,
      "result-limit": limit,
    });
  }

  async getWitnessSchedule(): Promise<Hive.WitnessesSchedule> {
    const params = { id: 1 };

    return await this.extendedHiveChain!.api.database_api.get_witness_schedule(
      params
    );
  }

  async getOperationTypes(): Promise<Hive.OperationPattern[]> {
    return await this.extendedHiveChain!.restApi.hafah.operationTypes();
  }

  async getWitness(witnessName: string): Promise<Hive.Witness> {
    return await this.extendedHiveChain!.restApi.hafbe.singleWitness({
      accountName: witnessName,
    });
  }

  async getVestingDelegations(
    delegatorAccount: string
  ): Promise<Hive.VestingDelegations[]> {
    return await this.extendedHiveChain!.api.database_api.find_vesting_delegations(
      {
        account: delegatorAccount,
      }
    ).then((response) => response.delegations);
  }

  async getRcDelegations(
    delegatorAccount: string,
    limit: number
  ): Promise<Hive.RCDelegations[]> {
    return await this.extendedHiveChain!.api.rc_api.list_rc_direct_delegations({
      start: [delegatorAccount, ""],
      limit: limit,
    }).then((response) => response.rc_direct_delegations);
  }

  async getBlockByTime(date: Date): Promise<number> {
    return await this.extendedHiveChain!.restApi.hafah.blockNumberByDate({
      date: date.toISOString(),
    });
  }

  async getOperationKeys(operationTypeId: number): Promise<string[][]> {
    return await this.extendedHiveChain!.restApi.hafah.operationTypesKeys({
      operationTypeId,
    });
  }

  async getBlockByOp(
    blockSearchProps: Explorer.BlockSearchProps
  ): Promise<Hive.BlockByOpResponse[]> {
    const requestParams: Hive.BlockSearchParams = {
      "operation-types": blockSearchProps.operationTypes?.join(","),
      "account-name": blockSearchProps?.accountName,
      direction: "desc",
      "from-block": blockSearchProps.fromBlock,
      "to-block": blockSearchProps.toBlock,
      "start-date": blockSearchProps.startDate,
      "end-date": blockSearchProps.endDate,
      "result-limit": blockSearchProps.limit,
      "path-filter": createPathFilterString(
        blockSearchProps.deepProps.content,
        blockSearchProps.deepProps.keys
      ),
    };
    return await this.extendedHiveChain!.restApi.hafbe.blockNumbers(
      requestParams
    );
  }

  async getWitnessVotesHistory(
    witnessName: string,
    direction: "asc" | "desc",
    sort: string,
    limit: number | null,
    fromTime?: Date,
    toTime?: Date
  ): Promise<Hive.WitnessVotesHistory[]> {
    return await this.extendedHiveChain!.restApi.hafbe.votesHistory({
      accountName: witnessName,
      direction,
      sort,
      "result-limit": limit,
      "start-date": fromTime,
      "end-date": toTime,
    });
  }

  async getOperation(operationId: string): Promise<Hive.OperationResponse> {
    return await this.extendedHiveChain!.restApi.hafah.operations.byId({
      operationId,
    });
  }

  async getCommentOperation(
    commentSearchProps: Explorer.CommentSearchProps
  ): Promise<Hive.CommentOperationResponse> {
    const requestParams: Hive.GetCommentOperationsParams = {
      accountName: commentSearchProps.accountName,
      "operation-types": commentSearchProps.operationTypes?.join(","),
      page: commentSearchProps.pageNumber,
      permlink: commentSearchProps.permlink,
      "page-size": config.standardPaginationSize,
      "data-size-limit": config.opsBodyLimit,
      "from-block": commentSearchProps.fromBlock,
      "to-block": commentSearchProps.toBlock,
      "start-date": commentSearchProps.startDate,
      "end-date": commentSearchProps.endDate,
    };
    return await this.extendedHiveChain!.restApi.hafbe.accounts.commentOperations(
      requestParams
    );
  }

  async getHafbeVersion(): Promise<string> {
    return await this.extendedHiveChain!.restApi.hafbe.version();
  }

  async getOperationsCountInBlock(
    blockNumber: number
  ): Promise<Hive.LastBlocksTypeResponse> {
    return (
      await this.extendedHiveChain!.restApi.hafbe.operationTypeCounts({
        "result-limit": 1,
        "block-num": blockNumber,
      })
    )[0];
  }

  async getBlockRaw(blockNumber: number): Promise<Hive.RawBlockData> {
    return (
      await this.extendedHiveChain!.restApi.hafah.rawBlock({
        "from-block": blockNumber,
        "to-block": blockNumber,
      })
    )[0];
  }

  async getAccountAuthorities(
    accountName: string
  ): Promise<Hive.AccountAuthoritiesData | undefined> {
    return await this.extendedHiveChain?.restApi.hafbe.accounts.authorities({
      accountName,
    });
  }

  async getManabars(
    accountName: string,
    hiveChain: IHiveChainInterface
  ): Promise<Hive.Manabars | null> {
    try {
      const upvotePromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        0
      );
      const downvotePromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        1
      );
      const rcPromise = hiveChain.calculateCurrentManabarValueForAccount(
        accountName,
        2
      );
      const manabars = await Promise.all([
        upvotePromise,
        downvotePromise,
        rcPromise,
      ]);
      return { upvote: manabars[0], downvote: manabars[1], rc: manabars[2] };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

const fetchingService = new FetchingService();

export default fetchingService;
