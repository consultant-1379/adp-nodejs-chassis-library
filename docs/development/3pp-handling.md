# 3pp Handling

The release process is a semi-automated process, so some manual steps are required
in most of the time.

[Install Bob](./dev-env.md#bob) first as the steps below build on it.

You need to set some environment variables to be able to use the bob rules written in this document.
Please check these environment variables on [this wiki page](https://eteamspace.internal.ericsson.com/display/EIT/Tokens).

Create a `.bob.env` file with the variables, then these parameters can be permanently set in the
local repository. Also create these variables for your current cli session.
Bob looks for these values in multiple places.

?> The following steps sometimes require to edit yaml files which are very big. Advised to save them
with the `File: Save without Formatting` VSCode command.

## FOSS handling

Register the new/updated FOSS(es) and its dependencies in SCAS.
Related documentation from the used tools can be checked [on this page](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob-adp-release-auto/+/master/foss/README.md).

The FOSSA configuration is in `.fossa.yml`. If a new npm (or other) project is created in
the repo and has production dependencies, add configuration here.

?> The 3pp handling involves multiple systems and sometimes 3pps are registered differently which
can cause issues. Although many cases are automatically covered there might be issues with the flow.
In these case check the [Workarounds](#workarounds) chapter for help.

## Automatic 3pp handling

With the following steps, the content of `dependencies_foss_auto.yaml` can be automatically generated.
To keep consistent formatting there is a `foss-helper:fix-format` bob task to reformat this file.

1. Set the `FOSSA_API_KEY`, `SCAS_TOKEN`, `MUNIN_TOKEN` environment variables

   - Create a `.bob.env` file in your home directory with content from the above wiki page
   - Run `source ~/.bob.env`
   - The general FOSS handling process will communicate with the Ericsson SCAS and the FOSSA systems,
     so we need to set the necessary credentials for it.

2. bob foss-analyze-local

   This is an aggregated rule to automatize the 3pp processing steps.
   At the end the `dependencies_foss_auto.yaml` will be updated to the latest 3pps, and new components
   are already updated from SCAS.

   Also the rule tries to fix the most common issues with new components (eg. selecting license,
   filling missing source link, setting Stako to manual, filling in the linking field).

   The last task validates the yaml file and prints any errors which need manual intervention.
   When introducing or upgrading 3pp, there may be errors asking to register in SCAS (go to Step 3).
   For other error cases check the [dependency-update-with-scas](#dependency-update-with-scas)
   chapter (though no need to run that task manually, it is normally used by Drop pipeline only).

   If there are 3pps which are falsely found by Fossa, there is a filtering step. The
   `plms/dependencies_blocked_by_fossa.yaml` config file contains the list of packages which shouldn't
   be in the generated dependencies.yaml file. Only add 3pps here which are 100% false positive results.

   If there is nothing to register then skip SCAS and Munin registration steps and jump to Step 5.

3. Register 3pps in SCAS

   1. bob scas-register

      This rule registers every dependencies which does not have prim number or has
      `register=true` attribute in the `dependencies_foss_auto.yaml`

   2. Check if any of dependencies that were requested for registration are actually subcomponents.
      In this case check the [Handling subcomponents](#handling-subcomponents) chapter.

   3. Assign a topic `auto-3pp-handling` to the change in Gerrit. After that,
      **adp-ui-service-auto-3pp-handler** Jenkins job will check daily whether the component has
      been registered and synced with munin and it will add patchset with updated `dependencies_foss_auto.yaml`.

      > **Note**
      > The patchset with updated dependency file will be added when all dependencies are registered.

      Also this can be done manual, see
      [Manual update of registered dependencies](#manual-update-of-registered-dependencies) chapter.

4. Register 3pps in Munin

   1. bob foss-helper:merge-dependencies foss-helper:check-munin-sync-status

      As a prerequisite please set the `MUNIN_TOKEN` env variable in your environment.

      This step will check if all 3pps are available in Munin. If not then
      `.bob/munin-sync-status-files` folder will contain 1-2 files which must be sent by email to the
      3PP Team:

      Send a mail to Andrei Dorin Cojocaru <andrei.dorin.cojocaru@ericsson.com>
      and 3PPT <3PPT@ericsson.com> attaching the files from `.bob/munin-sync-status-files`
      and ask them to Sync these items into Munin.

      Wiki page to get the up-to date contact information:
      <https://eteamspace.internal.ericsson.com/display/ACD/FOSS+Evaluation+in+Mimer#FOSSEvaluationinMimer-HowtogetalreadyexistingFOSSfromBazaarintoMunin>

   2. Wait until all of the 3pp's and 2pp's are released in Munin. To check the status, you can rerun
      the bob step from the previous step. If the related 3pp/2pp is blocked by a Munin bug, then it
      can be skipped in the `plms/dependencies_blocked_by_mimer.yaml` until dependencies are released.

   3. bob foss-helper:update-munin-section
      Call a munin search on the `dependencies_foss_auto.yaml` to update it with the actual mimer
      component name and version string.

5. If EUISDK libraries are changed update `product_structure.yaml`.

   - EUISDK is a 2pp which is shown in this file. If EUISDK libraries are updated then update
     `prim` and `rstate` with the relevant release information.
     To get these information for EUISDK release, check the PRI document published in the [release documentation.](https://euisdk.seli.wh.rnd.internal.ericsson.com/showcase/esm-docs/#release)

6. Fill the `plms/encryptions.yaml` in case of a new dependency used for encrypting something.

   For more info check [Mimer registration](#mimer-registration)

7. Commit the modified `dependencies_foss_auto.yaml` and `dependencies_manual.yaml` and
   product structure files into the repo.

   The auto file is managed by ADP release scripts and Chassis Lib specific node js scripts as well.
   The output of these are different, to fix the formatting execute the bob step:
   `bob foss-helper:fix-format`.

   Then it is easier to track changes to the generated file in git.

8. (Optional) Handle the Fossa - SCAS naming difference.
   [Component name mapping](#component-name-mapping)

### Component name mapping

Component names in SCAS may be different from the ones discovered by Fossa.
The `bob-adp-release-auto` image contains a name mapping step to overcome these differences.
To make future SCAS scan results better it is better to keep this list up to date.

1. bob foss-name-mapping

   Fetches the actual mapping from the bob docker image, parses the dependency.yaml for different
   names and then generates a CSV, where each line represents a new mapping.
   The format is compatible with the `bazaar_name_map.csv` in the bob image.

2. Create a patchset for <https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob-adp-release-auto/+/master/foss/resources/bazaar_name_map.csv>
3. Add reviewers and send email: Avinash Hota, Mounisha Dandu, Mozes Nyitrai, Yasmin Tesfaldet Gebreyesus

## Manual 3pp handling

In some cases the automatic process can't discover or handle 3pps correctly. For this the
`dependencies_manual.yaml` file is used, which should contain all dependencies
which are not detected correctly by FOSSA

1. Add or update 3pp in `dependencies_manual.yaml`

   - Run a SCAS scan for the entry to get up to date info:
     `bob foss-helper:dependency-update-with-scas-manual`
   - Then restore all deleted comments from the file.
   - Important to fill the `mimer.usage` field with description of how the FOSS is used by
     the product.

2. Update product structure files if necessary.

## Details of the steps

### foss-analyze-local

This is an aggregated rule to execute all the automated tasks locally. It contains a series
of automatic fixes to the dependency.yaml files to overcome the limitations of the tools
and ease the 3pp handling process.

#### foss-analyze

This rule executes the FOSSA CLI on the JS projects, collect 3pps and merge into the
`dependencies_foss_auto.yaml` file.

1. bob foss-analyze:analyze

   - During this process the FOSSA server is used to scan all dependencies in the Chassis Lib.
   - It returns a link where the analysis can be checked

2. bob foss-analyze:status-check

   - We have to wait until the scan is finished. This rule will poll the process status.

3. (Optional) Check the analysis on FOSSA GUI

   - Open the link from step 3, using the credential from the token wiki page (username and _password_).
     Check the dependencies, which can be ignored if recognized falsely.

4. bob foss-analyze:report-attribution

   - All scanning information is fetched from the FOSSA server to `.bob/fossa-report.json`

5. bob foss-analyze:dependency-update-with-foss

   - All information from FOSSA is merged into `plms/dependencies_foss_auto.yaml`

6. bob foss-analyze:fix-primary

   - The `primary` field for the new components are not preserved after the previous FOSSA step.
     It shall be set `- this` for the _direct_ dependencies, and `['']` for the _deep_ dependencies.
   - The task executes a helper script (`plms/scripts/fix-primary-from-package`) to set the
     `primary` field based on `package.json` files and update the `mimer.usage` fields with usage info.

     ```bash
     node plms/scripts/fix-primary-from-package.js \
       plms/dependencies_foss_auto.yaml \
       packages/**/package.json
     ```

7. bob foss-analyze:fix-linking

   - Set the `linking` filed for the discovered components. For nodejs services it is set to `Dynamically`
     and for UI services which are bundled with webpack it is set to `Statically`

8. bob foss-analyze:enrich

   - enrich 3pps with values from the `plms/dependencies_enrichment.yaml`. Used to add workarounds
     for various 3pp handling issues

9. fix formatting

#### foss-register-help

This rule takes the new components, scans SCAS for matches and updates `dependencies_foss_auto.yaml`.
All components where the value of `bazaar.register` is not `no` will be processed.
It can be `yes` fro new components or a registration number for components under processing.

Also there is a `plms/scripts/name-mapping.json` file which contains the FOSSA - SCAS name mapping
for components where the SCAS name is different.

1. bob foss-register-help:filter-unregistered

   - filter the unregistered components into a temp file
   - changes names for better SCAS scan results

2. bob foss-register-help:dependency-update-with-scas-for-unregistered

   - executes a SCAS scan for the unregistered components

3. bob foss-register-help:rename-unregistered

   - change component names back

4. bob foss-register-help:merge-unregistered

   - merge unregistered list back to `dependencies_foss_auto.yaml`

5. bob foss-register-help:fill-missing-bazaar-src

   - fix missing src attributes

6. bob foss-register-help:fix-license-stako-src

   - fix Stako and license issues automatically

7. bob foss-helper:update-munin-section

   - search for 3pps in mimer and updates the mimer section of the dependencies

8. fix formatting

9. validate dependency files

### foss-helper

This is a collection of tasks related to Foss handling.

!> This rule should not be called directly

Some (not all) tasks are described in details in the next chapters.

#### fix-format

Fix the formatting of the `dependencies_foss_auto.yaml` to be the similar what the adp-release
tasks are producing. Helpful for checking the changes between git commits.

#### check-dependencies-files

This task will analyze the dependencies files and show if there is anything to register.
It shows other issues with the dependencies.

For more info check the [dependency-update-with-scas](#dependency-update-with-scas)
chapter for some tips.

#### dependency-update-with-scas

- This rule will update the auto and manual yaml files, update fields for dependencies
  with latest information from SCAS. It may take time to scan all dependencies one-by-one...
- There can be errors which need manual interventions. Edit the `dependencies_foss_auto.yaml`
  to fix the issues and then rerun the job. Check the _Summary_ section of the logs:

  - At the end the _Issues with MANDATORY Attributes_ error message shows that there are required
    fields which are not filled properly. Check these, and manually fix them according to the
    error message.

  - The warning section shows multiple issues, one type is when a **component is not found in SCAS**

    `* Did not find '@babel/runtime' '7.13.7' in SCAS. Component needs to be registered`

    The cause may be that the module name in fossa and in SCAS is different.
    If so create an update commit according to the [Component name mapping](#component-name-mapping).
    For short term update the `plms/scripts/namemapping.json`.

    Other cause may be that, the version format in fossa is different as in SCAS.
    (eg. 2.0.0 vs 2.0). In that case the `versions` may contain a list,
    where the first item is the version in SCAS, and the second is the version in fossa.

    In this case manually search for the component in SCAS, get the **Component Number**
    and update the `bazaar.prim` attribute of the component in `dependencies_foss_auto.yaml`

    Hint: search for `prim: ''` in the yaml file and then use the `bazaar.register` number
    (_use the numeric part only_) to construct a direct URL to the components:
    `https://scas.internal.ericsson.com/product-details/<productId>/version/<versionId>/request3pp/<requestId>`
    But always double check the result if the relevant component was found.

  - The Error section shows **Selected License**. (If there are multiple available license
    then select one)

  - The Error section shows **Stako** issues. (ESW1-2 are the good levels, ESW3-4 are risks)

    `* Invalid Stako ESW4 for component Form-Data, version 2.3.3`

    Edit `bazaar.stako_decision_reason: automatic` to `manual` in these components.

    Or use the `fix-stako-license.js` script from the `ci-toolbox` image to fix stako and license issues.

    ```bash
    node fix-stako-license.js
      --dependencies-path plms/dependencies_foss_auto.yaml
      --output-dependencies-path plms/dependencies_foss_auto.yaml
    ```

  - The Error section shows issues with **mimer**:

    `* prim number ''is not same as,mimer product_number '2.0.0'`

    Then login to [mimer](https://mimer.internal.ericsson.com/) with `eeamunin` user
    (password is on the tokens page), and try to find the 3pp with module name or prim number
    and update these fields. Note not only the product number, but the version tag may be different.

## Handling subcomponents

Some dependencies can be a part of monorepo or be a complex package's module. In this case they
should be treated as subcomponents. Additional information in this
[chapter](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob-adp-release-auto/+/master/foss/DEPENDENCIES_YAML_USER_GUIDE.md#Main-component-vs-subcomponent).

> **Note**:
> In case during the registration step a request to register subcomponent was made, it can be
> removed, as the assigned 3PP administrator will set **SENTBACK** status to it and in most cases
> ask you to delete it.

To get prim number for subcomponent these steps should be used:

1. Create a patchset for adding subcomponent to the [bazaar_name_map.csv](https://gerrit-gamma.gic.ericsson.se/plugins/gitiles/adp-cicd/bob-adp-release-auto/+/master/foss/resources/bazaar_name_map.csv)
   in ADP Release Automation Builder. Add reviewers and send email to
   ADP Enablers ([Avinash Hota](avinash.hota@ericsson.com), [Mounisha Dandu](mounisha.dandu@ericsson.com),
   [Mozes Nyitrai](mozes.nyitrai@ericsson.com), [Yasmin Tesfaldet Gebreyesus](yasmin.tesfaldet.gebreyesus@ericsson.com)).

   Example of adding subcomponents of _lodash_ main component:

   ```text
   npm;lodash.merge;lodash;;yes;;
   npm;lodash.once;lodash;;yes;;
   ```

   This step will prevent from scanning the subcomponent as main component after the patchset is
   in ADP Release Automation Builder.

2. Check if the main package containing the subcomponent is already registered. If not, create
   a request manually [here](https://scas.internal.ericsson.com/product-details/5533/version/4959/swRequests).

   > **NOTE**:
   > Make sure to check which version of a main component contains the subcomponent.
   > Versions could not match. For example main component `OpenTelemetry-js+1.12.0` includes
   > these subcomponents:\
   > @opentelemetry/api+1.4.1\
   > @opentelemetry/exporter-trace-otlp-http+0.38.0\
   > @opentelemetry/resources+1.12.0

3. Wait until the main component is registered and the subcomponent is added to
   `bazaar_name_map.csv` (step 1 is completed), and continue with the standard registration steps.

## Workarounds

### SCAS scan

_A 3pp is not found by the SCAS scan, but on the UI it can be found._

- _if the 3pp component has 2 letter name._ In this case the bob script refuses to search for the component.
  Manually update the `dependencies_foss_auto.yaml` with the `prim` number then re-run the SCAS scan.
  Keep the `register` attribute on `yes` to make the script to process this 3pp.
- _the 3pp has different name when FOSSA finds it and how it is registered in SCAS._
  Then update the [Component name mapping](#component-name-mapping) CSV. Until it is not merged
  use the `name-mapping.json` as a workaround.

_The version string of a 3pp is different in FOSSA and SCAS._ (eg. '2.0.0' vs '2.0')

- add an entry to `dependencies_enrichment.yaml`, and override the `versions` attribute. The first
  item shall be the version string in SCAS and the second is the normal.

### Manual update of registered dependencies

1. Wait until the manual SCAS approvement process is finished by the 3pp coordinator team,
   or manually add prim numbers

   - You can check the status on our [SCAS Requests page](https://scas.internal.ericsson.com/product-details/5398/version/4711/swRequests)
   - If the status is **COMPLETED**, then the process is finished.
   - The registered components are automatically assigned to 3pp coordinators, the process can take
     several days or weeks depending on the number of registered components
   - [Waiting Queue](https://scas.internal.ericsson.com/user-requests/requests-queue)
   - If a 3pp exists in SCAS, then you can manually update the bazaar section to
     speed up the registration.
   - [search](https://scas.internal.ericsson.com/search3pp) for the component in SCAS
     and get its PRIM number
   - set `bazaar.prim` to the PRIM number from SCAS

2. bob foss-register-help
   Restart the SCAS scanning and processing steps. It should update `dependencies_foss_auto.yaml`
   with the latest values from SCAS for the unregistered components.

   If there is any component which is not found in SCAS then there may be a name mapping issue.
   Search for the component in SCAS and get the actual name, then update the `plms/scripts/name-mapping.json`.
   Also follow the [Component name mapping](#component-name-mapping) steps.

   If the component name is **2 letters long** in SCAS, then the script won't find it with
   name based search. Manually Update the `bazaar.prim` field.

   See the rule [description](#check-dependencies-files).

### Mimer registration

_The 3pp is not in mimer._ Then register it into mimer, follow the "Register 3pps in Munin" steps.

_The version of 3pp is not correctly registered._ Check the `mimer` section of the dependencies.yaml.
If the component and the version is already in mimer use the `bob foss-helper:update-munin-section`
to refresh the `mimer` section with the up-to-date values.

_Skip a 3pp temporarily from mimer._ If a 3pp registration into mimer has a blocking issue, then
add the 3pp to the `plms/dependencies_blocked_by_mimer.yaml` file. For more info see
"Register 3pps in Munin" steps.
