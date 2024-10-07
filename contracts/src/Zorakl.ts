import { Field, SmartContract, state, State, method } from 'o1js';

/**
 *
 * The Zorakl contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class Zorakl extends SmartContract {  
  // Define zkApp state
  @state(PublicKey) oraclePublicKey = State<PublicKey>();
  @state(Field) profit = State<Field>();
  @state(Field) balance = State<Field>;

  // Define zkApp events
  events = {
    verified: Field,
  };

  init() {
    // Initialize zkApp state
    super.init();
    // Set the oracle public key as zkApp on-chain state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    // Specify that caller should include signature with tx instead of proof
    this.requireSignature();
    // Initialize contract profit state
    this.profit.set(Field(0));
     // Initialize contract balance state
     this.balance.set(Field(0));
  }

  @method async verify(id: Field, creditScore: Field, signature: Signature) {
    // Get the oracle public key from the zkApp state
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.requireEquals(oraclePublicKey);
    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(oraclePublicKey, [id, creditScore]);
    // Check that the signature is valid
    validSignature.assertTrue();
    // Check that the provided credit score is 700 or higher
    creditScore.assertGreaterThanOrEqual(Field(700));
    // Emit an event containing the verified user's id
    this.emitEvent('verified', id);
  }

  @method async buy(amount: Field) {
  //todo
  }

  @method async sell(amount: Field) {
    //todo
  }
}
