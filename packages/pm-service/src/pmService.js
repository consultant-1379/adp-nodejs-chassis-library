import * as Prometheus from 'prom-client';
import promBundle from 'express-prom-bundle';
import * as path from 'path';

import { getHandlers } from './metrics/proxyHandlers.js';

const { Counter, Gauge } = Prometheus;

const DEFAULT_PROTOCOL = 'http';

// fallback logger for the cases if the library usesers did not provide their own
const SIMPLE_LOGGER = {
  error(msg) {
    console.log(msg);
  },
  info(msg) {
    console.log(msg);
  },
};

/**
 * Set's up prom-bundle middleware.
 * @private
 * @param {object} [options] - Middleware options.
 * See {@link https://www.npmjs.com/package/express-prom-bundle|link} for additional details
 * @param {object} [options.promClient] - Prom client settings
 * @param {object} [options.promClient.collectDefaultMetrics = {}] - Settings for collecting default
 *    metrics, by default all are collected
 * @returns {object} Global singleton instance of the Prometheus bundle middleware
 */
function getMiddleware(options = {}) {
  // @ts-ignore
  const prefix = `${this.serviceMetricPrefix}_`;
  if (this.promBundleMiddleware === undefined) {
    this.promBundleMiddleware = promBundle({
      autoregister: false,
      promClient: {
        collectDefaultMetrics: {
          prefix,
        },
      },
      includeUp: false,
      httpDurationMetricName: `${prefix}http_request_duration_seconds`,
      ...options,
    });
  }
  return this.promBundleMiddleware;
}

function memoiseName(endpoint, metric, transformer) {
  const key = endpoint.concat(metric);
  if (this.names[key]) {
    return this.names[key];
  }
  const transformedName = transformer(endpoint);
  this.names[key] = transformedName;
  return transformedName;
}

/**
 * Creates given type of metric for every given url.
 * @private
 * @param {object} endpoints
 * @param {string} metricType
 * @param {string} metricPostfix
 * @param {string} metricDescription
 * @returns {Map} - Map of [entrypoint -> { metric, regexp}] entries.
 */
function createMetricForEndpoints(endpoints, metricType, metricPostfix, metricDescription) {
  const urlMetricMap = new Map();
  endpoints.forEach((url) => {
    // memoising metric name, in order not to perform multiple replacements on string on every request
    const metricName = memoiseName.call(
      this,
      url,
      metricPostfix,
      (name) =>
        `${name
          .slice(1)
          .replace(/[/\-.]/g, '_')
          .replace(/:/g, '')}${metricPostfix}`,
    );

    const metric = this.createMetric(metricType, {
      name: metricName,
      help: `${metricDescription} to the "${url}" API.`,
      labelNames: ['protocol', 'endpoint', 'method', 'code'],
    });
    this.logger.info(`A ${metricType} metric was created for ${url} with name ${metricName}`);

    metric.inc({ endpoint: url, method: 'GET', code: 200, protocol: DEFAULT_PROTOCOL }, 0);

    // match either plain url (like 'ui') or url followed by separator (? or / or #) and something
    const regexp = new RegExp(`^${url}([?/#].*)?$`);
    urlMetricMap.set(url, { metric, regexp });
  });

  return urlMetricMap;
}

/**
 * Creates middleware for counting requests to preconfigured endpoints.
 * @private
 * @returns {Function} - Middleware
 */
function getRequestCountersMiddleware() {
  this._urlCounters = createMetricForEndpoints.call(
    this,
    // @ts-ignore
    this.counterEndpoints,
    'counter',
    '_http_requests_total',
    'Total number of requests',
  );
  return (req, res, next) => {
    const url = req.originalUrl;
    const { method } = req;
    const counters = this._urlCounters;
    res.once('finish', () => {
      counters?.forEach(({ metric, regexp }, endpoint) => {
        if (url.match(regexp)) {
          metric.inc({ endpoint, method, code: res.statusCode, protocol: req.protocol });
        }
      });
    });
    next();
  };
}

/**
 * Creates middleware for aggregating response times to preconfigured endpoints.
 * @private
 * @returns {Function} - Middleware
 */
function getResponseTimeMiddleware() {
  this._urlResponseCounters = createMetricForEndpoints.call(
    this,
    // @ts-ignore
    this.counterEndpoints,
    'counter',
    '_http_response_times_total',
    'Total time (in ms) spent in backend with processing requests',
  );
  return (req, res, next) => {
    const startTime = Date.now();
    const url = req.originalUrl;
    const { method } = req;
    const counters = this._urlResponseCounters;
    res.once('finish', () => {
      counters?.forEach(({ metric, regexp }, endpoint) => {
        if (url.match(regexp)) {
          const leadTime = Date.now() - startTime;
          metric.inc({ endpoint, method, code: res.statusCode, protocol: req.protocol }, leadTime);
        }
      });
    });
    next();
  };
}

function checkParam(param, paramName) {
  if (typeof param === 'undefined') {
    throw new Error(`${paramName} is required, but was not provided`);
  }
}

