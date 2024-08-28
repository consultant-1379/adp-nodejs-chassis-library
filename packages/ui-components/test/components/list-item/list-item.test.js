import { expect, fixture, html } from '@open-wc/testing';
import { ifDefined } from '@eui/lit-component';
import sinon from 'sinon';
import ListItem from '../../../src/components/list-item/list-item.js';
import testAppConfig from '../../test-utils/mockdata/test-app.config.json';
import CONSTANTS from '../../../src/constants.js';
import isRendered from '../../test-utils/isRendered.js';

const { FAVORITE_STATE, EXTERNAL_TYPE } = CONSTANTS;

const PRODUCT_NAME = 'eea';
const FAVORITE_ICON_SELECTOR = '[name="favorite"]';
const INFO_ICON_SELECTOR = '[name="info"]';
const NO_DETAILS = 'No more details';

const { apps } = testAppConfig;
const app = apps[0];
const externalChild = apps[1];

const getTooltipTextContent = (listItem, { containerClass, attributeClass }) =>
  listItem.shadowRoot
    .querySelector(`.${containerClass}`)
    .querySelector('.tooltip')
    .querySelector(`.${attributeClass}`).textContent;

const getAppDataWithChild = () => {
  const appWithChild = { ...app };
  appWithChild.children = [appWithChild];
  return appWithChild;
};

const renderItem = async (item, noDetails = false) => {
  const listContainerTemplate = html`
    <e-list-item
      product-name=${PRODUCT_NAME}
      app-name=${item.name}
      display-name=${item.displayName}
      description-long="${!noDetails ? item.descriptionLong : ''}"
      description-short=${!noDetails ? item.descriptionShort : ''}
      route=${item.route}
      .favoriteState=${item.favoriteState}
      .children=${item.children}
      .showFavorite=${ifDefined(item.showFavorite)}
    ></e-list-item>
  `;
  const element = await fixture(listContainerTemplate);
  await isRendered(element);
  return element;
};

const renderChildItem = async (item, noDetails = false) => {
  const isExternal = item.type === EXTERNAL_TYPE;
  const listContainerTemplate = html`
    <e-list-item
      product-name=${PRODUCT_NAME}
      app-name=${item.name}
      display-name=${item.displayName}
      description-long="${!noDetails ? item.descriptionLong : ''}"
      description-short=${!noDetails ? item.descriptionShort : ''}
      route=${item.route}
      is-child="true"
      is-external=${isExternal}
      .favoriteState=${item.favoriteState}
      .children=${item.children}
      .showFavorite=${ifDefined(item.showFavorite)}
    ></e-list-item>
  `;
  const element = await fixture(listContainerTemplate);
  await isRendered(element);
  return element;
};

const renderExternalItem = async (item, noDetails = false) => {
  const listContainerTemplate = html`
    <e-list-item
      product-name=${PRODUCT_NAME}
      app-name=${item.name}
      display-name=${item.displayName}
      description-long="${!noDetails ? item.descriptionLong : ''}"
      description-short=${!noDetails ? item.descriptionShort : ''}
      route=${item.route}
      is-external="true"
      .favoriteState=${item.favoriteState}
      .children=${item.children}
      .showFavorite=${ifDefined(item.showFavorite)}
    ></e-list-item>
  `;
  const element = await fixture(listContainerTemplate);
  await isRendered(element);
  return element;
};

const cssPath = {
  eBaseLink: 'e-base-link',
};

