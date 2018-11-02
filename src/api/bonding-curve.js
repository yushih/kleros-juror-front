import Eth, { toBN } from 'ethjs'
import bondingCurveArtifact from 'kleros-interaction/build/contracts/BondingCurve'
import tokenArtifact from 'kleros-interaction/build/contracts/MiniMeTokenERC20'

import { decimalStringToWeiBN } from '../utils/number'

const SPREAD_DIVISOR = toBN(10000) // Must be kept in sync with the bonding curve contract

/** Given an input ETH amount and the state values of the bonding curve contract,
 *  compute the amount of PNK that can be brought using the same formula as the
 *  bonding curve contract. Note this duplicates the algorithm from the contract
 *  but we can't call the contract because that way the turnaround would be too  
 *  slow for a responsive UI.
 *  @param {string} inputETH User input ETH amount in ETH (not Wei). May not be a valid number.
 *  @param {BigNumber} 'totalETH' value of the contract.
 *  @param {BigNumber} 'totalPNK' value of the contract.
 *  @param {BigNumber} 'spread' value of the contract.
 *  @returns {string} Amount of PNK in wei.
 */
export function estimatePNK(inputETH, totalETH, totalPNK, spread) {
  var ETH;
  try {
    ETH = decimalStringToWeiBN(inputETH)
  } catch(e) {
    return '0'
  }
  // convert all to BN from BigNumber
  totalETH = toBN(totalETH)
  totalPNK = toBN(totalPNK)
  spread = toBN(spread)

  return ETH.mul(totalPNK).mul(SPREAD_DIVISOR)
    .div(totalETH.add(ETH)).div(SPREAD_DIVISOR.add(spread)).toString()
}

/** Given an input PNK amount and the state values of the bonding curve contract,
 *  compute the amount of ETH that the PNK is sold for using the same formula as 
 *  the bonding curve contract. Note this duplicates the algorithm from the contract
 *  but we can't call the contract because that way the turnaround would be too  
 *  slow for a responsive UI.
 *  @param {string} inputPNK User input PNK amount. May not be a valid number.
 *  @param {BigNumber} 'totalETH' value of the contract.
 *  @param {BigNumber} 'totalPNK' value of the contract.
 *  @param {BigNumber} 'spread' value of the contract.
 *  @returns {string} Amount of ETH in wei.
 */
export function estimateETH(inputPNK, totalETH, totalPNK, spread) {
  var PNK;
  try {
    PNK = decimalStringToWeiBN(inputPNK)
  } catch(e) {
    return '0'
  }
  // convert all to BN from BigNumber
  totalETH = toBN(totalETH)
  totalPNK = toBN(totalPNK)
  spread = toBN(spread)

  return totalETH.mul(PNK).mul(SPREAD_DIVISOR).div(totalPNK.add(PNK))
   .div(SPREAD_DIVISOR.add(spread)).toString()
}

/* The API class for calling the blockchain.
 */
export default class BondingCurve {
  /*@param {object} _ethProvider The ethereum provider object.
   *@param {string} _contractAddress The address of the bonding curve contract.
   */
  constructor(_ethProvider, _contractAddress) {
    this.eth = new Eth(_ethProvider)
    this.contractInstance = this.eth.contract(bondingCurveArtifact.abi).at(_contractAddress)
  }

  /**
   * Fetch the total amount of ETH in the bonding curve.
   * @returns {number} - The total amount of ETH as a BigNumber.
   */
  getTotalETH = async () => {
    return this.contractInstance.totalETH()
  }

  /**
   * Fetch the total amount of bonded token in the bonding curve.
   * @returns {number} - The total amount of bonded token as a BigNumber.
   */
  getTotalTKN = async () => {
    return this.contractInstance.totalTKN()
  }

  /**
   * Fetch the spead of the bonding curve.
   * @returns {number} - The spread as a BigNumber.
   */
  getSpread = async () => {
    return this.contractInstance.spread()
  }

  /**
   * Buy bonded token from the bonding curve.
   * @param {string} receiver - The account the brought token is accredited to.
   * @param {string} minTKN - The minimum amount of bonded token expected in return.
   * @param {string} amount - The amount of ETH to spend.
   * @param {string} account - The address of the buyer.
   * @returns {object} - The result transaction object.
   */
  buy = async (receiver, minTKN, amount, account) => {
    return this.contractInstance.buy(receiver, minTKN, {
      from: account,
      value: amount
    })
  }

  /**
   * Sell bonded token to the bonding curve.
   * @param {string} amountTKN - The amount of token to sell.
   * @param {stirng} receiverAddr - The address to receive ETH.
   * @param {string} minETH - The minimum amount of ETH expected in return.
   * @param {string} account - The address of the seller.
   * @returns {object} - The result transaction object.
   */
  sell = async (amountTKN, receiverAddr, minETH, account) => {
    const pinakionContractAddress = await this.contractInstance.tokenContract()
    const pnkInstance = this.eth.contract(tokenArtifact.abi).at(pinakionContractAddress)

    // See BondingCurve.sol in kleros-interaction for the definition of extraData.
    const extraData =
      '0x62637331' + // Magic number for string "bcs1"
      (receiverAddr.startsWith('0x') ? receiverAddr.slice(2) : receiverAddr) +
      new Eth.BN(minETH).toString(16, 64)

    return pnkInstance.approveAndCall(
      this.contractAddress,
      amountTKN,
      account,
      extraData
    )
  }
}