class PmService {
  // TODO: remove temporary solution (config parameter) once logging and configManager are moved to the lib.
  /**
   * Performs initial setup of Prometheus client.
   *
   * @param {object} config - Set of configs.
   * @param {boolean} config.enabled - Enables/disables metric collection.
   * @param {string} config.appName - Application name, is used as metric name prefix.
   * @param {Array} [config.endpointsToCountRequests=[]] - Array of endpoints to count requests to.
   * @param {string} [config.endpointsPrefix="/"] - Common prefix of the endpoints to count requests to.
   * @param {object} [config.logger=SIMPLE_LOGGER] - Logger, if not provided, all log messages will
   * be sent to console.
   * @throws Will throw an error if `enabled` or `appName` is not passed.
   */
  constructor({
    enabled,
    appName,
    logger = SIMPLE_LOGGER,
    endpointsToCountRequests = [],
    endpointsPrefix = '/',
  }) {
    checkParam(enabled, 'enabled');
    checkParam(appName, 'appName');
    this._metrics = new Map();
    this._urlCounters = new Map();
    this._urlResponseCounters = new Map();
    this.disabled = true;
    this.names = {};
    this.logger = logger;
    const { counterHandler, gaugeHandler } = getHandlers(this.logger);
    this.counterHandler = counterHandler;
    this.gaugeHandler = gaugeHandler;

    this.disabled = !enabled;
    if (this.disabled) {
      this.shutDown();
      return;
    }
    this.counterEndpoints = endpointsToCountRequests.map((endpoint) =>
      path.join(endpointsPrefix, endpoint),
    );
    this.serviceName = appName;
    this.serviceMetricPrefix = this.serviceName.replace(/-/g, '_');
    const { register } = Prometheus;
    register.setDefaultLabels({
      app: this.serviceName,
    });
  }

  /**
   * Returns true if the service is enabled.
   *
   * @returns {boolean} On/Off state of the service.
   */
  isEnabled() {
    return !this.disabled;
  }

  /**
   * Create metric of a given type.
   *
   * @param {string} metricType - Possible values are: 'counter' or 'gauge'.
   * @param {object} options - Metric parameters.
   * @param {string} options.name - Suffix part of metric name.
   * @param {string} options.help - Short description of a metric.
   * @param {Array} [options.labelNames] - List of label names.
   * @returns {object} Wrapper object for metric.
   */
  createMetric(metricType, options) {
    const { name, help, labelNames } = options;
    const metricFullName = `${this.serviceMetricPrefix}_${name}`;
    let metric;
    let metricWrapper;

    if (this._metrics.has(name)) {
      this.logger.error(`Metric with name ${metricFullName} already exists`);
      return undefined;
    }

    switch (metricType) {
      case 'gauge': {
        metric = new Gauge({
          name: metricFullName,
          help: help || `Gauge metric with name ${metricFullName}.`,
          ...(labelNames ? { labelNames } : undefined),
        });
        metricWrapper = new Proxy(metric, this.gaugeHandler);
        break;
      }
      case 'counter': {
        metric = new Counter({
          name: metricFullName,
          help: help || `Counter metric with name ${metricFullName}.`,
          ...(labelNames ? { labelNames } : undefined),
        });
        metricWrapper = new Proxy(metric, this.counterHandler);
        break;
      }
      default:
        break;
    }

    this._metrics.set(name, metric);
    return metricWrapper;
  }

  /**
   * Delete a metric object by the suffix part of its name.
   *
   * @param {string} metricName - Inner metric name (without `appName` prefix).
   */
  deleteMetric(metricName) {
    const { register } = Prometheus;
    const metricFullName = `${this.serviceMetricPrefix}_${metricName}`;
    register.removeSingleMetric(metricFullName);
    this._metrics.delete(metricName);
  }

  /**
   * Resets Prometheus common registry to it's initial state.
   */
  resetPromClient() {
    const { register } = Prometheus;
    this._metrics.clear();
    this._urlCounters.clear();
    this._urlResponseCounters.clear();
    register.clear();
    this.names = {};
    register.setDefaultLabels({
      app: this.serviceName,
    });
  }

  /**
   * Applies prom-bundle middleware to an app to setup metrics collection.
   * Recommended to apply this before metrics exposure middleware.
   *
   * @param {object} app - Express app.
   * @param {object} [options] - Middleware options.
   * See {@link https://www.npmjs.com/package/express-prom-bundle|link} for additional details.
   * @param {object} [options.promClient] - Prom client settings.
   * @param {object} [options.promClient.collectDefaultMetrics = {}] - Settings for collecting
   * default metrics, by default all are collected.
   */
  applyMetricsCollectionMiddleware(app, options) {
    if (this.disabled) {
      return;
    }
    app.use(
      getMiddleware.call(this, options),
      getRequestCountersMiddleware.call(this),
      getResponseTimeMiddleware.call(this),
    );
  }

  /**
   * Applies prom-bundle middleware to an app to expose metrics to an endpoint.
   * Recommended to apply this after metrics collection middleware.
   *
   * @param {object} app - Express app for metrics endpoint.
   */
  applyMetricsExposureMiddleware(app) {
    if (this.disabled) {
      return;
    }
    app.use(getMiddleware.call(this).metricsMiddleware);
  }

  /**
   * Gracefully terminates `pmService`.
   */
  shutDown() {
    this.resetPromClient();
    // add additional disconnecting/closing logic here (if necessary)
  }
}

export default PmService;
