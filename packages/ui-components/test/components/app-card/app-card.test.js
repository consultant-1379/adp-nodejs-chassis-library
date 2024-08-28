import { expect, fixture, html } from '@open-wc/testing';
import { ifDefined } from '@eui/lit-component';
import AppCard from '../../../src/components/app-card/app-card.js';
import CONSTANTS from '../../../src/constants.js';
import isRendered from '../../test-utils/isRendered.js';

const { FAVORITE_STATE } = CONSTANTS;

const NO_DETAILS = 'No more details';

const getCardData = ({ isExternal, favoriteState, showFavorite, isDescription = true }) => ({
  displayName: 'Test Card',
  descriptionLong: isDescription
    ? 'Test description for card, which is longer than available place on card'
    : '',
  isExternal,
  favoriteState,
  route: '/test-app/#test-app',
  showFavorite,
});

const getCardDataWithSecondaryInfo = ({ isExternal }) => {
  const card = getCardData({ isExternal });
  card.descriptionShort = 'Secondary Info';
  return card;
};

const getCardDataWithChild = () => {
  const card = getCardData({ isExternal: false });
  card.children = [card];
  return card;
};

const renderAppCard = async (data) => {
  const {
    displayName,
    descriptionShort,
    descriptionLong,
    favoriteState,
    isExternal,
    route,
    showFavorite,
  } = data;
  const cardContainerTemplate = html`
    <div style="width: 280px; height: 90px">
      <e-app-card
        .displayName=${displayName}
        .descriptionShort=${descriptionShort}
        .descriptionLong=${descriptionLong}
        .isExternal=${isExternal}
        .favoriteState=${favoriteState}
        .route=${route}
        .children=${data.children}
        .showFavorite=${ifDefined(showFavorite)}
      ></e-app-card>
    </div>
  `;
  const element = await fixture(cardContainerTemplate);
  await isRendered(element);
  return element;
};

const cssPath = {
  card: '.card',
  cardTitle: '.eui__card__title',
  cardSubTitle: '.eui__card__subtitle',
  accordion: '.accordion',
  icon: '.icon',
  infoIcon: '.icons [name="info"]',
  eAppCard: 'e-app-card',
  externalIcon: '.titleWithIcon .titleIcon',
  favoriteIcon: '[name="favorite"]',
  favoriteIconSolid: '[name="favorite-solid"]',
  icons: '.icons',
  tooltip: '.tooltip',
  subtitle: '.subtitle',
  description: '.description',
  expandContainer: '.expandContainer',
  eListItem: 'e-list-item',
  eBaseLink: 'e-base-link',
};

