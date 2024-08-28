const JWT_NAME = 'eric.adp.authz.proxy.test.token';

const jwtData = [
  {
    jwtName: JWT_NAME,
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      upn: 'John Doe',
      auth_time: 202210071250,
    },
    jwtSignature: 'encodedSignatureImmitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'userName=John Smith; eric.adp.authn.lastlogintime=20221007124600Z',
  },
  {
    jwtName: JWT_NAME,
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      upn: 'John Doe',
      auth_time: 202210071250,
    },
    jwtSignature: 'encodedSignatureImmitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'authTime=202210071245',
  },
  {
    jwtName: JWT_NAME,
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      auth_time: 202210071245,
    },
    jwtSignature: 'encodedSignatureImmitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: '',
  },
];

export default jwtData;
