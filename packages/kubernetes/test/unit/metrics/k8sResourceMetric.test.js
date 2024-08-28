import { expect } from 'chai';
import sinon from 'sinon';
import * as td from 'testdouble';
import K8sResourceMetric from '../../../src/metrics/k8sResourceMetric.js';
import PmServiceMock from '../../mocks/pmService.mock.js';
import loggingMock from '../../mocks/logging.mock.js';
import { RESOURCE_TYPE, RESOURCE_CHANGE_TYPE, RESOURCE_TYPE_NAME } from '../../../src/constants.js';

let pmServiceMock;
let sandbox;
let k8sResourceMetric;

const rewireK8sResourceMetric = async (resourceType) => {
  await td.replaceEsm('../../services/pmService', { ...pmServiceMock });
  const k8sResourceMetricWithMocks = new K8sResourceMetric({
    resourceType,
    logger: loggingMock,
    pm: pmServiceMock,
  });
  td.reset();
  return k8sResourceMetricWithMocks;
};

describe('Unit tests for k8sResourceMetric', () => {
  describe('k8sResourceMetric with enabled pmService', () => {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      pmServiceMock = new PmServiceMock({
        disabled: false,
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be possible to create K8sResourceMetric object', async () => {
      sandbox.spy(pmServiceMock);
      const resourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.SERVICE);
      const metricName = `${RESOURCE_TYPE.SERVICE}_num`;

      expect(resourceMetric).to.be.not.undefined;
      expect(resourceMetric.resourceType).to.be.equal(RESOURCE_TYPE.SERVICE);
      expect(resourceMetric.resourcesMap).to.be.not.undefined;
      expect(resourceMetric._metricEnabled).to.be.true;
      expect(resourceMetric._metricName).to.be.equal(metricName);
      expect(
        pmServiceMock.createMetric.calledOnceWith('gauge', {
          name: metricName,
          help: `Total number of ${
            RESOURCE_TYPE_NAME[RESOURCE_TYPE.SERVICE]
          } K8s discovered resources.`,
        }),
      ).to.be.true;
    });

    it('update, add and remove methods should work correctly', async () => {
      const resourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.POD);
      const RESOURCE_NAME = 'pod-1';
      const SERVICE_NAME = 'service-1';
      const metric = resourceMetric._metric;
      sandbox.spy(resourceMetric);
      sandbox.spy(metric);

      resourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: RESOURCE_NAME,
        serviceName: SERVICE_NAME,
      });
      expect(resourceMetric.add.calledOnceWith(RESOURCE_NAME, SERVICE_NAME)).to.be.true;
      expect(resourceMetric.resourcesMap.size).to.be.equal(1);
      expect(resourceMetric.resourcesMap.get(RESOURCE_NAME)).to.deep.equal({
        serviceName: SERVICE_NAME,
      });
      expect(metric.set.calledOnceWith(1)).to.be.true;

      resourceMetric.update({ type: RESOURCE_CHANGE_TYPE.DELETE, name: RESOURCE_NAME });
      expect(resourceMetric.remove.calledOnceWith(RESOURCE_NAME)).to.be.true;
      expect(resourceMetric.resourcesMap.size).to.be.equal(0);
      expect(metric.set.calledTwice).to.be.true;
      expect(metric.set.calledWith(0)).to.be.true;
    });

    it('removeByServiceName method should work correctly', async () => {
      const SERVICE_NAME = 'service-1';
      const resourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.POD);
      const metric = resourceMetric._metric;
      resourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: 'pod-1',
        serviceName: SERVICE_NAME,
      });
      resourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: 'pod-2',
        serviceName: SERVICE_NAME,
      });
      expect(resourceMetric.resourcesMap.size).to.be.equal(2);

      sandbox.spy(metric);
      resourceMetric.removeByServiceName(SERVICE_NAME);
      expect(resourceMetric.resourcesMap.size).to.be.equal(0);
      expect(metric.set.calledOnceWith(0)).to.be.true;
    });

    it('reset method should work correctly', async () => {
      const resourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.POD);
      const metric = resourceMetric._metric;
      resourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: 'pod-1',
        serviceName: 'service-1',
      });
      resourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: 'pod-2',
        serviceName: 'service-2',
      });
      expect(resourceMetric.resourcesMap.size).to.be.equal(2);

      sandbox.spy(metric);
      resourceMetric.reset();
      expect(resourceMetric.resourcesMap.size).to.be.equal(0);
      expect(metric.set.calledOnceWith(0)).to.be.true;
    });

    it('clear method should work correctly', async () => {
      const resourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.CONFIG_MAP);
      const metricName = `${RESOURCE_TYPE.CONFIG_MAP}_num`;
      sandbox.spy(pmServiceMock);

      resourceMetric.clear();
      expect(pmServiceMock.deleteMetric.calledOnceWith(metricName)).to.be.true;
      sandbox.restore();
    });
  });

  describe('k8sResourceMetric with disabled pmService', () => {
    before(async () => {
      sandbox = sinon.createSandbox();
      pmServiceMock = new PmServiceMock({
        disabled: true,
      });
      k8sResourceMetric = await rewireK8sResourceMetric(RESOURCE_TYPE.SERVICE);
    });

    it('metric object should not be created', () => {
      expect(k8sResourceMetric).to.be.not.undefined;
      expect(k8sResourceMetric._metricEnabled).to.be.false;
      expect(k8sResourceMetric._metricName).to.be.undefined;
      expect(k8sResourceMetric._metric).to.be.undefined;
    });

    it('should not call metric set method when K8sResourceMetric update or reset methods occurs', () => {
      k8sResourceMetric._metric = {
        set: () => undefined,
      };
      sandbox.spy(k8sResourceMetric._metric);

      k8sResourceMetric.update({
        type: RESOURCE_CHANGE_TYPE.ADD,
        name: 'pod-1',
        serviceName: 'service-1',
      });
      expect(k8sResourceMetric._metric.set.callCount).to.be.equal(0);

      k8sResourceMetric.reset();
      expect(k8sResourceMetric._metric.set.callCount).to.be.equal(0);
      k8sResourceMetric._metric = null;
    });

    it('should not call deleteMetric when K8sResourceMetric clear methods occurs', () => {
      sandbox.spy(pmServiceMock);

      k8sResourceMetric.clear();
      expect(pmServiceMock.deleteMetric.callCount).to.be.equal(0);
    });
  });
});
