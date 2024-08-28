# API documentation for kubernetes package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>ConfigQueryService</code>

Class to manage and store services configurations.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>\
**Emits**: <code>ConfigQueryService#event:service-config-updated When service configuration was updated.</code>, <code>ConfigQueryService#event:service-config-deleted When deleting configuration after service has been removed.</code>

### <code>new ConfigQueryService(options)</code>

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>options</var> | <code>object</code> |  | Parameters. |
| <var>options.serviceCollection</var> | <code>object</code> |  | ServiceCollection instance. |
| <var>options.certificateManager</var> | <code>object</code> |  | CertificateManager instance. |
| <var>options.pmService</var> | <code>object</code> |  | PmService instance. |
| <var>options.configFetchRetryPeriod</var> | <code>number</code> |  | Number of ms used to calculate a time until the next try to fetch the configuration. |
| <var>options.configFetchMaxRetryPeriod</var> | <code>number</code> |  | Maximum possible time in ms until the next try to fetch the configuration. |
| <var>options.internalUiName</var> | <code>string</code> |  | Domain service name for mTLS internal communication. |
| <var>options.configQueryList</var> | [`Array.&lt;ConfigQueryItem&gt;`](#ConfigQueryItem) |  | List of configurations. |
| <var>[options.logger]</var> | <code>object</code> |  | Logger instance. |
| <var>[options.telemetryService]</var> | <code>object</code> |  | Distributed System Tracing instance. |
| <var>[options.maxLoopId]</var> | <code>number</code> | `1000` | Maximum number of simultaneous configuration requests. |

### <code>configQueryService.fetchConfig(serviceWithUrl, configFileName)</code>

Fetches the service configuration.

**Kind**: instance method of [`ConfigQueryService`](#ConfigQueryService)\
**Returns**: <code>Promise.&lt;object&gt;</code> - Resolved promise with successfull or failed response on fetching the configuration.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>serviceWithUrl</var> | <code>object</code> | Service instance. |
| <var>configFileName</var> | <code>string</code> | The name of the configuration file. |

### <code>configQueryService.serviceHandler(serviceWithUrl)</code>

Handles a given service configuration(s).

**Kind**: instance method of [`ConfigQueryService`](#ConfigQueryService)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>serviceWithUrl</var> | <code>object</code> | Service instance. |

### <code>configQueryService.getConfig(configName)</code>

For all handled services it returns the specific configuration by its name.

**Kind**: instance method of [`ConfigQueryService`](#ConfigQueryService)\
**Returns**: <code>object</code> - Configurations.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>configName</var> | <code>string</code> | The name of configuration. |

### <code>configQueryService.deleteService(service)</code>

Clear configuration data about deleted service.

**Kind**: instance method of [`ConfigQueryService`](#ConfigQueryService)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>service</var> | <code>object</code> | Service instance. |

## <code>ManualServiceConfigHandler</code>

Class to manage and store manual service configs.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>\
**Emits**: <code>ManualServiceConfigHandler#event:service-added When a service was added.</code>, <code>ManualServiceConfigHandler#event:service-modified When a service was modified.</code>, <code>ManualServiceConfigHandler#event:service-deleted When a service was removed.</code>

### <code>new ManualServiceConfigHandler(options)</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Parameters. |
| <var>options.serviceConfigList</var> | <code>object</code> | Configuration for the manual services. |
| <var>[options.logger]</var> | <code>string</code> | Logger instance. |

### <code>manualServiceConfigHandler.handleServiceConfigChange(serviceConfigList)</code>

Updates the list of configuration.

**Kind**: instance method of [`ManualServiceConfigHandler`](#ManualServiceConfigHandler)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>serviceConfigList</var> | <code>Array.&lt;object&gt;</code> | Configuration list. |

### <code>manualServiceConfigHandler.triggerInitialEvents()</code>

Manually triggers `service-added` event for all services.

**Kind**: instance method of [`ManualServiceConfigHandler`](#ManualServiceConfigHandler)

## <code>ServiceCollection</code>

Class to store and manage collection of services.

**Kind**: global class\
**Extends**: <code>EventEmitter</code>\
**Emits**: <code>ServiceCollection#event:service-added When a service is added to the collection.</code>, <code>ServiceCollection#event:service-modified When a service has been modified.</code>, <code>ServiceCollection#event:service-deleted When a service is removed from the collection.</code>

### <code>new ServiceCollection([logger])</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>[logger]</var> | <code>object</code> | Logger instance. |

### <code>serviceCollection.addService(service)</code>

Adds the service if it isn't in the collection.

**Kind**: instance method of [`ServiceCollection`](#ServiceCollection)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>service</var> | <code>object</code> | Service instance. |

### <code>serviceCollection.modifyService(service)</code>

Modifies a given service if it exists in the collection.

**Kind**: instance method of [`ServiceCollection`](#ServiceCollection)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>service</var> | <code>object</code> | Service instance. |

### <code>serviceCollection.deleteService(service)</code>

Deletes a given service if it exists in the collection.

**Kind**: instance method of [`ServiceCollection`](#ServiceCollection)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>service</var> | <code>object</code> | Service instance. |

### <code>serviceCollection.getServices()</code>

Returns the whole collection.

**Kind**: instance method of [`ServiceCollection`](#ServiceCollection)\
**Returns**: <code>Array.&lt;object&gt;</code> - Collection.

### <code>serviceCollection.forceUpdateService(serviceName)</code>

Emits service-modified event if a service with the given name exists in the collection.

**Kind**: instance method of [`ServiceCollection`](#ServiceCollection)\
**Returns**: <code>true</code> \| <code>false</code> - If service exists in the collection, then true, otherwise false.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>serviceName</var> | <code>string</code> | The name of a service. |

## <code>ConfigQueryItem</code>

Configuration settings.

**Kind**: global typedef

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| <var>configName</var> | <code>string</code> |  | The name of the configuration. |
| <var>configFileName</var> | <code>string</code> |  | The name of the configuration file. |
| <var>schema</var> | <code>object</code> |  | Schema to validate the configuration. |
| <var>[allowEmptyConfig]</var> | <code>boolean</code> | `false` | If an empty config-meta could be used. |
| <var>[configDefault]</var> | <code>object</code> |  | For the case where config could be empty the default meta-value (must match the schema). |
| <var>[additionalSchemaList]</var> | <code>Array.&lt;object&gt;</code> |  | Additional schemas to validate the configuration. |
| <var>[limitOfTries]</var> | <code>number</code> | `Infinity` | Maximum amount of tries to fetch the configuration. |

## <code>k8sConfig</code>

Class supporting Kubernetes API operations.

**Kind**: global typedef\
**Extends**: <code>events.EventEmitter</code>

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Collection of parameters. |
| <var>options.k8sConfig</var> | [`k8sConfig`](#k8sConfig) | Main configuration. |
| <var>options.logger</var> | <code>object</code> | This logger is used for warnings, errors. |
| <var>options.fMHandler</var> | <code>object</code> | Needed for creating fault indications. |
| <var>options.pmService</var> | <code>object</code> | Needed for collecting performance metrics. Structure of the main configuration. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>labelName</var> | <code>string</code> | Stores the workspace name. |
| <var>labelValue</var> | <code>string</code> | Workspace label. |
| <var>configFetch</var> | <code>object</code> | This object stores the config fetching options. |
| <var>queryProtocolAnnotation</var> | <code>string</code> | Used for calculating the protocol for fetching. |
| <var>queryPortAnnotation</var> | <code>string</code> | Used for calculating the needed port for fetching. |
| <var>uiContentConfigContextAnnotation</var> | <code>string</code> | The context used for fetching. |
| <var>extraAnnotations</var> | <code>object</code> | List (as object properties) of additional annotations, the values of which need to be added to the mapped service parameters, in the following format: [service parameter] : [{String} source annotation]. |
| <var>appNameLabel</var> | <code>string</code> | Name of the fetched app. |
| <var>appVersionLabel</var> | <code>string</code> | Version of the app. |
| <var>discoverIngress</var> | <code>boolean</code> | If set, ingress is enabled. |
| <var>ingressTlsPort</var> | <code>number</code> | Ingress TLS port. |
| <var>ingressHttpPort</var> | <code>number</code> | Ingress HTTP port. |
| <var>serviceAccountDir</var> | <code>string</code> | Kubernetes service account, needed for the namespace, tokens. |
| <var>useHttps</var> | <code>boolean</code> | Setting of tls (true = https, false = http). Used if queryProtocolAnnotation is not given. |

## <code>syncConfig</code>

Service for propagating refresh notification
for the other pods.

**Kind**: global typedef

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | Collection of parameters. |
| <var>params.logger</var> | <code>object</code> | This logger is used for warnings, errors. |
| <var>params.certificateManager</var> | <code>object</code> | Watches the certificates from the helm config of the services. |
| <var>params.telemetryService</var> | <code>object</code> | Tracks the http request of the service. |
| <var>params.syncConfig</var> | [`syncConfig`](#syncConfig) | Synchronization configuration. Structure of the synchronization configuration is below. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| <var>tlsType</var> | <code>string</code> | TLS option. |
| <var>headerValues</var> | <code>string</code> | VIA http header from the request. |
| <var>headlessServiceName</var> | <code>string</code> | Name of the headless service. |
| <var>servicePort</var> | <code>number</code> | Port of the request. |
| <var>useHttps</var> | <code>boolean</code> | If true protocol is https, else http. |
