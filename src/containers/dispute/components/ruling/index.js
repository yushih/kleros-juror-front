import React from 'react'
import PropTypes from 'prop-types'

import { dateToString } from '../../../../utils/date'
import { weiBNToDecimalString } from '../../../../utils/number'
import LabelValueGroup from '../../../../components/label-value-group'

import './ruling.css'

const Ruling = ({
  ruledAt,
  votesForPartyA,
  votesForPartyB,
  netPNK,
  jurorRuling,
  appealNumber,
  metaEvidenceJSON
}) => {
  const inProgress = ruledAt === null
  const won = netPNK >= 0
  const jurorRulingDisplay =
    jurorRuling === null || jurorRuling === undefined
      ? ''
      : jurorRuling > 0
      ? `You ruled: ${metaEvidenceJSON.rulingOptions.titles[jurorRuling - 1]}`
      : 'No Ruling'

  return (
    <div className="Ruling">
      <hr />
      <h4>{metaEvidenceJSON.question}</h4>
      <hr />
      <small>
        {inProgress
          ? 'In Progress'
          : dateToString(ruledAt, { withTime: false })}
      </small>
      <h4>{appealNumber ? `Appeal #${appealNumber}` : ''} Ruling</h4>
      <small>{jurorRulingDisplay}</small>
      {!inProgress && (
        <div className="Ruling-outcome">
          <div
            className={`Ruling-outcome-party Ruling-outcome-party--${
              won ? 'positive' : 'negative'
            }`}
          >
            <h4 className="Ruling-outcome-netPNK-label">
              {votesForPartyA === votesForPartyB
                ? 'No Ruling'
                : votesForPartyA > votesForPartyB
                ? metaEvidenceJSON.rulingOptions.titles[0]
                : metaEvidenceJSON.rulingOptions.titles[1]}
            </h4>
          </div>
          <div className="Ruling-outcome-netPNK">
            <h5 className="Ruling-outcome-netPNK-label">
              {won ? 'Received ' : 'Lost '}
            </h5>
            <h4 className="Ruling-outcome-netPNK-label">
              {weiBNToDecimalString(netPNK)} PNK
            </h4>
          </div>
        </div>
      )}
      <LabelValueGroup
        items={
          inProgress
            ? []
            : [
                {
                  label: `Voted ${metaEvidenceJSON.rulingOptions.titles[0]}`,
                  value: votesForPartyA
                },
                {
                  label: `Voted ${metaEvidenceJSON.rulingOptions.titles[1]}`,
                  value: votesForPartyB
                },
                {
                  label: 'PNK Redistribution',
                  value: (
                    <span
                      className={`Ruling-netPNK Ruling-netPNK--${
                        won ? 'positive' : 'negative'
                      }`}
                    >
                      {won ? '+' : '-'}
                      {weiBNToDecimalString(netPNK)}
                    </span>
                  )
                }
              ]
        }
      />
      <hr />
    </div>
  )
}

Ruling.propTypes = {
  // State
  ruledAt: PropTypes.instanceOf(Date),
  votesForPartyA: PropTypes.number.isRequired,
  votesForPartyB: PropTypes.number.isRequired,
  netPNK: PropTypes.number.isRequired,
  jurorRuling: PropTypes.shape,
  appealNumber: PropTypes.number.isRequired,
  metaEvidenceJSON: PropTypes.shape.isRequired
}

Ruling.defaultProps = {
  // State
  ruledAt: null,
  jurorRuling: null
}

export default Ruling
