# Build System

The local build system is based on NPM and Bob.

A series of NPM scripts are written to ease the local development of NodeJS projects.
The root project contains multiple npm scripts, which can initialize the repository or
start development server.

**Bob** is used to execute tasks in CI, but it can be used locally as well to execute
build related tasks, e.g. creating docker images, helm charts.

## NPM Tasks

### Install dependencies

Packages are handled by NPM and all dependency is defined in package.json files.
For CI there are optimized versions of the commands where some npm features are switched off
(--preffer-offline & --no-audit)

### Prerequisites

For accessing the ARM repositories the `ARM_NPM_TOKEN` must be set as environment variable.

Before generating the token the following environment variables must be set:

```bash
export ARM_USER_SELI="<signum>"
export ARM_TOKEN_SELI="<api token from https://arm.seli.gic.ericsson.se/>"
export ARM_USER_SERO="<signum>"
export ARM_TOKEN_SERO="<api token from https://arm.rnd.ki.sw.ericsson.se/>"
```

To generate the token use `bob generate-npm-token`.
The `.bob/var.token` and `.bob/var.rnd-token` files will include the generated tokens.

Set them as env variable:

```bash
export ARM_NPM_TOKEN="<token from .bob/var.token>"
export RND_ARM_NPM_TOKEN="<token from .bob/var.rnd-token>"
```

### Usage

```bash
npm run install:all       # Install all dependencies from root
npm run ci:all       # Clean install all dependencies from root
```

### Linting

The project includes multiple static code analyzer steps which can check the repository for various
issues. The analyzers have config files in the root of the repo and some has in subproject as well.

Linters and configs:

- ESLint <https://eslint.org/>
  - .eslintrc\*
  - .eslintignore
- Markdownlint <https://github.com/igorshubovych/markdownlint-cli>
  - .markdowlint.json
  - .markdowlintignore
- lockfile-lint <https://github.com/lirantal/lockfile-lint>
  - .lockfile-lintrc\*

```bash
npm run lint                  # execute all lint tasks
npm run lint:markdown         # lint all *.md files in the repository.
npm run lint:package-lock     # lint package-lock.json files
```

### Type Script validation

To configure typescript validation it's needed to rename jsconfig to tsconfig.
It's also needed to generate d.ts file from JSDoc.
The d.ts file will contain interfaces of methods.
More information about tsconfig configuration can be found here
<https://www.typescriptlang.org/docs/handbook/declaration-files/dts-from-js.html>.

```bash
npm run checkjs               # generate bundle.d.ts file and validate code.
```

<!--- TODO: add more NPM tasks -->
