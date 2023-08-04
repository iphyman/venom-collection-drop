import fs from "fs";
import prompts from "prompts";
import { Migration } from "./migration";

const migration = new Migration();

export type AddressN = `0:${string}`;
export const isValidAddress = (address: string): address is AddressN => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(address);

async function main() {
  const Nft = await locklift.factory.getContractArtifacts("Nft");
  const Index = await locklift.factory.getContractArtifacts("Index");
  const IndexBasis = await locklift.factory.getContractArtifacts("IndexBasis");
  const signer = (await locklift.keystore.getSigner("0"))!;
  const account = await migration.loadAccount("Account1");

  const defaultMetadata = fs.readFileSync("collection-metadata.json", "utf8");

  const response = await prompts([
    {
      type: "text",
      name: "owner",
      message: "Collection Owner Address (default " + account.address + ")",
      validate: (value: any) => (isValidAddress(value) || value === "" ? true : "Invalid address"),
    },
    {
      type: "text",
      name: "metadata",
      message: "Collecton metadata (default " + defaultMetadata + ")",
      validate: (value: string) => (value === "" ? true : "Invalid metadata"),
    },
  ]);

  console.log("Deploying collection...");

  const { contract: collection, tx } = await locklift.factory.deployContract({
    contract: "CollectionDrop",
    publicKey: signer.publicKey,
    initParams: {
      nonce_: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      codeIndex: Index.code,
      codeIndexBasis: IndexBasis.code,
      codeNft: Nft.code,
      owner: account.address,
      remainOnNft: locklift.utils.toNano(3),
      mintingFee: locklift.utils.toNano(2),
      json: response.metadata,
    },
    value: locklift.utils.toNano(3),
  });

  migration.store(collection, "Collection");
  console.log(`Collection deployed at: ${collection.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
