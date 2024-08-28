import { expect } from 'chai';
import * as td from 'testdouble';
import sinon from 'sinon';

import k8sClientMock from '../../mocks/k8s.client.mock.js';
import annotationApp from '../../mocks/annotation.serviceobject.js';
import notDiscoverableAnnotationApp from '../../mocks/notDiscoverableAnnotation.serviceobject.js';
import portlessService from '../../mocks/portless.serviceobject.js';
import readyEndpoint from '../../mocks/ready.endpointobject.js';
import readyEndpointOther from '../../mocks/ready.endpointobject.other.js';
import readyEndpointMoreIp from '../../mocks/ready.endpointobject.more.ip.js';
import headlessEndpoint from '../../mocks/headless.endpointobject.js';
import differentLabelApp from '../../mocks/different-label-app1.serviceobject.js';

import { requestDomainService, rewireK8sQueryService } from '../../Utils.js';
import { SERVICE_CHANGE_TYPE, SERVICE_ARGUMENTS, SERVICE_RETURN_VALUES } from '../../constants.js';
import { RESOURCE_CHANGE_TYPE } from '../../../src/constants.js';

const NAMESPACE = 'default';
const OTHER_NAMESPACE = 'other_namespace';
const WORKSPACE_GUI = 'workspace-gui';
const DISCOVERY_LABEL_NAME = 'ui.ericsson.com/part-of';
const SOME_POD_POSTFIX = 'some-pod-postfix';

