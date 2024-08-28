declare module "utils" {
    export function getAbsoluteUrl(req: any): string;
    export function isCompressed(headers: any): boolean;
    /**
     * Returns a sampler with a given default sampling rate.
     *
     * @param {number} defaultRatio - Default sampling rate.
     * @returns {object} Returns the custom sampler.
     */
    export function getRatioBaseSampler(defaultRatio: number): object;
}
declare module "telemetry" {
    export default Telemetry;
    class Telemetry {
        /**
         * Performs initial setup of OpenTelemetry.
         *
         * @param { object } options - Initial parameters.
         */
        constructor(options?: object);
        tracer: import("@opentelemetry/api").Tracer;
        /**
         * Middleware function to add distributed tracing functionality to HTTP requests.
         *
         * @param {object} req - HTTP request object.
         * @param {object} res - HTTP response object.
         * @param {object} next - Callback function, will be called after the middleware is done.
         */
        tracingMiddleware(req: object, res: object, next: object): void;
        _spanKindServerId: SpanKind;
        _spanKindClientId: SpanKind;
        serviceName: any;
        /**
         * Refreshes the http(s) Agent of the exporter.
         *
         * @param {object} agent - New http(s) Agent with updated options.
         */
        refreshAgent(agent: object): void;
        /**
         * Sets a given ratio for the sampler based on config JSON.
         *
         * @param {*} dstConfig - The sampling config JSON.
         */
        refreshRatio(dstConfig: any): void;
        traceRatioSampler: any;
        exporter: OTLPTraceExporter;
        /**
         * Returns the numerical representation of spanKind Server.
         *
         * @returns {number} Return the spanKind Server id.
         */
        get spanKindServerId(): number;
        /**
         * Returns the numerical representation of spanKind Client.
         *
         * @returns {number} Return the spanKind Client id.
         */
        get spanKindClientId(): number;
        /**
         * Returns the trace id of the current active span.
         *
         * @returns {string} Return trace id of the current span.
         */
        getTraceId(): string;
        /**
         * Serialize the propagation fields from context into
         * an output object.
         *
         * @param {object} ctx - The context for serialize the propagation fields,
         * by default it's the active context.
         * @returns {object} Returns the carrier object.
         */
        injectContext(ctx?: object): object;
        /**
         * Extracts the propagation fields data into a context object.
         *
         * @param {object} req - HTTP request that contains the propagation fields.
         * @param {object} activeContext - A context for extracting the propagation fields into it,
         * by default it's the active context.
         * @returns {object} Returns the updated context.
         */
        extractContext(req: object, activeContext?: object): object;
        /**
         * Returns the initial semantic attributes of the span.
         *
         * @param {number} spanKind -  The kind of the Span which has these attributes.
         * @param {object} req - Request for the span.
         * @returns {object} Returns the attributes.
         */
        getHttpRequestSpanOptions(spanKind: number, req: object): object;
        /**
         * Sets HTTP response options for a span.
         *
         * @param {object} span - Span.
         * @param {object} res - Response for the span.
         */
        setHttpResponseSpanOptions(span: object, res: object): void;
        /**
         * Creates a span and sets context for it.
         *
         * @param {object} req - Request for creating a span from it.
         * @param {object} spanKind - SpanKind of the span.
         * @param {object} activeContext - A context where the span will be created,
         * by default it's the active context.
         * @returns {object} Returns the created span with its context.
         */
        createSpan(req: object, spanKind: object, activeContext?: object): object;
        #private;
    }
    import { SpanKind } from "@opentelemetry/api";
    import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http/build/src/platform/node/OTLPTraceExporter";
}
declare module "index" {
    export default Telemetry;
    import Telemetry from "telemetry";
}
