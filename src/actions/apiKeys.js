import { ApiError } from '../generic/apiCall';
import defaultErrorHandler from '../generic/errorHandlers';
import { LOGGED_OUT } from '../actions/auth';
import {UPDATE_KEYS} from './dashboard';
import {SELECT_FUND} from './terminal';
import { ApiKeys } from '../generic/api';
import { showInfoModal } from './modal';
export const DELETE_API_KEY = 'DELETE_API_KEY';
export const ADD_API_KEY = 'ADD_API_KEY';
export const UPDATE_API_KEY = 'UPDATE_API_KEY';
export const UPDATE_API_KEY_BALANCE = 'UPDATE_API_KEY_BALANCE';

const KeysApi = new ApiKeys();

export function fetchKeys() {
  return dispatch => {
    KeysApi.fetch()
      .then(json => dispatch({
        type: UPDATE_KEYS,
        data: json.own
      }))
      .catch(err => {
        defaultErrorHandler(err, dispatch);
      });
  };
}

export function deleteApiKey(key, token2FA) {
  return async (dispatch, getState) => {
    await KeysApi.delete(key, token2FA)
      .then(() => {
        const selectedKey = getState().terminal.fund;
        const storageKey = JSON.parse(localStorage.getItem('terminal.selectedFund'));
        if (storageKey && storageKey._id === key._id) {
          localStorage.removeItem('terminal.selectedFund');
        }
        if (selectedKey && selectedKey._id === key._id) {
          const exchange = getState().terminal.exchange;
          const ownKeys = getState().apiKeys.ownKeys.filter(key => key.exchange === exchange);
          let currentKeyIndex = ownKeys.findIndex(k => k._id == selectedKey._id);
          let newSelectedKey = null;
          if (ownKeys.length > 1) {
            newSelectedKey = (currentKeyIndex == (ownKeys.length - 1) ? ownKeys[currentKeyIndex - 1] : ownKeys[currentKeyIndex + 1]);
          }
          dispatch({
            type: SELECT_FUND,
            fund: newSelectedKey
          });
        }
        dispatch({
          type: DELETE_API_KEY,
          apiKey: key,
        });
      })
      .catch(error => {
        if (error.apiErrorCode) {
          switch (error.apiErrorCode) {
            case ApiError.FORBIDDEN: {
              dispatch({
                type: LOGGED_OUT,
              });
              throw error;
              break;
            }
            case ApiError.KEY_IN_USE:
              dispatch(showInfoModal('theKeyIsInUse'));
              throw error;
              return;
            default:
              console.error('unhandled api error', error.apiErrorCode);
              throw error;
          }
        } else {
          console.error('error deleting key', error);
          throw error;
        }
      });
  };
}


export function addApiKey(key, token2FA) {
  return async (dispatch, getState) => {
    await KeysApi.add(key, token2FA)
      .then(json => {
        dispatch({
          type: ADD_API_KEY,
          apiKey: json,
        });
        const ownKeys = getState().apiKeys.ownKeys;
        if (ownKeys.length === 1) {
          dispatch({
            type: SELECT_FUND,
            fund: ownKeys[0]
          });
        }
      })
      .catch(error => {
        if(error.apiErrorCode) {
          switch(error.apiErrorCode) {
            case ApiError.INVALID_PARAMS_SET:
              dispatch(showInfoModal('invalidKeySecretPair'));
              throw error;
              return;
            case ApiError.UNIQUE_VIOLATION:
              dispatch(showInfoModal('thisKeyAlreadyInSystem'));
              throw error;
              return;
            default:
              dispatch(showInfoModal('failedToAddApiKey', {key: error.apiErrorCode}));
              console.error('unhandled api error', error.apiErrorCode);
              throw error;
          }
        }
      });
  };
}

export function updateApiKey(key) {
  return dispatch => {
    KeysApi.update(key)
      .then(apiKey => {
        dispatch({
          type: UPDATE_API_KEY,
          apiKey,
        });
      })
      .catch(err => {
        console.error(err.apiErrorCode);
      });
  };
}

export function updateKeyBalance(_id, balances, totalInBTC, totalInUSDT) {
  return {
    type: UPDATE_API_KEY_BALANCE,
    _id,
    balances,
    totalInBTC,
    totalInUSDT,
  };
}
