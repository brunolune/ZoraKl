import { Field, Mina, PublicKey, Signature, fetchAccount } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { Zorakl } from "../../../contracts/src/Zorakl";
import { get } from "http";

const state = {
  Zorakl: null as null | typeof Zorakl,
  zkapp: null as null | Zorakl,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToDevnet: async (args: {}) => {
    const Network = Mina.Network(
      "https://api.minascan.io/node/devnet/v1/graphql"
    );
    console.log("Devnet network instance configured.");
    Mina.setActiveInstance(Network);
  },
  loadContract: async (args: {}) => {
    const { Zorakl } = await import("../../../contracts/build/src/Zorakl.js");
    state.Zorakl = Zorakl;
  },
  compileContract: async (args: {}) => {
    await state.Zorakl!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.Zorakl!(publicKey);
  },
  // getNum: async (args: {}) => {
  //   const currentNum = await state.zkapp!.num.get();
  //   return JSON.stringify(currentNum.toJSON());
  // },
  getPrice: async (args: {}) => {
    const price = await state.zkapp!.price.get();
    return JSON.stringify(price.toJSON());
  },
  getTime: async (args: {}) => {
    const time= await state.zkapp!.time.get();
    return JSON.stringify(time.toJSON());
  },

  createUpdateTransaction: async (args: {}) => {
    const response = await fetch("https://zora-kl.vercel.app/api/asset-price");
    const resData = await response.json();
    const { data, signature } = resData;
    console.log(
      "*******************FROM ENDPOINT**********************************"
    );
    console.log("data.time:", data.time, "data.price:", data.price);
    const transaction = await Mina.transaction(async () => {
      await state.zkapp!.verifyUpdate(
        Field(data.time),
        Field(data.price),
        Signature.fromBase58(signature)
      );
    });
    state.transaction = transaction;
  },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  createBuyTransaction: async (args: { [key: string]: any }) => {
    const time = args.time;
    const price = args.price;
    console.log('In createBuyTransaction, time :', time, 'price:', price);
    if (isNaN(time) || isNaN(price)) {
      throw new Error('Invalid time or price value');
    }
    const transaction = await Mina.transaction(async () => {
      await state.zkapp!.buy(Field(time), Field(price));
    });
    state.transaction = transaction;
  },
  proveBuyTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}

console.log("Web Worker Successfully Initialized.");
