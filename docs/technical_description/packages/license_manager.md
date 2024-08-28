# License Manager Package

Microservice Chassis provides license management which logs information about licenses
for specified product type. License Manager provides the ability to manage software entitlements
generated from the customer’s contractual agreement. It provides the means for applications to have
access to the latest licensing information available from the License Server, including the
aggregated amount of capacity being consumed at network level.

LM enables applications to read information about the license inventory and each license’s status,
register use of a license, and report usage of capacity licenses to the license server.

## Usage

To configure license management, it is needed to provide licenseManagerConfig.
The config should contain base configuration for license manager.

To correct initialization LicenseManager we should pass parameters
to the constructor of LicenseManager, when we create LicenseManager.

Example:

   ```javascript
   const licenseManager = new LicenseManager({
     licenseManagerConfig: configManager.getLmConfig(),
     useHttps: configManager.useHttps(),
     logger,
     secureContext,
     tlsAgent,
   })
   ```

## License Manager Parameters

1. licenseManagerConfig - Object, license manager config

   Example:

   ```json
   {
     "enabled": true,
     "productType": "Expert_Analytics",
     "hostname": "eric-lm-combined-server",
     "tlsPort": "18326",
     "httpPort": "8080",
     "licenses": [
        {
          "keyId": "FAT1024238/1",
          "type": "CAPACITY_CUMULATIVE"
        }
     ]
   }
   ```

## License Manager mTLS connection security

mTLS can be enabled passing the `tls.enabled: true`.

## License Manager Package API

1. `readLicensesInfo` method
   The method read licenses information based on licenses in the licenseManagerConfig.

2. `setLicenseManagerConfig` method
   The method set license manager config.
   Arguments:

   - config - object, license manager config
   - config.productType,
   - config.hostname,
   - config.tlsPort
   - config.httpPort,
   - config.licenses,
   - config.enabled - set `true` if you want to enable license management

   Example:

   ```javascript
   configManager.on('container-config-changed', () => {
     const config = configManager.getLmConfig();
     if (config) {
       licenseManager.setLicenseManagerConfig(config);
     }
   });
   ```
