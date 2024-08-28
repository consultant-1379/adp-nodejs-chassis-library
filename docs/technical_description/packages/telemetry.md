# Telemetry Package

This package performs initial setup of OpenTelemetry, creates spans,
and injects/extracts trace context into and from the requests.

## Requirements

No specific requirements.

## Configuration

Configuration of the telemetry package is done through environment variables.

| Environment Variable      | Description                                                | Default                    |
| ------------------------- | ---------------------------------------------------------- | -------------------------- |
| `OTEL_TRACES_SAMPLER`     | The type of the sampler.                                   | `parentbased_traceidratio` |
| `OTEL_TRACES_SAMPLER_ARG` | Sets the sampling rate of the telemetry service.           | 0                          |
| `OTEL_SERVICE_NAME`       | Name of the target service.                                | N/A                        |
| `K8S_SERVICE_VERSION`     | Version of the target service.                             | N/A                        |
| `K8S_NAMESPACE`           | Namespace where the target service is deployed.            | N/A                        |
| `K8S_POD`                 | Pod name where the target service is running.              | N/A                        |
| `K8S_SERVICE_INSTANCE_ID` | Instance id of the target service.                         | N/A                        |
| `K8S_CONTAINER`           | Name of the container where the target service is running. | N/A                        |

## Functions

### refreshAgent

Will refresh the http(s) Agent of the exporter

- agent: new http(s) Agent with updated options.

### refreshRatio

Will refresh the sampler's sampling rate in runtime.

- rate: sampling rate configuration as JSON object (scheme based on
  `eric-dst-collector-remote-sampling` configmap).

### injectContext

Serializes the propagation fields from context into an output object.

- ctx (optional): A context for serializing the propagation fields into it. By default, it's
  the active context.

Returns the carrier object.

### extractContext

Extracts the propagation fields data into a context object.

- carrier: A carrier object that contains the propagation fields.
- activeContext (optional): A context for extracting the propagation fields into it.
  By default, it's the active context.

Returns the updated context.

### createSpan

Creates a span from the given request and attributes.

- req: The request object for creating a span from it.
- attr: The attributes of the span.
- activeContext (optional): A context where the span will be created.
  By default, it's the active context.

Returns the created span with its context.

### tracingMiddleware

A middleware function that adds distributed tracing functionality to HTTP requests.

- req: The HTTP request object.
- res: The HTTP response object.
- next: A callback function that will be called after the middleware completes.

## Usage

Example integration into a service:

```js
import Telemetry from '@adp/telemetry';

import express from 'express';
import fetch from 'node-fetch';

const PORT = '8080';
const mockApp = express();

const telemetry = new Telemetry();

mockApp.use(telemetry.tracingMiddleware);

mockApp.get('/test1', async (req, res) => {
  await fetch('http://localhost:8080/test2', telemetry.injectContext());
  res.send('test1');
});

mockApp.get('/test2', async (req, res) => {
  const ctx = telemetry.extractContext(req);
  const { span } = telemetry.createSpan(req, { attribute_name: 'attribute_value' }, ctx);
  await fetch('http://localhost:8080/test3', telemetry.injectContext()).then(span.end());
  res.send('test2');
});

mockApp.get('/test3', async (req, res) => {
  res.send('test3');
});

mockApp.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
```

Run the service with minimal environment variables:

```sh
"OTEL_SERVICE_NAME=service_name OTEL_SAMPLING_RATE=1 node server.js"
```

It will export every trace to a Collector service, which can visualize it.
