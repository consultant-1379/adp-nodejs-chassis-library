import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const validAppConfig1 = require('./configs/domain-app1.config.json');
const validAppConfig2 = require('./configs/domain-app2.config.json');
const validAppConfig3 = require('./configs/domain-app3.config.json');
const invalidAppConfig = require('./configs/invalid-app.config.json');
const packageConfig1 = require('./configs/domain-app1.config.package.json');
const packageConfig2 = require('./configs/domain-app2.config.package.json');
const packageConfig3 = require('./configs/domain-app3.config.package.json');

export class HeadersMock {}

export class RequestMock {
  constructor(input, options) {
    if (typeof input === 'object') {
      this.url = input.url;
    } else {
      this.url = input;
    }
    this.headers = options?.headers;
    this.agent = options?.agent;
  }
}

export default ({ url }) =>
  new Promise((resolve, reject) => {
    let error;
    switch (true) {
      case /.*domain1.*configContext.*config\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(validAppConfig3),
        });
        break;
      case /.*domain1.*invalidConfigContext.*config\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(invalidAppConfig),
        });
        break;
      case /.*domain1.*\/ui\/.*config\.json$/.test(url):
        resolve({
          ok: false,
          json: () => Promise.resolve({}),
        });
        break;
      case /.*domain1.*config\.json$/.test(url):
      case /https:.*domain3.*config\.json$/.test(url):
      case /.*domain4.*config\.json$/.test(url):
      case /.*domain1.*otherContext.*config\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(validAppConfig1),
        });
        break;
      case /.*domain1.*configContext.*config\.package\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(packageConfig3),
        });
        break;
      case /https:.*domain3.*config\.package\.json$/.test(url):
      case /.*domain1.*config\.package\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(packageConfig1),
        });
        break;
      case /.*domain2.*config\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(validAppConfig2),
        });
        break;
      case /.*domain2.*config\.package\.json$/.test(url):
        resolve({
          ok: true,
          json: () => Promise.resolve(packageConfig2),
        });
        break;
      case /.*invalid.*/.test(url):
      case /.*domain4.*config\.package\.json$/.test(url):
        resolve({
          json: () => Promise.resolve([]),
        });
        break;
      // HTTPS only service
      case /http:.*domain3.*/.test(url):
        error = new Error('No such app.');
        error.code = 'ECONNRESET';
        reject(error);
        break;
      case /.*failingurl-fulfilled.com\/.*$/.test(url):
        resolve({
          ok: false,
        });
        break;
      default:
        reject(new Error('No such app.'));
        break;
    }
  });
