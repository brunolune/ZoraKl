import { Field, SmartContract, state, State, method,Signature, PublicKey, Struct, Bool } from 'o1js';

/**
 *
 * The Zorakl contract ...
 */

export class PriceData extends Struct({
  price: Field,
  time: Field,
}){}

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  'B62qpDUv13RzSnUdkesu9m78YGysb6KUuCCAdfxs8NX3oksm6rrBF1d';

export class Zorakl extends SmartContract {  
  // Define zkApp state
  @state(PublicKey) oraclePublicKey = State<PublicKey>();
  @state(Field) coinBalance = State<Field>();
  @state(Field) usdBalance = State<Field>();
  @state(Field) price = State<Field>();
  @state(Field) time = State<Field>();
  @state(Bool) hasProfit = State<Bool>();
  
  // Define zkApp events
  events = {
    verified_price: Field,
    verified_time: Field,
  };

  init() {
    // Initialize zkApp state
    super.init();
    // Set the oracle public key as zkApp on-chain state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    // Specify that caller should include signature with tx instead of proof
    this.requireSignature();
    // Initialize contract price state
    this.price.set(Field(0));
    // Initialize contract time state
    this.time.set(Field(0));
    // Initialize minaBalance state
    this.coinBalance.set(Field(0));
     // Initialize usdBalance state
    this.usdBalance.set(Field(10**18));
  }

  @method async verifyUpdate(time: Field, price: Field, signature: Signature) {
    // Get the oracle public key from the zkApp state
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.requireEquals(oraclePublicKey);
    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(oraclePublicKey, [price, time]);
    // Check that the signature is valid
    validSignature.assertTrue();
    //update the last price and time
    this.price.set(price);
    this.time.set(time);
    // Emit an event containing the verified price
    this.emitEvent("verified_price", price);
    // Emit an event containing the verified time
    this.emitEvent("verified_time", time);
  }

  @method async buy(time: Field, price: Field) {
    //verifies that the price and time displayed in ui and in zkapp matches
    // this.price.requireEquals(price);
    // this.time.requireEquals(time); 
    //verifies/update balance ?
    const currentCoinBalance = this.coinBalance.getAndRequireEquals();
    this.coinBalance.set(currentCoinBalance.add(Field(1)));
    const currentUSDBalance = this.usdBalance.getAndRequireEquals();
    this.usdBalance.set(currentUSDBalance.sub(price));
  }

  @method async sell(time: Field, price: Field) {
    //verifies coinbalance>0
    this.coinBalance.get().greaterThan(Field(0)).assertTrue();
    //verifies data 
    // this.price.requireEquals(price);
    // this.time.requireEquals(time); 
    //update balances
    const currentCoinBalance = this.coinBalance.getAndRequireEquals();
    this.coinBalance.set(currentCoinBalance.sub(Field(1)));
    const currentUSDBalance = this.usdBalance.getAndRequireEquals();
    this.usdBalance.set(currentUSDBalance.add(price));
    //check if we have profit   
    this.hasProfit.set(this.usdBalance.get().greaterThan(Field(10**18)));
  }
  
}