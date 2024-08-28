import supertest from 'supertest';
import os from 'os';
import { expect } from 'chai';
import * as Prometheus from 'prom-client';
import sinon from 'sinon';

const CONTENT_TYPE = 'Content-Type';
const APP = 'current_app_name';
const DIFFERENT_CODE = 418;
const METRIC = 'http_requests_total';

const logger = {
  error: (message) => ({ logLevel: 'error', message }),
  info: (message) => ({ logLevel: 'info', message }),
};
// TODO: when configManager and logger are moved and directly imported to pmService, rewire them here
const rewirePmService = async () => (await import('../../src/index.js')).PerformanceMonitoring;

let express;
let appRequest;
let metricRequest;
let appServer;
let metricServer;
let app;
let metricApp;

const preparePmService = async (endpoints) => {
  express = (await import('express')).default;
  app = express();
  appServer = app.listen();
  appRequest = supertest.agent(appServer);
  metricApp = express();
  metricServer = metricApp.listen();
  metricRequest = supertest.agent(metricServer);

  const config = {
    enabled: endpoints.length > 0,
    appName: APP,
    endpointsToCountRequests: endpoints,
    logger,
    useHttps: () => false,
    getHttpsOptions: () => true,
    getUiServiceCertificatePath: () => '/',
  };

  const PmService = await rewirePmService();
  const pmServiceInst = new PmService(config);
  pmServiceInst.applyMetricsCollectionMiddleware(app);
  pmServiceInst.applyMetricsExposureMiddleware(metricApp);
  return pmServiceInst;
};

const closePmService = (done, pmService) => {
  pmService.shutDown();
  appServer.close(done);
  metricServer.close();
};

const dummyMiddleware = (req, res, next) => {
  res.send('OK');
  next();
};

const failedMiddleware = (req, res, next) => {
  res.status(DIFFERENT_CODE).end();
  next();
};

const checkCounter =
  (metricName, counterValue, code = 200, exactMatch = true) =>
  async () => {
    const { register } = Prometheus;
    const counter = register.getSingleMetric(metricName);
    expect(counter).not.to.be.undefined;
    const counterContent = await counter.get();
    const metric = counterContent.values.find((value) => value.labels.code === code);
    expect(metric).to.be.not.undefined;
    if (exactMatch) {
      expect(metric.value).to.equal(counterValue);
    } else {
      expect(metric.value).to.be.greaterThanOrEqual(counterValue);
    }
  };

const performAppRequestAndCheckCounter = async (
  endpoint,
  metricName,
  expectedNumber,
  responseCode = 200,
  exactMatch = true,
) =>
  appRequest
    .get(endpoint)
    .expect(responseCode)
    .then(checkCounter(metricName, expectedNumber, responseCode, exactMatch));

