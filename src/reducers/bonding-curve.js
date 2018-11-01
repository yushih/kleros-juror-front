import PropTypes from 'prop-types'
import createReducer, { createResource } from 'lessdux'

import * as bondingCurve from '../api/bonding-curve'

// Shapes
const {
  shape: bondingCurveTotalsShape,
  initialState: bondingCurveInitialState
} = createResource(
  PropTypes.shape({
     totalETH: PropTypes.object.isRequired,
     totalPNK: PropTypes.object.isRequired
  }),
  { withUpdate: true }
) 
export { bondingCurveTotalsShape }

// Reducer
function estimatePNK(state, action) {
  const estimatedPNK = bondingCurve.estimatePNK(
    action.payload.ETH,
    state.bondingCurveTotals.data.totalETH,
    state.bondingCurveTotals.data.totalPNK,
    state.bondingCurveTotals.data.spread)

  if (state.bondingCurveFormState.estimatedPNK===estimatedPNK) {
    return state;
  } 
  return Object.assign({}, state, { bondingCurveFormState: 
    { 
       estimatedPNK,
       estimatedETH: state.bondingCurveFormState.estimatedETH 
    }
  })
}

function estimateETH(state, action) {
  const estimatedETH = bondingCurve.estimateETH(
    action.payload.PNK,
    state.bondingCurveTotals.data.totalETH,
    state.bondingCurveTotals.data.totalPNK,
    state.bondingCurveTotals.data.spread)

  if (state.bondingCurveFormState.estimatedETH===estimatedETH) {
    return state;
  } 
  return Object.assign({}, state, { bondingCurveFormState: 
    { 
      estimatedETH,
      estimatedPNK: state.bondingCurveFormState.estimatedPNK
    }
  })
}
 
export default createReducer(
  { 
    bondingCurveTotals: bondingCurveInitialState,
    bondingCurveFormState: {
      estimatedPNK: 0,
      estimatedETH: 0
    }
  },
  { 
    ESTIMATE_PNK_FROM_BONDING_CURVE: estimatePNK,
    ESTIMATE_ETH_FROM_BONDING_CURVE: estimateETH
  }
)

