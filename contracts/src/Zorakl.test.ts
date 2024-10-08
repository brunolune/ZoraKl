import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { Zorakl, ORACLE_PUBLIC_KEY } from './Zorakl';


/*
 * This file specifies how to test the `Zorakl` example smart contract.
 */


let proofsEnabled = false;

describe('Zorakl', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Zorakl;

  beforeAll(async () => {
    if (proofsEnabled) await Zorakl.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Zorakl(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Zorakl` smart contract', async () => {
    await localDeploy();
    const oraclePubKey = zkApp.oraclePublicKey.get();
    expect(oraclePubKey).toEqual(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
  });
  describe('Fetch Data from Oracles', () => {
    it.todo('fetches the price data from the oracle with correct signature');
    it.todo('fetches the price data from the oracle with incorrect signature');
    it.todo('fetches the price data from the oracle with correct signature and publish token name to trade');
  });
  describe('Trade with Price Data', () => {
    describe('Buy', () => {
      it.todo('buys the token with the price data from the oracle');
    });
    describe('Sell', () => {
      it.todo('sells the token with the price data from the oracle');
    });
  });

});
