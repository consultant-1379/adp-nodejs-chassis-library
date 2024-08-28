# Project Information - Revisions

## Version numbering

The ADP NodeJS NPM Library uses the following version numbering scheme: **MAJOR.MINOR.PATCH**

### Jira tickets

The release note should contain all changes. For a bug the related Jira ticket also should be linked.

### Structure

The list below groups the changes according to the main version. Also a start and end date is provided
to show the period when commits were merged for that release.

If a change is added to the list, select the latest version and add the change to that section.
If the main version is changed then create a new section with open interval and also add the close date
to the previous version.

<!-- markdownlint-disable MD013 -->

## Versions

### 0.1.0 - (2021. 10. 12 - )

- Feature: [ADPRS-368](https://eteamproject.internal.ericsson.com/browse/ADPRS-368) Add Sonarqube to CI pipelines
- Feature: [ADPRS-276](https://eteamproject.internal.ericsson.com/browse/ADPRS-276) Move Logger, CM, CertM to the base lib
- Feature: [ADPRS-275](https://eteamproject.internal.ericsson.com/browse/ADPRS-275) FM into base lib
- Feature: [ADPRS-275](https://eteamproject.internal.ericsson.com/browse/ADPRS-275) Added PM service to the chassis lib
- Feature: [ADPRS-274](https://eteamproject.internal.ericsson.com/browse/ADPRS-274) Auth for publish in CI/CD pipeline
- Feature: [ADPRS-598](https://eteamproject.internal.ericsson.com/browse/ADPRS-598) Added JSDoc lint plugin to eslint in the library
- Feature: [ADPRS-379](https://eteamproject.internal.ericsson.com/browse/ADPRS-379) Typescript declarations (d.ts)
- Feature: [ADPRS-316](https://eteamproject.internal.ericsson.com/browse/ADPRS-316) Added Auth service to the chassis lib
- Feature: [ADPRS-314](https://eteamproject.internal.ericsson.com/browse/ADPRS-314) Added file logging to the base/logging package
- Feature: [ADPRS-852](https://eteamproject.internal.ericsson.com/browse/ADPRS-852) Updated fossa-cli
- Feature: [ADPRS-1499](https://eteamproject.internal.ericsson.com/browse/ADPRS-1499) Update CertM for server certificates
- Feature: [ADPRS-1647](https://eteamproject.internal.ericsson.com/browse/ADPRS-1647) Move License Manager to the library
- Feature: [ADPRS-1970](https://eteamproject.internal.ericsson.com/browse/ADPRS-1970) Configurable annotations for service discovery
- Feature: [ADPRS-2527](https://eteamproject.internal.ericsson.com/browse/ADPRS-2527) Move Config Query Service into node.js chassis kubernetes lib

- Engineering task: [ADPRS-897](https://eteamproject.internal.ericsson.com/browse/ADPRS-897) Dual ESM+CJS format for library modules
- Engineering task: [ADPRS-1469](https://eteamproject.internal.ericsson.com/browse/ADPRS-1469) Introduce Vale spell check

### 0.0.0 - (2021. 10. 04 - 2020. 10. 12)

- Feature: [ADPRS-274](https://eteamproject.internal.ericsson.com/browse/ADPRS-274) Created npm project
- Feature: [ADPRS-274](https://eteamproject.internal.ericsson.com/browse/ADPRS-274) Added basic CI/CD pipeline
