import { createHiveChain, type ITransaction } from "@hiveio/wax/vite";

const CHAIN_ID =
  "beeab0de00000000000000000000000000000000000000000000000000000000"; // Hive mainnet
const API_ENDPOINT = "https://api.hive.blog";

let chain: any = null;

async function getChain() {
  if (!chain) {
    chain = await createHiveChain({ chainId: CHAIN_ID, apiEndpoint: API_ENDPOINT });
  }
  return chain;
}

/**
 * transaction size in bytes using Wax library
 * @param trxJson Hive transaction JSON
 * @returns number of bytes
 */
export async function getTransactionSizeFromJson(trxJson: any): Promise<number> {
  const hiveChain = await getChain();

  // Create transaction object from JSON
  const tx: ITransaction & {
    binaryViewMetadata: { binary: Uint8Array };
  } = hiveChain.createTransactionFromJson(trxJson);

  //full binary serialization
  const binary: Uint8Array = tx.binaryViewMetadata.binary;



  return binary.length; 
}
