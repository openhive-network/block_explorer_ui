// Jest can't load wax (ESM with wasm), so the signature tests run it here in plain Node.
import { createWaxFoundation } from "@hiveio/wax";

const [digest, signature] = process.argv.slice(2);
const wax = await createWaxFoundation();
process.stdout.write(wax.getPublicKeyFromSignature(digest, signature));
