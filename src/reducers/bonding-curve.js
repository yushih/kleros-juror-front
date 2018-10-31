import PropTypes from 'prop-types'
import createReducer, { createResource } from 'lessdux'

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
export default createReducer(
  { 
    bondingCurveTotals: bondingCurveInitialState,
    bondingCurveFormState: {
      estimatedPNK: 0,
      estimatedETH: 0
    }
  },
  { ESTIMATE_PNK_FROM_BONDING_CURVE: f }
)

function f (state, action) {
  const estimatedPNK = action.payload.ETH
  if (state.bondingCurveFormState.estimatedPNK===estimatedPNK) {
    return state;
  } 
  return Object.assign({}, state, { bondingCurveFormState: { estimatedPNK}});
}
