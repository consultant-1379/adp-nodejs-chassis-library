# Base Package

Contains base modules for Node.js microservice

## ConfigManager

This module provides capability to manage server and GUI side configurations.
Configurations could be created with a default value and could be changed using watched
configuration files. The best part is when these files are overwritten or updated configurations
will also be updated.

### Configuration of ConfigManager

At first configration json files should be created.
E.g:

```json
{
  "tlsEnabled": true,
  "appName": "Node.js Application",
  "logger": {
    "settings": {
      "enabled": true
    }
  }
}
```

?> The configuration json file can also be left empty

If configuration file should be validated, provide json schema file according to the
[specification](http://json-schema.org/learn/getting-started-step-by-step). Validation will be
applied each time the configuration file is updated.
Your schema file could look like this:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema",
  "$id": "http://adp.ericsson.com/ui.config.json",
  "type": "object",
  "desscription": "File descriptor for UI micro front-ends",
  "properties": {
    "version": {
      "$id": "http://adp.ericsson.com/ui.config.json#/properties/version",
      "type": "string",
      "description": "Schema version of the config.json."
    },
    "apps": {
      "$id": "http://adp.ericsson.com/ui.config.json#/properties/apps",
      "type": "array",
      "description": "List of applications available as part of the service.",
      "items": {
        "$ref": "ui.app.json"
      }
    },
    "groups": {
      "$id": "http://adp.ericsson.com/ui.config.json#/properties/groups",
      "type": "array",
      "description": "List of groups available as part of the service.",
      "items": {
        "$ref": "ui.entity.json"
      }
    },
    "components": {
      "$id": "http://adp.ericsson.com/ui.config.json#/properties/components",
      "type": "array",
      "description": "List of components available as part of the service.",
      "items": {
        "$ref": "ui.component.json"
      }
    }
  },
  "additionalProperties": false
}
```

Currently, ConfigManager supports two config file formats: **json** and **plain text**.
This types are listed in `ConfigManager.FILE_TYPES` static property
and can be accessed by either `ConfigManager.FILE_TYPES.JSON` or `ConfigManager.FILE_TYPES.TEXT`.
**JSON** is used by default.

In order to use the configManager with plain text files use flag "`fileType: ConfigManager.FILE_TYPES.TEXT`"
e.g.:

```javascript
{
  name: 'plainTextConfig',
  filePath: 'config/plainText.txt',
  defaultValue: 'some text',
  fileType: ConfigManager.FILE_TYPES.TEXT,
}
```

Then goes the initialization

```javascript
import { ConfigManager } from '@adp/base';
import { createRequire } from 'module';
import logger from './services/logger.js';

const require = createRequire(import.meta.url);
const defaultContainerConfig = require('./config/default-container-config.json');
const defaultUIConfig = require('./config/default-ui-config.json');
const configSchema = require('./schema/config-schema.json');

const configManager = new ConfigManager(
  [
    {
      name: 'config',
      filePath: 'config/container-config.json',
      schema: configSchema,
      defaultValue: defaultContainerConfig,
    },
    {
      name: 'uiConfig',
      filePath: 'config/ui-config.json',
      defaultValue: defaultUIConfig,
    },
    {
      name: 'plainTextConfig',
      filePath: 'config/plainText.txt',
      defaultValue: 'some text',
      fileType: ConfigManager.FILE_TYPES.TEXT,
    },
  ],
  logger,
);
```

### Usage of ConfigManager

?> In all of the following examples `configManager` means a configured`ConfigManager` instance.

Use `get(name)` method with passed name of required configuration to get its value.

```javascript
const config = configManager.get('config');
const uiConfig = configManager.get('uiConfig');
```

To add a new configuration to the manager use `startConfigWatch(params)` method.

```javascript
configManager.startConfigWatch({
  name: 'newConfig',
  filePath: 'configs/new-config.json',
  schema: 'schemas/new.config.json',
  defaultValue: {
    label: 'new',
  },
});
```

To stop updating configurations use `stopAllConfigWatch()` method. In this case, the
configurations will still be available, but changes in their configuration files will not affect
them.

```javascript
configManager.stopAllConfigWatch();
```

The ConfigManager also inherits from `events.EventEmitter` and publishes the following events:

| Event name         | Emitted arguments                                                             | Short description                                 |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| config-changed     | `Object { name, filePath }` - name of the config and path to the watched file | Emits when the config was updated                 |
| start-config-watch | `string` - config name                                                        | Emits after the start of watching the config file |

## CertificateManager

Manages the certificates and keys for all TLS enabled services, to be used with the HTTPS agent
specific to each service. The files are watched for new changes and reloads them when a change
occurs.

### Configuration of CertificateManager

Just initialize manager instance with required parameters:

```javascript
import { CertificateManager } from '@adp/base';
import logger from './services/logger.js';

