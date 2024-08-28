import { string } from 'rollup-plugin-string';
import { fromRollup } from '@web/dev-server-rollup';
import { defaultReporter, summaryReporter } from '@web/test-runner';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

import CONSTANT from './test/test-utils/constants.js';
import reporter from './test/test-utils/reporter.js';

process.env.NODE_ENV = 'test';

const replaceCss = fromRollup(string);
const commonJSPlugin = fromRollup(commonjs);
const nodeResolvePlugin = fromRollup(nodeResolve);
const nodePoly = fromRollup(nodePolyfills);

export default {
  testRunnerHtml: (testFramework) =>
    `<html>
    <body>
      <!-- process variable needed for floating-ui. Falls over otherwise as files are not rolled up -->
      <script type="module"
        src="../../node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js"></script>
      <script type="module"
        src="../../node_modules/es-module-shims/dist/es-module-shims.js"></script>
      <script type="module-shim" src="${testFramework}"></script>
    </body>
  </html>`,
  coverage: true,
  coverageConfig: {
    exclude: ['**/node_modules/**/*', '**/web_modules/**/*', '**/npm/**/*', '**/locale/**'],
    include: ['**/src/**'],
  },
  nodeResolve: {
    extensions: ['.mjs', '.cjs', '.js'],
    preferBuiltins: false,
  },
  concurrentBrowsers: 1, // Not is base config
  browserStartTimeout: 300_000, // Not is base config
  mimeTypes: {
    '**/index.css': 'css',
    // es-module-shim will convert to cssStylesheet, import for definition needs to be a string
    // Force application/javascript mimetype for all other css files
    '**/*.css': 'js',
  },
  plugins: [
    replaceCss({ include: ['**/*.css', '**/*.json'] }),
    nodeResolvePlugin({
      extensions: ['.mjs', '.cjs', '.js'],
      preferBuiltins: false,
    }),
    commonJSPlugin({
      extensions: ['.js', '.cjs'],
      requireReturnsDefault: 'preferred',
    }),
    nodePoly(),
  ],
  files: 'test/**/*.test.js',
  reporters: [
    defaultReporter({ reportTestResults: false, reportTestProgress: true }),
    summaryReporter(),
    reporter(),
  ],
  testFramework: {
    config: {
      timeout: CONSTANT.ROOT_WAIT_TIMEOUT * 2,
    },
  },
  middleware: [
    function nodePolyfillFix(context, next) {
      if (context.url === '/node_modules/buffer/index.js') {
        // rollup-plugin-node-polyfills is incorrectly replacing global buffer with npm
        // version installed by another dependency which does not work.
        // Send it to the correct place.
        // Buffer installed as a sub-dependency of @wdio/cli
        context.redirect('/node_modules/rollup-plugin-node-polyfills/polyfills/buffer-es6.js');
        return next();
      }
      return next();
    },
  ],
};
