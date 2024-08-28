const config = {
  parserConfigCorrect: {
    JWT_SOURCE: 'Common',
    JWT_KEYS_MAP: [
      {
        tokenKey: 'sub',
        mappedKey: 'subscription',
      },
      {
        tokenKey: 'name',
        mappedKey: 'userName',
      },
      {
        tokenKey: 'iat',
        mappedKey: 'time',
      },
    ],
    JWT_NAME: 'eric.adp.authz.proxy.test.token',
    JWT_DELIMITTER: '.',
  },
  parserConfigInvalid: {
    JWT_SOURCE: 'IAM',
    keys: [
      {
        tokenKey: 'auth_time',
        mappedKey: 'authTime',
      },
    ],
    name: 'eric.adp.authz.proxy.token',
    JWT_DELIMITTER: '.',
  },
};

export default config;