const certificateManager = new CertificateManager({
  tlsEnabled: true,
  certificateWatchDebounceTime: 1000,
  dependenciesConfig: {
    logtransformer: {
      enabled: true,
      tls: {
        verifyServerCert: true,
        sendClientCert: true,
      },
    },
    prometheus: {
      enabled: true,
      tls: {
        verifyServerCert: false,
        sendClientCert: false,
      },
    },
  },
  certificatePath: 'certificates',
  certificateConfig: {
    ca: 'cacertbundle.pem',
    key: 'key.pem',
    cert: 'cert.pem',
  },
  serverCertificateConfig: {
    certDir: 'httpServer',
    caCertDirs: ['httpCa', 'pm', 'ingress'],
    key: 'srvprivkey.pem',
    cert: 'srvcert.pem',
    verifyClientCertificate: true,
  },
  logger,
});
```

In the example above `tlsEnabled` specifies whether the global TLS is enabled or disabled. If it set
to `false` then the `certificateManager` will not start.\
`certificateWatchDebounceTime` sets a time delay before the changed certificate files will be
reloaded by the manager.\
The services to which the certificates should be loaded are described by the `dependenciesConfig`
option. Also note that `certificateManager` has default `true` values for the `verifyServerCert` and
`sendClientCert` options.\
The `certificateConfig` describes names of the certificate files. The requirement for its options
depends on the `verifyServerCert` and `sendClientCert` values of all services in
`dependenciesConfig`. It means that if all services will have `verifyServerCert: false`, then the
`certificateConfig.ca` file is not needed. In case of `sendClientCert: false` there is no need in
`certificateConfig.key` and `certificateConfig.cert`.\
The `serverCertificateConfig` describes names of the server certificate files. The requirement for
its options depends on the `verifyClientCert`. It means that if `verifyClientCert: false`, then
CA certificate files are not needed. The `certDir` defines the directory of certificate
and key file. The `caCertDirs` defines array of directories for CA files or paths for CA file.
The name of the base folder with the certificates should be set with `certificatePath` option.
But the finale file paths will look like this for `certificateConfig`:

ca: `${certificatePath}/root/${certificateConfig.ca}`\
key: `${certificatePath}/${serviceName}/${certificateConfig.key}`\
cert: `${certificatePath}/${serviceName}/${certificateConfig.cert}`

where `serviceName` will be a service key from `dependenciesConfig`.
?> Note that at this moment CA is shared for all services. There will be further improvements.

And the finale file paths will look like this for `serverCertificateConfig`:

ca: `${certificatePath}/${caCertDirs[0]}/*.pem`\
key: `${certificatePath}/${certDir}/${serverCertificateConfig.key}`\
cert: `${certificatePath}/${certDir}/${serverCertificateConfig.cert}`

### Usage of CertificateManager

`getTLSOptions(name)` will return TlsOptions object which contains the https configuration options.
?> Note that the https.Agent generation does not work yet.

`getServerHttpsOpts()` will return server https configuration options.

To stop certificate monitoring, use the `stopCertificateWatch()` method.

The CertificateManager also inherits from `events.EventEmitter` and publishes the following events:

| Event name                  | Emitted arguments       | Short description                                                                                           |
| --------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| init-certificate-manager    | -                       | Emits if TLS is enabled globally, before starting to watch certificate files                                |
| certificates-changed        | `string` - service name | Emits when certificate files was read for the first time and each time they are successfully updated        |
| server-certificates-changed | `string` - service name | Emits when server certificate files was read for the first time and each time they are successfully updated |

## Logging

Module exports a logging instance with methods to set up Winston transport according to the provided
configuration.

Supports logging to the console, to the remote log consumer, and logging to the file.

### Configuration of Logging

- configuring category only will provide logging to the console.

```js
const logger = getLogger('category');
```

- to configure logging to the file, it is needed to provide
  category and configure logger with logging config:

```js
const fileLoggingConfig = {
  defaultLogLevel: 'info',
  logLevelCategories: {
    ui: 'debug',
    metric: 'info',
  },

  stdout: {
    enabled: true,
  },
  filelog: {
    enabled: true,
    logDirName,
    logFileName,
    maxSize,
    maxFiles,
  },

  silent,
};

configureLogger(fileLoggingConfig);

getLogger('category');
```

- to configure logging to the remote consumer, it is needed to provide
  category and configure logger with logging config:

```js
const remoteLoggingConfig = {
  defaultLogLevel: 'info',
  serviceName: 'Service name',
  logLevelCategories: {
    ui: 'debug',
    metric: 'info',
  },

  stdout: {
    enabled: true,
  },
  syslog: {
    enabled: false,
    syslogHost: 'syslogHostName',
    syslogFacility: 'local1',
    facilityCategories: {
      ui: 'local0',
      metric: 'local2',
    },
    tls: {
      enabled: true,
      protocolOptions: {
        keepAlive: true,
        rejectUnauthorized: true,
        secureContext: {},
      },
    },
    metadata: {
      namespace: 'N/A',
      node_name: 'N/A',
      pod_name: 'N/A',
      container_name: 'N/A',
      service_version: 'N/A',
    },
  },
  jsonTCPLog: {
    enabled: false,
    host: 'log-server-host',
    facility: 'local3',
    facilityCategories: {
      ui: 'local0',
      metric: 'local2',
    },
    tls: {
      enabled: true,
      protocolOptions: {
        keepAlive: true,
        rejectUnauthorized: true,
        secureContext: {},
      },
    },
    metadata: {
      namespace: 'N/A',
      node_name: 'N/A',
      container_name: 'N/A',
      service_version: 'N/A',
    },
    pod_name: 'N/A',
  },
};

configureLogger(remoteLoggingConfig);

getLogger('category');
```

- logging can be configured to output logs to stdout in JSON format. This way, log shipper daemon set
can harvest the records and send it to log transformer for further processing.

```js
const stdoutJsonLoggingConfig = {
  defaultLogLevel: 'info',
  logLevelCategories: {
    ui: 'debug',
    metric: 'info',
  },

  stdout: {
    enabled: true,
    format: 'json',
    metadata: {
      namespace: 'N/A',
      node_name: 'N/A',
      container_name: 'N/A',
      service_version: 'N/A',
    },
    pod_name: 'N/A',
  },
};

configureLogger(stdoutJsonLoggingConfig);

getLogger('category');
```

**Note:** For test environment, logging files will be stored in directory with `logDirName` name, created
locally in project folder.

**Note:** As logging files are being rotated, both `maxSize` and `maxFiles` are mandatory parameters.

If there is a need to use different logging levels for certain categories, set `logLevelCategories`
property with key-value pairs, where the key is a category name and the value is the desired
_logLevel_. If category `logLevel` wasn't specified here, the logger will use `defaultLogLevel`
value for it.

Similar configuration can be used in case if different `facility` values should be used for
particular categories in the syslog or jsonTCPLogs logs. For this purpose `facilityCategories` property
exists. Again, it consists of key-value pairs, where the key is a category name and the value is a desired
_facility_. And if `facilityCategories` doesn't have a value for a particular category,
`syslogFacility` will be used for it.

### Usage of Logging

```js
import { logger } from ('@adp/base');
const { getLogger, configureLogger } = logger;
```

- Getting logger. In this case it is not yet configured, the default settings will be used.

```js
const logger = getLogger(category);
```

- Set it up with custom options

```js
configureLogger(loggerConfig);
```

With this method it is possible to update logger configuration.

?> If you use ConfigManager and CertificateManager, you should pay attention to the emitted events
of these modules to update general and tls configurations respectively.

Logger instance publishes the `syslog-error` or `jsontcp-error` event when the connection to the log
server is interrupted. It is currently used to create a fault indication by the Fault Handler.

## UiConfigService

Contains additional config to be provided as configs to the front-end,
which updates with config json file.

### Usage of UiConfigService

On backend side:

```js
import express from 'express';
import { UIConfigService } from '@adp/base';
import { ConfigManager } from '@adp/base';
import logger from './services/logger.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const defaultContainerConfig = require('./config/default-container-config.json');
const defaultUIConfig = require('./config/default-ui-config.json');
const configSchema = require('./schema/config-schema.json');

const configManager = new ConfigManager(
  [
    {
      name: 'config',
      filePath: 'config/container-config.json',
      schema: configSchema,
      defaultValue: defaultContainerConfig,
    },
  ],
  logger,
);

const uiConfig = new UIConfigService({
  configFilePath: 'config/ui-config.json',
  configManager: configManager,
  configObject: defaultUIConfig,
});
const app = express();

app.get('/uiConfig', uiConfig.getUIConfigMiddleware());
```

On the frontend side:

```js
import { ConfigManager, Rest } from '@adp/ui-common';
import logger from '../logging/logger';
import schema from './schema';
import defaultConfig from './defaultConfig';
import constants from '../utils/constants.js';

const { CONFIG_LOCATION } = constants;

/**
 * Returns path to the current service frontend root
 */
const getStaticPath = () => {
  const currentUrl = new URL(import.meta.url);
  return currentUrl.href.split('/src')[0];
};

const rest = new Rest();
rest.setLogger(logger);

const configManager = new ConfigManager({
  defaultConfig,
  logger,
  schema,
  path: `${getStaticPath()}${CONFIG_LOCATION}`,
});

const config = await configManager.getConfig();
```

Settings for uiConfiguration are provided in defaultUIConfig and in 'config/ui-config.json' file,
and can be accessed on the UI side in the config object.
