const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")

const { getContract } = require('./utils/contracts')
const { splitPosition, mergePositions, redeemPositions, getContractInstance } = require('./utils/pmSystem')

let predictionMarketSystemInstance

class Position {
  async initalizeContracts() {
    predictionMarketSystemInstance = await getContractInstance('PredictionMarketSystem')
  }

  constructor() {
    this.conditionId = undefined
    this.parent = undefined
    this.indexSets = undefined
    this.amount = undefined
  }

  /**
   * @method createCollateralSplit
   * @description Creates a new position on a condition id from collateral
   * @param {conditionId}
   * @param {indexSets}
   * @param {amount}
   */
  async static createCollateralSplit(conditionId, indexSets, amount) {
    const newPosition = new Position()
    newPosition.split(conditionId, 0, indexSets, amount)
  }

  /**
   * @method createCollateralSplit
   * @description Creates a new position on an existing position
   * @param {conditionId}
   * @param {indexSets}
   * @param {amount}
   */
  async static createPositionSplit(conditionId, parent, indexSets, amount) {
    const newPosition = new Position()
    newPosition.split(conditionId, parent, indexSets, amount)
  }

  async splitCollateral(indexSets, amount) {
    if (indexSets.length > this.numOfOutcomes) throw new Error('Invalid Index Set, can\'t be bigger than number of outcomes')

    const newPosition = new Position()
    newPosition.split(this.id, 0, indexSets, amount)
  }

  async split(conditionId, parent, indexSets, amount) {
    try {
      await splitPosition(
        predictionMarketSystemInstance,
        conditionId,
        indexSets,
        parent,
        amount
      )
      this.conditionId = conditionId
      this.parent = parent
      this.indexSets = indexSets
      this.amount = amount
    } catch (err) {
      console.error("Position: Could not create split")
      console.error(err.message)
    }
  }

  async merge(conditionId, parent, indexSets, amount) {
    try {
      await mergePositions(
        predictionMarketSystemInstance,
        conditionId,
        indexSets,
        parent,
        amount
      )
    } catch (err) {
      console.error("Position: Could not merge positions")
      console.error(err.message)
    }
  }

  async redeem(conditionId, indexSets) {
    try {
      await redeemPositions(
        predictionMarketSystemInstance,
        conditionId,
        indexSets,
      )
    } catch (err) {
      console.error("Position: Could not redeem position")
      console.error(err.message)
    }
  }

}

module.exports = Position