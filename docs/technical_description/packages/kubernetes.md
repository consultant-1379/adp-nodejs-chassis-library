# Library for K8S API services

This library provides services for interacting with the Kubernetes
cluster via standard K8S API.

One feature supported by this library is the autodiscovery of packages.

## Behavior of automatic service discovery

The library uses the Kubernetes Watch API for autodiscovery. If the service
that uses this library and calls its `startWatching()` method, the library service
will subscribe to Service and Pod changes. Previously added resources also trigger
an ADDED event so they are discovered automatically as well.
After a service is discovered, its configuration file (usually called `config.json`) is fetched. If
a configuration file is not available immediately, the library tries to fetch it with a 1-second
retry frequency until the file can be accessed.

When Helm® deployments are upgraded, the configuration file is re-fetched
and merged into the discovered configuration.

## ConfigQueryService

Stores and manages configurations of discovered services.

### Usage of ConfigQueryService

Set the class with a necessary parameters.

Example:

```js
import ConfigQueryService from '@adp/kubernetes/configQuery';
// Also the module could be imported like this:
// import { ConfigQueryService } from '@adp/kubernetes';
import certificateManager from './services/certificateManager.js';
import pmService from './services/pmService.js';
import { getLogger } from './logger.js';
import serviceCollection from './services/serviceCollection.js';
import CONSTANTS from '../config/constants.js';

const logger = getLogger();

const require = createRequire(import.meta.url);
const generalConfigSchema = require('../schemas/generalConfig.json');
const appSchema = require('../schemas/app.json');

const configQueryService = new UiConfigQueryService({
  certificateManager,
  pmService,
  logger,
  serviceCollection: uiServiceCollection,
  configFetchRetryPeriod: CONSTANTS.CONFIG_FETCH_RETRY_PERIOD,
  configFetchMaxRetryPeriod: CONSTANTS.CONFIG_FETCH_MAX_RETRY_PERIOD,
  internalUiName: CONSTANTS.TLS_TYPE_INTERNAL_GUI,
  configQueryList: [
    {
      configName: CONSTANTS.GENERAL_CONFIG_QUERY_NAME,
      configFileName: CONSTANTS.GENERAL_CONFIG_FILE_NAME,
      allowEmptyConfig: true,
      configDefault: CONSTANTS.GENERAL_DEFAULT_CONFIG,
      schema: generalConfigSchema,
      additionalSchemaList: [appSchema],
    },
  ],
});
```

When a discovered service changes the state (`service-added` or `service-modified`) its
configuration file will be updated. If the update is successfull, the module emits
`service-config-updated` event.
When a discovered service is deleted, configuration file will also be deleted and the module will
generate `service-config-deleted` event.

The current functionality supports more then one configuration file for each service. All required
files must be described in the `configQueryList` parameter.
To get a certain configuration through all services, use `getConfig()` method.

Example:

```js
const generalConfig = configQueryService.getConfig('CONSTANTS.GENERAL_CONFIG_QUERY_NAME');
```

## ManualServiceConfigHandler

Store and manages manual service configurations.

### Usage of ManualServiceConfigHandler

Example

```js
import ManualServiceConfigHandler from '@adp/kubernetes/manualConfigHandler';
// Also the module could be imported like this:
// import { ManualServiceConfigHandler } from '@adp/kubernetes';
import { getLogger } from './logger.js';
import configManager from '../config/configManager.js';

const logger = getLogger();

const manualServiceConfigHandler = new ManualServiceConfigHandler({
  logger,
  serviceConfigList: configManager.getManualServiceConfig(),
});
```

At the stage of initialization handler recievs a configuration list of discovered services. When the
state of services updates configuration list should be also updated with
`handleServiceConfigChange()` method.

Example

```js
configManager.on('config-changed', () =>
  manualServiceConfigHandler.handleServiceConfigChange(configManager.getManualServiceConfig()),
);
```

When a discovered service changes the state (based on changing configuration), the handler generates
`service-added`, `service-modified` and `service-deleted` events.

## K8sQueryService

Provides with class gathering methods for interacting with the Kubernetes
cluster via standard K8S API.

### Usage of K8sQueryService

Example

```js
import K8sQueryService from '@adp/kubernetes/k8sQueryService';
// Also the module could be imported like this:
// import { K8sQueryService } from '@adp/kubernetes';
import configManager from '../config/configManager.js';
import { getLogger } from './logger.js';
import fMHandler from './fMHandler.js';
import pmService from './pmService.js';

const logger = getLogger();

const k8sQueryService = new K8sQueryService({
  k8sConfig: configManager.getK8sQueryServiceConfig(),
  logger,
  fMHandler,
  pmService,
});
```

To start watching the k8 cluster entities, call `startWatching()` method. To stop, call the
`stopWatching()` method.
When a discovered service changes the state, the k8sQueryService generates `service-added`,
`service-modified` and `service-deleted` events according to the nature of change.

## ServiceCollection

May contain the collection of discovered services.

### Usage of ServiceCollection

Example

```js
import ServiceCollection, { SERVICE_EVENTS } from '@adp/kubernetes/serviceCollection';
// Also the module could be imported like this:
// import { ServiceCollection, SERVICE_EVENTS } from '@adp/kubernetes';
import { getLogger } from './logging.js';

const logger = getLogger();

const uiServiceCollection = new ServiceCollection(logger);
```

Information about the services in the collection can be updated using `addService()`,
`modifyService()`, and `deleteService()`. In addition to updating the collection at the end of a
successfull operation, each method generates `service-added`, `service-modified` and
`service-deleted` events respectively.

This module also exports these service events.

## SynchronizationService

Service for propagating refresh notification for the other pods.

### Usage of SynchronizationService

Example

```js
import SynchronizationService from '@adp/kubernetes/synchronizationService';
// Also the module could be imported like this:
// import { SynchronizationService } from '@adp/kubernetes';
import certificateManager from './certificateManager.js';
import { getLogger } from './logging.js';

const logger = getLogger();

const synchronizationService = new SynchronizationService({
  syncConfig: {
    headlessServiceName: 'eric-adp-gui-aggregator-service-headless-svc',
    servicePort: 3000,
    useHttps: true,
    headerValues: '1.1 eric-adp-gui-aggregator-service',
    tlsType: 'httpClient',
  },
  logger,
  certificateManager,
});
```

To notify the other pods with the refresh request invoke `propagateRefresh(request)` method.
