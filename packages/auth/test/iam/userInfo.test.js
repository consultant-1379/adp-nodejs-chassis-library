import { expect } from 'chai';
import * as td from 'testdouble';
import CONSTANTS from '../../src/config/constants.js';

const { LOGIN_TIME_PARSED_TOKEN_KEY } = CONSTANTS;

const defaultFetchMock = () => ({
  ok: true,
  json: async () => ({}),
});

const certificateManagerMock = {
  getTLSOptions: () => {},
};

const IAM_SERVICE_NAME = 'iam';
const REALMS = {
  REALM_FROM_CONFIG: 'realm-from-config',
  REALM_FROM_COOKIE: 'realm-from-cookie',
};
const LAST_LOGIN_TIME_ORIGINAL_KEY = 'last-login-time';
const UID = '11-22-33-44';
const USER_NAME = 'Jane Doe';

const encode = (object) =>
  Buffer.from(JSON.stringify(object)).toString('base64').replaceAll('=', '');

const HOST = 'iam.ericsson.com';
const HTTP_PROTOCOL = 'http';
const HTTPS_PROTOCOL = 'https';
const URL = `${HTTPS_PROTOCOL}://${HOST}`;
const MANUAL_HOST = 'auth.service.com';

const LAST_LOGIN_TOKEN_TIME = new Date(Date.now() - 60000).toISOString();
const LAST_LOGIN_TIME_REQUEST = new Date(Date.now() - 120000).toISOString();

const TOKEN_FROM_COOKIE = `fromcookieheader.${encode({
  iss: URL,
  [LOGIN_TIME_PARSED_TOKEN_KEY]: LAST_LOGIN_TOKEN_TIME,
})}.checksum`;
const TOKEN_FROM_HEADER = `fromheaderheader.${encode({ iss: URL })}.checksum`;

const ORIGINAL_USERNAME_KEYS = ['user-name', 'fullName'];
const ORIGINAL_LOGIN_TIME_KEYS = ['user-last-login-time', 'lastAuthTime'];
const ORIGINAL_USERID_KEYS = ['user-id', 'id'];
const USERNAME_RESPONSE_KEY = 'userName';
const LAST_LOGIN_TIME_RESPONSE_KEY = 'userLastLogin';
const USER_ID_RESPONSE_KEY = 'uid';

const SERVICE_NAME = 'service-1';
const IAM_TLS_CONFIG = {
  tlsPort: 8888,
  iamServiceName: IAM_SERVICE_NAME,
  serviceName: SERVICE_NAME,
  fieldMappings: {
    [USERNAME_RESPONSE_KEY]: ORIGINAL_USERNAME_KEYS,
    [LAST_LOGIN_TIME_RESPONSE_KEY]: ORIGINAL_LOGIN_TIME_KEYS,
    [USER_ID_RESPONSE_KEY]: ORIGINAL_USERID_KEYS,
  },
  responseKeys: {
    userNameKey: USERNAME_RESPONSE_KEY,
    loginTimeKey: LAST_LOGIN_TIME_RESPONSE_KEY,
    userIdKey: USER_ID_RESPONSE_KEY,
  },
};

const IAM_NON_TLS_CONFIG = {
  serviceName: SERVICE_NAME,
  hostName: MANUAL_HOST,
  nonTLSMode: true,
  fieldMappings: {
    [LAST_LOGIN_TIME_RESPONSE_KEY]: ORIGINAL_LOGIN_TIME_KEYS,
  },
  responseKeys: {
    loginTimeKey: LAST_LOGIN_TIME_RESPONSE_KEY,
  },
};

const VALID_COOKIE = `eric.adp.authz.proxy.token=${TOKEN_FROM_COOKIE}; eric.adp.authn.kc.realm=${REALMS.REALM_FROM_COOKIE}; `;
const VALID_BEARER_TOKEN = `Bearer ${TOKEN_FROM_HEADER}`;

