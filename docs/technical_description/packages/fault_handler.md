# Fault Handler Package

Fault Handler provides feature of fault indication producing, which will be interpreted into alarms
according to mapping provided and stored.
Fault Handler produces fault indications by using Fault Indication REST API.
For technical details, see the _AH Developers Guide_.

## Usage

Create `faultIndicationDefaultsMap.json` based on Fault Indication JSON Schema, see
[instruction](https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-indication-schema-definition)
for more details.
Add fault indication default config with an alias name as a key.
The map must contain fault indications which can be produced by Fault Handler.
Required fields:

- `faultName`
- `serviceName`

It is also strongly recommended to add `expiration` field with value > 0.

Example:

```json
{
  "SERVICE_ERROR": {
    "faultName": "service_error",
    "serviceName": "eric-adp-gui-aggregator-service",
    "severity": "Major",
    "description": "Error writing to the socket. Please check Log Transformer Service.",
    "expiration": 5000
  }
}
```

Create `service-name-faultmapping.json` based on FaultAlarmMappings JSON schema, see
[instruction](https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide#fault-alarm-mapping-schema-definition)
for more details.
Add an Alarm configuration.
`faultName` field is required.
`code` field is mandatory.
Alarms codes could be taken as of sequential to
existing ones, or obtained using registration process (Minor Type) described in
[document](https://erilink.ericsson.se/eridoc/erl/objectId/09004cff86e5863f?docno=1/00021-FCP1305518Uen&action=approved&format=pdf).

Example:

```json
[
  {
    "faultName": "service_error",
    "code": 15007745,
    "defaultDescription": "There is a failing service in the cluster, please check infrastructure.",
    "vendor": 193,
    "defaultSeverity": "Critical",
    "probableCause": 158,
    "category": "ProcessingErrorAlarm"
  }
]
```

In order to valid Fault Indications to be mapped to alarms,
there must be a configured mapping entry for the fault names per service.

The fault to alarm mapping files should be stored in directory `/etc/faultmappings`
in the Alarm Handler container,
and be named `service name.json` and the content should be according
to the FaultAlarmMappings JSON schema. See
[Developers Guide](https://adp.ericsson.se/marketplace/alarm-handler/documentation/development/dpi/application-developers-guide).

For deployment on Kubernetes, a ConfigMap should be mounted on a volume
into the `/etc/faultmappings` directory.

The Fault Indication to alarm mapping information is read by Alarm Handler
at startup and periodically checks for changes,
as defined by fault mapper reload timer.
That's why any changes to the fault mapper configuration will be applied
within the fault mapper reload timer’s time frame.

To correct initialization Fault Handler we should pass parameters
to the constructor of `FMHandler`, when we create `FMHandler`.

## `FMHandler` Parameters

1. faultManagerConfig - Object, fault handler config

   Example:

   ```json
   {
     "hostname": "eric-fh-alarm-handler",
     "brokerPort": "6006",
     "serviceName": "eric-adp-nodejs-chassis-service",
     "enabled": true, //set true if you want to enable fault handling
     "tls": { "enabled": true } //set enabled: true if mTLS secure connection for the faultHandler required
   }
   ```

2. faultIndicationMap - Object, this is `faultIndicationDefaultsMap.json`

   Example:

   ```javascript
   const fMHandler = new FMHandler({
     faultManagerConfig,
     faultIndicationMap,
     logger,
     tlsAgent,
   });
   ```

## Fault Handler mTLS connection security

mTLS can be enabled passing the `tls.enabled: true` along with the certificate data
(`tlsAgent` parameter)
to the faultManagementConfig.

## Fault Handler Package API

1. `produceFaultIndication` method
   The method produce fault indication which will be mapped to alarm
   according to provided map.
   Arguments:

   - `fIData` - object
   - `fIData.fault` - String, required- alias for the fault, as per faultIndicationDefaultMap
   - `fIData.customConfig` - customConfig: Object.
     Object of additional parameters to override the defaults fault indications.

   Example:

   ```javascript
   fMHandler.produceFaultIndication({
     fault: 'CERTIFICATE_ERROR',
     customConfig: {
       description: `Certificate missing. Could not read certificate files for ${serviceName}.`,
     },
   });
   ```

2. `setConfig` method
   The method set fault manager config,
   so fault handler will use new settings to access to rest fault indication interface.
   Arguments:

   - `config` - object, fault manager config
   - `config.hostname`
   - `config.brokerPort`
   - `config.serviceName`
   - `config.enabled` - set `true` if you want to enable fault handling

   Example:

   ```javascript
   configManager.on('container-config-changed', () => {
     const config = configManager.getFaultManagerConfig();
     if (config) {
       fMHandler.setConfig(config);
     }
   });
   ```
