import { createRequire } from 'module';
import { Validator, validate } from 'jsonschema';

const require = createRequire(import.meta.url);
const manualServiceConfigSchema = require('./schemas/manualServiceConfig.json');

/**
 * Provides functionality to check the validity of given configurations
 * @private
 */
class SchemaValidator {
  /**
   * Checks the passed json with a given schema.
   *
   * @param {object} json - JSON object for validation.
   * @param {object} mainSchema - Schema to validate object.
   * @param {Array<object>} [additionalSchemaList] - Additional list of schema referenced by the main schema.
   * @returns {object} Result of validation.
   */
  validateConfig(json, mainSchema, additionalSchemaList = []) {
    const validator = new Validator();
    additionalSchemaList.forEach((schema) => validator.addSchema(schema));
    let result;
    try {
      result = validator.validate(json, mainSchema);
    } catch (error) {
      result = { valid: false, errors: error };
    }
    return result;
  }

  validateManualServiceConfig(json) {
    return validate(json, manualServiceConfigSchema);
  }
}

const schemaValidator = new SchemaValidator();

export default schemaValidator;
