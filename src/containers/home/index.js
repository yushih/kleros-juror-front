import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import { RenderIf } from 'lessdux'

import { ChainData, ChainHash } from '../../chainstrap'
import { ARBITRATOR_ADDRESS } from '../../bootstrap/dapp-api'
import * as walletSelectors from '../../reducers/wallet'
import * as walletActions from '../../actions/wallet'
import * as notificationSelectors from '../../reducers/notification'
import * as notificationActions from '../../actions/notification'
import * as arbitratorSelectors from '../../reducers/arbitrator'
import * as arbitratorActions from '../../actions/arbitrator'
import Icosahedron from '../../components/icosahedron'
import Identicon from '../../components/identicon'
import BalancePieChart from '../../components/balance-pie-chart'
import Button from '../../components/button'
import NotificationCard from '../../components/notification-card'
import DisputeCard from '../../components/dispute-card'
import Slider from '../../components/slider'
import { dateToString } from '../../utils/date'
import { weiBNToDecimalString, decimalStringToWeiBN } from '../../utils/number'
import { camelToTitleCase } from '../../utils/string'
import * as arbitratorConstants from '../../constants/arbitrator'
import * as chainViewConstants from '../../constants/chain-view'

import {
  ActivatePNKForm,
  getActivatePNKFormIsInvalid,
  submitActivatePNKForm
} from './components/activate-pnk-form'

import './home.css'

const renderPeriodSlider = arbitratorData => {
  const start = arbitratorData.lastPeriodChange * 1000
  const end = start + arbitratorData.timePerPeriod[arbitratorData.period] * 1000
  const duration = end - start
  const initialPercent = Math.min((Date.now() - start) / duration, 1)
  return (
    <div>
      <br />
      <b>Session:</b> {arbitratorData.session}
      <br />
      <br />
      <b>Period:</b>{' '}
      {camelToTitleCase(arbitratorConstants.PERIOD_ENUM[arbitratorData.period])}{' '}
      - {arbitratorConstants.PERIOD_DESCRIPTION_ENUM[arbitratorData.period]}
      <br />
      <br />
      <Slider
        startLabel={`Period Start: ${dateToString(new Date(start))}`}
        endLabel={`Period End: ${dateToString(new Date(end))}`}
        steps={[
          {
            label: 'Now',
            percent: initialPercent,
            color: '#337ab7',
            point: true
          }
        ]}
      />
    </div>
  )
}
class Home extends PureComponent {
  static propTypes = {
    // Redux State
    accounts: walletSelectors.accountsShape.isRequired,
    balance: walletSelectors.balanceShape.isRequired,
    notifications: notificationSelectors.notificationsShape.isRequired,
    pendingActions: notificationSelectors.pendingActionsShape.isRequired,
    PNKBalance: arbitratorSelectors.PNKBalanceShape.isRequired,
    arbitratorData: arbitratorSelectors.arbitratorDataShape.isRequired,

    // Action Dispatchers
    fetchBalance: PropTypes.func.isRequired,
    dismissNotification: PropTypes.func.isRequired,
    fetchPNKBalance: PropTypes.func.isRequired,
    activatePNK: PropTypes.func.isRequired,
    fetchArbitratorData: PropTypes.func.isRequired,

    // activatePNKForm
    activatePNKFormIsInvalid: PropTypes.bool.isRequired,
    submitActivatePNKForm: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { fetchBalance, fetchPNKBalance, fetchArbitratorData } = this.props
    fetchBalance()
    fetchPNKBalance()
    fetchArbitratorData()
  }

  handleActivatePNKFormSubmit = formData => {
    const { activatePNK } = this.props
    const { amount } = formData
    toastr.removeByType('message')
    activatePNK(decimalStringToWeiBN(amount).toString())
  }

  handleActivatePNKFormButtonClick = () => {
    const { activatePNKFormIsInvalid, submitActivatePNKForm } = this.props
    if (activatePNKFormIsInvalid)
      return toastr.error('A valid amount is required.')

    submitActivatePNKForm()
  }

  validateActivatePNKForm = values => {
    const { arbitratorData } = this.props
    const errors = {}
    if (
      arbitratorData.data.minActivatedToken.greaterThan(
        decimalStringToWeiBN(values.amount, 'ether')
      )
    )
      errors.amount = `You must deposit a minimum of ${decimalStringToWeiBN(
        arbitratorData.data.minActivatedToken
      ).toString()} PNK.`
    return errors
  }

