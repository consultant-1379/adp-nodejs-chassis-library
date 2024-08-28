import { expect, fixture, html } from '@open-wc/testing';
import ProductCard from '../../../src/components/product-card/product-card.js';
import isRendered from '../../test-utils/isRendered.js';

const getCardData = ({ isExternal }) => ({
  displayName: 'Test Card',
  descriptionLong: 'Test description for card, which is longer than available place on card',
  isExternal,
  name: 'test',
  route: '#product-card-page=TEST CARD',
});

const PRODUCT_SELECTED_EVENT = 'product-selected';

const renderProductCard = async (data) => {
  const { displayName, route, descriptionLong, isExternal, name } = data;
  const cardContainerTemplate = html`
    <div style="width: 280px; height: 90px">
      <e-product-card
        .productName=${name}
        .displayName=${displayName}
        .route=${route}
        .descriptionLong=${descriptionLong}
        .isExternal=${isExternal}
      ></e-product-card>
    </div>
  `;
  const element = await fixture(cardContainerTemplate);
  await isRendered(element);
  return element;
};

const cssPath = {
  eBaseLink: 'e-base-link',
  eProductCard: 'e-product-card',
  card: '.card',
  cardTitle: '.eui__card__title',
  customCard: 'e-custom-layout-card',
};

describe('ProductCard Component Tests', () => {
  let containerElement;
  let card;
  let cardContent;
  let cardData;

  describe('Basic component setup', () => {
    before(async () => {
      ProductCard.register();
      cardData = getCardData({ isExternal: true });
      containerElement = await renderProductCard(cardData);
    });

    it('should create a new <e-product-card>', () => {
      card = containerElement.querySelector(cssPath.eProductCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
      expect(card).to.not.null;
      expect(cardContent).to.not.null;
    });
  });

  describe('Card title click event tests', () => {
    let link;

    before(async () => {
      cardData = getCardData({ isExternal: true });
      containerElement = await renderProductCard(cardData);

      card = containerElement.querySelector(cssPath.eProductCard);
      link = card.shadowRoot.querySelector(cssPath.eBaseLink);
    });

    it('e-base-link has proper url', () => {
      expect(link.url).to.be.equal(cardData.route);
    });

    it(`should trigger a ${PRODUCT_SELECTED_EVENT} event if ProductCard is clicked`, async () => {
      const event = await new Promise((resolve) => {
        card.addEventListener(PRODUCT_SELECTED_EVENT, (e) => resolve(e));
        const customCard = card.shadowRoot.querySelector(cssPath.customCard);
        customCard.click();
      });
      expect(event.type).to.be.eq(PRODUCT_SELECTED_EVENT);
      expect(event.detail).to.be.eq(cardData.name);
    });
  });
});
