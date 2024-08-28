# Performance metrics collection

The pmService module provides API for collecting different performance metrics.

In order to use this module, the application must have its metrics exposure endpoint
separated from its other functional endpoints. It is recommended to have dedicated
Express application and HTTP server for each purpose.

## Setup application to use pmService library

Please perform the following steps in your application code to collect and expose metrics.

1. Create an instance of pmService by calling
   `const pmService = new PerformanceMonitoring(config)`.

2. Apply metrics collection middleware to the Express application, which provides
   the regular functional endpoints: call `pmService.applyMetricsCollectionMiddleware(app)`.
   This will start collecting the default metrics seen in below table.
   The `applyMetricsCollectionMiddleware` function has an optional second parameter, an object that
   can contain additional metric gathering [settings](https://www.npmjs.com/package/express-prom-bundle).

3. Apply metrics exposure middleware to the Express application, which is dedicated for metrics:
   call `pmService.applyMetricsExposureMiddleware(metricApp)` and then the metrics will be
   available on `/metrics` endpoint.

## Default performance metrics

| Metric                                            | Description                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app_name_process_cpu_user_seconds_total`         | Total user CPU time spent in seconds.                                                          |
| `app_name_process_cpu_system_seconds_total`       | Total system CPU time spent in seconds.                                                        |
| `app_name_process_cpu_seconds_total`              | Total user and system CPU time spent in seconds.                                               |
| `app_name_process_start_time_seconds`             | Start time of the process since UNIX epoch in seconds.                                         |
| `app_name_process_resident_memory_bytes`          | Resident memory size in bytes.                                                                 |
| `app_name_process_virtual_memory_bytes`           | Virtual memory size in bytes.                                                                  |
| `app_name_process_heap_bytes`                     | Process heap size in bytes.                                                                    |
| `app_name_process_open_fds`                       | Number of open file descriptors.                                                               |
| `app_name_process_max_fds`                        | Maximum number of open file descriptors.                                                       |
| `app_name_nodejs_eventloop_lag_seconds`           | Lag of event loop in seconds                                                                   |
| `app_name_nodejs_eventloop_lag_min_seconds`       | The minimum recorded event loop delay.                                                         |
| `app_name_nodejs_eventloop_lag_max_seconds`       | The maximum recorded event loop delay.                                                         |
| `app_name_nodejs_eventloop_lag_mean_seconds`      | The mean of the recorded event loop delays.                                                    |
| `app_name_nodejs_eventloop_lag_stddev_seconds`    | The standard deviation of the recorded event loop delays.                                      |
| `app_name_nodejs_eventloop_lag_p50_seconds`       | The 50th percentile of the recorded event loop delays.                                         |
| `app_name_nodejs_eventloop_lag_p90_seconds`       | The 90th percentile of the recorded event loop delays.                                         |
| `app_name_nodejs_eventloop_lag_p99_seconds`       | The 99th percentile of the recorded event loop delays.                                         |
| `app_name_nodejs_active_handles`                  | Number of active libuv handles grouped by handle type. Every handle type is C++ class name.    |
| `app_name_nodejs_active_handles_total`            | Total number of active handles.                                                                |
| `app_name_nodejs_active_requests`                 | Number of active libuv requests grouped by request type. Every request type is C++ class name. |
| `app_name_nodejs_active_requests_total`           | Total number of active requests.                                                               |
| `app_name_nodejs_heap_size_total_bytes`           | Process heap size from Node.js in bytes.                                                       |
| `app_name_nodejs_heap_size_used_bytes`            | Process heap size used from Node.js in bytes.                                                  |
| `app_name_nodejs_external_memory_bytes`           | Node.js external memory size in bytes.                                                         |
| `app_name_nodejs_heap_space_size_total_bytes`     | Process heap space size total from Node.js in bytes.                                           |
| `app_name_nodejs_heap_space_size_used_bytes`      | Process heap space size used from Node.js in bytes.                                            |
| `app_name_nodejs_heap_space_size_available_bytes` | Process heap space size available from Node.js in bytes.                                       |
| `app_name_nodejs_version_info`                    | Node.js version info.                                                                          |
| `app_name_nodejs_gc_duration_seconds`             | Garbage collection duration by kind, one of major, minor, incremental or weakcb.               |
| `app_name_http_request_duration_seconds`          | Duration histogram of http responses labeled with: `status_code`.                              |

## Custom request counter for endpoints

To add a counter for counting requests to specific endpoints,
list the endpoints in `endpointsToCountRequests` array under Prometheus configurations:

```json
{
  "enabled": true,
  "appName": "app-name",
  "endpointsToCountRequests": [
    "/ui-meta/v1/apps",
    "/ui-meta/v1/groups",
    "/ui-meta/v1/components",
    "/ui",
    "/ui-serve/v1/import-map",
    "/ui-serve/v1/list-packages"
  ]
}
```

As a temporary solution pmService.setupPromClient requires a config object of this structure:

```javascript
/**
 * Performs initial setup of Prometheus client
 * @param {Object} config
 *
 * @param {boolean} config.enabled enables/disables metric collection
 * @param {string} config.appName application name, is used as metric name prefix
 * @param {Array} config.endpointsToCountRequests array of enpoints to count requests to
 * @param {Object} config.logging logging service
 */
constructor(config);
```

A custom counter or gauge can be created for other purposes by using `pmService.createMetric` method.

Gauges by default have these methods:

```javascript
/**
 * Set a gauge to a value
 * @param {object} labels - Object with labels and their values
 * @param {Number} value - Value to set the gauge to, must be positive
 * @returns {void}
 */
set(labels, value);

/**
 * Increment a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value.
 * Can only be one level deep
 * @param {Number} value - Value to increment - if omitted, increment with 1
 * @returns {void}
 */
inc(labels, value);

/**
 * Decrement a gauge value
 * @param {object} labels - Object with labels where key is the label key and value is label value.
 * Can only be one level deep
 * @param {Number} value - Value to decrement - if omitted, decrement with 1
 * @returns {void}
 */
dec(labels, value);
```

Counter provides only an increment method:

```javascript
/**
 * Increment counter
 * @param {object} labels - What label you want to be incremented
 * @param {Number} value - Value to increment, if omitted increment with 1
 * @returns {void}
 */
inc(labels, value);
```

Usage example:

```javascript
import express from 'express';
import { PerformanceMonitoring } from '@adp/pm-service';
import configManager from '../../config/configManager.js'; //NOTE: your path may be different
import { getLogger } from './services/logging.js'; //NOTE: your path may be different

const app = express();
const metricApp = express();

const GAUGE_METRIC_NAME = 'some_metric_name'; //NOTE: only alphanumerics and '_' symbol are allowed

const COUNTER_METRIC_NAME = 'some_api_requests_count';

const pmService = new PerformanceMonitoring({
  ...configManager.getPromConfig(),
  lopgger: getLogger('metrics'),
});

pmService.applyMetricsCollectionMiddleware(app); // default metrics collection is begun
pmService.applyMetricsExposureMiddleware(metricApp); // now '/metrics' endpoint will be available
//...some other setup for the express app...

const gauge = pmService.createMetric('gauge', {
  name: GAUGE_METRIC_NAME, //metric name
  help: 'Some necessary gauge' /*mertic description (optional), if omitted,
     help text will be `Gauge metric with name ${metricFullName}` */,
});

gauge.set(5);

gauge.inc(1);

gauge.dec(2);

const counter = pmService.createMetric('counter', {
  name: COUNTER_METRIC_NAME,
  help: `Amount of requests to the "/some" API`,
  labelNames: ['endpoint', 'method', 'code'],
});

counter.inc({ endpoint: url, method: 'GET', code: 200 }, 0); //this sets up the counter with 0
counter.inc({ endpoint: url, method: 'GET', code: 200 }); //this will increment it by 1

counter.inc({ endpoint: url, method: 'GET', code: 404 });
//This will create a different entry under the same metric with the value "1" as one of the labels
//changed. It can be used to track status changes, successful/unsuccessful requests etc.

app.close = () => {
  pmService.shutDown();
};
```

**Note:** [Metric and Label Naming rules](https://adp.ericsson.se/workinginadpframework/tutorials/performance-management/metric-and-label-naming)

To delete a metric call `pmService.deleteMetric(metricName)` and pass its name as a parameter.

To check if metrics collection is enabled by service configs use `pmService.isEnabled()`.

To reset pmService (including Prometheus registry) to its initial state use `pmService.resetPromClient()`.
