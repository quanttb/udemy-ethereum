import Web3 from 'web3';

// TO-DO
// require('dotenv').config({ path: '../.env' });

const HDWalletProvider = require('@truffle/hdwallet-provider');

const provider = new HDWalletProvider(
  process.env.REACT_APP_MNEMONIC,
  process.env.REACT_APP_INFURA_API
);

const web3 = new Web3(provider);

export default web3;