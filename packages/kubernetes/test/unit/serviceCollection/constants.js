const LOCALHOST_CONTEXT = 'http://localhost/context';

export const SERVICE_CHANGE_TYPE = {
  ADD: 'service-added',
  DELETE: 'service-deleted',
  MODIFY: 'service-modified',
};

export const SERVICE_ONE = {
  name: 'domain1',
  serviceurl: 'domain1:4000',
  ingressBaseurl: LOCALHOST_CONTEXT,
  protocol: 'http:',
  version: '1.0',
};

export const SERVICE_ONE_MODIFIED = {
  name: 'domain1',
  serviceurl: 'domain1:5000',
  ingressBaseurl: LOCALHOST_CONTEXT,
  protocol: 'http:',
  version: '1.5',
};

export const SERVICE_TWO = {
  name: 'domain2',
  serviceurl: 'domain2:4000',
  ingressBaseurl: LOCALHOST_CONTEXT,
  protocol: 'http:',
  version: '2.0',
};
