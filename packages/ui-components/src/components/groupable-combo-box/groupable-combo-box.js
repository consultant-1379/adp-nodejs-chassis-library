/**
 * Component GroupableComboBox is defined as `<e-groupable-combo-box>`.
 *
 * @class
 * @name GroupableComboBox
 * @extends ComboBox
 *
 * @example
 * // Imperatively create component:
 * let component = new GroupableComboBox();
 *
 * // Declaratively create component:
 * <e-groupable-combo-box></e-groupable-combo-box>
 */

import { html, definition, styleMap, ifDefined, nothing, ref, createRef } from '@eui/lit-component';

import { ComboBox, TextField, MenuItem, Menu } from '@eui/base';
import { Icon } from '@eui/theme';
import lodash from 'lodash';
import style from './groupable-combo-box.css';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';

import CONSTANTS from '../../constants.js';

import defaultI18n from './locale/en-us.json';

const { NAME_RANK, SECONDARY_INFO_RANK, TAGS_RANK, DESC_RANK, FOCUS_SEARCH_BAR_EVENT } = CONSTANTS;

const comboboxTypes = {
  SINGLE: 'single',
  MULTI: 'multi',
  CLICK: 'click',
};

const CROSS_ICON = 'cross';
const SEARCH_ICON = 'search';

class GroupableComboBox extends i18nMixin(defaultI18n, ComboBox) {
  constructor() {
    super();
    this.textFieldRef = createRef();
    this.handleIconClick = this.handleIconClick.bind(this);
    this.inputChangeHandler = lodash.debounce(this.inputChangeHandler.bind(this), 150);
    this.textFieldHandler = this.textFieldHandler.bind(this);
  }

  static get components() {
    return {
      'eui-menu': Menu,
      'eui-menu-item': MenuItem,
      'eui-text-field': TextField,
      'eui-icon': Icon,
    };
  }

  get meta() {
    return import.meta;
  }

  /**
   * Create ComboBox menu items.
   *
   * @returns {object} The rendered items.
   */
  _makeDropdownOptions() {
    return this.data.map((item) => {
      if (item.group) {
        return this._renderGroup(item);
      }
      return this._renderMenuItem(item);
    });
  }

  _renderGroup(group) {
    const isHeaderDisabled = true;
    const groupHeader = html`
      <eui-menu-item
        class="grouped-menu-item-header"
        label=${group.label}
        value=${group.value}
        ?disabled=${isHeaderDisabled}
      ></eui-menu-item>
    `;
    const groupItems = group.items.map((item) => this._renderMenuItem(item));
    return html`
      ${groupHeader} ${groupItems}
    `;
  }

  _renderMenuItem(item) {
    return html`
      <eui-menu-item
        label=${item.label ? item.label : item.value}
        value=${item.value ? item.value : item.label}
        ?selected=${item.checked}
        ?disabled=${item.disabled}
      ></eui-menu-item>
    `;
  }

  getCompareString(string) {
    return string ? string.toLowerCase() : '';
  }

  rankItem(item, inputValue) {
    let rank = 0;

    if (item.label.toLowerCase().includes(inputValue)) {
      rank += NAME_RANK;
    }

    if (item.descriptionShort && item.descriptionShort.toLowerCase().includes(inputValue)) {
      rank += SECONDARY_INFO_RANK;
    }

    if (item.tags && item.tags.some((tag) => tag.includes(inputValue))) {
      rank += TAGS_RANK;
    }

    if (item.descriptionLong && item.descriptionLong.toLowerCase().includes(inputValue)) {
      rank += DESC_RANK;
    }

    return {
      ...item,
      rank,
    };
  }

  compareItems(itemA, itemB) {
    return itemB.rank - itemA.rank;
  }

  inputChangeHandler() {
    this.show();
    const inputValue = this.getCompareString(this.value);
    if (inputValue === '' || !this.data.some((d) => d.group)) {
      super.handleInputChange();
      this.hasInput = false;
      this.hide();
    } else {
      this.filterGroupItems(inputValue);
      this.hasInput = true;
    }
  }

