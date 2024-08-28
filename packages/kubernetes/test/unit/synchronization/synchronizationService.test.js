import * as td from 'testdouble';
import { expect } from 'chai';
import * as nodeFetchMock from '../../mocks/nodeFetch.mock.js';
import dstMock from '../../mocks/dst.mock.js';

const certificateManagerMock = {
  getTLSOptions: () => {},
};

const syncServiceConfig = {
  headlessServiceName: 'eric-adp-gui-aggregator-service-headless-svc',
  servicePort: 3000,
  useHttps: false,
  headerValues: '1.1 eric-adp-gui-aggregator-service',
  tlsType: 'httpClient',
};

const utilMock = {
  promisify: (func) => func,
  deprecate: () => null,
  types: () => null,
};

describe('Unit tests for synchronizationService', () => {
  let synchronizationService;
  const lookupSpy = td.func();
  const IP1 = '192.168.1.1';
  const IP2 = '192.168.1.2';
  const IP3 = '192.168.1.3';
  const IP4 = '192.168.1.4';

  before(async () => {
    await td.replaceEsm('dns', null, { lookup: lookupSpy });
    await td.replaceEsm('util', utilMock, utilMock);
    await td.replaceEsm('node-fetch', null, nodeFetchMock);
    const { default: SynchronizationService } = await import(
      '../../../src/synchronization/synchronizationService.js'
    );
    td.reset();
    synchronizationService = new SynchronizationService({
      syncConfig: syncServiceConfig,
      certificateManager: certificateManagerMock,
      telemetryService: dstMock,
    });
  });

  afterEach(() => {
    td.reset();
  });

  it('_getIpFor function returns an array with IPs', async () => {
    td.when(lookupSpy(), { ignoreExtraArgs: true }).thenResolve([
      { address: IP1, family: 4 },
      { address: IP2, family: 4 },
    ]);

    const ips = await synchronizationService._getIPFor();
    expect(ips).to.have.members([IP1, IP2]);
  });

  it('propagateRefresh calculates other pods as intended', async () => {
    const localIP = [IP1];
    const clusterIPs = [IP1, IP2, IP3, IP4];
    const otherIPs = [IP2, IP3, IP4];
    const getLocalIPSpy = td.replace(synchronizationService, '_getLocalIP');
    const getClusterIPsSpy = td.replace(synchronizationService, '_getClusterIPs');
    td.when(getLocalIPSpy(), { ignoreExtraArgs: true }).thenReturn(localIP);
    td.when(getClusterIPsSpy(), { ignoreExtraArgs: true }).thenResolve(clusterIPs);
    const sendRequestSpy = td.replace(synchronizationService, '_sendRequest');

    await synchronizationService.propagateRefresh({ headers: {} });

    expect(td.explain(sendRequestSpy).callCount).to.be.equal(3);
    expect(td.explain(sendRequestSpy).calls.map((call) => call.args[0])).to.eql(otherIPs);
  });
});
