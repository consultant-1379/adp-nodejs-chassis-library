const DOMAIN_SERVICE = 'domain-service-1';
const UI_CONTENT_CONFIG_CONTEXT = '/configcontext';
const OTHER_UI_CONTENT_CONFIG_CONTEXT = '/otherconfigcontext';
const LOCALHOST_CONTEXT = 'http://localhost/context';
const SERVICE_URL = 'domain1:4000';
const NOT_DISCOVERABLE_SERVICE_URL = 'notDiscoverableDomain:6000';

export const WORKSPACE_GUI = 'workspace-gui';

export const SERVICE_ARGUMENTS = {
  SERVICE: {
    name: 'domain1',
    appName: DOMAIN_SERVICE,
    port: 4000,
    externalURLPrefix: undefined,
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
  SERVICE_ANNOTATION: {
    name: 'domain1',
    appName: DOMAIN_SERVICE,
    port: 4000,
    externalURLPrefix: LOCALHOST_CONTEXT,
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
    configQueryPort: undefined,
    configQueryProtocol: undefined,
    version: '2.0.1-44',
  },
  SERVICE_WITH_PORT: {
    name: 'domain1',
    appName: DOMAIN_SERVICE,
    port: 4000,
    externalURLPrefix: LOCALHOST_CONTEXT,
    configQueryPort: 5000,
    configQueryProtocol: undefined,
    uiContentConfigContext: OTHER_UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
  SERVICE_WITH_PORT_AND_PROTOCOL: {
    name: 'domain1',
    appName: DOMAIN_SERVICE,
    port: 4000,
    externalURLPrefix: LOCALHOST_CONTEXT,
    configQueryPort: 5000,
    configQueryProtocol: 'https',
    uiContentConfigContext: OTHER_UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
};

export const SERVICE_RETURN_VALUES = {
  SERVICE: {
    name: DOMAIN_SERVICE,
    serviceurl: SERVICE_URL,
    ingressBaseurl: 'http://localhost:80/domain-app-1',
    protocol: 'https',
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
  SERVICE_ANNOTATION: {
    name: DOMAIN_SERVICE,
    serviceurl: SERVICE_URL,
    ingressBaseurl: LOCALHOST_CONTEXT,
    protocol: 'https',
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },

  NOT_DISCOVERABLE_ANNOTATION: {
    name: DOMAIN_SERVICE,
    version: '2.0.1-44',
    protocol: 'https',
    serviceurl: NOT_DISCOVERABLE_SERVICE_URL,
    ingressBaseurl: LOCALHOST_CONTEXT,
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
  },

  SERVICE_ANNOTATION_WITHOUT_EXTERNAL_URL: {
    name: DOMAIN_SERVICE,
    serviceurl: SERVICE_URL,
    ingressBaseurl: undefined,
    protocol: 'https',
    uiContentConfigContext: UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },

  SERVICE_WITH_PORT: {
    name: DOMAIN_SERVICE,
    serviceurl: 'domain1:5000',
    ingressBaseurl: LOCALHOST_CONTEXT,
    protocol: 'https',
    uiContentConfigContext: OTHER_UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
  SERVICE_WITH_PORT_AND_PROTOCOL: {
    name: DOMAIN_SERVICE,
    serviceurl: 'domain1:5000',
    ingressBaseurl: LOCALHOST_CONTEXT,
    protocol: 'https',
    uiContentConfigContext: OTHER_UI_CONTENT_CONFIG_CONTEXT,
    version: '2.0.1-44',
  },
};

export const SERVICE_CHANGE_TYPE = {
  ADD: 'service-added',
  DELETE: 'service-deleted',
  MODIFY: 'service-modified',
};
