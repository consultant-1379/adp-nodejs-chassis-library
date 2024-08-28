declare module "network/networkUtil" {
    /**
     * Removes trailing slash from the input string, if present.
     *
     * @param {string} urlSegment - The input string.
     * @returns {string} Same string without the trailing slash, if there was one.
     */
    export function normalizeURLEnding(urlSegment: string): string;
    /**
     * Removes leading slash from the input string, if present.
     *
     * @param {string} urlSegment - The input string.
     * @returns {string} Same string without the leading slash, if there was one.
     */
    export function normalizeURLSegment(urlSegment: string): string;
    /**
     * Accepts a request and updates its body with url encoded formats.
     *
     * @param {object} request - Request object.
     * @returns {object} Request with updated body for form request.
     */
    export function parseJsonRequestBody(request: object): object;
    /**
     * A function for requesting data inside the kubernetes namespace.
     *
     * @param {object} params - A set of parameters.
     * @param {string} params.serviceName - The name of the service whose tlsAgent will be used for the request.
     * @param {string} params.protocol - The protocol that will be used either http or https.
     * @param {string} params.url - The url of the request to be sent.
     * @param {object} params.certificateManager - The instance of the CertificateManager that has the service's certificates.
     * @param {object} params.dstService - The instance of the DstService which will be used for telemetry.
     * @param {object} [params.headers] - Headers that will be added to the request.
     * @param {string} [params.method] - The HTTP method of the request.
     * @param {object} [params.body] - The body which needs to be sent with the request.
     *
     * @returns {Promise<object>} A promise that resolves to the Response object.
     */
    export function fetchResponsesForProtocol({ serviceName, protocol, url, certificateManager, dstService, headers, method, body, }: {
        serviceName: string;
        protocol: string;
        url: string;
        certificateManager: object;
        dstService: object;
        headers?: object;
        method?: string;
        body?: object;
    }): Promise<object>;
}
declare module "logging/loggerUtil" {
    /**
     * Get the logger instance to output error messages. If no logger has been passed, console.log
     * will be used by default.
     *
     * @private
     * @param {object} [logger] - Logger instance.
     * @returns {object} Logger instance.
     */
    export function getLogger(logger?: object): object;
}
declare module "index" {
    import * as networkUtil from "network/networkUtil";
    import { getLogger } from "logging/loggerUtil";
    export { networkUtil, getLogger };
}
