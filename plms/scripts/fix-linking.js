import * as fs from 'fs';
import yaml from 'js-yaml';

// ------------- MAIN -------------------

// arguments
const cliArgs = process.argv.slice(2);

const dependencyFile = cliArgs[0];
const dependencies = yaml.load(fs.readFileSync(dependencyFile, 'utf8'));

const linkingType = cliArgs[1];

const allowedLinking = ['', 'Dynamic', 'Static', 'Classpath', 'Not Linked'];
if (!allowedLinking.includes(linkingType)) {
  console.log(
    `linking type '${linkingType}' is invalid. Valid values: ${allowedLinking.join(', ')}`,
  );
  process.exit(1);
}

console.log(`Processing dependency file: ${dependencyFile}, with linking type: ${linkingType}`);

let linkingsChanged = 0;

dependencies.dependencies.forEach((dependency) => {
  if (dependency.mimer.linking !== linkingType) {
    linkingsChanged += 1;
    dependency.mimer.linking = linkingType;
  }
});

console.log('---------- Linkings -------------');
console.log(`Number of changed dependencies linkings: ${linkingsChanged}`);
console.log('---------------------------------');

fs.writeFileSync(
  `${dependencyFile}`,
  yaml.dump(dependencies, { noArrayIndent: true, lineWidth: 1000 }),
  'utf8',
);
console.log(`Input file ${dependencyFile} is updated with the linking attributes`);
