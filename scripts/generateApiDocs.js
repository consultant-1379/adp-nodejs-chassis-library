import fs from 'fs';
import path from 'path';
import jsdoc2md from 'jsdoc-to-markdown';

const PARTIAL_FOLDER = 'docs/templates/partials';
const PACKAGE_API_TEMPLATE_NAME = 'docs/templates/package-api.hbs';
const PACKAGES_FOLDER = 'packages';
const PACKAGE_CODE_FOLDER = 'src';
const DOC_API_FOLDER = 'docs/technical_description/api';
const DOC_API_FILE = 'docs/technical_description/api.md';

let generalApiDocContent = '# API\n\n';

async function getPartialTemplates() {
  const folderPartialFullList = await fs.promises.readdir(PARTIAL_FOLDER);
  const partialList = folderPartialFullList
    .filter((partial) => partial.split('.')[1] === 'hbs')
    .map((partial) => path.join(PARTIAL_FOLDER, partial));

  if (folderPartialFullList.length !== partialList.length) {
    console.log('Warning: not all partial named properly or some of the files has wrong extention');
  }
  return partialList;
}

/**
 * @param {string} packageFolderName - Package's folder name
 * @returns {boolean}
 */
function checkCodeDirExist(packageFolderName) {
  const dirPath = path.join(PACKAGES_FOLDER, packageFolderName, PACKAGE_CODE_FOLDER);

  return fs.existsSync(dirPath);
}

/**
 * Gets the name of the package from it's package.json file
 * @param {string} packageFolderName - Package's folder name
 * @returns {string}
 */
function getPackageName(packageFolderName) {
  const packageFullPath = path.join(PACKAGES_FOLDER, packageFolderName);
  const packageJsonData = fs.readFileSync(path.join(packageFullPath, 'package.json'), 'utf8');
  const packageFullName = JSON.parse(packageJsonData).name;

  return packageFullName.split('/').pop();
}

/**
 * Generates API doc for a given package, adds header and removes unnecessary empty lines
 * @param {Object} params
 * @param {string} params.files - Filepaths of javascript source files
 * @param {Array} params.partial - Handlebars partial files
 * @param {string} params.template - The template the supplied documentation will be rendered into
 * @param {string} packageName - The name of the package
 * @returns {string}
 */
async function generatePackageApiDoc({ files, partial, template, packageName }) {
  const apiDocData = await jsdoc2md.render({
    files,
    partial,
    template,
  });
  const docHeader = `# API documentation for ${packageName} package\n\n`;
  const formatedDocBody = apiDocData
    .replace(/(\r\n|\r)/g, '\n') // replace all carriage returns
    .replace(/\n{3,}/g, '\n\n') // replace > 2 empty lines with a single one
    .replace(/\n\s*$(?!\n)/g, '\n'); // replace > 2 empty lines in the end of the file with a single one

  return docHeader + formatedDocBody;
}

/**
 * Adds link for the package's doc to the end of the general API doc content
 * @param {string} packageName - Package's name
 * @param {string} docFileName - The name of the generated package's doc
 */
function appendPackageLinkToApiDoc(packageName, docFileName) {
  // Link is relative to the api.md file
  const listRow = `- [${packageName}](api/${docFileName})\n`;
  generalApiDocContent += listRow;
}

(async () => {
  try {
    const packageFoldersList = await fs.promises.readdir(PACKAGES_FOLDER);

    const packageAPITemplate = fs.readFileSync(PACKAGE_API_TEMPLATE_NAME, 'utf8');
    const partialList = await getPartialTemplates();

    // eslint-disable-next-line no-restricted-syntax
    for (const packageFolderName of packageFoldersList) {
      if (checkCodeDirExist(packageFolderName)) {
        const packageName = getPackageName(packageFolderName);
        const packageCodeFiles = `${path.join(
          PACKAGES_FOLDER,
          packageFolderName,
          PACKAGE_CODE_FOLDER,
        )}/**/*.js`;

        /* eslint-disable-next-line no-await-in-loop */
        const packageApiDocData = await generatePackageApiDoc({
          files: packageCodeFiles,
          partial: partialList,
          template: packageAPITemplate,
          packageName,
        });
        const packageApiDocName = `${packageName.replace(/-/g, '_')}.md`;

        // Write package's API doc
        try {
          fs.writeFileSync(`${DOC_API_FOLDER}/${packageApiDocName}`, packageApiDocData);
          console.log(`SUCCESS: API doc was created for ${packageName} package!`);
        } catch (err) {
          console.error(`Error occurs while generating ${packageApiDocName} file:`, err);
        }

        appendPackageLinkToApiDoc(packageName, packageApiDocName);
      }
    }

    // Write general API doc
    try {
      fs.writeFileSync(DOC_API_FILE, generalApiDocContent);
      console.log(`SUCCESS: ${DOC_API_FILE} file was created!`);
    } catch (err) {
      console.error(`Error occurs while generating ${DOC_API_FILE} file:`, err);
    }

    await jsdoc2md.clear();
  } catch (err) {
    console.error('Error occurs while generating packages API docs', err);
  }
})();
