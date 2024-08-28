# API documentation for base package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>CertificateManager</code>

Manages certificates for TLS enabled services.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>

### <code>new CertificateManager(options)</code>

Sets basic configs for the manager and starts watching certificates if TLS is globally enabled.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>options.tlsEnabled</var> | <code>boolean</code> | True if TLS enabled globally. |
| <var>options.dependenciesConfig</var> | <code>object</code> | Dependencies configuration. |
| <var>options.certificatePath</var> | <code>string</code> | Path to the folder containing the certificates. |
| <var>options.certificateWatchDebounceTime</var> | <code>number</code> | Delay time in ms. |
| <var>[options.certificateConfig]</var> | <code>object</code> | Certificates configuration. |
| <var>[options.certificateConfig.ca]</var> | <code>string</code> | The name of the CA. |
| <var>[options.certificateConfig.key]</var> | <code>string</code> | The name of the key file. |
| <var>[options.certificateConfig.cert]</var> | <code>string</code> | The name of the certificate. |
| <var>[options.serverCertificateConfig]</var> | <code>object</code> | Server certificates configuration. |
| <var>[options.serverCertificateConfig.certDir]</var> | <code>string</code> | Certificate and key file directory. |
| <var>[options.serverCertificateConfig.caCertDirs]</var> | <code>Array.&lt;string&gt;</code> | Array of CA directories or paths for CA file. |
| <var>[options.serverCertificateConfig.key]</var> | <code>string</code> | The name of the key file. |
| <var>[options.serverCertificateConfig.cert]</var> | <code>string</code> | The name of the certificate. |
| <var>[options.serverCertificateConfig.verifyClientCert]</var> | <code>boolean</code> | Indicates that it's needed to verify client certificate. |
| <var>[options.logger]</var> | <code>object</code> | Logger instance. |

### <code>certificateManager.stopCertificateWatch()</code>

Stops monitoring certificate changes and removes all event listeners.

