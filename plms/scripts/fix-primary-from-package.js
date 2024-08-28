import * as fs from 'fs';
import yaml from 'js-yaml';

const PRIMARY_FIELD = 'primary';

// ------------- MAIN -------------------

// arguments
const cliArgs = process.argv.slice(2);
const dependencyFile = cliArgs[0];
const dependencies = yaml.load(fs.readFileSync(dependencyFile, 'utf8'));

const packageJsonFiles = cliArgs.slice(1);
const packageJsons = packageJsonFiles.map((file) => JSON.parse(fs.readFileSync(file, 'utf8')));

console.log(`Processing dependency file: ${dependencyFile} and package.jsons: ${packageJsonFiles}`);

const mergedDependencies = packageJsons
  .map((json) => json.dependencies)
  .reduce((acc, dep) => ({ ...acc, ...dep }), {});

const isPrimary = (name) => name in mergedDependencies;

const primaries = [];

dependencies.dependencies.forEach((dependency) => {
  const currentIsPrimary = dependency[PRIMARY_FIELD].length !== 0;
  const desiredIsPrimary = isPrimary(dependency.name);
  if (currentIsPrimary !== desiredIsPrimary) {
    let newValue;
    if (desiredIsPrimary) {
      newValue = ['this'];
    } else {
      newValue = [''];
    }
    console.log(`[${dependency.ID}] changing primary to ${newValue}`);
    dependency[PRIMARY_FIELD] = newValue;
  }

  if (desiredIsPrimary) {
    primaries.push(dependency.ID);
  }
});

console.log('---------- Primary Dependencies -------------');
console.log(primaries.join('\n'));
console.log('---------------------------------------------');

fs.writeFileSync(
  `${dependencyFile}`,
  yaml.dump(dependencies, { noArrayIndent: true, lineWidth: 1000 }),
  'utf8',
);
console.log(`Input file ${dependencyFile} is updated with the primary attributes`);
