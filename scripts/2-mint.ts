import prompts from "prompts";
// import ora from "ora";
import { Migration } from "./migration";

const migration = new Migration();
export type AddressN = `0:${string}`;
export const isValidAddress = (address: string): address is AddressN => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(address);

async function main() {
  const account = await migration.loadAccount("Account1");

  const response = await prompts([
    {
      type: "text",
      name: "owner",
      message: "Collector Address (default " + account.address + ")",
      validate: (value: any) => (isValidAddress(value) || value === "" ? true : "Invalid address"),
    },
    {
      type: "text",
      name: "name",
      message: "Provide the nft name",
    },
    {
      type: "text",
      name: "description",
      message: "Provide the nft description",
    },
    {
      type: "text",
      name: "url",
      message: "Provide the image url",
    },
    {
      type: "text",
      name: "externalUrl",
      message: "Provide the external url",
    },
  ]);

  const collection = migration.loadContract("CollectionDrop", "Collection");

  console.log(`Collection: ${collection.address}`);
  console.log(`Account: ${account.address}`);

  const uri = response.url;
  const name = response.name;
  const description = response.description;
  const externalUrl = response.externalUrl;
  // const spinner = ora("Deploying NFT").start();

  console.log("Minting NFT...");

  let item = {
    type: "Collectible NFT",
    name: name,
    description: description,
    preview: {
      source: uri,
      mimetype: "image/png",
    },
    files: [
      {
        source: uri,
        mimetype: "image/png",
      },
    ],
    external_url: externalUrl,
  };

  let payload = JSON.stringify(item);

  await collection.methods
    .mint({
      _json: payload,
    })
    .send({
      from: account.address,
      amount: locklift.utils.toNano(15),
    });

  // Get the address of the last minted NFT
  let totalMinted = await collection.methods.totalMinted({ answerId: 0 }).call();
  let nftAddress = await collection.methods
    .nftAddress({
      answerId: 0,
      id: (Number(totalMinted.count) - 1).toFixed(),
    })
    .call();
  console.log(` NFT: ${nftAddress.nft}`);

  console.log("Minting completed successfully...");
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
