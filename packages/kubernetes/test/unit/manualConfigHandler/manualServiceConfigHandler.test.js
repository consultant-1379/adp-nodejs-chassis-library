import { expect } from 'chai';
import { createRequire } from 'module';
import * as td from 'testdouble';
import ManualServiceConfigHandler from '../../../src/manualConfigHandler/manualServiceConfigHandler.js';
import { SERVICE_EVENTS } from '../../../src/constants.js';

const require = createRequire(import.meta.url);
const manualSchema = require('../../mocks/schema/manual-config-schema.json');

const SERVICE_1 = {
  name: 'Service 1',
  version: '1.0',
  URL: 'http://localhost',
};

const SERVICE_2 = {
  name: 'Service 2',
  version: '1.0',
  URL: 'http://localhost:4000',
};

const SERVICE_1_INNER = {
  ingressBaseurl: 'http://localhost/',
  name: 'Service 1',
  protocol: 'http',
  serviceurl: 'localhost',
  version: '1.0',
  uiContentConfigContext: '/',
};

const SERVICE_2_INNER = {
  ingressBaseurl: 'http://localhost:4000/',
  name: 'Service 2',
  protocol: 'http',
  serviceurl: 'localhost:4000',
  version: '1.0',
  uiContentConfigContext: '/',
};

const SERVICES = [SERVICE_1, SERVICE_2];
const SERVICES_INNER = [SERVICE_1_INNER, SERVICE_2_INNER];

describe('Unit tests for ManualServiceConfigHandler', () => {
  let manualServiceConfigHandler;
  const addedEventSpy = td.func();
  const deletedEventSpy = td.func();
  const modifiedEventSpy = td.func();

  const addSpies = () => {
    manualServiceConfigHandler.on(SERVICE_EVENTS.ADDED, addedEventSpy);
    manualServiceConfigHandler.on(SERVICE_EVENTS.DELETED, deletedEventSpy);
    manualServiceConfigHandler.on(SERVICE_EVENTS.MODIFIED, modifiedEventSpy);
  };

  before(() => {
    manualServiceConfigHandler = new ManualServiceConfigHandler({
      serviceConfigList: SERVICES,
      schema: manualSchema,
    });
    addSpies();
  });

  afterEach(() => {
    td.reset();
  });

  it('can trigger initial events', () => {
    manualServiceConfigHandler.triggerInitialEvents();
    expect(td.explain(addedEventSpy).callCount).to.be.equal(2);
    td.verify(addedEventSpy(SERVICES_INNER[0]));
    td.verify(addedEventSpy(SERVICES_INNER[1]));
  });

  it('can trigger a service-deleted event', () => {
    SERVICES.pop();
    manualServiceConfigHandler.handleServiceConfigChange(SERVICES);
    td.verify(deletedEventSpy(), { times: 1, ignoreExtraArgs: true });
    td.verify(deletedEventSpy(SERVICE_2_INNER));
  });

  it('can trigger a service-added event', () => {
    SERVICES.push(SERVICE_2);
    manualServiceConfigHandler.handleServiceConfigChange(SERVICES);
    td.verify(addedEventSpy(), { times: 1, ignoreExtraArgs: true });
    td.verify(addedEventSpy(SERVICE_2_INNER), { times: 1 });
  });

  it('can trigger a service-modified event', () => {
    const newVersion = '2.0';
    SERVICES[0].version = newVersion;
    const NEW_INNER_SERVICE = { ...SERVICE_1_INNER, version: newVersion };

    manualServiceConfigHandler.handleServiceConfigChange(SERVICES);
    td.verify(modifiedEventSpy(), { times: 1, ignoreExtraArgs: true });
    td.verify(modifiedEventSpy(NEW_INNER_SERVICE), { times: 1 });
  });
});
