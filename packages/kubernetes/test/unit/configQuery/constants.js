const DEFAULT_UI_CONTEXT = '/';
const UID = 'domain-service-1-1.0.2-2';
const LOCALHOST_CONTEXT = 'http://localhost/context';
const CUSTOM_CONFIG_CONTEXT = '/configContext';
const SERVICE_URL = 'domain1:4000';
const INVALID_CONFIG_CONTEXT = '/invalidConfigContext';
const OTHER_NAME_CONTEXT = '/otherContext';

export const QUERY_CONFIG_NAME = 'uiServiceConfig';
export const CONFIG_FILE_NAME = 'config.json';
export const NODE_FETCH = 'node-fetch';
export const DEFAULT_CONTEXT = '/ui';
export const CONFIG_FETCH_RETRY_PERIOD = 50;
export const CONFIG_FETCH_MAX_RETRY_PERIOD = 200;

export const SERVICE_WITH_CONFIG_CONTEXT_PATH = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: CUSTOM_CONFIG_CONTEXT,
};

export const SERVICE_WITH_BASEURL = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};

export const SERVICE_WITH_DELAYED_FAILING_URL = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: 'delayedfailingurl.com',
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};

export const SERVICE_WITH_DELAYED_PASSING_URL = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: 'delayedpassingurl.com',
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};

export const SERVICE_WITHOUT_BASEURL = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: undefined,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};

export const SERVICE_WITH_HTTPS = {
  protocol: 'https',
  name: 'domain1',
  uid: UID,
  serviceurl: 'domain3:4000',
  ingressBaseurl: undefined,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};

export const SERVICE_WITH_FAILING_URL_WHICH_REJECTED = {
  protocol: 'http',
  name: 'some name',
  uid: 'other-service-1-0.0.2-2',
  serviceurl: 'failingurl-rejected.com',
  uiContentConfigContext: '',
};

export const SERVICE_RESTORED_AFTER_REJECTED = {
  ...SERVICE_WITH_FAILING_URL_WHICH_REJECTED,
  serviceurl: SERVICE_URL,
};

export const SERVICE_WITH_FAILING_URL_WHICH_FULLFILLS = {
  protocol: 'http',
  name: 'some name',
  uid: 'other-service-1-0.0.2-2',
  serviceurl: 'failingurl-fulfilled.com',
  uiContentConfigContext: DEFAULT_CONTEXT,
};

export const SERVICE_WITH_PROTOCOL = {
  name: 'Service with protocol',
  protocol: 'https',
  serviceurl: 'service:123',
  uiContentConfigContext: DEFAULT_CONTEXT,
};

export const DEFAULT_CONFIG = {
  version: '1.0.0',
  apps: [],
  groups: [],
  components: [],
};

export const SERVICE_WITH_INVALID_CONFIG = {
  protocol: 'http',
  name: 'domain1',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: INVALID_CONFIG_CONTEXT,
};

export const SERVICE_WITH_OTHER_NAME = {
  protocol: 'http',
  name: 'domain2',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: OTHER_NAME_CONTEXT,
};

export const SERVICE_FOR_DELETE = {
  protocol: 'http',
  name: 'Service for delete',
  uid: UID,
  serviceurl: SERVICE_URL,
  ingressBaseurl: LOCALHOST_CONTEXT,
  uiContentConfigContext: DEFAULT_UI_CONTEXT,
};
