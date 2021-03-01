const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const web3 = new Web3(ganache.provider());

let lottery;
let manager;
let accounts;

const ONE_ETHER = web3.utils.toWei('1', 'ether');

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  
  // Assign manager
  manager = accounts[0];

  // Use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface)).deploy({
    data: bytecode
  }).send({
    from: manager,
    gas: '1000000'
  });
});

describe('Lottery', () => {
  it('deploys the contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: ONE_ETHER
    });

    const players = await lottery.methods.getPlayers().call();

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: ONE_ETHER
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: ONE_ETHER
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: ONE_ETHER
    });

    const players = await lottery.methods.getPlayers().call();

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: ONE_ETHER
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei('0.8', 'ether'));
  });
});