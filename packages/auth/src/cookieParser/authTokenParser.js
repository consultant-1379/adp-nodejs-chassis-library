import { jwtDecode } from 'jwt-decode';
import * as jsonschema from 'jsonschema';
import tokenParserConfigSchema from '../schemas/tokenParserConfigSchema.js';
import defaultTokenParserConfig from '../config/defaultTokenParserConfig.js';
import ValidationError from './validationError.js';
import { parseSingleCookieByName } from './cookieParser.js';

const { Validator } = jsonschema;
const validator = new Validator();

/**
 * Decodes base-64 encoded jwt, according to configured jwt source. Parts of the token is denoted by the delimiter.
 * If source is 'IAM', the first part of the token is removed.
 *
 * @param {string} token - Token to be decoded. See {@link https://jwt.io/|link} for more info.
 * @param {ParserConfig} options - Parser options.
 * @returns {object} Decoded token payload.
 */
function decodeToken(token, { JWT_SOURCE, JWT_DELIMITTER }) {
  let source = token;
  if (JWT_SOURCE === 'IAM') {
    source = token.split(JWT_DELIMITTER).slice(1).join(JWT_DELIMITTER);
  }
  return jwtDecode(source);
}

/**
 * Maps token abbreviated keys into human readable/ required form.
 * Number and namings are set via config.
 *
 * @param {object} token - Object holds values of decoded token payload.
 * @param {object} tokenMapping - Mapping of token attributes to exported attributes.
 * @returns {object} Mapped token values according to parser config.
 */
function mapTokenValues(token, tokenMapping) {
  return tokenMapping.reduce((prev, curr) => {
    const { tokenKey, mappedKey } = curr;
    return { ...prev, ...{ [mappedKey]: token[tokenKey] } };
  }, {});
}

class AuthTokenParser {
  /**
   * @typedef {object} ParserConfig
   * @property {string} JWT_SOURCE - Source of JWT. IAM by default.
   * @property {Array} JWT_KEYS_MAP - Token abbreviations/required output keys map.
   * @property {string} JWT_NAME - Name of the cookie containing JWT.
   * @property {string} JWT_DELIMITTER - JWT header/payload/signature delimiter.
   */

  /**
   * Sets basic config.
   *
   * @param {ParserConfig} [config=defaultTokenParserConfig] - Basic config object. If not set using default value, which is compatible with IAM.
   * @throws {ValidationError} Throws ValidationError if provided config is invalid.
   */
  constructor(config = defaultTokenParserConfig) {
    const result = validator.validate(config, tokenParserConfigSchema);
    if (!result.valid) {
      throw new ValidationError('Provided config is invalid', result.errors);
    }
    this.config = config;
  }

  /**
   * Retrieves mapped token fields from request cookies.
   *
   * @param {string} cookies - Raw cookies from the request to be processed.
   * @param {string} [tokenName=this.config.JWT_NAME] - JWT token identifier.
   * @returns {object | boolean} Object with required in config values, or false if no token found.
   * @memberof AuthTokenParser
   */
  getJWTPayload(cookies, tokenName = this.config.JWT_NAME) {
    const token = parseSingleCookieByName(tokenName, cookies);
    if (token) {
      const tokenDecoded = decodeToken(token, this.config);
      return mapTokenValues(tokenDecoded, this.config.JWT_KEYS_MAP);
    }
    return false;
  }
}

export default AuthTokenParser;
