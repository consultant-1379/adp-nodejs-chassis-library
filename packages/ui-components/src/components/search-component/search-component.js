/**
 * Component SearchComponent is defined as `<e-search-component>`.
 *
 * @class
 * @name SearchComponent
 * @extends LitComponent
 *
 * @example
 * // Imperatively create component.
 * let component = new SearchComponent();
 *
 * // Declaratively create component.
 * <e-search-component></e-search-component>
 */

import { LitComponent, html, definition, ref, createRef } from '@eui/lit-component';
import style from './search-component.css';

import GroupableComboBox from '../groupable-combo-box/groupable-combo-box.js';
import CONSTANTS from '../../constants.js';
import i18nMixin from '../../mixins/i18nMixin/i18nMixin.js';

import defaultI18n from './locale/en-us.json';

const { FOCUS_SEARCH_BAR_EVENT } = CONSTANTS;

class SearchComponent extends i18nMixin(defaultI18n, LitComponent) {
  constructor() {
    super();
    this.groupableComboBoxRef = createRef();
    this.handleComboBoxSelection = this.handleComboBoxSelection.bind(this);
    this.focusSearchBarEventHandler = this.focusSearchBarEventHandler.bind(this);
  }

  static get components() {
    return {
      'e-groupable-combo-box': GroupableComboBox,
    };
  }

  get meta() {
    return import.meta;
  }

  createMenuItemData(items) {
    return items.map((item) => ({
      label: item.displayName,
      value: item.name,
      tags: item.tags,
      descriptionShort: item.descriptionShort,
      descriptionLong: item.descriptionLong,
    }));
  }

  getComboBoxData() {
    const { data } = this;

    return data.map((itemsData) => {
      const mapped = {};
      Object.assign(mapped, itemsData, {
        items: this.createMenuItemData(itemsData.items),
      });
      return mapped;
    });
  }

  handleComboBoxSelection(event) {
    this.bubble('handle-combobox-selection', event.detail);
  }

  didConnect() {
    super.didConnect();
    const { focusSearchBarEventHandler } = this;
    this.addEventListener(FOCUS_SEARCH_BAR_EVENT, focusSearchBarEventHandler);
  }

  didDisconnect() {
    super.didDisconnect();
    const { focusSearchBarEventHandler } = this;
    this.removeEventListener(FOCUS_SEARCH_BAR_EVENT, focusSearchBarEventHandler);
  }

  focusSearchBarEventHandler() {
    const { groupableComboBoxRef } = this;
    groupableComboBoxRef.value.dispatchEvent(new Event(FOCUS_SEARCH_BAR_EVENT));
  }

  render() {
    const { i18n, groupableComboBoxRef } = this;
    const comboBoxData = this.getComboBoxData();
    return html`
      <e-groupable-combo-box
        ${ref(groupableComboBoxRef)}
        data-type="single"
        no-result-label=${i18n.NO_RESULT}
        placeholder=${i18n.SEARCH_PLACEHOLDER}
        .data=${comboBoxData}
        @eui-combobox:selection=${this.handleComboBoxSelection}
      ></e-groupable-combo-box>
    `;
  }
}

definition('e-search-component', {
  style,
  props: {
    data: {
      type: Array,
      default: [],
      attribute: false,
    },
  },
})(SearchComponent);

export default SearchComponent;
