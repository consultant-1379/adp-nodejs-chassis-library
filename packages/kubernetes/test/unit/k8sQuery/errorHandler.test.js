import { expect } from 'chai';
import * as td from 'testdouble';
import sinon from 'sinon';

import { SERVICE_ARGUMENTS } from '../../constants.js';
import { DEFAULT_CONFIGS } from '../../../src/constants.js';
import { rewireK8sQueryService, fmHandlerFunctions } from '../../Utils.js';
import k8sClientMock from '../../mocks/k8s.client.mock.js';

const { watchReconnectInterval: WATCH_RECONNECT_INTERVAL } = DEFAULT_CONFIGS;
const RE_ESTABLISH_MESSAGE = 'should re-establish connection after lost connection';
const RE_ESTABLISH_MESSAGE_OTHER_ERROR = `should retry connection in ${WATCH_RECONNECT_INTERVAL} seconds after other network error`;
const DUMMY_ERROR_MESSAGE = 'Mistery error occurred';

describe('high level error handling for CoreV1 API', () => {
  let k8sQueryService;
  let spy;

  before(async () => {
    k8sQueryService = await rewireK8sQueryService(k8sClientMock);
  });

  beforeEach(() => {
    spy = td.func();
    td.replace(k8sQueryService, 'coreV1ErrorHandler', spy);
  });

  afterEach(() => {
    td.reset();
  });

  after(() => {
    k8sQueryService.k8sApi.setReturnScenario('resolve');
  });

  it('Error is handled if service fetch fails', async () => {
    k8sQueryService.k8sApi.setReturnScenario('reject');
    await k8sQueryService.getServiceObject();

    td.verify(spy(td.matchers.anything()), { times: 1 });
  });

  it('Error is handled if service fetch throws error', async () => {
    k8sQueryService.k8sApi.setReturnScenario('error');
    await k8sQueryService.getServiceObject();

    td.verify(spy(td.matchers.anything()), { times: 1 });
  });
});

describe('high level error handling for IngressV1 API', () => {
  let k8sQueryService;
  let spy;
  before(async () => {
    k8sQueryService = await rewireK8sQueryService(k8sClientMock, { discoverIngress: true });
  });

  beforeEach(() => {
    spy = td.func();
    td.replace(k8sQueryService, 'ingressErrorHandler', spy);
  });

  afterEach(() => {
    td.reset();
  });

  after(() => {
    k8sQueryService.k8sApi.setReturnScenario('resolve');
  });

  it('Error is handled if Ingress list fetch fails', async () => {
    k8sQueryService.k8sIngressApi.setReturnScenario('reject');
    await k8sQueryService.calculateBaseUrl(SERVICE_ARGUMENTS.SERVICE);

    td.verify(spy(td.matchers.anything()), { times: 1 });
  });

  it('Error is handled if Ingress list fetch response is invalid', async () => {
    k8sQueryService.k8sIngressApi.setReturnScenario('invalid');
    await k8sQueryService.calculateBaseUrl(SERVICE_ARGUMENTS.SERVICE);

    td.verify(spy(td.matchers.anything()), { times: 1 });
  });

  it('Error is handled if Ingress list fetch throws error', async () => {
    k8sQueryService.k8sIngressApi.setReturnScenario('error');
    await k8sQueryService.calculateBaseUrl(SERVICE_ARGUMENTS.SERVICE);

    td.verify(spy(td.matchers.anything()), { times: 1 });
  });
});