describe('Unit tests for UserInfo.js', () => {
  let IamUserInfo;
  let fakeFetch;

  const mockModules = async (fetchMockExec = defaultFetchMock) => {
    fakeFetch = td.func();

    await td.replaceEsm('@adp/utilities/networkUtil', {
      fetchResponsesForProtocol: fakeFetch,
    });
    td.when(fakeFetch(), { ignoreExtraArgs: true }).thenDo(fetchMockExec);

    IamUserInfo = (await import('../../src/iam/UserInfo.js')).default;
  };

  describe('Check request parameters', () => {
    beforeEach(async () => {
      await mockModules();
    });

    it('can get Realm from the IAM cookie', async () => {
      const iamUserInfo = new IamUserInfo({
        iamConfig: IAM_TLS_CONFIG,
        certificateManager: certificateManagerMock,
      });

      await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      const fetchExpl = td.explain(fakeFetch);
      const { headers, protocol, url } = fetchExpl.calls[0].args[0];

      expect(headers.Authorization).to.eq(`Bearer ${TOKEN_FROM_COOKIE}`);
      expect(headers.Host).to.eq(HOST);
      expect(protocol).to.eq(HTTPS_PROTOCOL);
      expect(url).to.eq(
        `${IAM_SERVICE_NAME}-http:8888/auth/realms/${REALMS.REALM_FROM_COOKIE}/protocol/openid-connect/userinfo`,
      );
    });

    it('can get Realm from config', async () => {
      const iamUserInfo = new IamUserInfo({
        iamConfig: { ...IAM_TLS_CONFIG, realmName: REALMS.REALM_FROM_CONFIG },
      });

      await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      const fetchExpl = td.explain(fakeFetch);
      const { url } = fetchExpl.calls[0].args[0];

      expect(url).to.eq(
        `${IAM_SERVICE_NAME}-http:8888/auth/realms/${REALMS.REALM_FROM_CONFIG}/protocol/openid-connect/userinfo`,
      );
    });

    it('can use default IAM TLS port', async () => {
      const iamUserInfo = new IamUserInfo({ iamConfig: { ...IAM_TLS_CONFIG, tlsPort: undefined } });

      await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      const fetchExpl = td.explain(fakeFetch);
      const { url } = fetchExpl.calls[0].args[0];

      expect(url).to.eq(
        `${IAM_SERVICE_NAME}-http:8444/auth/realms/${REALMS.REALM_FROM_COOKIE}/protocol/openid-connect/userinfo`,
      );
    });

    it('generates appropriate url for non-TLS mode', async () => {
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_NON_TLS_CONFIG });

      await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      const fetchExpl = td.explain(fakeFetch);
      const { url } = fetchExpl.calls[0].args[0];

      expect(url).to.eq(
        `${MANUAL_HOST}/auth/realms/${REALMS.REALM_FROM_COOKIE}/protocol/openid-connect/userinfo`,
      );
    });

    [HTTP_PROTOCOL, HTTPS_PROTOCOL].forEach((configProtocol) => {
      it(`use appropriate protocol from the configurations`, async () => {
        const iamUserInfo = new IamUserInfo({
          iamConfig: { ...IAM_NON_TLS_CONFIG, protocol: configProtocol },
        });

        await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
        const fetchExpl = td.explain(fakeFetch);
        const { url, protocol } = fetchExpl.calls[0].args[0];

        expect(protocol).to.eq(configProtocol);
        expect(url).to.eq(
          `${MANUAL_HOST}/auth/realms/${REALMS.REALM_FROM_COOKIE}/protocol/openid-connect/userinfo`,
        );
      });
    });

    it('can get Bearer token from Auth header', async () => {
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      await iamUserInfo.fetchData({ cookie: VALID_COOKIE, authorization: VALID_BEARER_TOKEN });
      const fetchExpl = td.explain(fakeFetch);
      const { headers } = fetchExpl.calls[0].args[0];

      expect(headers.Authorization).to.eq(`Bearer ${TOKEN_FROM_HEADER}`);
    });

    it('can get Bearer token from IAM cookie if Auth header has Basic auth', async () => {
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      await iamUserInfo.fetchData({
        cookie: VALID_COOKIE,
        authorization: `Basic ${TOKEN_FROM_HEADER}`,
      });
      const fetchExpl = td.explain(fakeFetch);
      const { headers } = fetchExpl.calls[0].args[0];

      expect(headers.Authorization).to.eq(`Bearer ${TOKEN_FROM_COOKIE}`);
    });

    it('can get Bearer token from IAM cookie if Auth header is empty', async () => {
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      await iamUserInfo.fetchData({
        cookie: VALID_COOKIE,
        authorization: null,
      });
      const fetchExpl = td.explain(fakeFetch);
      const { headers } = fetchExpl.calls[0].args[0];

      expect(headers.Authorization).to.eq(`Bearer ${TOKEN_FROM_COOKIE}`);
    });
  });

  describe('Check fetchData() returns expected data', () => {
    it('can return appropriate userInfo if IAM response is empty', async () => {
      await mockModules();
      const iamUserInfo = new IamUserInfo({
        iamConfig: IAM_TLS_CONFIG,
      });

      const userInfo = await iamUserInfo.fetchData({ cookie: VALID_COOKIE });

      expect(userInfo).to.deep.eq({
        [LAST_LOGIN_TIME_RESPONSE_KEY]: LAST_LOGIN_TOKEN_TIME,
      });
    });

    it(`can return ${LAST_LOGIN_TIME_ORIGINAL_KEY} from response even if it is in the cookie`, async () => {
      const customFetchMock = async () => ({
        ok: true,
        json: async () => ({
          [ORIGINAL_LOGIN_TIME_KEYS[0]]: LAST_LOGIN_TIME_REQUEST,
        }),
      });
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      const userInfo = await iamUserInfo.fetchData({ cookie: VALID_COOKIE });

      expect(userInfo).to.deep.eq({
        [ORIGINAL_LOGIN_TIME_KEYS[0]]: LAST_LOGIN_TIME_REQUEST,
        [LAST_LOGIN_TIME_RESPONSE_KEY]: LAST_LOGIN_TIME_REQUEST,
      });
    });

    it(`can omit ${LAST_LOGIN_TIME_RESPONSE_KEY} if it is not available anywhere`, async () => {
      await mockModules();
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      const userInfo = await iamUserInfo.fetchData({
        cookie: `eric.adp.authz.proxy.token=${TOKEN_FROM_HEADER}; eric.adp.authn.kc.realm=${REALMS.REALM_FROM_COOKIE}; `,
      });

      expect(userInfo[LAST_LOGIN_TIME_RESPONSE_KEY]).to.be.undefined;
    });

    it('return correct userInfo data according to the fieldMappings config', async () => {
      const expectedUserInfo = {
        [ORIGINAL_USERID_KEYS[1]]: UID,
        [ORIGINAL_USERNAME_KEYS[1]]: USER_NAME,
        [ORIGINAL_LOGIN_TIME_KEYS[1]]: LAST_LOGIN_TIME_REQUEST,
        [LAST_LOGIN_TIME_RESPONSE_KEY]: LAST_LOGIN_TIME_REQUEST,
        [USER_ID_RESPONSE_KEY]: UID,
        [USERNAME_RESPONSE_KEY]: USER_NAME,
      };
      const customFetchMock = async () => ({
        ok: true,
        json: async () => ({
          [ORIGINAL_USERID_KEYS[1]]: UID,
          [ORIGINAL_USERNAME_KEYS[1]]: USER_NAME,
          [ORIGINAL_LOGIN_TIME_KEYS[1]]: LAST_LOGIN_TIME_REQUEST,
        }),
      });
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      const userInfo = await iamUserInfo.fetchData({ cookie: VALID_COOKIE });

      expect(userInfo).to.deep.eq(expectedUserInfo);
    });

    it("returns original userInfo data and lastLoginTime from cookies if fieldMappings keys don't match with the original response", async () => {
      const originalResponse = {
        different_user_id: UID,
        different_user_name: USER_NAME,
        different_user_last_login: LAST_LOGIN_TIME_REQUEST,
      };
      const expectedUserInfo = {
        ...originalResponse,
        [LAST_LOGIN_TIME_RESPONSE_KEY]: LAST_LOGIN_TOKEN_TIME,
      };
      const customFetchMock = async () => ({
        ok: true,
        json: async () => originalResponse,
      });
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      const userInfo = await iamUserInfo.fetchData({ cookie: VALID_COOKIE });

      expect(userInfo).to.deep.eq(expectedUserInfo);
    });

    it('can handle thrown error in fetchResponsesForProtocol', async () => {
      const errMessage = 'Service Unavailable';
      const errStatus = 503;
      const customFetchMock = async () => {
        const err = new Error(errMessage);
        err.status = errStatus;
        throw err;
      };
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      let error;
      try {
        await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an('error');
      expect(error.message).to.be.equal(errMessage);
      expect(error.status).to.be.equal(errStatus);
    });

    it('can handle 404 response returned by IAM', async () => {
      const customFetchMock = async () => ({ ok: false, status: 404 });
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      let error;
      try {
        await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an('error');
      expect(error.status).to.be.equal(404);
    });

    it('handles if mTLS is turned off', async () => {
      const customFetchMock = async ({ url }) => {
        if (url.includes(MANUAL_HOST)) {
          return { ok: true, json: async () => ({}) };
        }
        return { ok: false, json: async () => ({}) };
      };
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_NON_TLS_CONFIG });

      const userInfo = await iamUserInfo.fetchData({ cookie: VALID_COOKIE });

      expect(userInfo).to.deep.equal({ [LAST_LOGIN_TIME_RESPONSE_KEY]: LAST_LOGIN_TOKEN_TIME });
    });
  });

  describe('Check getUsername() returns expected data', () => {
    it('can get username', async () => {
      const customFetchMock = async () => ({
        ok: true,
        json: async () => ({
          [ORIGINAL_USERID_KEYS[0]]: UID,
          [ORIGINAL_USERNAME_KEYS[0]]: USER_NAME,
          [ORIGINAL_LOGIN_TIME_KEYS[0]]: LAST_LOGIN_TIME_REQUEST,
        }),
      });
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      const userName = await iamUserInfo.getUsername({ cookie: VALID_COOKIE });
      expect(userName).to.be.equal(USER_NAME);
    });

    it('can handle thrown error in fetchResponsesForProtocol', async () => {
      const customFetchMock = async () => {
        const err = new Error();
        err.status = 501;
        throw err;
      };
      await mockModules(customFetchMock);
      const iamUserInfo = new IamUserInfo({ iamConfig: IAM_TLS_CONFIG });

      let error;
      try {
        await iamUserInfo.fetchData({ cookie: VALID_COOKIE });
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an('error');
      expect(error.status).to.be.equal(501);
    });
  });

  it('handles if IAM is turned off', async () => {
    await mockModules();
    const iamUserInfo = new IamUserInfo({});

    let error1;
    try {
      await iamUserInfo.fetchData();
    } catch (err) {
      error1 = err;
    }

    expect(error1).to.be.an('error');
    expect(error1.status).to.eq(401);

    let error2;
    try {
      await iamUserInfo.fetchData({
        cookies: '',
      });
    } catch (err) {
      error2 = err;
    }

    expect(error2).to.be.an('error');
    expect(error2.status).to.eq(401);
  });
});
