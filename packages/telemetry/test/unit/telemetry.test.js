import { expect } from 'chai';
import { trace, ROOT_CONTEXT, SpanKind, context } from '@opentelemetry/api';
import sinon from 'sinon';
import { EventEmitter } from 'events';
import { Agent } from 'https';
import Telemetry from '../../src/telemetry.js';

const SPAN_CONTEXT = {
  traceId: 'd4cda95b652f4a1592b449d5929fda1b',
  spanId: '6e0c63257de34c92',
  traceFlags: 0,
};

const TRACE_ID = '4309070db755388ca3b5f0af0059b229';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.42';
const URL = 'http://localhost:3001/ui-meta/v1/apps';
const PATH = '/ui-meta/v1/apps';
const HOST = 'localhost:3001';
const UPPER_BOUND_FOR_1 = 4294967295;
const PROBABILISTIC_STRATEGY_TYPE = 'probabilistic';
const OTEL_TRACES_SAMPLER_ARG = 1;
const DEFAULT_SAMPLING_RATIO = 0;
const DEFAULT_STRATEGY_SAMPLING_RATIO = 0.4;
const SERVICE_STRATEGY_SAMPLING_RATIO = 0.8;

const MOCK_REQUEST = {
  method: 'GET',
  url: URL,
  path: PATH,
  hostname: 'localhost',
  protocol: 'http',
  headers: {
    b3: `${TRACE_ID}-77abd05fb264a286-01`,
    'User-Agent': USER_AGENT,
    host: HOST,
  },
};

const MOCK_RESPONSE = {
  headers: {
    'Content-Length': 12345678910,
    'content-encoding': 'compressed',
  },
  statusMessage: '',
};

const SERVER_SPAN_ATTRIBUTES = {
  'http.url': URL,
  'http.method': 'GET',
  'http.user_agent': USER_AGENT,
  'http.target': PATH,
  'http.host': HOST,
  'http.scheme': 'http',
  'net.host.name': 'localhost',
};

const CLIENT_SPAN_ATTRIBUTES = {
  'http.url': URL,
  'http.method': 'GET',
  'http.user_agent': USER_AGENT,
  'http.target': PATH,
  'http.host': HOST,
  'net.peer.name': 'localhost',
};

const SERVICE_NAME = 'eric-adp-eiap-eea-oss-idun-base-platform-dummy-service';

