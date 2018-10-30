import React, { PureComponent } from 'react'

import Button from '../../../../components/button'
import { form } from '../../../../utils/form-generator'
import { required, number, positiveNumber } from '../../../../utils/validation'

const {
  Form: BuyPNKFromBondingCurveForm,
  isInvalid: getBuyPNKFromBondingCurveFormIsInvalid,
  submit: submitBuyPNKFromBondingCurveForm
} = form('buyPNKFromBondingCurveForm', {
  header: {
    type: 'header',
    props: { title: 'BUY PNK' }
  },
  explanation: {
    type: 'info'
  },
  amountOfETH: {
    type: 'text',
    validate: [required, number, positiveNumber],
    props: {
      type: 'number',
      className: 'Form-noMargins'
    }
  },
  
})

export { getBuyPNKFromBondingCurveFormIsInvalid, submitBuyPNKFromBondingCurveForm }

const {
  Form: SellPNKToBondingCurveForm,
  isInvalid: getSellPNKToBondingCurveFormIsInvalid,
  submit: submitSellPNKToBondingCurveForm
} = form('sellPNKToBondingCurveForm', {
  header: {
    type: 'header',
    props: { title: 'SELL PNK' }
  },
  explanation: {
    type: 'info'
  },
  amountOfPNK: {
    type: 'text',
    validate: [required, number, positiveNumber],
    props: {
      type: 'number',
      className: 'Form-noMargins'
    }
  },
  
})

export { getSellPNKToBondingCurveFormIsInvalid, submitSellPNKToBondingCurveForm }

class BondingCurveForm extends PureComponent {
  render() {
    const {
      handleBuyPNK,
      validateBuyPNK,
      handleSellPNK,
      validateSellPNK,
      buyPNKFromBondingCurveFormIsInvalid,
      sellPNKToBondingCurveFormIsInvalid,
      submitBuyPNKFromBondingCurveForm,
      data
    } = this.props

    return (
      <div>
        <BuyPNKFromBondingCurveForm
          enableReinitialize 
          keepDirtyOnReinitialize
          initialValues={{
            explanation: (
              <span>
                The amount of ETH you'd like to spend:
              </span>
            )
          }}
          onSubmit={handleBuyPNK}
          validate={validateBuyPNK}
        />
          bonding curve: {JSON.stringify(data)}
        <Button
          onClick={submitBuyPNKFromBondingCurveForm}
          disabled={buyPNKFromBondingCurveFormIsInvalid}
          className="Tokens-form-button"
        >
          BUY NOW
        </Button>

        <SellPNKToBondingCurveForm
          enableReinitialize 
          keepDirtyOnReinitialize
          initialValues={{
            explanation: (
              <span>
                The amount of PNK you'd like to sell:
              </span>
            )
          }}
          onSubmit={handleSellPNK}
          validate={validateSellPNK}
        />
        <Button
          onClick={submitSellPNKToBondingCurveForm}
          disabled={sellPNKToBondingCurveFormIsInvalid}
          className="Tokens-form-button"
        >
          SELL NOW
        </Button> 
      </div>
    )
  } //render()
}

export { BondingCurveForm }
