# NPM Library Generator

## Overview

This yeoman-generator can be used for creating npm libraries.

## Usage

### Prerequisites

Install the yeoman-generator npm-package globally.
`yo` is a command line interface for yeoman

```bash
  npm install --location=global yo
```

Set this @adp library in your global npm config:

```bash
  npm config --location=global set @adp:registry=https://arm.seli.gic.ericsson.se/artifactory/api/npm/proj-adp-nodejs-chassis-library-npm-local/
```

Make sure you are in a folder, where there is no .npmrc file.
(The chassis projects' .npmrc has an ARM token set, which is not suitable for downloading.)

Install the npm-library generator:

```bash
  npm install --location=global @adp/generator-npm-library
```

#### Troubleshooting

If you receive authentication error, re-try after deleting .npmrc from your home.

If the following error occurs:
`Trying to copy from a source that does not exist: YOUR_LOCAL_PATH_TO_NPM/lib/node_modules/@adp/generator-npm-library/generators/app/templates/.npmrc`
Copy `packages/developer-tools/generator-npm-library/.npmrc` to `YOUR_LOCAL_PATH_TO_NPM/lib/node_modules/@adp/generator-npm-library/generators/app/templates/`.

Create a folder where the npm library will be generated.

```bash
  mkdir <folder> && cd <folder>
```

Run the npm-library generator

```bash
  yo @adp/npm-library
```

or type `yo` and select the generator

Give the generator the preferred inputs:

- package name
- description
- version
- main module

The project file system with some skeleton files will be generated.

## Create new generators

Every new generator should be in the `custom-generators` folder.

[Check out the official website for more information](https://yeoman.io/)