  handleActivateButtonClick = () => {
    const { PNKBalance } = this.props
    toastr.message('Deposit PNK', {
      id: 'activatePNKToastr',
      component: () => {
        const { activatePNKFormIsInvalid } = this.props
        return (
          <div>
            <ActivatePNKForm
              onSubmit={this.handleActivatePNKFormSubmit}
              initialValues={{
                amount: weiBNToDecimalString(
                  PNKBalance.data.tokenBalance,
                  'ether'
                )
              }}
              validate={this.validateActivatePNKForm}
            />
            <Button
              onClick={this.handleActivatePNKFormButtonClick}
              disabled={activatePNKFormIsInvalid}
            >
              Deposit
            </Button>
          </div>
        )
      }
    })
  }

  handleNotificationCardDismissClick = ({ currentTarget: { id } }) => {
    const { notifications, dismissNotification } = this.props
    const { txHash, logIndex } = notifications.data.find(n => (n._id = id))
    dismissNotification(txHash, logIndex)
  }

  render() {
    const {
      accounts,
      balance,
      notifications,
      pendingActions,
      PNKBalance,
      arbitratorData
    } = this.props

    return (
      <div className="Home">
        <h4>{"Welcome to Kleros' Juror Dashboard!"}</h4>
        <RenderIf
          resource={arbitratorData}
          loading={'...'}
          done={arbitratorData.data && renderPeriodSlider(arbitratorData.data)}
          failedLoading="..."
        />
        <div className="Home-stats">
          <div className="Home-stats-block">
            <div className="Home-stats-block-content">
              <Identicon seed={accounts.data[0]} size={20} />
              <div className="Home-stats-block-content-header">
                <h5>
                  <ChainData
                    contractName={chainViewConstants.WALLET_NAME}
                    contractAddress={accounts.data[0]}
                  >
                    <ChainHash>{accounts.data[0]}</ChainHash>
                  </ChainData>
                </h5>
                <RenderIf
                  resource={PNKBalance}
                  loading={'...'}
                  done={
                    PNKBalance.data && (
                      <h6 data-tip="This is the amount of PNK you have in the Kleros contract.">
                        <ChainData
                          contractName={chainViewConstants.KLEROS_POC_NAME}
                          contractAddress={ARBITRATOR_ADDRESS}
                          functionSignature={
                            chainViewConstants.KLEROS_POC_JURORS_SIG
                          }
                          parameters={chainViewConstants.KLEROS_POC_JURORS_PARAMS(
                            accounts.data[0]
                          )}
                        >
                          {weiBNToDecimalString(PNKBalance.data.tokenBalance)}{' '}
                          PNK
                        </ChainData>
                      </h6>
                    )
                  }
                  failedLoading="..."
                />
                <RenderIf
                  resource={balance}
                  loading={<Icosahedron />}
                  done={
                    <h6>
                      <ChainData
                        contractName={chainViewConstants.WALLET_NAME}
                        contractAddress={accounts.data[0]}
                      >
                        {balance.data} ETH
                      </ChainData>
                    </h6>
                  }
                  failedLoading="..."
                />
              </div>
            </div>
          </div>
          <div
            className="Home-stats-block"
            data-tip="This is the amount of PNK you have deposited to be drawn as a juror.<br />The more you deposit, the higher your chances of being drawn."
          >
            <RenderIf
              resource={PNKBalance}
              loading={<Icosahedron />}
              done={
                PNKBalance.data && (
                  <div className="Home-stats-block-content">
                    <BalancePieChart
                      type="activated"
                      balance={PNKBalance.data.activatedTokens.toNumber()}
                      total={PNKBalance.data.tokenBalance.toNumber()}
                      size={80}
                    />
                    <div className="Home-stats-block-content-header">
                      <h5>
                        Deposited
                        <RenderIf
                          resource={arbitratorData}
                          loading={null}
                          done={
                            arbitratorData.data &&
                            arbitratorConstants.PERIOD_ENUM[
                              arbitratorData.data.period
                            ] === 'deposit' && (
                              <Button
                                onClick={this.handleActivateButtonClick}
                                className="Home-stats-block-content-header-activateButton"
                                labelClassName="Home-stats-block-content-header-activateButton-label"
                              >
                                <ChainData
                                  contractName={
                                    chainViewConstants.KLEROS_POC_NAME
                                  }
                                  contractAddress={ARBITRATOR_ADDRESS}
                                  functionSignature={
                                    chainViewConstants.KLEROS_POC_ACTIVATE_TOKENS_SIG
                                  }
                                  parameters={chainViewConstants.KLEROS_POC_ACTIVATE_TOKENS_PARAMS()}
                                  estimatedGas={
                                    chainViewConstants.KLEROS_POC_ACTIVATE_TOKENS_GAS
                                  }
                                >
                                  +
                                </ChainData>
                              </Button>
                            )
                          }
                        />
                      </h5>
                      <h6>
                        <ChainData
                          contractName={chainViewConstants.KLEROS_POC_NAME}
                          contractAddress={ARBITRATOR_ADDRESS}
                          functionSignature={
                            chainViewConstants.KLEROS_POC_JURORS_SIG
                          }
                          parameters={chainViewConstants.KLEROS_POC_JURORS_PARAMS(
                            accounts.data[0]
                          )}
                        >
                          {weiBNToDecimalString(
                            PNKBalance.data.activatedTokens
                          )}{' '}
                          PNK
                        </ChainData>
                      </h6>
                    </div>
                  </div>
                )
              }
              failedLoading="..."
            />
          </div>
          <div
            className="Home-stats-block"
            data-tip="This is the amount of PNK you have locked in cases waiting to be ruled."
          >
            <RenderIf
              resource={PNKBalance}
              loading={<Icosahedron />}
              done={
                PNKBalance.data && (
                  <div className="Home-stats-block-content">
                    <BalancePieChart
                      type="locked"
                      balance={PNKBalance.data.lockedTokens.toNumber()}
                      total={PNKBalance.data.tokenBalance.toNumber()}
                      size={80}
                    />
                    <div className="Home-stats-block-content-header">
                      <h5>Locked</h5>
                      <h6>
                        <ChainData
                          contractName={chainViewConstants.KLEROS_POC_NAME}
                          contractAddress={ARBITRATOR_ADDRESS}
                          functionSignature={
                            chainViewConstants.KLEROS_POC_JURORS_SIG
                          }
                          parameters={chainViewConstants.KLEROS_POC_JURORS_PARAMS(
                            accounts.data[0]
                          )}
                        >
                          {weiBNToDecimalString(PNKBalance.data.lockedTokens)}{' '}
                          PNK
                        </ChainData>
                      </h6>
                    </div>
                  </div>
                )
              }
              failedLoading="..."
            />
          </div>
        </div>
        <div className="Home-separatorHeader">
          <h4>Notifications</h4>
        </div>
        <div className="Home-cardList">
          <RenderIf
            resource={notifications}
            loading={<Icosahedron />}
            done={
              notifications.data &&
              notifications.data.map(n => (
                <div key={n._id} className="Home-cardList-card">
                  <NotificationCard
                    id={n._id}
                    disputeID={n.data.disputeID}
                    message={n.message}
                    to={`/cases/${n.data.disputeID}`}
                    onDismissClick={this.handleNotificationCardDismissClick}
                  />
                </div>
              ))
            }
            failedLoading="There was an error fetching your notifications..."
          />
        </div>
        <div className="Home-separatorHeader">
          <h4>Pending Actions</h4>
        </div>
        <div className="Home-cardList">
          <RenderIf
            resource={pendingActions}
            loading={<Icosahedron />}
            done={
              pendingActions.data &&
              pendingActions.data.map(p => (
                <div
                  key={p.message + p.data.disputeID}
                  className="Home-cardList-card"
                >
                  <DisputeCard
                    status={0}
                    subcourt="GENERAL COURT"
                    disputeID={p.data.disputeID}
                    date={new Date()}
                    title={p.message}
                  />
                </div>
              ))
            }
            failedLoading="There was an error fetching your notifications..."
          />
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    accounts: state.wallet.accounts,
    balance: state.wallet.balance,
    notifications: state.notification.notifications,
    pendingActions: state.notification.pendingActions,
    PNKBalance: state.arbitrator.PNKBalance,
    arbitratorData: state.arbitrator.arbitratorData,
    activatePNKFormIsInvalid: getActivatePNKFormIsInvalid(state)
  }),
  {
    fetchBalance: walletActions.fetchBalance,
    dismissNotification: notificationActions.dismissNotification,
    fetchPNKBalance: arbitratorActions.fetchPNKBalance,
    activatePNK: arbitratorActions.activatePNK,
    fetchArbitratorData: arbitratorActions.fetchArbitratorData,
    submitActivatePNKForm
  }
)(Home)
