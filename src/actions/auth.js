import { apiPost, ApiError } from '../generic/apiCall';

export const LOGGED_OUT = 'LOGGED_OUT';
export const LOGGED_IN = 'LOGGED_IN';
export const NAME_REQUIRED = 'NAME_REQUIRED';
export const SET_NICKNAME = 'SET_NICKNAME';

export function logIn() {
  return dispatch => {
    window.web3.eth.getAccounts((err, accounts) => {
      const acc = accounts[0];
      if(!acc) {
        return;
      }
      let message;
      const userAgent = window.navigator.userAgent;
      if(userAgent.indexOf('Cipher') !== -1) {
        message = '0x4d657263617475734c6f67696e';
      } else {
        message = window.web3.sha3('\x19Ethereum Signed Message:\n13MercatusLogin');
      }
      window.web3.eth.sign(acc, message, (err, result) => {
        if(!err) {
          apiPost('/api/auth', null, {sgn: result, addr: acc})
            .then(json => {
              if(!json.name) {
                dispatch(nameRequiredAction());
              } else {
                dispatch(loggedInAction(json));
              }
            })
            .catch(err => alert(err.apiErrorCode));
        }
      });
    });
  };
}

export function addName(name) {
  return dispatch => {
    apiPost('/api/addName', null, {name})
      .then(response => {
        dispatch(loggedInAction(response));
      })
      .catch(e => {
        if(e.apiErrorCode) {
          switch(e.apiErrorCode) {
            case ApiError.FORBIDDEN:
              dispatch({
                type: 'LOGGED_OUT',
              });
              break;
            case ApiError.NAME_ALREADY_SET:
              alert('You cannot use that name, please enter another one');
              break;
            default:
              console.log('unhandled api error');
          }
        } else {
          console.log('failed to log in', e.description);
        }
      });
  };
}

export function setNicknameAction(name) {
  return {
    type: SET_NICKNAME,
    name
  };
}

function nameRequiredAction() {
  return {
    type: NAME_REQUIRED
  };
}

function loggedInAction(data) {
  return {
    type: LOGGED_IN,
    data
  };
}



