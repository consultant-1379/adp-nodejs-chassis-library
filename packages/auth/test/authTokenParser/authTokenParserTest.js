import { expect } from 'chai';
import { AuthTokenParser } from '../../src/index.js';
import { generateCookies } from '../mock/cookiesMock.js';
import parserConfig from './parserConfig.js';
import jwtData from './jwtData.js';

const { parserConfigCorrect, parserConfigInvalid } = parserConfig;

const DEFAULT_JWT_NAME = 'eric.adp.authz.proxy.token';

describe('Unit tests for authTokenParser.js', () => {
  describe('config interaction tests', () => {
    it('should be instantiated with default config if no config provided', () => {
      const parser = new AuthTokenParser();

      expect(parser.config.JWT_NAME).to.eq(DEFAULT_JWT_NAME);
    });
    it('should throw error if provided config is invalid', () => {
      const create = () => new AuthTokenParser(parserConfigInvalid);
      expect(create).to.throw();
    });
    it('should apply custom config if it is valid', () => {
      const parser = new AuthTokenParser(parserConfigCorrect);

      expect(parser.config.JWT_NAME).to.eq(parserConfigCorrect.JWT_NAME);
    });
  });

  describe('JWT parsing tests', () => {
    it('should retrieve required in config fields', () => {
      const parser = new AuthTokenParser(parserConfigCorrect);

      const jwt = jwtData[0];
      const cookies = generateCookies(jwt);
      const parsedCookies = parser.getJWTPayload(cookies);
      expect(parsedCookies.userName).to.eq(jwt.jwtPayload.name);
    });
  });
});
