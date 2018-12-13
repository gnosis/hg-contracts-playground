const PredictionMarketSystemArtifact = require("@gnosis.pm/hg-contracts/build/contracts/PredictionMarketSystem.json")
const WETH9Artifact = require("@gnosis.pm/hg-contracts/build/contracts/WETH9.json")

const { getContract } = require('./utils/contracts')
const { addCollateral, getContractInstance } = require('./utils/pmSystem')

let predictionMarketSystemInstance

class TokenTransfer {
  async initalizeContracts() {
    predictionMarketSystemInstance = await getContractInstance('PredictionMarketSystem')
  }

  addDepositAndApprovalAmount = async (amount) => {
    await this.initalizeContracts()
    addCollateral(predictionMarketSystemInstance, amount)
  }
}

module.exports = TokenTransfer