describe('unit test for error handlers', () => {
  let k8sQueryService;
  let errorHandlerSpy;
  let faultIndicatorSpy;
  let clock;
  before(async () => {
    k8sQueryService = await rewireK8sQueryService(k8sClientMock, { fm: fmHandlerFunctions });
    faultIndicatorSpy = sinon.spy(fmHandlerFunctions, 'produceFaultIndication');
    await k8sQueryService.startWatching();
  });
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    errorHandlerSpy.resetHistory();
    faultIndicatorSpy.resetHistory();
    clock.restore();
  });

  describe('service error handler', () => {
    const fmHandlerArg = {
      fault: 'K8S_ERROR',
      customConfig: {
        description: `Error occurred during service watch: ${DUMMY_ERROR_MESSAGE} Retrying in ${WATCH_RECONNECT_INTERVAL} seconds`,
      },
    };

    before(() => {
      errorHandlerSpy = sinon.spy(k8sQueryService, 'initServiceWatch');
    });

    it(RE_ESTABLISH_MESSAGE, async () => {
      await k8sQueryService.serviceErrorHandler(null);

      expect(errorHandlerSpy.calledOnce).to.be.true;
    });

    it(RE_ESTABLISH_MESSAGE_OTHER_ERROR, async () => {
      await k8sQueryService.serviceErrorHandler({ message: DUMMY_ERROR_MESSAGE });
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 0.1);
      const errorHandlerCalledBeforeTimeout = errorHandlerSpy.calledOnce;
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 1.2); // wait for timeout+

      expect(errorHandlerCalledBeforeTimeout).to.be.false;
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(faultIndicatorSpy.calledOnceWith(fmHandlerArg)).to.be.true;
    });
  });

  describe('pod error handler', () => {
    const fmHandlerArg = {
      fault: 'K8S_ERROR',
      customConfig: {
        description: `Error occurred during pod watch: ${DUMMY_ERROR_MESSAGE} Retrying in ${WATCH_RECONNECT_INTERVAL} seconds`,
      },
    };

    before(() => {
      errorHandlerSpy = sinon.spy(k8sQueryService, 'initPodWatch');
    });

    it(RE_ESTABLISH_MESSAGE, async () => {
      await k8sQueryService.podErrorHandler(null);

      expect(errorHandlerSpy.calledOnce).to.be.true;
    });

    it(RE_ESTABLISH_MESSAGE_OTHER_ERROR, async () => {
      await k8sQueryService.podErrorHandler({ message: DUMMY_ERROR_MESSAGE });
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 0.1);
      const errorHandlerCalledBeforeTimeout = errorHandlerSpy.calledOnce;
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 1.2); // wait for timeout+

      expect(errorHandlerCalledBeforeTimeout).to.be.false;
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(faultIndicatorSpy.calledOnceWith(fmHandlerArg)).to.be.true;
    });
  });

  describe('endpoint error handler', () => {
    const fmHandlerArg = {
      fault: 'K8S_ERROR',
      customConfig: {
        description: `Error occurred during endpoint watch: ${DUMMY_ERROR_MESSAGE} Retrying in ${WATCH_RECONNECT_INTERVAL} seconds`,
      },
    };

    before(() => {
      errorHandlerSpy = sinon.spy(k8sQueryService, 'initEndpointWatch');
    });

    it(RE_ESTABLISH_MESSAGE, async () => {
      await k8sQueryService.endpointErrorHandler(null);

      expect(errorHandlerSpy.calledOnce).to.be.true;
    });

    it(RE_ESTABLISH_MESSAGE_OTHER_ERROR, async () => {
      await k8sQueryService.endpointErrorHandler({ message: DUMMY_ERROR_MESSAGE });
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 0.1);
      const errorHandlerCalledBeforeTimeout = errorHandlerSpy.calledOnce;
      await clock.tickAsync(WATCH_RECONNECT_INTERVAL * 1000 * 1.2); // wait for timeout+

      expect(errorHandlerCalledBeforeTimeout).to.be.false;
      expect(errorHandlerSpy.calledOnce).to.be.true;
      expect(faultIndicatorSpy.calledOnceWith(fmHandlerArg)).to.be.true;
    });
  });
});

describe('high level error handling for Watch API', () => {
  let k8sQueryService;
  before(async () => {
    k8sQueryService = await rewireK8sQueryService(k8sClientMock);
  });

  it('ServiceHandler should re-establish connection on watch error', async () => {
    const errorHandlerSpy = sinon.spy(k8sQueryService, 'serviceErrorHandler');
    const initWatchSpy = sinon.spy(k8sQueryService, 'initServiceWatch');
    await k8sQueryService.startWatching();
    await k8sClientMock.Watch.servicesErrorCallback(null);

    expect(errorHandlerSpy.calledOnce).to.be.true;
    expect(initWatchSpy.calledTwice).to.be.true; // once by the test above, once by the errorHandler
  });

  it('PodHandler should re-establish connection on watch error', async () => {
    const errorHandlerSpy = sinon.spy(k8sQueryService, 'podErrorHandler');
    const initWatchSpy = sinon.spy(k8sQueryService, 'initPodWatch');
    await k8sQueryService.startWatching();
    await k8sClientMock.Watch.podsErrorCallback(null);

    expect(errorHandlerSpy.calledOnce).to.be.true;
    expect(initWatchSpy.calledTwice).to.be.true; // once by the test above, once by the errorHandler
  });
});
