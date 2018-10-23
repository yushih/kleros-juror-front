import { createActions } from 'lessdux'

/* Actions */

export const bondingCurve = {
  ...createActions('BONDING_CURVE_TOTALS', { withUpdate: true }),
  BUY_PNK_FROM_BONDING_CURVE: 'BUY_PNK_FROM_BONDING_CURVE'
}

/* Action Creators */

export const buyPNKFromBondingCurve = ()=> ({
  type: bondingCurve.BUY_PNK_FROM_BONDING_CURVE,
  payload: { }
})
export const fetchBondingCurveData = () => ({ 
  type: bondingCurve.FETCH 
})
