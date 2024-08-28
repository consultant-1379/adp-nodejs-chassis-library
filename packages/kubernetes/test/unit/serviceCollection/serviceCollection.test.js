import { expect } from 'chai';
import * as td from 'testdouble';
import loggingMock from '../../mocks/logging.mock.js';
import ServiceCollection from '../../../src/serviceCollection/serviceCollection.js';
import {
  SERVICE_CHANGE_TYPE,
  SERVICE_ONE,
  SERVICE_ONE_MODIFIED,
  SERVICE_TWO,
} from './constants.js';

const copy = (object) => ({ ...object });

describe('Unit tests for UIServiceCollection', () => {
  let serviceCollection;
  let addedEventSpy;
  let deletedEventSpy;
  let modifiedEventSpy;

  const addSpies = () => {
    addedEventSpy = td.func();
    deletedEventSpy = td.func();
    modifiedEventSpy = td.func();
    serviceCollection.on(SERVICE_CHANGE_TYPE.ADD, addedEventSpy);
    serviceCollection.on(SERVICE_CHANGE_TYPE.DELETE, deletedEventSpy);
    serviceCollection.on(SERVICE_CHANGE_TYPE.MODIFY, modifiedEventSpy);
  };

  const addUID = (service) => {
    service.uid = serviceCollection.getServiceUID(service);
    return service;
  };

  beforeEach(async () => {
    serviceCollection = new ServiceCollection(loggingMock);
    addSpies();
    td.reset();
  });

  it('can add service to collection and trigger respective event', () => {
    serviceCollection.addService(copy(SERVICE_ONE));
    expect(serviceCollection.getServices().length).to.be.eq(1);
    td.verify(addedEventSpy(addUID(copy(SERVICE_ONE))), {
      times: 1,
    });
    td.reset();

    serviceCollection.addService(copy(SERVICE_TWO));
    expect(serviceCollection.getServices().length).to.be.eq(2);
    td.verify(addedEventSpy(addUID(copy(SERVICE_TWO))), {
      times: 1,
    });

    expect(serviceCollection.getServices()).to.have.deep.members([
      addUID(copy(SERVICE_ONE)),
      addUID(copy(SERVICE_TWO)),
    ]);
  });

  it('can update service and trigger respective event', () => {
    serviceCollection.addService(copy(SERVICE_ONE));
    expect(serviceCollection.getServices()).to.have.deep.members([addUID(copy(SERVICE_ONE))]);

    serviceCollection.modifyService(copy(SERVICE_ONE_MODIFIED));
    td.verify(modifiedEventSpy(addUID(copy(SERVICE_ONE_MODIFIED))), {
      times: 1,
    });
    expect(serviceCollection.services).to.have.deep.members([addUID(copy(SERVICE_ONE_MODIFIED))]);
  });

  it('can delete service from collection and trigger respective event', () => {
    serviceCollection.addService(copy(SERVICE_ONE));
    serviceCollection.addService(copy(SERVICE_TWO));
    serviceCollection.modifyService(copy(SERVICE_ONE_MODIFIED));
    expect(serviceCollection.getServices()).to.have.deep.members([
      addUID(copy(SERVICE_ONE_MODIFIED)),
      addUID(copy(SERVICE_TWO)),
    ]);

    serviceCollection.deleteService(copy(SERVICE_ONE_MODIFIED));
    td.verify(deletedEventSpy(addUID(copy(SERVICE_ONE_MODIFIED))), {
      times: 1,
    });
    expect(serviceCollection.getServices()).to.have.deep.members([addUID(copy(SERVICE_TWO))]);
  });

  it('can generate uid', () => {
    const EXPECTED_UID = 'domain1-1.0';
    const uid = serviceCollection.getServiceUID(SERVICE_ONE);
    expect(uid).to.be.eq(EXPECTED_UID);
  });
});
