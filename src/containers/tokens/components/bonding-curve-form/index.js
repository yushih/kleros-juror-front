import { form } from '../../../../utils/form-generator'
import { required, number } from '../../../../utils/validation'

export const {
  Form: BuyPNKFromBondingCurveForm,
  isInvalid: getBuyPNKFromBondingCurveFormIsInvalid,
  submit: submitBuyPNKFromBondingCurveForm
} = form('buyPNKFromBondingCurveForm', {
  header: {
    type: 'header',
    props: { title: 'BUY PNK' }
  },
  rate: {
    type: 'info'
  },
  amount: {
    type: 'text',
    validate: [required, number],
    props: {
      type: 'number',
      className: 'Form-noMargins'
    }
  }
})
