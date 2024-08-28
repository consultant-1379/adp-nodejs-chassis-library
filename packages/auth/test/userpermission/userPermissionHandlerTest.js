import { expect } from 'chai';
import userPermissionHandler from '../../src/userpermission/userPermissionHandler.js';
import CONSTANTS from '../../src/config/constants.js';

const { ALTERNATIVE_LAST_LOGIN_KEY, USER_NAME_KEY, LAST_LOGIN_TIME_KEY, DEFAULT_USERNAME } =
  CONSTANTS;

const getTime = (minutesAgo) => Math.floor((Date.now() - minutesAgo * 60000) / 1000) * 1000;

const upn = 'iam-user';
const usernameKey = 'preferred_username';
const lastLoginTimeKey = 'last-login-time';
const expectedLastLogin = new Date(getTime(1)).toISOString();
const lastLoginInput = `${expectedLastLogin.split('.')[0].replaceAll(/-|T|:/g, '')}Z`;
const alternateLastLogin = new Date(getTime(2)).toISOString();

const COOKIES = `${ALTERNATIVE_LAST_LOGIN_KEY}=${alternateLastLogin}`;

describe('Unit tests for userPermissionHandler.js', () => {
  it('returns user properties from the userInfo object by default keys', () => {
    userPermissionHandler.init({
      cookies: COOKIES,
      userInfo: {
        [USER_NAME_KEY]: upn,
        [LAST_LOGIN_TIME_KEY]: lastLoginInput,
      },
    });
    const user = userPermissionHandler.getUsername();
    const authTime = userPermissionHandler.getAuthTime();

    expect(user).to.eq(upn);
    expect(authTime).to.eq(expectedLastLogin);
  });

  it('returns user properties from the userInfo object by specified keys', () => {
    userPermissionHandler.init({
      cookies: COOKIES,
      userInfo: {
        [usernameKey]: upn,
        [lastLoginTimeKey]: lastLoginInput,
      },
      usernameKey,
      lastLoginTimeKey,
    });

    const user = userPermissionHandler.getUsername();
    const authTime = userPermissionHandler.getAuthTime();

    expect(user).to.eq(upn);
    expect(authTime).to.eq(expectedLastLogin);
  });

  it('returns default username and last login from cookies if specified keys are incorrect', () => {
    userPermissionHandler.init({
      cookies: COOKIES,
      userInfo: {
        [usernameKey]: upn,
        [lastLoginTimeKey]: lastLoginInput,
      },
      usernameKey: `${usernameKey}-incorrect`,
      lastLoginTimeKey: `${lastLoginTimeKey}-incorrect`,
    });

    const user = userPermissionHandler.getUsername();
    const authTime = userPermissionHandler.getAuthTime();

    expect(user).to.eq(DEFAULT_USERNAME);
    expect(authTime).to.eq(alternateLastLogin);
  });

  it('returns alternate data if no IAM and set in cookie', () => {
    userPermissionHandler.init({
      cookies: COOKIES,
      userInfo: {},
    });

    const user = userPermissionHandler.getUsername();
    const authTime = userPermissionHandler.getAuthTime();

    expect(user).to.eq(DEFAULT_USERNAME);
    expect(authTime).to.eq(alternateLastLogin);
  });

  it('returns the default values if no IAM and no Cookie', () => {
    userPermissionHandler.init({
      cookies: '',
      userInfo: {},
    });

    const user = userPermissionHandler.getUsername();
    const authTime = userPermissionHandler.getAuthTime();

    expect(user).to.eq(DEFAULT_USERNAME);
    expect(authTime).to.be.undefined;
  });
});
