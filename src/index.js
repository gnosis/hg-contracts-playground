const Condition = require('./Condition')
const Position = require('./Position')
const TokenTransfer = require('./TokenTransfer')
const Web3 = require('web3')

let pms, collateral;

const me = "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"

const getPositionBalance = async (account, positionId) => {
  const positionBalance = await pms.balanceOf(
    account,
    positionId
  )
  return positionBalance
}

const init = async () => {
  const myCondition = new Condition()
  await myCondition.prepare(me, "something", 3)

  await TokenTransfer.addDepositAndApprovalAmount(1e19)

  const ethSplit = await Position.createCollateralSplit(myCondition.id, [1, 2, 4], 1000)

  await myCondition.resolve([1, 2, 100])
  
  await ethSplit.redeem()
  //myCondition.split([1, 2, 4])
  /*
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
    await createSplit(marketData.conditionId, [1, 2, 4])
  } catch (err) {
    console.error(`Couldn't split position: ${err.message}`)
    return
  }

  const rootCollectionId = keccak256(marketData.conditionId + padLeft(toHex(0b01), 64).slice(2))
  const rootPositionId = keccak256(collateral.address + rootCollectionId.slice(2))

  try {
    await createSplit(marketData.conditionId, [1, 2, 4], rootCollectionId, 500)
  } catch (err) {
    console.error(`Couldn't split child position: ${err.message}`)
    return
  }

  const collectionId = '0x' + toHex(toBN(rootCollectionId).add(toBN(keccak256(marketData.conditionId + padLeft(toHex(0b01), 64).slice(2))))).slice(-64)
  const childPositionId = keccak256(collateral.address + collectionId.slice(2))

  const childBalance = await getPositionBalance(me, childPositionId)
  //console.log("child split balance: " + childBalance.toString())

  try {
    await mergeSplit(marketData.conditionId, [1, 2, 4], rootCollectionId, 500)
  } catch (err) {
    console.error(`Couldn't merge back to collateral: ${err.message}`)
    return
  }

  const mergedCollectionId = keccak256(marketData.conditionId + padLeft(toHex(3), 64).slice(2))
  const mergedPositionId = keccak256(collateral.address + mergedCollectionId.slice(2))

  //const balance = await getPositionBalance(me, mergedPositionId)
  //console.log(balance.toString())

  try {
    await redeemPositions(marketData.conditionId, [2])
  } catch (err) {
    console.error(`Couldn't redeem positions: ${err.message}`)
    return
  }
  */

}


module.exports = init()