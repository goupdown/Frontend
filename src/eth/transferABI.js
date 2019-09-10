export default [
  {
    'constant': false,
    'inputs': [{
      'name': 'to',
      'type': 'address'
    },
    {
      'name': 'value',
      'type': 'uint256'
    }],
    'name': 'transfer',
    'outputs': [{
      'name': 'success',
      'type': 'bool'
    }],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
];
