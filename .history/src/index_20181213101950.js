const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")
//const MarketMaker = require("@gnosis.pm/hg-market")
const { getContract, getEventFromTxLogs } = require('./utils/contracts')
const Web3 = require('web3')
const { toHex, padLeft, keccak256, toBN } = Web3.utils;

let pms, collateral;

const me = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

const prepareConditions = async (questionId, outcomeCount) => {
  console.log(`... Preparing Conditions with ${outcomeCount} outcomes. QuestionID: ${questionId}`)
  const tx = await pms.prepareCondition(
    me,
    questionId,
    outcomeCount,
    {
      from: me
    }
  );

  return getEventFromTxLogs("ConditionPreparation", tx).args
}

const receiveResult = async (questionId, results) => {
  console.log(`... Receiving Results for ${questionId}. Results: ["${results.join('", "')}"]`)
  const result = results.reduce((acc, n) => acc + padLeft(n, 64).slice(2), '')

  const tx = await pms.receiveResult(questionId, `0x${result}`, { from: me, gas: 1e6 })
  console.log(JSON.stringify(tx, null, 2))
}

const addCollateral = async (amount) => {
  console.log(`... Depositing and Approving ${(amount / 1e18).toFixed(2)} ETH Collateral`)

  // deposit 1e6 collateral
  await collateral.deposit({ from: me, value: amount, gas: 1e6 })
  await collateral.approve(pms.address, amount, { from: me })
}

const createSplit = async (conditionId, indexSets, parent = 0, amount = 1000) => {
  console.log(`... Splitting position for position ${parent}, conditionId: ${conditionId}, amount: ${amount}. Partitions: ["${indexSets.join('", "')}"]`)
  
  const tx = await pms.splitPosition(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    indexSets, // partition
    amount, // amount
    { from: me, gas: 1e6 }
  )
  console.log(JSON.stringify(tx, null, 2))
}

const mergeSplit = async (conditionId, indexSets, parent = 0, amount = 1000) => {
  console.log(`... Merging positions for position ${parent}, conditionId: ${conditionId}, amount: ${amount}. Partitions: ["${indexSets.join('", "')}"]`)
  console.log(collateral.address)
  const tx = await pms.mergePositions(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    indexSets, // partition
    amount, // amount
    { from: me, gas: 1e6 }
  )
  console.log(JSON.stringify(tx, null, 2))
}

const redeemPositions = async (conditionId, indexSets) => {
  const tx = await pms.redeemPositions(
    collateral.address,
    0,
    conditionId,
    indexSets,
    { from: me }
  )
  console.log(JSON.stringify(tx, null, 2))
}

const getPositionBalance = async (account, positionId) => {
  const positionBalance = await pms.balanceOf(
    account,
    positionId
  )
  return positionBalance
}

const init = async () => {
  const PredictionMarketSystem = await getContract(PredictionMarketSystemArtifact)
  const WETH9 = await getContract(WETH9Artifact)


  pms = await PredictionMarketSystem.deployed()
  collateral = await WETH9.deployed()
  
  let marketData

  try {
    marketData = await prepareConditions(me, 3)
    console.dir(marketData)
  } catch (err) {
    console.error(`Couldn't prepare conditions: ${err.message}`)
    return
  }

  try {
    await receiveResult(marketData.questionId, [50, 100, 1])
  } catch (err) {
    console.error(`Couldn't receive results: ${err.message}`)
    return
  }

  try {
    await addCollateral(1e19)
  } catch (err) {
    console.error(`Couldn't add Collateral: ${err.message}`)
    return
  }

  try {
    await createSplit(marketData.conditionId)
  } catch (err) {
    console.error(`Couldn't split position: ${err.message}`)
    return
  }

  const rootCollectionId = keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2))
  const rootPositionId = keccak256(collateral.address + rootCollectionId.slice(2))

  try {
    //await createSplit(conditionId, rootPositionId, 500)
  } catch (err) {
    console.error(`Couldn't split child position: ${err.message}`)
    return
  }

  const collectionId = '0x' + toHex(toBN(rootCollectionId).add(toBN(keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2))))).slice(-64)
  const childPositionId = keccak256(collateral.address + collectionId.slice(2))

  const childBalance = await getPositionBalance(me, childPositionId)
  //console.log("child split balance: " + childBalance.toString())

  try {
    //await mergeSplit(conditionId, [1, 2, 4], rootCollectionId, 500)
  } catch (err) {
    console.error(`Couldn't merge back to collateral: ${err.message}`)
    return
  }

  const mergedCollectionId = keccak256(conditionId + padLeft(toHex(3), 64).slice(2))
  const mergedPositionId = keccak256(collateral.address + mergedCollectionId.slice(2))

  //const balance = await getPositionBalance(me, mergedPositionId)
  //console.log(balance.toString())

  try {
    await redeemPositions(conditionId, [2])
  } catch (err) {
    console.error(`Couldn't redeem positions: ${err.message}`)
    return
  }

}


module.exports = init()