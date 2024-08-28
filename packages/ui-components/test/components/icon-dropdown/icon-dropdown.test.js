import { expect, fixture, html } from '@open-wc/testing';
import { Icon } from '@eui/theme';
import { MenuItem } from '@eui/base';
import IconDropdown from '../../../src/components/icon-dropdown/icon-dropdown.js';
import isRendered from '../../test-utils/isRendered.js';

let dropdown;
let dropdownContent;

const ITEM_DETAILS = [
  { label: 'Tiles', icon: 'view-tiles', selected: true },
  { label: 'List', icon: 'view-list', selected: false },
];

const MENU_ITEMS = ITEM_DETAILS.map(
  (type) => html`
    <eui-menu-item label=${type.label} label-icon=${type.icon} ?selected=${type.selected}>
      <eui-icon class="item-icon" slot="left" name=${type.icon}></eui-icon>
    </eui-menu-item>
  `,
);

const renderIconDropdown = async () => {
  const template = html`
    <e-icon-dropdown data-type="single">${MENU_ITEMS}</e-icon-dropdown>
  `;
  const element = await fixture(template);
  await isRendered(element);
  return element;
};

describe('IconDropdown Component Tests', () => {
  before(async () => {
    Icon.register();
    MenuItem.register();
    IconDropdown.register();

    dropdown = await renderIconDropdown();
    dropdownContent = dropdown.shadowRoot.querySelector('.dropdown');
  });

  describe('Basic component setup', () => {
    it('should create a new <e-icon-dropdown>', async () => {
      expect(dropdown).to.be.not.null;
      expect(dropdownContent).to.be.not.null;
    });

    it('Should have the given menu-items with labels and icons', () => {
      const menuItems = Array.from(
        dropdownContent.querySelector('eui-menu').querySelectorAll('eui-menu-item'),
      );

      expect(
        menuItems.map((item) => item.label),
        "Labels don't match.",
      ).to.have.members(ITEM_DETAILS.map((item) => item.label));
      expect(
        menuItems.map((item) => item.getAttribute('label-icon'), "Icons don't match."),
      ).to.have.members(ITEM_DETAILS.map((item) => item.icon));
    });

    it('Dropdown should have an icon and not a label', () => {
      const iconContainer = dropdownContent
        .querySelector('eui-button')
        .querySelector('.icon-container');

      const icon = iconContainer.querySelector('.label-icon');

      expect(iconContainer, 'Icon Container is missing').to.be.not.null;
      expect(icon, 'Icon is missing').to.be.not.null;
      expect(icon.getAttribute('name'), 'Default icon is not correct').to.be.equal(
        ITEM_DETAILS[0].icon,
      );
      expect(dropdownContent.getAttribute('label'), 'Label is present').to.be.null;
    });
  });
});
