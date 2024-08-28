import fetch, { Request } from 'node-fetch';

/**
 * Removes trailing slash from the input string, if present.
 *
 * @param {string} urlSegment - The input string.
 * @returns {string} Same string without the trailing slash, if there was one.
 */
const normalizeURLEnding = (urlSegment) => {
  if (urlSegment?.endsWith('/')) {
    urlSegment = urlSegment.slice(0, -1);
  }
  return urlSegment;
};

/**
 * Removes leading slash from the input string, if present.
 *
 * @param {string} urlSegment - The input string.
 * @returns {string} Same string without the leading slash, if there was one.
 */
const normalizeURLSegment = (urlSegment) => {
  urlSegment = normalizeURLEnding(urlSegment);

  if (urlSegment && !urlSegment.startsWith('/')) {
    urlSegment = '/'.concat(urlSegment);
  }
  return urlSegment || '';
};

/**
 * Accepts a request and updates its body with url encoded formats.
 *
 * @param {object} request - Request object.
 * @returns {object} Request with updated body for form request.
 */
const parseJsonRequestBody = (request) => {
  const { body } = request;
  if (!body) {
    return request;
  }
  const params = new URLSearchParams();
  if (Object.keys(body)) {
    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v.toString()));
      } else {
        params.append(key, value.toString());
      }
    });
  }

  return {
    ...request,
    body: params,
  };
};

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
const fetchResponsesForProtocol = async ({
  serviceName,
  protocol,
  url,
  certificateManager,
  dstService,
  headers,
  method,
  body,
}) => {
  const baseRequest = new Request(`${protocol}://${url}`);
  const httpsAgent = certificateManager.getTLSOptions(serviceName)?.tlsAgent;
  const isDstServiceValid =
    dstService &&
    ['createSpan', 'injectContext', 'setHttpResponseSpanOptions'].every((prop) =>
      Object.keys(dstService).includes(prop),
    );
  let span;
  let ctx;

  if (isDstServiceValid) {
    const dtsSpan = dstService.createSpan(baseRequest, dstService.spanKindClientId);
    span = dtsSpan.span;
    ctx = dtsSpan.ctx;
  }

  const fetchRequest = new Request(baseRequest, {
    ...(isDstServiceValid && dstService.injectContext(ctx)),
    ...(protocol === 'https' ? { agent: httpsAgent } : {}),
    ...(method ? { method } : {}),
    ...(headers ? { headers } : {}),
    ...(body ? { body } : {}),
  });

  const fetchResponse = await fetch(fetchRequest);

  if (isDstServiceValid) {
    dstService.setHttpResponseSpanOptions(span, fetchResponse);
    span.end();
  }

  return fetchResponse;
};

export { normalizeURLEnding, normalizeURLSegment, parseJsonRequestBody, fetchResponsesForProtocol };
