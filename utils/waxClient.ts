import { createHiveChain, type ApiAccount, type IHiveChainInterface } from "@hiveio/wax";

import { config } from "@/Config";

// One lazily created chain for code that runs outside the HiveChainContext
// (auth, workspace sync, API routes). A failed start is dropped so the next
// call retries.
let chain: Promise<IHiveChainInterface> | undefined;

export const getWaxChain = (): Promise<IHiveChainInterface> => {
  chain ??= createHiveChain({ apiEndpoint: config.nodeAddress }).catch(
    (error) => {
      chain = undefined;
      throw error;
    }
  );
  return chain;
};

export const getAccount = async (
  name: string
): Promise<ApiAccount | undefined> => {
  const { accounts } = await (
    await getWaxChain()
  ).api.database_api.find_accounts({
    accounts: [name],
    delayed_votes_active: true,
  });
  return accounts[0];
};
