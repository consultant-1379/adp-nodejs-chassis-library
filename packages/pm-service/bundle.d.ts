declare module "metrics/proxyHandlers" {
    /**
     * @private
     * @param {Object} logger
     * @returns {Object}
     */
    export function getHandlers(logger: any): any;
}
declare module "pmService" {
    export default PmService;
    class PmService {
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
        constructor({ enabled, appName, logger, endpointsToCountRequests, endpointsPrefix, }: {
            enabled: boolean;
            appName: string;
            endpointsToCountRequests?: any[];
            endpointsPrefix?: string;
            logger?: object;
        });
        _metrics: Map<any, any>;
        _urlCounters: Map<any, any>;
        _urlResponseCounters: Map<any, any>;
        disabled: boolean;
        names: {};
        logger: any;
        counterHandler: any;
        gaugeHandler: any;
        counterEndpoints: string[];
        serviceName: string;
        serviceMetricPrefix: string;
        /**
         * Returns true if the service is enabled.
         *
         * @returns {boolean} On/Off state of the service.
         */
        isEnabled(): boolean;
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
        createMetric(metricType: string, options: {
            name: string;
            help: string;
            labelNames?: any[];
        }): object;
        /**
         * Delete a metric object by the suffix part of its name.
         *
         * @param {string} metricName - Inner metric name (without `appName` prefix).
         */
        deleteMetric(metricName: string): void;
        /**
         * Resets Prometheus common registry to it's initial state.
         */
        resetPromClient(): void;
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
        applyMetricsCollectionMiddleware(app: object, options?: {
            promClient?: {
                collectDefaultMetrics?: object;
            };
        }): void;
        /**
         * Applies prom-bundle middleware to an app to expose metrics to an endpoint.
         * Recommended to apply this after metrics collection middleware.
         *
         * @param {object} app - Express app for metrics endpoint.
         */
        applyMetricsExposureMiddleware(app: object): void;
        /**
         * Gracefully terminates `pmService`.
         */
        shutDown(): void;
    }
}
declare module "index" {
    export { PmService as PerformanceMonitoring };
    import PmService from "pmService";
}
