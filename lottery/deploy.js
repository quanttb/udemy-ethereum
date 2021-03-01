const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const fs = require('fs');

const mnemonic = fs.readFileSync(".secret").toString().trim();

const provider = new HDWalletProvider(
  mnemonic,
  'https://rinkeby.infura.io/v3/fb5e8b4131244737967e861b4ce40366'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`Attempting to deploy from account: ${accounts[0]}`);

  const result = await new web3.eth.Contract(JSON.parse(interface)).deploy({
    data: bytecode
  }).send({
    from: accounts[0],
    gas: '1000000'
  });

  console.log(`Contract deployed to: ${result.options.address}`);
};
deploy();