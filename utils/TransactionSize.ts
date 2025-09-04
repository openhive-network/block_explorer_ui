
export interface TransactionForSize {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string | Date;
  operations?: any[];
  extensions?: any[];
  signatures?: any[];
}

/**
 * Calculates approximate transaction size in bytes
 * using a simple binary/UTF-8 simulation for operations, extensions, and signatures.
 */
export function calcTransactionSize(tx: TransactionForSize): number {
  const operations = tx.operations || [];
  const extensions = tx.extensions || [];
  const signatures = tx.signatures || [];

  let size = 0;

  // ref_block_num and ref_block_prefix: 2 + 4 bytes (approx)
  size += 2 + 4;

  // expiration: treat as UTF-8 string length if string, else 8 bytes for date
  if (typeof tx.expiration === "string") {
    size += new TextEncoder().encode(tx.expiration).length;
  } else if (tx.expiration instanceof Date) {
    size += 8; // approx 8 bytes for Date
  }

  // Operations: estimate size per operation
  for (const op of operations) {
    // Each op: type string length + JSON string length of value
    const typeStr = op.type || "";
    const valueStr = JSON.stringify(op.value || op);
    size += new TextEncoder().encode(typeStr).length;
    size += new TextEncoder().encode(valueStr).length;
  }

  // Extensions:  length of JSON strings
  for (const ext of extensions) {
    const extStr = JSON.stringify(ext);
    size += new TextEncoder().encode(extStr).length;
  }
  //signatures
  for (const sig of signatures) {
    const sigStr = sig || "";
    size += new TextEncoder().encode(sigStr).length;
  }

  return size;
}
