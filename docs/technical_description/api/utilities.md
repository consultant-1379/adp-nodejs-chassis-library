# API documentation for utilities package

<!-- markdownlint-disable MD013 MD033 MD036 MD051 -->

## <code>normalizeURLEnding(urlSegment)</code>

Removes trailing slash from the input string, if present.

**Kind**: global function\
**Returns**: <code>string</code> - Same string without the trailing slash, if there was one.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>urlSegment</var> | <code>string</code> | The input string. |

## <code>normalizeURLSegment(urlSegment)</code>

Removes leading slash from the input string, if present.

**Kind**: global function\
**Returns**: <code>string</code> - Same string without the leading slash, if there was one.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>urlSegment</var> | <code>string</code> | The input string. |

## <code>parseJsonRequestBody(request)</code>

Accepts a request and updates its body with url encoded formats.

**Kind**: global function\
**Returns**: <code>object</code> - Request with updated body for form request.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>request</var> | <code>object</code> | Request object. |

## <code>fetchResponsesForProtocol(params)</code>

A function for requesting data inside the kubernetes namespace.

**Kind**: global function\
**Returns**: <code>Promise.&lt;object&gt;</code> - A promise that resolves to the Response object.

| Parameters | Type | Description |
| --- | --- | --- |
| <var>params</var> | <code>object</code> | A set of parameters. |
| <var>params.serviceName</var> | <code>string</code> | The name of the service whose tlsAgent will be used for the request. |
| <var>params.protocol</var> | <code>string</code> | The protocol that will be used either http or https. |
| <var>params.url</var> | <code>string</code> | The url of the request to be sent. |
| <var>params.certificateManager</var> | <code>object</code> | The instance of the CertificateManager that has the service's certificates. |
| <var>params.dstService</var> | <code>object</code> | The instance of the DstService which will be used for telemetry. |
| <var>[params.headers]</var> | <code>object</code> | Headers that will be added to the request. |
| <var>[params.method]</var> | <code>string</code> | The HTTP method of the request. |
| <var>[params.body]</var> | <code>object</code> | The body which needs to be sent with the request. |
