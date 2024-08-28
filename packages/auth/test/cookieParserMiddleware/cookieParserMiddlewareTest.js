import { expect } from 'chai';
import sinon from 'sinon';
import { getCookieParserMiddleware } from '../../src/index.js';

describe('Unit tests for cookieParserMiddleware.js', () => {
  let middleware;
  beforeEach(() => {
    middleware = getCookieParserMiddleware();
  });

  after(() => {
    sinon.restore();
  });

  it('middleware should be a function', () => {
    expect(typeof middleware).to.eq('function');
  });

  it('should accept three arguments', () => {
    expect(middleware.length).to.eq(3);
  });

  it('should call next() at least once', () => {
    const spy = sinon.spy();
    middleware({ headers: { cookie: {} } }, {}, spy);
    expect(spy.calledOnce).to.be.true;
  });
});
