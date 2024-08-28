import { expect } from 'chai';
import { createRequire } from 'module';
import schemaValidator from '../../src/utils/schemaValidator.js';

const require = createRequire(import.meta.url);
const originalJsonConfig = require('./mocks/config.mock.json');
const configSchema = require('./mocks/config-schema.mock.json');

const originalMainJsonConfig = require('./mocks/config.main.mock.json');
const mainConfigSchema = require('./mocks/config-schema.main.mock.json');

describe('Unit tests for schemaValidator.js', () => {
  it('can successfully validate a json file', () => {
    const result = schemaValidator.validateConfig(originalJsonConfig, configSchema);
    expect(result.valid).to.be.true;
  });

  it("can detect if json file doesn't fit the scheme", () => {
    // Deep-copy it as it can break other tests, since the same reference is used
    const jsonConfig = JSON.parse(JSON.stringify(originalJsonConfig));
    delete jsonConfig.serviceName;
    const result = schemaValidator.validateConfig(jsonConfig, configSchema);
    expect(result.valid).to.be.false;
    expect(result.errors[0].message).to.eq('requires property "serviceName"');
  });

  it('can support additional schema files', () => {
    // Deep-copy it as it can break other tests, since the same reference is used
    const jsonConfig = JSON.parse(JSON.stringify(originalMainJsonConfig));
    const result = schemaValidator.validateConfig(jsonConfig, mainConfigSchema, [configSchema]);
    expect(result.valid).to.be.true;
  });

  it('can support handle main schema with missing references', () => {
    // Deep-copy it as it can break other tests, since the same reference is used
    const jsonConfig = JSON.parse(JSON.stringify(originalMainJsonConfig));
    const result = schemaValidator.validateConfig(jsonConfig, mainConfigSchema);
    expect(result.valid).to.be.false;
  });
});