describe('AppCard Component Tests', () => {
  let cardContainer;
  let card;
  let cardContent;
  let cardData;
  const DEFAULT_CARD_DATA = getCardData({ isExternal: false });
  const DEFAULT_CARD_DATA_WITH_SECONDARY_INFO = getCardDataWithSecondaryInfo({
    isExternal: false,
  });
  const CARD_DATA_WITH_CHILD = getCardDataWithChild();

  async function basicTest() {
    card = cardContainer.querySelector(cssPath.eAppCard);
    cardContent = card.shadowRoot.querySelector(cssPath.card);

    expect(card).to.not.null;
    expect(cardContent).to.not.null;
  }

  before(() => {
    AppCard.register();
  });

  describe('Basic component setup without Secondary Info', () => {
    before(async () => {
      cardData = getCardData({
        favoriteState: FAVORITE_STATE.NOT_FAVORITE,
        isExternal: true,
      });
      cardContainer = await renderAppCard(cardData);
    });

    it('should create a new <e-app-card>', basicTest);

    it('Card title matches title', () => {
      const title = cardContent.shadowRoot.querySelector(cssPath.cardTitle).innerText.trim();
      expect(title).to.be.equal(DEFAULT_CARD_DATA.displayName);
    });

    it('Secondary Info should be empty (in case of not added)', () => {
      const descriptionShort = cardContent.shadowRoot
        .querySelector(cssPath.cardSubTitle)
        .innerText.trim();
      expect(descriptionShort).to.be.equal('');
    });
  });

  describe('Render card with secondary info', () => {
    before(async () => {
      cardContainer = await renderAppCard(DEFAULT_CARD_DATA_WITH_SECONDARY_INFO);

      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('Subtitle should match card short description', () => {
      const subtitle = cardContent.shadowRoot.querySelector(cssPath.cardSubTitle).innerText.trim();
      expect(subtitle).to.be.equal(DEFAULT_CARD_DATA_WITH_SECONDARY_INFO.descriptionShort);
    });
  });

  describe('Render card with external icon', () => {
    before(async () => {
      cardContainer = await renderAppCard(getCardData({ isExternal: true }));

      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('Card has external icon', () => {
      const externalIcon = cardContent.shadowRoot.querySelector(cssPath.externalIcon);
      expect(externalIcon).not.to.be.null;
    });
  });

  describe('Accordion click event tests', () => {
    before(async () => {
      cardContainer = await renderAppCard(CARD_DATA_WITH_CHILD);
      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('isExpanded prop is toggled when accordion is clicked', () => {
      const accordion = cardContent.querySelector(cssPath.accordion).querySelector(cssPath.icon);
      const defaultExpandedState = card.isExpanded;

      accordion.click();
      const expandedStateAfterFirstClick = card.isExpanded;
      accordion.click();
      const expandedStateAfterSecondClick = card.isExpanded;

      expect(defaultExpandedState).to.be.false;
      expect(expandedStateAfterFirstClick).to.be.true;
      expect(expandedStateAfterSecondClick).to.be.false;
    });

    it('Child elements are displayed', () => {
      const childElements = cardContent
        .querySelector(cssPath.expandContainer)
        .querySelectorAll(cssPath.eListItem);
      expect(childElements).to.have.lengthOf(1);
    });
  });

  describe('Basic component setup with Secondary Info', () => {
    before(async () => {
      cardData = getCardDataWithSecondaryInfo({
        favoriteState: FAVORITE_STATE.NOT_FAVORITE,
        isExternal: true,
      });
      cardContainer = await renderAppCard(cardData);
      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('should create a new <e-app-card>', basicTest);

    it('Card has not-favorite icon visible and has external icon visible', () => {
      const externalIcon = cardContent.shadowRoot.querySelector(cssPath.externalIcon);
      const favoriteIcon = cardContent.querySelector(cssPath.favoriteIcon);
      expect(externalIcon).not.to.be.null;
      expect(favoriteIcon).not.to.be.null;
    });

    it('Card has info icon and it is visible', () => {
      const infoIcon = cardContent.querySelector(cssPath.infoIcon);
      expect(infoIcon).not.to.be.null;
    });

    it('Info icon click displays tooltip', async () => {
      const infoIcon = cardContent.querySelector(cssPath.infoIcon);
      infoIcon.click();

      card.executeRender();

      const tooltip = cardContent.querySelector(cssPath.icons).querySelector(cssPath.tooltip);
      expect(tooltip.getAttribute('visible')).to.be.eq('always');
    });

    it('Info icon tooltip header should match card short description', () => {
      const descriptionShort = cardContent
        .querySelector(cssPath.icons)
        .querySelector(cssPath.tooltip)
        .querySelector(cssPath.subtitle).textContent;
      expect(descriptionShort).to.be.equal(DEFAULT_CARD_DATA_WITH_SECONDARY_INFO.descriptionShort);
    });

    it('Info icon tooltip description should match card long description', () => {
      const descriptionLong = cardContent
        .querySelector(cssPath.icons)
        .querySelector(cssPath.tooltip)
        .querySelector(cssPath.description).textContent;
      expect(descriptionLong).to.be.equal(DEFAULT_CARD_DATA_WITH_SECONDARY_INFO.descriptionLong);
    });

    it('Info icon tooltip description should match card no details description', async () => {
      const customCardData = getCardData({
        favoriteState: FAVORITE_STATE.NOT_FAVORITE,
        isExternal: true,
        isDescription: false,
      });
      const noDetailsCardContainer = await renderAppCard(customCardData);
      const noDetailsCard = noDetailsCardContainer.querySelector(cssPath.eAppCard);
      const noDetailsCardContent = noDetailsCard.shadowRoot.querySelector(cssPath.card);
      const descriptionShort = noDetailsCardContent
        .querySelector(cssPath.icons)
        .querySelector(cssPath.tooltip)
        .querySelector(cssPath.subtitle).textContent;
      expect(descriptionShort).to.be.equal(NO_DETAILS);
    });

    it('Info icon second click hides tooltip', async () => {
      const infoIcon = cardContent.querySelector(cssPath.infoIcon);
      infoIcon.click();

      card.executeRender();

      const tooltip = cardContent.querySelector(cssPath.icons).querySelector(cssPath.tooltip);
      expect(tooltip.getAttribute('visible')).to.be.eq('never');
    });
  });

  describe('Card with favorite set and external-app unset props', () => {
    before(async () => {
      cardData = getCardData({
        favoriteState: FAVORITE_STATE.FAVORITE,
        isExternal: false,
      });
      cardContainer = await renderAppCard(cardData);

      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('Card shows favorite icon but not external icon', () => {
      const externalIcon = cardContent.shadowRoot.querySelector(cssPath.externalIcon);
      const favoriteIcon = cardContent.querySelector(cssPath.favoriteIconSolid);
      expect(externalIcon).to.be.null;
      expect(favoriteIcon).not.to.be.null;
    });
  });

  describe('Card without favorite icon', () => {
    before(async () => {
      cardData = getCardData({
        isExternal: false,
        showFavorite: false,
      });
      cardContainer = await renderAppCard(cardData);

      card = cardContainer.querySelector(cssPath.eAppCard);
      cardContent = card.shadowRoot.querySelector(cssPath.card);
    });

    it('Card shows no favorite icon', () => {
      const favoriteIcon = cardContent.querySelector(cssPath.favoriteIconSolid);
      expect(favoriteIcon).to.be.null;
    });

    it('Card still shows info icon', () => {
      const infoIcon = cardContent.querySelector(cssPath.infoIcon);
      expect(infoIcon).not.to.be.null;
    });
  });

  describe('Card title click event tests', () => {
    let link;

    before(async () => {
      cardData = getCardData({
        favoriteState: FAVORITE_STATE.FAVORITE,
        isExternal: false,
      });
      cardContainer = await renderAppCard(cardData);

      card = cardContainer.querySelector(cssPath.eAppCard);
    });

    it('e-base-link has proper url', () => {
      link = card.shadowRoot.querySelector(cssPath.eBaseLink);

      expect(link.url).to.be.equal(cardData.route);
    });

    it.skip('e-base-link.click() is called when AppCard title is clicked', async () => {
      let clicked = false;
      link.addEventListener('click', (event) => {
        // needed to prevent link to navigate browser from the test page
        event.preventDefault();
        event.stopPropagation();
        clicked = true;
        return false;
      });
      const cardTitle = cardContent.shadowRoot.querySelector(cssPath.cardTitle);
      cardTitle.click();
      expect(clicked).to.be.true;
    });
  });
});
