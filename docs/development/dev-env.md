# Development environment

This section provides information about the suggested development environment.

## Requirements

- NodeJs
  - Use version 16
  - Advised to install nvm (Node Version Manager) to keep up with future version changes
    - [Linux version](https://github.com/nvm-sh/nvm)
    - [Windows version](https://github.com/coreybutler/nvm-windows)
  - Some dependency uses the node-gyp npm package which can compile native addons.
    It requires some build tools to be available, for more info see: [node-gyp](https://github.com/nodejs/node-gyp)
    - Windows: run as Administrator: `npm install --global windows-build-tools`
    - Linux: install python, make, gcc
- Docker
  - for Windows use [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Bob
  - mainly required for CI pipeline development <https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob>
- Git
  - Source code versioning <https://git-scm.com/>

## Repository

The source code is in Git and the code review is done through Gerrit.
For development First time the repository has to be set up properly.

```bash
git clone ssh://<SIGNUM>@gerrit-gamma.gic.ericsson.se:29418/EEA/adp-nodejs-chassis-library
```

For checking whether the commit message is acceptable according to some message patterns,
there is a script implemented in NodeJS.
After cloning the repo, there is the `git-hooks/commit-msg.d` folder where are two scripts at the
moment:

- **gerrit-commit-msg** - this is the default gerrit hook for adding change id to commit messages
- **smi-commit-msg.js** - the new hook to validate the commit message

To use both of these scripts the new git hook (`git-hooks/commit-msg`) simply calls them when
triggered.

After running the `git-hooks/install.sh` script, this new commit-msg hook will be enabled so both
of the scripts will be used for the commit messages.

_Note:_ `git-hooks/install.sh` script should be run from the root of the project's folder.\
_Note:_ this will override the existing commit-msg hook, which is the gerrit hook by default.

### Gerrit

The Gerrit server is maintained centrally [Gerrit_Central](https://wiki.lmera.ericsson.se/wiki/Gerrit_Central/Home)
Setup steps: [Setup](https://wiki.lmera.ericsson.se/wiki/Gerrit_Central/Setup)

To start working a properly setup account is required, setup an ssh key at:

- <https://gerrit-gamma.gic.ericsson.se/#/settings/ssh-keys>

In the cloned repository edit the '.git/config' file as shown for proper push and pull URLs:

```propreties
[remote "origin"]
    url = ssh://<SIGNUM>@gerritmirror.lmera.ericsson.se:29418/EEA/adp-nodejs-chassis-library
    pushurl = ssh://<SIGNUM>@gerrit-gamma.gic.ericsson.se:29418/EEA/adp-nodejs-chassis-library
```

Setup a commit hook to generate change-id:

```bash
gitdir=$(git rev-parse --git-dir); \
  scp -p -P 29418 ${USER}@gerrit-gamma.gic.ericsson.se:hooks/commit-msg ${gitdir}/hooks/
```

Common commands:

```bash
git push origin HEAD:refs/for/master  # push commit for review
git commit --amend                    # change commit locally to create a new patchset
```

## Bob

Bob is mainly used in CI to execute commands in docker containers. It can be installed locally
also, which can be convenient for executing tasks.

?> Note for most NodeJS related development task Bob is not needed locally.

Bob expects you to have a valid docker login towards your docker registry on the
host, currently it can't handle automatic login by itself. Bob tasks use images
from the armdocker repository. You can login to these repositories with the following commands:

```bash
docker login armdocker.rnd.ericsson.se
```

?> As Bob uses docker images to execute commands, at first it may be slow to download images, but
subsequent commands will be faster.

The official [User's Guide for Bob](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob/+/master/USER_GUIDE_2.0.md#Running-bob-in-a-container-on-Windows)

### Windows

!> The native windows support _does not work_ with Docker Desktop over **WSL2**. To use bob
in this way, set docker desktop to use _WSL1_.
Or use it from WSL2. Since Bob is added to the path it will work from WSL2 shells too.

Quick steps:

1. Clone repository to a known folder

   ```powershell
   git clone https://gerrit-gamma.gic.ericsson.se/a/adp-cicd/bob
   ```

2. Add bob to PATH
   Option A: use the Settings panel GUI in Windows 10
   Option B: use an Administrative Powershell

   ```powershell
   # Fetch actual value of PATH
   $oldpath = (Get-ItemProperty `
     -Path `
     'Registry::HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment' `
     -Name PATH).path
   # Create the new value
   $newpath = "$oldpath;$pwd\bob"
   # Set the new value to PATH
   Set-ItemProperty `
   -Path `
   'Registry::HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment' `
   -Name PATH -Value $newPath
   ```

3. Verify install

   ```powershell
   bob --help
   ```

### Linux

Quick steps:

1. Clone repository to a known folder

   ```powershell
   git clone https://gerrit-gamma.gic.ericsson.se/a/adp-cicd/bob
   ```

2. Add bob to PATH.
   For this step you can create a .sh file containing information about your bob folder locations
   and the personal credentials:

   ```powershell
   export PATH=$PATH:/usr/local/bin:/<path to bob folder>
   export ARM_USER_SELI=<your signum>
   export ARM_TOKEN_SELI=<your encrypted password or API key>
   ```

   Both encrypted password and the key could be found on
   [Artifactory](https://arm.seli.gic.ericsson.se/ui/admin/artifactory/user_profile).

   **Note:** It is better to use API key, otherwise you will have to update `ARM_TOKEN_SELI` every
   time it is changed.

3. Verify install

   ```powershell
   bob --help
   ```

## IDE

The recommended IDE is [Visual Studio Code](https://code.visualstudio.com/). It is an open-source
and free, customizable editor, which provides great tooling for JavaScript based development.

To improve developer experience a common set of VSCode settings and extension recommendation is
committed to the repository. The predefined configuration is in the `.vscode` directory in the
repository root. To utilize these open a workspace from the repository root, then accept to install
the recommended extensions. Other settings are automatically used by VSCode.

?> If settings are changed in the `.vscode` folder then a VSCode restart might be needed after
a git pull.
