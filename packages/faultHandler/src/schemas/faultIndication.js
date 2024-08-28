const faultIndicationSchema = {
  $schema: 'http://json-schema.org/draft-04/schema',
  id: 'file://schema/FaultIndication#',
  title: 'Fault indication',
  description: 'Definition of a fault indication.',
  type: 'object',
  properties: {
    faultName: {
      description: 'An identifier uniquely identifying the type of fault per service.',
      type: 'string',
      pattern: '^[a-zA-Z0-9_]+$',
    },
    serviceName: {
      description: 'An identifier uniquely identifying the service.',
      type: 'string',
      pattern: '^[a-zA-Z0-9_-]+$',
    },
    faultyResource: {
      description: 'The faulty resource of the fault. An instance of the fault type.',
      type: 'string',
      minLength: 1,
      maxLength: 150,
    },
    severity: {
      description:
        "The perceived severity level of the fault. Reflects the urgency level of the required action. Use 'Clear' to clear an existing fault indication.",
      type: 'string',
      enum: ['Clear', 'Warning', 'Minor', 'Major', 'Critical'],
    },
    description: {
      description: 'Extra information providing further insight about the fault.',
      type: 'string',
      maxLength: 512,
    },
    createdAt: {
      description:
        "The timestamp of when the fault indication was created, according to ISO8601 format: YYYY-MM-DDTHH:MM:SS.mmmmmmz (z is the relative time zone offset in hours and minutes to UTC in the format +hh:mm or -hh:mm. If UTC is used z will be 'Z' instead of '+00:00').",
      type: 'string',
      format: 'date-time',
    },
    expiration: {
      description:
        'The expiration time of the fault in seconds. The fault will automatically be cleared if no new fault indications of the same type within the expiration time. Value 0 means no expiration.',
      type: 'integer',
      minimum: 0,
    },
    additionalInformation: {
      description: 'Additional fault information as a JSON object',
      type: 'object',
    },
  },
  required: ['faultName', 'serviceName', 'createdAt'],
  additionalProperties: false,
};

export default faultIndicationSchema;
