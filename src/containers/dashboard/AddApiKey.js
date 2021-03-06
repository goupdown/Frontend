import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { addApiKey } from '../../actions/apiKeys';
import { showTwoFactorAuthModal} from '../../actions/modal';
import { addQuickNotif } from '../../actions/quickNotif';
import ExchangeSelect from '../../components/ExchangeSelect';
import LockButton from '../../components/LockButton';

const INITIAL_STATE = {
  name: '',
  secret: '',
  value: '',
  exchange: '',
  passphrase: '',
};

class AddApiKey extends React.Component {
  state = INITIAL_STATE;

  onSubmit = async (event) => {
    event.preventDefault();
    const { name, value, exchange, secret, passphrase } = this.state;
    const { is2FAEnable, showTwoFactorAuthModal } = this.props;
    const isPhraseNotFilled = exchange === 'kucoin' && !passphrase;

    if (!name || !value || !exchange || !secret || isPhraseNotFilled) {
      const text = `dashboard.${isPhraseNotFilled ? 'addPassphrase' : 'addAlert'}`;
      this.props.addQuickNotif({
        type: 'error',
        object: {
          text,
          _id: text,
        },
      });
      return;
    }

    if (is2FAEnable) {
      const params = {...this.state};
      showTwoFactorAuthModal('',
        {},
        async token => await this.props.onApiKeyCreated(params, token)
      );
    } else {
      this.props.onApiKeyCreated(this.state);
    }

    this.setState(INITIAL_STATE);
  }

  handleChange = (event) => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  }

  handleExchangeChange = (exchange) => {
    this.setState({ exchange });
  }

  render() {
    const { apiKeys } = this.props.billing;
    const { exchange } = this.state;

    return (
      <div className="add_keys_form_wrapper">
        <form onSubmit={this.onSubmit}>
          <div className="add_keys_str">
            <div className="add_keys_field_wr">
              <input
                className="add_keys_field add_keys_field_name"
                onChange={this.handleChange}
                type="text"
                value={this.state.name}
                maxLength='20'
                name="name"
                placeholder={this.props.intl.messages['dashboard.namePlaceholder']}
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
            <div className="add_keys_field_wr select_wr">
              <ExchangeSelect
                defaultPlaceholder={this.props.intl.messages['dashboard.exchange']}
                exchanges={this.props.exchanges}
                onChange={this.handleExchangeChange}
                exchange={this.state.exchange}
              />
            </div>
            <div className="add_keys_double_field_wr clearfix">
              <div>
                <input className="add_keys_field add_keys_field_key"
                  type="text"
                  name="value"
                  autoComplete="off"
                  value={this.state.value}
                  onChange={this.handleChange}
                  placeholder={this.props.intl.messages['dashboard.keyPlaceholder']}
                  autoCorrect="off"
                  spellCheck="false"
                />
                <input
                  className="add_keys_field add_keys_field_secret"
                  type="text"
                  value={this.state.secret}
                  name="secret"
                  autoComplete="off"
                  onChange={this.handleChange}
                  placeholder={this.props.intl.messages['dashboard.secretPlaceholder']}
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>
              {exchange === 'kucoin' && (
                <div className="add_keys_kucoin_field_wr">
                  <input
                    className="add_keys_field add_keys_field_name"
                    onChange={this.handleChange}
                    type="text"
                    value={this.state.passphrase}
                    name="passphrase"
                    placeholder={this.props.intl.messages['dashboard.passphrasePlaceholder']}
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              )}
            </div>
            <div className="keys_submit_wrapper">
              <LockButton
                offsetTop="calc(50% - 15px)"
                offsetLeft="-30px"
                {...apiKeys}
              >
                <input className="keys_submit" type="submit" value="Add key"/>
              </LockButton>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userId: state.auth.profile._id,
  exchanges: state.exchanges,
  is2FAEnable: state.auth.profile.mfaEnabled,
});

const mapDispatchToProps = {
  onApiKeyCreated: addApiKey,
  addQuickNotif,
  showTwoFactorAuthModal,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(AddApiKey));
