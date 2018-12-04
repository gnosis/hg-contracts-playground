const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")
const { getContract } = require('./utils/contracts')
const Web3 = require('web3')
const { toHex, padLeft, keccak256, toChecksumAddress, toBN } = Web3.utils;

let pms, collateral;

const me = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

const prepareConditions = async () => {
  const tx = await pms.prepareCondition(
    "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1",
    "whatever",
    3,
    {
      from: "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"
    }
  );
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
  //await prepareConditions(instance)
  const conditionId = "0xfd8d73cf47d20f68c0ab85e7373b3358d61e1a9d4414a4e9ffae06270d32c111"
  const questionId = "0x7768617465766572000000000000000000000000000000000000000000000000"

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
    //await createSplit(conditionId, collectionId, 500)
  } catch (err) {
    console.error(`Couldn't split child position: ${err.message}`)
  }

  const collectionId = '0x' + toHex(toBN(rootCollectionId).add(toBN(keccak256(conditionId + padLeft(toHex(0b01), 64).slice(2))))).slice(-64)
  const childPositionId = keccak256(collateral.address + collectionId.slice(2))


  //const balance = await getPositionBalance(me, childPositionId)
  //console.log(balance.toString())

  
}


module.exports = init()