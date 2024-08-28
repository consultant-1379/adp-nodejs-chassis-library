import { expect, assert } from 'chai';
import { EventEmitter } from 'events';
import * as td from 'testdouble';
import { MESSAGE, LEVEL } from 'triple-beam';
import CONSTANTS from '../../src/logging/constants.js';

const { LOG_LEVELS } = CONSTANTS;

let Syslog;
let winston;

const loggingConfig = {
  category: 'bazz',
  logLevel: 'info',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tcp4',
};

const loggingConfigFoo = {
  category: 'foo',
  logLevel: 'info',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tcp6',
};

const loggingConfigTLS = {
  category: 'lorem',
  logLevel: 'info',
  host: 'localhost',
  facility: 'local0',
  protocol: 'tls6',
};

const mockedSocket = new EventEmitter();

const telemetryServiceMock = {
  getTraceId: () => '123abc',
};

const invalidTelemetryServiceMock = {
  getTraceId: () => undefined,
};

async function mockModules(mockedProduceFunc) {
  const socket = {
    setKeepAlive: () => true,
    setNoDelay: () => true,
    write: () => true,
    on: (event, callback) => {
      callback();
      return socket;
    },
  };
  const tlsMock = () => ({
    connect: () => socket,
  });
  const glossy = () => {
    function Produce() {
      return { produce: mockedProduceFunc };
    }

    return { Produce };
  };
  td.replaceEsm('tls', tlsMock());
  td.replaceEsm('glossy', null, glossy());
  Syslog = (await import('../../src/logging/Syslog.js')).default;
  winston = (await import('winston')).default;
  td.reset();
}

function closeTopicDebug() {
  const transport = new winston.transports.Syslog();
  // eslint-disable-next-line new-cap
  const logger = new winston.createLogger({ transports: [transport] });

  logger.log('debug', 'Test message to actually use socket');
  logger.remove(transport);

  return transport;
}