describe('Unit tests for PmService', () => {
  describe('Testing disabled pmService', () => {
    let pmServiceInst;

    before(async () => {
      pmServiceInst = await preparePmService([]);
    });

    after((done) => {
      closePmService(done, pmServiceInst);
    });

    it('should be disabled', () => {
      expect(pmServiceInst.isEnabled()).to.be.false;
    });

    it('should not have any metrics', () => {
      const { register } = Prometheus;
      expect(register.getMetricsAsArray()).to.be.empty;
    });

    it('should not have "/metrics" endpoint', (done) => {
      metricRequest.get('/metrics').expect(404, done);
    });
  });

  describe('Testing default operations', async () => {
    const API_URL = 'anyurl';

    const DEFAULT_METRICS = [
      'process_cpu_user_seconds_total',
      'process_cpu_system_seconds_total',
      'process_cpu_seconds_total',
      'process_start_time_seconds',
      'process_resident_memory_bytes',
      'nodejs_eventloop_lag_seconds',
      'nodejs_eventloop_lag_min_seconds',
      'nodejs_eventloop_lag_max_seconds',
      'nodejs_eventloop_lag_mean_seconds',
      'nodejs_eventloop_lag_stddev_seconds',
      'nodejs_eventloop_lag_p50_seconds',
      'nodejs_eventloop_lag_p90_seconds',
      'nodejs_eventloop_lag_p99_seconds',
      'nodejs_active_handles',
      'nodejs_active_handles_total',
      'nodejs_active_requests',
      'nodejs_active_requests_total',
      'nodejs_heap_size_total_bytes',
      'nodejs_heap_size_used_bytes',
      'nodejs_external_memory_bytes',
      'nodejs_heap_space_size_total_bytes',
      'nodejs_heap_space_size_used_bytes',
      'nodejs_heap_space_size_available_bytes',
      'nodejs_version_info',
      'nodejs_gc_duration_seconds',
      'http_request_duration_seconds',
    ];

    if (os.type() !== 'Windows_NT') {
      DEFAULT_METRICS.push(
        'process_virtual_memory_bytes',
        'process_heap_bytes',
        'process_open_fds',
        'process_max_fds',
      );
    }

    let pmServiceInst;

    before(async () => {
      pmServiceInst = await preparePmService([`/${API_URL}`]);
    });

    after((done) => {
      closePmService(done, pmServiceInst);
    });

    it('should be enabled', () => {
      expect(pmServiceInst.isEnabled()).to.be.true;
    });

    it('should collect default metrics', () => {
      const { register } = Prometheus;
      DEFAULT_METRICS.forEach(
        (metricName) =>
          expect(
            register.getSingleMetric(`${APP}_${metricName}`),
            `metric ${APP}_${metricName} is absent`,
          ).not.to.be.undefined,
      );
    });

    it('should add "/metrics" endpoint', (done) => {
      metricRequest
        .get('/metrics')
        .expect(CONTENT_TYPE, /text\/plain/)
        .expect((response) => {
          expect(response.text).to.have.string(DEFAULT_METRICS[0]);
        })
        .expect(200, done);
    });

    it('should be able to create and delete metric', () => {
      const { register } = Prometheus;
      const GAUGE_METRIC_NAME = 'pods_total';
      const FULL_GAUGE_METRIC_NAME = `${pmServiceInst.serviceMetricPrefix}_${GAUGE_METRIC_NAME}`;

      pmServiceInst.createMetric('gauge', { name: GAUGE_METRIC_NAME });
      const createdMetric = register.getSingleMetric(FULL_GAUGE_METRIC_NAME);
      expect(createdMetric).not.to.be.undefined;
      expect(pmServiceInst._metrics.get(GAUGE_METRIC_NAME)).not.to.be.undefined;

      pmServiceInst.deleteMetric(GAUGE_METRIC_NAME);
      const deletedMetric = register.getSingleMetric(FULL_GAUGE_METRIC_NAME);
      expect(deletedMetric).to.be.undefined;
      expect(pmServiceInst._metrics.get(GAUGE_METRIC_NAME)).to.be.undefined;
    });

    it('should call logger error when tries to create metric with already existing name', () => {
      const sandbox = sinon.createSandbox();
      sandbox.spy(logger);

      const METRIC_NAME = 'pods_total';
      const metricFullName = `${pmServiceInst.serviceMetricPrefix}_${METRIC_NAME}`;

      pmServiceInst.createMetric('gauge', { name: METRIC_NAME });
      pmServiceInst.createMetric('gauge', { name: METRIC_NAME });
      expect(logger.error.calledOnce).to.be.true;
      expect(logger.error.calledWith(`Metric with name ${metricFullName} already exists`)).to.be
        .true;
    });

    it('should be able to clear metrics', () => {
      const { register } = Prometheus;
      pmServiceInst.resetPromClient();
      [...DEFAULT_METRICS, API_URL].forEach(
        (metricName) =>
          expect(register.getSingleMetric(metricName), `mertic ${metricName} is absent`).to.be
            .undefined,
      );
    });
  });

  describe('Testing metricRequest counters', async () => {
    const API_FOR_COUNTER = 'someapi';
    const OTHER_API_FOR_COUNTER = 'other';
    const ROUTER_BASE_ENDPOINT = 'base';
    const ROUTER_OWN_ENDPOINT = 'own';

    const endpoints = [
      `/${API_FOR_COUNTER}`,
      `/${OTHER_API_FOR_COUNTER}`,
      `/${ROUTER_BASE_ENDPOINT}/${ROUTER_OWN_ENDPOINT}`,
    ];

    let pmServiceInst;

    before(async () => {
      pmServiceInst = await preparePmService(endpoints);
    });

    after((done) => {
      closePmService(done, pmServiceInst);
    });

    it('should be able to add counters for custom endpoints', async () => {
      const endpoint = `/${API_FOR_COUNTER}`;
      const metricName = `${APP}_${API_FOR_COUNTER}_${METRIC}`;
      const metricDescription = `Total number of requests to the "${endpoint}" API.`;
      app.get(endpoint, dummyMiddleware);
      await performAppRequestAndCheckCounter(endpoint, metricName, 1);
      await performAppRequestAndCheckCounter(`${endpoint}?a=1`, metricName, 2);
      await metricRequest
        .get('/metrics')
        .expect(CONTENT_TYPE, /text\/plain/)
        .expect((response) => {
          expect(response.text).to.have.string(metricName);
          expect(response.text).to.have.string(metricDescription);
        });
    });

    it('should be able to add counters for "use" method to custom endpoints', async () => {
      const endpoint = `/${OTHER_API_FOR_COUNTER}`;
      const metricName = `${APP}_${OTHER_API_FOR_COUNTER}_${METRIC}`;
      app.use(endpoint, dummyMiddleware);
      await performAppRequestAndCheckCounter(endpoint, metricName, 1);
      await performAppRequestAndCheckCounter(`${endpoint}/more`, metricName, 2);
    });

    it('should be able to add counters for routers with custom endpoints and handle error codes', async () => {
      const endpoint = `/${ROUTER_BASE_ENDPOINT}/${ROUTER_OWN_ENDPOINT}`;
      const metricName = `${APP}_${ROUTER_BASE_ENDPOINT}_${ROUTER_OWN_ENDPOINT}_${METRIC}`;
      const router = express.Router();
      router.get(`/${ROUTER_OWN_ENDPOINT}`, failedMiddleware);
      app.use(`/${ROUTER_BASE_ENDPOINT}`, router);
      await performAppRequestAndCheckCounter(endpoint, metricName, 1, DIFFERENT_CODE);
    });
  });

  describe('Testing response time metric', async () => {
    const API_FOR_RESPONSE_TIME = 'newapi';
    const LATENCY = 100;
    let pmServiceInst;

    before(async () => {
      pmServiceInst = await preparePmService([`/${API_FOR_RESPONSE_TIME}`]);
    });

    after((done) => {
      closePmService(done, pmServiceInst);
    });

    it('should be able to add response time counters for custom endpoints', async () => {
      app.use((req, res, next) => {
        setTimeout(() => next(), LATENCY);
      });
      const endpoint = `/${API_FOR_RESPONSE_TIME}`;
      const metricName = `${APP}_${API_FOR_RESPONSE_TIME}_http_response_times_total`;
      const metricDescription = `Total time (in ms) spent in backend with processing requests to the "${endpoint}" API.`;
      app.get(endpoint, dummyMiddleware);

      await performAppRequestAndCheckCounter(endpoint, metricName, 1 * LATENCY, 200, false);
      await performAppRequestAndCheckCounter(
        `${endpoint}?a=1`,
        metricName,
        2 * LATENCY,
        200,
        false,
      );

      await metricRequest
        .get('/metrics')
        .expect(CONTENT_TYPE, /text\/plain/)
        .expect((response) => {
          expect(response.text).to.have.string(metricName);
          expect(response.text).to.have.string(metricDescription);
        });
    });
  });

  describe('Testing URL to metric match', async () => {
    let pmServiceInst;

    afterEach((done) => {
      closePmService(done, pmServiceInst);
    });

    it('should not increase metric when its endpoint prefix is included in a longer URL', async () => {
      pmServiceInst = await preparePmService([`/ui`, `/ui-meta`]);
      const router = express.Router();
      router.get(`/a.js`, dummyMiddleware);
      app.use('/ui-meta', router);
      app.get('/ui-meta', dummyMiddleware);

      await performAppRequestAndCheckCounter('/ui-meta', `${APP}_ui_meta_${METRIC}`, 1);
      await performAppRequestAndCheckCounter(`/ui-meta?a=1`, `${APP}_ui_meta_${METRIC}`, 2);
      await performAppRequestAndCheckCounter(`/ui-meta#abc`, `${APP}_ui_meta_${METRIC}`, 3);
      await performAppRequestAndCheckCounter(`/ui-meta/a.js`, `${APP}_ui_meta_${METRIC}`, 4);

      await checkCounter(`${APP}_ui_${METRIC}`, 0);
    });

    it('should not increase metric when its endpoint prefix contains URL of other metric', async () => {
      pmServiceInst = await preparePmService([`/ui`, `/ui-meta`]);
      const router = express.Router();
      router.get(`/a.js`, dummyMiddleware);
      app.use('/ui', router);
      app.get('/ui', dummyMiddleware);

      await performAppRequestAndCheckCounter('/ui', `${APP}_ui_${METRIC}`, 1);
      await performAppRequestAndCheckCounter(`/ui?a=1`, `${APP}_ui_${METRIC}`, 2);
      await performAppRequestAndCheckCounter(`/ui#abc`, `${APP}_ui_${METRIC}`, 3);
      await performAppRequestAndCheckCounter(`/ui/a.js`, `${APP}_ui_${METRIC}`, 4);
      await performAppRequestAndCheckCounter(`/ui/a.js?b`, `${APP}_ui_${METRIC}`, 5);

      await checkCounter(`${APP}_ui_meta_${METRIC}`, 0);
    });

    it('should only increase corresponding metrics for routed URL', async () => {
      pmServiceInst = await preparePmService([`/ui`, `/ui-meta`, `/ui/sub`]);
      const router = express.Router();
      router.get(`/sub`, dummyMiddleware);
      app.use(`/ui`, router);

      await performAppRequestAndCheckCounter('/ui/sub', `${APP}_ui_${METRIC}`, 1);
      await performAppRequestAndCheckCounter('/ui/sub', `${APP}_ui_sub_${METRIC}`, 2);
      await performAppRequestAndCheckCounter('/ui/sub#abc', `${APP}_ui_sub_${METRIC}`, 3);

      await checkCounter(`${APP}_ui_meta_${METRIC}`, 0);
    });
  });
});
