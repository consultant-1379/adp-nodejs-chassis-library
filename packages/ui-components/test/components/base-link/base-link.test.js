import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import BaseLink from '../../../src/components/base-link/base-link.js';
import isRendered from '../../test-utils/isRendered.js';

const renderBaseLink = async (linkContainerTemplate) => {
  const element = await fixture(linkContainerTemplate);
  await isRendered(element);
  return element;
};

const cssPath = {
  eBaseLink: 'e-base-link',
  link: 'a',
};

const TEST_TEXT = 'test link text';
const TEST_URL = 'test-link';
const TEST_URL_NEW_TAB = 'test-link-new-tab';

describe('BaseLink Component Tests', () => {
  let link;
  const DEFAULT_TEMPLATE = html`
    <e-base-link url=${TEST_URL}>
      <div slot="content">${TEST_TEXT}</div>
    </e-base-link-card>
  `;

  const DEFAULT_TEMPLATE_WITH_NEW_TAB = html`
    <e-base-link url=${TEST_URL_NEW_TAB} new-tab=true>
      <div slot="content">${TEST_TEXT}</div>
    </e-base-link-card>
  `;

  describe('Basic component setup', () => {
    before(async () => {
      BaseLink.register();
      link = await renderBaseLink(DEFAULT_TEMPLATE);
    });

    it('should create a new <e-base-link>', async () => {
      expect(link).to.be.not.null;
    });

    it('Link href matches url', () => {
      const { href } = link.shadowRoot.querySelector(cssPath.link);
      expect(href.endsWith(TEST_URL)).to.be.true;
    });

    it('Link content contains test text', () => {
      const nativeLink = link.shadowRoot.querySelector(cssPath.link);
      const assignedText = nativeLink
        .getElementsByTagName('slot')[0]
        .assignedElements()[0].innerText;
      expect(assignedText).to.be.equal(TEST_TEXT);
    });

    it('Link target shall be "_self", if new-tab is not set', () => {
      const { target } = link.shadowRoot.querySelector(cssPath.link);
      expect(target).to.be.equal('_self');
    });
  });

  describe('New tab is set', () => {
    before(async () => {
      link = await renderBaseLink(DEFAULT_TEMPLATE_WITH_NEW_TAB);
    });

    it('should create a new <e-base-link>', async () => {
      expect(link).to.be.not.null;
    });

    it('Link href matches url', () => {
      const { href } = link.shadowRoot.querySelector(cssPath.link);
      expect(href.endsWith(TEST_URL_NEW_TAB)).to.be.true;
    });

    it('Link target shall be "_blank", if new-tab is set', () => {
      const { target } = link.shadowRoot.querySelector(cssPath.link);
      expect(target).to.be.equal('_blank');
    });
  });

  describe('Base Link API', () => {
    let stub;

    before(async () => {
      link = await renderBaseLink(DEFAULT_TEMPLATE_WITH_NEW_TAB);
      const nativeLink = link.shadowRoot.querySelector(cssPath.link);
      stub = sinon.stub(nativeLink, 'click');
    });

    it('has a "triggerLink" method', () => {
      expect(link.triggerLink).to.be.not.null;
    });

    it('the "triggerLink" activates the link', () => {
      link.triggerLink();
      expect(stub.called).to.be.true;
    });

    after(() => {
      stub.restore();
    });
  });
});
