import React from 'react';
import Profile from './Profile';
import { connect } from 'react-redux';
import { updateExchanges } from '../../actions/exchanges';
import {updateContractSettings, getProfilePageInfo, toggleAvailable} from '../../actions/profile';
import {getExchangeRates} from '../../actions/terminal';

const mapStateToProps = state => ({
  auth: state.auth,
  exchangesInfo: state.exchangesInfo,
  profile: state.profile,
});

const mapDispatchToProps = {
  updateContractSettings,
  toggleAvailable,
  updateExchanges,
  getProfilePageInfo,
  getExchangeRates,
};

const ProfileContainer = connect(mapStateToProps, mapDispatchToProps)(Profile);

/**
 * Component for recreating profile component on user change
 *
 */
const ProfileWrapper = ({match}) => (
  <ProfileContainer key={match.params.id} name={match.params.id} />
);

export default ProfileWrapper;
