# API documentation for license-manager package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>LicenseManager</code>

**Kind**: global class

### <code>new LicenseManager(options)</code>

Initialize a LicenseManager.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>[options.logger]</var> | <code>object</code> | The logger which will be used for logging. |
| <var>options.licenseManagerConfig</var> | <code>object</code> | License manager config. |
| <var>options.licenseManagerConfig.hostname</var> | <code>string</code> | License manager hostname. |
| <var>options.licenseManagerConfig.tlsPort</var> | <code>string</code> | License manager tls port. |
| <var>options.licenseManagerConfig.httpPort</var> | <code>string</code> | License manager http port. |
| <var>options.licenseManagerConfig.productType</var> | <code>string</code> | Product type of licenses which should be checked. |
| <var>options.licenseManagerConfig.licenses</var> | <code>Array.&lt;object&gt;</code> | Array of licenses which should be checked. |
| <var>options.useHttps</var> | <code>boolean</code> | True if https mode is used. |
| <var>options.secureContext</var> | <code>object</code> | Security context for security connection. |
| <var>options.tlsAgent</var> | <code>object</code> | TLS agent for security connection. |

### <code>licenseManager.readLicensesInfo()</code>

Read detailed licenses information.

**Kind**: instance method of [`LicenseManager`](#LicenseManager)\
**Returns**: <code>Promise</code> - Request promise.

### <code>licenseManager.setLicenseManagerConfig(options)</code>

Set license manager config.

**Kind**: instance method of [`LicenseManager`](#LicenseManager)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>[options.logger]</var> | <code>object</code> | The logger which will be used for logging. |
| <var>options.licenseManagerConfig</var> | <code>object</code> | License manager config. |
| <var>options.useHttps</var> | <code>boolean</code> | True if https mode is used. |
| <var>options.secureContext</var> | <code>object</code> | Security context for security connection. |
| <var>options.tlsAgent</var> | <code>object</code> | TLS agent for security connection. |
