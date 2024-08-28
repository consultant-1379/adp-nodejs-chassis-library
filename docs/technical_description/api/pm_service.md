# API documentation for pm-service package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>PmService</code>

**Kind**: global class

### <code>new PmService(config)</code>

Performs initial setup of Prometheus client.

**Throws**:

- Will throw an error if `enabled` or `appName` is not passed.

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>config</var> | <code>object</code> |  | Set of configs. |
| <var>config.enabled</var> | <code>boolean</code> |  | Enables/disables metric collection. |
| <var>config.appName</var> | <code>string</code> |  | Application name, is used as metric name prefix. |
| <var>[config.endpointsToCountRequests]</var> | <code>Array</code> | `[]` | Array of endpoints to count requests to. |
| <var>[config.endpointsPrefix]</var> | <code>string</code> | `"\"/\""` | Common prefix of the endpoints to count requests to. |
| <var>[config.logger]</var> | <code>object</code> | `SIMPLE_LOGGER` | Logger, if not provided, all log messages will be sent to console. |

### <code>pmService.isEnabled()</code>

Returns true if the service is enabled.

**Kind**: instance method of [`PmService`](#PmService)\
**Returns**: <code>boolean</code> - On/Off state of the service.

### <code>pmService.createMetric(metricType, options)</code>

Create metric of a given type.

**Kind**: instance method of [`PmService`](#PmService)\
**Returns**: <code>object</code> - Wrapper object for metric.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>metricType</var> | <code>string</code> | Possible values are: 'counter' or 'gauge'. |
| <var>options</var> | <code>object</code> | Metric parameters. |
| <var>options.name</var> | <code>string</code> | Suffix part of metric name. |
| <var>options.help</var> | <code>string</code> | Short description of a metric. |
| <var>[options.labelNames]</var> | <code>Array</code> | List of label names. |

### <code>pmService.deleteMetric(metricName)</code>

Delete a metric object by the suffix part of its name.

**Kind**: instance method of [`PmService`](#PmService)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>metricName</var> | <code>string</code> | Inner metric name (without `appName` prefix). |

### <code>pmService.resetPromClient()</code>

Resets Prometheus common registry to it's initial state.

**Kind**: instance method of [`PmService`](#PmService)

### <code>pmService.applyMetricsCollectionMiddleware(app, [options])</code>

Applies prom-bundle middleware to an app to setup metrics collection.
Recommended to apply this before metrics exposure middleware.

**Kind**: instance method of [`PmService`](#PmService)

| Parameters | Type | Default | Description |
| --- | --- | --- | --- |
| <var>app</var> | <code>object</code> |  | Express app. |
| <var>[options]</var> | <code>object</code> |  | Middleware options. See [link](https://www.npmjs.com/package/express-prom-bundle) for additional details. |
| <var>[options.promClient]</var> | <code>object</code> |  | Prom client settings. |
| <var>[options.promClient.collectDefaultMetrics]</var> | <code>object</code> | `{}` | Settings for collecting default metrics, by default all are collected. |

### <code>pmService.applyMetricsExposureMiddleware(app)</code>

Applies prom-bundle middleware to an app to expose metrics to an endpoint.
Recommended to apply this after metrics collection middleware.

**Kind**: instance method of [`PmService`](#PmService)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>app</var> | <code>object</code> | Express app for metrics endpoint. |

### <code>pmService.shutDown()</code>

Gracefully terminates `pmService`.

**Kind**: instance method of [`PmService`](#PmService)
