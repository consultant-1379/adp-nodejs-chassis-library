import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import SearchComponent from '../../../src/components/search-component/search-component.js';
import searchComponentConfig from '../../test-utils/mockdata/test-search-component-config.json';
import isRendered from '../../test-utils/isRendered.js';

const eMenuItem = 'eui-menu-item';

const { data } = searchComponentConfig;

describe('SearchComponent Component Tests', () => {
  let search;
  let shadowRoot;
  let comboBox;

  const renderSearchComponent = async (componentData) => {
    const template = html`
      <e-search-component .data=${componentData} }></e-search-component>
    `;
    const element = await fixture(template);
    await isRendered(element);
    return element;
  };

  describe('Basic component setup', () => {
    before(() => {
      SearchComponent.register();
    });

    it('should create a new <e-search-component>', async () => {
      search = await renderSearchComponent(data);
      ({ shadowRoot } = search);

      expect(search).to.not.null;
      expect(shadowRoot, 'Shadow root does not exist').to.exist;
    });

    it('should render a GroupableComboBox with expected menu items', () => {
      comboBox = shadowRoot.querySelector('e-groupable-combo-box');
      const appTitles = data[0].items.map((app) => app.displayName);
      const productTitles = data[1].items.map((group) => group.displayName);
      const expectedMenuItemLabels = [data[0].label].concat(
        appTitles,
        data[1].label,
        productTitles,
      );
      const menuItems = Array.from(comboBox.shadowRoot.querySelectorAll(eMenuItem));
      const itemLabels = menuItems.map((item) => item.getAttribute('label'));

      expect(comboBox).to.not.null;
      expect(menuItems).to.have.lengthOf(expectedMenuItemLabels.length);
      expect(itemLabels).to.deep.equals(expectedMenuItemLabels);
    });
  });

  describe('Menu item event tests', () => {
    let stub;

    beforeEach(async () => {
      search = await renderSearchComponent(data);
      stub = sinon.stub(search, 'bubble');
      comboBox = search.shadowRoot.querySelector('e-groupable-combo-box');
    });

    it('"handle-combobox-selection" event should be bubbled when menu item is clicked', () => {
      const selectedProduct = data[1].items[0];

      const menuItems = Array.from(comboBox.shadowRoot.querySelectorAll(eMenuItem));
      const productItem = menuItems.find(
        (menuItem) => menuItem.getAttribute('label') === selectedProduct.displayName,
      );
      productItem.click();

      expect(stub.calledOnce).to.be.true;
      expect(stub.calledWith('handle-combobox-selection')).to.be.true;
    });
  });
});
