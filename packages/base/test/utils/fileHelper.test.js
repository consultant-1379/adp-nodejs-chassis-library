import { expect } from 'chai';
import { dirname, resolve as pathResolve } from 'path';
import { fileURLToPath } from 'url';
import mockFs from 'mock-fs';
import { watchFile, stopFileWatch } from '../../src/utils/fileHelper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Unit tests for fileHelper.js', () => {
  let chokidarObj;
  before(() => {
    mockFs({
      'testFile.txt': 'test12',
    });
    chokidarObj = watchFile(pathResolve(__dirname));
  });
  it('registers files for watch', () => {
    expect(chokidarObj._watched.size).to.be.greaterThan(0);
  });
  it('has no watched object after stopped', () => {
    stopFileWatch(chokidarObj);
    expect(chokidarObj._watched.size).to.be.eq(0);
  });
  after(() => {
    mockFs.restore();
  });
});
