/* eslint import/no-extraneous-dependencies:0 */
import { rmSync } from 'fs';
import { generateRollup, outDirectory } from '@eui/rollup-config-generator';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// just make sure our output dir is clean
try {
  rmSync(outDirectory, { recursive: true });
} catch (e) {
  // None exists
}

const userRollupConfig = {
  externals: [],
  importMap: {},
};

const { euisdkRollupConfig } = generateRollup(userRollupConfig);

euisdkRollupConfig.plugins.push(nodePolyfills());

export default [euisdkRollupConfig];
