import { expect } from 'chai';
import { formatLogDataToJson } from '../../src/utils/loggerHelper.js';

const TRACE_ID = '123abc';
const SEVERITY_WARNING = 'warning';
const APP_ID = 'gas-service';
const PID = 23;
const FACILITY_1 = 'local1';
const FACILITY_AUDIT = 'audit';
const TRANSPORT_OPTIONS = {
  podName: 'service-1-klsder67',
  metadata: {
    category: 'lorem',
    service_version: 'eric-oss-help-aggregator-1.0.0-0',
    container_name: 'eric-oss-help-aggregator',
    namespace: 'nm-1',
    node_name: 'seliics01745',
  },
};

describe('Unit tests for loggerHelper.js', () => {
  describe('generateLogData', () => {
    it('generates proper log object', () => {
      const info = {
        message: `Lorem ipsum
donor`,
        timestamp: new Date(1711115000000),
        level: '',
        service: '',
        extraInfo: {
          user_type: 'admin',
        },
        subject: 'John',
        respCode: 401,
        respMessage: 'Unauthorized',
      };
      const expectedLogData = {
        version: '1.2.0',
        timestamp: new Date(1711115000000).toISOString(),
        severity: 'warning',
        service_id: APP_ID,
        extra_data: {
          user_type: 'admin',
          trace_id: TRACE_ID,
        },
        metadata: {
          category: 'lorem',
          pod_name: 'service-1-klsder67',
          proc_id: '23',
          service_version: 'eric-oss-help-aggregator-1.0.0-0',
          container_name: 'eric-oss-help-aggregator',
          namespace: 'nm-1',
          node_name: 'seliics01745',
        },
        message: 'Lorem ipsum\ndonor',
        facility: 'local use 1 (local1)',
        subject: 'John',
        resp_code: '401',
        resp_message: 'Unauthorized',
      };
      const logDataResult = formatLogDataToJson({
        info,
        level: SEVERITY_WARNING,
        transportOptions: TRANSPORT_OPTIONS,
        traceId: TRACE_ID,
        procID: PID,
        appID: APP_ID,
        transportFacility: FACILITY_1,
      });

      expect(logDataResult).to.deep.equal(expectedLogData);
    });

    it('uses facility from info', () => {
      const info = {
        message: 'Lorem ipsum',
        facility: FACILITY_AUDIT,
      };
      const expectedLogData = {
        message: 'Lorem ipsum',
        facility: 'log audit',
      };
      const logDataResult = formatLogDataToJson({
        info,
        level: SEVERITY_WARNING,
        transportOptions: TRANSPORT_OPTIONS,
        traceId: TRACE_ID,
        procID: PID,
        appID: APP_ID,
        transportFacility: FACILITY_1,
      });

      expect(logDataResult).to.deep.contain(expectedLogData);
    });
  });
});
