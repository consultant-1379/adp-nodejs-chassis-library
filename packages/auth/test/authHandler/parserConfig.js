const config = {
  JWT_SOURCE: 'Common',
  JWT_KEYS_MAP: [
    {
      tokenKey: 'upn',
      mappedKey: 'userName',
    },
    {
      tokenKey: 'auth_time',
      mappedKey: 'authTime',
    },
  ],
  JWT_NAME: 'eric.adp.authz.proxy.test.token',
  JWT_DELIMITTER: '.',
};

export default config;
