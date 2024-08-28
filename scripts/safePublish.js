import { createRequire } from 'module';
import semver from 'semver';
import https from 'https';
import { execSync } from 'child_process';

const [location, dryRun] = process.argv.slice(2);
const isDryRun = dryRun === 'dry-run';

const require = createRequire(import.meta.url);
/* eslint-disable */
const packageJson = require(`../packages/${location}/package.json`);
const { name, version: currentVersion, publishConfig } = packageJson;
const { ARM_USER_SELI, ARM_TOKEN_SELI } = process.env;

checkPackageStatus(name).then((packageData) => {
  const { ['dist-tags']: { latest: publishedVersion } = { latest: null }, name: publishedName } =
    packageData;

  const isPublished = publishedVersion && publishedName;
  const localV = semver.parse(currentVersion);

  if (isPublished) {
    const pubV = semver.parse(semver.coerce(publishedVersion));

    if (semver.gt(localV, pubV)) {
      console.log(
        `Package ${name}: Published version is ${pubV}, local version is ${localV}. New package version will be published.`,
      );
      execSync(`npm publish ${isDryRun ? `--dry-run` : ''}`);
      createTags(name, localV);
    } else {
      console.log('Local package with same or newer version is already published');
    }
  } else {
    console.log(
      `Package '${name}' was not published yet. Local version of the package will be published.`,
    );
    execSync(`npm publish ${isDryRun ? `--dry-run` : ''}`);
    createTags(name, localV);
  }
});

function checkPackageStatus(name) {
  return new Promise((resolve, reject) => {
    https.get(
      `${publishConfig.registry}/${name}`,
      {
        headers: {
          Authorization: `${ARM_USER_SELI}:${ARM_TOKEN_SELI}`,
        },
      },
      (res) => {
        let body = '';

        res.on('data', (d) => {
          body += d;
        });
        res.on('error', (e) => {
          console.log(e);
          reject(e);
        });
        res.on('end', () => {
          body = JSON.parse(body);
          resolve(body);
        });
      },
    );
  });
}

function createTags(name, version) {
  const tagName = `${name}@${version}`;

  if (execSync(`git tag -l ${tagName}`).toString()) {
    console.log(`Tag ${tagName} already exists, removing it so it can be re-created`);
    execSync(`git tag -d ${tagName}`);
  }
  execSync(`git tag -a ${tagName} -m "${name} release, version ${version}"`);
}
