# ZoraKl
Price zkOracle in Mina
- Price data is verified to confirm source legitimacy and data liveness.
- Make a “proof of virtual profit” application on Mina using Mina ZK Oracle to prove the source of data and prove profit made by virtually buying and selling some coins.
- Useful for trading bots to prove their performance without doing real investments, and without revealing their trading strategies.

## Requirements
- zkApp CLI version `0.20.1`
- o1js version `1.1.0.`
```sh
npm install -g zkapp-cli
```

## Installation
```sh
git clone git@github.com:0xjarix/ZoraKl.git
```

## Build the contract
```sh
cd ZoraKl/contracts
```
```sh
npm install
npm run build
```

## Test the contract
```sh
npm run test
```

## Run the UI
```sh
cd ZoraKl/ui
```
```sh
npm install
node run dev
```
![ui_1](./Screenshot_from_2024-10-10_11-55-49)
![ui_2](./Screenshot_from_2024-10-10_13-01-54)