**Kind**: instance method of [`CertificateManager`](#CertificateManager)

### <code>certificateManager.stopServerCertificateWatch()</code>

Stops monitoring server certificate changes and removes all event listeners.

**Kind**: instance method of [`CertificateManager`](#CertificateManager)

### <code>certificateManager.getTLSOptions(serviceName)</code>

Returns object with TLS options for a given service.

**Kind**: instance method of [`CertificateManager`](#CertificateManager)\
**Returns**: <code>object</code> - An object which contains the https configuration options.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>serviceName</var> | <code>string</code> | The name of the service, it should be the same key which is used in the options.dependenciesConfig. |

### <code>certificateManager.getServerHttpsOpts()</code>

Returns server https options.

**Kind**: instance method of [`CertificateManager`](#CertificateManager)\
**Returns**: <code>object</code> \| <code>null</code> - Server https options.

## <code>NonTLSCertificateManager</code>

Generates a constant TLS options.

**Kind**: global class

### <code>new NonTLSCertificateManager(options)</code>

Sets basic configs for the manager.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>options.serviceName</var> | <code>string</code> | Name of the service. |
| <var>options.serverCertPath</var> | <code>string</code> | Path to the service certificate. |
| <var>[options.logger]</var> | <code>object</code> | Logger instance. |

### <code>nonTLSCertificateManager.getTLSOptions()</code>

Returns object with TLS options for a given service.

**Kind**: instance method of [`NonTLSCertificateManager`](#NonTLSCertificateManager)\
**Returns**: <code>object</code> - An object which contains a configured tlsAgent object.

## <code>ConfigManager</code>

Contains application main config which updates with config json file.
In common use extends with application services configs.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>

### <code>new ConfigManager(configList, [logger])</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>configList</var> | <code>Array.&lt;object&gt;</code> | Configs parameters. |
| <var>configList[].name</var> | <code>string</code> | The name of the config. |
| <var>configList[].filePath</var> | <code>string</code> | Path to the file which will update the config. |
| <var>[configList[].schema]</var> | <code>object</code> | Schema to validate the file. |
| <var>[configList[].additionalSchemaList]</var> | <code>Array.&lt;object&gt;</code> | Additional list of schemas referenced by the main schema. |
| <var>[configList[].defaultValue]</var> | <code>string</code> | Config's default value. |
| <var>[logger]</var> | <code>object</code> | Logger instance. |

### <code>configManager.get(configName)</code>

Gets the configuration by its name. Returns an array if the configuration is an array.

**Kind**: instance method of [`ConfigManager`](#ConfigManager)\
**Returns**: <code>object</code> \| <code>undefined</code> - Configuration object.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>configName</var> | <code>string</code> | Configuration name. |

### <code>configManager.startConfigWatch(options)</code>

Watches for passed config file changes and updates config by its name.

**Kind**: instance method of [`ConfigManager`](#ConfigManager)

**Throws**:

- Will throw an error if passed configuration has already been watched.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of parameters. |
| <var>options.name</var> | <code>string</code> | Config name. |
| <var>options.filePath</var> | <code>string</code> | Config file path. |
| <var>[options.schema]</var> | <code>object</code> | Schema to validate passed config file. |
| <var>[options.additionalSchemaList]</var> | <code>Array.&lt;object&gt;</code> | Additional list of schemas referenced by the main schema. |
| <var>[options.defaultValue]</var> | <code>object</code> | Default config value. If needed, it passed only for a. |
| <var>[options.fileType]</var> | <code>string</code> | Type of the file to read and track, defined in ConfigManager.FILE_TYPES non-existent config, otherwise will be ignored. |

**Example**

```js
configManager.startConfigWatch({
  name: 'newConfig',
  filePath: 'configs/new-config.json',
  schema: schemaObject,
  additionalSchemaList: [otherSchemaObject, secondSchemaObject]
  defaultValue: {
    label: 'new',
  },
  fileType: ConfigManager.FILE_TYPES.JSON
});
```

### <code>configManager.stopAllConfigWatch()</code>

Stops monitoring changes in all configuration files and removes all event listeners.

**Kind**: instance method of [`ConfigManager`](#ConfigManager)

## <code>Logger</code>

Contains methods to set up Winston transport according to the provided configuration. Supports
logging to the console, to the file, and to the remote syslog consumer.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>\
**Emits**: <code>Logger#event:syslog-error</code>, <code>Logger#event:jsontcp-error</code>

### <code>logger.LOG\_LEVELS</code>

Returns logging levels.

**Kind**: instance property of [`Logger`](#Logger)\
**Returns**: <code>object</code> - Logging levels.

### <code>logger.configureLogger(newLogConfig)</code>

Store the logging config for future loggers and reconfigure already existing ones.

**Kind**: instance method of [`Logger`](#Logger)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>newLogConfig</var> | <code>object</code> | Config object. |
| <var>newLogConfig.enabled</var> | <code>boolean</code> | Enables logging. |
| <var>newLogConfig.serviceName</var> | <code>string</code> | Log category. |
| <var>newLogConfig.defaultLogLevel</var> | <code>string</code> | Default logging level (=info). |
| <var>newLogConfig.logLevelCategories</var> | <code>object</code> | Levels for certain categories, where key is a category and value is a logging level. |
| <var>newLogConfig.stdout</var> | [`ConsoleLogConfig`](#ConsoleLogConfig) | Console logs configuration. |
| <var>newLogConfig.filelog</var> | [`FilelogConfig`](#FilelogConfig) | File logs configuration. |
| <var>newLogConfig.syslog</var> | [`SyslogConfig`](#SyslogConfig) | Syslog configuration. |
| <var>newLogConfig.jsonTCPLog</var> | [`JsonTCPLogConfig`](#JsonTCPLogConfig) | Syslog configuration. |

### <code>logger.getLogger([category])</code>

Get a logger from the Winston log container. If it does not exist then Winston will create it.

**Kind**: instance method of [`Logger`](#Logger)\
**Returns**: <code>object</code> - Logger object.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>[category]</var> | <code>string</code> | `"'default'"` | Category of the message. |

### <code>logger.setTelemetryService(telemetryServiceInstance)</code>

Set the provided Telemetry Service for the Logger.

**Kind**: instance method of [`Logger`](#Logger)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>telemetryServiceInstance</var> | <code>object</code> | An instance of the Telemetry Service. |

## <code>UiConfigService</code>

Contains additional config
to be provided as configs to the front-end,
which updates with config json file.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>\
**Emits**: <code>UiConfigService#event:ui-config-changed</code>

### <code>new UiConfigService(options)</code>

Creates UI service.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Set of options. |
| <var>options.configFilePath</var> | <code>string</code> | Path to the configuration file. |
| <var>options.configManager</var> | <code>object</code> | Instance of the existing `configManager`. |
| <var>[options.defaultValue]</var> | <code>object</code> | Default value for the config. |
| <var>[options.configObject]</var> | <code>object</code> | Object with optional constant configuration, can also be used to set default values. |

### <code>uiConfigService.updateUIConfig()</code>

Updates UI config with current values from the `configManager`.

**Kind**: instance method of [`UiConfigService`](#UiConfigService)

### <code>uiConfigService.getUIConfig()</code>

Returns current UI config.

**Kind**: instance method of [`UiConfigService`](#UiConfigService)\
**Returns**: <code>object</code> - UI config.

### <code>uiConfigService.getUIConfigMiddleware()</code>

Creates middleware which returns UI config.

**Kind**: instance method of [`UiConfigService`](#UiConfigService)\
**Returns**: <code>function</code> - Middleware function.

## <code>name</code>

Expose the name of this Transport on the prototype.

**Kind**: global variable\
**Returns**: <code>string</code> - The name, 'jsonTCP'.

## <code>fileTypes</code>

Supported file types.

**Kind**: global constant

## <code>checkFileType(fileType)</code>

Checks if the provided file type is supported.

**Kind**: global function

**Throws**:

- <code>Error</code> Error indicating that the wrong file type was used.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>fileType</var> | <code>string</code> | Type of the file to read and track, defined in ConfigManager.FILE_TYPES. |

## <code>getDefaultValueForType(fileType)</code>

Provides a default config value for a given file type.

**Kind**: global function\
**Returns**: <code>object</code> \| <code>string</code> - Fallback default value, for a given file type, if defaultValue was not provided.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>fileType</var> | <code>string</code> | Type of the file to read and track, defined in ConfigManager.FILE_TYPES. |

## <code>log(info, callback)</code>

Core logging method exposed to Winston.

**Kind**: global function\
**Returns**: <code>function</code> - Result of `connect()` method invocation.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>info</var> | <code>object</code> | All relevant log information. |
| <var>callback</var> | <code>function</code> | Continuation to respond to when complete. |

## <code>connect(callback)</code>

Connects to the remote Log Transformer server using `dgram` or `net` depending
on the `protocol` for this instance.

**Kind**: global function\
**Returns**: <code>function</code> \| <code>null</code> - Callback invocation or null.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>callback</var> | <code>function</code> | Continuation to respond to when complete. |

## <code>close()</code>

Closes the socket used by this transport freeing the resource.

**Kind**: global function

## <code>mergeObj([baseObj], [obj])</code>

Function merges recursively two objects.

**Kind**: global function\
**Returns**: <code>object</code> - Resulting object.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>[baseObj]</var> | <code>object</code> | `{}` | Initial base object. |
| <var>[obj]</var> | <code>object</code> | `{}` | Object to be merged. |

## <code>formatLogDataToJson(data)</code>

Generate logging data in json format, which can be collected for further processing.

**Kind**: global function\
**Returns**: <code>object</code> - Information that will be sent to the Log Transporter.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>data</var> | <code>object</code> | Raw information for Log generation. |
| <var>data.info</var> | <code>object</code> | All relevant Log Information. |
| <var>data.level</var> | <code>string</code> | Logging level. |
| <var>data.transportOptions</var> | <code>object</code> | Relevant transport configurations. |
| <var>data.traceId</var> | <code>string</code> | Telemetry trace ID. |
| <var>data.appID</var> | <code>string</code> \| <code>number</code> | Unique string representation of the service. |
| <var>data.procID</var> | <code>string</code> \| <code>number</code> | Process ID. |
| <var>data.transportFacility</var> | <code>string</code> | Transport's facility. |

## <code>TlsConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| <var>enabled</var> | <code>boolean</code> |  | Whether to use TLS for the service. |
| <var>[verifyServerCert]</var> | <code>boolean</code> | `true` | Whether the peer service's server certificate should be verified against the root CA. The default value is true. |
| <var>[sendClientCert]</var> | <code>boolean</code> | `true` | Whether to use TLS client authentication. The default value is true. |

## <code>FilelogConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>enabled</var> | <code>boolean</code> | Turns on writing logs to a file. |
| <var>logFileName</var> | <code>string</code> | Can be just a name or contains full path to the file. |
| <var>logDirName</var> | <code>string</code> | Directory where the file should be written. Can be omitted if logFileName contains the full path. |
| <var>maxSize</var> | <code>number</code> | Maximum file size in bytes. |
| <var>maxFiles</var> | <code>number</code> | Maximum number of files. |

## <code>SyslogConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>enabled</var> | <code>boolean</code> | Turns on syslog logs. |
| <var>syslogHost</var> | <code>string</code> | Host address of log server. |
| <var>syslogFacility</var> | <code>string</code> | Default facility (=local0). |
| <var>[facilityCategories]</var> | <code>object</code> | Facilities for certain categories, where key is a category and value is a facility. |
| <var>tls</var> | <code>object</code> | TLS configuration. |
| <var>tls.enabled</var> | <code>boolean</code> | Turns on TLS. |
| <var>tls.protocolOptions</var> | <code>object</code> | Additional protocol options. |
| <var>podName</var> | <code>string</code> | Pod name. |
| <var>metadata</var> | <code>object</code> | Additional metadata. |

## <code>JsonTCPLogConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>enabled</var> | <code>boolean</code> | Turns on JSON-TCP logs. |
| <var>host</var> | <code>string</code> | Host address of log server. |
| <var>facility</var> | <code>string</code> | Default facility (=local0). |
| <var>[facilityCategories]</var> | <code>object</code> | Facilities for certain categories, where key is a category and value is a facility. |
| <var>[port]</var> | <code>number</code> | Port to reach log server. |
| <var>[protocol]</var> | <code>string</code> | Protocol to reach log server. |
| <var>tls</var> | <code>object</code> | TLS configuration. |
| <var>tls.enabled</var> | <code>boolean</code> | Turns on TLS. |
| <var>tls.protocolOptions</var> | <code>object</code> | Additional protocol options. |
| <var>podName</var> | <code>string</code> | Pod name. |
| <var>metadata</var> | <code>object</code> | Additional metadata. |
| <var>[logSeparator]</var> | <code>string</code> | Separator between log messages. For Log Transformer it should be a new line `\n`. |

## <code>ConsoleLogConfig</code>

**Kind**: global typedef

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>enabled</var> | <code>boolean</code> | Turns on logs for console. |
| <var>facility</var> | <code>string</code> | Default facility (=local0). |
| <var>[facilityCategories]</var> | <code>object</code> | Facilities for certain categories, where key is a category and value is a facility. |
| <var>podName</var> | <code>string</code> | Pod name. |
| <var>metadata</var> | <code>object</code> | Additional metadata. |
| <var>[logSeparator]</var> | <code>string</code> | Separator between log messages. For Log Transformer it should be a new line `\n`. |
