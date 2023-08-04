import { Migration } from "./migration";

const migration = new Migration();
import { getRandomNonce, toNano, WalletTypes } from "locklift";

async function main() {
  const signer = await locklift.keystore.getSigner("0");
  const { account } = await locklift.factory.accounts.addNewAccount({
    type: WalletTypes.EverWallet, // or WalletTypes.HighLoadWallet,
    //Value which will send to the new account from a giver
    value: toNano(200),
    //owner publicKey
    publicKey: signer!.publicKey,
    nonce: getRandomNonce(),
  });

  await locklift.provider.sendMessage({
    sender: account.address,
    recipient: account.address,
    amount: toNano(0.1),
    bounce: false,
  });

  const name = "Account1";
  migration.store(account, name);
  console.log(`${name}: ${account.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
