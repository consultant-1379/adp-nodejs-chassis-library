import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import CardContainer from '../../../src/components/card-container/card-container.js';
import CONSTANTS from '../../../src/constants.js';
import testAppConfig from '../../test-utils/mockdata/test-app.config.json';

import isRendered from '../../test-utils/isRendered.js';

const { PRODUCT_TYPE, LANDING_CARD_COUNT } = CONSTANTS;

const PRODUCTS = 'Products';
const CARD_CONTAINER_CLASSNAME = '.cardContainer';

const collectProductItems = () => {
  const { groups } = testAppConfig;
  return groups.filter((element) => element.type === PRODUCT_TYPE);
};

function getProductUrl(productName) {
  return `#launcher?productName=${productName}`;
}

function getActualRoute(item) {
  const route = item.url || item.route;
  return `#${route}`;
}

const renderContainer = async ({
  groupName,
  items,
  isProducts,
  limitNumberOfCards,
  isRecentSection,
  showFavorite,
}) => {
  items.forEach((item) => {
    item.route = isProducts ? getProductUrl(item.name) : getActualRoute(item);
  });

  const cardContainerTemplate =
    showFavorite === false // direct type check to test default parameter
      ? html`
          <e-card-container
            .groupName="${groupName}"
            .items="${items}"
            .isProducts="${isProducts}"
            .limitNumberOfCards=${limitNumberOfCards}
            .isRecentSection=${isRecentSection}
            .showFavorite=${showFavorite}
          ></e-card-container>
        `
      : html`
          <e-card-container
            .groupName="${groupName}"
            .items="${items}"
            .isProducts="${isProducts}"
            .limitNumberOfCards=${limitNumberOfCards}
            .isRecentSection=${isRecentSection}
          ></e-card-container>
        `;
  const element = await fixture(cardContainerTemplate);
  await isRendered(element);
  return element;
};

describe('CardContainer Component Tests', () => {
  let container;
  let groupContainers;
  let items;

  before(() => {
    items = collectProductItems();
    CardContainer.register();
  });

  describe('Create card-container with product items', () => {
    before(async () => {
      const cardContainer = await renderContainer({
        groupName: PRODUCTS,
        items,
        isProducts: true,
      });
      groupContainers = cardContainer.shadowRoot.querySelectorAll('.groupContainer');
      container = cardContainer.shadowRoot.querySelectorAll(CARD_CONTAINER_CLASSNAME);
    });

    it('creates container for group items', async () => {
      expect(groupContainers[0].children[0].textContent).to.be.eq(PRODUCTS);
    });

    it('has the right number of cards in "Products" section', () => {
      const expectedProductNumber = items.length;
      const cards = container[0].getElementsByTagName('e-product-card');
      expect(cards.length).to.be.eq(expectedProductNumber);
    });

    it('generates proper routes for products', () => {
      const cards = container[0].getElementsByTagName('e-product-card');
      Array.from(cards).forEach((productCard) => {
        expect(productCard.route).to.be.eq(getProductUrl(productCard.productName));
      });
    });
  });

  describe('Card container with app items', () => {
    it('shows favorite icon on the app cards by default', async () => {
      const cardContainer = await renderContainer({
        groupName: PRODUCTS,
        items,
        isProducts: false,
      });
      container = cardContainer.shadowRoot.querySelectorAll(CARD_CONTAINER_CLASSNAME);
      const cards = container[0].getElementsByTagName('e-app-card');
      const links = cards[0].shadowRoot.querySelectorAll('.favorite-icon');
      expect(links.length).to.be.eq(cards.length);
    });

    it('shows favorite icon on the app cards when showFavorite is false', async () => {
      const cardContainer = await renderContainer({
        groupName: PRODUCTS,
        items,
        isProducts: false,
        showFavorite: false,
      });
      container = cardContainer.shadowRoot.querySelectorAll(CARD_CONTAINER_CLASSNAME);
      const cards = container[0].getElementsByTagName('e-app-card');
      const links = cards[0].shadowRoot.querySelectorAll('.favorite-icon');
      expect(links.length).to.be.eq(0);
    });
  });

  describe('"View All" link tests', () => {
    let stub;
    let cardContainer;

    beforeEach(async () => {
      cardContainer = await renderContainer({
        groupName: PRODUCTS,
        items: testAppConfig.apps,
        isProducts: false,
        limitNumberOfCards: true,
        isRecentSection: true,
      });
      stub = sinon.stub(cardContainer, 'bubble');
    });

    it(`displays "View All" link when number of cards is higher than ${LANDING_CARD_COUNT}`, async () => {
      const viewAllLink = cardContainer.shadowRoot.querySelector('.viewAllLink');
      expect(viewAllLink).not.to.be.null;
    });

    it('"handle-view-all-cards" event should be bubbled when menu item is clicked', () => {
      const viewAllLink = cardContainer.shadowRoot.querySelector('.viewAllLink');
      viewAllLink.click();
      expect(stub.calledOnce).to.be.true;
      expect(stub.calledWith('handle-view-all-cards')).to.be.true;
    });
  });
});