describe('Unit tests for Winston Syslog Transport', () => {
  let mockedProduceFunc;

  beforeEach(async () => {
    mockedProduceFunc = td.func();
    await mockModules(mockedProduceFunc);
  });

  afterEach(() => {
    td.reset();
  });

  it('an instance should have the proper methods defined', () => {
    const transport = new Syslog();
    assert.instanceOf(transport, Syslog);
    assert.isFunction(transport.log);
    assert.isFunction(transport.connect);
  });

  it('callback function passed to the log method should be called with no arguments', () => {
    const tlsTransport = new Syslog(loggingConfigTLS);
    const fakeCallback = td.func();

    tlsTransport.levels = LOG_LEVELS;

    tlsTransport.log({ [LEVEL]: 'info', [MESSAGE]: 'Lorem ipsum' }, fakeCallback);
    td.verify(fakeCallback(), { times: 1 });
  });

  it('"extra_info" passed to the log method should be added to the producer', () => {
    const LOG_DATA = {
      [LEVEL]: 'info',
      [MESSAGE]: 'Lorem ipsum donor',
      extraInfo: { username: 'user-name' },
    };
    const expectedProducedData = {
      severity: LOG_DATA[LEVEL],
      message: LOG_DATA[MESSAGE],
      structuredData: { extra_info: LOG_DATA.extraInfo },
    };
    const firstTransport = new Syslog(loggingConfigTLS);

    firstTransport.levels = LOG_LEVELS;
    firstTransport.log(LOG_DATA, () => null);
    td.verify(mockedProduceFunc(td.matchers.contains(expectedProducedData)), { times: 1 });
  });

  it('"traceId" passed to the log method should be added to the producer', () => {
    const LOG_DATA = {
      [LEVEL]: 'info',
      [MESSAGE]: 'dst test message',
    };
    const expectedProducedData = {
      severity: LOG_DATA[LEVEL],
      message: LOG_DATA[MESSAGE],
      structuredData: {
        dst: {
          trace_id: '123abc',
        },
      },
    };
    const firstTransport = new Syslog(loggingConfigTLS, telemetryServiceMock);

    firstTransport.levels = LOG_LEVELS;
    firstTransport.log(LOG_DATA, () => null);
    td.verify(mockedProduceFunc(td.matchers.contains(expectedProducedData)), { times: 1 });
  });

  it('undefined "traceId" passed to the log method should not be added to the producer', () => {
    const LOG_DATA = {
      [LEVEL]: 'info',
      [MESSAGE]: 'dst test message',
    };
    const expectedProducedData = {
      severity: LOG_DATA[LEVEL],
      message: LOG_DATA[MESSAGE],
      structuredData: null,
    };
    const firstTransport = new Syslog(loggingConfigTLS, invalidTelemetryServiceMock);

    firstTransport.levels = LOG_LEVELS;
    firstTransport.log(LOG_DATA, () => null);
    td.verify(mockedProduceFunc(td.matchers.contains(expectedProducedData)), { times: 1 });
  });

  it('specific "facility" passed to the log method should replace the transport\'s facility', () => {
    const facility = 'audit';
    const LOG_DATA = {
      [LEVEL]: 'info',
      [MESSAGE]: 'Specific facility',
      facility,
    };
    const expectedProducedData = {
      severity: LOG_DATA[LEVEL],
      message: LOG_DATA[MESSAGE],
      facility,
    };
    const transport = new Syslog(loggingConfigTLS);

    transport.levels = LOG_LEVELS;
    transport.log(LOG_DATA, () => null);
    td.verify(mockedProduceFunc(td.matchers.contains(expectedProducedData)), { times: 1 });
  });

  it('when log\'s "facility" incorrect, the transport\'s facility should be used', () => {
    const facility = 'loremIpsumFacility';
    const LOG_DATA = {
      [LEVEL]: 'info',
      [MESSAGE]: 'Transport facility',
      facility,
    };
    const expectedProducedData = {
      severity: LOG_DATA[LEVEL],
      message: LOG_DATA[MESSAGE],
      facility: loggingConfigTLS.facility,
    };
    const transport = new Syslog(loggingConfigTLS);

    transport.levels = LOG_LEVELS;
    transport.log(LOG_DATA, () => null);
    td.verify(mockedProduceFunc(td.matchers.contains(expectedProducedData)), { times: 1 });
  });

  it(`"error" and "close" events on the socket should emit Syslog "error" event`, async () => {
    const localTransport = new Syslog(loggingConfig);
    const expectedEventCallback = td.func();
    const EXPECTED_ERROR = new Error('Syslog Error, connection terminated.');

    localTransport.setupEvents(mockedSocket);
    localTransport.on('error', expectedEventCallback);

    mockedSocket.emit('error', new Error('Socket error'));
    td.verify(expectedEventCallback(EXPECTED_ERROR), { times: 1 });
    mockedSocket.emit('close', new Error('Socket is closed'));
    td.verify(expectedEventCallback(EXPECTED_ERROR), { times: 2 });
  });

  it('closes the socket after removing transport', () => {
    const localTransport = closeTopicDebug();
    expect(localTransport.socket).to.be.null;
  });

  it('adding/removing transport to syslog works as expected', () => {
    winston.add(new winston.transports.Syslog());
    winston.remove(new winston.transports.Syslog());
    winston.add(new winston.transports.Syslog());
    winston.remove(new winston.transports.Syslog());
  });

  it('transports have empty queue if there is no relevant value in queueMap', () => {
    const firstTransport = new Syslog(loggingConfig);
    expect(firstTransport.queue).to.deep.equal([]);
  });

  it('transports of same instances have shared queue after enqueueing messages', () => {
    const firstTransport = new Syslog(loggingConfig);
    firstTransport.queue.push('message');
    const secondTransport = new Syslog(loggingConfig);
    const thirdTransport = new Syslog(loggingConfigFoo);
    expect(secondTransport.queue).to.deep.equal(['message']);
    expect(thirdTransport.queue).to.deep.equal([]);
  });
});
