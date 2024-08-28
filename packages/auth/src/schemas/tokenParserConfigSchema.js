/* eslint-disable prettier/prettier */
const tokenParserConfigSchema = {
  $schema: 'http://json-schema.org/draft-04/schema',
  id: 'file://schema/FaultIndication#',
  title: 'JWT parser config',
  description: 'Configuration of how to parse the IAM JWT',
  type: 'object',
  properties: {
    JWT_SOURCE: {
      description:
        'field determins the source of jwt to provide option of individual approach to each',
      type: 'string',
      enum: ['IAM', 'Common'],
    },
    JWT_NAME: {
      description: 'Name of the IAM JWT cookie',
      type: 'string',
      minLength: 1,
    },
    JWT_DELIMITTER: {
      description: 'Delimitter used to separate header payload and signature of jwt',
      type: 'string',
      minLength: 1,
    },
    JWT_KEYS_MAP: {
      description: 'Additional fault information as a JSON object',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tokenKey: {
            type: 'string',
            minLength: 1,
          },
          mappedKey: {
            type: 'string',
            minLength: 1,
          },
        },
      },
      minItems: 1,
    },
  },
  required: ['JWT_NAME', 'JWT_DELIMITTER', 'JWT_KEYS_MAP'],
  additionalProperties: false,
};

export default tokenParserConfigSchema;