  filterGroupItems(filterValue) {
    const { data } = this;
    const groups = data.filter((items) => items.group);

    const { orderedMenuItems, visibleMenuItems } = groups
      .map((group) => {
        const rankedGroupItems = group.items
          .map((item) => this.rankItem(item, filterValue))
          .sort(this.compareItems);

        const visibleGroupItems = this.getVisibleGroupedMenuItems(group.label, rankedGroupItems);
        const orderedGroupItems = this.getOrderedGroupMenuItems(group.label, rankedGroupItems);
        return { orderedGroupItems, visibleGroupItems };
      })
      .reduce(
        (mergedItems, group) => ({
          visibleMenuItems: mergedItems.visibleMenuItems.concat(group.visibleGroupItems),
          orderedMenuItems: mergedItems.orderedMenuItems.concat(group.orderedGroupItems),
        }),
        { visibleMenuItems: [], orderedMenuItems: [] },
      );

    super.showFilteredList(visibleMenuItems);
    this.replaceMenuItems(orderedMenuItems);
  }

  getMatches(rankedItems) {
    return rankedItems.filter((item) => item.rank !== 0);
  }

  getVisibleGroupedMenuItems(groupLabel, rankedGroupItems) {
    const itemMatches = this.getMatches(rankedGroupItems);
    return this.findMenuItemsWithLabel(groupLabel, itemMatches);
  }

  getOrderedGroupMenuItems(groupLabel, rankedItems) {
    return this.findMenuItemsWithLabel(groupLabel, rankedItems);
  }

  findMenuItemsWithLabel(groupLabel, items) {
    const { menuItems } = this;
    if (items.length === 0) {
      return [];
    }
    return [menuItems.find((menuItem) => menuItem.label === groupLabel)].concat(
      items.map((item) => menuItems.find((menuItem) => menuItem.value === item.value)),
    );
  }

  replaceMenuItems(newMenuItems) {
    const { menu } = this;
    const previousMenuItems = menu.querySelectorAll('eui-menu-item');
    Array.from(previousMenuItems).forEach((menuItem) => menuItem.remove());
    newMenuItems.forEach((menuItem) => menu.appendChild(menuItem));
  }

  /**
   * Make ComboBox menu visible.
   */
  show = () => {
    if (this.disabled || this._visible) {
      return;
    }

    // initialize menuItems when show first time
    if (!this.menuItems) {
      this.setMenuItems();
    }

    if (this.dataType === comboboxTypes.SINGLE) {
      // Display selected filtered menu-item if any, otherwise display all
      const selectedMenuItem = this.menu.querySelector('eui-menu-item[selected]');
      if (selectedMenuItem) {
        this.showFilteredList([selectedMenuItem]);
      } else {
        this.showFilteredList(this._getFilteredList());
      }
    } else if (this.dataType === comboboxTypes.MULTI) {
      this._setInputFieldValue('');
      this.showFilteredList(this._getFilteredList());
      if (this.selectAll) {
        this._makeSelectAllOptionVisible();
        // set the position of menu
        this._setMenuPosition();
      }
    }

    if (!this._visible) {
      this._visible = true;
      this.menu.show = true;
      const menu = this.menu.shadowRoot.querySelector('.menu');
      menu.removeAttribute('tabindex');
      const inputFld =
        this.inputField && this.inputField.shadowRoot.querySelector('input[type="text"]');
      const len = inputFld.value && inputFld.value.length;
      // Change compared to EUI ComboBox component: Focus is enclosed in setTimeout because it is not fired properly in Firefox
      setTimeout(() => {
        inputFld.focus();
        inputFld.setSelectionRange(len, len);
      }, 0);
    }
  };

  /**
   * Handle events and clear ComboBox when a menuItem is clicked.
   *
   * @param {Event} event - An event.
   */
  handleEvent(event) {
    const { menu } = this;
    super.handleEvent(event);
    if (event.type === 'eui-menu:change') {
      menu._deselectAllMenuItems(menu.menuItems);
      this.bubble('eui-combobox:selection', event.detail);
    } else if (event.type === 'eui-menu:click') {
      this._setInputFieldValue('');
      menu._deselectAllMenuItems(menu.menuItems);
    }
  }

