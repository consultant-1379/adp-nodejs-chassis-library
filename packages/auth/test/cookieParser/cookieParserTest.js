import { expect } from 'chai';
import { parseSingleCookieByName } from '../../src/cookieParser/cookieParser.js';
import { generateCookies } from '../mock/cookiesMock.js';
import jwtData from './jwtData.js';

const USERNAME = 'John Smith';
const LAST_LOGIN_TIME = '20221007124600Z';

describe('Unit tests for cookieParser.js', () => {
  it('should parse cookies from additional cookies', () => {
    const cookies = generateCookies(jwtData[0]);

    const username = parseSingleCookieByName('userName', cookies);
    expect(username).to.eq(USERNAME);

    const lastLoginTime = parseSingleCookieByName('eric.adp.authn.lastlogintime', cookies);
    expect(lastLoginTime).to.eq(LAST_LOGIN_TIME);
  });
});
