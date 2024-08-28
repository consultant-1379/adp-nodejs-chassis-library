# Auth Package

Package contains features supporting or providing commonly required functionalities for
authentication process on frontend and backend side:

- parsing cookies for JWT token values - in dedicated module(AuthTokenParser) and as an
  application-level middleware for backend services usage(cookieParserMiddleware)

## Requirements

No specific requirements.

**Note** Package is configured to operate with ADP IAM based authentication services

## AuthTokenParser

### Configuration of AuthTokenParser

AuthTokenParser consumes config on instantiation, or it can be set on runtime. In both cases config
will be validated, and if incoming config will be invalid, previous config will be used instead.

Default config:

```json
{
  "JWT_SOURCE": "IAM",
  "JWT_KEYS_MAP": [
    {
      "tokenKey": "auth_time",
      "mappedKey": "authTime"
    },
    {
      "tokenKey": "upn",
      "mappedKey": "userName"
    },
    {
      "tokenKey": "sid",
      "mappedKey": "sessionId"
    },
    {
      "tokenKey": "exp",
      "mappedKey": "sessionExpire"
    }
  ],
  "JWT_NAME": "eric.adp.authz.proxy.token",
  "JWT_DELIMITTER": "."
}
```

- JWT_SOURCE - jwt issuer. Basically used to distinguish JWT processing flows one from another
- JWT_KEYS_MAP - used to transform abbreviated or shortened keys in token into human readable/required
  form.
- JWT_NAME - token name
- JWT_DELIMITTER - '.' header/payload/signature delimiter

For config all base-level fields ("JWT_SOURCE", "JWT_KEYS_MAP", "JWT_NAME", "JWT_DELIMITTER") are mandatory.

### Usage of AuthTokenParser

Basic usage with default config:

```javascript
import { AuthTokenParser } from '@adp/auth';

const parser = new AuthTokenParser(); // parser with default config

const { sessionId, userName } = parser.getJWTPayload(rawCookieString);
```

Setting custom configs:

```javascript
import { AuthTokenParser } from '@adp/auth';

const parser = new AuthTokenParser(customConfig); // parser with custom config

parser.config = customConfig; // parser with customConfig

const { sessionId, userName } = parser.getJWTPayload(rawCookieString);
```

## cookieParserMiddleware

app level middleware, parses request cookies and ads `_authCookie` field to it with JWT values

### Configuration of cookieParserMiddleware

Function getCookieParserMiddleware accepts same config object as AuthTokenParser.

### Usage of cookieParserMiddleware

```js
improt { getCookieParserMiddleware } from '@adp/auth';

const middleware = getCookieParserMiddleware(config);

app.use(middleware); // where app - is an express application

// for incoming request in routers value can be obtained as req._authCookie.userName
```
