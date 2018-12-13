// hg-contract artifacts
const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")

const { getContract } = require('./utils/contracts')
const { prepareConditions, receiveResult, getContractInstance } = require('./utils/pmSystem')

const Position = require('./Position')

let predictionMarketSystemInstance;

class Condition {
  async initalizeContracts() {
    predictionMarketSystemInstance = await getContractInstance('PredictionMarketSystem')
  }

  constructor() {
    this.id = undefined
    this.questionId = undefined
    this.numOfOutcomes = undefined

    this.positions = []
  }

  async prepare(oracle, questionId, numOfOutcomes) {
    await this.initalizeContracts()
    try {
      const { conditionId } = await prepareConditions(
        predictionMarketSystemInstance,
        oracle,
        questionId,
        numOfOutcomes,
      )
      this.questionId = questionId
      this.numOfOutcomes = numOfOutcomes
      this.id = conditionId
    } catch (err) {
      console.error("Condition: Could not prepare condition")
      console.error(err.message)
    }
  }

  async resolve(results) {
    if (results.length != this.numOfOutcomes) throw new Error('Invalid amount of results passed to condition.')

    try {
      await receiveResult(
        predictionMarketSystemInstance,
        this.questionId,
        results,
      )
    } catch (err) {
      console.error("Condition: Could not resolve")
      console.error(err.message)
    }
  }
}

module.exports = Condition 