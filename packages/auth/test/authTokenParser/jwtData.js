const jwtData = [
  {
    jwtName: 'eric.adp.authz.proxy.test.token',
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    },
    jwtSignature: 'encodedSignatureImmitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'SESSION_ID=e0606461-b069-4a24-8778-816ff216cb79',
  },
];

export default jwtData;
