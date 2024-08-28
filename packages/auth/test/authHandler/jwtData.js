const JWT_NAME = 'eric.adp.authz.proxy.test.token';

const jwtData = [
  {
    jwtName: JWT_NAME,
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      upn: 'Jane Doe',
      auth_time: 202210071250,
    },
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
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
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'authTime=20221007124500Z',
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
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: '',
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
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'userName=John Smith; eric.adp.authn.time.lastlogintime=20231007124600Z',
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
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
    additionalCookies: 'authTime=Dec 2, 2021, 11:59 AM',
  },
  {
    jwtName: JWT_NAME,
    jwtHeader: {
      alg: 'HS256',
      typ: 'JWT',
    },
    jwtPayload: {
      upn: 'John Doe',
    },
    jwtSignature: 'encodedSignatureImitationNotNeededToBeMoreDetailedForTest',
    delimitter: '.',
  },
];

export default jwtData;