  /**
   * Override of ComboBox didChangeProps hook to fix a bug with the 'noResultLabel' case.
   * `.empty` element is not always exists as it is created in `showFilteredList` method only.
   * Be cautious when increasing the @eui/base package version.
   *
   * - WA is to handle the non-existent `.empty` element.
   * - Bug on EUISDK: CDS-9791.
   *
   * @param {object} changedProps - Map containing changed props.
   */
  didChangeProps(changedProps) {
    if (changedProps.has('noResultLabel')) {
      const emptyElem = this.menu.shadowRoot.querySelector('.empty');
      if (emptyElem) {
        emptyElem.innerHTML = this.noResultLabel;
      }
    }
    if (changedProps.has('dataInnerlabel')) {
      this.suffixes = new Map(this.dataInnerlabel);
      this._setTextFieldLabel();
    }
    if (changedProps.has('data')) {
      // Clear menuItems as they will be the old menuItem elements.
      this.menuItems = null;
      this._setTextFieldLabel();
    }
    if (changedProps.has('dataType')) {
      this.dataType = ['single', 'multi'].includes(this.dataType) ? this.dataType : 'single';
    }
    if (changedProps.has('disabled') && this.disabled && this._visible === true) {
      this.hide();
    }
  }

  didConnect() {
    super.didConnect();
    this.addEventListener(FOCUS_SEARCH_BAR_EVENT, this.focusTextField);
  }

  didDisconnect() {
    super.didDisconnect();
    this.removeEventListener(FOCUS_SEARCH_BAR_EVENT, this.focusTextField);
  }

  didRender() {
    const { textFieldRef } = this;
    textFieldRef.value.didUpgrade = () => this.focusTextField();
  }

  focusTextField() {
    const { textFieldRef } = this;
    const input = textFieldRef.value.shadowRoot.querySelector('input');
    input.focus();
  }

  /**
   * Override of ComboBox render method to support cross icon with different functionality.
   *
   * Be cautious when increasing the @eui/base package version as changes in ComboBox source can break search functionality!
   *
   * @returns {object} The rendered component.
   */
  render() {
    const {
      width,
      data,
      i18n,
      placeholder,
      disabled,
      dataType,
      handleIconClick,
      hasInput,
      textFieldRef,
    } = this;
    const inlineWidth = width ? `${width}` : '';
    const inputComboField = html`
      <eui-text-field
        ${ref(textFieldRef)}
        placeholder="${placeholder || i18n.SEARCH_PLACEHOLDER}"
        ?fullwidth="${!width}"
        ?disabled=${disabled}
        @click=${this.textFieldHandler}
        @mousedown=${this.textFieldHandler}
        @input="${this.inputChangeHandler}"
        @keydown="${this}"
      >
        <eui-icon
          slot="icon"
          name=${hasInput ? CROSS_ICON : SEARCH_ICON}
          class="cross-icon"
          @click=${handleIconClick}
        ></eui-icon>
      </eui-text-field>
    `;

    const slot = !data
      ? html`
          <slot @slotchange=${(event) => this._moveMenuItem(event)}></slot>
        `
      : nothing;
    return html`
      <div class="dropdown" style=${styleMap({ width: inlineWidth })}>
        ${inputComboField} ${slot}
        <eui-menu
          type=${ifDefined(dataType)}
          @eui-menu:change=${this}
          @eui-menu:click=${this}
          @eui-menu:hidden=${this}
          select-all=${ifDefined(this.selectAll)}
        >
          ${data ? this._makeDropdownOptions() : nothing}
        </eui-menu>
      </div>
    `;
  }

  textFieldHandler(event) {
    if (this.value && this.value.length > 0) {
      this._handleTextFieldEvent(event);
    }
  }

  /**
   * Handle icon click.
   */
  handleIconClick = (event) => {
    this._setInputFieldValue('');
    event.stopPropagation();
    this.hide();
    this.hasInput = false;
  };
}

definition('e-groupable-combo-box', {
  style,
  props: {
    hasInput: {
      type: Boolean,
      default: false,
      attribute: false,
    },
  },
})(GroupableComboBox);

export default GroupableComboBox;
