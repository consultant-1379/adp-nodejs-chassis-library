import { expect, assert } from 'chai';
import { EventEmitter } from 'events';
import * as td from 'testdouble';
import { LEVEL } from 'triple-beam';
import CONSTANTS from '../../src/logging/constants.js';

let winston;
let JsonTCP;
const { LOG_LEVELS, FACILITIES } = CONSTANTS;
const TRACE_ID = '123abc';
const EXTRA_INFO = {
  aField: 'admin',
  bField: 'John Doe',
};

const loggingConfig = {
  category: 'bazz',
  logLevel: 'info',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tcp4',
  tls: false,
};

const loggingConfigFoo = {
  category: 'foo',
  logLevel: 'info',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tcp6',
  tls: false,
};

const loggingConfigTLS = {
  category: 'lorem',
  logLevel: 'info',
  appName: 'service-1',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tls4',
  tls: true,
};

const telemetryServiceMock = {
  getTraceId: () => TRACE_ID,
};
const invalidTelemetryServiceMock = {
  getTraceId: () => undefined,
};
const mockedSocket = new EventEmitter();

async function mockModules(writeFn) {
  const socket = {
    setKeepAlive: () => true,
    setNoDelay: () => true,
    write: () => writeFn,
    on: (event, callback) => {
      callback();
      return socket;
    },
  };
  const tlsMock = () => ({
    connect: () => socket,
  });
  td.replaceEsm('tls', tlsMock());
  JsonTCP = (await import('../../src/logging/JsonTCP.js')).default;
  JsonTCP.prototype.levels = LOG_LEVELS;
  winston = (await import('winston')).default;
  td.reset();
}

function closeTopicDebug() {
  const transport = new JsonTCP(loggingConfig);
  // eslint-disable-next-line new-cap
  const logger = winston.createLogger({ transports: [transport] });

  logger.log('debug', 'Test message to actually use socket');
  logger.remove(transport);

  return transport;
}

describe('Unit tests for Winston JsonTCP Transport', () => {
  const socketWriteFn = td.func();

  beforeEach(async () => {
    await mockModules(socketWriteFn);
  });

  afterEach(() => {
    td.reset();
  });

  it('an instance should have the proper methods defined', () => {
    const transport = new JsonTCP();
    assert.instanceOf(transport, JsonTCP);
    assert.isFunction(transport.log);
    assert.isFunction(transport.connect);
  });

  it('callback function passed to the log method should be called with no arguments', () => {
    const tlsTransport = new JsonTCP(loggingConfigTLS);
    const fakeCallback = td.func();

    tlsTransport.log({ [LEVEL]: 'info', message: 'Lorem ipsum' }, fakeCallback);
    td.verify(fakeCallback(), { times: 1 });
  });

  it('should generate a proper string data', () => {
    const DATE = new Date();
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: 'Lorem ipsum donor',
      timestamp: DATE,
    };
    const expectedJsonData = {
      facility: FACILITIES[loggingConfigTLS.facility].name,
      message: LOG_DATA.message,
      metadata: {
        category: loggingConfigTLS.category,
        proc_id: `${process.pid}`,
      },
      service_id: loggingConfigTLS.appName,
      severity: 'info',
      timestamp: LOG_DATA.timestamp.toISOString(),
      version: '1.2.0',
    };
    const expectedData = JSON.stringify(expectedJsonData);
    const transport = new JsonTCP(loggingConfigTLS);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedData);
  });

  it('"extra_info" passed to the log method should be added to the log\'s data', () => {
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: 'Lorem ipsum donor',
      extraInfo: EXTRA_INFO,
    };
    const expectedExtraData = `"extra_data":${JSON.stringify(EXTRA_INFO)}`;
    const transport = new JsonTCP(loggingConfigTLS);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedExtraData);
  });

  it('"traceId" should be sent to the log server', () => {
    const MESSAGE = 'dst test message';
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: MESSAGE,
      extraInfo: EXTRA_INFO,
    };
    const expectedExtraTraceData = `"extra_data":${JSON.stringify({
      ...EXTRA_INFO,
      trace_id: TRACE_ID,
    })}`;
    const transport = new JsonTCP(loggingConfigTLS, telemetryServiceMock);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedExtraTraceData);
    expect(transport.queue[0]).to.contain(`"message":"${MESSAGE}"`);
  });

  it('undefined "traceId" passed to the log method should not be added to the log\'s data', () => {
    const MESSAGE = 'no dst test message';
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: MESSAGE,
      extraInfo: EXTRA_INFO,
    };
    const expectedExtraNoTraceData = `"extra_data":${JSON.stringify(EXTRA_INFO)}`;
    const transport = new JsonTCP(loggingConfigTLS, invalidTelemetryServiceMock);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedExtraNoTraceData);
    expect(transport.queue[0]).to.contain(`"message":"${MESSAGE}"`);
  });

  it('specific "facility" passed to the log method should replace the transport\'s facility', () => {
    const facility = 'audit';
    const LOG_DATA = {
      [LEVEL]: 'info',
      facility,
      message: 'Specific facility',
    };
    const expectedFacility = `"facility":"${FACILITIES[facility].name}",`;
    const transport = new JsonTCP(loggingConfigTLS);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedFacility);
  });

  it('when log\'s "facility" incorrect, the transport\'s facility should be used', () => {
    const facility = 'loremIpsumFacility';
    const LOG_DATA = {
      [LEVEL]: 'info',
      facility,
      message: 'Transport facility',
    };
    const expectedFacility = `"facility":"${FACILITIES[loggingConfig.facility].name}",`;
    const transport = new JsonTCP(loggingConfigTLS);

    transport.log(LOG_DATA, () => null);
    expect(transport.queue[0]).to.contain(expectedFacility);
  });

  it(`"error" and "close" events on the socket should emit JsonTCP "error" event`, async () => {
    const transport = new JsonTCP(loggingConfig, telemetryServiceMock);
    const expectedEventCallback = td.func();
    const EXPECTED_ERROR = new Error('JsonTLS transport Error, connection terminated.');

    transport._setupEvents(mockedSocket);
    transport.on('error', expectedEventCallback);

    mockedSocket.emit('error', new Error('Socket error'));
    td.verify(expectedEventCallback(EXPECTED_ERROR), { times: 1 });
    mockedSocket.emit('close', new Error('Socket is closed'));
    td.verify(expectedEventCallback(EXPECTED_ERROR), { times: 2 });
  });

  it('closes the socket after removing transport', () => {
    const transport = closeTopicDebug();
    expect(transport.socket).to.be.null;
  });

  it('adding/removing transport to syslog works as expected', () => {
    winston.add(new JsonTCP());
    winston.remove(new JsonTCP());
    winston.add(new JsonTCP());
    winston.remove(new JsonTCP());
  });

  it('transports have empty queue if there is no relevant value in queueMap', () => {
    const transport = new JsonTCP(loggingConfig);
    expect(transport.queue).to.deep.equal([]);
  });

  it('transports of same instances have shared queue after enqueueing messages', () => {
    const MESSAGE = '"message":"Lorem ipsum"';
    const firstTransport = new JsonTCP(loggingConfig);
    firstTransport.queue.push(MESSAGE);
    const secondTransport = new JsonTCP(loggingConfig);
    const thirdTransport = new JsonTCP(loggingConfigFoo);
    expect(secondTransport.queue).to.deep.equal([MESSAGE]);
    expect(thirdTransport.queue).to.deep.equal([]);
  });
});
