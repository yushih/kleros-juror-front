import { toBN } from 'ethjs'
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
