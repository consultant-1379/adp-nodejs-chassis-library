# CI Pipelines

The build system of the CI/CD pipeline is Jenkins. The job commands is specified with pipeline scripts.\
In the Jenkins jobs, the pipeline scripts are using **Bob** to execute commands.

## Jenkins

Service level CI pipelines are executed with Jenkins.
The [Presentation view](https://seliius27190.seli.gic.ericsson.se:8443/view/Presentation/)
contains an **ADP NodeJS Chassis Library** section which shows all Chassis Library related pipelines.

<!--- TODO: group nodejs-chassis-library-drop and nodejs-chassis-library-precodereview -->

The pipeline definition files are located in the `ci/` folder with `*.jenkinsfile` extension.

## Bob

Internally most job step calls different Bob rules and tasks.
The main bob file is in the root of the repo: `ruleset2.0.yaml`.
To execute rules from these rulesets, use the `-r <rulesetfile>` options with Bob.

## Pipelines

### Pre-code-review

It is executed for every Gerrit patchset. Checks the commit in various ways:

- lint
- execute unit tests
- execute selenium tests
- Sonarqube analysis
- 3pp analysis with FOSSA and SCAS
- dry-run document generation

### Drop

When the automatic tests pass and the manual review of the code is done, the change can be merged to
the code base.
Beside running the same scope as PreCodeReview pipeline it has extra steps:

- publish packages to the Artifactory

### Outdated 3pps Handler

This job check if new versions of direct, production 3pps are available and create a task
with a list of these 3pps or update existing task.

This job uses outdated-3pps-to-jira.js script from ci-toolbox to create or update tasks.

See more info here
<https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/EEA/general_ci/+/master/docker/toolbox/nodejs_helpers/docs/outdated-3pps-ticket-generation.md>

### Auto 3pps Handler

This job fetch all commits with `auto-3pps-handling` topic for this project and check
if 3pps registration finished and new 3pps versions are synced with munin.

If 3pps registration finished seccessfully and new 3pps versions synced with munin then
this job will add a new patchset to the appropriate commits.
