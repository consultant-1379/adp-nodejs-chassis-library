import { Validator } from 'jsonschema';

/**
 * Provides functionality to check the validity of given configurations
 * @private
 */
class SchemaValidator {
  constructor() {
    this.validator = new Validator();
  }

  /**
   * Checks the passed json with a given schema.
   *
   * @param {object} json - JSON object for validation.
   * @param {object} configSchema - Schema to validate object.
   * @returns {object} Result of validation.
   */
  validateConfig(json, configSchema) {
    const schema = configSchema;
    return this.validator.validate(json, schema);
  }
}

const schemaValidator = new SchemaValidator();
export { schemaValidator };
