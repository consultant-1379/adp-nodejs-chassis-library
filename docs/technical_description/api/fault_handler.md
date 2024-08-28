# API documentation for fault-handler package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>FaultHandler</code>

**Kind**: global class

### <code>new FaultHandler(options)</code>

Initialize a FaultHandler.

**Throws**:

- <code>Error</code> Configuration file for the faultHandler must be provided.
- <code>Error</code> Configuration file for the faultHandler must be consistent with the JSON
Schema.
- <code>Error</code> Fault indication map must be correct.
- <code>Error</code> Fault indication map must be consistent with the JSON Schema.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>[options.logger]</var> | <code>object</code> | The logger which will be used for logging. |
| <var>options.faultManagerConfig</var> | <code>object</code> | Fault manager config. |
| <var>options.faultManagerConfig.clientId</var> | <code>string</code> | Client ID. |
| <var>options.faultManagerConfig.tls</var> | <code>object</code> | TLS configuration. |
| <var>options.faultManagerConfig.tls.enabled</var> | <code>boolean</code> | True is TLS enabled. |
| <var>options.faultManagerConfig.hostname</var> | <code>string</code> | Fault manager broker's hostname. |
| <var>options.faultManagerConfig.tlsPort</var> | <code>string</code> | Fault manager tls port. |
| <var>options.faultManagerConfig.httpPort</var> | <code>string</code> | Fault manager http port. |
| <var>options.faultManagerConfig.serviceName</var> | <code>string</code> | Name of the service. |
| <var>options.faultManagerConfig.enabled</var> | <code>boolean</code> | Sets if fault indications should be produced. |
| <var>options.faultIndicationMap</var> | <code>object</code> | Fault indication map. This map must be based on Fault Indication JSON Schema, see [details](https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-indication-schema-definition). |
| <var>options.useHttps</var> | <code>boolean</code> | True if https mode is used. |
| <var>options.tlsAgent</var> | <code>object</code> | TLS agent for security connection. |

### <code>faultHandler.produceFaultIndication(fIData)</code>

Send fault indication to FI REST interface see
[link](https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/user-guide)
for details.

**Kind**: instance method of [`FaultHandler`](#FaultHandler)\
**Returns**: <code>Promise.&lt;object&gt;</code> - Response of FI REST endpoint.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>fIData</var> | <code>object</code> | Fault indication metadata. |
| <var>fIData.fault</var> | <code>string</code> | Alias for the fault, as per faultIndicationDefaultMap. |
| <var>fIData.customConfig</var> | <code>object</code> | Additional parameters to override the defaults fault indications. |

### <code>faultHandler.setConfig(options)</code>

Set fault manager config.

**Kind**: instance method of [`FaultHandler`](#FaultHandler)

**Throws**:

- <code>Error</code> If the fm config is missing.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>[options.logger]</var> | <code>object</code> | The logger which will be used for logging. |
| <var>options.faultManagerConfig</var> | <code>object</code> | Fault manager config. |
| <var>options.useHttps</var> | <code>boolean</code> | True if https mode is used. |
| <var>options.tlsAgent</var> | <code>object</code> | TLS agent for security connection. |
