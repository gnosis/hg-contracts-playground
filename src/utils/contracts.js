const Web3 = require('web3')
const TruffleContract = require('truffle-contract')
const { head } = require('lodash')

// currently only uses ganache
const getProvider = () => {
  //if (typeof window !== 'undefined' && window.web3) {
  //  return window.web3.currentProvider
  //} else {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
    return new Web3.providers.HttpProvider('http://127.0.0.1:8545')
  //}
}

let web3Instance
const setupWeb3 = async () => {
  if (web3Instance) {
    return web3Instance
  }

  //await windowLoaded

  web3Instance = new Web3(getProvider())
  //window.web3 = web3Instance
  return web3Instance
}

// returns TC wrapped and Provided contract
const getContract = async (contractName) => {
  const artifact = await require(`@gnosis.pm/hg-contracts/build/contracts/${contractName}.json`)
  const contract = TruffleContract(artifact)

  try {
    const { currentProvider } = await setupWeb3()
    await contract.setProvider(currentProvider)
    
    return contract
  } catch (e) {
    throw new Error(e)
  }
}

const getEventFromTxLogs = (eventName, tx) => head(tx.logs.filter((log) => log.event === eventName))

module.exports = {
  getContract,
  setupWeb3,
  getEventFromTxLogs,
}