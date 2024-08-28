const encryptBase64 = (string) => Buffer.from(string).toString('base64');

const createJwt = ({ jwtName, jwtHeader, jwtPayload, jwtSignature, delimitter }) => {
  const headerEncoded = encryptBase64(JSON.stringify(jwtHeader));
  const payloadEncoded = encryptBase64(JSON.stringify(jwtPayload));
  const signatureEncoded = encryptBase64(JSON.stringify(jwtSignature));
  return `${jwtName}=${[headerEncoded, payloadEncoded, signatureEncoded].join(delimitter)}`;
};

export const generateCookies = (jwt) => `${jwt.additionalCookies}; ${createJwt(jwt)}`;
