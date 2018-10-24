import { takeLatest, call, select } from 'redux-saga/effects'

import * as bondingCurveActions from '../actions/bonding-curve'
import * as walletSelectors from '../reducers/wallet'
import { kleros } from '../bootstrap/dapp-api'
import { lessduxSaga } from '../utils/saga'


function *fetchBondingCurveTotals() {
  return {
    totalETH: yield call(kleros.bondingCurve.getTotalETH),
    totalPNK: yield call(kleros.bondingCurve.getTotalTKN),
    spread: yield call(kleros.bondingCurve.getSpread)
  }
}

function *buyPNKFromBondingCurve({payload: { amount } }) {
  const addr = yield select(walletSelectors.getAccount)
  return yield call(
    kleros.bondingCurve.buy,
    addr,
    0, //todo
    amount,
    addr
  )
}

/**
 * The root of the bonding curve saga.
 */
export default function* bondingCurveSaga() {
  yield takeLatest(
    bondingCurveActions.bondingCurve.FETCH,
    lessduxSaga,
    'fetch',
    bondingCurveActions.bondingCurve,
    fetchBondingCurveTotals
  )
  yield takeLatest(
    bondingCurveActions.bondingCurve.BUY_PNK_FROM_BONDING_CURVE,
    lessduxSaga,
    'update',
    bondingCurveActions.bondingCurve,
    buyPNKFromBondingCurve
  )
}