describe('Unit tests for Telemetry', () => {
  let telemetry;

  before(() => {
    sinon.stub(process, 'env').value({
      OTEL_SERVICE_NAME: 'dummyService',
      K8S_SERVICE_VERSION: '0.0.1',
      K8S_NAMESPACE: 'k8s_ns_name',
      K8S_POD: 'k8s_pod_name',
      K8S_SERVICE_INSTANCE_ID: 'mock_id',
      K8S_CONTAINER: 'k8s_container_name',
      PROPAGATOR: 'b3',
      OTEL_TRACES_SAMPLER: 'parentbased_traceidratio',
      OTEL_TRACES_SAMPLER_ARG,
    });
    trace.disable();
    telemetry = new Telemetry({ serviceName: SERVICE_NAME });
  });

  it('can init tracer properly', () => {
    expect(telemetry.tracer).to.exist;
    expect(telemetry.tracer.instrumentationLibrary.name).to.eq(process.env.OTEL_SERVICE_NAME);
    expect(telemetry.tracer._sampler.constructor.name).to.eq('ParentBasedSampler');
    expect(telemetry.tracer._sampler._root.constructor.name).to.eq('TraceIdRatioBasedSampler');
    expect(telemetry.tracer._sampler._root._ratio).to.eq(OTEL_TRACES_SAMPLER_ARG);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * OTEL_TRACES_SAMPLER_ARG,
    );
  });

  it('can inject context', () => {
    const { headers } = telemetry.injectContext(trace.setSpanContext(ROOT_CONTEXT, SPAN_CONTEXT));
    const traceId = headers.b3.split('-')[0];
    expect(headers).to.exist;
    expect(traceId).to.eq(SPAN_CONTEXT.traceId);
  });

  it('can extract context', async () => {
    const activeContext = telemetry.extractContext(MOCK_REQUEST);
    expect(trace.getSpan(activeContext)?.spanContext().traceId).to.eq(TRACE_ID);
  });

  it('can create span and context', async () => {
    const { span, ctx } = telemetry.createSpan(MOCK_REQUEST, 0);

    expect(span).to.be.not.undefined;
    expect(ctx).to.be.not.undefined;

    span.end();
  });

  it('can create child span', async () => {
    const parent = telemetry.createSpan(MOCK_REQUEST, 0);
    const child = telemetry.createSpan(MOCK_REQUEST, 0, parent.ctx);

    expect(child.span.parentSpanId).to.not.be.undefined;
    expect(child.span.parentSpanId).to.eq(parent.span.spanContext().spanId);

    parent.span.end();
    child.span.end();
  });

  it('can set semantic attributes for a server kind span', () => {
    const attributes = telemetry.getHttpRequestSpanOptions(SpanKind.SERVER, MOCK_REQUEST);
    expect(attributes).to.deep.eq(SERVER_SPAN_ATTRIBUTES);
  });

  it('can set semantic attributes for a client kind span', () => {
    const attributes = telemetry.getHttpRequestSpanOptions(SpanKind.CLIENT, MOCK_REQUEST);
    expect(attributes).to.deep.eq(CLIENT_SPAN_ATTRIBUTES);
  });

  it('can set semantic attributes in case of response', () => {
    const testSpan = telemetry.createSpan(MOCK_REQUEST, SpanKind.SERVER);

    telemetry.setHttpResponseSpanOptions(testSpan.span, MOCK_RESPONSE);
    expect(testSpan.span.attributes).to.include({
      'http.response_content_length': 12345678910,
    });
    expect(testSpan.span.attributes).not.to.include({
      'http.status_code': 300,
    });
  });

  it('can set semantic attributes in case of bad client span response', () => {
    const res = { ...MOCK_RESPONSE, statusCode: 400 };
    const testSpan = telemetry.createSpan(MOCK_REQUEST, SpanKind.CLIENT);

    telemetry.setHttpResponseSpanOptions(testSpan.span, res);
    expect(testSpan.span.attributes).to.include({
      'http.status_code': res.statusCode,
      'http.response_content_length': res.headers['Content-Length'],
      'http.error_message': res.statusMessage,
    });
  });

  it('can set semantic attributes in case of bad server span response', () => {
    const res = { ...MOCK_RESPONSE, statusCode: 500 };
    const testSpan = telemetry.createSpan(MOCK_REQUEST, SpanKind.SERVER);

    telemetry.setHttpResponseSpanOptions(testSpan.span, res);
    expect(testSpan.span.attributes).to.include({
      'http.status_code': res.statusCode,
      'http.response_content_length': res.headers['Content-Length'],
      'http.error_message': res.statusMessage,
    });
  });

  it('getTraceId should return trace id of the active span ', () => {
    const activeContext = telemetry.extractContext(MOCK_REQUEST);
    const { span, ctx } = telemetry.createSpan(MOCK_REQUEST, SpanKind.SERVER, activeContext);
    context.with(ctx, () => {
      expect(telemetry.getTraceId()).to.equal(span._spanContext.traceId);
      span.end();
    });
  });

  it('getTraceId should not break when there is no active span', () => {
    expect(telemetry.getTraceId()).to.be.undefined;
  });

  it('should create and end a span for a request', (done) => {
    const res = new EventEmitter();
    Object.assign(res, MOCK_RESPONSE);

    const mockSpan = {
      end: sinon.stub(),
      spanContext: sinon.stub(),
      setAttributes: sinon.stub(),
      setStatus: sinon.stub(),
    };
    const startSpanStub = sinon
      .stub(trace.getTracer(process.env.OTEL_SERVICE_NAME), 'startSpan')
      .returns(mockSpan);

    telemetry.tracingMiddleware(MOCK_REQUEST, res, done);
    res.emit('finish').then(() => {
      expect(startSpanStub.calledOnce).to.be.true;
      expect(mockSpan.end.calledOnce).to.be.true;
      expect(res.on.calledWith('finish')).to.be.true;
    });
  });

  it('can refresh https Agent', async () => {
    const initAgent = new Agent({ cert: 'initialCert' });
    const telemetryWithAgent = new Telemetry({
      agent: initAgent,
      samplingRate: DEFAULT_SAMPLING_RATIO,
    });

    expect(telemetryWithAgent.exporter.agent.options.cert).to.eq('initialCert');

    const newAgent = new Agent({ cert: 'newCert' });
    telemetryWithAgent.refreshAgent(newAgent);

    expect(telemetryWithAgent.exporter.agent.options.cert).to.eq('newCert');
  });

  it('can turn off sampling with setting ratio from 1 to 0', () => {
    expect(telemetry.tracer._sampler._root._ratio).to.eq(OTEL_TRACES_SAMPLER_ARG);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * OTEL_TRACES_SAMPLER_ARG,
    );

    telemetry.refreshRatio({
      service_strategies: [
        {
          service: SERVICE_NAME,
          type: PROBABILISTIC_STRATEGY_TYPE,
          param: DEFAULT_SAMPLING_RATIO,
        },
      ],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(DEFAULT_SAMPLING_RATIO);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(DEFAULT_SAMPLING_RATIO);
  });

  it('can refresh sampler ratio from default strategy', () => {
    telemetry.refreshRatio({
      service_strategies: [],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(DEFAULT_STRATEGY_SAMPLING_RATIO);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * DEFAULT_STRATEGY_SAMPLING_RATIO,
    );
  });

  it('can refresh sampler ratio from service strategy', () => {
    telemetry.refreshRatio({
      service_strategies: [
        {
          service: SERVICE_NAME,
          type: PROBABILISTIC_STRATEGY_TYPE,
          param: SERVICE_STRATEGY_SAMPLING_RATIO,
        },
      ],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(SERVICE_STRATEGY_SAMPLING_RATIO);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * SERVICE_STRATEGY_SAMPLING_RATIO,
    );
  });

  it('can refresh sampler ratio from default strategy as fallback if no matching service strategy is found', () => {
    telemetry.refreshRatio({
      service_strategies: [
        {
          service: 'other-service',
          type: PROBABILISTIC_STRATEGY_TYPE,
          param: SERVICE_STRATEGY_SAMPLING_RATIO,
        },
      ],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(DEFAULT_STRATEGY_SAMPLING_RATIO);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * DEFAULT_STRATEGY_SAMPLING_RATIO,
    );
  });

  it('can refresh sampler ratio from default strategy as fallback if service strategy type is not supported', () => {
    telemetry.refreshRatio({
      service_strategies: [
        {
          service: SERVICE_NAME,
          type: 'n/a',
          param: SERVICE_STRATEGY_SAMPLING_RATIO,
        },
      ],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(DEFAULT_STRATEGY_SAMPLING_RATIO);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * DEFAULT_STRATEGY_SAMPLING_RATIO,
    );
  });

  it('can reset sampler ratio to initial value as fallback if default strategy type is not supported', () => {
    telemetry.refreshRatio({
      service_strategies: [],
      default_strategy: {
        type: 'n/a',
        param: DEFAULT_STRATEGY_SAMPLING_RATIO,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(OTEL_TRACES_SAMPLER_ARG);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * OTEL_TRACES_SAMPLER_ARG,
    );
  });

  it('can reset sampler ratio to initial value as fallback if default strategy ratio is missing', () => {
    telemetry.refreshRatio({
      service_strategies: [],
      default_strategy: {
        type: PROBABILISTIC_STRATEGY_TYPE,
      },
    });

    expect(telemetry.tracer._sampler._root._ratio).to.eq(OTEL_TRACES_SAMPLER_ARG);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * OTEL_TRACES_SAMPLER_ARG,
    );
  });

  it('can reset sampler ratio to initial value as fallback if input config is undefined', () => {
    telemetry.refreshRatio({});

    expect(telemetry.tracer._sampler._root._ratio).to.eq(OTEL_TRACES_SAMPLER_ARG);
    expect(telemetry.tracer._sampler._root._upperBound).to.eq(
      UPPER_BOUND_FOR_1 * OTEL_TRACES_SAMPLER_ARG,
    );
  });
});

describe('Telemetry constructor test without parameters', () => {
  it('can init tracer without sampling rate env, falling back to default constant', () => {
    sinon.stub(process, 'env').value({
      OTEL_SERVICE_NAME: 'dummyService',
      K8S_SERVICE_VERSION: '0.0.1',
      K8S_NAMESPACE: 'k8s_ns_name',
      K8S_POD: 'k8s_pod_name',
      K8S_SERVICE_INSTANCE_ID: 'mock_id',
      K8S_CONTAINER: 'k8s_container_name',
      PROPAGATOR: 'b3',
      OTEL_TRACES_SAMPLER: 'parentbased_traceidratio',
    });
    trace.disable();
    const telemetryWithoutParams = new Telemetry();
    expect(telemetryWithoutParams).to.exist;
    expect(telemetryWithoutParams).not.to.be.undefined;
    expect(telemetryWithoutParams.tracer._sampler._root._ratio).to.eq(DEFAULT_SAMPLING_RATIO);
  });
});
