const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")
//const MarketMaker = require("@gnosis.pm/hg-market")
const { getContract } = require('./utils/contracts')
const Web3 = require('web3')
const { toHex, padLeft, keccak256, toBN } = Web3.utils;

let pms, collateral;

const me = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

const prepareConditions = async (questionId, outcomeCount) => {
  const tx = await pms.prepareCondition(
    me,
    questionId,
    outcomeCount,
    {
      from: me
    }
  );
  console.log(JSON.stringify(tx, null, 2))
}

const receiveResult = async (questionId, results) => {
  const result = results.reduce((acc, n) => acc + padLeft(n, 64).slice(2), '')

  const tx = await pms.receiveResult(questionId, `0x${result}`, { from: me, gas: 1e6 })
  console.log(JSON.stringify(tx, null, 2))
}

const addCollateral = async () => {
  // deposit 1e6 collateral
  await collateral.deposit({ from: me, value: 1e19, gas: 1e6 })
  await collateral.approve(pms.address, 1e19, { from: me })
}

const createSplit = async (conditionId, parent = 0, amount = 1000) => {
  const tx = await pms.splitPosition(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    [1, 2, 4], // partition
    amount, // amount
    { from: me, gas: 1e6 }
  )
  console.log(JSON.stringify(tx, null, 2))
}

const mergeSplit = async (conditionId, indexSets, parent = 0, amount = 1000) => {
  console.log(collateral.address)
  const tx = await pms.mergePositions(
    collateral.address, // collateral address
    parent, // parent collection
    conditionId, // condition id
    [3], // partition
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
  
  await prepareConditions()

  const conditionId = "0xfd8d73cf47d20f68c0ab85e7373b3358d61e1a9d4414a4e9ffae06270d32c111"
  const questionId = "0x7768617465766572000000000000000000000000000000000000000000000000"

  try {
    //await receiveResult(questionId, [50, 100, 1])
  } catch (err) {
    console.error(`Couldn't receive results: ${err.message}`)
  }

  try {
    //await addCollateral(collateral, instance)
  } catch (err) {
    console.error(`Couldn't add Collateral: ${err.message}`)
  }

  try {
    //await createSplit(conditionId)
  } catch (err) {
    console.error(`Couldn't split position: ${err.message}`)
  }

  const rootCollectionId = keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2))
  const rootPositionId = keccak256(collateral.address + rootCollectionId.slice(2))

  try {
    //await createSplit(conditionId, rootPositionId, 500)
  } catch (err) {
    console.error(`Couldn't split child position: ${err.message}`)
  }

  const collectionId = '0x' + toHex(toBN(rootCollectionId).add(toBN(keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2))))).slice(-64)
  const childPositionId = keccak256(collateral.address + collectionId.slice(2))

  const childBalance = await getPositionBalance(me, childPositionId)
  //console.log("child split balance: " + childBalance.toString())

  try {
    //await mergeSplit(conditionId, [1, 2, 4], rootCollectionId, 500)
  } catch (err) {
    console.error(`Couldn't merge back to collateral: ${err.message}`)
  }

  const mergedCollectionId = keccak256(conditionId + padLeft(toHex(3), 64).slice(2))
  const mergedPositionId = keccak256(collateral.address + mergedCollectionId.slice(2))

  //const balance = await getPositionBalance(me, mergedPositionId)
  //console.log(balance.toString())

  try {
    await redeemPositions(conditionId, [2])
  } catch (err) {
    console.error(`Couldn't redeem positions: ${err.message}`)
  }

}


module.exports = init()