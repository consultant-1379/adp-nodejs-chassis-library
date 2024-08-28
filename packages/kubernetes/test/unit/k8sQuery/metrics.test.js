import { expect } from 'chai';
import sinon from 'sinon';
import { rewireK8sQueryService, requestDomainService } from '../../Utils.js';

import annotationApp from '../../mocks/annotation.serviceobject.js';
import k8sClientMock from '../../mocks/k8s.client.mock.js';

import { RESOURCE_TYPE, RESOURCE_CHANGE_TYPE } from '../../../src/constants.js';
import { WORKSPACE_GUI } from '../../constants.js';

import ENDPOINT from '../../mocks/ready.endpointobject.js';
import ENDPOINT_WITH_NO_SUBSETS from '../../mocks/ready.endpointobject.no.subsets.js';

describe('unit test for resources metrics', () => {
  let k8sQueryService;
  let serviceMetric;
  let podMetric;
  const { SERVICE, POD } = RESOURCE_TYPE;
  const SERVICE_POD = {
    metadata: {
      name: 'annotation-pod-1',
      labels: {
        'ui.ericsson.com/part-of': WORKSPACE_GUI,
        'dui-generic': 'annotation',
      },
    },
  };
  const serviceName = annotationApp.metadata.name;
  const sandbox = sinon.createSandbox();

  before(async () => {
    k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false }, null, {
      disabled: false,
    });
    sandbox.spy(k8sQueryService.pmServiceMock);
    await k8sQueryService.startWatching();

    serviceMetric = k8sQueryService._resourcesMetric[SERVICE];
    sandbox.spy(serviceMetric);

    podMetric = k8sQueryService._resourcesMetric[POD];
    sandbox.spy(podMetric);
  });

  afterEach(() => {
    sandbox.resetHistory();
  });

  after(() => {
    sandbox.restore();
  });

  it('should change metric when "ADDED" and "DELETED" events have been triggered on a service resource', async () => {
    await requestDomainService(annotationApp);
    expect(serviceMetric.add.calledOnceWith(serviceName)).to.be.true;

    await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.DELETE, annotationApp);
    expect(serviceMetric.remove.calledOnceWith(serviceName)).to.be.true;

    // services pods and configMaps should be deleted too
    expect(podMetric.removeByServiceName.calledOnceWith(serviceName)).to.be.true;
  });

  it('should not change pod metric when "ADDED" event has been triggered on a non-relevant endpoint resource', async () => {
    k8sQueryService.k8sApi.setReturnScenario('invalid'); // so that all endpoints will be evaluated as not relevant
    await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, ENDPOINT);
    k8sQueryService.k8sApi.setReturnScenario('resolve');

    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.add.notCalled).to.be.true;
  });

  it('should handle endpoint objects with no SUBSETS field', async () => {
    k8sQueryService.k8sApi.setReturnScenario('invalid'); // so that all endpoints will be evaluated as not relevant
    await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, ENDPOINT_WITH_NO_SUBSETS);
    k8sQueryService.k8sApi.setReturnScenario('resolve');

    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.add.notCalled).to.be.true;
  });

  it('should not change pod metric when "DELETED" event has been triggered on a non-relevant endpoint resource', async () => {
    k8sQueryService.k8sApi.setReturnScenario('invalid'); // so that all endpoints will be evaluated as not relevant
    await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.DELETE, ENDPOINT);
    k8sQueryService.k8sApi.setReturnScenario('resolve');

    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.remove.notCalled).to.be.true;
  });

  it('should recalculate pod metric when "ADDED" event has been triggered on a relevant endpoint resource', async () => {
    await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, ENDPOINT);
    expect(podMetric.reset.calledOnce).to.be.true;
    expect(podMetric.update.calledOnce).to.be.true;
    expect(podMetric.add.calledOnceWith(ENDPOINT.subsets[0].addresses[0].ip, serviceName)).to.be
      .true;
  });

  it('should change pod metric when "DELETED" event has been triggered on a relevant endpoint resource', async () => {
    await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.DELETE, ENDPOINT);
    expect(podMetric.reset.calledOnce).to.be.true;

    // we removed the only endpoint, so no pods should be added to the metric after it was reset to 0
    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.add.notCalled).to.be.true;
    expect(podMetric.remove.notCalled).to.be.true;
  });

  it('should not change pod metric when "ADDED" and "DELETED" events have been triggered on a pod resource', async () => {
    // to preserve from adding services pods
    sinon.stub(k8sQueryService.k8sApi, 'listNamespacedPod').returns(Promise.resolve());

    sinon.stub(k8sQueryService, 'waitForPodStartup').returns();

    // pod could not be watched without its service
    await requestDomainService(annotationApp, true);

    await k8sClientMock.Watch.podsCallback(RESOURCE_CHANGE_TYPE.ADD, SERVICE_POD);
    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.add.notCalled).to.be.true;

    await k8sClientMock.Watch.podsCallback(RESOURCE_CHANGE_TYPE.DELETE, SERVICE_POD);
    expect(podMetric.update.notCalled).to.be.true;
    expect(podMetric.remove.notCalled).to.be.true;
  });

  it('metrics are removed after stopWatching method was invoked', async () => {
    const metricList = [serviceMetric, podMetric];
    metricList.forEach((metric) => {
      expect(metric.clear.called).to.be.false;
    });

    await k8sQueryService.stopWatching();
    metricList.forEach((metric) => {
      expect(metric.clear.calledOnce).to.be.true;
    });
  });
});
