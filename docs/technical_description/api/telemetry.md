# API documentation for telemetry package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>Telemetry</code>

**Kind**: global class

### <code>new Telemetry(options)</code>

Performs initial setup of OpenTelemetry.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>options</var> | <code>object</code> | Initial parameters. |

### <code>telemetry.spanKindServerId</code>

Returns the numerical representation of spanKind Server.

**Kind**: instance property of [`Telemetry`](#Telemetry)\
**Returns**: <code>number</code> - Return the spanKind Server id.

### <code>telemetry.spanKindClientId</code>

Returns the numerical representation of spanKind Client.

**Kind**: instance property of [`Telemetry`](#Telemetry)\
**Returns**: <code>number</code> - Return the spanKind Client id.

### <code>telemetry.refreshAgent(agent)</code>

Refreshes the http(s) Agent of the exporter.

**Kind**: instance method of [`Telemetry`](#Telemetry)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>agent</var> | <code>object</code> | New http(s) Agent with updated options. |

### <code>telemetry.refreshRatio(dstConfig)</code>

Sets a given ratio for the sampler based on config JSON.

**Kind**: instance method of [`Telemetry`](#Telemetry)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>dstConfig</var> | <code>\*</code> | The sampling config JSON. |

### <code>telemetry.getTraceId()</code>

Returns the trace id of the current active span.

**Kind**: instance method of [`Telemetry`](#Telemetry)\
**Returns**: <code>string</code> - Return trace id of the current span.

### <code>telemetry.injectContext(ctx)</code>

Serialize the propagation fields from context into
an output object.

**Kind**: instance method of [`Telemetry`](#Telemetry)\
**Returns**: <code>object</code> - Returns the carrier object.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>ctx</var> | <code>object</code> | The context for serialize the propagation fields, by default it's the active context. |

### <code>telemetry.extractContext(req, activeContext)</code>

Extracts the propagation fields data into a context object.

**Kind**: instance method of [`Telemetry`](#Telemetry)\
**Returns**: <code>object</code> - Returns the updated context.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>req</var> | <code>object</code> | HTTP request that contains the propagation fields. |
| <var>activeContext</var> | <code>object</code> | A context for extracting the propagation fields into it, by default it's the active context. |

### <code>telemetry.getHttpRequestSpanOptions(spanKind, req)</code>

Returns the initial semantic attributes of the span.

**Kind**: instance method of [`Telemetry`](#Telemetry)\
**Returns**: <code>object</code> - Returns the attributes.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>spanKind</var> | <code>number</code> | The kind of the Span which has these attributes. |
| <var>req</var> | <code>object</code> | Request for the span. |

### <code>telemetry.setHttpResponseSpanOptions(span, res)</code>

Sets HTTP response options for a span.

**Kind**: instance method of [`Telemetry`](#Telemetry)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>span</var> | <code>object</code> | Span. |
| <var>res</var> | <code>object</code> | Response for the span. |

### <code>telemetry.createSpan(req, spanKind, activeContext)</code>

Creates a span and sets context for it.

**Kind**: instance method of [`Telemetry`](#Telemetry)\
**Returns**: <code>object</code> - Returns the created span with its context.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>req</var> | <code>object</code> | Request for creating a span from it. |
| <var>spanKind</var> | <code>object</code> | SpanKind of the span. |
| <var>activeContext</var> | <code>object</code> | A context where the span will be created, by default it's the active context. |

### <code>telemetry.tracingMiddleware(req, res, next)</code>

Middleware function to add distributed tracing functionality to HTTP requests.

**Kind**: instance method of [`Telemetry`](#Telemetry)

| Parameters | Type | Description |
| --- | --- | --- |
| <var>req</var> | <code>object</code> | HTTP request object. |
| <var>res</var> | <code>object</code> | HTTP response object. |
| <var>next</var> | <code>object</code> | Callback function, will be called after the middleware is done. |

## <code>getRatioBaseSampler(defaultRatio)</code>

Returns a sampler with a given default sampling rate.

**Kind**: global function\
**Returns**: <code>object</code> - Returns the custom sampler.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>defaultRatio</var> | <code>number</code> | Default sampling rate. |
