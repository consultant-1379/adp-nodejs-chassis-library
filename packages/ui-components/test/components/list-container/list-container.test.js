import { expect, fixture, html } from '@open-wc/testing';
import ListContainer from '../../../src/components/list-container/list-container.js';
import testAppConfig from '../../test-utils/mockdata/test-app.config.json';
import isRendered from '../../test-utils/isRendered.js';

const { apps } = testAppConfig;

const GROUP_NAME = 'App group';
const PRODUCT_NAME = 'eea';

const renderContainer = async ({ groupName, items, productName }) => {
  const listContainerTemplate = html`
    <e-list-container
      group-name="${groupName}"
      .items="${items}"
      product-name=${productName}
    ></e-list-container>
  `;
  const element = await fixture(listContainerTemplate);
  await isRendered(element);
  return element;
};

describe('ListContainer Component Tests', () => {
  let container;

  before(() => {
    ListContainer.register();
  });

  it('should create a new <e-list-container>', async () => {
    container = await renderContainer({
      groupName: GROUP_NAME,
      items: apps,
      productName: PRODUCT_NAME,
    });

    const { shadowRoot } = container;

    expect(shadowRoot, 'Shadow root does not exist').to.exist;
    expect(container).to.not.null;
  });

  it('has the correct group title', () => {
    const groupName = container.shadowRoot.querySelector('.group-name');

    expect(groupName.textContent).to.be.eq(GROUP_NAME);
  });

  it('has the right number of list items', () => {
    const listContainer = container.shadowRoot.querySelector('.list-container');
    const listItems = listContainer.querySelectorAll('e-list-item');
    const expectedProductNumber = apps.length;

    expect(listItems).to.have.lengthOf(expectedProductNumber);
  });

  it('set list items with proper attributes', () => {
    const listContainer = container.shadowRoot.querySelector('.list-container');
    const listItems = Array.from(listContainer.querySelectorAll('e-list-item'));

    listItems.forEach((listItem, index) => {
      const app = apps[index];
      expect(listItem.getAttribute('product-name')).to.be.eq(PRODUCT_NAME);
      expect(listItem.getAttribute('app-name')).to.be.eq(app.name);
      expect(listItem.getAttribute('display-name')).to.be.eq(app.displayName);
      expect(listItem.getAttribute('description-long')).to.be.eq(app.descriptionLong || '');
      expect(listItem.getAttribute('description-short')).to.be.eq(app.descriptionShort || '');
      expect(listItem.getAttribute('route')).to.be.eq(app.route);
    });
  });
});
