const defaultTokenParserConfig = {
  JWT_SOURCE: 'IAM',
  JWT_KEYS_MAP: [
    {
      tokenKey: 'auth_time',
      mappedKey: 'authTime',
    },
    {
      tokenKey: 'upn',
      mappedKey: 'userName',
    },
    {
      tokenKey: 'sid',
      mappedKey: 'sessionId',
    },
    {
      tokenKey: 'exp',
      mappedKey: 'sessionExpire',
    },
  ],
  JWT_NAME: 'eric.adp.authz.proxy.token',
  JWT_DELIMITTER: '.',
};

export default defaultTokenParserConfig;
