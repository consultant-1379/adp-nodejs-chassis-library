const faultManagerSchema = {
  $schema: 'http://json-schema.org/draft-04/schema',
  id: 'file://schema/FaultManager#',
  title: 'Fault Manager config',
  description: 'Definition of fault manager',
  type: 'object',
  properties: {
    hostname: {
      description: 'A broker hostname.',
      type: 'string',
    },
    tlsPort: {
      description: 'A https port.',
      type: 'number',
    },
    httpPort: {
      description: 'A http port.',
      type: 'number',
    },
    serviceName: {
      description: 'An identifier uniquely identifying the service.',
      type: 'string',
    },
    enabled: {
      description: 'Enable or disable fault handling.',
      type: 'boolean',
    },
    tls: {
      description: 'tls settings',
      type: 'object',
    },
  },
  required: ['hostname', 'tlsPort', 'httpPort', 'serviceName', 'enabled'],
  additionalProperties: false,
};

export default faultManagerSchema;
