# web3-election-dapp

This is a simple election decentralized application (DApp) built using the Ethereum blockchain and the Truffle framework. It is based on the tutorial by Dapp University: https://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial with the following modifications to make it work with the latest versions of the dependencies:

- Upgraded pragma solidity from 0.4.2 to 0.5.16 in [Election.sol](./contracts/Election.sol). This will depend on the version of the compiler you have installed.

- Updated the contructor function in [Election.sol](./contracts/Election.sol) from `function Election () public {` to `constructor () public {` as per the latest Solidity syntax.