describe('Unit tests for K8sQueryService (part 1)', () => {
  describe('Service discovery robustness', () => {
    let k8sQueryService;
    let servicePromise;
    let promiseResolved;
    beforeEach(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: true });
      await k8sQueryService.startWatching();
      promiseResolved = false;
      servicePromise = requestDomainService(annotationApp, true);
      servicePromise.then(() => {
        promiseResolved = true;
      });
    });

    afterEach(async () => {
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.DELETE, annotationApp);
      await servicePromise;
    });

    it('waits for pod in loop if service is headless', async () => {
      await Promise.race([
        servicePromise,
        new Promise((res) => {
          setTimeout(res, 600);
        }),
      ]);
      expect(promiseResolved).to.eq(false);
    });

    it('waiting should continue on headless endpoint addition', async () => {
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, headlessEndpoint);
      await Promise.race([
        servicePromise,
        new Promise((res) => {
          setTimeout(res, 600);
        }),
      ]);
      expect(promiseResolved).to.eq(false);
    });

    it('waiting is closed if service gets removed while headless, service not added', async () => {
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.DELETE, annotationApp);
      await servicePromise;
      expect(promiseResolved).to.eq(true, 'Loop is not resolved on service deletion');
      td.verify(spy(), { times: 0 });
    });

    it('waiting is closed if ready endpoint is added, service added', async () => {
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      await servicePromise;
      expect(promiseResolved).to.eq(true, 'Loop is not resolved on service addition');
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE));
    });
  });

  describe('Single client with ingress', () => {
    let k8sQueryService;
    before(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: true });
      await k8sQueryService.startWatching();
    });

    it('can request services', async () => {
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE));
    });

    it('can calculate base urls', async () => {
      const service = await k8sQueryService.calculateBaseUrl(SERVICE_ARGUMENTS.SERVICE);
      expect(service).to.deep.eq(SERVICE_RETURN_VALUES.SERVICE);
    });

    it('can use port and protocol defined in servie annotation', async () => {
      const serviceWithPort = await k8sQueryService.calculateBaseUrl(
        SERVICE_ARGUMENTS.SERVICE_WITH_PORT,
      );
      const serviceWithPortAndProtocol = await k8sQueryService.calculateBaseUrl(
        SERVICE_ARGUMENTS.SERVICE_WITH_PORT_AND_PROTOCOL,
      );
      expect(serviceWithPort).to.deep.eq(SERVICE_RETURN_VALUES.SERVICE_WITH_PORT);
      expect(serviceWithPortAndProtocol).to.deep.eq(
        SERVICE_RETURN_VALUES.SERVICE_WITH_PORT_AND_PROTOCOL,
      );
    });
  });

  describe('Single client with annotation', () => {
    let k8sQueryService;
    before(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
    });

    it('can request services', async () => {
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION));
    });

    it('can calculate base urls', async () => {
      const service = await k8sQueryService.calculateBaseUrl(SERVICE_ARGUMENTS.SERVICE_ANNOTATION);
      expect(service).to.deep.eq(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION);
    });
  });

  describe('Optional annotation edge cases', () => {
    let k8sQueryService;

    it('should work without optional annotations', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, {
        overwriteExtraAnnotations: true,
        extraAnnotations: undefined,
      });
      await k8sQueryService.startWatching();

      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION_WITHOUT_EXTERNAL_URL));
    });

    it('should work with empty list of optional annotations', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, {
        overwriteExtraAnnotations: true,
        extraAnnotations: {},
      });
      await k8sQueryService.startWatching();

      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION_WITHOUT_EXTERNAL_URL));
    });

    it('should ignore optional annotation if it overwrites a factory value', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, {
        overwriteExtraAnnotations: true,
        extraAnnotations: { configQueryProtocol: 'blah' },
      });
      await k8sQueryService.startWatching();

      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION_WITHOUT_EXTERNAL_URL));
    });
  });

  describe('Namespace handling', () => {
    it('uses the "default" namespace if no namespace file exists', async () => {
      const k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      expect(k8sQueryService.namespace).to.eq(NAMESPACE);
    });

    it('can read the namespace config file', async () => {
      const k8sQueryService = await rewireK8sQueryService(k8sClientMock, undefined, undefined, {
        '/var/run/secrets/kubernetes.io/serviceaccount/namespace': OTHER_NAMESPACE,
      });
      expect(k8sQueryService.namespace).to.eq(OTHER_NAMESPACE);
    });
  });

  describe('Lifecycle eventhandling', () => {
    let k8sQueryService;
    it('should emit update event if "MODIFIED" event is triggered on services Watch.', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.MODIFY, spy);
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, annotationApp);

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 1 });
    });

    it('should emit update event if "MODIFIED" event is triggered on pods Watch.', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.MODIFY, spy);
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.podsCallback(RESOURCE_CHANGE_TYPE.MODIFY, {
        metadata: {
          labels: { [DISCOVERY_LABEL_NAME]: WORKSPACE_GUI, 'dui-generic': 'annotation' },
        },
      });

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 1 });
    });

    it('should emit delete event if "DELETE" event is triggered on services Watch.', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false });
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.DELETE, spy);
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.DELETE, annotationApp);

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 1 });
    });

    it('should ignore "ADD" event if service has different labels.', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.ADD, differentLabelApp);

      td.verify(spy(), { times: 0 });
    });

    it('Should emit service delete event if there are no active endpoints to a service when pod is removed.', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.DELETE, spy);

      await requestDomainService(annotationApp);

      k8sQueryService.endpoints = {};

      await k8sClientMock.Watch.podsCallback(RESOURCE_CHANGE_TYPE.DELETE, {
        metadata: {
          labels: { [DISCOVERY_LABEL_NAME]: WORKSPACE_GUI, 'dui-generic': 'annotation' },
        },
      });

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 1 });
    });

    it("Shouldn't emit service delete event if there are no active endpoints to a service when pod is removed if pod replica recreated.", async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      k8sQueryService.k8sApi.setReturnScenario('terminatingPod');
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.DELETE, spy);

      await requestDomainService(annotationApp);

      k8sQueryService.endpoints = {};
      const waitForPodStartupSpy = td.func();
      const waitForPodStartup = k8sQueryService.waitForPodStartup.bind(k8sQueryService);
      td.when(waitForPodStartupSpy(), {
        ignoreExtraArgs: true,
      }).thenDo(() => {
        waitForPodStartup(SOME_POD_POSTFIX);
        k8sQueryService.endpoints = { domain1: SOME_POD_POSTFIX };
      });

      k8sQueryService.waitForPodStartup = waitForPodStartupSpy;

      await k8sClientMock.Watch.podsCallback(RESOURCE_CHANGE_TYPE.DELETE, {
        metadata: {
          name: SOME_POD_POSTFIX,
          generateName: 'some-pod-',
          labels: { [DISCOVERY_LABEL_NAME]: WORKSPACE_GUI, 'dui-generic': 'annotation' },
        },
      });

      td.verify(waitForPodStartupSpy('domain1'), {
        times: 1,
        ignoreExtraArgs: true,
      });
      k8sQueryService.k8sApi.setReturnScenario('');

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 0 });
    });

    it('should emit delete event if "MODIFY" event is triggered on services Watch, but the service is not valid (discovery labels removed)', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false });
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.DELETE, spy);
      await requestDomainService(annotationApp);
      const updatedApp = JSON.parse(JSON.stringify(annotationApp));
      delete updatedApp.metadata.labels[DISCOVERY_LABEL_NAME];
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, updatedApp);

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 1 });
    });

    it('shouldn\'t emit delete event if "MODIFY" event is triggered on services Watch if this service wasn\'t discoverable previously', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false });
      k8sQueryService.k8sApi.setReturnScenario('coupleServices');
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.DELETE, spy);
      await requestDomainService(annotationApp);
      await requestDomainService(notDiscoverableAnnotationApp);
      const updatedApp = JSON.parse(JSON.stringify(annotationApp));
      const updatedNotDiscoverableApp = JSON.parse(JSON.stringify(notDiscoverableAnnotationApp));
      updatedApp.spec.ports[0].port = 5000;
      updatedNotDiscoverableApp.spec.ports[0].port = 6000;
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, updatedApp);
      await k8sClientMock.Watch.servicesCallback(
        RESOURCE_CHANGE_TYPE.MODIFY,
        updatedNotDiscoverableApp,
      );

      td.verify(spy(SERVICE_RETURN_VALUES.NOT_DISCOVERABLE_ANNOTATION), { times: 0 });
      k8sQueryService.k8sApi.setReturnScenario('');
    });

    it('should emit "ADD" event again  if service was modified back with correct discovery labels', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(annotationApp);

      const updatedApp = JSON.parse(JSON.stringify(annotationApp));
      delete updatedApp.metadata.labels[DISCOVERY_LABEL_NAME];
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, updatedApp);

      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, annotationApp);

      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 2 });
    });

    it('should skip relevant services without port definitions', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false });
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      await requestDomainService(portlessService);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 0 });
    });

    it('should skip irrelevant services without port definitions', async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: false });
      await k8sQueryService.startWatching();
      const spy = td.func();
      k8sQueryService.on(SERVICE_CHANGE_TYPE.ADD, spy);
      const updatedApp = JSON.parse(JSON.stringify(portlessService));
      delete updatedApp.metadata.labels[DISCOVERY_LABEL_NAME];
      await requestDomainService(updatedApp);
      td.verify(spy(SERVICE_RETURN_VALUES.SERVICE_ANNOTATION), { times: 0 });
    });
  });

  describe('Pod metric handling', () => {
    let k8sQueryService;

    beforeEach(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
    });

    it('should increase pod metric if "ADDED" event is triggered on endpoint Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(0);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });

    it('should increase pod metric if "MODIFIED" event is triggered on endpoint Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(0);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.MODIFY, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });

    it('should decrease pod metric if "DELETED" event is triggered on endpoint Watch.', async () => {
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.DELETE, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(0);
    });

    it('should increase pod metric more if "ADDED" event is triggered on endpoint Watch with more IPs.', async () => {
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(0);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpointMoreIp);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(2);
    });

    it('should not increase pod metric if same "ADDED" event is triggered again on endpoint Watch.', async () => {
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });

    it('should increase pod metric if other "ADDED" event is triggered on endpoint Watch.', async () => {
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpointOther);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(2);
    });

    it('should not change pod metric if error occurs on endpoint Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'endpointErrorHandler');
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.endpointsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });

    it('should not change pod metric if error occurs on pod Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'podErrorHandler');
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.podsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });

    it('should not change pod metric if error occurs on service Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'serviceErrorHandler');

      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.servicesErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.pod.resourcesMap.size).to.eq(1);
    });
  });

  describe('Endpoint metric handling', () => {
    let k8sQueryService;

    beforeEach(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock);
      await k8sQueryService.startWatching();
    });

    it('should increase endpoint metric if "ADDED" event is triggered on endpoint Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(0);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);
    });

    it('should increase endpoint metric if "MODIFIED" event is triggered on endpoint Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(0);
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.MODIFY, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);
    });

    it('should decrease endpoint metric if "DELETED" event is triggered on endpoint Watch.', async () => {
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.DELETE, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(0);
    });

    it('should not change endpoint metric if error occurs on endpoint Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'endpointErrorHandler');
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.endpointsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);
    });

    it('should not change endpoint metric if error occurs on pod Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'podErrorHandler');
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.podsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);
    });

    it('should not change endpoint metric if error occurs on service Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'serviceErrorHandler');
      await k8sClientMock.Watch.endpointsCallback(RESOURCE_CHANGE_TYPE.ADD, readyEndpoint);
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.servicesErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.endpoint.resourcesMap.size).to.eq(1);
    });
  });

  describe('Service metric handling', () => {
    let k8sQueryService;

    beforeEach(async () => {
      k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: true });
      await k8sQueryService.startWatching();
    });

    it('should increase service metric if "ADDED" event is triggered on service Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(0);
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.ADD, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);
    });

    it('should increase service metric if "MODIFIED" event is triggered on service Watch.', async () => {
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(0);
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);
    });

    it('should decrease service metric if "DELETED" event is triggered on service Watch.', async () => {
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.MODIFY, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.DELETE, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(0);
    });

    it('should not change service metric if error occurs on endpoint Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'endpointErrorHandler');
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.ADD, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.endpointsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);
    });

    it('should not change service metric if error occurs on pod Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'podErrorHandler');
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.ADD, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.podsErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);
    });

    it('should not change service metric if error occurs on service Watch.', async () => {
      const errorHandlerSpy = sinon.spy(k8sQueryService, 'serviceErrorHandler');
      await requestDomainService(annotationApp);
      await k8sClientMock.Watch.servicesCallback(RESOURCE_CHANGE_TYPE.ADD, annotationApp);
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);

      await k8sClientMock.Watch.servicesErrorCallback(null);
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(k8sQueryService._resourcesMetric.service.resourcesMap.size).to.eq(1);
    });
  });
});
