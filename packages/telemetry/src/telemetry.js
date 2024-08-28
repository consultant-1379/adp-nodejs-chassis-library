import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAMESPACE,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_K8S_NAMESPACE_NAME,
  SEMRESATTRS_K8S_POD_NAME,
  SEMRESATTRS_K8S_POD_UID,
  SEMRESATTRS_K8S_CONTAINER_NAME,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
} from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor, ParentBasedSampler } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { trace, context, propagation, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { getAbsoluteUrl, isCompressed, getRatioBaseSampler } from './utils.js';

const DEFAULT_SAMPLING_RATE = 0.0;
const SUPPORTED_STRATEGY_TYPES = ['probabilistic'];

class Telemetry {
  /**
   * Performs initial setup of OpenTelemetry.
   *
   * @param { object } options - Initial parameters.
   */
  constructor(options = { agent: null }) {
    const { agent, serviceName } = options;
    if (!this.tracer) {
      this.tracer = this.#initTracer(agent);
    }
    this.tracingMiddleware = this.tracingMiddleware.bind(this);
    this._spanKindServerId = SpanKind.SERVER;
    this._spanKindClientId = SpanKind.CLIENT;
    this.serviceName = serviceName;
  }

  /**
   * Refreshes the http(s) Agent of the exporter.
   *
   * @param {object} agent - New http(s) Agent with updated options.
   */
  refreshAgent(agent) {
    this.exporter.agent = agent;
  }

  /**
   * Sets a given ratio for the sampler based on config JSON.
   * If applicable, service strategy is applied over default strategy.
   * Fallback to initially set ratio if no suitable value found.
   *
   * @param {*} dstConfig - The sampling config JSON.
   */
  refreshRatio(dstConfig) {
    if (!dstConfig) {
      this.traceRatioSampler.ratio = this.initialSamplingRate;
      return;
    }
    const defaultStrategy = dstConfig.default_strategy;
    const serviceStrategy = dstConfig.service_strategies?.find(
      (strategy) => strategy.service === this.serviceName,
    );
    if (
      SUPPORTED_STRATEGY_TYPES.includes(serviceStrategy?.type) &&
      typeof serviceStrategy?.param === 'number'
    ) {
      this.traceRatioSampler.ratio = serviceStrategy.param;
    } else if (
      SUPPORTED_STRATEGY_TYPES.includes(defaultStrategy?.type) &&
      typeof defaultStrategy?.param === 'number'
    ) {
      this.traceRatioSampler.ratio = defaultStrategy.param;
    } else {
      this.traceRatioSampler.ratio = this.initialSamplingRate;
    }
  }

  #initTracer(agent) {
    const {
      OTEL_SERVICE_NAME,
      OTEL_TRACES_SAMPLER = 'parentbased_traceidratio',
      OTEL_TRACES_SAMPLER_ARG,
      K8S_SERVICE_VERSION,
      K8S_NAMESPACE,
      K8S_POD,
      K8S_SERVICE_INSTANCE_ID,
      K8S_CONTAINER,
      PROPAGATOR,
    } = process.env;
    const contextManager = new AsyncHooksContextManager();
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
    this.initialSamplingRate = OTEL_TRACES_SAMPLER_ARG
      ? parseFloat(OTEL_TRACES_SAMPLER_ARG)
      : DEFAULT_SAMPLING_RATE;
    this.traceRatioSampler = getRatioBaseSampler(this.initialSamplingRate);
    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAMESPACE]: K8S_NAMESPACE || 'N/A',
        [SEMRESATTRS_SERVICE_NAME]: OTEL_SERVICE_NAME || 'N/A',
        [SEMRESATTRS_SERVICE_INSTANCE_ID]: K8S_SERVICE_INSTANCE_ID || 'N/A',
        [SEMRESATTRS_SERVICE_VERSION]: K8S_SERVICE_VERSION || 'N/A',
        [SEMRESATTRS_K8S_NAMESPACE_NAME]: K8S_NAMESPACE || 'N/A',
        [SEMRESATTRS_K8S_POD_NAME]: K8S_POD || 'N/A',
        [SEMRESATTRS_K8S_POD_UID]: K8S_SERVICE_INSTANCE_ID || 'N/A',
        [SEMRESATTRS_K8S_CONTAINER_NAME]: K8S_CONTAINER || 'N/A',
      }),
      sampler:
        OTEL_TRACES_SAMPLER === 'parentbased_traceidratio'
          ? new ParentBasedSampler({ root: this.traceRatioSampler })
          : this.traceRatioSampler,
    });
    this.exporter = new OTLPTraceExporter({ keepAlive: true });
    this.refreshAgent(agent);

    provider.addSpanProcessor(new BatchSpanProcessor(this.exporter));

    const propagator =
      PROPAGATOR === 'tracecontext'
        ? new W3CTraceContextPropagator()
        : new B3Propagator({ injectEncoding: 0 });

    provider.register({
      contextManager,
      propagator,
    });
    return trace.getTracer(OTEL_SERVICE_NAME);
  }

  /**
   * Returns the numerical representation of spanKind Server.
   *
   * @returns {number} Return the spanKind Server id.
   */
  get spanKindServerId() {
    return this._spanKindServerId;
  }

  /**
   * Returns the numerical representation of spanKind Client.
   *
   * @returns {number} Return the spanKind Client id.
   */
  get spanKindClientId() {
    return this._spanKindClientId;
  }

  /**
   * Returns the trace id of the current active span.
   *
   * @returns {string} Return trace id of the current span.
   */
  getTraceId() {
    return trace.getActiveSpan()?.spanContext().traceId;
  }

  /**
   * Serialize the propagation fields from context into
   * an output object.
   *
   * @param {object} ctx - The context for serialize the propagation fields,
   * by default it's the active context.
   * @returns {object} Returns the carrier object.
   */
  injectContext(ctx = context.active()) {
    const carrier = {};
    propagation.inject(ctx, carrier);
    return { headers: carrier };
  }

  /**
   * Extracts the propagation fields data into a context object.
   *
   * @param {object} req - HTTP request that contains the propagation fields.
   * @param {object} activeContext - A context for extracting the propagation fields into it,
   * by default it's the active context.
   * @returns {object} Returns the updated context.
   */
  extractContext(req, activeContext = context.active()) {
    const { headers } = req;
    return propagation.extract(activeContext, headers);
  }

  /**
   * Returns the initial semantic attributes of the span.
   *
   * @param {number} spanKind -  The kind of the Span which has these attributes.
   * @param {object} req - Request for the span.
   * @returns {object} Returns the attributes.
   */
  getHttpRequestSpanOptions(spanKind, req) {
    const userAgent = req.headers?.['User-Agent'];
    const attributes = {
      [SEMATTRS_HTTP_URL]: getAbsoluteUrl(req),
      [SEMATTRS_HTTP_METHOD]: req.method,
      ...(userAgent && {
        [SEMATTRS_HTTP_USER_AGENT]: userAgent,
      }),
      [SEMATTRS_HTTP_TARGET]: req.path,
      [SEMATTRS_HTTP_HOST]: req.headers?.host ?? req.hostname,
    };
    if (spanKind === SpanKind.SERVER) {
      attributes[SEMATTRS_HTTP_SCHEME] = req.protocol;
      attributes[SEMATTRS_NET_HOST_NAME] = req.hostname;
    }
    if (spanKind === SpanKind.CLIENT) {
      attributes[SEMATTRS_NET_PEER_NAME] = req.hostname;
    }
    return attributes;
  }

  /**
   * Sets status for a span.
   *
   * @param {object} span - The span for which the status is set.
   * @param {object} res - Response object for the span.
   */
  #setSpanStatus(span, res) {
    const statusCode = res.statusCode || res.status;
    const upperBound = span.kind === SpanKind.CLIENT ? 400 : 500;
    // 1xx, 2xx, 3xx are OK on client and server // 4xx is OK on server
    if (statusCode && statusCode >= 100 && statusCode < upperBound) {
      span.setStatus(SpanStatusCode.UNSET);
    } else {
      // All other codes are error
      span.setStatus({ code: SpanStatusCode.ERROR, message: res.statusMessage ?? '' });
      span.setAttributes({
        'http.error_message': res.statusMessage ?? '',
      });
    }
  }

  /**
   * Sets HTTP response options for a span.
   *
   * @param {object} span - Span.
   * @param {object} res - Response for the span.
   */
  setHttpResponseSpanOptions(span, res) {
    const statusCode = res.statusCode || res.status;
    const attributes = {
      ...(statusCode && {
        [SEMATTRS_HTTP_STATUS_CODE]: statusCode,
      }),
    };

    if (res.headers) {
      const contentLengthAttribute = isCompressed(res.headers)
        ? SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH
        : SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;

      attributes[contentLengthAttribute] = res.headers['Content-Length'];
    }

    span.setAttributes(attributes);

    this.#setSpanStatus(span, res);
  }

  /**
   * Creates a span and sets context for it.
   *
   * @param {object} req - Request for creating a span from it.
   * @param {object} spanKind - SpanKind of the span.
   * @param {object} activeContext - A context where the span will be created,
   * by default it's the active context.
   * @returns {object} Returns the created span with its context.
   */
  createSpan(req, spanKind, activeContext = context.active()) {
    const spanAttributes = this.getHttpRequestSpanOptions(spanKind, req);
    const spanName = `${req.method} ${req.url ?? ''}`;
    const span = this.tracer.startSpan(
      spanName,
      {
        kind: spanKind,
        attributes: spanAttributes,
      },
      activeContext,
    );
    const ctx = trace.setSpanContext(activeContext, span.spanContext());
    return { span, ctx };
  }

  /**
   * Middleware function to add distributed tracing functionality to HTTP requests.
   *
   * @param {object} req - HTTP request object.
   * @param {object} res - HTTP response object.
   * @param {object} next - Callback function, will be called after the middleware is done.
   */
  tracingMiddleware(req, res, next) {
    const activeContext = this.extractContext(req);
    const { span, ctx } = this.createSpan(req, SpanKind.SERVER, activeContext);
    context.with(ctx, () => {
      res.on('finish', () => {
        this.setHttpResponseSpanOptions(span, res);
        span.end();
      });
      next();
    });
  }
}

export default Telemetry;
