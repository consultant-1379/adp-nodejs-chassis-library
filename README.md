# ADP NodeJS Chassis Library

## Overview

Library is organized as mono-repository, every library package is defined under the `./packages/*` folder.
Each library is a standalone npm project as their dependencies must be strictly controlled.

A bash script (`scripts/run-npm-all.sh`) can help to execute common commands on all projects.

All dependencies operations should be performed from the library root, utilizing npm scripts.

Example:

```bash
npm run ci:all # to install all dependencies packages in all workspaces;
```

### Sub-projects requirements

Each of the sub-projects should:

- Have `.npmrc` file with correct indication of repositories, scopes and token environment
  variables:

  - `registry=https://arm.seli.gic.ericsson.se/artifactory/api/npm/proj-adp-nodejs-chassis-library-npm`
  - `@adp:registry=https://arm.seli.gic.ericsson.se/artifactory/api/npm/proj-adp-nodejs-chassis-library-npm-local/`
  - `//arm.seli.gic.ericsson.se/:_auth=${ARM_NPM_TOKEN }`

- Have mandatory scripts in `package.json`:

  - for publish: `"safePublish": "node ../../scripts/safePublish.js <packageFolderName>"`
    with correct path to the common `safePublish.js` script
  - Publish config field with repository url

    ```json
    "publishConfig": {
      "registry": "https://arm.seli.gic.ericsson.se/artifactory/api/npm/proj-adp-nodejs-chassis-library-npm-local/"
    }
    ```

  - `"checkjs": "tsc"` to generate type script definitions
  - `"build": "tsup ./src/index.js --format cjs --outDir src"` to generate CJS module format from
    ESM sources.

- Name of the project should include scope @adp: `name:@adp/<packageName>`

#### UI components Demo page

_ui-components_ sub-project contains common E-UI SDK components used by several projects.
These components can be viewed on a Demo page, which is constantly updated as the sub-project is
improved.
To run the Demo page, execute the command `cd packages/ui-components/ && npm run start` from the
root directory.

### Project Development

If a content of the project is updated follow this steps:

1. make changes to the source code
2. update tests, make sure coverage is good enough
3. update markdown api docs: `npm run generate-api-docs`
4. update type script definitions: `npm run checkjs:all`
5. to publish changes:
   - increase version in `package.json`
   - update `package-lock.json` by running `npm install`. Make sure that only the version is changed
     there.

## Documentation

The documentation is in Markdown format and stored under the `docs` folder.
For a better developer experience use the docsify viewer.

[Introduction](/docs/homepage.md)

- Development docs

  - [Dev-Env](/docs/development/dev-env.md)
  - [Build system](/docs/development/build-system.md)
  - [CI pipelines](/docs/development/ci-pipelines.md)
  - [Documentation](/docs/development/documentation.md)

### Quick start

_Prerequisite:_ NodeJS installed

To check documentation with docsify:

```bash
npm i docsify-cli -g
docsify serve docs
```

To install dependencies.

```bash
npm install
```

## Install git hook

In the root folder run the installer script:

```bash
./git-hooks/install.sh
```

## CI/CD

Both precodereview and drop pipeline will perform build, linting, testing and publishing of the
workspaces projects(precodereview - within `dryRun` sequence). Publish to the npm repository will be
performed only if the local package version - indicated in package.json will be higher then
`highest published`.

After publishing new version of the package to the repo, git tags are being created:
`<PackageName>:<PackageVersion>` with annotation `<PackageName> release, version <PackageVersion>`
