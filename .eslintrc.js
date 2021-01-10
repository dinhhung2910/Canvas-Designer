module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
    'babel/new-cap': 0,
    'new-cap': [0, {'newIsCap': false, 'capIsNew': false}],
    'no-console': 'off',
    'quotes': [
      'error',
      'single',
    ],
    'indent': ['error', 2],
    // we want to avoid useless spaces
    'no-multi-spaces': ['error'],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 0,
  },
};
