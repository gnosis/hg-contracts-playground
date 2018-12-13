const { getEventFromTxLogs } = require('./contracts')
const Web3 = require('web3')
const { toHex, padLeft, keccak256, toBN } = Web3.utils;


const contractInstances = {}
const getContractInstance = async (name) => {
  if (contractInstances[name]) {
    return contractInstances[name]
  }

  const contract = await getContract(name)
  const deployedInstance = await contract.deployed()
  contractInstances[name] = contractInstances

  return deployedInstance
}

const prepareConditions = async (pmSystemystem, oracle, questionId, outcomeCount) => {
  console.log(`... Preparing Conditions with ${outcomeCount} outcomes. QuestionID: ${questionId}`)
  const tx = await pmSystemystem.prepareCondition(
    oracle,
    questionId,
    outcomeCount,
    {
      from: oracle
    }
  );

  return getEventFromTxLogs("ConditionPreparation", tx).args
}

const receiveResult = async (pmSystem, questionId, results) => {
  console.log(`... Receiving Results for ${questionId}. Results: ["${results.join('", "')}"]`)
  const result = results.reduce((acc, n) => acc + padLeft(n, 64).slice(2), '')

  const tx = await pmSystem.receiveResult(questionId, `0x${result}`, { from: me, gas: 1e6 })
}

const addCollateral = async (pmSystem, amount) => {
  console.log(`... Depositing and Approving ${(amount / 1e18).toFixed(2)} ETH Collateral`)

  // deposit 1e6 collateral
  await collateral.deposit({ from: me, value: amount, gas: 1e6 })
  await collateral.approve(pmSystem.address, amount, { from: me })
}

const splitPosition = async (pmSystem, conditionId, indexSets, parent = 0, amount = 1000) => {
  console.log(`... Splitting position for position ${parent}, conditionId: ${conditionId}, amount: ${amount}. Partitions: ["${indexSets.join('", "')}"]`)
  
  const tx = await pmSystem.splitPosition(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    indexSets, // partition
    amount, // amount
    { from: me, gas: 1e6 }
  )
  //console.log(JSON.stringify(tx, null, 2))
}

const mergePositions = async (pmSystem, conditionId, indexSets, parent = 0, amount = 1000) => {
  console.log(`... Merging positions for position ${parent}, conditionId: ${conditionId}, amount: ${amount}. Partitions: ["${indexSets.join('", "')}"]`)
  
  const tx = await pmSystem.mergePositions(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    indexSets, // partition
    amount, // amount
    { from: me, gas: 1e6 }
  )
  //console.log(JSON.stringify(tx, null, 2))
}

const redeemPositions = async (pmSystem, conditionId, indexSets) => {
  console.log(`... Redeeming position for condition ${conditionId}, Partitions: ["${indexSets.join('", "')}"]`)
  const tx = await pmSystem.redeemPositions(
    collateral.address,
    0,
    conditionId,
    indexSets,
    { from: me }
  )
  console.log(JSON.stringify(tx, null, 2))
}

module.exports = {
  getContractInstance,
  prepareConditions,
  receiveResult,
  splitPosition,
  mergePositions,
  redeemPositions,
}