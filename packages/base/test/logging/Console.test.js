import { assert } from 'chai';
import * as td from 'testdouble';
import { LEVEL } from 'triple-beam';
import CONSTANTS from '../../src/logging/constants.js';

let ConsoleTransport;
let consoleLogStub;
const { LOG_LEVELS } = CONSTANTS;
const TRACE_ID = '123abc';

const EXTRA_INFO = {
  aField: 'admin',
  bField: 'John Doe',
};

const basicLoggingConfig = {
  category: 'lorem',
  level: 'info',
  facility: 'local0',
};

const telemetryServiceMock = {
  getTraceId: () => TRACE_ID,
};
const invalidTelemetryServiceMock = {
  getTraceId: () => undefined,
};

async function mockModules() {
  ConsoleTransport = (await import('../../src/logging/Console.js')).default;
  ConsoleTransport.prototype.levels = LOG_LEVELS;
  consoleLogStub = td.replace(console, 'log');
}

describe('Unit tests for Custom Console logger ', () => {
  beforeEach(async () => {
    await mockModules();
  });

  afterEach(() => {
    td.reset();
  });

  it('an instance should have the proper methods defined', () => {
    const logger = new ConsoleTransport();
    assert.instanceOf(logger, ConsoleTransport);
    assert.isFunction(logger.log);
  });

  it('callback function passed to the log method should be called with no arguments', () => {
    const logger = new ConsoleTransport(basicLoggingConfig);
    const fakeCallback = td.func();

    logger.log({ [LEVEL]: 'info', message: 'Lorem ipsum' }, fakeCallback);
    td.verify(fakeCallback(), { times: 1 });
  });

  it('"extra_info" passed to the log method should be present in the stdout', () => {
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: 'Lorem ipsum donor',
      extraInfo: EXTRA_INFO,
    };
    const logger = new ConsoleTransport(basicLoggingConfig);

    logger.log(LOG_DATA, () => null);
    td.verify(consoleLogStub(td.matchers.contains(JSON.stringify(EXTRA_INFO))));
  });

  it('"traceId" should be present in the stdout', () => {
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
    const logger = new ConsoleTransport(basicLoggingConfig, telemetryServiceMock);

    logger.log(LOG_DATA, () => null);
    td.verify(consoleLogStub(td.matchers.contains(expectedExtraTraceData)));
    td.verify(consoleLogStub(td.matchers.contains(`"message":"${MESSAGE}"`)));
  });

  it('undefined "traceId" passed to the log method should not be present in the stdout', () => {
    const MESSAGE = 'no dst test message';
    const LOG_DATA = {
      [LEVEL]: 'info',
      message: MESSAGE,
      extraInfo: EXTRA_INFO,
    };
    const expectedExtraNoTraceData = `"extra_data":${JSON.stringify(EXTRA_INFO)}`;
    const logger = new ConsoleTransport(basicLoggingConfig, invalidTelemetryServiceMock);

    logger.log(LOG_DATA, () => null);
    td.verify(consoleLogStub(td.matchers.contains(expectedExtraNoTraceData)));
    td.verify(consoleLogStub(td.matchers.contains(`"message":"${MESSAGE}"`)));
  });
});
