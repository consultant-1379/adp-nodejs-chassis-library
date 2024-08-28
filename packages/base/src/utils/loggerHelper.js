import CONSTANTS from '../logging/constants.js';

const { FACILITIES } = CONSTANTS;

/**
 * @typedef {object} LogInfo
 * @property {string} [message] - A freeform text describing the log event, preferably without
 * control characters (even escaped).
 * @property {string} [facility] - Facility.
 * @property {object} [extraInfo] - Additional specific properties.
 * @property {string} [timestamp] - The time expressed in milliseconds or in Date type.
 * @property {string} [subject] - The operator (username) who performed the O&M operation.
 * @property {string} [respMessage] - A freeform text dedicated to response messages.
 * @property {string} [respCode] - A freeform text dedicated to response codes.
 */

/**
 * Generate logging data in json format, which can be collected for further processing.
 *
 * @param {object} data - Raw information for Log generation.
 * @param {LogInfo} data.info - All relevant Log Information.
 * @param {string} data.level - Logging level.
 * @param {object} data.transportOptions - Relevant transport configurations.
 * @param {string} data.traceId - Telemetry trace ID.
 * @param {string | number} data.appID - Unique string representation of the service.
 * @param {string | number} data.procID - Process ID.
 * @param {string} data.transportFacility - Transport's facility.
 * @returns {object} Information that will be sent to the Log Transporter.
 */
function formatLogDataToJson({
  info,
  level,
  transportOptions,
  traceId,
  appID,
  procID,
  transportFacility,
}) {
  const severity = level === 'warn' ? 'warning' : level;
  const extraInfo = {
    ...(info?.extraInfo || null),
    ...(traceId && { trace_id: traceId }),
  };
  // Facility can be passed with a message info or can be taken from the transport options
  const facility = (FACILITIES[info.facility] || FACILITIES[transportFacility])?.name;

  return {
    version: '1.2.0',
    timestamp: (info.timestamp ? new Date(info.timestamp) : new Date()).toISOString(),
    severity,
    service_id: appID,
    ...(Object.keys(extraInfo).length && { extra_data: extraInfo }),
    metadata: {
      category: transportOptions.category,
      pod_name: transportOptions.podName,
      proc_id: `${procID}`,
      ...transportOptions.metadata,
    },
    message: info.message,
    facility,
    ...(info.subject && { subject: info.subject }),
    ...(info.respMessage && { resp_message: info.respMessage }),
    ...(info.respCode && { resp_code: `${info.respCode}` }),
  };
}

export { formatLogDataToJson };
