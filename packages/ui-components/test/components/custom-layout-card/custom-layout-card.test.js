import { expect, fixture, html } from '@open-wc/testing';
import CustomLayoutCard from '../../../src/components/custom-layout-card/custom-layout-card.js';
import isRendered from '../../test-utils/isRendered.js';

const getCardData = () => ({
  displayName: 'Test Card',
  descriptionShort: 'Secondary Info',
  descriptionLong: 'Test card test description part',
});

const renderCustomLayoutCard = async (data) => {
  const cardContainerTemplate = html`
    <e-custom-layout-card card-title=${data.displayName} subtitle=${data.descriptionShort}>
      <div class="content">${data.descriptionLong}</div>
    </e-custom-layout-card>
  `;
  const element = await fixture(cardContainerTemplate);
  await isRendered(element);
  return element;
};

describe('CustomLayoutCard Component Tests', () => {
  let card;
  let cardContent;
  const DEFAULT_CARD_DATA = getCardData();

  before(async () => {
    CustomLayoutCard.register();
    card = await renderCustomLayoutCard(DEFAULT_CARD_DATA);
    cardContent = card.shadowRoot.querySelector('.eui__card');
  });

  it('should create a new <e-custom-layout-card>', async () => {
    expect(card).to.be.not.null;
    expect(cardContent).to.be.not.null;
  });

  it('Card title matches card title', () => {
    const title = cardContent.querySelector('.title-message').innerText;
    expect(title).to.be.equal(DEFAULT_CARD_DATA.displayName);
  });

  it('Secondary Info should match card secondary info', () => {
    const descriptionShort = cardContent.querySelector('.eui__card__subtitle').innerText;
    expect(descriptionShort).to.be.equal(DEFAULT_CARD_DATA.descriptionShort);
  });

  it('Description should match card description', () => {
    const descriptionLong = card.querySelector('.content').innerText.trim();
    expect(descriptionLong).to.be.equal(DEFAULT_CARD_DATA.descriptionLong);
  });
});
