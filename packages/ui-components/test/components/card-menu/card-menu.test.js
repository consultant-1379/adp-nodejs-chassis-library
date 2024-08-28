import { expect, fixture, html } from '@open-wc/testing';
import CardMenu from '../../../src/components/card-menu/card-menu.js';
import isRendered from '../../test-utils/isRendered.js';

import CONSTANTS from '../../../src/constants.js';

const { FAVORITE_COLOR } = CONSTANTS;

const TOOLTIP_TEXT = 'This is a tooltip.';
const MENU_ITEMS = [
  {
    label: 'Tooltip Item',
    tooltip: {
      content: html`
        ${TOOLTIP_TEXT}
      `,
    },
  },
  {
    label: 'Favorite',
    icon: {
      name: 'favorite-solid',
      color: FAVORITE_COLOR,
      clickHandler: () => {},
    },
  },
  {
    label: 'Not Favorite',
    icon: {
      name: 'favorite',
      color: '',
      clickHandler: () => {},
    },
  },
];

async function renderMenu() {
  const htmlTemplate = html`
    <e-card-menu .menuItems=${MENU_ITEMS}></e-card-menu>
  `;
  const element = await fixture(htmlTemplate);
  await isRendered(element);
  return element;
}

describe('CardMenu Component Tests', () => {
  let cardMenu;
  let menuIcon;
  let menuItems;

  describe('Basic component setup', () => {
    before(async () => {
      CardMenu.register();
      cardMenu = await renderMenu();
    });

    it('should create a new <e-card-menu>', async () => {
      const { shadowRoot } = cardMenu;

      expect(shadowRoot, 'Shadow root does not exist').to.exist;
      expect(cardMenu).to.not.null;
    });

    it('should open the menu when the menu icon is clicked', async () => {
      menuIcon = cardMenu.shadowRoot.querySelector('#menu-icon');
      menuIcon.click();
      cardMenu.executeRender();
      const menu = cardMenu.shadowRoot.querySelector('eui-menu');
      menuItems = Array.from(cardMenu.shadowRoot.querySelectorAll('eui-menu-item'));
      expect(cardMenu.showMenu).to.be.true;
      expect(menu.show).to.be.true;
      expect(menuItems.map((menuItem) => menuItem.label)).to.deep.eq(
        MENU_ITEMS.map((menuItem) => menuItem.label),
      );
    });

    it('should hide the menu if the menu icon is clicked', async () => {
      menuIcon.click();
      cardMenu.executeRender();
      const menu = cardMenu.shadowRoot.querySelector('eui-menu');
      expect(cardMenu.showMenu).to.be.false;
      expect(menu.show).to.be.false;
    });

    it('should show the tooltip if the tooltip Menu item is clicked', async () => {
      menuIcon.click();
      cardMenu.executeRender();
      const tooltipMenuItem = menuItems[0];
      tooltipMenuItem.click();
      cardMenu.executeRender();
      const tooltip = cardMenu.shadowRoot.querySelector('eui-tooltip');
      expect(tooltip.innerText.trim()).to.eq(TOOLTIP_TEXT);
      expect(tooltip.visible).to.eq('always');
    });

    it('should close the tooltip if the tooltip Menu item is clicked again', async () => {
      const tooltipMenuItem = menuItems[0];
      tooltipMenuItem.click();
      cardMenu.executeRender();
      expect(cardMenu.shadowRoot.querySelector('eui-tooltip')).to.be.null;
    });
  });
});
