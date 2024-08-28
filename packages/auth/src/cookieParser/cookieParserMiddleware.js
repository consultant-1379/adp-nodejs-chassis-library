import AuthTokenParser from './authTokenParser.js';

function getCookieParserMiddleware(authTokenParserConfig) {
  const parser = new AuthTokenParser(authTokenParserConfig);

  return (req, res, next) => {
    if (req._authCookie) {
      console.log('sessionCookies were already parsed');
      return next();
    }

    const rawCookie = req.headers.cookie;
    const parsedTokenValues = parser.getJWTPayload(rawCookie);
    if (parsedTokenValues) {
      req._authCookie = { ...parsedTokenValues };
    }
    return next();
  };
}

export { getCookieParserMiddleware };
