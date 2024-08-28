import { expect } from 'chai';
import { AuthHandler } from '../../src/index.js';
import { generateCookies } from '../mock/cookiesMock.js';
import parserConfig from './parserConfig.js';
import jwtData from './jwtData.js';

const LAST_LOGIN_TIME_KEY = 'eric.adp.authn.time.lastlogintime';
const DEFAULT_USER_NAME = 'James Williams';

/**
 * Creates an AuthHandler instance based on parameters
 * If defaultUsername and lastLoginTimeKey not present then using AuthHandler's constructor default values except parserConfig
 */
function createAuthHandler({ jwt, defaultUsername, lastLoginTimeKey }) {
  const cookies = generateCookies(jwt);
  return defaultUsername && lastLoginTimeKey
    ? new AuthHandler({
        cookies,
        defaultUsername,
        lastLoginTimeKey,
        tokenParserConfig: parserConfig,
      })
    : new AuthHandler({ cookies, tokenParserConfig: parserConfig });
}

describe('Unit tests for authHandler.js', () => {
  describe('Cookie parsing tests', () => {
    it('should not retrieve username from additional cookies, only from the token', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[0] });
      const username = authHandler.getUsername();
      expect(username).to.eq('Jane Doe');
    });

    it('should retrieve username from jwt payload', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[1] });
      const username = authHandler.getUsername();
      expect(username).to.eq('John Doe');
    });

    it('should retrieve default username', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[2] });
      const username = authHandler.getUsername();
      expect(username).to.eq(' ');
    });

    it('should retrieve auth time from last login time (additional cookies)', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[0] });
      const authTime = authHandler.getAuthTime();
      expect(authTime).to.eq('2022-10-07T12:46:00.000Z');
    });

    it('should retrieve auth time as undefined (invalid date) from authTime (additional cookies)', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[1] });
      const authTime = authHandler.getAuthTime();
      expect(authTime).to.eq(undefined);
    });

    it('should retrieve auth time as undefined (no auth time available)', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[5] });
      const authTime = authHandler.getAuthTime();
      expect(authTime).to.eq(undefined);
    });

    it('should retrieve auth time from authTime (additional cookies)', () => {
      const authHandler = createAuthHandler({ jwt: jwtData[4] });
      const authTime = authHandler.getAuthTime();
      const inputTime = new Date(jwtData[4].additionalCookies.split('authTime=')).toISOString();
      expect(authTime).to.eq(inputTime);
    });

    it('should retrieve default username using AuthHandler defaults', () => {
      const authHandler = createAuthHandler({
        jwt: jwtData[2],
        defaultUsername: DEFAULT_USER_NAME,
        lastLoginTimeKey: LAST_LOGIN_TIME_KEY,
      });
      const username = authHandler.getUsername();
      expect(username).to.eq(DEFAULT_USER_NAME);
    });

    it('should retrieve auth time from last login time (additional cookies) using AuthHandler defaults', () => {
      const authHandler = createAuthHandler({
        jwt: jwtData[3],
        defaultUsername: DEFAULT_USER_NAME,
        lastLoginTimeKey: LAST_LOGIN_TIME_KEY,
      });
      const authTime = authHandler.getAuthTime();
      expect(authTime).to.eq('2023-10-07T12:46:00.000Z');
    });
  });
});
