import * as td from 'testdouble';
import { RESOURCE_CHANGE_TYPE } from '../src/constants.js';

import readyEndpoint from './mocks/ready.endpointobject.js';
import k8sClientMock from './mocks/k8s.client.mock.js';
import PmServiceMock from './mocks/pmService.mock.js';
import k8sResourceMetricMock from './mocks/k8sResourceMetric.mock.js';
import * as nodeFetchMock from './mocks/nodeFetch.mock.js';
import K8sQueryServiceMock from './mocks/k8sServiceUtil.mock.js';

export const fmHandlerFunctions = {
  startAlarmsConsuming: () => undefined,
  produceFaultIndication: () => undefined,
};

const fMHandlerMock = () => fmHandlerFunctions;

const fsMock = (fileMockMap = {}) => ({
  readFileSync: (filePath) => fileMockMap[filePath],
  existsSync: (filePath) => filePath in fileMockMap,
});

/**
 * Returns the k8sConfig object for initializing k8sQueryService for tests.
 *
 * @param {object} config - Config object with keys to overwrite defaults
 * @returns {object} The k8sConfig object that k8sQueryService will use.
 */
export const getK8sServiceOptions = (config) => ({
  labelName: 'ui.ericsson.com/part-of',
  labelValue: 'workspace-gui',
  watchReconnectInterval: 30,
  podStartupTimeout: 200,
  podTerminationTimeout: 200,
  podReplicaStartupTimeout: 200,
  configFetch: {
    configFetchTlsOption: 'internalUi',
    configFetchMaxTry: 10,
    configFetchRetryPeriod: 10,
  },
  queryProtocolAnnotation: 'ui.ericsson.com/protocol',
  queryPortAnnotation: 'ui.ericsson.com/port',
  uiContentConfigContextAnnotation: 'ui.ericsson.com/config-context',

  extraAnnotations:
    !!config && config.overwriteExtraAnnotations
      ? config.extraAnnotations
      : {
          externalURLPrefix: 'ui.ericsson.com/external-baseurl',
        },
  appNameLabel: 'app.kubernetes.io/name',
  appVersionLabel: 'app.kubernetes.io/version',
  discoverIngress: config?.discoverIngress || false,
  ingressTlsPort: 443,
  ingressHttpPort: 80,
  serviceAccountDir: '/var/run/secrets/kubernetes.io/serviceaccount',
  useHttps: true,
});

/**
 * Rewires k8sQueryService with mocks which is used for unit testing the component.
 *
 * @param {*} clientMock - Mock for Kubernetes CLient Node.
 * @param {*} config - Config object, which is used for getK8sServiceOptions function argument
 * @param {*} fm - Mock for the FM proxy.
 * @param {*} fileMock - Mock for the fs library.
 * @param {*} pmServiceConfig - Configuration for the PM service.
 * @returns
 */
export const rewireK8sQueryService = async (
  clientMock,
  config,
  fm = fMHandlerMock(),
  fileMock = {},
  pmServiceConfig = { disabled: true },
) => {
  const pmServiceMock = new PmServiceMock(pmServiceConfig);
  await td.replaceEsm('@kubernetes/client-node', null, clientMock);
  await td.replaceEsm('fs', fsMock(fileMock));
  await td.replaceEsm('node-fetch', null, nodeFetchMock);
  await td.replaceEsm('../../services/metrics/k8sResourceMetric', { ...k8sResourceMetricMock });
  await td.replaceEsm('../src/utils/k8sServiceUtils.js', null, K8sQueryServiceMock);

  const { default: K8sQueryService } = await import('../src/k8sQuery/k8sQueryService.js');
  const k8sQueryService = new K8sQueryService({
    k8sConfig: getK8sServiceOptions(config),
    fMHandler: fm || fMHandlerMock(),
  });
  td.reset();
  return Object.assign(k8sQueryService, { pmServiceMock });
};

/**
 * Acts as ADD event for k8sQueryService, used to add mock clients to the cluster.
 *
 * @param {*} serviceObject - Object that contains the service's k8 cluster properties.
 * @param {boolean} headless - Do we want service to be headless or not.
 * @returns {Promise} Promise which will resolve when service is deployed.
 */
export async function requestDomainService(serviceObject, headless = false) {
  const servicePromise = k8sClientMock.Watch.servicesCallback(
    RESOURCE_CHANGE_TYPE.ADD,
    serviceObject,
  );
  if (!headless) {
    await k8sClientMock.Watch.endpointsCallback(
      RESOURCE_CHANGE_TYPE.ADD,
      Object.assign(readyEndpoint, { metadata: { name: serviceObject.metadata.name } }),
    );
  }
  return servicePromise;
}
