const path = require('path');

module.exports = {
  // extends: ['@open-wc/eslint-config', "eslint-config-prettier"],
  rules: {
    // devDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [path.join(__dirname, '*.*'), path.join(__dirname, 'test/**')],
      },
    ],
    'sonarjs/no-nested-template-literals': 'off',
  },
};
