import React from 'react';
import PropTypes from 'prop-types';
import ContractDetails from './ContractDetails';
import SelectApiKey from './SelectApiKey';
import ContractSent from './ContractSent';
import { connect } from 'react-redux';
import { sendOffer } from '../actions/offers';
import { clearRequest } from '../actions/request';
import { Redirect } from 'react-router-dom';

const SEND_REQUEST_BLOCK_DETAILS = 0;
const SEND_REQUEST_BLOCK_SELECT_API = 1;
const SEND_REQUEST_BLOCK_SENT = 2;
const REDIRECT_TO_DASHBOARD = 3;

class SendRequestBlock extends React.Component {

  constructor(props) {
    super(props);
    this.state = {visibleBlock: SEND_REQUEST_BLOCK_DETAILS, selectedApiKey: null};
    this.onApiKeySelected = apiKey => this.setState({selectedApiKey: apiKey});
    this.onSendOfferClick = this.onSendOfferClick.bind(this);
  }

  onSendOfferClick() {
    if(!this.state.selectedApiKey) {
      alert('select api key first');
      return;
    }
    const keyId = this.state.selectedApiKey._id;
    const offer = {
      keyId,
      to: this.props.profile._id,
      amount: this.props.profile.minAmount,
      currency: this.props.profile.currency,
      maxLoss: this.props.profile.maxLoss,
      fee: this.props.profile.fee,
      duration: this.props.profile.duration,
      roi: this.props.profile.roi,
      toUser: [{name: this.props.profile.name, _id: this.props.profile._id}],
    };
    this.props.sendOffer(offer);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.request.sendOffer === 'success') {
      this.setState({visibleBlock: SEND_REQUEST_BLOCK_SENT});
    } else if(this.state.visibleBlock === SEND_REQUEST_BLOCK_SENT) {
      this.setState({visibleBlock: REDIRECT_TO_DASHBOARD});
    }
  }

  render() {
    const profile = this.props.profile;
    const contractSettings = profile.contractSettings;
    switch(this.state.visibleBlock) {
      case SEND_REQUEST_BLOCK_DETAILS: {
        return (
          <ContractDetails
            onOfferSendClick={() => this.setState({visibleBlock: SEND_REQUEST_BLOCK_SELECT_API})}
            availableForOffers={profile.available}
            duration={contractSettings.duration}
            amount={contractSettings.minAmount}
            currency={contractSettings.currency}
            maxLoss={contractSettings.maxLoss}
            fee={contractSettings.fee}
            roi={contractSettings.roi}
          />
        );
      }
      case SEND_REQUEST_BLOCK_SELECT_API: {
        return (
          <SelectApiKey
            onOfferSendClick={this.onOfferSendClick}
            exchanges={this.props.exchanges}
            apiKeys={this.props.apiKeys}
            rates={this.props.rates}
            currency={contractSettings.currency}
            selectedApiKey={this.state.selectedApiKey}
            onCancelClick={() => this.setState({visibleBlock:SEND_REQUEST_BLOCK_DETAILS})}
            onSendOfferClick={this.onSendOfferClick}
            onApiKeySelected={this.onApiKeySelected}
          />
        );
      }
      case SEND_REQUEST_BLOCK_SENT: {
        return (
          <ContractSent
            onButtonClick={this.props.onGotItClick}
          />
        );
      }
      case REDIRECT_TO_DASHBOARD:
        return <Redirect to="/dashboard" />;
      default:
        return null;
    }
  }

  componentWillUnmount() {
    if(this.props.request.sendOffer === 'success') {
      this.props.onGotItClick();
    }
  }
}

SendRequestBlock.propTypes = {
  apiKeys: PropTypes.array.isRequired,
  exchanges: PropTypes.array.isRequired,
  profile: PropTypes.object,
  onOfferSendClick: PropTypes.func,
  request: PropTypes.object,
  onGotItClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  apiKeys: state.apiKeys.ownKeys.filter(k => k.state === 'FREE'),
  exchanges: state.exchanges,
  request: state.request,
  rates: state.rates,
});

const mapDispatchToProps = dispatch => ({
  sendOffer: offer => dispatch(sendOffer(offer)),
  onGotItClick: () => dispatch(clearRequest('sendOffer')),
});


export default connect(mapStateToProps, mapDispatchToProps)(SendRequestBlock);
