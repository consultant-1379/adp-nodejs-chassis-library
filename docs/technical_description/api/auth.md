# API documentation for auth package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>AuthHandler</code>

**Kind**: global class

### <code>new AuthHandler(options)</code>

Retrieves data from cookie parsing and jwt decoding.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>options</var> | <code>object</code> |  | Set of options. |
| <var>options.cookies</var> | <code>object</code> |  | Cookies to be processed. |
| <var>[options.defaultUsername]</var> | <code>string</code> | `"DEFAULT_USERNAME"` | Retrieved username when other options not available. |
| <var>[options.lastLoginTimeKey]</var> | <code>string</code> | `"DEFAULT_LAST_LOGIN_TIME_KEY"` | Key of the last login time in the cookie. |
| <var>[options.tokenParserConfig]</var> | <code>object</code> | `defaultTokenParserConfig` | Basic config object. If not set using default value, which is compatible with IAM. |

### <code>authHandler.getUsername()</code>

Retrieves username with three fallback options.

- Cookie extracting using `userName`.
- JWT decoding.
- Default username.

**Kind**: instance method of [`AuthHandler`](#AuthHandler)\
**Returns**: <code>string</code> - Retrieved username.

### <code>authHandler.getAuthTime()</code>

Parsing last login time or authentication time from cookies.

**Kind**: instance method of [`AuthHandler`](#AuthHandler)\
**Returns**: <code>string</code> \| <code>undefined</code> - Retrieved last login time or authentication time or undefined if the input is invalid.

## <code>AuthTokenParser</code>

**Kind**: global class

### <code>new AuthTokenParser([config])</code>

Sets basic config.

**Throws**:

- <code>ValidationError</code> Throws ValidationError if provided config is invalid.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>[config]</var> | [`ParserConfig`](#ParserConfig) | `defaultTokenParserConfig` | Basic config object. If not set using default value, which is compatible with IAM. |

### <code>authTokenParser.getJWTPayload(cookies, [tokenName])</code>

Retrieves mapped token fields from request cookies.

**Kind**: instance method of [`AuthTokenParser`](#AuthTokenParser)\
**Returns**: <code>object</code> \| <code>boolean</code> - Object with required in config values, or false if no token found.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>cookies</var> | <code>string</code> |  | Raw cookies from the request to be processed. |
| <var>[tokenName]</var> | <code>string</code> | `"this.config.JWT_NAME"` | JWT token identifier. |

## <code>IamUserInfo</code>

**Kind**: global class

### <code>new IamUserInfo(options)</code>

Retrieves data from cookie parsing and jwt decoding.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>options</var> | <code>object</code> |  | Set of options. |
| <var>options.iamConfig</var> | [`IamConfig`](#IamConfig) |  | Configurations for fetching user information from IAM. |
| <var>options.certificateManager</var> | <code>object</code> |  | CertificateManager instance. |
| <var>[options.tokenParserConfig]</var> | <code>object</code> | `defaultTokenParserConfig` | Basic config object. If not set using default value, which is compatible with IAM. |
| <var>[options.telemetryService]</var> | <code>object</code> |  | The instance of the DST Service which will be used for telemetry. |

### <code>iamUserInfo.getUsername(options)</code>

Retrieves user name from IAM.

**Kind**: instance method of [`IamUserInfo`](#IamUserInfo)\
**Returns**: <code>Promise.&lt;object&gt;</code> - `userName` property contains username according
to the `fieldMappings` and `responseKeys` configurations. `error` property
fills if the request isn't successfull.

**Throws**:

- <code>Error</code> Throws Error if token don't pass the check or request to the IAM fails.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | [`AuthOptions`](#AuthOptions) | Set of options. |

### <code>iamUserInfo.fetchData(options)</code>

Retrieves user information from IAM.

**Kind**: instance method of [`IamUserInfo`](#IamUserInfo)\
**Returns**: <code>Promise.&lt;object&gt;</code> - `userInfo` property contains fetched data in addition
to the fields normalized by `fieldMappings` configuration. `error` property fills
if the request isn't successfull.

**Throws**:

- <code>Error</code> Throws Error if token don't pass the check or request to the IAM fails.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | [`AuthOptions`](#AuthOptions) | Set of options. |

### <code>iamUserInfo.authHeaderCheck(options)</code>

Checks access token.

**Kind**: instance method of [`IamUserInfo`](#IamUserInfo)

**Throws**:

- <code>Error</code> Throws Error if the token from cookies or authorization isn't valid.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | [`AuthOptions`](#AuthOptions) | Set of options. |

## <code>decodeToken(token, options)</code>

Decodes base-64 encoded jwt, according to configured jwt source. Parts of the token is denoted by the delimiter.
If source is 'IAM', the first part of the token is removed.

**Kind**: global function\
**Returns**: <code>object</code> - Decoded token payload.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>token</var> | <code>string</code> | Token to be decoded. See [link](https://jwt.io/) for more info. |
| <var>options</var> | [`ParserConfig`](#ParserConfig) | Parser options. |

## <code>mapTokenValues(token, tokenMapping)</code>

Maps token abbreviated keys into human readable/ required form.
Number and namings are set via config.

**Kind**: global function\
**Returns**: <code>object</code> - Mapped token values according to parser config.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>token</var> | <code>object</code> | Object holds values of decoded token payload. |
| <var>tokenMapping</var> | <code>object</code> | Mapping of token attributes to exported attributes. |

## <code>parseSingleCookieByName(name, rawCookies)</code>

Extracts cookie with provided name from cookies string.
Cookies are supposed to be separated with "; ".

**Kind**: global function\
**Returns**: <code>string</code> - Extracted cookie. Still encoded though.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>name</var> | <code>string</code> | Cookie name that holds jwt. |
| <var>rawCookies</var> | <code>string</code> | Cookies to be processed. |

## <code>ParserConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>JWT_SOURCE</var> | <code>string</code> | Source of JWT. IAM by default. |
| <var>JWT_KEYS_MAP</var> | <code>Array</code> | Token abbreviations/required output keys map. |
| <var>JWT_NAME</var> | <code>string</code> | Name of the cookie containing JWT. |
| <var>JWT_DELIMITTER</var> | <code>string</code> | JWT header/payload/signature delimiter. |

## <code>IamConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| <var>serviceName</var> | <code>string</code> |  | Service for which tlsOptions must be obtained from the CertificateManager. |
| <var>iamServiceName</var> | <code>string</code> |  | Name of the IAM service. Used for request URL. |
| <var>[protocol]</var> | <code>number</code> | `https` | Protocol to connect IAM service. |
| <var>[tlsPort]</var> | <code>number</code> | `8444` | Port for TLS connection to the IAM service. |
| <var>[realmName]</var> | <code>string</code> |  | Realm name. Used for request URL. |
| <var>[nonTLSMode]</var> | <code>boolean</code> |  | Enables non-TLS mode. |
| <var>[hostName]</var> | <code>string</code> |  | Hostname to fetch the request in case of non-TLS mode. |
| <var>[fieldMappings]</var> | <code>object</code> | `{}` | Keys are expected normalized fields, values are possible field names of the original response. |
| <var>[responseKeys]</var> | <code>object</code> | `{}` | Keys for expected normalized fields. |
| <var>[responseKeys.userNameKey]</var> | <code>object</code> |  | Key which will contain username in normalized response. |
| <var>[responseKeys.userIdKey]</var> | <code>object</code> |  | Key which will contain user ID in normalized response. |
| <var>[responseKeys.loginTimeKey]</var> | <code>object</code> |  | Key which will contain last login time in normalized response. |

## <code>AuthOptions</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>options.cookie</var> | <code>string</code> | Cookies that could contain authorization token and realm name. |
| <var>options.authorization</var> | <code>string</code> | Authorization Bearer token. |
