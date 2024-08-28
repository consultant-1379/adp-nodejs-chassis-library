module.exports = {
  extends: ['airbnb-base', '@open-wc/eslint-config', 'prettier', 'plugin:sonarjs/recommended'],
  plugins: ['lit', 'prettier', 'chai-friendly', 'sonarjs', 'jsdoc'],
  globals: {},
  parserOptions: {
    ecmaVersion: 'latest',
  },
  ignorePatterns: ['**/test-output/*', '*/**/*.cjs'],
  rules: {
    // Tries to force static, static methods can't be overridden when extending class
    'class-methods-use-this': 0,
    'import/no-unresolved': 0,
    // reassigning CustomEvent detail is common pattern
    'no-param-reassign': 0,
    'lit-a11y/click-events-have-key-events': 0,
    // as project is small, many files that will export multiple only export one thing
    'import/prefer-default-export': 0,
    'max-classes-per-file': 0,
    'no-restricted-syntax': 0,
    // disagree with these
    'no-underscore-dangle': 0,
    'import/extensions': 0,

    'linebreak-style': 0,
    'no-console': 0,
    'no-shadow': ['error', { hoist: 'all' }],

    'prettier/prettier': ['error'],

    // lit-html rules : https://github.com/43081j/eslint-plugin-lit
    'lit/no-duplicate-template-bindings': 2,
    'lit/no-template-bind': 2,
    'lit/no-template-map': 2,
    'lit/attribute-value-entities': 2,
    'lit/binding-positions': 2,
    'lit/no-invalid-html': 2,
    'lit/no-useless-template-literals': 2,

    // need for test's expect()
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,

    // devDependencies
    'non-void-html-element-start-tag-with-trailing-solidus': 0,
    'import/no-extraneous-dependencies': [
      2,
      {
        devDependencies: ['plms/**/*.*', 'scripts/*.*'],
      },
    ],

    'no-empty': 'error',
    curly: ['error', 'all'],
  },
  env: {
    node: true,
    mocha: true,
  },
  overrides: [
    {
      files: ['packages/*/src/**/*.js'],
      settings: {
        jsdoc: {
          ignorePrivate: true,
          tagNamePreference: {
            augments: 'extends',
          },
        },
      },
      rules: {
        'jsdoc/check-alignment': 1,
        'jsdoc/check-indentation': 1,
        'jsdoc/check-param-names': 2,
        'jsdoc/check-property-names': 1,
        'jsdoc/check-syntax': 1,
        'jsdoc/check-tag-names': 2,
        'jsdoc/check-types': 2,
        'jsdoc/empty-tags': 1,
        'jsdoc/implements-on-classes': 1,
        'jsdoc/multiline-blocks': ['warn', { noFinalLineText: true }],
        'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
        'jsdoc/no-bad-blocks': 1,
        'jsdoc/no-undefined-types': 1,
        'jsdoc/require-asterisk-prefix': 1,
        'jsdoc/require-description-complete-sentence': [
          2,
          { abbreviations: ['etc', 'e.g.', 'i.e.'] },
        ],
        'jsdoc/require-hyphen-before-param-description': [
          'warn',
          'always',
          { tags: { '*': 'never', property: 'always' } },
        ],
        'jsdoc/require-param-description': 1,
        'jsdoc/require-param-name': 1,
        'jsdoc/require-param-type': 1,
        'jsdoc/require-property': 1,
        'jsdoc/require-property-description': 1,
        'jsdoc/require-property-name': 1,
        'jsdoc/require-property-type': 1,
        'jsdoc/require-returns': 1,
        'jsdoc/require-returns-check': 2,
        'jsdoc/require-returns-description': 1,
        'jsdoc/require-returns-type': 1,
        'jsdoc/require-throws': 1,
        'jsdoc/require-yields': 1,
        'jsdoc/require-yields-check': 1,
        'jsdoc/valid-types': 1,
      },
    },
  ],
};
