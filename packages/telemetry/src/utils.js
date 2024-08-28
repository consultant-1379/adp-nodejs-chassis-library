import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

export function getAbsoluteUrl(req) {
  const protocol = req.protocol || 'http';
  const path = req.path || '/';
  const host = req.headers?.host || 'localhost';
  return `${protocol}://${host}${path}`;
}

export function isCompressed(headers) {
  const encoding = headers['content-encoding'];
  return !!encoding && encoding !== 'identity';
}

/**
 * Returns a sampler with a given default sampling rate.
 *
 * @param {number} defaultRatio - Default sampling rate.
 * @returns {object} Returns the custom sampler.
 */
export function getRatioBaseSampler(defaultRatio) {
  const sampler = new TraceIdRatioBasedSampler(defaultRatio);
  Object.defineProperty(sampler, 'ratio', {
    set(ratio) {
      this._ratio = this._normalize(ratio);
      this._upperBound = Math.floor(this._ratio * 0xffffffff);
    },
  });

  return sampler;
}