describe('ListItem Component Tests', () => {
  let listItem;

  before(() => {
    ListItem.register();
  });

  describe('basic component tests', () => {
    it('should create a new <e-list-item>', async () => {
      listItem = await renderItem(app);
      const { shadowRoot } = listItem;
      expect(shadowRoot, 'Shadow root does not exist').to.exist;
      expect(listItem).to.not.null;
    });

    it('should have the correct title', () => {
      const title = listItem.shadowRoot.querySelector('.title').textContent.trim();
      expect(title).to.be.equal(app.displayName);
    });

    it('short description should be visible', () => {
      const descriptionShort = listItem.shadowRoot.querySelector('.subtitle').textContent.trim();
      expect(descriptionShort).to.be.equal(app.descriptionShort);
    });

    it('subtitle should match app short description', () => {
      const descriptionShort = getTooltipTextContent(listItem, {
        containerClass: 'icons',
        attributeClass: 'subtitle',
      });
      expect(descriptionShort).to.be.equal(app.descriptionShort);
    });

    it('description should match app no details description', async () => {
      const noDetailsListItem = await renderItem(app, true);
      const descriptionShort = getTooltipTextContent(noDetailsListItem, {
        containerClass: 'icons',
        attributeClass: 'subtitle',
      });
      expect(descriptionShort).to.be.equal(NO_DETAILS);
    });

    it('should have an info and favorite icon which are visible', () => {
      const infoIcon = listItem.shadowRoot.querySelector(INFO_ICON_SELECTOR);
      const favIcon = listItem.shadowRoot.querySelector(FAVORITE_ICON_SELECTOR);
      expect(infoIcon).not.to.be.null;
      expect(favIcon).not.to.be.null;
    });
  });

  describe('Info icon tests', () => {
    before(() => {
      before(async () => {
        listItem = await renderItem(app);
      });
    });

    it('description should match app long description', () => {
      const descriptionLong = getTooltipTextContent(listItem, {
        containerClass: 'icons',
        attributeClass: 'description',
      });
      expect(descriptionLong).to.be.equal(app.descriptionLong);
    });

    it('Info icon click displays tooltip', async () => {
      const infoIcon = listItem.shadowRoot.querySelector(INFO_ICON_SELECTOR);
      infoIcon.click();

      listItem.executeRender();

      const tooltip = listItem.shadowRoot.querySelector('.tooltip');
      expect(tooltip.getAttribute('visible')).to.be.eq('always');
    });

    it('Info icon second click hides tooltip', async () => {
      const infoIcon = listItem.shadowRoot.querySelector(INFO_ICON_SELECTOR);
      infoIcon.click();

      listItem.executeRender();

      const tooltip = listItem.shadowRoot.querySelector('.tooltip');
      expect(tooltip.getAttribute('visible')).to.be.eq('never');
    });
  });

  describe('Render list item with external icon', () => {
    before(async () => {
      listItem = await renderExternalItem(app);
    });

    it('has external icon', () => {
      const externalIcon = listItem.shadowRoot.querySelector('.external-icon');
      expect(externalIcon).not.to.be.null;
    });
  });

  describe('Expandable element tests', () => {
    before(async () => {
      listItem = await renderItem(getAppDataWithChild());
    });

    it('isExpanded prop is toggled when accordion is clicked', () => {
      const accordion = listItem.shadowRoot.querySelector('.accordion').querySelector('.icon');
      const defaultExpandedState = listItem.isExpanded;

      accordion.click();
      const expandedStateAfterFirstClick = listItem.isExpanded;
      accordion.click();
      const expandedStateAfterSecondClick = listItem.isExpanded;

      expect(defaultExpandedState).to.be.false;
      expect(expandedStateAfterFirstClick).to.be.true;
      expect(expandedStateAfterSecondClick).to.be.false;
    });

    it('child items are displayed', () => {
      const childElements = listItem.shadowRoot
        .querySelector('.expandContainer')
        .querySelectorAll('e-list-item');
      expect(childElements).to.have.lengthOf(1);
    });
  });

  describe('child list item tests', () => {
    before(async () => {
      listItem = await renderChildItem(app);
    });

    it('has favorite icon', () => {
      const favIcon = listItem.shadowRoot.querySelector(FAVORITE_ICON_SELECTOR);
      expect(favIcon).not.to.be.null;
    });

    it('has no info icon', () => {
      const infoIcon = listItem.shadowRoot.querySelector(INFO_ICON_SELECTOR);
      expect(infoIcon).to.be.null;
    });

    it('title has description in tooltip', () => {
      const descriptionLong = getTooltipTextContent(listItem, {
        containerClass: 'header',
        attributeClass: 'description',
      });
      expect(descriptionLong).to.be.equal(app.descriptionLong);
    });

    it('title has subtitle in tooltip', () => {
      const descriptionShort = getTooltipTextContent(listItem, {
        containerClass: 'header',
        attributeClass: 'subtitle',
      });
      expect(descriptionShort).to.be.equal(app.descriptionShort);
    });
  });

  describe('external child list item tests', () => {
    before(async () => {
      listItem = await renderChildItem(externalChild);
    });

    it('has external icon', () => {
      const externalIcon = listItem.shadowRoot.querySelector('.external-icon');
      expect(externalIcon).not.to.be.null;
    });

    it('e-base-link has proper url', () => {
      const link = listItem.shadowRoot.querySelector(cssPath.eBaseLink);
      expect(link.newTab).to.be.true;
      expect(link.url).to.be.equal(externalChild.route);
    });
  });

  describe('no favorite icon tests', () => {
    before(async () => {
      listItem = await renderItem({ ...app, showFavorite: false });
    });

    it('has no favorite icon', () => {
      const favIcon = listItem.shadowRoot.querySelector(FAVORITE_ICON_SELECTOR);
      expect(favIcon).to.be.null;
    });
  });

  describe('item click event tests', () => {
    let link;

    before(async () => {
      listItem = await renderChildItem(app);
      link = listItem.shadowRoot.querySelector(cssPath.eBaseLink);
    });

    it('e-base-link has proper url', () => {
      expect(link.url).to.be.equal(app.route);
    });

    it('e-base-link.click() should be called when ListIem is clicked', () => {
      let clicked = false;
      link.addEventListener('click', (event) => {
        clicked = true;
        // needed to prevent link to navigate browser from the test page
        event.stopPropagation();
        event.preventDefault();
        return false;
      });

      const item = listItem.shadowRoot.querySelector('.item-container');
      item.click();

      expect(clicked).to.be.true;
    });
  });

  describe('favorite icon click event tests', () => {
    let stub;

    after(() => {
      stub.restore();
    });

    it('"app-status-change" event should be fired with proper props when favorite icon is clicked', () => {
      stub = sinon.stub(listItem, 'bubble');

      const favIcon = listItem.shadowRoot.querySelector(FAVORITE_ICON_SELECTOR);
      favIcon.click();
      const calledWithfavoriteValue = stub.getCall(0).args[1];

      expect(stub.calledOnce).to.be.true;
      expect(stub.calledWith('app-status-change')).to.be.true;
      expect(calledWithfavoriteValue.appId).to.be.equal(app.id);
      expect(calledWithfavoriteValue.changed.isFavorite).to.be.true;
    });

    it('"app-status-change" event should be fired with proper props when favorite icon is clicked again', async () => {
      listItem = await renderItem({
        ...app,
        favoriteState: FAVORITE_STATE.FAVORITE,
      });

      stub = sinon.stub(listItem, 'bubble');

      const favIcon = listItem.shadowRoot.querySelector('[name="favorite-solid"]');
      favIcon.click();
      const calledWithfavoriteValue = stub.getCall(0).args[1];

      expect(stub.calledOnce).to.be.true;
      expect(stub.calledWith('app-status-change')).to.be.true;
      expect(calledWithfavoriteValue.appId).to.be.equal(app.id);
      expect(calledWithfavoriteValue.changed.isFavorite).to.be.false;
    });
  });
});
