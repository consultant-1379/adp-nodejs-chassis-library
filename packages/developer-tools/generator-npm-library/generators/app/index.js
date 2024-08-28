const path = require('path');
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('appname', { type: String, required: false });
    this.env.options.nodePackageManager = 'npm';
  }

  _formatName(str) {
    const tmp = str.split('-');
    const upperCase = [];
    tmp.forEach((e) => upperCase.push(e.charAt(0).toUpperCase() + e.slice(1)));
    return upperCase.join('_');
  }

  _getScriptsPath() {
    return path.join(__dirname, '../../../../../', 'scripts');
  }

  async prompting() {
    this.answer = await this.prompt([
      {
        type: 'input',
        name: 'packageName',
        message: 'Your package name',
        default: this.appname,
      },
      {
        type: 'input',
        name: 'description',
        message: 'Your package description',
        default: 'An Awesome Package!',
      },
      {
        type: 'input',
        name: 'packageVersion',
        message: 'Initial package version',
        default: '0.1.0',
      },
      {
        type: 'input',
        name: 'moduleName',
        message: 'Main module name',
        default: 'mainModule',
      },
    ]);
  }

  writing() {
    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), {
      mainFolder: this.appname,
      name: this.answer.packageName,
      version: this.answer.packageVersion,
      description: this.answer.description,
      scriptPath: this._getScriptsPath(),
    });
    this.fs.copyTpl(
      this.templatePath('sonar-project.properties'),
      this.destinationPath('sonar-project.properties'),
      {
        lowerCase: this.answer.packageName.split('-').join('_'),
        upperCase: this._formatName(this.answer.packageName),
      },
    );
    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), {
      name: this.answer.packageName,
      description: this.answer.description,
      module: this.answer.moduleName,
    });
    this.fs.copyTpl(this.templatePath('src/index.js'), this.destinationPath('src/index.js'), {
      mainModule: this.answer.moduleName,
    });
    this.fs.copyTpl(
      this.templatePath('src/mainModule.js'),
      this.destinationPath(`src/${this.answer.moduleName}.js`),
      {
        mainModule: this.answer.moduleName,
      },
    );

    this.fs.copyTpl(
      this.templatePath('test/unit/mainModule.test.js'),
      this.destinationPath(`test/unit/${this.answer.moduleName}.test.js`),
      {
        mainModule: this.answer.moduleName,
      },
    );
    this.fs.copy(this.templatePath('test/.eslintrc.js'), this.destinationPath('test/.eslintrc.js'));
    this.fs.copy(
      this.templatePath('test/rewiremock.js'),
      this.destinationPath('test/rewiremock.js'),
    );
    this.fs.copy(this.templatePath('.npmrc'), this.destinationPath('.npmrc'));
    this.fs.copy(
      this.templatePath('test/reports/_gitignore'),
      this.destinationPath('test/reports/.gitignore'),
    );
  }
};
