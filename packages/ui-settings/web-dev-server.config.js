/* eslint consistent-return:0 */
import { string } from 'rollup-plugin-string';
import { fromRollup } from '@web/dev-server-rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const replaceCss = fromRollup(string);
const commonJSPlugin = fromRollup(commonjs);
const nodeResolvePlugin = fromRollup(nodeResolve);
const nodePoly = fromRollup(nodePolyfills);

const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: {
    extensions: ['.mjs', '.cjs', '.js'],
    preferBuiltins: false,
  },
  open: './',
  watch: !hmr,
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
  mimeTypes: {
    '**/index.css': 'css',
    // es-module-shim will convert to cssStylesheet, import for definition needs to be a string
    // Force application/javascript mimetype for all other css files
    '**/*.css': 'js',
  },
  middleware: [
    // Middleware uses Koa syntax -> https://github.com/koajs/koa
    // Warning!!!: Don't use destructuring on context when reading values, throws errors
    function publicAssets(context, next) {
      // Don't mess with any of these requests
      const nonPublic = ['/src', '/node_modules', '/__web-dev-server'];
      for (const folder of nonPublic) {
        if (context.url.startsWith(folder)) {
          return next();
        }
      }

      // Send everything else to public folder
      context.url = `public${context.url}`;
      return next();
    },
    // Do not define any further middleware after this point
    // Anything marked with next will now be passed through
    // the web-dev-server middleware and compiled if needed.
  ],
});
