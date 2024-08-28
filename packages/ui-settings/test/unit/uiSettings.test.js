import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import UISettings from '../../src/utils/uiSettings.js';
import CONSTANTS from '../../src/config/constants.js';

const { STORAGE_MODE } = CONSTANTS;

describe('Unit test for UI Settings plugin', () => {
  const DEFAULT_NAMESPACE = 'gui-aggregator-service';
  const DEFAULT_USER = 'defaultUser';
  const testKey = 'testKey';
  const testValue = 'test value';
  const testNamespace = 'my-app';
  const expectedDefaultKey = `${DEFAULT_USER}/${DEFAULT_NAMESPACE}/${testKey}`;
  const CHANGE_EVENT = 'ui-settings-change';

  let uiSettings;

  it('will log error if storageMode param is invalid', () => {
    const consoleSpy = sinon.spy(console, 'error');
    uiSettings = new UISettings({
      username: DEFAULT_USER,
      broadcastChannel: new BroadcastChannel(CHANGE_EVENT),
      storageMode: 'uiSettings',
    });

    expect(
      consoleSpy.calledWith(
        `ERROR: Invalid storage mode: uiSettings! The storage mode can be '${STORAGE_MODE.UI_SETTINGS_SERVICE}' or '${STORAGE_MODE.LOCAL_STORAGE}'.`,
      ),
    ).to.be.true;
  });

  describe('Test localStorage mode', () => {
    before(async () => {
      uiSettings = new UISettings({
        username: DEFAULT_USER,
        broadcastChannel: new BroadcastChannel(CHANGE_EVENT),
        storageMode: STORAGE_MODE.LOCAL_STORAGE,
      });
      localStorage.clear();
    });

    after(() => {
      localStorage.clear();
    });

    it('get() should return the previously set item', async () => {
      await uiSettings.set({ namespace: DEFAULT_NAMESPACE, key: testKey, value: testValue });

      expect(localStorage.length).to.be.eq(1);
      expect(localStorage.getItem(expectedDefaultKey)).not.to.be.null;
      expect(await uiSettings.get({ namespace: DEFAULT_NAMESPACE, key: testKey })).to.be.eq(
        testValue,
      );
    });

    it('remove() should remove the previously set item if found', async () => {
      const expectedKey = `${DEFAULT_USER}/${testNamespace}/${testKey}`;
      await uiSettings.set({ namespace: testNamespace, key: testKey, value: testValue });
      const valueBeforeRemove = localStorage.getItem(expectedKey);
      await uiSettings.remove({ namespace: testNamespace, key: testKey });
      expect(valueBeforeRemove).not.to.be.null;
      expect(localStorage.getItem(expectedKey)).to.be.null;
    });

    it('set() should be able to persist array', async () => {
      const key = 'array';
      const expectedArrayKey = `${DEFAULT_USER}/${testNamespace}/${key}`;
      const testArray = ['value1', 'value2', 'value3'];
      await uiSettings.set({ namespace: testNamespace, key, value: testArray });

      expect(await uiSettings.get({ namespace: testNamespace, key })).to.deep.equal(testArray);
      expect(JSON.parse(localStorage.getItem(expectedArrayKey))).to.deep.equal(testArray);
    });
  });

  describe('Test uiSettingsService mode', () => {
    const FETCH_BASE_URL = 'https://ui-settings.com/ui-settings/v1/settings/user';
    const GET_OPTIONS = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    };
    const POST_OPTIONS = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const REMOVE_OPTIONS = {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    };

    const okResponse = (body) => {
      const mockResponse = new window.Response(JSON.stringify(body), {
        status: 200,
        ok: true,
        headers: {
          'Content-type': 'application/json',
        },
      });

      return Promise.resolve(mockResponse);
    };

    const notFoundResponse = (body) => {
      const mockResponse = new window.Response(JSON.stringify(body), {
        status: 404,
        ok: false,
        headers: {
          'Content-type': 'application/json',
        },
      });

      return Promise.resolve(mockResponse);
    };

    let fetchStub;

    before(() => {
      fetchStub = sinon.stub(window, 'fetch');

      uiSettings = new UISettings({
        username: DEFAULT_USER,
        broadcastChannel: new BroadcastChannel(CHANGE_EVENT),
        storageMode: STORAGE_MODE.UI_SETTINGS_SERVICE,
        baseUrl: 'https://ui-settings.com',
        logger: {},
      });
    });

    beforeEach(() => {
      fetchStub.resetHistory();
    });

    it('can get setting from database', async () => {
      fetchStub
        .withArgs(`${FETCH_BASE_URL}/${DEFAULT_NAMESPACE}/${testKey}`, GET_OPTIONS)
        .returns(okResponse({ name: testKey, value: testValue }));

      expect(await uiSettings.get({ namespace: DEFAULT_NAMESPACE, key: testKey })).to.be.eq(
        testValue,
      );
    });

    it('can handle missing setting', async () => {
      fetchStub.withArgs(`${FETCH_BASE_URL}/${DEFAULT_NAMESPACE}/notExisting`, GET_OPTIONS).returns(
        notFoundResponse({
          code: 'adp.error.namespace.notFound',
          message: 'Namespace does not exist.',
        }),
      );

      expect(await uiSettings.get({ namespace: DEFAULT_NAMESPACE, key: 'notExisting' })).to.be.null;
    });

    it('can remove setting from database', async () => {
      await uiSettings.remove({ namespace: DEFAULT_NAMESPACE, key: testKey });

      expect(
        fetchStub.calledOnceWith(
          `${FETCH_BASE_URL}/${DEFAULT_NAMESPACE}/${testKey}`,
          REMOVE_OPTIONS,
        ),
      ).to.be.true;
    });

    it('can save setting into database', async () => {
      await uiSettings.set({
        namespace: DEFAULT_NAMESPACE,
        key: testKey,
        value: testValue,
      });

      expect(fetchStub.calledTwice).to.be.true;
      expect(fetchStub.firstCall.args).to.deep.eq([
        `${FETCH_BASE_URL}/${DEFAULT_NAMESPACE}/${testKey}`,
        GET_OPTIONS,
      ]);
      expect(fetchStub.secondCall.args).to.deep.eq([
        `${FETCH_BASE_URL}/${DEFAULT_NAMESPACE}/${testKey}`,
        { body: JSON.stringify({ value: testValue }), ...POST_OPTIONS },
      ]);
    });
  });
});
