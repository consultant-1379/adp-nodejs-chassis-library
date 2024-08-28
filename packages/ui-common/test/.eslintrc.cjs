module.exports = {
  rules: {
    'max-classes-per-file': 0,
    'global-require': 0,
    'import/no-relative-packages': 'off',

    // devDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.*'],
      },
    ],
  },
};
